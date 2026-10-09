import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { Dish } from '../../types/dish';
import { Meal, MealType } from '../../types/meal';
import { CategoryRotationStatus } from '../../types/rotation';

const selectDishesList = (state: RootState) => state.dishes.items;
const selectMealsMap = (state: RootState) => state.meals.meals;

export const makeSelectRotationForCategory = (mealType: MealType) =>
  createSelector(
    [selectDishesList, selectMealsMap],
    (dishes, mealsMap): CategoryRotationStatus => {
      // 1. Eligible active dishes for this category
      const eligibleDishes = dishes.filter(
        (dish) => dish.isActive && (dish.category === mealType || dish.category === 'all')
      );

      // Boundary: Empty category (N = 0)
      if (eligibleDishes.length === 0) {
        return {
          mealType,
          totalEligible: 0,
          completedCount: 0,
          remainingCount: 0,
          availableDishes: [],
          recentlyCookedDishes: [],
          isCycleJustCompleted: false,
        };
      }

      // Boundary: Single-dish category (N = 1) -> Always available, never locked out
      if (eligibleDishes.length === 1) {
        return {
          mealType,
          totalEligible: 1,
          completedCount: 0,
          remainingCount: 1,
          availableDishes: eligibleDishes,
          recentlyCookedDishes: [],
          isCycleJustCompleted: false,
        };
      }

      const eligibleIdsSet = new Set(eligibleDishes.map((d) => d.id));

      // 2. Completed meals for this meal type, sorted strictly by calendar date ASC
      const completedMeals: Meal[] = Object.values(mealsMap)
        .filter(
          (m) =>
            m.mealType === mealType &&
            m.status === 'completed' &&
            m.completedDishId !== null &&
            eligibleIdsSet.has(m.completedDishId)
        )
        .sort((a, b) => {
          // Stable calendar date order
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          return a.updatedAt.localeCompare(b.updatedAt);
        });

      // 3. Option B Cycle Accumulator
      let currentCycleCompletedDishIds = new Set<string>();
      let isCycleJustCompleted = false;

      for (const meal of completedMeals) {
        const dishId = meal.completedDishId!;

        if (isCycleJustCompleted) {
          // The previous meal completed a cycle; this meal initiates a new cycle
          currentCycleCompletedDishIds = new Set<string>([dishId]);
          isCycleJustCompleted = false;
        } else {
          // In Option B: repeats do not reset the cycle; only new unique dishes grow the cycle
          currentCycleCompletedDishIds.add(dishId);
        }

        // Check if this meal completed the rotation cycle
        if (currentCycleCompletedDishIds.size >= eligibleDishes.length) {
          isCycleJustCompleted = true;
        }
      }

      // 4. Derive output sets
      let availableDishes: Dish[];
      let recentlyCookedDishes: Dish[];

      if (isCycleJustCompleted) {
        // Cycle just completed: all dishes reset to available for the next meal
        availableDishes = eligibleDishes;
        recentlyCookedDishes = [];
      } else {
        availableDishes = eligibleDishes.filter((d) => !currentCycleCompletedDishIds.has(d.id));
        recentlyCookedDishes = eligibleDishes.filter((d) =>
          currentCycleCompletedDishIds.has(d.id)
        );
      }

      return {
        mealType,
        totalEligible: eligibleDishes.length,
        completedCount: isCycleJustCompleted ? 0 : currentCycleCompletedDishIds.size,
        remainingCount: availableDishes.length,
        availableDishes,
        recentlyCookedDishes,
        isCycleJustCompleted,
      };
    }
  );

export const selectBreakfastRotation = makeSelectRotationForCategory('breakfast');
export const selectLunchRotation = makeSelectRotationForCategory('lunch');
export const selectDinnerRotation = makeSelectRotationForCategory('dinner');
