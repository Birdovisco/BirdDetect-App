import React, { useEffect, useRef } from "react";
import { View, Image, Text, TouchableOpacity } from "react-native";
import { useBirdData } from "../hooks/useBirdData";
import { Audio } from "expo-av";
import Ionicons from "react-native-vector-icons/Ionicons";
import { theme } from "../core/theme";

export default function BirdDetails({ route }) {
    const { rec, lab } = route.params;
    const birdData = useBirdData(lab);
    const sound = useRef(new Audio.Sound());

    useEffect(() => {
        const loadRecording = async () => {
            if (rec) await sound.current.loadAsync({ uri: rec.getURI() });
        };

        loadRecording();
    }, [rec]);

    const playSound = async () => {
        try {
            await sound.current.replayAsync();
        } catch (error) {
            console.error("Error playing sound:", error);
        }
    };

    if (!birdData) return null;

    return (
        <View className="flex-1" style={{ backgroundColor: theme.colors.primary }}>
            <View className="items-center">
                <View className="w-64 h-64 rounded-full overflow-hidden border-4 border-black">
                    <Image source={birdData.photo} className="w-full h-full" />
                </View>
            </View>
            <View className="flex-1 bg-white p-5 items-center -mt-16 pt-24">
                <Text className="text-2xl font-bold text-center mb-1">{birdData.name}</Text>
                {rec && (
                    <TouchableOpacity onPress={playSound} className="ml-2">
                        <Ionicons name="play-circle" size={24} color="black" />
                    </TouchableOpacity>
                )}
                <Text className="text-lg italic text-center mb-5">{birdData.latinName}</Text>
                <Text className="text-base text-center">{birdData.desc}</Text>
            </View>
        </View>
    );
}
