import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Meal, MealType } from '../types/meal';
import { Dish } from '../types/dish';
import { CategoryRotationStatus } from '../types/rotation';

interface Props {
  mealType: MealType;
  dateStr: string;
  meal?: Meal;
  plannedDish?: Dish;
  completedDish?: Dish;
  rotationStatus: CategoryRotationStatus;
  onPressPickDish: () => void;
  onPressQuickComplete: () => void;
  onPressUncomplete: () => void;
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

export const MealSlotCard: React.FC<Props> = ({
  mealType,
  meal,
  plannedDish,
  completedDish,
  rotationStatus,
  onPressPickDish,
  onPressQuickComplete,
  onPressUncomplete,
}) => {
  const isCompleted = meal?.status === 'completed';
  const isSkipped = meal?.status === 'skipped';
  const hasPlanned = !!plannedDish && !isCompleted && !isSkipped;

  // Active dish to display
  const activeDish = isCompleted ? completedDish : plannedDish;

  return (
    <View style={[styles.card, isCompleted && styles.completedCard]}>
      {/* Header row */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>{ICONS[mealType]}</Text>
          <Text style={styles.title}>{TITLES[mealType]}</Text>
        </View>

        {/* Status Badge */}
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

      {/* Body content */}
      <View style={styles.content}>
        {activeDish ? (
          <View>
            <Text style={styles.dishName}>{activeDish.name}</Text>
            {isCompleted && plannedDish && plannedDish.id !== completedDish?.id && (
              <Text style={styles.subtext}>Planned was: {plannedDish.name}</Text>
            )}
          </View>
        ) : isSkipped ? (
          <Text style={styles.placeholderText}>Skipped or ate outside</Text>
        ) : (
          <Text style={styles.placeholderText}>No meal planned yet</Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        {/* If planned, primary action is 1-tap "Mark as Cooked" */}
        {hasPlanned && (
          <TouchableOpacity style={styles.primaryBtn} onPress={onPressQuickComplete}>
            <Text style={styles.primaryBtnText}>✓ Mark as Cooked</Text>
          </TouchableOpacity>
        )}

        {/* If completed, option to undo or switch */}
        {isCompleted && (
          <TouchableOpacity style={styles.secondaryBtn} onPress={onPressUncomplete}>
            <Text style={styles.secondaryBtnText}>Undo Cooked</Text>
          </TouchableOpacity>
        )}

        {/* Pick or change dish */}
        <TouchableOpacity style={styles.outlineBtn} onPress={onPressPickDish}>
          <Text style={styles.outlineBtnText}>
            {activeDish ? 'Change' : '+ Choose Dish'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E222B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#2A303C',
  },
  completedCard: {
    borderColor: '#065F46',
    backgroundColor: '#0F291E',
  },
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
  content: {
    marginVertical: 10,
    minHeight: 28,
  },
  dishName: {
    fontSize: 19,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  subtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    fontStyle: 'italic',
  },
  placeholderText: {
    fontSize: 15,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  primaryBtn: {
    backgroundColor: '#059669',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  secondaryBtn: {
    backgroundColor: '#374151',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  secondaryBtnText: {
    color: '#D1D5DB',
    fontWeight: '600',
    fontSize: 12,
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: '#4B5563',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  outlineBtnText: {
    color: '#E5E7EB',
    fontWeight: '600',
    fontSize: 13,
  },
});
