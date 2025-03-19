import { Assets as NavigationAssets } from '@react-navigation/elements';
import { Asset } from 'expo-asset';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { Navigation } from './navigation';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';

Asset.loadAsync([
  ...NavigationAssets,
  require('./assets/newspaper.png'),
  require('./assets/bell.png'),
]);

SplashScreen.preventAutoHideAsync();

export function App() {
  const scheme = useColorScheme();
  // const paperTheme = scheme === 'dark' ? MD3DarkTheme : MD3LightTheme;
  const navigationTheme = scheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    // <PaperProvider theme={navigationTheme}>
      <PaperProvider>
      {/* Ensure NavigationContainer is only used once at the root */}
        <Navigation
          theme={navigationTheme}
          linking={{
            enabled: 'auto',
            prefixes: [
              'helloworld://',
            ],
          }}
          onReady={() => {
            SplashScreen.hideAsync();
          }}
        >
      </Navigation>
    </PaperProvider>
  );
}