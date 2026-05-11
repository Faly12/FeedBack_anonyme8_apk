import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useNotifications } from '../../notifications/NotificationContext';
import { signIn } from '../../services/authService';
import { useAppTheme } from '../../theme/AppThemeContext';

export default function LoginScreen({ navigation }: any) {
  const { theme } = useAppTheme();
  const { addNotification } = useNotifications();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Formulaire incomplet', 'Renseignez votre email et votre mot de passe.');
      return;
    }

    setLoading(true);
    const { error } = await signIn({ email, password });
    setLoading(false);

    if (error) {
      Alert.alert('Connexion impossible', error.message);
      return;
    }

    addNotification('Connexion reussie', 'Vous etes connecte a votre espace de gestion.');
    Alert.alert('Connexion reussie', 'Vous pouvez maintenant creer et gerer vos sondages.');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>Connexion</Text>
        <Input label="Email" placeholder="email@example.com" value={email} onChangeText={setEmail} />
        <Input
          label="Mot de passe"
          placeholder="********"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button title={loading ? 'Connexion...' : 'Se connecter'} onPress={handleLogin} disabled={loading} />
        <Text style={[styles.footer, { color: theme.primary }]} onPress={() => navigation.navigate('Register')}>
          Pas encore de compte ? Inscription
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 24,
  },
  footer: {
    fontWeight: '700',
    marginTop: 20,
    textAlign: 'center',
  },
});
