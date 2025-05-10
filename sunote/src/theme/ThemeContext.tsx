// scr/theme/ThemeContext.tsx
import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from "react";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import { DarkTheme, DefaultTheme, Theme} from "@react-navigation/native";
import colorSchemeLight from './lightColors.json';
import colorSchemeDark from './darkColors.json';

import { ThemeMode, useThemeStore } from "../context/store";

// 浅色主题模式下的主题配置
const lightTheme = {
  ...MD3LightTheme, // or MD3DarkTheme
  roundness: 2,
  colors: {
    ...MD3LightTheme.colors,
    ...colorSchemeLight
  },
};

// 深色主题模式下的主题配置
const darkTheme = {
  ...MD3DarkTheme, // or MD3DarkTheme
  roundness: 2,
  colors: {
    ...MD3DarkTheme.colors,
    ...colorSchemeDark
  },
};

const navigationLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    // background: 'rgb(140, 201, 125)',
    ...colorSchemeLight
    // primary: '#7845AC',
  },
};

const navigationDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    // background: 'rgb(140, 201, 125)',
    ...colorSchemeDark
    // primary: '#DCB8FF',
  },
};



// 提供便捷的 hook
// export const useAppTheme = () => useContext(ThemeContext);







/**
 * ThemeProvider 组件：负责管理全局主题

 * - 封装 react-native-paper 和 react-navigation 的 theme provider
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const mode = useThemeStore((state) => state.mode);


  // 统一维护两个主题
  const paperTheme = useMemo(() => (mode === "dark" ? darkTheme : lightTheme), [mode]);
  // const navTheme: Theme = useMemo(() => (mode === "dark" ? navigationDarkTheme : navigationLightTheme), [mode]);
 
  return (
      <PaperProvider theme={paperTheme}>
        {children}
      </PaperProvider>

  );
}












export const useTheme = (paramMode?: ThemeMode) => {
  // 自动优先用传参，没有再用store的
  const mode = paramMode ?? useThemeStore((state) => state.mode);
  return mode === "dark" ? darkTheme : lightTheme;
};
// ----------- 建议在app入口这么用 -----------

// import { ThemeProvider } from './src/theme/ThemeContext';
// import { NavigationContainer } from '@react-navigation/native';

// function App() {
//   return (
//     <ThemeProvider>
//       <NavigationContainer theme={useAppTheme().mode === "dark" ? NavigationDark : NavigationLight}>
//         {/* ...App 路由部分... */}
//       </NavigationContainer>
//     </ThemeProvider>
//   );
// }
