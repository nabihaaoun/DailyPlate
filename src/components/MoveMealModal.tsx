import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { MealType } from '../types/meal';
import { Dish } from '../types/dish';
import { addDays, formatDisplayDate } from '../utils/date';

interface Props {
  visible: boolean;
  dish: Dish;
  sourceDate: string;
  sourceMealType: MealType;
  onConfirmMove: (targetDate: string, targetMealType: MealType) => void;
  onClose: () => void;
}

const MEAL_TYPES: { label: string; value: MealType }[] = [
  { label: 'Breakfast', value: 'breakfast' },
  { label: 'Lunch', value: 'lunch' },
  { label: 'Dinner', value: 'dinner' },
];

export const MoveMealModal: React.FC<Props> = ({
  visible,
  dish,
  sourceDate,
  sourceMealType,
  onConfirmMove,
  onClose,
}) => {
  // Offer next 7 days as target dates
  const targetDays = [1, 2, 3, 4, 5, 6, 7].map((offset) => addDays(sourceDate, offset));
  const [selectedTargetDate, setSelectedTargetDate] = useState<string>(targetDays[0]);
  const [selectedMealType, setSelectedMealType] = useState<MealType>(sourceMealType);

  const handleMove = () => {
    onConfirmMove(selectedTargetDate, selectedMealType);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Reschedule Meal</Text>
              <Text style={styles.subtitle}>Move &quot;{dish.name}&quot; to another day</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Target Meal Type Selector */}
          <Text style={styles.sectionLabel}>Target Meal Slot</Text>
          <View style={styles.typeRow}>
            {MEAL_TYPES.map((type) => {
              const isSelected = selectedMealType === type.value;
              return (
                <TouchableOpacity
                  key={type.value}
                  style={[styles.typeChip, isSelected && styles.selectedTypeChip]}
                  onPress={() => setSelectedMealType(type.value)}>
                  <Text style={[styles.typeText, isSelected && styles.selectedTypeText]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Target Day Selector */}
          <Text style={styles.sectionLabel}>Select Target Day</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysScroll}>
            {targetDays.map((dateStr) => {
              const isSelected = selectedTargetDate === dateStr;
              return (
                <TouchableOpacity
                  key={dateStr}
                  style={[styles.dayCard, isSelected && styles.selectedDayCard]}
                  onPress={() => setSelectedTargetDate(dateStr)}>
                  <Text style={[styles.dayCardLabel, isSelected && styles.selectedDayCardText]}>
                    {formatDisplayDate(dateStr)}
                  </Text>
                  <Text style={[styles.dayCardDate, isSelected && styles.selectedDayCardText]}>
                    {dateStr.slice(5)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Confirm Move Button */}
          <TouchableOpacity style={styles.confirmBtn} onPress={handleMove}>
            <Text style={styles.confirmBtnText}>Confirm Move</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 6,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  typeChip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
  },
  selectedTypeChip: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  typeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
  selectedTypeText: {
    color: '#0F172A',
  },
  daysScroll: {
    marginBottom: 18,
  },
  dayCard: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    marginRight: 8,
    alignItems: 'center',
  },
  selectedDayCard: {
    backgroundColor: '#3B82F6',
    borderColor: '#2563EB',
  },
  dayCardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  dayCardDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  selectedDayCardText: {
    color: '#FFFFFF',
  },
  confirmBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  confirmBtnText: {
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 15,
  },
});
