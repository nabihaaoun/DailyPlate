import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CategoryRotationStatus } from '../types/rotation';

interface Props {
  breakfastRotation: CategoryRotationStatus;
  lunchRotation: CategoryRotationStatus;
  dinnerRotation: CategoryRotationStatus;
}

export const TodayRotationMiniSummary: React.FC<Props> = ({
  breakfastRotation,
  lunchRotation,
  dinnerRotation,
}) => {
  return (
    <View style={styles.rotationCardsRow}>
      <View style={styles.miniRotationCard}>
        <Text style={styles.miniRotationLabel}>🌅 Breakfast</Text>
        <Text style={styles.miniRotationVal}>
          {breakfastRotation.remainingCount} left
        </Text>
      </View>
      <View style={styles.miniRotationCard}>
        <Text style={styles.miniRotationLabel}>☀️ Lunch</Text>
        <Text style={styles.miniRotationVal}>
          {lunchRotation.remainingCount} left
        </Text>
      </View>
      <View style={styles.miniRotationCard}>
        <Text style={styles.miniRotationLabel}>🌙 Dinner</Text>
        <Text style={styles.miniRotationVal}>
          {dinnerRotation.remainingCount} left
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rotationCardsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  miniRotationCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  miniRotationLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  miniRotationVal: {
    fontSize: 13,
    color: '#34D399',
    fontWeight: '700',
    marginTop: 3,
  },
});
