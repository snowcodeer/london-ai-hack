import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useMockAuth } from '../contexts/MockAuthContext';
import CustomerNavigator from './CustomerNavigator';
import BusinessNavigator from './BusinessNavigator';
import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';

export default function AppRouter() {
  const { userType } = useMockAuth();

  return (
    <NavigationContainer>
      <View style={styles.container}>
        {!userType ? (
          <RoleSelectionScreen />
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
