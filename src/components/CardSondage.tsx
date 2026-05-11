import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Sondage } from '../types';

type CardSondageProps = {
  sondage: Sondage;
  onPress: () => void;
};

function isSondageDisponible(sondage: Sondage) {
  const isOpen = sondage.est_actif !== false && sondage.play !== false;
  const isExpired = sondage.date_fermeture ? new Date(sondage.date_fermeture).getTime() < Date.now() : false;

  return isOpen && !isExpired;
}

export function CardSondage({ sondage, onPress }: CardSondageProps) {
  const optionCount = sondage.option?.length ?? 0;
  const disponible = isSondageDisponible(sondage);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.topRow}>
        <Text style={styles.title}>{sondage.titre}</Text>
        <View style={[styles.badge, disponible ? styles.badgeAvailable : styles.badgeUnavailable]}>
          <Text style={[styles.badgeText, disponible ? styles.badgeTextAvailable : styles.badgeTextUnavailable]}>
            {disponible ? 'Disponible' : 'Indisponible'}
          </Text>
        </View>
      </View>

      <Text style={styles.description}>{sondage.description ?? 'Aucune description'}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.meta}>{optionCount} option{optionCount > 1 ? 's' : ''}</Text>
        <Text style={styles.meta}>{sondage.est_public === false ? 'Privé' : 'Public'}</Text>
        <Text style={styles.meta}>{sondage.passkey ? 'Accès par clé' : 'Accès libre'}</Text>
        <Text style={styles.meta}>{sondage.type_vote === 'unique' ? 'Vote unique' : 'Vote multiple'}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  topRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  title: {
    color: '#111827',
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  description: {
    color: '#4b5563',
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  meta: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    color: '#374151',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeAvailable: {
    backgroundColor: '#ccfbf1',
  },
  badgeUnavailable: {
    backgroundColor: '#fee2e2',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  badgeTextAvailable: {
    color: '#0f766e',
  },
  badgeTextUnavailable: {
    color: '#991b1b',
  },
});
