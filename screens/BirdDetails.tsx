import React, { useEffect } from "react";
import {
    View,
    TouchableOpacity,
    Image,
} from "react-native";
import { theme } from "../core/theme";
import { Audio } from "expo-av";
import FFT from "fft.js";
import Svg, { Rect } from 'react-native-svg';

export default function BirdDetails({ route }) {

    const [savedRecording, setSavedRecording] = React.useState<Audio.SoundObject>(route.params);

    useEffect(() => {
        console.log(savedRecording.status.uri);
        //processAudioData(savedRecording.status.uri); // doesn't work
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
                  fill="blue"
                />
              ))}
            </Svg>
          </View>
        );
    };

    return (
        <View
            className="flex-1 justify-center items-center bg-theme-primary"
            style={{ backgroundColor: theme.colors.primary }}
        >
            <TouchableOpacity
                className="w-56 h-56 rounded-full bg-white justify-center items-center"
            >
                <Image source={require("../assets/icon.png")} className="w-48 h-48" />
            </TouchableOpacity>
            {/* {spectrogram(processAudioData(processAudioData(savedRecording.status.uri)))} */}
        </View>
    );
};
