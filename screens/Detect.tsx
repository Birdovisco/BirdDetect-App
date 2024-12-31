import React, {useEffect, useState} from "react";
import {ActivityIndicator, Image, Text, TouchableOpacity, View} from "react-native";
import {Audio} from "expo-av";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as Animatable from "react-native-animatable";
import Toast from "react-native-toast-message";
import * as tf from "@tensorflow/tfjs";
import {bundleResourceIO} from "@tensorflow/tfjs-react-native";
import "@tensorflow/tfjs-backend-webgl";
import { AndroidOutputFormat, AndroidAudioEncoder, IOSOutputFormat, IOSAudioQuality } from "expo-av/build/Audio";
import { FFmpegKit } from 'ffmpeg-kit-react-native';
import FFT from 'fft.js';


export default function Detect({ navigation }) {
    const MINIMUM_RECORDING_DURATION = 2000;
    const [recordingStartTime, setRecordingStartTime] = useState(null);
    const [recording, setRecording] = useState(null);
    const [savedRecording, setSavedRecording] = useState(null);
    
    const [model, setModel] = useState(null);
    const [prediction, setPrediction] = useState(undefined);

    const [buttonDisabled, setButtonDisabled] = useState(true);
    const [isBusy, setIsBusy] = useState(false);
    const [showBird, setShowBird] = useState(false);

    useEffect(() => {
        const loadModel = async () => {
            setIsBusy(true);
            setButtonDisabled(true);
            await tf.ready();
            const modelJson = require("../model/model.json");
            const modelWeights = [
                require("../model/group1-shard1of4.bin"),
                require("../model/group1-shard2of4.bin"),
                require("../model/group1-shard3of4.bin"),
                require("../model/group1-shard4of4.bin")
            ];
            showToast("info", "Loading model...", "Please wait for the model to load");
            try {
                const loadedModel = await tf.loadGraphModel(bundleResourceIO(modelJson, modelWeights));
                setModel(loadedModel);
                setButtonDisabled(false);
                showToast("success", "Model loaded!", "Model is ready for prediction");
            } catch (error) {
                console.error("Failed to load model", error);
                showToast("error", "Error loading model", "Please try again later");
            } finally {
                setIsBusy(false);
            }
        };

        loadModel();
    }, []);

    const showToast = (type: string, text1: string, text2: string) => {
        Toast.show({
            type,
            text1,
            text2,
            position: "bottom"
        });
    };

    const startRecording = async () => {
        try {
            const perm = await Audio.requestPermissionsAsync();
            if (perm.status === "granted") {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true
                });
                const { recording } = await Audio.Recording.createAsync({
                    isMeteringEnabled: true,
                    android: {
                      extension: '.m4a',
                      outputFormat: AndroidOutputFormat.MPEG_4,
                      audioEncoder: AndroidAudioEncoder.AAC,
                      sampleRate: 16000,
                      numberOfChannels: 1,
                      bitRate: 128000,
                    },
                    ios: {
                      extension: '.m4a',
                      outputFormat: IOSOutputFormat.MPEG4AAC,
                      audioQuality: IOSAudioQuality.MAX,
                      sampleRate: 16000,
                      numberOfChannels: 1,
                      bitRate: 128000,
                      linearPCMBitDepth: 16,
                      linearPCMIsBigEndian: false,
                      linearPCMIsFloat: false,
                    },
                    web: {
                      mimeType: 'audio/webm',
                      bitsPerSecond: 128000,
                    },
                  });
                setRecording(recording);
                setRecordingStartTime(Date.now());
            }
        } catch (err) {
            console.error("Failed to start recording:", err);
        }
    };

    const stopRecording = async () => {
        if (recording) {
            const elapsedTime = Date.now() - recordingStartTime;
            if (elapsedTime < MINIMUM_RECORDING_DURATION) {
                showToast("error", "Recording is too short", `Please record for at least ${MINIMUM_RECORDING_DURATION / 1000} seconds.`);
                return;
            }
            setButtonDisabled(true);
            setShowBird(false);
            setPrediction(undefined);
            await recording.stopAndUnloadAsync();
            setSavedRecording(recording);
            setRecording(null);
        }
    };

    const getSpectrogram = (samples: Float32Array) => {
        const fft = new FFT(samples.length);
        const real = new Array(samples.length).fill(0);
        const imag = new Array(samples.length).fill(0);

        for (let i = 0; i < samples.length; i++) {
            real[i] = samples[i];
        }

        fft.realTransform(real, imag);
        fft.completeSpectrum(real);
        
        const inputTensor = tf.randomUniform([1, 224, 224]);

        return inputTensor.expandDims(0);
    };

    const predictLabel = async () => {
        try {
            setIsBusy(true);
            Toast.hide();
            console.log(savedRecording);

            const m4a_path = savedRecording.getURI();
            const wav_path = "/data/user/0/host.exp.exponent/cache/rec.wav";

            await FFmpegKit.execute(`-i ${m4a_path.slice(7)} ${wav_path}`);

            const response = await fetch(wav_path);
            const buffer = await response.arrayBuffer();

            const samples = preprocessWaveform(buffer);
            const inputTensor = getSpectrogram(samples);

            await tf.nextFrame();

            const output = model.predict(inputTensor);
            const predictedClass = output.argMax(-1);
            console.log(predictedClass.dataSync()[0]);
            setPrediction(predictedClass);
            showToast("success", "Prediction complete!", "Bird identified");
        } catch (error) {
            console.error("Prediction error:", error);
            if (error.message.includes("No valid frames")) {
                showToast("error", "Audio too short", "Please record longer audio.");
            } else {
                showToast("error", "Prediction failed", "Please try again later.");
            }
        } finally {
            setIsBusy(false);
            setButtonDisabled(false);
        }
    };

    const preprocessWaveform = (buffer: ArrayBuffer) => {
        const offset = new Uint8Array(buffer.slice(0, 4))[3];
        const sizeBuffer = new Uint8Array(buffer.slice(offset, offset + 4));
        const size = sizeBuffer[0]*256*256*256 + sizeBuffer[1]*256*256 + sizeBuffer[2]*256 + sizeBuffer[3];

        const samples = new Uint16Array(buffer.slice(offset + 8, offset + 8 + size));

        const samplesFloat = new Float32Array(samples.length);
        for (let i = 0; i < samplesFloat.length; i++) {
            samplesFloat[i] = (samples[i] < 0) ? (samples[i] / 256.0) : (samples[i] / 255.0);
        }

        return samplesFloat;
    };


    useEffect(() => {
        if (savedRecording) {
            showToast("info", "Processing prediction...", "Please wait for the result");
            predictLabel();
        }
    }, [savedRecording]);

    useEffect(() => {
        if (savedRecording && prediction) setShowBird(true);
    }, [prediction]);

    useEffect(() => {
        if (showBird) {
            navigation.navigate("BirdDetails", { rec: savedRecording, lab: prediction.dataSync()[0] });
            setButtonDisabled(false);
        }
    }, [showBird]);

    const bouncingAnimation = {
        0: { height: 14 },
        0.5: { height: 40 },
        1: { height: 14 }
    };

    return (
        <View className="flex-1 items-center justify-center bg-primary">
            <View className="justify-center items-center mb-10">
                <Text className="text-white text-4xl font-bold text-center mb-1">RECORD</Text>
                <Text className="text-white text-4xl font-bold text-center mb-10">THE BIRD</Text>
                {recording ? (
                    <View className="flex-row space-x-1 h-14">
                        <Animatable.View className="w-1 bg-white" animation={bouncingAnimation} iterationCount="infinite" duration={400} delay={200} />
                        <Animatable.View className="w-1 bg-white" animation={bouncingAnimation} iterationCount="infinite" duration={400} delay={50} />
                        <Animatable.View className="w-1 bg-white" animation={bouncingAnimation} iterationCount="infinite" duration={400} delay={300} />
                        <Animatable.View className="w-1 bg-white" animation={bouncingAnimation} iterationCount="infinite" duration={400} />
                    </View>
                ) : (
                    <View className="flex-row space-x-1 h-14">
                        {isBusy ? <ActivityIndicator size="large" color="#FFFFFF" /> : <Ionicons name="mic-outline" size={50} color="#FFFFFF" />}
                    </View>
                )}
            </View>

            <TouchableOpacity
                disabled={buttonDisabled}
                onPress={recording ? stopRecording : startRecording}
                className="justify-center items-center bg-primary"
            >
                <View className="w-56 h-56 rounded-full justify-center items-center bg-primary border-2 border-dashed border-white">
                    <View className="w-52 h-52 rounded-full justify-center items-center bg-primary border-2 border-solid border-white">
                        <Image source={require("../assets/icon_white.png")} className="w-40 h-40" />
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
}
