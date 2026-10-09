import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dish } from '../types/dish';

interface Props {
  activeDish?: Dish;
  plannedDish?: Dish;
  completedDish?: Dish;
  isCompleted: boolean;
  isSkipped: boolean;
}

export const MealContentDisplay: React.FC<Props> = ({
  activeDish,
  plannedDish,
  completedDish,
  isCompleted,
  isSkipped,
}) => {
  return (
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
  );
};

const styles = StyleSheet.create({
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
    color: '#94A3B8',
    marginTop: 4,
    fontStyle: 'italic',
  },
  placeholderText: {
    fontSize: 15,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});
