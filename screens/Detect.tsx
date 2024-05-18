import React from "react";
import {
    View,
    TouchableOpacity,
    Image,
    Text,
    Button,
    StyleSheet,
} from "react-native";
import { theme } from "../core/theme";
import { Audio } from "expo-av";

const ScreenWithButton = () => {
    const [recording, setRecording] = React.useState<Audio.Recording>();
    const [savedRecording, setSavedRecording] = React.useState<Audio.Sound>();

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
        const { sound } = await recording.createNewLoadedSoundAsync();
        setSavedRecording(sound);
    }

    function showRecordingLine() {
        if (!savedRecording) return;
        return (
            <View style={styles.row}>
                <Text style={styles.fill}>Saved Recording</Text>
                <Button
                    onPress={() => savedRecording.replayAsync()}
                    title="Play"
                ></Button>
            </View>
        );
    }

    return (
        <View
            className="flex-1 justify-center items-center bg-theme-primary"
            style={{ backgroundColor: theme.colors.primary }}
        >
            <Text className="text-white text-lg mb-4">
                {recording ? "Stop Recording" : "Start Recording"}
            </Text>
            <TouchableOpacity
                onPress={recording ? stopRecording : startRecording}
                className="w-56 h-56 rounded-full bg-white justify-center items-center"
            >
                <Image source={require("../assets/icon.png")} className="w-48 h-48" />
            </TouchableOpacity>
            {showRecordingLine()}
        </View>
    );
};

export default ScreenWithButton;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
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
