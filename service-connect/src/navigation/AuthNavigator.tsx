import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';
import BusinessAuthScreen from '../screens/auth/BusinessAuthScreen';
import BusinessSignupScreen from '../screens/auth/BusinessSignupScreen';

const Stack = createStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#FAFAFA' },
      }}
    >
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="BusinessAuth" component={BusinessAuthScreen} />
      <Stack.Screen name="BusinessSignup" component={BusinessSignupScreen} />
    </Stack.Navigator>
  );
}
