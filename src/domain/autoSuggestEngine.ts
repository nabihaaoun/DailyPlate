import { Dish } from '../types/dish';
import { Meal, MealType, SaveMealInput, getMealKey } from '../types/meal';
import { CategoryRotationStatus } from '../types/rotation';
import { getWeekDays } from '../utils/date';

export interface PlanSuggestion {
  date: string;
  mealType: MealType;
  dish: Dish;
}

const ALL_MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner'];

/**
 * Selects the best candidate dish for a given meal slot based on rotation status.
 * Prioritizes available dishes (not yet cooked in the active rotation cycle).
 * Filters out dishes provided in `excludedDishIds` to avoid immediate repetitions.
 */
export function getSuggestedDishForSlot(
  rotation: CategoryRotationStatus,
  excludedDishIds: string[] = []
): Dish | null {
  const excludedSet = new Set(excludedDishIds);

  // 1. First priority: eligible dishes that have NOT been cooked in current cycle
  // and are not in excludedDishIds
  const freshAvailable = rotation.availableDishes.filter((d) => !excludedSet.has(d.id));
  if (freshAvailable.length > 0) {
    return freshAvailable[0];
  }

  // 2. If all available dishes are in excludedSet, but availableDishes has items, fallback to first available
  if (rotation.availableDishes.length > 0) {
    return rotation.availableDishes[0];
  }

  // 3. Fallback: all eligible dishes (recently cooked) not in excludedSet
  const allEligible = [...rotation.availableDishes, ...rotation.recentlyCookedDishes];
  const freshEligible = allEligible.filter((d) => !excludedSet.has(d.id));
  if (freshEligible.length > 0) {
    return freshEligible[0];
  }

  // 4. Ultimate fallback: first eligible dish if any exist
  return allEligible.length > 0 ? allEligible[0] : null;
}

/**
 * Generates suggestions for any unfilled meal slots on a single date.
 * Slots that already have a planned dish, completed dish, or are skipped are left untouched.
 */
export function generateDaySuggestions(
  date: string,
  mealsMap: Record<string, Meal>,
  rotations: Record<MealType, CategoryRotationStatus>
): PlanSuggestion[] {
  const suggestions: PlanSuggestion[] = [];
  const assignedDishIds: string[] = [];

  for (const mealType of ALL_MEAL_TYPES) {
    const existing = mealsMap[getMealKey(date, mealType)];
    const isSlotOccupied =
      !!existing && (!!existing.plannedDishId || !!existing.completedDishId || existing.status === 'skipped');

    if (!isSlotOccupied) {
      const suggested = getSuggestedDishForSlot(rotations[mealType], assignedDishIds);
      if (suggested) {
        suggestions.push({ date, mealType, dish: suggested });
        assignedDishIds.push(suggested.id);
      }
    }
  }

  return suggestions;
}

/**
 * Generates suggestions for unfilled meal slots across a 7-day week starting from anchorDate.
 * Tracks recently assigned dishes per category across consecutive days to maximize variety.
 */
export function generateWeekSuggestions(
  anchorDate: string,
  mealsMap: Record<string, Meal>,
  rotations: Record<MealType, CategoryRotationStatus>
): PlanSuggestion[] {
  const days = getWeekDays(anchorDate);
  const suggestions: PlanSuggestion[] = [];

  // Track assigned dishes per meal type across the week to rotate through the catalog
  const assignedPerCategory: Record<MealType, string[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
  };

  for (const date of days) {
    for (const mealType of ALL_MEAL_TYPES) {
      const existing = mealsMap[getMealKey(date, mealType)];
      const isSlotOccupied =
        !!existing && (!!existing.plannedDishId || !!existing.completedDishId || existing.status === 'skipped');

      if (!isSlotOccupied) {
        const rotation = rotations[mealType];
        const assignedSoFar = assignedPerCategory[mealType];

        // If we've already assigned all available dishes, reset our local session history for that category
        const availablePoolCount = rotation.availableDishes.length || rotation.totalEligible;
        const exclusionList = assignedSoFar.length >= availablePoolCount ? [] : assignedSoFar;

        const suggested = getSuggestedDishForSlot(rotation, exclusionList);
        if (suggested) {
          suggestions.push({ date, mealType, dish: suggested });
          assignedPerCategory[mealType].push(suggested.id);
        }
      }
    }
  }

  return suggestions;
}

/**
 * Converts plan suggestions into SaveMealInput objects for Redux / SQLite persistence.
 * CRITICAL INVARIANT: All auto-suggested meals are created as status = 'planned'
 * with completedDishId = null. They have zero impact on rotation state until cooked!
 */
export function suggestionsToSaveInputs(suggestions: PlanSuggestion[]): SaveMealInput[] {
  return suggestions.map((s) => ({
    date: s.date,
    mealType: s.mealType,
    plannedDishId: s.dish.id,
    completedDishId: null,
    status: 'planned',
  }));
}
