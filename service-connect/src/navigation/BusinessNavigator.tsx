import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import SwipeableInboxScreen from '../screens/business/SwipeableInboxScreen';
import ScheduleScreen from '../screens/business/ScheduleScreen';

const Tab = createBottomTabNavigator();

export default function BusinessNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Requests') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Schedule') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Earnings') {
            iconName = focused ? 'cash' : 'cash-outline';
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
        name="Requests"
        component={SwipeableInboxScreen}
        options={{ title: 'New Requests' }}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
      />
      <Tab.Screen
        name="Earnings"
        component={PlaceholderScreen}
        options={{ title: 'Earnings' }}
      />
      <Tab.Screen
        name="Profile"
        component={PlaceholderScreen}
      />
    </Tab.Navigator>
  );
}

// Placeholder component for future screens
function PlaceholderScreen() {
  return (
    <View style={styles.placeholderContainer}>
      <Ionicons name="construct-outline" size={60} color="#ccc" />
      <Text style={styles.placeholderText}>Coming Soon</Text>
    </View>
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
    fontSize: 18,
    color: '#999',
  },
});
