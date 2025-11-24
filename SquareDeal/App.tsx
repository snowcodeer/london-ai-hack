import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { MockAuthProvider } from './src/contexts/MockAuthContext';
import AppRouter from './src/navigation/AppRouter';

export default function App() {
  return (
    <MockAuthProvider>
      <StatusBar style="auto" />
      <AppRouter />
    </MockAuthProvider>
  );
}
