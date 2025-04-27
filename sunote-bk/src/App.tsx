import { Assets as NavigationAssets } from '@react-navigation/elements';
import { Asset } from 'expo-asset';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { Navigation } from './components';
import { SignIn } from './components/sign/SignIn';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import { AuthProvider } from './context/GlobalContext(Deprecated)';
import { useAuthStore } from './context/store';
import { getToken } from './context/secureStore'; // SecureStore相关
import { createNativeStackNavigator } from '@react-navigation/native-stack';




const Stack = createNativeStackNavigator();


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
// const Stack = createNativeStackNavigator<AuthStackParamList>();
export function App() {
  const scheme = useColorScheme();
  // const paperTheme = scheme === 'dark' ? MD3DarkTheme : MD3LightTheme;
  const navigationTheme = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const setToken = useAuthStore((s) => s.setToken);
  const token = useAuthStore((s) => s.token);

  return (
    <PaperProvider>
      {
        token ? (
          <Navigation
            theme={navigationTheme}
            linking={{
              enabled: 'auto',
              prefixes: ['helloworld://'],
            }}
            onReady={() => {
              SplashScreen.hideAsync();
            }}
          />
        ) : (
          <NavigationContainer theme={navigationTheme}>
            <Stack.Navigator>
              <Stack.Screen name="SignIn" component={SignIn} />
            </Stack.Navigator>
          </NavigationContainer>
        )
      }
    </PaperProvider>
  );
}