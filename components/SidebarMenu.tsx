import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';

import {
    DrawerContentScrollView,
    DrawerItemList,
} from '@react-navigation/drawer';
import { theme } from "../core/theme";


const SidebarMenu = (props) => {

    return (
        <ScrollView contentContainerStyle={stylesSidebar.sideMenuContainer}>
                <View style={stylesSidebar.header}>
                    <Text style={stylesSidebar.headerText}>
                        SigmaBirder5000
                    </Text>
                </View>

            {/* line separating header and navigation buttons */}
            <View style={stylesSidebar.headerLine}/>

            <DrawerContentScrollView>
                <DrawerItemList {...props}/>
            </DrawerContentScrollView>

        </ScrollView>
    );
};

export default SidebarMenu;

const stylesSidebar = StyleSheet.create({
    sideMenuContainer: {
        flex: 1,
        height: '100%',
        backgroundColor: theme.colors.gray100,
        paddingTop: 40,
        color: 'white'
    },
    header: {
        flexDirection: 'row',
        padding: 15,
        textAlign: 'center',
    },
    headerText: {
        color: '#000',
        alignSelf: 'center',
        paddingHorizontal: 10,
        fontWeight: 'bold',
        fontSize: 16
    },
    headerLine: {
        height: 1,
        backgroundColor: '#525252',
        marginTop: 15,
    },
    drawerItem: {
        fontSize: 20
    },
});
