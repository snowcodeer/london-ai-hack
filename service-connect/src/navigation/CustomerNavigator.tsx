import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CustomerDashboard from '../screens/customer/CustomerDashboard';
import CameraScreen from '../screens/customer/CameraScreen';
import ProblemAnalysisScreen from '../screens/customer/ProblemAnalysisScreen';
import VendorListScreen from '../screens/customer/VendorListScreen';

const Stack = createStackNavigator();

export default function CustomerNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={CustomerDashboard}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Camera"
        component={CameraScreen}
        options={{ title: 'New Service Request', headerShown: false }}
      />
      <Stack.Screen
        name="ProblemAnalysis"
        component={ProblemAnalysisScreen}
        options={{ title: 'Problem Analysis' }}
      />
      <Stack.Screen
        name="VendorList"
        component={VendorListScreen}
        options={{ title: 'Service Providers' }}
      />
    </Stack.Navigator>
  );
}
