import { useEffect, useMemo, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Loader } from '../../components/Loader';
import { fetchSondageById } from '../../services/sondageService';
import { fetchResults } from '../../services/voteService';
import { useAppTheme } from '../../theme/AppThemeContext';
import { AppTheme } from '../../theme/colors';
import { Option, Sondage } from '../../types';

export default function ResultatScreen({ route }: any) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const { sondageId } = route.params;
  const [results, setResults] = useState<Record<string, number>>({});
  const [sondage, setSondage] = useState<Sondage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResults() {
      const [{ data: sondageData, error: sondageError }, { data: counts, error: countError }] = await Promise.all([
        fetchSondageById(sondageId),
        fetchResults(sondageId),
      ]);

      if (sondageError || countError || !sondageData) {
        Alert.alert('Erreur', sondageError?.message ?? countError?.message ?? 'Impossible de charger les resultats.');
        setLoading(false);
        return;
      }

      setSondage(sondageData);
      setResults(counts ?? {});
      setLoading(false);
    }

    loadResults();
  }, [sondageId]);

  const options = useMemo(
    () => [...(sondage?.option ?? [])].sort((a, b) => a.ordre_affichage - b.ordre_affichage),
    [sondage]
  );
  const totalVotes = Object.values(results).reduce((total, count) => total + count, 0);

  if (loading) {
    return <Loader />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>Consultation des resultats</Text>
        <Text style={styles.title}>{sondage?.titre ?? 'Resultats'}</Text>
        <Text style={styles.description}>
          Les votes sont agreges par option. Le jeton anonyme permet de compter la participation sans afficher
          le votant.
        </Text>

        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalVotes}</Text>
            <Text style={styles.summaryLabel}>vote{totalVotes > 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{options.length}</Text>
            <Text style={styles.summaryLabel}>option{options.length > 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{sondage?.est_actif ? 'Oui' : 'Non'}</Text>
            <Text style={styles.summaryLabel}>actif</Text>
          </View>
        </View>

        <View style={styles.panel}>
          {options.length ? (
            options.map((item: Option) => {
              const count = results[item.id] ?? 0;
              const percentage = totalVotes ? Math.round((count / totalVotes) * 100) : 0;

              return (
                <View key={item.id} style={styles.resultItem}>
                  <View style={styles.resultHeader}>
                    <Text style={styles.option}>{item.libelle}</Text>
                    <Text style={styles.count}>
                      {count} vote{count > 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${percentage}%` }]} />
                  </View>
                  <Text style={styles.percentage}>{percentage}%</Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.empty}>Aucune donnee de resultat.</Text>
          )}
        </View>
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
      marginTop: 6,
    },
    description: {
      color: theme.textMuted,
      lineHeight: 22,
      marginTop: 10,
    },
    summary: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 18,
    },
    summaryItem: {
      flex: 1,
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 8,
      borderWidth: 1,
      padding: 12,
    },
    summaryValue: {
      color: theme.text,
      fontSize: 20,
      fontWeight: '800',
    },
    summaryLabel: {
      color: theme.textSubtle,
      fontSize: 12,
      marginTop: 3,
    },
    panel: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 8,
      borderWidth: 1,
      marginTop: 16,
      padding: 16,
    },
    resultItem: {
      marginBottom: 18,
    },
    resultHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 10,
      justifyContent: 'space-between',
    },
    option: {
      color: theme.text,
      flex: 1,
      fontSize: 15,
      fontWeight: '800',
    },
    count: {
      color: theme.textMuted,
      fontWeight: '700',
    },
    barTrack: {
      backgroundColor: theme.surfaceMuted,
      borderRadius: 8,
      height: 12,
      marginTop: 10,
      overflow: 'hidden',
    },
    barFill: {
      backgroundColor: theme.primary,
      borderRadius: 8,
      height: '100%',
    },
    percentage: {
      color: theme.textSubtle,
      fontSize: 12,
      fontWeight: '700',
      marginTop: 6,
    },
    empty: {
      color: theme.textSubtle,
      textAlign: 'center',
    },
  });
