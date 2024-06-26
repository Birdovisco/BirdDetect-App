import React, { useEffect, useState } from "react";
import {
    View,
    TouchableOpacity,
    Image,
    Text,
    ActivityIndicator
} from "react-native";
import { Audio } from "expo-av";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as Animatable from 'react-native-animatable';
import Toast from 'react-native-toast-message';
import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';
import '@tensorflow/tfjs-backend-webgl';

export default function Detect({ navigation }) {

    const MINIMUM_RECORDING_DURATION = 2000; // 2 seconds in milliseconds
    const [recordingStartTime, setRecordingStartTime] = useState(null);
    const [recording, setRecording] = useState<Audio.Recording>();
    const [savedRecordingUri, setSavedRecordingUri] = useState<string>();
    const [prediction, setPrediction] = useState(undefined);
    const [model, setModel] = useState<tf.GraphModel>();
    const [buttonDisabled, setButtonDisabled] = useState(true);
    const [isBusy, setIsBusy] = useState(false);
    const [showBird, setShowBird] = useState(false);

    useEffect(() => {
        const loadModel = async () => {
            setIsBusy(true);
            setButtonDisabled(true);
            await tf.ready();
            const modelJson = require('../model/model.json');
            const modelWeights = [
                require('../model/group1-shard1of4.bin'),
                require('../model/group1-shard2of4.bin'),
                require('../model/group1-shard3of4.bin'),
                require('../model/group1-shard4of4.bin'),
            ];
            showToast('info', 'Loading model...', 'Please wait for the model to load');
            try {
                const loadedModel = await tf.loadGraphModel(bundleResourceIO(modelJson, modelWeights));
                setModel(loadedModel);
                setButtonDisabled(false);
                setIsBusy(false);
                showToast('success', 'Model loaded!', 'Model is ready for prediction');
            } catch (error) {
                console.error("Failed to load model", error);
                showToast('error', 'Error loading model', 'Please try again later');
            }
        };

        loadModel();
    }, []);

    const showToast = (type: string, text1: string, text2: string) => {
        Toast.show({
            type,
            text1,
            text2,
            position: 'bottom'
        });
    };

    async function startRecording() {
        try {
            const perm = await Audio.requestPermissionsAsync();
            if (perm.status === "granted") {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                });
                const { recording } = await Audio.Recording.createAsync(
                    Audio.RecordingOptionsPresets.HIGH_QUALITY
                );
                setRecording(recording);
                setRecordingStartTime(Date.now());
            }
        } catch (err) {
            console.error("Failed to start recording:", err);
        }
    }

    async function stopRecording() {
        if (recording) {
            const elapsedTime = Date.now() - recordingStartTime;
            if (elapsedTime < MINIMUM_RECORDING_DURATION) {
                showToast('error', 'Recording is too short', `Please record for at least ${MINIMUM_RECORDING_DURATION / 1000} seconds.`);
                return;
            }
            setButtonDisabled(true);
            setShowBird(false);
            setPrediction(undefined);
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setSavedRecordingUri(uri);
            setRecording(undefined);
        }
    }

    async function predictLabel() {
        try {
            
            setIsBusy(true);
            setButtonDisabled(true);
            Toast.hide();
            const response = await fetch(savedRecordingUri);
            const buffer = await response.arrayBuffer();
            const input = tf.tensor(decodeAudio(buffer));

            await tf.nextFrame();
            const output = model.predict(input).argMax(0);
            setPrediction(output);
            Toast.hide();
        } catch (error) {
            console.error("Prediction error:", error);
            showToast('error', 'Prediction failed', 'Please try again later');
            setButtonDisabled(false);
        } finally {
            setIsBusy(false);
        }
    }

    function decodeAudio(buffer: ArrayBuffer) {
        const arrInt = new Int16Array(buffer.slice(0, buffer.byteLength - buffer.byteLength % 2));
        const arrFloat = new Float32Array(arrInt.length);
        for (let i = 0; i < arrFloat.length; i++) {
            arrFloat[i] = arrInt[i] / 32768;
        }
        return arrFloat;
    }

    useEffect(() => {
        if (savedRecordingUri) {
            showToast('info', 'Prediction is running...', 'Please wait for the model result');
            predictLabel();
        } 
    }, [savedRecordingUri]);

    useEffect(() => {
        if (showBird) {
            setShowBird(false);
            Toast.hide();
            navigation.navigate('BirdDetails', { 'recUri': savedRecordingUri, 'lab': prediction.dataSync()[0] });
            setButtonDisabled(false);
        }
    }, [showBird]);

    useEffect(() => {
        if (savedRecordingUri && prediction) setShowBird(true);
    }, [prediction]);

    const bouncingAnimation = {
        0: { height: 14 },
        0.5: { height: 40 },
        1: { height: 14 },
    };

    return (
        <View className="flex-1 items-center justify-center bg-primary">
            {/* Title */}
            <View className="justify-center items-center mb-10">
                <Text className="text-white text-4xl font-bold text-center mb-1">RECORD</Text>
                <Text className="text-white text-4xl font-bold text-center mb-10">THE BIRD</Text>
                {recording ? (
                    <View className="flex-row space-x-1 h-14">
                        <Animatable.View className="w-1 bg-white self-center" animation={bouncingAnimation} iterationCount="infinite" duration={400} delay={200} />
                        <Animatable.View className="w-1 bg-white self-center" animation={bouncingAnimation} iterationCount="infinite" duration={400} delay={50} />
                        <Animatable.View className="w-1 bg-white self-center" animation={bouncingAnimation} iterationCount="infinite" duration={400} delay={300} />
                        <Animatable.View className="w-1 bg-white self-center" animation={bouncingAnimation} iterationCount="infinite" duration={400} />
                    </View>
                ) : (
                    <View className="flex-row space-x-1 h-14">
                        {isBusy ? (
                            <ActivityIndicator size="large" color="#FFFFFF" />
                        ) : (
                            <Ionicons name="mic-outline" size={50} color="#FFFFFF" />
                        )}
                    </View>
                )}
            </View>

            {/* Bird Icon Button */}
            <TouchableOpacity
                disabled={buttonDisabled}
                onPress={recording ? stopRecording : startRecording}
                className="justify-center items-center bg-primary"
            >
                <View className="w-56 h-56 rounded-full justify-center items-center bg-primary border-2 border-dashed border-white">
                    <View className="w-52 h-52 rounded-full bg-white justify-center items-center bg-primary border-2 border-solid border-white">
                        <Image source={require("../assets/icon_white.png")} className="w-40 h-40" />
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};
