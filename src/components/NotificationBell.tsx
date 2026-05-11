import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNotifications } from '../notifications/NotificationContext';
import { useAppTheme } from '../theme/AppThemeContext';
import { AppTheme } from '../theme/colors';

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function NotificationBell() {
  const { theme } = useAppTheme();
  const { clearNotifications, markAllRead, notifications, unreadCount } = useNotifications();
  const [visible, setVisible] = useState(false);
  const styles = createStyles(theme);

  const openPanel = () => {
    setVisible(true);
    markAllRead();
  };

  return (
    <>
      <Pressable onPress={openPanel} style={styles.iconButton}>
        <Ionicons name="notifications-outline" size={24} color={theme.text} />
        {unreadCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
          </View>
        ) : null}
      </Pressable>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <Pressable style={styles.panel}>
            <View style={styles.header}>
              <Text style={styles.title}>Notifications</Text>
              <Pressable onPress={() => setVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={22} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.list}>
              {notifications.length ? (
                notifications.map((item) => (
                  <View key={item.id} style={styles.item}>
                    <View style={styles.itemTop}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
                    </View>
                    <Text style={styles.message}>{item.message}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.empty}>Aucune notification pour le moment.</Text>
              )}
            </ScrollView>

            {notifications.length ? (
              <Pressable onPress={clearNotifications} style={styles.clearButton}>
                <Text style={styles.clearText}>Tout effacer</Text>
              </Pressable>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    iconButton: {
      alignItems: 'center',
      height: 44,
      justifyContent: 'center',
      marginRight: 8,
      width: 44,
    },
    badge: {
      alignItems: 'center',
      backgroundColor: theme.danger,
      borderRadius: 9,
      minWidth: 18,
      paddingHorizontal: 4,
      position: 'absolute',
      right: 4,
      top: 7,
    },
    badgeText: {
      color: '#ffffff',
      fontSize: 11,
      fontWeight: '800',
    },
    backdrop: {
      backgroundColor: 'rgba(0, 0, 0, 0.35)',
      flex: 1,
      justifyContent: 'flex-start',
      paddingHorizontal: 16,
      paddingTop: 64,
    },
    panel: {
      alignSelf: 'stretch',
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 8,
      borderWidth: 1,
      maxHeight: '75%',
      padding: 14,
    },
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    title: {
      color: theme.text,
      fontSize: 18,
      fontWeight: '800',
    },
    closeButton: {
      alignItems: 'center',
      height: 36,
      justifyContent: 'center',
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
      alignItems: 'center',
      flexDirection: 'row',
      gap: 10,
      justifyContent: 'space-between',
    },
    itemTitle: {
      color: theme.text,
      flex: 1,
      fontWeight: '800',
    },
    time: {
      color: theme.textSubtle,
      fontSize: 12,
      fontWeight: '700',
    },
    message: {
      color: theme.textMuted,
      lineHeight: 20,
      marginTop: 6,
    },
    empty: {
      color: theme.textSubtle,
      paddingVertical: 24,
      textAlign: 'center',
    },
    clearButton: {
      alignItems: 'center',
      borderColor: theme.primary,
      borderRadius: 8,
      borderWidth: 1,
      paddingVertical: 11,
    },
    clearText: {
      color: theme.primary,
      fontWeight: '800',
    },
  });
