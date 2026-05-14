import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../../components/Button";
import { Loader } from "../../components/Loader";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../notifications/NotificationContext";
import {
  fermerSondage,
  fetchSondageById,
  updateSondage,
  deleteOption,
  addOption,
} from "../../services/sondageService";
import { hasAlreadyVoted, submitVote } from "../../services/voteService";
import { useAppTheme } from "../../theme/AppThemeContext";
import { AppTheme } from "../../theme/colors";
import { Option, Sondage } from "../../types";
import { generateAnonymousToken } from "../../utils/helpers";

export default function EditSondageScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { user } = useAuth();
  const { theme } = useAppTheme();
  const { addNotification } = useNotifications();
  const styles = createStyles(theme);
  
  const [sondage, setSondage] = useState<Sondage | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitre, setEditTitre] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editOptions, setEditOptions] = useState<Option[]>([]);
  const [newOptionLabel, setNewOptionLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPasskey, setShowPasskey] = useState(false); // ✅ État pour afficher/masquer le passkey

  const loadSondage = useCallback(async () => {
    setLoading(true);
    const { data, error } = await fetchSondageById(id);
    if (data) {
      setSondage(data);
      setEditTitre(data.titre || "");
      setEditDescription(data.description || "");
      setEditOptions(data.option || []);
      if (user) {
        const voted = await hasAlreadyVoted(id, user.id);
        setHasVoted(voted);
      }
    } else {
      Alert.alert("Erreur", "Impossible de charger le sondage.");
      navigation.goBack();
    }
    setLoading(false);
  }, [id, user, navigation]);

  useEffect(() => {
    loadSondage();
  }, [loadSondage]);

  const isOwner = useMemo(() => {
    return user && sondage && sondage.id_auteur === user.id;
  }, [user, sondage]);

  const isClosed = useMemo(() => {
    return !sondage?.est_actif;
  }, [sondage]);

  const handleSave = async () => {
    if (!sondage) return;
    setSaving(true);
    const { data, error } = await updateSondage(id, {
      titre: editTitre,
      description: editDescription,
    });
    if (error) {
      Alert.alert("Erreur", "Impossible de modifier le sondage.");
    } else {
      setSondage((prev) =>
        prev ? { ...prev, titre: editTitre, description: editDescription } : null
      );
      setIsEditing(false);
      addNotification("Modifié", "Le sondage a été mis à jour.");
    }
    setSaving(false);
  };

  const handleAddOption = async () => {
    if (!newOptionLabel.trim()) return;
    const { data, error } = await addOption(id, {
      libelle: newOptionLabel.trim(),
      ordre_affichage: editOptions.length + 1,
    });
    if (error) {
      Alert.alert("Erreur", "Impossible d'ajouter l'option.");
    } else if (data) {
      setEditOptions((prev) => [...prev, data]);
      setNewOptionLabel("");
      setSondage((prev) =>
        prev ? { ...prev, option: [...(prev.option || []), data] } : null
      );
    }
  };

  const handleDeleteOption = (optionId: string) => {
    Alert.alert("Confirmer", "Supprimer cette option ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          const { error } = await deleteOption(optionId);
          if (error) {
            Alert.alert("Erreur", "Impossible de supprimer l'option.");
          } else {
            setEditOptions((prev) => prev.filter((o) => o.id !== optionId));
            setSondage((prev) =>
              prev
                ? {
                    ...prev,
                    option: (prev.option || []).filter((o) => o.id !== optionId),
                  }
                : null
            );
          }
        },
      },
    ]);
  };

  const handleVote = async () => {
    if (!sondage || !selectedOption) {
      Alert.alert("Sélection obligatoire", "Choisissez une option avant de voter.");
      return;
    }
    const token = generateAnonymousToken();
    const { error } = await submitVote(sondage.id, selectedOption, token, user?.id);
    if (error) {
      Alert.alert("Erreur", error.message);
    } else {
      setHasVoted(true);
      addNotification("Vote enregistré", "Votre réponse a été envoyée.");
    }
  };

  const handleClose = () => {
    Alert.alert("Confirmer", "Êtes-vous sûr de vouloir fermer ce sondage ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Fermer",
        onPress: async () => {
          const { data, error } = await fermerSondage(id);
          if (error) {
            Alert.alert("Erreur", "Impossible de fermer le sondage.");
          } else if (data) {
            setSondage(data);
            addNotification("Fermé", "Le sondage a été clôturé.");
          }
        },
      },
    ]);
  };

  if (loading) return <Loader />;
  if (!sondage) return null;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Status Badge */}
          <View style={styles.statusBar}>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: isClosed
                    ? theme.dangerSoft
                    : theme.successSoft || theme.primarySoft,
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  {
                    color: isClosed
                      ? theme.dangerText
                      : theme.successText || theme.primary,
                  },
                ]}
              >
                {isClosed ? "Clôturé" : "Actif"}
              </Text>
            </View>
            {isOwner && !isEditing && (
              <TouchableOpacity
                style={[styles.editToggle, { borderColor: theme.primary }]}
                onPress={() => setIsEditing(true)}
              >
                <Text style={[styles.editToggleText, { color: theme.primary }]}>
                  Modifier
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {isEditing ? (
            <View
              style={[
                styles.editPanel,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={[styles.label, { color: theme.textSubtle }]}>
                Titre
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                value={editTitre}
                onChangeText={setEditTitre}
                placeholder="Titre du sondage"
                placeholderTextColor={theme.textMuted}
                selectionColor={theme.primary}
              />

              <Text style={[styles.label, { color: theme.textSubtle }]}>
                Description
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="Description du sondage"
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={3}
                selectionColor={theme.primary}
              />

              <Text style={[styles.label, { color: theme.textSubtle }]}>
                Options
              </Text>
              {editOptions.map((option, index) => (
                <View
                  key={option.id}
                  style={[
                    styles.optionRow,
                    { borderBottomColor: theme.surfaceMuted },
                  ]}
                >
                  <Text style={[styles.optionNumber, { color: theme.textSubtle }]}>
                    {index + 1}.
                  </Text>
                  <Text style={[styles.optionLabel, { color: theme.text }]}>
                    {option.libelle}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteOption(option.id)}
                    style={[
                      styles.deleteButton,
                      { backgroundColor: theme.dangerSoft },
                    ]}
                  >
                    <Text style={[styles.deleteText, { color: theme.dangerText }]}>
                      ✕
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}

              <View style={styles.addOptionRow}>
                <TextInput
                  style={[
                    styles.input,
                    styles.newOptionInput,
                    {
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                      color: theme.text,
                    },
                  ]}
                  value={newOptionLabel}
                  onChangeText={setNewOptionLabel}
                  placeholder="Nouvelle option"
                  placeholderTextColor={theme.textMuted}
                  selectionColor={theme.primary}
                />
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    { backgroundColor: theme.primarySoft },
                  ]}
                  onPress={handleAddOption}
                >
                  <Text style={[styles.addButtonText, { color: theme.primary }]}>
                    +
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.editActions}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.cancelButton,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={() => {
                    setIsEditing(false);
                    setEditTitre(sondage.titre || "");
                    setEditDescription(sondage.description || "");
                    setEditOptions(sondage.option || []);
                  }}
                >
                  <Text style={[styles.actionButtonText, { color: theme.text }]}>
                    Annuler
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.saveButton,
                    { backgroundColor: theme.primary },
                  ]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  <Text
                    style={[
                      styles.actionButtonText,
                      { color: theme.onPrimary || "#fff" },
                    ]}
                  >
                    {saving ? "Sauvegarde..." : "Sauvegarder"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <Text style={[styles.title, { color: theme.text }]}>
                {sondage.titre}
              </Text>
              <Text style={[styles.description, { color: theme.textMuted }]}>
                {sondage.description || "Aucune description"}
              </Text>

              {/* ✅ PASSKEY - Visible uniquement pour le propriétaire */}
              {isOwner && sondage.passkey && (
                <View
                  style={[
                    styles.passkeyContainer,
                    { backgroundColor: theme.primarySoft, borderColor: theme.primary },
                  ]}
                >
                  <View style={styles.passkeyHeader}>
                    <Text style={[styles.passkeyLabel, { color: theme.primary }]}>
                      🔑 Clé d'accès
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowPasskey(!showPasskey)}
                      style={[
                        styles.passkeyToggle,
                        { backgroundColor: theme.primary },
                      ]}
                    >
                      <Text style={[styles.passkeyToggleText, { color: theme.onPrimary || "#fff" }]}>
                        {showPasskey ? "Masquer" : "Afficher"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {showPasskey ? (
                    <Text style={[styles.passkeyValue, { color: theme.text }]}>
                      {sondage.passkey}
                    </Text>
                  ) : (
                    <Text style={[styles.passkeyHidden, { color: theme.textMuted }]}>
                      ••••••••
                    </Text>
                  )}
                  <Text style={[styles.passkeyHint, { color: theme.textSubtle }]}>
                    Partagez cette clé avec les participants pour restreindre l'accès au sondage.
                  </Text>
                </View>
              )}

              {/* Meta Info */}
              <View style={styles.metaRow}>
                <View
                  style={[
                    styles.metaBadge,
                    {
                      backgroundColor: theme.surfaceMuted,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text style={[styles.metaText, { color: theme.textSubtle }]}>
                    {sondage.option?.length ?? 0} option
                    {(sondage.option?.length ?? 0) > 1 ? "s" : ""}
                  </Text>
                </View>
                <View
                  style={[
                    styles.metaBadge,
                    {
                      backgroundColor: theme.surfaceMuted,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text style={[styles.metaText, { color: theme.textSubtle }]}>
                    {sondage.est_public === false ? "Privé" : "Public"}
                  </Text>
                </View>
                <View
                  style={[
                    styles.metaBadge,
                    {
                      backgroundColor: theme.surfaceMuted,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text style={[styles.metaText, { color: theme.textSubtle }]}>
                    {sondage.passkey ? "Accès par clé" : "Accès libre"}
                  </Text>
                </View>
              </View>

              {/* Options */}
              <View style={styles.optionsSection}>
                {sondage.option?.map((option: Option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: theme.surface,
                        borderColor:
                          selectedOption === option.id
                            ? theme.primary
                            : theme.border,
                      },
                      selectedOption === option.id && {
                        backgroundColor: theme.primarySoft,
                      },
                    ]}
                    onPress={() => setSelectedOption(option.id)}
                    disabled={hasVoted || isClosed}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.radio,
                        {
                          borderColor:
                            selectedOption === option.id
                              ? theme.primary
                              : theme.textSubtle,
                        },
                        selectedOption === option.id && {
                          backgroundColor: theme.primary,
                          borderColor: theme.primary,
                        },
                      ]}
                    />
                    <Text style={[styles.optionText, { color: theme.text }]}>
                      {option.libelle}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Actions */}
              {!isOwner && !hasVoted && !isClosed && (
                <TouchableOpacity
                  style={[
                    styles.voteButton,
                    {
                      backgroundColor: selectedOption
                        ? theme.primary
                        : theme.surfaceMuted,
                    },
                  ]}
                  onPress={handleVote}
                  disabled={!selectedOption}
                >
                  <Text
                    style={[
                      styles.voteButtonText,
                      {
                        color: selectedOption
                          ? theme.onPrimary || "#fff"
                          : theme.textMuted,
                      },
                    ]}
                  >
                    Voter
                  </Text>
                </TouchableOpacity>
              )}

              {hasVoted && (
                <View
                  style={[
                    styles.infoBox,
                    { backgroundColor: theme.successSoft || theme.primarySoft },
                  ]}
                >
                  <Text
                    style={[
                      styles.infoBoxText,
                      {
                        color: theme.successText || theme.primary,
                      },
                    ]}
                  >
                    ✓ Vous avez déjà voté
                  </Text>
                </View>
              )}

              {isClosed && (
                <View
                  style={[styles.infoBox, { backgroundColor: theme.dangerSoft }]}
                >
                  <Text
                    style={[styles.infoBoxText, { color: theme.dangerText }]}
                  >
                    Sondage clôturé
                  </Text>
                </View>
              )}

              {isOwner && !isClosed && (
                <TouchableOpacity
                  style={[
                    styles.closeButton,
                    {
                      backgroundColor: theme.dangerSoft,
                      borderColor: theme.dangerBorder,
                    },
                  ]}
                  onPress={handleClose}
                >
                  <Text
                    style={[styles.closeButtonText, { color: theme.dangerText }]}
                  >
                    Fermer le sondage
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    keyboardView: {
      flex: 1,
    },
    content: {
      padding: 20,
      paddingBottom: 36,
    },
    statusBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    badge: {
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 6,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
    },
    editToggle: {
      borderRadius: 8,
      borderWidth: 1,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    editToggleText: {
      fontSize: 14,
      fontWeight: "700",
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      lineHeight: 36,
      marginBottom: 10,
    },
    description: {
      fontSize: 15,
      lineHeight: 22,
      marginBottom: 16,
    },
    // ✅ Styles pour le passkey
    passkeyContainer: {
      borderRadius: 12,
      borderWidth: 1.5,
      padding: 16,
      marginBottom: 16,
    },
    passkeyHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    passkeyLabel: {
      fontSize: 14,
      fontWeight: "800",
    },
    passkeyToggle: {
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    passkeyToggleText: {
      fontSize: 12,
      fontWeight: "700",
    },
    passkeyValue: {
      fontSize: 20,
      fontWeight: "800",
      letterSpacing: 2,
      marginBottom: 8,
    },
    passkeyHidden: {
      fontSize: 20,
      fontWeight: "800",
      letterSpacing: 2,
      marginBottom: 8,
    },
    passkeyHint: {
      fontSize: 12,
      lineHeight: 18,
    },
    metaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 20,
    },
    metaBadge: {
      borderRadius: 8,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    metaText: {
      fontSize: 12,
      fontWeight: "600",
    },
    optionsSection: {
      gap: 10,
      marginBottom: 20,
    },
    optionButton: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 12,
      borderWidth: 1.5,
      padding: 16,
      gap: 14,
    },
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2.5,
    },
    optionText: {
      fontSize: 16,
      fontWeight: "700",
      flex: 1,
    },
    voteButton: {
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      marginBottom: 16,
    },
    voteButtonText: {
      fontSize: 16,
      fontWeight: "800",
    },
    infoBox: {
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      marginBottom: 16,
    },
    infoBoxText: {
      fontSize: 15,
      fontWeight: "700",
    },
    closeButton: {
      borderRadius: 12,
      borderWidth: 1.5,
      padding: 16,
      alignItems: "center",
    },
    closeButtonText: {
      fontSize: 15,
      fontWeight: "700",
    },
    editPanel: {
      borderRadius: 16,
      borderWidth: 1,
      padding: 20,
    },
    label: {
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      marginTop: 16,
      marginBottom: 8,
    },
    input: {
      borderRadius: 12,
      borderWidth: 1.5,
      fontSize: 15,
      padding: 14,
    },
    textArea: {
      height: 90,
      textAlignVertical: "top",
    },
    optionRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
    },
    optionNumber: {
      fontSize: 14,
      fontWeight: "700",
      width: 30,
    },
    optionLabel: {
      fontSize: 15,
      flex: 1,
    },
    deleteButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    deleteText: {
      fontSize: 14,
      fontWeight: "800",
    },
    addOptionRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginTop: 12,
    },
    newOptionInput: {
      flex: 1,
    },
    addButton: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    addButtonText: {
      fontSize: 24,
      fontWeight: "700",
    },
    editActions: {
      flexDirection: "row",
      gap: 12,
      marginTop: 24,
    },
    actionButton: {
      flex: 1,
      borderRadius: 12,
      padding: 14,
      alignItems: "center",
      borderWidth: 1.5,
    },
    actionButtonText: {
      fontSize: 15,
      fontWeight: "800",
    },
    cancelButton: {},
    saveButton: {},
  });