import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { NotificationProvider } from '../src/notifications/NotificationContext';
import { AppThemeProvider, useAppTheme } from '../src/theme/AppThemeContext';

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <NotificationProvider>
        <RootLayoutContent />
      </NotificationProvider>
    </AppThemeProvider>
  );
}

function RootLayoutContent() {
  const { mode, theme } = useAppTheme();

  return (
    <ThemeProvider value={mode === 'dark' ? DarkTheme : DefaultTheme}>
      <Slot />
      <StatusBar style={theme.statusBar} />
    </ThemeProvider>
  );
}
