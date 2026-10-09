import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Meal, MealType } from '../types/meal';
import { Dish } from '../types/dish';
import { CategoryRotationStatus } from '../types/rotation';
import { MealHeaderBadge } from './MealHeaderBadge';
import { MealContentDisplay } from './MealContentDisplay';
import { MealActionButtons } from './MealActionButtons';

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

export const MealSlotCard: React.FC<Props> = ({
  mealType,
  meal,
  plannedDish,
  completedDish,
  onPressPickDish,
  onPressQuickComplete,
  onPressUncomplete,
}) => {
  const isCompleted = meal?.status === 'completed';
  const isSkipped = meal?.status === 'skipped';
  const hasPlanned = !!plannedDish && !isCompleted && !isSkipped;
  const activeDish = isCompleted ? completedDish : plannedDish;

  return (
    <View style={[styles.card, isCompleted && styles.completedCard]}>
      <MealHeaderBadge
        mealType={mealType}
        isCompleted={isCompleted}
        hasPlanned={hasPlanned}
        isSkipped={isSkipped}
      />

      <MealContentDisplay
        activeDish={activeDish}
        plannedDish={plannedDish}
        completedDish={completedDish}
        isCompleted={isCompleted}
        isSkipped={isSkipped}
      />

      <MealActionButtons
        hasPlanned={hasPlanned}
        isCompleted={isCompleted}
        hasActiveDish={!!activeDish}
        onPressQuickComplete={onPressQuickComplete}
        onPressUncomplete={onPressUncomplete}
        onPressPickDish={onPressPickDish}
      />
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
});
