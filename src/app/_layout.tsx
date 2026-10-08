import React from 'react';
import { Provider } from 'react-redux';
import { Stack } from 'expo-router';
import { store } from '../store';
import { AppInitializer } from '../components/AppInitializer';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AppInitializer>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </AppInitializer>
    </Provider>
  );
}
