import React from "react";
import {
    View,
    TouchableOpacity,
    Image,
    Text,
    Button,
    StyleSheet,
} from "react-native";
import { Audio } from "expo-av";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as Animatable from 'react-native-animatable';

export default function Detect({ navigation }) {
    const [recording, setRecording] = React.useState<Audio.Recording>();
    const [savedRecording, setSavedRecording] = React.useState<Audio.Recording>();

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
            }
        } catch (err) {}
    }

    async function stopRecording() {
        setRecording(undefined);
        await recording.stopAndUnloadAsync();
        setSavedRecording(recording);
    }

    function showRecordingLine() { // TO DELETE FOR TESTS ONLY
        if (!savedRecording) return;
        
        return (
            <View style={styles.row}>
                <Text style={styles.fill}>Saved Recording</Text>
                <Button
                    onPress={() => {
                        navigation.navigate('BirdDetails', savedRecording)
                    }}
                    title="Play"
                ></Button>
            </View>
        );
    }

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
            {/* TO DELETE FOR TESTS ONLY */}
            {showRecordingLine() } 
        </View>
    );
};

const styles = StyleSheet.create({ // TO DELETE FOR TESTS ONLY
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 10,
        marginRight: 40,
    },
    fill: {
        flex: 1,
        margin: 15,
    },
});
