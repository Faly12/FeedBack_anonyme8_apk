import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../notifications/NotificationContext';
import { createSondage } from '../../services/sondageService';
import { useAppTheme } from '../../theme/AppThemeContext';
import { AppTheme } from '../../theme/colors';

export default function CreateSondageScreen({ navigation }: any) {
  const { user } = useAuth();
  const { theme } = useAppTheme();
  const { addNotification } = useNotifications();
  const styles = createStyles(theme);
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '', '']);
  const [isPublic, setIsPublic] = useState(true);
  const [needsPasskey, setNeedsPasskey] = useState(false);
  const [passkey, setPasskey] = useState('');
  const [publishing, setPublishing] = useState(false);

  const updateOption = (text: string, index: number) => {
    setOptions((current) => current.map((item, itemIndex) => (itemIndex === index ? text : item)));
  };

  const addOption = () => {
    if (options.length >= 6) {
      Alert.alert('Limite atteinte', 'Le prototype accepte six options maximum.');
      return;
    }

    setOptions((current) => [...current, '']);
  };

  const handleCreate = async () => {
    const cleanOptions = options.map((option) => option.trim()).filter(Boolean);

    if (!user?.id) {
      Alert.alert('Connexion requise', 'Connectez-vous avant de creer un sondage dans Supabase.');
      return;
    }

    if (!titre.trim() || cleanOptions.length < 2) {
      Alert.alert('Formulaire incomplet', 'Renseignez un titre et au moins deux options.');
      return;
    }

    if (needsPasskey && !passkey.trim()) {
      Alert.alert('Cle requise', "Ajoutez une cle ou desactivez l'acces par cle.");
      return;
    }

    setPublishing(true);

    const sondagePayload = {
      titre: titre.trim(),
      description: description.trim(),
      id_auteur: user.id,
      est_public: isPublic,
      passkey: needsPasskey ? passkey.trim() : null,
      max_choix: 1,
      type_vote: 'unique',
      play: true,
    };

    const optionPayload = cleanOptions.map((libelle, index) => ({
      libelle,
      id_sondage: '',
      ordre_affichage: index + 1,
    }));

    const { error, source, warning } = await createSondage(sondagePayload, optionPayload);

    setPublishing(false);

    if (error) {
      Alert.alert('Erreur', error.message);
      return;
    }

    if (source === 'prototype') {
      addNotification('Sondage cree', `Le sondage "${titre.trim()}" a ete enregistre en local.`);
      Alert.alert(
        'Sondage cree en local',
        `${warning ?? 'Insertion Supabase indisponible.'}\n\nIl sera visible dans l'interface, mais pas dans la base.`
      );
      navigation.goBack();
      return;
    }

    addNotification('Sondage cree', `Le sondage "${titre.trim()}" est pret a recevoir des votes.`);
    Alert.alert('Sondage cree', 'Votre sondage est pret a recevoir des votes anonymes et a ete enregistre dans Supabase.');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.kicker}>Auteur du sondage</Text>
        <Text style={styles.title}>Creer un nouveau sondage</Text>

        <View style={styles.panel}>
          <Input label="Titre" placeholder="Ex: Satisfaction du cours" value={titre} onChangeText={setTitre} />
          <Input
            label="Description"
            placeholder="Expliquez le contexte du vote"
            value={description}
            onChangeText={setDescription}
          />

          <View style={styles.settingRow}>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Sondage public</Text>
              <Text style={styles.settingDescription}>Visible dans la liste des sondages consultables.</Text>
            </View>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              thumbColor={isPublic ? theme.primary : theme.textSubtle}
              trackColor={{ false: theme.surfaceMuted, true: theme.primarySoft }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Cle avant vote</Text>
              <Text style={styles.settingDescription}>Simule une authentification avant le vote.</Text>
            </View>
            <Switch
              value={needsPasskey}
              onValueChange={setNeedsPasskey}
              thumbColor={needsPasskey ? theme.primary : theme.textSubtle}
              trackColor={{ false: theme.surfaceMuted, true: theme.primarySoft }}
            />
          </View>

          {needsPasskey ? (
            <Input label="Cle d'acces" placeholder="Ex: atelier2026" value={passkey} onChangeText={setPasskey} />
          ) : null}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Options de vote</Text>
          {options.map((option, index) => (
            <Input
              key={`option-${index}`}
              label={`Option ${index + 1}`}
              placeholder={index < 2 ? 'Option obligatoire' : 'Option facultative'}
              value={option}
              onChangeText={(text) => updateOption(text, index)}
            />
          ))}
          <Button
            title="Ajouter une option"
            onPress={addOption}
            style={styles.secondaryButton}
            textStyle={styles.secondaryButtonText}
          />
        </View>

        <Button title={publishing ? 'Publication...' : 'Publier le sondage'} onPress={handleCreate} disabled={publishing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
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
    panel: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 8,
      borderWidth: 1,
      marginBottom: 14,
      padding: 16,
    },
    panelTitle: {
      color: theme.text,
      fontSize: 18,
      fontWeight: '800',
      marginBottom: 14,
    },
    settingRow: {
      alignItems: 'center',
      borderTopColor: theme.surfaceMuted,
      borderTopWidth: 1,
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'space-between',
      paddingVertical: 14,
    },
    settingText: {
      flex: 1,
    },
    settingTitle: {
      color: theme.text,
      fontWeight: '800',
    },
    settingDescription: {
      color: theme.textSubtle,
      marginTop: 3,
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
