import { DefaultTheme as PaperDefaultTheme } from 'react-native-paper';
import { DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';

export const theme = {
  ...PaperDefaultTheme,
  ...NavigationDefaultTheme,
  colors: {
    ...PaperDefaultTheme.colors,
    ...NavigationDefaultTheme.colors,
    primary: '#b28b78',
    secondary: '#37c3dd',
    warning: '#dd9637',
    error: '#dd3770',
    success: '#54B435',
    text: '#1c1d1e',

    // primary
    primary10: '#fdfeff',
    primary30: '#f9fbfe',
    primary40: '#f7f9fe',
    primary50: '#f5f8fe',
    primary80: '#eff4fd',
    primary90: '#edf2fc',
    primary100: '#ebf1fc',
    primary200: '#c3d4f5',
    primary300: '#9bb8ee',
    primary400: '#5f8de4',
    primary500: '#3770dd',
    primary600: '#2c5ab1',
    primary650: '#23488e',
    primary700: '#1c386f',
    primary800: '#102242',
    primary900: '#050b16',

    // secondary
    secondary100: '#ebf9fc',
    secondary200: '#c3edf5',
    secondary300: '#9be1ee',
    secondary400: '#5fcfe4',
    secondary500: '#37c3dd',
    secondary600: '#2c9cb1',
    secondary700: '#1c626f',
    secondary800: '#103a42',
    secondary900: '#051316',

    // warning
    warning100: '#fcf5eb',
    warning200: '#f5e0c3',
    warning300: '#eecb9b',
    warning400: '#e4ab5f',
    warning500: '#dd9637',
    warning600: '#b1782c',
    warning700: '#6f4b1c',
    warning800: '#422d10',
    warning900: '#160f05',

    // error
    error100: '#fcebf1',
    error200: '#f5c3d4',
    error300: '#ee9bb8',
    error400: '#e45f8d',
    error500: '#dd3770',
    error600: '#b12c5a',
    error700: '#6f1c38',
    error800: '#421022',
    error900: '#16050b',

    //grays
    gray100: '#F9FAFA',
    gray150: '#F4F5F5',
    gray200: '#EEEFEF',
    gray300: '#BCBEC0',
    gray400: '#9B9EA1',
    gray500: '#7A7D81',
    gray600: '#5A5D60',
    gray700: '#3B3C3E',
    gray800: '#1C1D1E',
    gray900: '#101011',

    // success

    success100: '#eef8eb',
    success200: '#cce9c2',
    success300: '#aada9a',
    success400: '#76c35d',
    success500: '#54b435',
    success600: '#43902a',
    success700: '#326c20',
    success800: '#224815',
    success900: '#081205',
  },
};
