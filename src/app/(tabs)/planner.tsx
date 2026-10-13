import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { getTodayDateString } from '../../utils/date';
import { MealType, SaveMealInput } from '../../types/meal';
import { Dish, MealCategory } from '../../types/dish';
import {
  selectBreakfastRotation,
  selectLunchRotation,
  selectDinnerRotation,
} from '../../store/slices/rotationSelectors';
import { saveMeal, saveMealBatch, deleteMeal, getMealKey } from '../../store/slices/mealsSlice';
import { addDish } from '../../store/slices/dishesSlice';
import { MealSlotCard } from '../../components/MealSlotCard';
import { DishPickerModal } from '../../components/DishPickerModal';
import { DishFormModal } from '../../components/DishFormModal';
import { CalendarStrip } from '../../components/CalendarStrip';
import { PlannerDateHeader } from '../../components/PlannerDateHeader';
import { MoveMealModal } from '../../components/MoveMealModal';
import { AutoPlanActionsBar } from '../../components/AutoPlanActionsBar';
import { AutoPlanModal } from '../../components/AutoPlanModal';
import {
  generateDaySuggestions,
  generateWeekSuggestions,
  getSuggestedDishForSlot,
  suggestionsToSaveInputs,
  PlanSuggestion,
} from '../../domain/autoSuggestEngine';
import { triggerCookHaptic, triggerTapHaptic } from '../../utils/haptics';

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
  const [movingMeal, setMovingMeal] = useState<{
    dish: Dish;
    date: string;
    mealType: MealType;
  } | null>(null);
  const [weekSuggestions, setWeekSuggestions] = useState<PlanSuggestion[]>([]);
  const [isWeekModalVisible, setIsWeekModalVisible] = useState(false);

  const dishesMap = useMemo(() => new Map(allDishes.map((d) => [d.id, d])), [allDishes]);

  const getRotationForType = (type: MealType) =>
    type === 'breakfast' ? breakfastRotation : type === 'lunch' ? lunchRotation : dinnerRotation;

  const emptySlotsCount = useMemo(() => {
    return MEAL_TYPES.filter((type) => {
      const meal = mealsMap[getMealKey(selectedDate, type)];
      return !meal || (!meal.plannedDishId && !meal.completedDishId && meal.status !== 'skipped');
    }).length;
  }, [mealsMap, selectedDate]);

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
    if (defaultStatus === 'completed') {
      await triggerCookHaptic();
    } else {
      await triggerTapHaptic();
    }
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
    await triggerCookHaptic();
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
    await triggerTapHaptic();
  };

  const handleSuggestSingle = async (mealType: MealType) => {
    const rotation = getRotationForType(mealType);
    const suggested = getSuggestedDishForSlot(rotation);
    if (!suggested) return;
    await dispatch(
      saveMeal({
        date: selectedDate,
        mealType,
        plannedDishId: suggested.id,
        completedDishId: null,
        status: 'planned',
      })
    );
    await triggerTapHaptic();
  };

  const handleAutoFillDay = async () => {
    const suggestions = generateDaySuggestions(selectedDate, mealsMap, {
      breakfast: breakfastRotation,
      lunch: lunchRotation,
      dinner: dinnerRotation,
    });
    if (suggestions.length === 0) return;
    const inputs = suggestionsToSaveInputs(suggestions);
    await dispatch(saveMealBatch(inputs));
    await triggerCookHaptic();
  };

  const handleOpenWeekPlanner = () => {
    triggerTapHaptic();
    const suggestions = generateWeekSuggestions(selectedDate, mealsMap, {
      breakfast: breakfastRotation,
      lunch: lunchRotation,
      dinner: dinnerRotation,
    });
    setWeekSuggestions(suggestions);
    setIsWeekModalVisible(true);
  };

  const handleApplyWeekPlan = async () => {
    if (weekSuggestions.length === 0) return;
    const inputs = suggestionsToSaveInputs(weekSuggestions);
    await dispatch(saveMealBatch(inputs));
    await triggerCookHaptic();
    setIsWeekModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />
      <CalendarStrip
        selectedDate={selectedDate}
        todayStr={todayStr}
        mealsMap={mealsMap}
        onSelectDate={(d) => {
          triggerTapHaptic();
          setSelectedDate(d);
        }}
        onJumpToday={() => {
          triggerTapHaptic();
          setSelectedDate(todayStr);
        }}
      />

      <ScrollView contentContainerStyle={styles.container}>
        <PlannerDateHeader selectedDate={selectedDate} />

        <AutoPlanActionsBar
          emptySlotsCount={emptySlotsCount}
          onPressAutoFillDay={handleAutoFillDay}
          onPressOpenWeekPlanner={handleOpenWeekPlanner}
        />

        <View style={styles.slotsContainer}>
          {MEAL_TYPES.map((type) => {
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
                onPressPickDish={() => {
                  triggerTapHaptic();
                  setActivePickerMealType(type);
                }}
                onPressQuickComplete={() => handleQuickComplete(type)}
                onPressUncomplete={() => handleUncomplete(type)}
                onPressSuggest={() => handleSuggestSingle(type)}
                onPressMove={
                  plannedDish && meal?.status === 'planned'
                    ? () => setMovingMeal({ dish: plannedDish, date: selectedDate, mealType: type })
                    : undefined
                }
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
          onSelectSkipped={() => {
            triggerTapHaptic();
            dispatch(
              saveMeal({
                date: selectedDate,
                mealType: activePickerMealType,
                plannedDishId: null,
                completedDishId: null,
                status: 'skipped',
              })
            );
          }}
          onClearMeal={() => {
            triggerTapHaptic();
            dispatch(deleteMeal({ date: selectedDate, mealType: activePickerMealType }));
          }}
          onCreateNewDishPrompt={() => {
            triggerTapHaptic();
            setDefaultNewDishCategory(activePickerMealType);
            setIsNewDishModalVisible(true);
          }}
          onClose={() => setActivePickerMealType(null)}
        />
      )}

      {movingMeal && (
        <MoveMealModal
          visible={!!movingMeal}
          dish={movingMeal.dish}
          sourceDate={movingMeal.date}
          sourceMealType={movingMeal.mealType}
          onConfirmMove={async (targetDate, targetMealType) => {
            await dispatch(deleteMeal({ date: movingMeal.date, mealType: movingMeal.mealType }));
            await dispatch(
              saveMeal({
                date: targetDate,
                mealType: targetMealType,
                plannedDishId: movingMeal.dish.id,
                completedDishId: null,
                status: 'planned',
              })
            );
            await triggerTapHaptic();
            setMovingMeal(null);
          }}
          onClose={() => setMovingMeal(null)}
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

      <AutoPlanModal
        visible={isWeekModalVisible}
        suggestions={weekSuggestions}
        onConfirm={handleApplyWeekPlan}
        onClose={() => setIsWeekModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B1120' },
  container: { padding: 20, paddingBottom: 40 },
  slotsContainer: {},
});
