import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Dish } from '../types/dish';

interface Props {
  dish: Dish;
  onEdit: (dish: Dish) => void;
  onDelete: (dish: Dish) => void;
}

export const DishListItem: React.FC<Props> = ({ dish, onEdit, onDelete }) => {
  return (
    <View style={styles.dishCard}>
      <View style={styles.dishDetails}>
        <Text style={styles.dishName}>{dish.name}</Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>
            {dish.category.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.dishActions}>
        <TouchableOpacity
          style={styles.actionIconBtn}
          onPress={() => onEdit(dish)}
          accessibilityRole="button"
          accessibilityLabel={`Edit ${dish.name}`}>
          <Text style={styles.actionEditText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionIconBtn}
          onPress={() => onDelete(dish)}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${dish.name}`}>
          <Text style={styles.actionDeleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dishCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E222B',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2A303C',
  },
  dishDetails: {
    flex: 1,
  },
  dishName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#374151',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  dishActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIconBtn: {
    padding: 6,
  },
  actionEditText: {
    color: '#60A5FA',
    fontSize: 13,
    fontWeight: '600',
  },
  actionDeleteText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
});
