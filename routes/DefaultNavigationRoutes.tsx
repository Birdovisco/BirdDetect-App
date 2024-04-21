import Ionicons from 'react-native-vector-icons/Ionicons'
import {createStackNavigator} from '@react-navigation/stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import SidebarMenu from '../components/SidebarMenu';
import Detect from "../screens/Detect";
import BirdCatalog from '../screens/BirdCatalog';
import NavigationDrawerHeader from '../components/NavigationDrawerHeader';
import { theme } from '../core/theme';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const DetectScreenStack = ({ navigation }) => {
    return (
        <Stack.Navigator
            initialRouteName="Detect"
            screenOptions={{
                headerBackTitle: 'Wróć',
            }}
        >
            <Stack.Screen
                name="Detect"
                component={Detect}
                options={{
                    title: "",
                    headerLeft: () => (
                        <NavigationDrawerHeader navigationProps={navigation}/>
                    ),
                    headerStyle: {
                        backgroundColor: theme.colors.primary,
                    },
                    headerBackTitle: 'Wróć',
                    headerBackTitleVisible: true,
                    headerTintColor: theme.colors.gray100,
                    headerTitleStyle: {
                        fontWeight: "bold",
                        fontSize: 24,
                        padding: 5,
                    },
                }}
            />
        </Stack.Navigator>
    );
};

const BirdCatalogScreenStack = ({ navigation }) => {
    return (
        <Stack.Navigator
            initialRouteName="BirdCatalog"
            screenOptions={{
                headerBackTitle: 'Wróć',
            }}
        >
            <Stack.Screen
                name="BirdCatalog"
                component={BirdCatalog}
                options={{
                    title: "Katalog ptaków",
                    headerLeft: () => (
                        <NavigationDrawerHeader navigationProps={navigation} />
                    ),
                    headerStyle: {
                        backgroundColor: theme.colors.primary,
                    },
                    headerBackTitle: 'Wróć',
                    headerTintColor: theme.colors.gray100,
                    headerTitleStyle: {
                        fontWeight: "bold",
                        fontSize: 22,
                        padding: 5,
                    },
                }}
            />
        </Stack.Navigator>
    );
};


const DefaultNavigatorRoutes = (props) => {

    return (
        <Drawer.Navigator
            screenOptions={{
                swipeEdgeWidth: 100,
                headerShown: false,
                drawerStyle: {
                    backgroundColor: '#f9f7f3',
                },
                drawerActiveTintColor: '#242423',
                drawerInactiveTintColor: '#555',

                drawerActiveBackgroundColor: theme.colors.primary50,
                drawerLabelStyle: {
                    fontSize: 18,
                    marginLeft: -10,
                    alignItems: 'center'
                },
            }}
            drawerContent={props => <SidebarMenu {...props}/> }>

            <Drawer.Screen name="DetectScreenStack" component={DetectScreenStack}
                           options={{
                               drawerLabel: 'Nasłuchuj',
                               drawerIcon: ({color}) => (<Ionicons name='musical-notes-outline' size={26} color={color}/>)
                           }}
            />
            <Drawer.Screen name="BirdCatalogScreenStack" component={BirdCatalogScreenStack}
                           options={{
                               drawerLabel: 'Katalog ptaków',
                               drawerIcon: ({color}) => (<Ionicons name='search-outline' size={26} color={color}/>)}}
            />
        </Drawer.Navigator>
    );
};

export default DefaultNavigatorRoutes;
