import { Ionicons } from '@expo/vector-icons';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useNotifications } from '../../notifications/NotificationContext';
import { LanguageMode, useAppTheme } from '../../theme/AppThemeContext';
import { AppTheme, ThemeMode } from '../../theme/colors';

const languages: { label: string; value: LanguageMode }[] = [
  { label: 'Francais', value: 'fr' },
  { label: 'Malagasy', value: 'mg' },
  { label: 'English', value: 'en' },
];

const themes: { label: string; value: ThemeMode; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Clair', value: 'light', icon: 'sunny-outline' },
  { label: 'Sombre', value: 'dark', icon: 'moon-outline' },
];

export default function SettingsScreen() {
  const {
    language,
    mode,
    notificationsEnabled,
    setLanguage,
    setMode,
    setNotificationsEnabled,
    theme,
  } = useAppTheme();
  const { addNotification } = useNotifications();
  const styles = createStyles(theme);

  const updateMode = (nextMode: ThemeMode) => {
    setMode(nextMode);
    addNotification('Affichage mis a jour', `Mode ${nextMode === 'dark' ? 'sombre' : 'clair'} active.`);
  };

  const updateLanguage = (nextLanguage: LanguageMode) => {
    setLanguage(nextLanguage);
    const label = languages.find((item) => item.value === nextLanguage)?.label ?? nextLanguage;
    addNotification('Langue mise a jour', `Langue selectionnee: ${label}.`);
  };

  const updateNotifications = (enabled: boolean) => {
    setNotificationsEnabled(enabled);

    if (enabled) {
      addNotification('Notifications activees', 'Vous recevrez les alertes des actions importantes.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        <Text style={styles.title}>Preferences application</Text>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="contrast-outline" size={22} color={theme.primary} />
            <Text style={styles.sectionTitle}>Affichage</Text>
          </View>
          <View style={styles.segment}>
            {themes.map((item) => {
              const selected = mode === item.value;

              return (
                <Pressable
                  key={item.value}
                  onPress={() => updateMode(item.value)}
                  style={[styles.segmentOption, selected && styles.segmentOptionSelected]}>
                  <Ionicons name={item.icon} size={18} color={selected ? '#ffffff' : theme.textMuted} />
                  <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="language-outline" size={22} color={theme.primary} />
            <Text style={styles.sectionTitle}>Langue</Text>
          </View>
          <View style={styles.optionList}>
            {languages.map((item) => {
              const selected = language === item.value;

              return (
                <Pressable
                  key={item.value}
                  onPress={() => updateLanguage(item.value)}
                  style={[styles.listOption, selected && styles.listOptionSelected]}>
                  <Text style={[styles.listOptionText, selected && styles.listOptionTextSelected]}>{item.label}</Text>
                  {selected ? <Ionicons name="checkmark-circle" size={22} color={theme.primary} /> : null}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingText}>
              <View style={styles.sectionHeader}>
                <Ionicons name="notifications-outline" size={22} color={theme.primary} />
                <Text style={styles.sectionTitle}>Notifications</Text>
              </View>
              <Text style={styles.description}>Afficher une alerte quand un sondage est cree, ferme ou vote.</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={updateNotifications}
              thumbColor={notificationsEnabled ? theme.primary : theme.textSubtle}
              trackColor={{ false: theme.surfaceMuted, true: theme.primarySoft }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.background,
      flex: 1,
    },
    content: {
      padding: 20,
      paddingBottom: 36,
    },
    kicker: {
      color: theme.primary,
      fontSize: 13,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    title: {
      color: theme.text,
      fontSize: 26,
      fontWeight: '800',
      lineHeight: 32,
      marginBottom: 16,
      marginTop: 6,
    },
    section: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 8,
      borderWidth: 1,
      marginBottom: 14,
      padding: 16,
    },
    sectionHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 17,
      fontWeight: '800',
    },
    segment: {
      backgroundColor: theme.surfaceMuted,
      borderRadius: 8,
      flexDirection: 'row',
      gap: 6,
      marginTop: 14,
      padding: 4,
    },
    segmentOption: {
      alignItems: 'center',
      borderRadius: 6,
      flex: 1,
      flexDirection: 'row',
      gap: 8,
      justifyContent: 'center',
      paddingVertical: 11,
    },
    segmentOptionSelected: {
      backgroundColor: theme.primary,
    },
    segmentText: {
      color: theme.textMuted,
      fontWeight: '800',
    },
    segmentTextSelected: {
      color: '#ffffff',
    },
    optionList: {
      gap: 8,
      marginTop: 14,
    },
    listOption: {
      alignItems: 'center',
      borderColor: theme.border,
      borderRadius: 8,
      borderWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 13,
    },
    listOptionSelected: {
      borderColor: theme.primary,
      backgroundColor: theme.primarySoft,
    },
    listOptionText: {
      color: theme.textMuted,
      fontWeight: '800',
    },
    listOptionTextSelected: {
      color: theme.text,
    },
    settingRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'space-between',
    },
    settingText: {
      flex: 1,
    },
    description: {
      color: theme.textSubtle,
      lineHeight: 20,
      marginTop: 8,
    },
  });
