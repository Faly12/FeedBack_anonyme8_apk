import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { signUp } from '../../services/authService';
import { useAppTheme } from '../../theme/AppThemeContext';

export default function RegisterScreen({ navigation }: any) {
  const { theme } = useAppTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nom, setNom] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nom.trim() || !email.trim() || !password) {
      Alert.alert('Formulaire incomplet', 'Renseignez votre nom, votre email et votre mot de passe.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Mot de passe trop court', 'Utilisez au moins 6 caracteres.');
      return;
    }

    setLoading(true);
    const { data, error } = await signUp({ email, password, nom });
    setLoading(false);

    if (error) {
      Alert.alert('Inscription incomplete', error.message);
      return;
    }

    if (data.session) {
      Alert.alert('Inscription reussie', 'Votre compte est connecte. Vous pouvez creer un sondage.');
      return;
    }

    Alert.alert('Inscription reussie', 'Verifiez votre e-mail, puis connectez-vous.');
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>Creer un compte</Text>
        <Input label="Nom" placeholder="Votre nom" value={nom} onChangeText={setNom} />
        <Input label="Email" placeholder="email@example.com" value={email} onChangeText={setEmail} />
        <Input
          label="Mot de passe"
          placeholder="********"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button title={loading ? 'Inscription...' : "S'inscrire"} onPress={handleRegister} disabled={loading} />
        <Text style={[styles.footer, { color: theme.primary }]} onPress={() => navigation.navigate('Login')}>
          Deja un compte ? Connexion
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
