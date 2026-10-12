import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';
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
import { TodayRotationMiniSummary } from '../../components/TodayRotationMiniSummary';
import { CycleCelebrationBanner } from '../../components/CycleCelebrationBanner';
import {
  triggerCookHaptic,
  triggerCycleCompleteHaptic,
  triggerTapHaptic,
} from '../../utils/haptics';

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner'];

export default function TodayScreen() {
  const dispatch = useAppDispatch();
  const todayStr = getTodayDateString();

  const allDishes = useAppSelector((state) => state.dishes.items);
  const mealsMap = useAppSelector((state) => state.meals.meals);

  const breakfastRotation = useAppSelector(selectBreakfastRotation);
  const lunchRotation = useAppSelector(selectLunchRotation);
  const dinnerRotation = useAppSelector(selectDinnerRotation);

  const [activePickerMealType, setActivePickerMealType] = useState<MealType | null>(null);
  const [isNewDishModalVisible, setIsNewDishModalVisible] = useState(false);
  const [defaultNewDishCategory, setDefaultNewDishCategory] = useState<MealCategory>('dinner');
  const [dismissedCelebrations, setDismissedCelebrations] = useState<Record<string, boolean>>({});

  const dishesMap = useMemo(() => new Map(allDishes.map((d) => [d.id, d])), [allDishes]);

  const getRotationForType = (type: MealType) =>
    type === 'breakfast' ? breakfastRotation : type === 'lunch' ? lunchRotation : dinnerRotation;

  const completedCycleMealType = useMemo(() => {
    if (breakfastRotation.isCycleJustCompleted && !dismissedCelebrations.breakfast) return 'breakfast';
    if (lunchRotation.isCycleJustCompleted && !dismissedCelebrations.lunch) return 'lunch';
    if (dinnerRotation.isCycleJustCompleted && !dismissedCelebrations.dinner) return 'dinner';
    return null;
  }, [breakfastRotation, lunchRotation, dinnerRotation, dismissedCelebrations]);

  const handleSelectDish = async (mealType: MealType, dish: Dish) => {
    const existing = mealsMap[getMealKey(todayStr, mealType)];
    const input: SaveMealInput = {
      date: todayStr,
      mealType,
      plannedDishId: existing?.plannedDishId || dish.id,
      completedDishId: dish.id,
      status: 'completed',
    };
    await dispatch(saveMeal(input));
    await triggerCookHaptic();
  };

  const handleQuickComplete = async (mealType: MealType) => {
    const existing = mealsMap[getMealKey(todayStr, mealType)];
    if (!existing?.plannedDishId) return;
    await dispatch(
      saveMeal({
        date: todayStr,
        mealType,
        plannedDishId: existing.plannedDishId,
        completedDishId: existing.plannedDishId,
        status: 'completed',
      })
    );
    const rotation = getRotationForType(mealType);
    if (rotation.remainingCount <= 1) {
      await triggerCycleCompleteHaptic();
    } else {
      await triggerCookHaptic();
    }
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
    await triggerTapHaptic();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>{formatFullDate(todayStr)}</Text>
          <Text style={styles.headerTitle}>{"Today's Plate"}</Text>
        </View>

        <TodayRotationMiniSummary
          breakfastRotation={breakfastRotation}
          lunchRotation={lunchRotation}
          dinnerRotation={dinnerRotation}
        />

        {completedCycleMealType && (
          <CycleCelebrationBanner
            mealType={completedCycleMealType}
            onDismiss={() =>
              setDismissedCelebrations((prev) => ({ ...prev, [completedCycleMealType]: true }))
            }
          />
        )}

        <View style={styles.slotsContainer}>
          {MEAL_TYPES.map((type) => {
            const meal = mealsMap[getMealKey(todayStr, type)];
            return (
              <MealSlotCard
                key={type}
                mealType={type}
                dateStr={todayStr}
                meal={meal}
                plannedDish={meal?.plannedDishId ? dishesMap.get(meal.plannedDishId) : undefined}
                completedDish={meal?.completedDishId ? dishesMap.get(meal.completedDishId) : undefined}
                rotationStatus={getRotationForType(type)}
                onPressPickDish={() => {
                  triggerTapHaptic();
                  setActivePickerMealType(type);
                }}
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
          dateStr={todayStr}
          rotationStatus={getRotationForType(activePickerMealType)}
          allDishes={allDishes}
          currentDishId={
            mealsMap[getMealKey(todayStr, activePickerMealType)]?.completedDishId ||
            mealsMap[getMealKey(todayStr, activePickerMealType)]?.plannedDishId
          }
          onSelectDish={(dish) => handleSelectDish(activePickerMealType, dish)}
          onSelectSkipped={() => {
            triggerTapHaptic();
            dispatch(
              saveMeal({
                date: todayStr,
                mealType: activePickerMealType,
                plannedDishId: null,
                completedDishId: null,
                status: 'skipped',
              })
            );
          }}
          onClearMeal={() => {
            triggerTapHaptic();
            dispatch(deleteMeal({ date: todayStr, mealType: activePickerMealType }));
          }}
          onCreateNewDishPrompt={() => {
            triggerTapHaptic();
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
  container: { padding: 20, paddingBottom: 36 },
  header: { marginBottom: 16 },
  headerSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#F8FAFC', marginTop: 4 },
  slotsContainer: { marginTop: 4 },
});
