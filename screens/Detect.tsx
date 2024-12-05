import React, {useEffect, useState} from "react";
import {ActivityIndicator, Image, Text, TouchableOpacity, View} from "react-native";
import {Audio} from "expo-av";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as Animatable from "react-native-animatable";
import Toast from "react-native-toast-message";
import * as tf from "@tensorflow/tfjs";
import {bundleResourceIO} from "@tensorflow/tfjs-react-native";
import "@tensorflow/tfjs-backend-webgl";

export default function Detect({ navigation }) {
    const MINIMUM_RECORDING_DURATION = 2000;
    const [recordingStartTime, setRecordingStartTime] = useState(null);
    const [recording, setRecording] = useState(null);
    const [savedRecording, setSavedRecording] = useState(null);
    const [prediction, setPrediction] = useState(undefined);
    const [model, setModel] = useState(null);
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
                const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
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

    const preprocessAudio = async (buffer) => {
        const SAMPLE_RATE = 16000;
        const FRAME_SIZE = 16000;
        const FRAME_HOP = 8000;

        const audioArray = decodeAudio(buffer);

        const originalSampleRate = 44100;
        const downsampleFactor = originalSampleRate / SAMPLE_RATE;
        const downsampledAudio = audioArray.filter((_, index) => index % downsampleFactor === 0);

        if (downsampledAudio.length < FRAME_SIZE) {
            const paddedAudio = new Float32Array(FRAME_SIZE);
            paddedAudio.set(downsampledAudio);

            return tf.tensor2d([Array.from(paddedAudio)], [1, FRAME_SIZE]).expandDims(0);
        }

        const numFrames = Math.floor((downsampledAudio.length - FRAME_HOP) / FRAME_HOP) + 1;
        const frames = [];
        for (let i = 0; i < numFrames; i++) {
            const start = i * FRAME_HOP;
            const end = start + FRAME_SIZE;
            const frame = downsampledAudio.slice(start, end);

            if (frame.length < FRAME_SIZE) {
                const paddedFrame = new Float32Array(FRAME_SIZE);
                paddedFrame.set(frame);
                frames.push(Array.from(paddedFrame));
            } else {
                frames.push(Array.from(frame));
            }
        }

        console.log("Frames structure:", frames);
        console.log("Number of frames:", frames.length, "Frame size:", frames[0]?.length);

        if (frames.length === 0) {
            throw new Error("No valid frames could be generated from the audio.");
        }

        const tensorFrames = tf.tensor2d(frames, [frames.length, FRAME_SIZE]);
        console.log("TensorFrames shape:", tensorFrames.shape);

        return tensorFrames.expandDims(0);
    };

    const predictLabel = async () => {
        try {
            setIsBusy(true);
            Toast.hide();
            const response = await fetch(savedRecording.getURI());
            const buffer = await response.arrayBuffer();

            const inputTensor = await preprocessAudio(buffer);
            await tf.nextFrame();

            const output = model.predict(inputTensor);
            console.log(output);
            const predictedClass = output.argMax(-1);
            console.log(predictedClass);
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

    const decodeAudio = (buffer) => {
        const arrInt = new Int16Array(buffer.slice(0, buffer.byteLength - (buffer.byteLength % 2)));

        const arrFloat = new Float32Array(arrInt.length);
        for (let i = 0; i < arrFloat.length; i++) {
            arrFloat[i] = arrInt[i] / 32768;
        }

        return arrFloat;
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
