import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text } from "react-native";
import DefaultNavigatorRoutes from "./routes/DefaultNavigationRoutes";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import React from "react";
import { PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { theme } from "./core/theme";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <PaperProvider theme={theme}>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName="DefaultNavigatorRoutes">
                        <Stack.Screen
                            name="DefaultNavigatorRoutes"
                            component={DefaultNavigatorRoutes}
                            options={{ headerShown: false }}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            <StatusBar style={"light"} />
            </PaperProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
},
});
