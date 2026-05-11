import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Loader } from "../../components/Loader";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../notifications/NotificationContext";
import { fermerSondage, fetchSondageById } from "../../services/sondageService";
import { hasAlreadyVoted, submitVote } from "../../services/voteService";
import { useAppTheme } from "../../theme/AppThemeContext";
import { AppTheme } from "../../theme/colors";
import { Option, Sondage } from "../../types";
import { generateAnonymousToken } from "../../utils/helpers";

export default function DetailSondageScreen({ route, navigation }: any) {
  const { theme } = useAppTheme();
  const { addNotification } = useNotifications();
  const styles = createStyles(theme);
  const { sondageId } = route.params;
  const { user } = useAuth();
  const [sondage, setSondage] = useState<Sondage | null>(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [passkey, setPasskey] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyVoted, setAlreadyVoted] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data, error } = await fetchSondageById(sondageId);

      if (error || !data) {
        Alert.alert("Erreur", error?.message ?? "Sondage introuvable.");
        setLoading(false);
        return;
      }

      setSondage(data);
      setIsAuthorized(!data.passkey);
      setLoading(false);
    }

    loadData();
  }, [sondageId]);

  useEffect(() => {
    if (!sondage) {
      return;
    }

    const sondageIdToCheck = sondage.id;

    async function checkVoteStatus() {
      const voted = await hasAlreadyVoted(sondageIdToCheck, user?.id);
      setAlreadyVoted(voted);
    }

    checkVoteStatus();
  }, [sondage, user]);

  const sortedOptions = useMemo(
    () =>
      [...(sondage?.option ?? [])].sort(
        (a, b) => a.ordre_affichage - b.ordre_affichage,
      ),
    [sondage],
  );

  const totalOptions = sortedOptions.length;
  const isClosed = !sondage?.est_actif || !sondage?.play;

  const handleUnlock = () => {
    if (!sondage?.passkey || passkey.trim() === sondage.passkey) {
      setIsAuthorized(true);
      return;
    }

    Alert.alert(
      "Acces bloque",
      "La cle saisie ne correspond pas a ce sondage.",
    );
  };

  const handleVote = async () => {
    if (!sondage) {
      return;
    }

    if (isClosed) {
      Alert.alert(
        "Sondage cloture",
        "Vous pouvez uniquement consulter les resultats.",
      );
      return;
    }

    if (!selectedOption) {
      Alert.alert(
        "Selection obligatoire",
        "Choisissez une option avant d'envoyer votre vote.",
      );
      return;
    }

    setSubmitting(true);
    const token = generateAnonymousToken();
    const { error: voteError } = await submitVote(
      sondage.id,
      selectedOption,
      token,
      user?.id,
    );

    if (voteError) {
      setSubmitting(false);
      Alert.alert("Erreur", voteError.message);
      return;
    }

    setAlreadyVoted(true);
    setSubmitting(false);
    addNotification(
      "Vote enregistre",
      `Un vote anonyme a ete ajoute a "${sondage.titre}".`,
    );
    Alert.alert(
      "Vote enregistre",
      "Votre reponse a ete envoyee avec un jeton anonyme.",
    );
    navigation.navigate("Resultat", { sondageId: sondage.id });
  };

  const handleClose = async () => {
    if (!sondage) {
      return;
    }

    const { data, error } = await fermerSondage(sondage.id);

    if (error || !data) {
      Alert.alert(
        "Erreur",
        error?.message ?? "Impossible de fermer le sondage.",
      );
      return;
    }

    setSondage(data);
    addNotification(
      "Sondage ferme",
      `Le sondage "${sondage.titre}" a ete cloture.`,
    );
    Alert.alert(
      "Sondage cloture",
      "Les utilisateurs peuvent maintenant consulter les resultats.",
    );
  };

  if (loading) {
    return <Loader />;
  }

  if (!sondage) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View
            style={[
              styles.status,
              isClosed ? styles.closedStatus : styles.activeStatus,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isClosed ? styles.closedStatusText : styles.activeStatusText,
              ]}
            >
              {isClosed ? "Cloture" : "Actif"}
            </Text>
          </View>
          <Text style={styles.title}>{sondage.titre}</Text>
          <Text style={styles.description}>
            {sondage.description ?? "Aucune description"}
          </Text>
          <Text style={styles.meta}>
            {totalOptions} option{totalOptions > 1 ? "s" : ""} -{" "}
            {sondage.passkey ? "cle requise" : "acces public"}
          </Text>
        </View>

        {!isAuthorized ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Authentification requise</Text>
            <Text style={styles.panelText}>
              Ce sondage demande une cle avant le vote. Pour la demo, essayez:{" "}
              {sondage.passkey}
            </Text>
            <Input
              label="Cle d'acces"
              placeholder="Saisir la cle du sondage"
              value={passkey}
              onChangeText={setPasskey}
            />
            <Button title="Debloquer le vote" onPress={handleUnlock} />
          </View>
        ) : (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>
              {isClosed ? "Vote ferme" : "Faire et envoyer le sondage"}
            </Text>
            {alreadyVoted ? (
              <Text style={styles.alreadyVotedText}>
                Vous avez déjà voté pour ce sondage.
              </Text>
            ) : (
              sortedOptions.map((item: Option) => (
                <TouchableOpacity
                  key={item.id}
                  disabled={isClosed}
                  style={[
                    styles.option,
                    item.id === selectedOption && styles.optionSelected,
                    isClosed && styles.optionDisabled,
                  ]}
                  onPress={() => setSelectedOption(item.id)}
                >
                  <View
                    style={[
                      styles.radio,
                      item.id === selectedOption && styles.radioSelected,
                    ]}
                  />
                  <Text style={styles.optionText}>{item.libelle}</Text>
                </TouchableOpacity>
              ))
            )}
            <Button
              title={submitting ? "Envoi..." : "Envoyer mon vote"}
              onPress={handleVote}
              disabled={submitting || isClosed || alreadyVoted}
            />
          </View>
        )}

        <View style={styles.secondaryActions}>
          <Button
            title="Consulter les resultats"
            onPress={() =>
              navigation.navigate("Resultat", { sondageId: sondage.id })
            }
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

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    content: { padding: 20, paddingBottom: 36 },
    header: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 8,
      borderWidth: 1,
      padding: 18,
    },
    status: {
      alignSelf: "flex-start",
      borderRadius: 8,
      marginBottom: 12,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    activeStatus: { backgroundColor: theme.primarySoft },
    closedStatus: { backgroundColor: theme.dangerSoft },
    statusText: { fontSize: 12, fontWeight: "800" },
    activeStatusText: { color: theme.primary },
    closedStatusText: { color: theme.dangerText },
    title: {
      color: theme.text,
      fontSize: 26,
      fontWeight: "800",
      lineHeight: 32,
    },
    description: {
      color: theme.textMuted,
      fontSize: 15,
      lineHeight: 22,
      marginTop: 10,
    },
    meta: { color: theme.textSubtle, fontWeight: "700", marginTop: 14 },
    panel: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 8,
      borderWidth: 1,
      marginTop: 16,
      padding: 18,
    },
    panelTitle: {
      color: theme.text,
      fontSize: 18,
      fontWeight: "800",
      marginBottom: 8,
    },
    panelText: { color: theme.textMuted, lineHeight: 21, marginBottom: 16 },
    option: {
      alignItems: "center",
      borderColor: theme.borderStrong,
      borderRadius: 8,
      borderWidth: 1,
      flexDirection: "row",
      gap: 12,
      marginBottom: 10,
      padding: 14,
    },
    optionSelected: {
      backgroundColor: theme.primarySoft,
      borderColor: theme.primary,
    },
    optionDisabled: { opacity: 0.7 },
    radio: {
      borderColor: theme.textSubtle,
      borderRadius: 9,
      borderWidth: 2,
      height: 18,
      width: 18,
    },
    radioSelected: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    optionText: { color: theme.text, flex: 1, fontSize: 15, fontWeight: "700" },
    alreadyVotedText: {
      color: theme.primary,
      fontSize: 15,
      fontWeight: "700",
      marginBottom: 14,
    },
    secondaryActions: { gap: 10, marginTop: 16 },
    secondaryButton: {
      backgroundColor: theme.surface,
      borderColor: theme.primary,
      borderWidth: 1,
    },
    secondaryButtonText: { color: theme.primary },
    dangerButton: {
      backgroundColor: theme.dangerSoft,
      borderColor: theme.dangerBorder,
      borderWidth: 1,
    },
    dangerButtonText: { color: theme.danger },
  });
