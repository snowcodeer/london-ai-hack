import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useMockAuth } from '../../contexts/MockAuthContext';

export default function BusinessSignupScreen() {
  const navigation = useNavigation();
  const { switchToBusiness } = useMockAuth();
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = () => {
    if (!websiteUrl.trim()) {
      Alert.alert('Website Required', 'Please enter your business website URL');
      return;
    }

    // TODO: Implement OpenAI website scraping here
    // For now, just complete the signup
    Alert.alert(
      'Success!',
      'Your business account has been created.',
      [
        {
          text: 'Get Started',
          onPress: () => switchToBusiness(),
        },
      ]
    );
  };

  const handleSkip = () => {
    Alert.alert(
      'Manual Setup',
      'You can fill in your business details manually.',
      [
        {
          text: 'Continue',
          onPress: () => switchToBusiness(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="sparkles" size={48} color="#34C759" />
          <Text style={styles.title}>Quick Setup</Text>
          <Text style={styles.subtitle}>
            We'll auto-fill your business details using your website
          </Text>
        </View>

        {/* Website Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Business Website</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="globe-outline" size={20} color="#999" />
            <TextInput
              style={styles.input}
              placeholder="https://yourbusiness.com"
              value={websiteUrl}
              onChangeText={setWebsiteUrl}
              autoCapitalize="none"
              keyboardType="url"
              autoCorrect={false}
            />
          </View>
          <Text style={styles.helperText}>
            We'll use AI to extract your business name, services, and contact info
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={styles.continueButtonText}>Analyzing...</Text>
          ) : (
            <>
              <Text style={styles.continueButtonText}>Continue with Website</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </>
          )}
        </TouchableOpacity>

        {/* Skip Button */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
        >
          <Text style={styles.skipButtonText}>Skip and set up manually</Text>
        </TouchableOpacity>

        {/* Features */}
        <View style={styles.features}>
          <Text style={styles.featuresTitle}>What we'll set up:</Text>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            <Text style={styles.featureText}>Business name and description</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            <Text style={styles.featureText}>Service categories</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            <Text style={styles.featureText}>Contact information</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  backButton: {
    marginLeft: 20,
    marginTop: 10,
    marginBottom: 20,
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
    paddingHorizontal: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  inputSection: {
    paddingHorizontal: 32,
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  helperText: {
    fontSize: 13,
    color: '#999',
    marginTop: 8,
    lineHeight: 18,
  },
  continueButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#34C759',
    marginHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
  skipButton: {
    marginHorizontal: 32,
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '500',
  },
  features: {
    paddingHorizontal: 32,
    marginTop: 40,
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
