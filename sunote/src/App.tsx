//src/App.tsx

import { Assets as NavigationAssets } from '@react-navigation/elements';
import { Asset } from 'expo-asset';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';

import { AppStack } from './components/index';
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
  const saveTokenToStore = useAuthStore((s) => s.setToken);
  console.log('当前 token 是：', token);
  console.log('当前 服务器地址 是：', process.env.EXPO_PUBLIC_API_URL);

  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      const savedToken = await getToken();
      if (savedToken) {
        saveTokenToStore(savedToken);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <Loading />;
  }


  return (
    <PaperProvider>
        <NavigationContainer theme={navigationTheme}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* {token ? (
              <Stack.Screen name="HomeTabs" component={AppStack} />
            ) : ( */}
              <Stack.Screen name="Sign" component={SignIn} />
            {/* )} */}
          </Stack.Navigator>
        </NavigationContainer>
    </PaperProvider>
  );
}