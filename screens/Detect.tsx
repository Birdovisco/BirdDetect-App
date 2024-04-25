import React from 'react';
import { View, TouchableOpacity, Image, Text} from 'react-native';
import { theme } from '../core/theme';

const ScreenWithButton = () => {

    const handleButtonPress = () => {
        console.log('Button pressed!');
    };

    return (
        <View
            className="flex-1 justify-center items-center bg-theme-primary"
            style={{backgroundColor: theme.colors.primary}}>
            <Text className="text-white text-lg mb-4">Naciśnij aby nagrać dźwięk</Text>
            <TouchableOpacity
                onPress={handleButtonPress}
                className="w-56 h-56 rounded-full bg-white justify-center items-center"
            >
                <Image source={require('../assets/icon.png')} className="w-48 h-48" />
            </TouchableOpacity>
        </View>
    );
}

export default ScreenWithButton;
