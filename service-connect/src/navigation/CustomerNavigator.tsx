import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import CustomerDashboard from '../screens/customer/CustomerDashboard';
import CameraScreen from '../screens/customer/CameraScreen';
import ProblemAnalysisScreen from '../screens/customer/ProblemAnalysisScreen';
import CustomerProfileScreen from '../screens/customer/CustomerProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigator for Dashboard and related screens
function DashboardStack() {
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
        name="DashboardHome"
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
    </Stack.Navigator>
  );
}

// Placeholder component for future screens
function PlaceholderScreen({ title }: { title: string }) {
  return (
    <View style={styles.placeholderContainer}>
      <Ionicons name="construct-outline" size={60} color="#ccc" />
      <Text style={styles.placeholderText}>{title}</Text>
      <Text style={styles.placeholderSubText}>Coming Soon</Text>
    </View>
  );
}

export default function CustomerNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Requests') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={DashboardStack}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="Requests"
        options={{ title: 'My Requests' }}
      >
        {() => <PlaceholderScreen title="My Requests" />}
      </Tab.Screen>
      <Tab.Screen
        name="Messages"
        options={{ title: 'Messages' }}
      >
        {() => <PlaceholderScreen title="Messages" />}
      </Tab.Screen>
      <Tab.Screen
        name="Profile"
        component={CustomerProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  placeholderText: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  placeholderSubText: {
    marginTop: 8,
    fontSize: 16,
    color: '#999',
  },
});
