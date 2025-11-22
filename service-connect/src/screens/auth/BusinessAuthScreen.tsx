import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useMockAuth } from '../../contexts/MockAuthContext';

export default function BusinessAuthScreen() {
  const navigation = useNavigation();
  const { switchToBusiness } = useMockAuth();

  const handleLogin = () => {
    // Demo: Just switch to business mode (in production, would authenticate)
    switchToBusiness();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="construct" size={48} color="#34C759" />
        </View>
        <Text style={styles.title}>Business Account</Text>
        <Text style={styles.subtitle}>
          Join SquareDeal and grow your service business
        </Text>
      </View>

      {/* Auth Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleLogin}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>

      {/* Features List */}
      <View style={styles.features}>
        <Text style={styles.featuresTitle}>Why join SquareDeal?</Text>
        <View style={styles.feature}>
          <Ionicons name="checkmark-circle" size={20} color="#34C759" />
          <Text style={styles.featureText}>Get instant job notifications</Text>
        </View>
        <View style={styles.feature}>
          <Ionicons name="checkmark-circle" size={20} color="#34C759" />
          <Text style={styles.featureText}>Set your own rates and availability</Text>
        </View>
        <View style={styles.feature}>
          <Ionicons name="checkmark-circle" size={20} color="#34C759" />
          <Text style={styles.featureText}>Build your reputation with reviews</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E8F8ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonsContainer: {
    paddingHorizontal: 32,
    marginTop: 48,
  },
  primaryButton: {
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
  features: {
    paddingHorizontal: 32,
    marginTop: 48,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#666',
    flex: 1,
  },
});
