import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../notifications/NotificationContext';
import { signOut } from '../../services/authService';
import { useAppTheme } from '../../theme/AppThemeContext';
import { AppTheme } from '../../theme/colors';

export default function ProfileScreen() {
  const { user } = useAuth();
  const { theme } = useAppTheme();
  const { addNotification } = useNotifications();
  const styles = createStyles(theme);

  const handleSignOut = async () => {
    addNotification('Deconnexion', 'Votre session a ete fermee.');
    await signOut();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.kicker}>Acteur UML</Text>
        <Text style={styles.title}>Auteur du sondage</Text>
        <Text style={styles.description}>
          Ce profil represente le compte administrateur qui cree, ferme et consulte les resultats des sondages.
          Le votant final peut participer anonymement depuis la liste des sondages.
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email ?? 'admin.prototype@feedback.local'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Nom</Text>
          <Text style={styles.value}>{user?.user_metadata?.nom ?? 'Auteur du sondage'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Mode</Text>
          <Text style={styles.value}>Prototype avec donnees Supabase ou locales</Text>
        </View>
      </View>

      <Button
        title="Se deconnecter"
        onPress={handleSignOut}
        style={styles.secondaryButton}
        textStyle={styles.secondaryButtonText}
      />
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 20,
    },
    card: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 8,
      borderWidth: 1,
      marginBottom: 16,
      padding: 18,
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
      marginTop: 6,
    },
    description: {
      color: theme.textMuted,
      lineHeight: 22,
      marginTop: 10,
    },
    infoRow: {
      borderTopColor: theme.surfaceMuted,
      borderTopWidth: 1,
      marginTop: 14,
      paddingTop: 14,
    },
    label: {
      color: theme.textSubtle,
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    value: {
      color: theme.text,
      fontSize: 15,
      fontWeight: '700',
      marginTop: 4,
    },
    secondaryButton: {
      backgroundColor: theme.surface,
      borderColor: theme.primary,
      borderWidth: 1,
    },
    secondaryButtonText: {
      color: theme.primary,
    },
  });
