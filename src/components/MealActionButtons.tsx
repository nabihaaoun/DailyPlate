import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  hasPlanned: boolean;
  isCompleted: boolean;
  hasActiveDish: boolean;
  onPressQuickComplete: () => void;
  onPressUncomplete: () => void;
  onPressPickDish: () => void;
}

export const MealActionButtons: React.FC<Props> = ({
  hasPlanned,
  isCompleted,
  hasActiveDish,
  onPressQuickComplete,
  onPressUncomplete,
  onPressPickDish,
}) => {
  return (
    <View style={styles.actionsRow}>
      {hasPlanned && (
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={onPressQuickComplete}
          accessibilityRole="button"
          accessibilityLabel="Mark meal as cooked">
          <Text style={styles.primaryBtnText}>✓ Mark as Cooked</Text>
        </TouchableOpacity>
      )}

      {isCompleted && (
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={onPressUncomplete}
          accessibilityRole="button"
          accessibilityLabel="Undo cooked status">
          <Text style={styles.secondaryBtnText}>Undo Cooked</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.outlineBtn}
        onPress={onPressPickDish}
        accessibilityRole="button"
        accessibilityLabel={hasActiveDish ? 'Change dish' : 'Choose dish'}>
        <Text style={styles.outlineBtnText}>
          {hasActiveDish ? 'Change' : '+ Choose Dish'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
