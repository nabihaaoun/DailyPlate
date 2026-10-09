import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatDisplayDate, formatFullDate } from '../utils/date';

interface Props {
  selectedDate: string;
}

export const PlannerDateHeader: React.FC<Props> = ({ selectedDate }) => {
  return (
    <View style={styles.dateLabelRow}>
      <Text style={styles.fullDateLabel}>{formatFullDate(selectedDate)}</Text>
      <Text style={styles.relativeDateLabel}>{formatDisplayDate(selectedDate)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  dateLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  fullDateLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  relativeDateLabel: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
  },
});
