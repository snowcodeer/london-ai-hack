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

export default function CustomerRequestsScreen() {
  const recentRequests = [
    {
      id: '1',
      service: 'Plumbing',
      status: 'Completed',
      date: '2 days ago',
      business: 'Shoreditch Plumbing',
      icon: 'water' as const,
      statusColor: '#34C759',
    },
    {
      id: '2',
      service: 'Electrical',
      status: 'In Progress',
      date: '5 days ago',
      business: 'East London Electrical',
      icon: 'flash' as const,
      statusColor: '#FF9500',
    },
    {
      id: '3',
      service: 'General Handyman',
      status: 'Completed',
      date: '1 week ago',
      business: 'Hoxton Handyman',
      icon: 'construct' as const,
      statusColor: '#34C759',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Requests</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{recentRequests.length}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {recentRequests.map((request) => (
          <TouchableOpacity key={request.id} style={styles.requestCard}>
            <View style={styles.requestIconContainer}>
              <Ionicons name={request.icon} size={24} color="#007AFF" />
            </View>
            <View style={styles.requestInfo}>
              <Text style={styles.requestService}>{request.service}</Text>
              <Text style={styles.requestBusiness}>{request.business}</Text>
              <Text style={styles.requestDate}>{request.date}</Text>
            </View>
            <View style={styles.requestRight}>
              <View style={[styles.statusBadge, { backgroundColor: request.statusColor }]}>
                <Text style={styles.statusText}>{request.status}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" style={{ marginTop: 8 }} />
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
    backgroundColor: '#007AFF',
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
  requestCard: {
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
  requestIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  requestInfo: {
    flex: 1,
  },
  requestService: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  requestBusiness: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    color: '#999',
  },
  requestRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
  },
});
