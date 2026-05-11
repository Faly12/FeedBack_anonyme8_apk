import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../hooks/useAuth';
import { createSondage } from '../../services/sondageService';

export default function CreateSondageScreen({ navigation }: any) {
  const { user } = useAuth();
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
      Alert.alert('Connexion requise', 'Connectez-vous avant de créer un sondage dans Supabase.');
      return;
    }

    if (!titre.trim() || cleanOptions.length < 2) {
      Alert.alert('Formulaire incomplet', 'Renseignez un titre et au moins deux options.');
      return;
    }

    if (needsPasskey && !passkey.trim()) {
      Alert.alert('Clé requise', 'Ajoutez une clé ou désactivez l’accès par clé.');
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
      Alert.alert(
        'Sondage créé en local',
        `${warning ?? 'Insertion Supabase indisponible.'}\n\nIl sera visible dans l’interface, mais pas dans la base.`
      );
      navigation.goBack();
      return;
    }

    Alert.alert('Sondage créé', 'Votre sondage est prêt à recevoir des votes anonymes et a été enregistré dans Supabase.');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.kicker}>Auteur du sondage</Text>
        <Text style={styles.title}>Créer un nouveau sondage</Text>

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
            <Switch value={isPublic} onValueChange={setIsPublic} trackColor={{ true: '#99f6e4' }} />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Clé avant vote</Text>
              <Text style={styles.settingDescription}>Simule l’étape “authentifier pour faire”.</Text>
            </View>
            <Switch value={needsPasskey} onValueChange={setNeedsPasskey} trackColor={{ true: '#99f6e4' }} />
          </View>

          {needsPasskey ? (
            <Input label="Clé d’accès" placeholder="Ex: atelier2026" value={passkey} onChangeText={setPasskey} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
    paddingBottom: 36,
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
    lineHeight: 32,
    marginBottom: 16,
    marginTop: 6,
  },
  panel: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
  },
  panelTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  settingRow: {
    alignItems: 'center',
    borderTopColor: '#f3f4f6',
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
    color: '#111827',
    fontWeight: '800',
  },
  settingDescription: {
    color: '#6b7280',
    marginTop: 3,
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
