import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";
import { useNotifications } from "../notifications/NotificationContext";
import { useAppTheme } from "../theme/AppThemeContext";
import { AppTheme } from "../theme/colors";

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HeaderRight() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const {
    clearNotifications,
    markAllRead,
    notifications,
    unreadCount,
    removeNotification,
  } = useNotifications();
  const [visible, setVisible] = useState(false);
  const styles = createStyles(theme);

  const userInitials = useMemo(() => {
    const rawName = String(
      user?.user_metadata?.nom ?? user?.email ?? "",
    ).trim();
    const letters = rawName.replace(/\s+/g, "").slice(0, 2).toUpperCase();
    return letters || null;
  }, [user]);

  const userName = useMemo(() => {
    return user?.user_metadata?.nom ?? user?.email ?? "Utilisateur";
  }, [user]);

  const openPanel = () => {
    setVisible(true);
    markAllRead();
  };

  return (
    <React.Fragment>
      <View style={styles.headerContainer}>
        <Text style={styles.userName}>{userName}</Text>
        <Pressable onPress={openPanel} style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={24} color={theme.text} />
       {/* {userInitials ? (
          <View style={styles.initialsBadge}>
            <Text style={styles.initialsText}>{userInitials}</Text>
          </View>
        ) : null} */}
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <Pressable style={styles.panel}>
            <View style={styles.header}>
              <Text style={styles.title}>Notifications</Text>
              <Pressable
                onPress={() => setVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={22} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.list}>
              {notifications.length ? (
                notifications.map((item) => (
                  <View key={item.id} style={styles.item}>
                    <View style={styles.itemTop}>
                      <View style={styles.titleRow}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <Pressable
                          onPress={() => removeNotification(item.id)}
                          style={styles.deleteButton}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={18}
                            color={theme.danger}
                          />
                        </Pressable>
                      </View>
                      <Text style={styles.time}>
                        {formatTime(item.createdAt)}
                      </Text>
                    </View>
                    <Text style={styles.message}>{item.message}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.empty}>
                  Aucune notification pour le moment.
                </Text>
              )}
            </ScrollView>

            {notifications.length ? (
              <Pressable
                onPress={clearNotifications}
                style={styles.clearButton}
              >
                <Text style={styles.clearText}>Tout effacer</Text>
              </Pressable>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </React.Fragment>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    headerContainer: {
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
      marginRight: 8,
      marginTop: 5,
    },
    userName: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "700",
    },
    iconButton: {
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
      height: 44,
      justifyContent: "center",
      paddingHorizontal: 8,
    },
    badge: {
      alignItems: "center",
      backgroundColor: theme.danger,
      borderRadius: 9,
      minWidth: 18,
      paddingHorizontal: 4,
      position: "absolute",
      right: 4,
      top: 7,
    },
    badgeText: {
      color: "#ffffff",
      fontSize: 11,
      fontWeight: "800",
    },
    backdrop: {
      backgroundColor: "rgba(0, 0, 0, 0.35)",
      flex: 1,
      justifyContent: "flex-start",
      paddingHorizontal: 16,
      paddingTop: 64,
    },
    panel: {
      alignSelf: "stretch",
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 8,
      borderWidth: 1,
      marginTop: 16,
      maxHeight: "75%",
      padding: 14,
    },
    header: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    title: {
      color: theme.text,
      fontSize: 18,
      fontWeight: "800",
    },
    closeButton: {
      alignItems: "center",
      height: 36,
      justifyContent: "center",
      width: 36,
    },
    list: {
      gap: 10,
      paddingVertical: 14,
    },
    item: {
      backgroundColor: theme.surfaceMuted,
      borderColor: theme.border,
      borderRadius: 8,
      borderWidth: 1,
      padding: 12,
    },
    itemTop: {
      alignItems: "center",
      flexDirection: "row",
      gap: 10,
      justifyContent: "space-between",
    },
    titleRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
      flex: 1,
    },
    deleteButton: {
      alignItems: "center",
      justifyContent: "center",
      height: 32,
      width: 32,
    },
    itemTitle: {
      color: theme.text,
      flex: 1,
      fontWeight: "800",
    },
    time: {
      color: theme.textSubtle,
      fontSize: 12,
      fontWeight: "700",
    },
    message: {
      color: theme.textMuted,
      lineHeight: 20,
      marginTop: 6,
    },
    empty: {
      color: theme.textSubtle,
      paddingVertical: 24,
      textAlign: "center",
    },
    clearButton: {
      alignItems: "center",
      borderColor: theme.primary,
      borderRadius: 8,
      borderWidth: 1,
      paddingVertical: 11,
    },
    initialsBadge: {
      alignItems: "center",
      backgroundColor: theme.primary,
      borderRadius: 12,
      height: 24,
      justifyContent: "center",
      minWidth: 24,
      paddingHorizontal: 6,
    },
    initialsText: {
      color: "#ffffff",
      fontSize: 12,
      fontWeight: "800",
    },
    clearText: {
      color: theme.primary,
      fontWeight: "800",
    },
  });
