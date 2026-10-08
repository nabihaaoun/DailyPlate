import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  getTodayDateString,
  addDays,
  formatDisplayDate,
  formatFullDate,
  parseDateString,
} from '../../utils/date';
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

export default function PlannerScreen() {
  const dispatch = useAppDispatch();
  const todayStr = getTodayDateString();

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const allDishes = useAppSelector((state) => state.dishes.items);
  const mealsMap = useAppSelector((state) => state.meals.meals);

  const breakfastRotation = useAppSelector(selectBreakfastRotation);
  const lunchRotation = useAppSelector(selectLunchRotation);
  const dinnerRotation = useAppSelector(selectDinnerRotation);

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

  // Generate 14-day horizontal strip (from -3 days to +10 days)
  const dateStrip = React.useMemo(() => {
    const list: string[] = [];
    for (let i = -3; i <= 10; i++) {
      list.push(addDays(todayStr, i));
    }
    return list;
  }, [todayStr]);

  const isFutureDate = selectedDate > todayStr;

  const handleSelectDish = async (mealType: MealType, dish: Dish) => {
    const existing = mealsMap[getMealKey(selectedDate, mealType)];

    // For future dates: default to 'planned'
    // For today or past dates: user can plan or mark cooked
    const defaultStatus = isFutureDate ? 'planned' : 'completed';

    const input: SaveMealInput = {
      date: selectedDate,
      mealType,
      plannedDishId: dish.id,
      completedDishId: defaultStatus === 'completed' ? dish.id : existing?.completedDishId || null,
      status: defaultStatus,
    };
    await dispatch(saveMeal(input));
  };

  const handleQuickComplete = async (mealType: MealType) => {
    const existing = mealsMap[getMealKey(selectedDate, mealType)];
    if (!existing || !existing.plannedDishId) return;

    await dispatch(
      saveMeal({
        date: selectedDate,
        mealType,
        plannedDishId: existing.plannedDishId,
        completedDishId: existing.plannedDishId,
        status: 'completed',
      })
    );
  };

  const handleUncomplete = async (mealType: MealType) => {
    const existing = mealsMap[getMealKey(selectedDate, mealType)];
    if (!existing) return;

    await dispatch(
      saveMeal({
        date: selectedDate,
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
        date: selectedDate,
        mealType,
        plannedDishId: null,
        completedDishId: null,
        status: 'skipped',
      })
    );
  };

  const handleClearMeal = async (mealType: MealType) => {
    await dispatch(deleteMeal({ date: selectedDate, mealType }));
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
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.headerTitle}>Planner & History</Text>
          <TouchableOpacity
            style={styles.todayJumpBtn}
            onPress={() => setSelectedDate(todayStr)}>
            <Text style={styles.todayJumpText}>Today</Text>
          </TouchableOpacity>
        </View>

        {/* Date Strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stripContainer}>
          {dateStrip.map((dateStr) => {
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === todayStr;
            const parsed = parseDateString(dateStr);
            const dayName = parsed.toLocaleDateString(undefined, { weekday: 'narrow' });
            const dayNum = parsed.getDate();

            // Check if meals exist on this day
            const hasMeals = mealTypes.some(
              (t) => !!mealsMap[getMealKey(dateStr, t)]
            );

            return (
              <TouchableOpacity
                key={dateStr}
                style={[
                  styles.stripCard,
                  isSelected && styles.selectedStripCard,
                  isToday && !isSelected && styles.todayStripCard,
                ]}
                onPress={() => setSelectedDate(dateStr)}>
                <Text
                  style={[
                    styles.stripDayName,
                    isSelected && styles.selectedStripText,
                  ]}>
                  {dayName}
                </Text>
                <Text
                  style={[
                    styles.stripDayNum,
                    isSelected && styles.selectedStripText,
                  ]}>
                  {dayNum}
                </Text>
                {hasMeals && (
                  <View
                    style={[
                      styles.dotIndicator,
                      isSelected && styles.selectedDot,
                    ]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Selected Day Content */}
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.dateLabelRow}>
          <Text style={styles.fullDateLabel}>{formatFullDate(selectedDate)}</Text>
          <Text style={styles.relativeDateLabel}>{formatDisplayDate(selectedDate)}</Text>
        </View>

        <View style={styles.slotsContainer}>
          {mealTypes.map((type) => {
            const meal = mealsMap[getMealKey(selectedDate, type)];
            const plannedDish = meal?.plannedDishId ? dishesMap.get(meal.plannedDishId) : undefined;
            const completedDish = meal?.completedDishId
              ? dishesMap.get(meal.completedDishId)
              : undefined;

            return (
              <MealSlotCard
                key={type}
                mealType={type}
                dateStr={selectedDate}
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
          dateStr={selectedDate}
          rotationStatus={getRotationForType(activePickerMealType)}
          allDishes={allDishes}
          currentDishId={
            mealsMap[getMealKey(selectedDate, activePickerMealType)]?.completedDishId ||
            mealsMap[getMealKey(selectedDate, activePickerMealType)]?.plannedDishId
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  todayJumpBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
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
  stripContainer: {
    gap: 8,
    paddingVertical: 4,
  },
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
  container: {
    padding: 20,
    paddingBottom: 40,
  },
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
  slotsContainer: {},
});
