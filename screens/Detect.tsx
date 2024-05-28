import React, { useEffect, useState } from "react";
import {
    View,
    TouchableOpacity,
    Image,
    Text,
    Button,
} from "react-native";
import { Audio } from "expo-av";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as Animatable from 'react-native-animatable';
import Toast from 'react-native-toast-message';

export default function Detect({ navigation }) {

    const MINIMUM_RECORDING_DURATION = 2000; // 5 seconds in milliseconds
    const [recordingStartTime, setRecordingStartTime] = useState(null);
    const [recording, setRecording] = React.useState<Audio.Recording>();
    const [savedRecording, setSavedRecording] = React.useState<Audio.Recording>();

    const showToast = (type: string, text1: string, text2: string) => { // TODO rewrite as component
        Toast.show({
          type,
          text1,
          text2,
          position: 'bottom'
        });
    }

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
    
            setRecording(undefined);
            await recording.stopAndUnloadAsync();
            setSavedRecording(recording);
        }
    }

    useEffect(() => {
        if (savedRecording) {
            Toast.hide();
            navigation.navigate('BirdDetails', savedRecording);
        }
    }, [savedRecording]);

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
                        <Animatable.View className="w-1 bg-white self-center" animation={bouncingAnimation} iterationCount="infinite" duration={400} delay={100}/>
                        <Animatable.View className="w-1 bg-white self-center" animation={bouncingAnimation} iterationCount="infinite" duration={400} delay={50} />
                        <Animatable.View className="w-1 bg-white self-center" animation={bouncingAnimation} iterationCount="infinite" duration={400} delay={150} />
                        <Animatable.View className="w-1 bg-white self-center" animation={bouncingAnimation} iterationCount="infinite" duration={400} />
                    </View>
                ) : (
                    <View className="flex-row space-x-1 h-14">
                        <Ionicons name="mic-outline" size={50} color="#FFFFFF"/>
                    </View>
                )}
            </View>

            {/* Bird Icon Button */}
            <TouchableOpacity
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