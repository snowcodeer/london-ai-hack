import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMockAuth } from '../../contexts/MockAuthContext';

export default function RoleSelectionScreen() {
  const { switchToCustomer, switchToBusiness } = useMockAuth();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoSquare}>
            <Ionicons name="grid" size={40} color="#007AFF" />
          </View>
        </View>
        <Text style={styles.title}>SquareDeal</Text>
        <Text style={styles.subtitle}>
          Your local service marketplace
        </Text>
      </View>

      {/* Role Cards */}
      <View style={styles.cardsContainer}>
        {/* Customer Card */}
        <TouchableOpacity
          style={[styles.roleCard, styles.customerCard]}
          onPress={switchToCustomer}
          activeOpacity={0.9}
        >
          <View style={styles.cardGradient}>
            <View style={styles.cardIconContainer}>
              <Ionicons name="home" size={32} color="#007AFF" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>I need help</Text>
              <Text style={styles.cardDescription}>
                Find trusted professionals for home repairs and services
              </Text>
            </View>
            <View style={styles.cardArrow}>
              <Ionicons name="chevron-forward" size={24} color="#007AFF" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Business Card */}
        <TouchableOpacity
          style={[styles.roleCard, styles.businessCard]}
          onPress={switchToBusiness}
          activeOpacity={0.9}
        >
          <View style={styles.cardGradient}>
            <View style={styles.cardIconContainer}>
              <Ionicons name="construct" size={32} color="#34C759" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>I'm a professional</Text>
              <Text style={styles.cardDescription}>
                Grow your business with instant job requests
              </Text>
            </View>
            <View style={styles.cardArrow}>
              <Ionicons name="chevron-forward" size={24} color="#34C759" />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Demo Mode • Tap to continue
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 50,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoSquare: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#E8F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  cardsContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  roleCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  customerCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E8F4FF',
  },
  businessCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E8F9EF',
  },
  cardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
  },
  cardIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontWeight: '400',
  },
  cardArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingBottom: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
});
