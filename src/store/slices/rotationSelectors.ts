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

      // If only 1 dish exists, it is always available
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

      // 2. All completed meals for this meal type, sorted chronologically
      const completedMeals: Meal[] = Object.values(mealsMap)
        .filter(
          (m) =>
            m.mealType === mealType &&
            m.status === 'completed' &&
            m.completedDishId !== null &&
            eligibleIdsSet.has(m.completedDishId)
        )
        .sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          return a.updatedAt.localeCompare(b.updatedAt);
        });

      // 3. Accumulate cycle
      let currentCycleCompletedDishIds = new Set<string>();

      for (const meal of completedMeals) {
        const dishId = meal.completedDishId!;
        if (
          currentCycleCompletedDishIds.has(dishId) ||
          currentCycleCompletedDishIds.size >= eligibleDishes.length
        ) {
          // Restart cycle with this dish
          currentCycleCompletedDishIds = new Set<string>([dishId]);
        } else {
          currentCycleCompletedDishIds.add(dishId);
        }
      }

      // 4. Check if cycle is complete (all dishes cooked once)
      const isCycleJustCompleted = currentCycleCompletedDishIds.size >= eligibleDishes.length;

      let availableDishes: Dish[];
      let recentlyCookedDishes: Dish[];

      if (isCycleJustCompleted) {
        // Full reset: all dishes are available again for the next cook
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
