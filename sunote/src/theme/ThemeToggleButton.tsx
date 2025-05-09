// ThemeToggleButton.tsx
import React from 'react';
import { IconButton } from 'react-native-paper';
import { useThemeStore } from '../context/store';

export default function ThemeToggleButton() {
    const mode = useThemeStore((state) => state.mode);
    const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <IconButton
      icon={mode === 'light' ? 'weather-night' : 'white-balance-sunny'}
      size={24}
      onPress={toggleTheme}
      accessibilityLabel="切换主题"
    />
  );
}
