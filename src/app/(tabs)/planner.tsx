import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { getTodayDateString, addDays } from '../../utils/date';
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
import { CalendarStrip } from '../../components/CalendarStrip';
import { PlannerDateHeader } from '../../components/PlannerDateHeader';

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner'];

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

  const dishesMap = useMemo(() => new Map(allDishes.map((d) => [d.id, d])), [allDishes]);

  const getRotationForType = (type: MealType) =>
    type === 'breakfast' ? breakfastRotation : type === 'lunch' ? lunchRotation : dinnerRotation;

  const dateStrip = useMemo(() => {
    const list: string[] = [];
    for (let i = -3; i <= 10; i++) {
      list.push(addDays(todayStr, i));
    }
    return list;
  }, [todayStr]);

  const isFutureDate = selectedDate > todayStr;

  const handleSelectDish = async (mealType: MealType, dish: Dish) => {
    const existing = mealsMap[getMealKey(selectedDate, mealType)];
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
    if (!existing?.plannedDishId) return;
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />
      <CalendarStrip
        dates={dateStrip}
        selectedDate={selectedDate}
        todayStr={todayStr}
        mealsMap={mealsMap}
        onSelectDate={setSelectedDate}
        onJumpToday={() => setSelectedDate(todayStr)}
      />

      <ScrollView contentContainerStyle={styles.container}>
        <PlannerDateHeader selectedDate={selectedDate} />

        <View style={styles.slotsContainer}>
          {MEAL_TYPES.map((type) => {
            const meal = mealsMap[getMealKey(selectedDate, type)];
            return (
              <MealSlotCard
                key={type}
                mealType={type}
                dateStr={selectedDate}
                meal={meal}
                plannedDish={meal?.plannedDishId ? dishesMap.get(meal.plannedDishId) : undefined}
                completedDish={meal?.completedDishId ? dishesMap.get(meal.completedDishId) : undefined}
                rotationStatus={getRotationForType(type)}
                onPressPickDish={() => setActivePickerMealType(type)}
                onPressQuickComplete={() => handleQuickComplete(type)}
                onPressUncomplete={() => handleUncomplete(type)}
              />
            );
          })}
        </View>
      </ScrollView>

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
          onSelectSkipped={() =>
            dispatch(
              saveMeal({
                date: selectedDate,
                mealType: activePickerMealType,
                plannedDishId: null,
                completedDishId: null,
                status: 'skipped',
              })
            )
          }
          onClearMeal={() =>
            dispatch(deleteMeal({ date: selectedDate, mealType: activePickerMealType }))
          }
          onCreateNewDishPrompt={() => {
            setDefaultNewDishCategory(activePickerMealType);
            setIsNewDishModalVisible(true);
          }}
          onClose={() => setActivePickerMealType(null)}
        />
      )}

      <DishFormModal
        visible={isNewDishModalVisible}
        defaultCategory={defaultNewDishCategory}
        onSaveSingle={async (name, category) => {
          const created = await dispatch(addDish({ name, category })).unwrap();
          if (activePickerMealType) await handleSelectDish(activePickerMealType, created);
        }}
        onSaveBatch={() => {}}
        onClose={() => setIsNewDishModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B1120' },
  container: { padding: 20, paddingBottom: 40 },
  slotsContainer: {},
});
