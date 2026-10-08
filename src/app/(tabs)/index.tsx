import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { getTodayDateString, formatFullDate } from '../../utils/date';
import { MealType, SaveMealInput } from '../../types/meal';
import { Dish, MealCategory } from '../../types/dish';
import {
  selectBreakfastRotation,
  selectLunchRotation,
  selectDinnerRotation,
} from '../../store/slices/rotationSelectors';
import { saveMeal, deleteMeal, getMealKey } from '../../store/slices/mealsSlice';
import { addDish } from '../../store/slices/dishesSlice';
import { MealSlotCard } from '../../components/MealSlotCard';
import { DishPickerModal } from '../../components/DishPickerModal';
import { DishFormModal } from '../../components/DishFormModal';

export default function TodayScreen() {
  const dispatch = useAppDispatch();
  const todayStr = getTodayDateString();

  const allDishes = useAppSelector((state) => state.dishes.items);
  const mealsMap = useAppSelector((state) => state.meals.meals);

  const breakfastRotation = useAppSelector(selectBreakfastRotation);
  const lunchRotation = useAppSelector(selectLunchRotation);
  const dinnerRotation = useAppSelector(selectDinnerRotation);

  // Modal states
  const [activePickerMealType, setActivePickerMealType] = useState<MealType | null>(null);
  const [isNewDishModalVisible, setIsNewDishModalVisible] = useState(false);
  const [defaultNewDishCategory, setDefaultNewDishCategory] = useState<MealCategory>('dinner');

  const dishesMap = React.useMemo(() => {
    const map = new Map<string, Dish>();
    for (const dish of allDishes) {
      map.set(dish.id, dish);
    }
    return map;
  }, [allDishes]);

  const getRotationForType = (type: MealType) => {
    if (type === 'breakfast') return breakfastRotation;
    if (type === 'lunch') return lunchRotation;
    return dinnerRotation;
  };

  // Meal slot handlers
  const handleSelectDish = async (mealType: MealType, dish: Dish) => {
    const existing = mealsMap[getMealKey(todayStr, mealType)];
    // If it was already completed or user is picking for today:
    // For Today: if user picks a dish, default to completed or planned
    const input: SaveMealInput = {
      date: todayStr,
      mealType,
      plannedDishId: existing?.plannedDishId || dish.id,
      completedDishId: dish.id,
      status: 'completed',
    };
    await dispatch(saveMeal(input));
  };

  const handleQuickComplete = async (mealType: MealType) => {
    const existing = mealsMap[getMealKey(todayStr, mealType)];
    if (!existing || !existing.plannedDishId) return;

    await dispatch(
      saveMeal({
        date: todayStr,
        mealType,
        plannedDishId: existing.plannedDishId,
        completedDishId: existing.plannedDishId,
        status: 'completed',
      })
    );
  };

  const handleUncomplete = async (mealType: MealType) => {
    const existing = mealsMap[getMealKey(todayStr, mealType)];
    if (!existing) return;

    await dispatch(
      saveMeal({
        date: todayStr,
        mealType,
        plannedDishId: existing.plannedDishId,
        completedDishId: null,
        status: 'planned',
      })
    );
  };

  const handleSelectSkipped = async (mealType: MealType) => {
    await dispatch(
      saveMeal({
        date: todayStr,
        mealType,
        plannedDishId: null,
        completedDishId: null,
        status: 'skipped',
      })
    );
  };

  const handleClearMeal = async (mealType: MealType) => {
    await dispatch(deleteMeal({ date: todayStr, mealType }));
  };

  const handleCreateNewDish = async (name: string, category: MealCategory) => {
    const created = await dispatch(addDish({ name, category })).unwrap();
    if (activePickerMealType) {
      await handleSelectDish(activePickerMealType, created);
    }
  };

  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>{formatFullDate(todayStr)}</Text>
          <Text style={styles.headerTitle}>{"Today's Plate"}</Text>
        </View>

        {/* Quick Rotation Status Bar */}
        <View style={styles.rotationCardsRow}>
          <View style={styles.miniRotationCard}>
            <Text style={styles.miniRotationLabel}>🌅 Breakfast</Text>
            <Text style={styles.miniRotationVal}>
              {breakfastRotation.remainingCount} left
            </Text>
          </View>
          <View style={styles.miniRotationCard}>
            <Text style={styles.miniRotationLabel}>☀️ Lunch</Text>
            <Text style={styles.miniRotationVal}>{lunchRotation.remainingCount} left</Text>
          </View>
          <View style={styles.miniRotationCard}>
            <Text style={styles.miniRotationLabel}>🌙 Dinner</Text>
            <Text style={styles.miniRotationVal}>{dinnerRotation.remainingCount} left</Text>
          </View>
        </View>

        {/* Meal Slots */}
        <View style={styles.slotsContainer}>
          {mealTypes.map((type) => {
            const meal = mealsMap[getMealKey(todayStr, type)];
            const plannedDish = meal?.plannedDishId ? dishesMap.get(meal.plannedDishId) : undefined;
            const completedDish = meal?.completedDishId
              ? dishesMap.get(meal.completedDishId)
              : undefined;

            return (
              <MealSlotCard
                key={type}
                mealType={type}
                dateStr={todayStr}
                meal={meal}
                plannedDish={plannedDish}
                completedDish={completedDish}
                rotationStatus={getRotationForType(type)}
                onPressPickDish={() => setActivePickerMealType(type)}
                onPressQuickComplete={() => handleQuickComplete(type)}
                onPressUncomplete={() => handleUncomplete(type)}
              />
            );
          })}
        </View>
      </ScrollView>

      {/* Dish Picker Modal */}
      {activePickerMealType && (
        <DishPickerModal
          visible={!!activePickerMealType}
          mealType={activePickerMealType}
          dateStr={todayStr}
          rotationStatus={getRotationForType(activePickerMealType)}
          allDishes={allDishes}
          currentDishId={
            mealsMap[getMealKey(todayStr, activePickerMealType)]?.completedDishId ||
            mealsMap[getMealKey(todayStr, activePickerMealType)]?.plannedDishId
          }
          onSelectDish={(dish) => handleSelectDish(activePickerMealType, dish)}
          onSelectSkipped={() => handleSelectSkipped(activePickerMealType)}
          onClearMeal={() => handleClearMeal(activePickerMealType)}
          onCreateNewDishPrompt={() => {
            setDefaultNewDishCategory(activePickerMealType);
            setIsNewDishModalVisible(true);
          }}
          onClose={() => setActivePickerMealType(null)}
        />
      )}

      {/* New Dish Modal */}
      <DishFormModal
        visible={isNewDishModalVisible}
        defaultCategory={defaultNewDishCategory}
        onSaveSingle={handleCreateNewDish}
        onSaveBatch={() => {}}
        onClose={() => setIsNewDishModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  container: {
    padding: 20,
    paddingBottom: 36,
  },
  header: {
    marginBottom: 16,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 4,
  },
  rotationCardsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  miniRotationCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  miniRotationLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  miniRotationVal: {
    fontSize: 13,
    color: '#34D399',
    fontWeight: '700',
    marginTop: 3,
  },
  slotsContainer: {
    marginTop: 4,
  },
});
