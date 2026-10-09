import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Meal, MealType } from '../types/meal';
import { getMealKey } from '../store/slices/mealsSlice';
import { DayStripItem } from './DayStripItem';

interface Props {
  dates: string[];
  selectedDate: string;
  todayStr: string;
  mealsMap: Record<string, Meal>;
  onSelectDate: (dateStr: string) => void;
  onJumpToday: () => void;
}

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner'];

export const CalendarStrip: React.FC<Props> = ({
  dates,
  selectedDate,
  todayStr,
  mealsMap,
  onSelectDate,
  onJumpToday,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <Text style={styles.headerTitle}>Planner & History</Text>
        <TouchableOpacity style={styles.todayJumpBtn} onPress={onJumpToday}>
          <Text style={styles.todayJumpText}>Today</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.stripContainer}>
        {dates.map((dateStr) => {
          const hasMeals = MEAL_TYPES.some((t) => !!mealsMap[getMealKey(dateStr, t)]);
          return (
            <DayStripItem
              key={dateStr}
              dateStr={dateStr}
              isSelected={dateStr === selectedDate}
              isToday={dateStr === todayStr}
              hasMeals={hasMeals}
              onSelectDate={onSelectDate}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  todayJumpBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  todayJumpText: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 12,
  },
  stripContainer: {
    gap: 8,
    paddingVertical: 4,
  },
});
