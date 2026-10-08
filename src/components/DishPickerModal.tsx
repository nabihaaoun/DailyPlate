import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { Dish } from '../types/dish';
import { MealType } from '../types/meal';
import { CategoryRotationStatus } from '../types/rotation';

interface Props {
  visible: boolean;
  mealType: MealType;
  dateStr: string;
  rotationStatus: CategoryRotationStatus;
  allDishes: Dish[];
  currentDishId?: string | null;
  onSelectDish: (dish: Dish) => void;
  onSelectSkipped: () => void;
  onClearMeal: () => void;
  onCreateNewDishPrompt: () => void;
  onClose: () => void;
}

export const DishPickerModal: React.FC<Props> = ({
  visible,
  mealType,
  dateStr,
  rotationStatus,
  allDishes,
  currentDishId,
  onSelectDish,
  onSelectSkipped,
  onClearMeal,
  onCreateNewDishPrompt,
  onClose,
}) => {
  const [search, setSearch] = useState('');

  // Eligible dishes for this meal type
  const eligibleDishes = allDishes.filter(
    (d) => d.isActive && (d.category === mealType || d.category === 'all')
  );

  const availableIds = new Set(rotationStatus.availableDishes.map((d) => d.id));

  const filteredDishes = eligibleDishes.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  const inRotationList = filteredDishes.filter((d) => availableIds.has(d.id));
  const recentlyCookedList = filteredDishes.filter((d) => !availableIds.has(d.id));

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                Select {mealType.charAt(0).toUpperCase() + mealType.slice(1)} Dish
              </Text>
              <Text style={styles.subtitle}>
                {rotationStatus.remainingCount} of {rotationStatus.totalEligible} available in
                current rotation
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search dishes..."
              placeholderTextColor="#6B7280"
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
            />
          </View>

          {/* Quick Actions Row */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => {
                onClose();
                onCreateNewDishPrompt();
              }}>
              <Text style={styles.quickActionText}>+ New Dish</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => {
                onSelectSkipped();
                onClose();
              }}>
              <Text style={styles.quickActionText}>Ate Out / Skipped</Text>
            </TouchableOpacity>

            {currentDishId && (
              <TouchableOpacity
                style={[styles.quickActionBtn, styles.clearBtn]}
                onPress={() => {
                  onClearMeal();
                  onClose();
                }}>
                <Text style={styles.clearBtnText}>Clear Slot</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Dish Lists */}
          <FlatList
            data={
              [
                ...(inRotationList.length > 0
                  ? [{ type: 'header' as const, title: 'IN ROTATION (RECOMMENDED)' }]
                  : []),
                ...inRotationList.map((dish) => ({
                  type: 'dish' as const,
                  dish,
                  inRotation: true,
                })),
                ...(recentlyCookedList.length > 0
                  ? [{ type: 'header' as const, title: 'COOKED RECENTLY (OVERRIDE)' }]
                  : []),
                ...recentlyCookedList.map((dish) => ({
                  type: 'dish' as const,
                  dish,
                  inRotation: false,
                })),
              ]
            }
            keyExtractor={(item) =>
              item.type === 'header' ? `header_${item.title}` : item.dish.id
            }
            renderItem={({ item }) => {
              if (item.type === 'header') {
                return <Text style={styles.sectionHeader}>{item.title}</Text>;
              }

              const dish = item.dish;
              const isSelected = dish.id === currentDishId;
              const inRotation = item.inRotation;

              return (
                <TouchableOpacity
                  style={[
                    styles.dishRow,
                    isSelected && styles.selectedDishRow,
                    !inRotation && styles.dimmedDishRow,
                  ]}
                  onPress={() => {
                    onSelectDish(dish);
                    onClose();
                  }}>
                  <View style={styles.dishInfo}>
                    <Text
                      style={[
                        styles.dishName,
                        isSelected && styles.selectedDishName,
                        !inRotation && styles.dimmedDishName,
                      ]}>
                      {dish.name}
                    </Text>
                    <Text style={styles.dishTag}>
                      {inRotation ? '✨ In Rotation' : '⏱️ Cooked this cycle'}
                    </Text>
                  </View>
                  {isSelected && <Text style={styles.checkMark}>✓</Text>}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No dishes found for this category.</Text>
                <TouchableOpacity
                  style={styles.addFirstDishBtn}
                  onPress={() => {
                    onClose();
                    onCreateNewDishPrompt();
                  }}>
                  <Text style={styles.addFirstDishText}>+ Add a new {mealType} dish</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    minHeight: '55%',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  subtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  closeButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#1F2937',
  },
  closeText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#F9FAFB',
    fontSize: 15,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  quickActionBtn: {
    backgroundColor: '#374151',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  quickActionText: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '600',
  },
  clearBtn: {
    backgroundColor: '#7F1D1D',
  },
  clearBtnText: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#9CA3AF',
    marginTop: 12,
    marginBottom: 6,
  },
  dishRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1F2937',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedDishRow: {
    borderColor: '#3B82F6',
    borderWidth: 1.5,
    backgroundColor: '#1E293B',
  },
  dimmedDishRow: {
    opacity: 0.65,
    backgroundColor: '#18202F',
  },
  dishInfo: {
    flex: 1,
  },
  dishName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  selectedDishName: {
    color: '#60A5FA',
  },
  dimmedDishName: {
    color: '#94A3B8',
  },
  dishTag: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  checkMark: {
    fontSize: 18,
    color: '#3B82F6',
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 12,
  },
  addFirstDishBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  addFirstDishText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
