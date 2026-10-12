import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MealType } from '../types/meal';

interface Props {
  mealType: MealType;
  onDismiss: () => void;
}

export const CycleCelebrationBanner: React.FC<Props> = ({ mealType, onDismiss }) => {
  const formattedCategory = mealType.charAt(0).toUpperCase() + mealType.slice(1);

  return (
    <View style={styles.bannerContainer}>
      <View style={styles.textColumn}>
        <View style={styles.titleRow}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>{formattedCategory} Cycle Complete!</Text>
        </View>
        <Text style={styles.subtitle}>
          You completed all dishes in this rotation. All options are fresh and available again!
        </Text>
      </View>
      <TouchableOpacity
        style={styles.dismissButton}
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel="Dismiss celebration banner">
        <Text style={styles.dismissText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: '#0F291E',
    borderColor: '#10B981',
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  textColumn: {
    flex: 1,
    paddingRight: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  emoji: {
    fontSize: 18,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 12,
    color: '#A7F3D0',
    lineHeight: 17,
  },
  dismissButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#064E3B',
  },
  dismissText: {
    color: '#6EE7B7',
    fontSize: 12,
    fontWeight: '700',
  },
});
