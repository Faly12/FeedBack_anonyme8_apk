import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { signUp } from '../../services/authService';

export default function RegisterScreen({ navigation }: any) {
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
      Alert.alert('Mot de passe trop court', 'Utilisez au moins 6 caractères.');
      return;
    }

    setLoading(true);
    const { data, error } = await signUp({ email, password, nom });
    setLoading(false);

    if (error) {
      Alert.alert('Inscription incomplète', error.message);
      return;
    }

    if (data.session) {
      Alert.alert('Inscription réussie', 'Votre compte est connecté. Vous pouvez créer un sondage.');
      return;
    }

    Alert.alert('Inscription réussie', 'Vérifiez votre e-mail, puis connectez-vous.');
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Créer un compte</Text>
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
        <Text style={styles.footer} onPress={() => navigation.navigate('Login')}>
          Déjà un compte ? Connexion
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 24,
  },
  footer: {
    color: '#0f766e',
    fontWeight: '700',
    marginTop: 20,
    textAlign: 'center',
  },
});
