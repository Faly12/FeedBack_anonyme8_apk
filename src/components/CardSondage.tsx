import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../theme/AppThemeContext';
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
  const { theme } = useAppTheme();
  const optionCount = sondage.option?.length ?? 0;
  const disponible = isSondageDisponible(sondage);
  const metaStyle = [styles.meta, { backgroundColor: theme.surfaceMuted, color: theme.textMuted }];

  return (
    <Pressable style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={onPress}>
      <View style={styles.topRow}>
        <Text style={[styles.title, { color: theme.text }]}>{sondage.titre}</Text>
        <View style={[styles.badge, { backgroundColor: disponible ? theme.primarySoft : theme.dangerSoft }]}>
          <Text style={[styles.badgeText, { color: disponible ? theme.primary : theme.dangerText }]}>
            {disponible ? 'Disponible' : 'Indisponible'}
          </Text>
        </View>
      </View>

      <Text style={[styles.description, { color: theme.textMuted }]}>{sondage.description ?? 'Aucune description'}</Text>

      <View style={styles.metaRow}>
        <Text style={metaStyle}>
          {optionCount} option{optionCount > 1 ? 's' : ''}
        </Text>
        <Text style={metaStyle}>{sondage.est_public === false ? 'Prive' : 'Public'}</Text>
        <Text style={metaStyle}>{sondage.passkey ? 'Acces par cle' : 'Acces libre'}</Text>
        <Text style={metaStyle}>{sondage.type_vote === 'unique' ? 'Vote unique' : 'Vote multiple'}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
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
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  description: {
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
    borderRadius: 8,
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
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
