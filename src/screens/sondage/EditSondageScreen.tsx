import { useEffect, useMemo, useState } from "react";
import {
  Alert,
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
  addOption
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
    
    // États pour l'édition
    const [isEditing, setIsEditing] = useState(false);
    const [editTitre, setEditTitre] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editOptions, setEditOptions] = useState<Option[]>([]);
    const [newOptionLabel, setNewOptionLabel] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadSondage = async () => {
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
        };

        loadSondage();
    }, [id, user]);

    const isOwner = useMemo(() => {
        return user && sondage && sondage.id_auteur === user.id;
    }, [user, sondage]);

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
            setSondage(prev => prev ? { ...prev, titre: editTitre, description: editDescription } : null);
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
            setEditOptions(prev => [...prev, data]);
            setNewOptionLabel("");
            setSondage(prev => prev ? { ...prev, option: [...(prev.option || []), data] } : null);
        }
    };

    const handleDeleteOption = async (optionId: string) => {
        Alert.alert(
            "Confirmer",
            "Supprimer cette option ?",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: async () => {
                        const { error } = await deleteOption(optionId);
                        if (error) {
                            Alert.alert("Erreur", "Impossible de supprimer l'option.");
                        } else {
                            setEditOptions(prev => prev.filter(o => o.id !== optionId));
                            setSondage(prev => prev ? {
                                ...prev,
                                option: (prev.option || []).filter(o => o.id !== optionId)
                            } : null);
                        }
                    }
                }
            ]
        );
    };

    const handleVote = async () => {
        if (!sondage) return;
        if (!selectedOption) {
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

    const handleClose = async () => {
        Alert.alert(
            "Confirmer",
            "Êtes-vous sûr de vouloir fermer ce sondage ?",
            [
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
                    }
                }
            ]
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
            <ScrollView contentContainerStyle={styles.content}>
                {/* Header avec titre et bouton éditer */}
                <View style={styles.header}>
                    {isOwner && !isEditing && (
                        <Button
                            title="Modifier"
                            onPress={() => setIsEditing(true)}
                            style={styles.editButton}
                            textStyle={styles.editButtonText}
                        />
                    )}
                </View>

                {isEditing ? (
                    // Mode Édition
                    <View style={styles.editPanel}>
                        <Text style={styles.label}>Titre</Text>
                        <TextInput
                            style={styles.input}
                            value={editTitre}
                            onChangeText={setEditTitre}
                            placeholder="Titre du sondage"
                            placeholderTextColor={theme.textMuted}
                        />
                        
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={editDescription}
                            onChangeText={setEditDescription}
                            placeholder="Description du sondage"
                            placeholderTextColor={theme.textMuted}
                            multiline
                            numberOfLines={3}
                        />
                        
                        <Text style={styles.label}>Options</Text>
                        {editOptions.map((option, index) => (
                            <View key={option.id} style={styles.optionRow}>
                                <Text style={styles.optionNumber}>{index + 1}.</Text>
                                <Text style={styles.optionLabel}>{option.libelle}</Text>
                                <TouchableOpacity
                                    onPress={() => handleDeleteOption(option.id)}
                                    style={styles.deleteButton}
                                >
                                    <Text style={styles.deleteText}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                        
                        <View style={styles.addOptionRow}>
                            <TextInput
                                style={[styles.input, styles.newOptionInput]}
                                value={newOptionLabel}
                                onChangeText={setNewOptionLabel}
                                placeholder="Nouvelle option"
                                placeholderTextColor={theme.textMuted}
                            />
                            <Button
                                title="Ajouter"
                                onPress={handleAddOption}
                                style={styles.addButton}
                            />
                        </View>
                        
                        <View style={styles.editActions}>
                            <Button
                                title="Annuler"
                                onPress={() => {
                                    setIsEditing(false);
                                    setEditTitre(sondage.titre || "");
                                    setEditDescription(sondage.description || "");
                                    setEditOptions(sondage.option || []);
                                }}
                                style={styles.cancelButton}
                                textStyle={styles.cancelButtonText}
                            />
                            <Button
                                title={saving ? "Sauvegarde..." : "Sauvegarder"}
                                onPress={handleSave}
                                disabled={saving}
                            />
                        </View>
                    </View>
                ) : (
                    // Mode Affichage
                    <>
                        <Text style={styles.title}>{sondage.titre}</Text>
                        <Text style={styles.description}>
                            {sondage.description || "Aucune description"}
                        </Text>
                        
                        {sondage.option?.map((option: Option) => (
                            <TouchableOpacity
                                key={option.id}
                                style={[
                                    styles.optionButton,
                                    selectedOption === option.id && styles.optionSelected
                                ]}
                                onPress={() => setSelectedOption(option.id)}
                                disabled={hasVoted || !sondage.est_actif}
                            >
                                <View style={[
                                    styles.radio,
                                    selectedOption === option.id && styles.radioSelected
                                ]} />
                                <Text style={styles.optionText}>{option.libelle}</Text>
                            </TouchableOpacity>
                        ))}
                        
                        {!isOwner && !hasVoted && sondage.est_actif && (
                            <Button
                                title="Voter"
                                onPress={handleVote}
                                disabled={!selectedOption}
                            />
                        )}
                        
                        {hasVoted && (
                            <Text style={styles.votedText}>Vous avez déjà voté</Text>
                        )}
                        
                        {!sondage.est_actif && (
                            <Text style={styles.closedText}>Sondage clôturé</Text>
                        )}
                        
                        {isOwner && (
                            <View style={styles.ownerActions}>
                                <Button
                                    title="Fermer le sondage"
                                    onPress={handleClose}
                                    style={styles.dangerButton}
                                    textStyle={styles.dangerButtonText}
                                />
                            </View>
                        )}
                    </>
                )}
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
        header: {
            flexDirection: "row",
            justifyContent: "flex-end",
            marginBottom: 10,
        },
        editButton: {
            backgroundColor: theme.surface,
            borderColor: theme.primary,
            borderWidth: 1,
            paddingHorizontal: 16,
        },
        editButtonText: {
            color: theme.primary,
        },
        title: {
            color: theme.text,
            fontSize: 26,
            fontWeight: "800",
            lineHeight: 32,
            marginBottom: 10,
        },
        description: {
            color: theme.textMuted,
            fontSize: 15,
            lineHeight: 22,
            marginBottom: 20,
        },
        label: {
            color: theme.textSubtle,
            fontSize: 12,
            fontWeight: "800",
            textTransform: "uppercase",
            marginTop: 16,
            marginBottom: 8,
        },
        input: {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            borderRadius: 8,
            borderWidth: 1,
            color: theme.text,
            fontSize: 15,
            padding: 14,
        },
        textArea: {
            height: 80,
            textAlignVertical: "top",
        },
        editPanel: {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            borderRadius: 8,
            borderWidth: 1,
            padding: 18,
        },
        optionRow: {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 10,
            borderBottomColor: theme.surfaceMuted,
            borderBottomWidth: 1,
        },
        optionNumber: {
            color: theme.textSubtle,
            fontSize: 14,
            width: 30,
        },
        optionLabel: {
            color: theme.text,
            fontSize: 15,
            flex: 1,
        },
        deleteButton: {
            padding: 8,
        },
        deleteText: {
            color: theme.danger,
            fontSize: 18,
            fontWeight: "700",
        },
        addOptionRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginTop: 10,
        },
        newOptionInput: {
            flex: 1,
        },
        addButton: {
            backgroundColor: theme.primarySoft,
        },
        editActions: {
            flexDirection: "row",
            gap: 10,
            marginTop: 20,
        },
        cancelButton: {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            borderWidth: 1,
        },
        cancelButtonText: {
            color: theme.text,
        },
        optionButton: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.surface,
            borderColor: theme.border,
            borderRadius: 8,
            borderWidth: 1,
            padding: 14,
            marginTop: 10,
            gap: 12,
        },
        optionSelected: {
            backgroundColor: theme.primarySoft,
            borderColor: theme.primary,
        },
        radio: {
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: theme.textSubtle,
        },
        radioSelected: {
            backgroundColor: theme.primary,
            borderColor: theme.primary,
        },
        optionText: {
            color: theme.text,
            fontSize: 15,
            fontWeight: "700",
            flex: 1,
        },
        votedText: {
            color: theme.primary,
            fontSize: 15,
            fontWeight: "700",
            textAlign: "center",
            marginTop: 20,
        },
        closedText: {
            color: theme.danger,
            fontSize: 15,
            fontWeight: "700",
            textAlign: "center",
            marginTop: 20,
        },
        ownerActions: {
            marginTop: 20,
            gap: 10,
        },
        dangerButton: {
            backgroundColor: theme.dangerSoft,
            borderColor: theme.dangerBorder,
            borderWidth: 1,
        },
        dangerButtonText: {
            color: theme.danger,
        },
    });