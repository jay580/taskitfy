import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/navigation';
import { ToastProvider } from './src/contexts/ToastContext';
import { AuthProvider } from './src/contexts/AuthContext';
import AnimatedSplashScreen from './src/components/AnimatedSplashScreen';

import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0F1A' }}>
      <AuthProvider>
        <PaperProvider>
          <ToastProvider>
            <NavigationContainer>
              <RootNavigator />
              <StatusBar style="light" />
            </NavigationContainer>
            {!isAppReady && (
              <AnimatedSplashScreen 
                onAnimationComplete={async () => {
                  setIsAppReady(true);
                  await SplashScreen.hideAsync();
                }} 
              />
            )}
          </ToastProvider>
        </PaperProvider>
      </AuthProvider>
    </View>
  );
}
