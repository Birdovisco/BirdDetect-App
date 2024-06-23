import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Image,
    Text,
    TouchableOpacity,
} from "react-native";
import { theme } from "../core/theme";
import { Audio } from "expo-av";
import FFT from "fft.js";
import Svg, { Rect } from 'react-native-svg';
import Ionicons from "react-native-vector-icons/Ionicons";

export default function BirdDetails({ route }) {

    const [savedRecording] = React.useState<Audio.Recording>(route.params);
    const sound = useRef(new Audio.Sound());

    useEffect(() => {

        const loadRecording = async () => {
            try {
              await sound.current.loadAsync({ uri: savedRecording.getURI() });
            } catch (error) {
              console.error("Error loading recording:", error);
            }
        };

        loadRecording();
    }, [savedRecording]);

    const playSound = async () => {
        try {
            await sound.current.playAsync();
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    };

    return (
        <View className="flex-1" style={{ backgroundColor: theme.colors.primary }}>
            <View className="items-center">
                <View className="w-64 h-64 rounded-full overflow-hidden border-4 border-black z-10">
                    <Image source={require('../assets/birdPhotos/birdImage.jpg')} className="w-full h-full" />
                </View>
            </View>
            <View className="flex-1 bg-white p-5 items-center -mt-16 pt-24">
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Text className="text-2xl font-bold text-center mb-1">Thrush nightingale</Text>
                    <TouchableOpacity onPress={playSound} className='ml-2'>
                        <Ionicons name="play-circle" size={24} color="black" />
                    </TouchableOpacity>
                </View>
                <Text className="text-lg italic text-center mb-5">Luscinia luscinia</Text>
                <Text className="text-base text-center leading-6">
                    also known as the sprosser, is a small passerine bird that was formerly classed as a member of the thrush family Turdidae, but is now more generally considered to be an Old World flycatcher, Muscicapidae. It, and similar small European species, are often called chats.
                </Text>
            </View>
        </View>
    );
};
