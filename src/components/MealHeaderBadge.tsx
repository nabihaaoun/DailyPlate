import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MealType } from '../types/meal';

interface Props {
  mealType: MealType;
  isCompleted: boolean;
  hasPlanned: boolean;
  isSkipped: boolean;
}

const ICONS: Record<MealType, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
};

const TITLES: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
};

export const MealHeaderBadge: React.FC<Props> = ({
  mealType,
  isCompleted,
  hasPlanned,
  isSkipped,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <Text style={styles.icon}>{ICONS[mealType]}</Text>
        <Text style={styles.title}>{TITLES[mealType]}</Text>
      </View>

      {isCompleted && (
        <View style={[styles.badge, styles.completedBadge]}>
          <Text style={styles.completedBadgeText}>✓ Cooked</Text>
        </View>
      )}
      {hasPlanned && (
        <View style={[styles.badge, styles.plannedBadge]}>
          <Text style={styles.plannedBadgeText}>Planned</Text>
        </View>
      )}
      {isSkipped && (
        <View style={[styles.badge, styles.skippedBadge]}>
          <Text style={styles.skippedBadgeText}>Ate Out / Skipped</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  completedBadge: {
    backgroundColor: '#064E3B',
  },
  completedBadgeText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
  },
  plannedBadge: {
    backgroundColor: '#1E3A8A',
  },
  plannedBadgeText: {
    color: '#60A5FA',
    fontSize: 11,
    fontWeight: '700',
  },
  skippedBadge: {
    backgroundColor: '#374151',
  },
  skippedBadgeText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
  },
});
