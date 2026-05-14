import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useNotifications } from '../../notifications/NotificationContext';
import { resetPassword } from '../../services/authService';
import { useAppTheme } from '../../theme/AppThemeContext';

export default function ForgotPasswordScreen({ navigation }: any) {
  const { theme } = useAppTheme();
  const { addNotification } = useNotifications();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      Alert.alert('Email requis', 'Veuillez entrer votre adresse email.');
      return;
    }

    if (!emailRegex.test(email.trim())) {
      Alert.alert('Email invalide', 'Veuillez entrer une adresse email valide.');
      return;
    }

    setLoading(true);
    const { error } = await resetPassword({ email });
    setLoading(false);

    if (error) {
      Alert.alert('Erreur', error.message);
      return;
    }

    addNotification(
      'Email de réinitialisation envoyé',
      'Consultez votre boîte de réception pour réinitialiser votre mot de passe.'
    );
    Alert.alert(
      'Email envoyé',
      'Nous vous avons envoyé un lien pour réinitialiser votre mot de passe.'
    );
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Mot de passe oublié</Text>
         <Text style={[styles.description, { color: theme.textSubtle }]}>
           Entrez votre adresse email pour recevoir un lien de réinitialisation.
         </Text>
         <Input label="Email" placeholder="email@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Button title={loading ? 'Envoi...' : 'Envoyer le lien'} onPress={handleResetPassword} disabled={loading} />
        <Text style={[styles.footer, { color: theme.primary }]} onPress={() => navigation.goBack()}>
          Retour à la connexion
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
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
  },
   description: {
     fontSize: 14,
     marginBottom: 24,
     textAlign: 'center',
   },
  footer: {
    fontWeight: '700',
    marginTop: 20,
    textAlign: 'center',
  },
});