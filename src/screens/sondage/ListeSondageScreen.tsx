import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button } from "../../components/Button";
import { CardSondage } from "../../components/CardSondage";
import { Loader } from "../../components/Loader";
import { fetchSondages } from "../../services/sondageService";
import { useAppTheme } from "../../theme/AppThemeContext";
import { AppTheme } from "../../theme/colors";
import { Sondage } from "../../types";

function isSondageDisponible(sondage: Sondage) {
  const isOpen = sondage.est_actif !== false && sondage.play !== false;
  const isExpired = sondage.date_fermeture
    ? new Date(sondage.date_fermeture).getTime() < Date.now()
    : false;

  return isOpen && !isExpired;
}

export default function ListeSondageScreen({ navigation }: any) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const [sondages, setSondages] = useState<Sondage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSondages = useCallback(async () => {
    const { data, error } = await fetchSondages();

    if (!error) {
      setSondages(data ?? []);
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSondages();
    }, [loadSondages]),
  );

  const availableCount = sondages.filter(isSondageDisponible).length;
  const optionCount = sondages.reduce(
    (total, item) => total + (item.option?.length ?? 0),
    0,
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={sondages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadSondages();
            }}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.actions}>
              <Button
                title="Creer un sondage"
                onPress={() => navigation.navigate("CreateSondage")}
                style={styles.primaryAction}
              />
            </View>
            <View style={styles.metrics}>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>{sondages.length}</Text>
                <Text style={styles.metricLabel}>crees</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>{availableCount}</Text>
                <Text style={styles.metricLabel}>disponibles</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>{optionCount}</Text>
                <Text style={styles.metricLabel}>options</Text>
              </View>
            </View>
            <Text style={styles.sectionTitle}>Tous les sondages</Text>
          </View>
        }
        renderItem={({ item }) => (
          <CardSondage
            sondage={item}
            onPress={() =>
              navigation.navigate("DetailSondage", { sondageId: item.id })
            }
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Aucun sondage cree.</Text>
        }
      />
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
      fontWeight: "700",
      marginBottom: 8,
      textTransform: "uppercase",
    },
    title: {
      color: theme.text,
      fontSize: 28,
      fontWeight: "800",
      lineHeight: 34,
    },
    actions: {
      marginTop: 18,
    },
    primaryAction: {
      backgroundColor: theme.primary,
      borderRadius: 8,
    },
    metrics: {
      flexDirection: "row",
      gap: 10,
      marginTop: 18,
    },
    metric: {
      flex: 1,
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 8,
      borderWidth: 1,
      padding: 12,
    },
    metricValue: {
      color: theme.text,
      fontSize: 22,
      fontWeight: "800",
    },
    metricLabel: {
      color: theme.textSubtle,
      fontSize: 12,
      marginTop: 3,
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 18,
      fontWeight: "800",
      marginBottom: 12,
      marginTop: 24,
    },
    empty: {
      color: theme.textSubtle,
      marginTop: 24,
      textAlign: "center",
    },
  });
