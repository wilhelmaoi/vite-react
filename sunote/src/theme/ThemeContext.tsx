import React, { createContext, useContext, useState, ReactNode } from "react";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from "@react-navigation/native";

type ThemeType = "light" | "dark";

interface ThemeContextProps {
  mode: ThemeType;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  mode: "light",
  toggleTheme: () => {},
});

export const useAppTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeType>("light");

  const toggleTheme = () => setMode((prev) => (prev === "light" ? "dark" : "light"));

  const paperTheme = mode === "dark" ? MD3DarkTheme : MD3LightTheme;
  const navTheme = mode === "dark" ? DarkTheme : DefaultTheme;

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <PaperProvider theme={paperTheme}>
        <NavThemeProvider value={navTheme}>
          {children}
        </NavThemeProvider>
      </PaperProvider>
    </ThemeContext.Provider>
  );
}
