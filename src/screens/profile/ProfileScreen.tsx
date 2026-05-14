import { FlatList, Modal, SafeAreaView, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Button } from "../../components/Button";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../notifications/NotificationContext";
import { signOut } from "../../services/authService";
import { useAppTheme } from "../../theme/AppThemeContext";
import { AppTheme } from "../../theme/colors";
import { CardSondage } from "@/src/components/CardSondage";
import { Sondage } from "@/src/types";
import { useState, useEffect } from "react";
import { FetchSondageByUserId } from "@/src/services/sondageService";
import { useNavigation } from "@react-navigation/native";

function ListSondagesUser({ userId }: { userId: string }) {
  const [sondages, setSondages] = useState<Sondage[]>([]);
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation();

  useEffect(() => {
    const loadSondages = async () => {
      const { data, error } = await FetchSondageByUserId(userId);
      if (data) setSondages(data);
      else console.error("Error fetching sondages:", error);
    };
    loadSondages();
  }, [userId]);

  const handleDetailSondage = (id: string) => {
    navigation.navigate("Home", {
      screen: "EditSondage",
      params: { id: id },
    });
  };

  return (
    <FlatList
      data={sondages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <CardSondage
          sondage={item}
          onPress={() => handleDetailSondage(item.id)}
        />
      )}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        <Text style={styles.emptyText}>Aucun sondage créé</Text>
      }
    />
  );
}

export default function ProfileScreen() {
  const { user } = useAuth();
  const { theme } = useAppTheme();
  const { addNotification } = useNotifications();
  const styles = createStyles(theme);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSignOut = async () => {
    addNotification("Deconnexion", "Votre session a ete fermee.");
    await signOut();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{user?.user_metadata?.nom}</Text>
        <Text style={styles.description}>
          Voici les informations de votre compte. Vous pouvez vous deconnecter a tout moment en cliquant sur le bouton ci-dessous.
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Nom</Text>
          <Text style={[styles.value, styles.nameValue]}>
            {user?.user_metadata?.nom}
          </Text>
        </View>
        
        {/* Liste des sondages que l'utilisateur a créé */}
        <View style={styles.sondagesSection}>
          <Text style={styles.label}>Sondages créés</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.viewSondagesButton}>
            <Text style={styles.viewSondagesButtonText}>Voir mes sondages</Text>
          </TouchableOpacity>
        </View>

        {/* Modal pour afficher la liste des sondages */}
        <Modal visible={modalVisible} transparent={true} animationType="fade">
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseButton}>
                <Text style={styles.modalCloseButtonText}>×</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Mes sondages</Text>
              <ListeSondagesUtilisateur userId={user?.id ?? ""} />
            </View>
          </View>
        </Modal>
      </View>

      <Button
        title="Se deconnecter"
        onPress={handleSignOut}
        style={styles.secondaryButton}
        textStyle={styles.secondaryButtonText}
      />
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 20,
    },
    card: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 8,
      borderWidth: 1,
      marginBottom: 16,
      padding: 18,
      flex: 1,
    },
    title: {
      color: theme.text,
      fontSize: 26,
      fontWeight: "800",
      marginTop: 6,
    },
    description: {
      color: theme.textMuted,
      lineHeight: 22,
      marginTop: 10,
    },
    infoRow: {
      borderTopColor: theme.surfaceMuted,
      borderTopWidth: 1,
      marginTop: 14,
      paddingTop: 14,
    },
    sondagesSection: {
      borderTopColor: theme.surfaceMuted,
      borderTopWidth: 1,
      marginTop: 14,
      paddingTop: 14,
      flex: 1,
      minHeight: 200,
    },
    label: {
      color: theme.textSubtle,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
    },
    value: {
      color: theme.text,
      fontSize: 15,
      fontWeight: "700",
      marginTop: 4,
    },
    nameValue: {
      fontSize: 18,
      marginTop: 10,
    },
    listContent: {
      paddingVertical: 10,
      gap: 10,
    },
    emptyText: {
      color: theme.textMuted,
      textAlign: "center",
      marginTop: 20,
      fontStyle: "italic",
    },
    secondaryButton: {
      backgroundColor: theme.surface,
      borderColor: theme.primary,
      borderWidth: 1,
    },
    secondaryButtonText: {
      color: theme.primary,
    },
    // New styles for the modal and button
    viewSondagesButton: {
      padding: 12,
      backgroundColor: theme.primary,
      borderRadius: 6,
      alignItems: "center",
      marginTop: 8,
    },
    viewSondagesButtonText: {
      color: theme.background,
      fontWeight: "600",
    },
    modalBackground: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      width: "80%",
      maxWidth: 400,
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 24,
    },
    modalCloseButton: {
      position: "absolute",
      top: 12,
      right: 12,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.border,
      justifyContent: "center",
      alignItems: "center",
    },
    modalCloseButtonText: {
      color: theme.text,
      fontWeight: "bold",
    },
    modalTitle: {
      color: theme.text,
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 20,
      textAlign: "center",
    },
  });