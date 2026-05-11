import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { AppTheme, ThemeMode, themes } from './colors';

const THEME_STORAGE_KEY = '@feedback-anonyme-theme-mode';
const LANGUAGE_STORAGE_KEY = '@feedback-anonyme-language';
const NOTIFICATIONS_STORAGE_KEY = '@feedback-anonyme-notifications-enabled';

export type LanguageMode = 'fr' | 'mg' | 'en';

type AppThemeContextValue = {
  language: LanguageMode;
  mode: ThemeMode;
  notificationsEnabled: boolean;
  theme: AppTheme;
  setLanguage: (language: LanguageMode) => void;
  setMode: (mode: ThemeMode) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [language, setLanguageState] = useState<LanguageMode>('fr');
  const [notificationsEnabled, setNotificationsEnabledState] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((storedMode) => {
      if (storedMode === 'light' || storedMode === 'dark') {
        setModeState(storedMode);
      }
    });

    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((storedLanguage) => {
      if (storedLanguage === 'fr' || storedLanguage === 'mg' || storedLanguage === 'en') {
        setLanguageState(storedLanguage);
      }
    });

    AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY).then((storedEnabled) => {
      if (storedEnabled === 'true' || storedEnabled === 'false') {
        setNotificationsEnabledState(storedEnabled === 'true');
      }
    });
  }, []);

  const setMode = (nextMode: ThemeMode) => {
    setModeState(nextMode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode);
  };

  const setLanguage = (nextLanguage: LanguageMode) => {
    setLanguageState(nextLanguage);
    AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  };

  const setNotificationsEnabled = (enabled: boolean) => {
    setNotificationsEnabledState(enabled);
    AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, String(enabled));
  };

  const value = useMemo(
    () => ({
      language,
      mode,
      notificationsEnabled,
      theme: themes[mode],
      setLanguage,
      setMode,
      setNotificationsEnabled,
    }),
    [language, mode, notificationsEnabled]
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used inside AppThemeProvider');
  }

  return context;
}
