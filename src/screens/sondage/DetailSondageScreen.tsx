import { useEffect, useMemo, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Loader } from '../../components/Loader';
import { useAuth } from '../../hooks/useAuth';
import { fermerSondage, fetchSondageById } from '../../services/sondageService';
import { createParticipation, submitVote } from '../../services/voteService';
import { Option, Sondage } from '../../types';
import { generateAnonymousToken } from '../../utils/helpers';

export default function DetailSondageScreen({ route, navigation }: any) {
  const { sondageId } = route.params;
  const { user } = useAuth();
  const [sondage, setSondage] = useState<Sondage | null>(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [passkey, setPasskey] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data, error } = await fetchSondageById(sondageId);

      if (error || !data) {
        Alert.alert('Erreur', error?.message ?? 'Sondage introuvable.');
        setLoading(false);
        return;
      }

      setSondage(data);
      setIsAuthorized(!data.passkey);
      setLoading(false);
    }

    loadData();
  }, [sondageId]);

  const sortedOptions = useMemo(
    () => [...(sondage?.option ?? [])].sort((a, b) => a.ordre_affichage - b.ordre_affichage),
    [sondage]
  );

  const totalOptions = sortedOptions.length;
  const isClosed = !sondage?.est_actif || !sondage?.play;

  const handleUnlock = () => {
    if (!sondage?.passkey || passkey.trim() === sondage.passkey) {
      setIsAuthorized(true);
      return;
    }

    Alert.alert('Accès bloqué', 'La clé saisie ne correspond pas à ce sondage.');
  };

  const handleVote = async () => {
    if (!sondage) {
      return;
    }

    if (isClosed) {
      Alert.alert('Sondage clôturé', 'Vous pouvez uniquement consulter les résultats.');
      return;
    }

    if (!selectedOption) {
      Alert.alert('Sélection obligatoire', 'Choisissez une option avant d’envoyer votre vote.');
      return;
    }

    setSubmitting(true);
    const token = generateAnonymousToken();
    const { error: voteError } = await submitVote(sondage.id, selectedOption, token);

    if (voteError) {
      setSubmitting(false);
      Alert.alert('Erreur', voteError.message);
      return;
    }

    if (user?.id) {
      await createParticipation(user.id, sondage.id, token);
    }

    setSubmitting(false);
    Alert.alert('Vote enregistré', 'Votre réponse a été envoyée avec un jeton anonyme.');
    navigation.navigate('Resultat', { sondageId: sondage.id });
  };

  const handleClose = async () => {
    if (!sondage) {
      return;
    }

    const { data, error } = await fermerSondage(sondage.id);

    if (error || !data) {
      Alert.alert('Erreur', error?.message ?? 'Impossible de fermer le sondage.');
      return;
    }

    setSondage(data);
    Alert.alert('Sondage clôturé', 'Les utilisateurs peuvent maintenant consulter les résultats.');
  };

  if (loading) {
    return <Loader />;
  }

  if (!sondage) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={[styles.status, isClosed ? styles.closedStatus : styles.activeStatus]}>
            <Text style={[styles.statusText, isClosed ? styles.closedStatusText : styles.activeStatusText]}>
              {isClosed ? 'Clôturé' : 'Actif'}
            </Text>
          </View>
          <Text style={styles.title}>{sondage.titre}</Text>
          <Text style={styles.description}>{sondage.description ?? 'Aucune description'}</Text>
          <Text style={styles.meta}>
            {totalOptions} option{totalOptions > 1 ? 's' : ''} · {sondage.passkey ? 'clé requise' : 'accès public'}
          </Text>
        </View>

        {!isAuthorized ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Authentification requise</Text>
            <Text style={styles.panelText}>
              Ce sondage demande une clé avant le vote. Pour la démo, essayez: {sondage.passkey}
            </Text>
            <Input label="Clé d’accès" placeholder="Saisir la clé du sondage" value={passkey} onChangeText={setPasskey} />
            <Button title="Débloquer le vote" onPress={handleUnlock} />
          </View>
        ) : (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>{isClosed ? 'Vote fermé' : 'Faire et envoyer le sondage'}</Text>
            {sortedOptions.map((item: Option) => (
              <TouchableOpacity
                key={item.id}
                disabled={isClosed}
                style={[styles.option, item.id === selectedOption && styles.optionSelected, isClosed && styles.optionDisabled]}
                onPress={() => setSelectedOption(item.id)}>
                <View style={[styles.radio, item.id === selectedOption && styles.radioSelected]} />
                <Text style={styles.optionText}>{item.libelle}</Text>
              </TouchableOpacity>
            ))}
            <Button title={submitting ? 'Envoi...' : 'Envoyer mon vote'} onPress={handleVote} disabled={submitting || isClosed} />
          </View>
        )}

        <View style={styles.secondaryActions}>
          <Button
            title="Consulter les résultats"
            onPress={() => navigation.navigate('Resultat', { sondageId: sondage.id })}
            style={styles.secondaryButton}
            textStyle={styles.secondaryButtonText}
          />
          {!isClosed ? (
            <Button
              title="Fermer le sondage"
              onPress={handleClose}
              style={styles.dangerButton}
              textStyle={styles.dangerButtonText}
            />
          ) : null}
        </View>
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
  header: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    padding: 18,
  },
  status: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  activeStatus: {
    backgroundColor: '#ccfbf1',
  },
  closedStatus: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  activeStatusText: {
    color: '#0f766e',
  },
  closedStatusText: {
    color: '#991b1b',
  },
  title: {
    color: '#111827',
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
  },
  description: {
    color: '#4b5563',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  meta: {
    color: '#6b7280',
    fontWeight: '700',
    marginTop: 14,
  },
  panel: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
    padding: 18,
  },
  panelTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  panelText: {
    color: '#4b5563',
    lineHeight: 21,
    marginBottom: 16,
  },
  option: {
    alignItems: 'center',
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
    padding: 14,
  },
  optionSelected: {
    backgroundColor: '#ecfdf5',
    borderColor: '#0f766e',
  },
  optionDisabled: {
    opacity: 0.7,
  },
  radio: {
    borderColor: '#9ca3af',
    borderRadius: 9,
    borderWidth: 2,
    height: 18,
    width: 18,
  },
  radioSelected: {
    backgroundColor: '#0f766e',
    borderColor: '#0f766e',
  },
  optionText: {
    color: '#111827',
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryActions: {
    gap: 10,
    marginTop: 16,
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderColor: '#0f766e',
    borderWidth: 1,
  },
  secondaryButtonText: {
    color: '#0f766e',
  },
  dangerButton: {
    backgroundColor: '#fff1f2',
    borderColor: '#fecdd3',
    borderWidth: 1,
  },
  dangerButtonText: {
    color: '#be123c',
  },
});
