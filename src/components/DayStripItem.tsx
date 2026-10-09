import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { parseDateString } from '../utils/date';

interface Props {
  dateStr: string;
  isSelected: boolean;
  isToday: boolean;
  hasMeals: boolean;
  onSelectDate: (dateStr: string) => void;
}

export const DayStripItem: React.FC<Props> = ({
  dateStr,
  isSelected,
  isToday,
  hasMeals,
  onSelectDate,
}) => {
  const parsed = parseDateString(dateStr);
  const dayName = parsed.toLocaleDateString(undefined, { weekday: 'narrow' });
  const dayNum = parsed.getDate();

  return (
    <TouchableOpacity
      style={[
        styles.stripCard,
        isSelected && styles.selectedStripCard,
        isToday && !isSelected && styles.todayStripCard,
      ]}
      onPress={() => onSelectDate(dateStr)}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={`${dayName} ${dayNum}${isToday ? ', Today' : ''}`}>
      <Text style={[styles.stripDayName, isSelected && styles.selectedStripText]}>
        {dayName}
      </Text>
      <Text style={[styles.stripDayNum, isSelected && styles.selectedStripText]}>
        {dayNum}
      </Text>
      {hasMeals && (
        <View style={[styles.dotIndicator, isSelected && styles.selectedDot]} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  stripCard: {
    width: 48,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  selectedStripCard: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  todayStripCard: {
    borderColor: '#10B981',
  },
  stripDayName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 2,
  },
  stripDayNum: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  selectedStripText: {
    color: '#0F172A',
  },
  dotIndicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#38BDF8',
    marginTop: 3,
  },
  selectedDot: {
    backgroundColor: '#0F172A',
  },
});
