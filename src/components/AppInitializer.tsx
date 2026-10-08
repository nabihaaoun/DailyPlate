import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useAppDispatch } from '../store/hooks';
import { getDb } from '../db/client';
import { loadDishes, seedSampleDishes } from '../store/slices/dishesSlice';
import { loadAllMeals } from '../store/slices/mealsSlice';

SplashScreen.preventAutoHideAsync().catch(() => {});

export const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        // 1. Initialize SQLite Database tables
        await getDb();

        // 2. Hydrate Redux state from SQLite
        const dishesResult = await dispatch(loadDishes()).unwrap();
        if (dishesResult.length === 0) {
          await dispatch(seedSampleDishes()).unwrap();
        }

        await dispatch(loadAllMeals()).unwrap();
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setIsReady(true);
        SplashScreen.hideAsync().catch(() => {});
      }
    }

    init();
  }, [dispatch]);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading DailyPlate...</Text>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 14,
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '500',
  },
});
