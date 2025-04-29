import { Assets as NavigationAssets } from '@react-navigation/elements';
import { Asset } from 'expo-asset';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';

import { Navigation } from './components';
import { Loading } from './components//common/Loading';
import { SignIn } from './components/sign/SignIn';

import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import { useAuthStore } from './context/store';
import { getToken } from './context/secureStore'; // SecureStore相关
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';




const Stack = createNativeStackNavigator();



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

  const token = useAuthStore((s) => s.token);
  const setToken = useAuthStore((s) => s.setToken);
  console.log('当前 token 是：', token);

  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      const savedToken = await getToken();
      if (savedToken) {
        setToken(savedToken);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <Loading />;
  }


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