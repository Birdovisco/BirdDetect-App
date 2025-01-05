import React, {useEffect, useRef, useState} from "react";
import {ActivityIndicator, Image, PermissionsAndroid, Text, TouchableOpacity, View} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as Animatable from "react-native-animatable";
import Toast from "react-native-toast-message";
import * as tf from "@tensorflow/tfjs";
import {bundleResourceIO} from "@tensorflow/tfjs-react-native";
import "@tensorflow/tfjs-backend-webgl";
import AudioRecord from 'react-native-audio-record';
import { Buffer } from 'buffer';


export default function Detect({ navigation }) {
    const MINIMUM_RECORDING_DURATION = 2000;
    const MAX_SAMPLES_LENGTH = 320000; // sr=16000 * secs=20
    const [recordingStartTime, setRecordingStartTime] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const recording = useRef([]);
    const [recPath, setRecpath] = useState(null);
    
    const [model, setModel] = useState(null);
    const [prediction, setPrediction] = useState(undefined);

    const [audioRecorded, setAudioRecorded] = useState(false);
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
            showToast("info", "Ładowanie modelu...", "Zaczekaj, aż model się załaduje", false);
            try {
                const loadedModel = await tf.loadGraphModel(bundleResourceIO(modelJson, modelWeights));
                setModel(loadedModel);
                setButtonDisabled(false);
                showToast("success", "Model załadowany!", "Model jest gotowy do predykcji");
            } catch (error) {
                console.error("Failed to load model", error);
                showToast("error", "Błąd przy ładowaniu modelu", "Spróbuj ponownie");
            } finally {
                setIsBusy(false);
            }
        };

        loadModel();
    }, []);

    const showToast = (type: string, text1: string, text2: string, autoHide: boolean=true) => {
        Toast.show({
            type,
            text1,
            text2,
            position: "bottom",
            autoHide: autoHide
        });
    };

    const startRecording = async () => {
        try {
            const perm = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
            if (perm === 'granted') {
                AudioRecord.init({
                    sampleRate: 16000,
                    channels: 1,
                    bitsPerSample: 16,
                    audioSource: 6,
                    wavFile: 'audio.wav'
                });
                recording.current = [];
                
                AudioRecord.on('data', data => {
                    const samples = new Int8Array(Buffer.from(data, 'base64'));
                    recording.current.push(...samples);
                });
                
                setIsRecording(true);
                showToast("info", "Nagrywanie...", "Staraj się nagrywać jak najbliżej ptaka");
                AudioRecord.start();
                setRecordingStartTime(Date.now());
            }
        } catch (err) {
            console.error("Failed to start recording:", err);
            setIsRecording(false);
        }
    };

    const stopRecording = async () => {
        if (isRecording) {
            const elapsedTime = Date.now() - recordingStartTime;
            if (elapsedTime < MINIMUM_RECORDING_DURATION) {
                showToast("error", "Nagranie za krótkie", `Nagraj conajmniej ${MINIMUM_RECORDING_DURATION / 1000}-sekundowe nagranie.`);
                return;
            }

            setButtonDisabled(true);
            setShowBird(false);
            setPrediction(undefined);
            const path = await AudioRecord.stop();
            setRecpath(path);
            setIsRecording(false);
            setAudioRecorded(true);
        }
    };

    const getSpectrogram = (samples) => {
        const stft = tf.signal.stft(tf.tensor1d(samples), 2048, 512, 2048);
        const magnitude = tf.abs(stft);
        const amin = tf.scalar(2e-5);
        const refValue = magnitude.max();

        const logSpec = tf.tidy(() => tf.maximum(amin, magnitude).log().mul(tf.scalar(10))
        .sub(tf.maximum(amin, refValue).log().mul(tf.scalar(10))));
        const db = tf.maximum(logSpec, logSpec.max().sub(tf.scalar(80)));

        const numBins = db.shape[1];
        const logIndices = tf.linspace(1, Math.log(numBins + 1), numBins).sub(1).toInt();
        const logScale = tf.gather(db, logIndices, 1);

        const specTransform = tf.image.flipLeftRight(logScale.reshape([1, logScale.shape[0], logScale.shape[1], 1])).reshape([logScale.shape[0], logScale.shape[1]]);
        const spectrogram = tf.image.resizeBilinear(specTransform.transpose().reshape([specTransform.shape[1], specTransform.shape[0], 1]), [224, 224]);

        const minVal = spectrogram.min();
        const maxVal = spectrogram.max();

        const grayscaleSpec = tf.tidy(() => spectrogram.sub(minVal).div(maxVal.sub(minVal)));
        return grayscaleSpec.reshape([1, 224, 224]).reshape([-1, 1, 224, 224]);
    };

    const predictLabel = async () => {
        try {
            setIsBusy(true);
            Toast.hide();

            const samples = preprocessWaveform(new Int8Array(recording.current));
            recording.current = [];
            const inputTensor = getSpectrogram(samples);

            await tf.nextFrame();
            const output = model.predict(inputTensor);
            const predictedClass = output.argMax(-1);
            console.log(predictedClass.dataSync()[0]);

            setPrediction(predictedClass);
            showToast("success", "Predykcja gotowa!", "Ptak zidentyfikowany");
        } catch (error) {
            console.error("Prediction error:", error);
            if (error.message.includes("No valid frames")) {
                showToast("error", "Nagranie za krótkie", "Nagraj dłuższe nagranie.");
            } else {
                showToast("error", "Predykcja nie udała się", "Spróbuj ponownie.");
            }
        } finally {
            setIsBusy(false);
            setButtonDisabled(false);
            setAudioRecorded(false);
        }
    };

    const preprocessWaveform = (arrInt8) => {
        const arrInt16 = new Int16Array(
            arrInt8.reduce((acc, _, i) => {
              if (i % 2 === 0) {
                const low = arrInt8[i];
                const high = arrInt8[i + 1];
                acc.push((high << 8) | (low & 0xff));
              }
              return acc;
            }, [])
        );

        const samples = new Float32Array(
            arrInt16.reduce((acc, val) => {
              acc.push(val / 32768.0);
              return acc;
            }, [])
        );
        const samplesFilled = new Float32Array(MAX_SAMPLES_LENGTH);
        samplesFilled.set(samples.slice(0, MAX_SAMPLES_LENGTH));

        return samples;
    };


    useEffect(() => {
        if (audioRecorded) {
            showToast("info", "Przetwarzanie nagrania...", "Zaczekaj na wynik", false);
            predictLabel();
        }
    }, [audioRecorded]);

    useEffect(() => {
        if (recPath && prediction) setShowBird(true);
    }, [prediction]);

    useEffect(() => {
        if (showBird) {
            navigation.navigate("BirdDetails", { rec: recPath, lab: prediction.dataSync()[0] });
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
                <Text className="text-white text-4xl font-bold text-center mb-1">NAGRAJ</Text>
                <Text className="text-white text-4xl font-bold text-center mb-10">PTAKA</Text>
                {isRecording ? (
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
                onPress={isRecording === true ? stopRecording : startRecording}
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
