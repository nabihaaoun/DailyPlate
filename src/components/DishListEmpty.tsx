import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  searchQuery: string;
  totalDishesCount: number;
  onSeedDishes: () => void;
}

export const DishListEmpty: React.FC<Props> = ({
  searchQuery,
  totalDishesCount,
  onSeedDishes,
}) => {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No dishes found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery ? 'Try a different search term.' : 'Add your favorite dishes to get started.'}
      </Text>
      {totalDishesCount === 0 && (
        <TouchableOpacity style={styles.seedButton} onPress={onSeedDishes}>
          <Text style={styles.seedButtonText}>Load Starter Dishes</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 16,
  },
  seedButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  seedButtonText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 14,
  },
});
