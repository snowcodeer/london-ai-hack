import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useMockAuth } from '../contexts/MockAuthContext';
import CustomerNavigator from './CustomerNavigator';
import BusinessNavigator from './BusinessNavigator';
import AuthNavigator from './AuthNavigator';

export default function AppRouter() {
  const { userType } = useMockAuth();

  return (
    <NavigationContainer>
      <View style={styles.container}>
        {!userType ? (
          <AuthNavigator />
        ) : userType === 'business' ? (
          <BusinessNavigator />
        ) : (
          <CustomerNavigator />
        )}
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
