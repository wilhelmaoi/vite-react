import { Assets as NavigationAssets } from '@react-navigation/elements';
import { Asset } from 'expo-asset';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { Navigation } from './navigation';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper'; // 导入 PaperProvider
import database from "./database" // Removed because the module is missing

Asset.loadAsync([
  ...NavigationAssets,
  require('./assets/newspaper.png'),
  require('./assets/bell.png'),
]);

SplashScreen.preventAutoHideAsync();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3498db', // 你可以自定义主题颜色
  },
};

export function App() {
  return (
    <PaperProvider theme={theme}>
      <Navigation
        linking={{
          enabled: 'auto',
          prefixes: [
            'helloworld://',
          ],
        }}
        onReady={() => {
          SplashScreen.hideAsync();
        }}
      />
    </PaperProvider>
  );
}
