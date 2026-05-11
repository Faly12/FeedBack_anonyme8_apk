import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { useAuth } from '../../hooks/useAuth';
import { signOut } from '../../services/authService';

export default function ProfileScreen() {
  const { user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.kicker}>Acteur UML</Text>
        <Text style={styles.title}>Auteur du sondage</Text>
        <Text style={styles.description}>
          Ce profil représente l’administrateur qui crée, ferme et consulte les résultats des sondages.
          L’utilisateur final peut voter anonymement depuis la liste des sondages.
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
          <Text style={styles.value}>Prototype avec données Supabase ou locales</Text>
        </View>
      </View>

      <Button
        title="Se déconnecter"
        onPress={handleSignOut}
        style={styles.secondaryButton}
        textStyle={styles.secondaryButtonText}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    padding: 18,
  },
  kicker: {
    color: '#0f766e',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: '#111827',
    fontSize: 26,
    fontWeight: '800',
    marginTop: 6,
  },
  description: {
    color: '#4b5563',
    lineHeight: 22,
    marginTop: 10,
  },
  infoRow: {
    borderTopColor: '#f3f4f6',
    borderTopWidth: 1,
    marginTop: 14,
    paddingTop: 14,
  },
  label: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  value: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderColor: '#0f766e',
    borderWidth: 1,
  },
  secondaryButtonText: {
    color: '#0f766e',
  },
});
