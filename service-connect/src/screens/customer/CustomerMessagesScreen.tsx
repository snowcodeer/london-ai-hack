import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CustomerMessagesScreen() {
  const recentMessages = [
    {
      id: '1',
      from: 'Shoreditch Plumbing',
      message: 'Thanks for your business! Feel free to reach out anytime.',
      time: '2h ago',
      unread: false,
    },
    {
      id: '2',
      from: 'East London Electrical',
      message: 'We\'ll be there tomorrow at 2pm. See you then!',
      time: '1d ago',
      unread: true,
    },
    {
      id: '3',
      from: 'Tech City Carpentry',
      message: 'Your quote is ready. Check it out in the app.',
      time: '3d ago',
      unread: false,
    },
  ];

  const unreadCount = recentMessages.filter(msg => msg.unread).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.scrollView}>
        {recentMessages.map((msg) => (
          <TouchableOpacity key={msg.id} style={styles.messageCard}>
            <View style={styles.messageIconContainer}>
              <Ionicons name="chatbubble-outline" size={24} color="#007AFF" />
              {msg.unread && <View style={styles.unreadDot} />}
            </View>
            <View style={styles.messageInfo}>
              <Text style={styles.messageFrom}>{msg.from}</Text>
              <Text
                style={[styles.messageText, msg.unread && styles.messageTextUnread]}
                numberOfLines={2}
              >
                {msg.message}
              </Text>
            </View>
            <View style={styles.messageRight}>
              <Text style={styles.messageTime}>{msg.time}</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" style={{ marginTop: 4 }} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  badge: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  messageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  messageIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: 'white',
  },
  messageInfo: {
    flex: 1,
    marginRight: 8,
  },
  messageFrom: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  messageTextUnread: {
    fontWeight: '500',
    color: '#333',
  },
  messageRight: {
    alignItems: 'flex-end',
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
  },
});
