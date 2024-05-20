import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Image,
    Text,
} from "react-native";
import { theme } from "../core/theme";
import { Audio } from "expo-av";
import FFT from "fft.js";
import Svg, { Rect } from 'react-native-svg';

export default function BirdDetails({ route }) {

    const [savedRecording] = React.useState<Audio.Recording>(route.params);
    const sound = useRef(new Audio.Sound());

    useEffect(() => {  // TO DELETE FOR TESTS ONLY

        const loadRecording = async () => {
            try {
              await sound.current.loadAsync({ uri: savedRecording.getURI() });
              await sound.current.playAsync();
            } catch (error) {
              console.error("Error loading recording:", error);
            }
        };

        loadRecording();
    }, [savedRecording]);

    const processAudioData = (audioData) => {
        const fft = new FFT(1024); // FFT size
        const out = fft.createComplexArray();
        const data = new Float32Array(audioData);
      
        fft.realTransform(out, data);
        fft.completeSpectrum(out);
      
        console.log(out);
        return out;
    };

    const spectrogram = (data) => {
        const barWidth = 2;
        const barSpacing = 1;
        const height = 200;
      
        return (
          <View>
            <Svg height={height} width={data.length * (barWidth + barSpacing)}>
              {data.map((value, index) => (
                <Rect
                  key={index}
                  x={index * (barWidth + barSpacing)}
                  y={height - (value / 255) * height}
                  width={barWidth}
                  height={(value / 255) * height}
                />
              ))}
            </Svg>
          </View>
        );
    };

    return (
        <View className="flex-1" style={{ backgroundColor: theme.colors.primary }}>
            <View className="items-center">
                <View className="w-64 h-64 rounded-full overflow-hidden border-4 border-black z-10">
                    <Image source={require('../assets/birdPhotos/birdImage.jpg')} className="w-full h-full" />
                </View>
            </View>
            <View className="flex-1 bg-white p-5 items-center -mt-16 pt-24">
                <Text className="text-2xl font-bold text-center mb-1">Thrush nightingale</Text>
                <Text className="text-lg italic text-center mb-5">Luscinia luscinia</Text>
                <Text className="text-base text-center leading-6">
                    also known as the sprosser, is a small passerine bird that was formerly classed as a member of the thrush family Turdidae, but is now more generally considered to be an Old World flycatcher, Muscicapidae. It, and similar small European species, are often called chats.
                </Text>
            </View>
        </View>
    );
};
