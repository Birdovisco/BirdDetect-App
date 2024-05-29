
import React from "react";
import { View, Image, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {theme} from "../core/theme";

const NavigationDrawerHeader = (props) => {
    const toggleDrawer = () => {
        props.navigationProps.toggleDrawer();
    };
    

    return (
        <View style={{ flexDirection: "row" }}>
            <TouchableOpacity onPress={toggleDrawer}>
                <Ionicons name="menu" size={50} style={{marginLeft: 20, marginTop: 10, color: theme.colors.gray100}} color="white" />
            </TouchableOpacity>
        </View>
    );
};
export default NavigationDrawerHeader;
