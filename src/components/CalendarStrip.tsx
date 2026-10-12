import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Meal, MealType } from '../types/meal';
import { getMealKey } from '../store/slices/mealsSlice';
import { DayStripItem } from './DayStripItem';
import { MonthPickerModal } from './MonthPickerModal';
import { formatMonthYear, getWeekDays, addDays } from '../utils/date';

interface Props {
  selectedDate: string;
  todayStr: string;
  mealsMap: Record<string, Meal>;
  onSelectDate: (dateStr: string) => void;
  onJumpToday: () => void;
}

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner'];

export const CalendarStrip: React.FC<Props> = ({
  selectedDate,
  todayStr,
  mealsMap,
  onSelectDate,
  onJumpToday,
}) => {
  const [isMonthPickerVisible, setIsMonthPickerVisible] = useState(false);

  // Compute the 7 days of the week containing the selected date
  const weekDays = getWeekDays(selectedDate);
  const monthYearLabel = formatMonthYear(selectedDate);

  const handlePrevWeek = () => {
    onSelectDate(addDays(selectedDate, -7));
  };

  const handleNextWeek = () => {
    onSelectDate(addDays(selectedDate, 7));
  };

  return (
    <View style={styles.header}>
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.monthSelectorBtn}
          onPress={() => setIsMonthPickerVisible(true)}
          accessibilityRole="button"
          accessibilityLabel={`Select month, currently ${monthYearLabel}`}>
          <Text style={styles.monthSelectorText}>{monthYearLabel} ▾</Text>
        </TouchableOpacity>

        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={handlePrevWeek}
            accessibilityLabel="Previous week">
            <Text style={styles.navBtnText}>‹</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.todayJumpBtn} onPress={onJumpToday}>
            <Text style={styles.todayJumpText}>Today</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navBtn}
            onPress={handleNextWeek}
            accessibilityLabel="Next week">
            <Text style={styles.navBtnText}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 7-Day Week Selector */}
      <View style={styles.weekContainer}>
        {weekDays.map((dateStr) => {
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
      </View>

      {/* Month Picker Modal */}
      <MonthPickerModal
        visible={isMonthPickerVisible}
        selectedDate={selectedDate}
        onSelectMonth={onSelectDate}
        onClose={() => setIsMonthPickerVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  monthSelectorText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  navBtnText: {
    color: '#94A3B8',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
  todayJumpBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
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
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
});
