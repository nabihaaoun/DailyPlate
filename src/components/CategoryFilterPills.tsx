import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MealCategory } from '../types/dish';

export type DishFilterType = MealCategory | 'all_filter';

interface Props {
  activeFilter: DishFilterType;
  onSelectFilter: (filter: DishFilterType) => void;
}

const FILTER_TABS: { label: string; value: DishFilterType }[] = [
  { label: 'All', value: 'all_filter' },
  { label: 'Breakfast', value: 'breakfast' },
  { label: 'Lunch', value: 'lunch' },
  { label: 'Dinner', value: 'dinner' },
];

export const CategoryFilterPills: React.FC<Props> = ({ activeFilter, onSelectFilter }) => {
  return (
    <View style={styles.tabsRow}>
      {FILTER_TABS.map((tab) => {
        const isActive = activeFilter === tab.value;
        return (
          <TouchableOpacity
            key={tab.value}
            style={[styles.tabChip, isActive && styles.activeTabChip]}
            onPress={() => onSelectFilter(tab.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}>
            <Text style={[styles.tabChipText, isActive && styles.activeTabChipText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tabChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  activeTabChip: {
    backgroundColor: '#3B82F6',
    borderColor: '#2563EB',
  },
  tabChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  activeTabChipText: {
    color: '#FFFFFF',
  },
});
