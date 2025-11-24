import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSignIn, useSignUp } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';

export default function SignInScreen() {
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();

  // Note: This is a simplified auth screen
  // In production, you'll want to implement proper phone/email auth flows
  // Clerk provides pre-built components and flows for this

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="construct" size={80} color="#007AFF" />
        <Text style={styles.title}>Service Connect</Text>
        <Text style={styles.subtitle}>
          Connect with local service professionals
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              // Implement sign in flow
              // For now, this is a placeholder
              console.log('Sign in');
            }}
          >
            <Text style={styles.primaryButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.infoText}>
          Sign in as a customer to request services, or as a business to receive requests
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333',
    marginTop: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 48,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    color: '#999',
    marginTop: 32,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
