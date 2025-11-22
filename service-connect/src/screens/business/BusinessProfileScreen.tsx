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
import { useOrganization, useMockAuth } from '../../contexts/MockAuthContext';

export default function BusinessProfileScreen() {
  const { organization } = useOrganization();
  const { signOut } = useMockAuth();

  const menuItems = [
    { icon: 'business-outline', title: 'Business Details', onPress: () => {} },
    { icon: 'time-outline', title: 'Availability & Hours', onPress: () => {} },
    { icon: 'card-outline', title: 'Payment Settings', onPress: () => {} },
    { icon: 'notifications-outline', title: 'Notifications', onPress: () => {} },
    { icon: 'help-circle-outline', title: 'Help & Support', onPress: () => {} },
    { icon: 'document-text-outline', title: 'Terms & Privacy', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="business" size={40} color="#34C759" />
          </View>
          <Text style={styles.name}>{organization?.name || 'Business'}</Text>
          <Text style={styles.email}>{organization?.email || ''}</Text>

          {/* Stats */}
          {organization && (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{organization.total_completed || 0}</Text>
                <Text style={styles.statLabel}>Jobs</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{organization.years_in_business || 0}</Text>
                <Text style={styles.statLabel}>Years</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons
                  name={organization.is_verified ? 'checkmark-circle' : 'checkmark-circle-outline'}
                  size={24}
                  color={organization.is_verified ? '#34C759' : '#ccc'}
                />
                <Text style={styles.statLabel}>Verified</Text>
              </View>
            </View>
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <Ionicons name={item.icon} size={24} color="#666" />
              <Text style={styles.menuItemText}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={signOut}
        >
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
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
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F8ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
  },
  menuSection: {
    backgroundColor: 'white',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginTop: 24,
    marginBottom: 32,
  },
});
