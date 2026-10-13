import { describe, it, expect } from 'vitest';
import {
  getSuggestedDishForSlot,
  generateDaySuggestions,
  generateWeekSuggestions,
  suggestionsToSaveInputs,
} from '../autoSuggestEngine';
import { Dish } from '../../types/dish';
import { Meal, MealType } from '../../types/meal';
import { CategoryRotationStatus } from '../../types/rotation';

const mockDish = (id: string, name: string, category: 'breakfast' | 'lunch' | 'dinner' | 'all'): Dish => ({
  id,
  name,
  category,
  isActive: true,
  createdAt: '2026-10-01T00:00:00.000Z',
});

describe('autoSuggestEngine', () => {
  const dish1 = mockDish('d1', 'Pancakes', 'breakfast');
  const dish2 = mockDish('d2', 'Oatmeal', 'breakfast');
  const dish3 = mockDish('d3', 'Eggs Benedict', 'breakfast');

  const baseBreakfastRotation: CategoryRotationStatus = {
    mealType: 'breakfast',
    totalEligible: 3,
    completedCount: 1,
    remainingCount: 2,
    availableDishes: [dish2, dish3],
    recentlyCookedDishes: [dish1],
    isCycleJustCompleted: false,
  };

  it('selects the first available dish from active rotation cycle', () => {
    const suggested = getSuggestedDishForSlot(baseBreakfastRotation);
    expect(suggested?.id).toBe('d2');
  });

  it('skips dishes provided in excludedDishIds', () => {
    const suggested = getSuggestedDishForSlot(baseBreakfastRotation, ['d2']);
    expect(suggested?.id).toBe('d3');
  });

  it('falls back to recently cooked dishes if all available are excluded', () => {
    const rotationOnlyCooked: CategoryRotationStatus = {
      mealType: 'breakfast',
      totalEligible: 2,
      completedCount: 2,
      remainingCount: 0,
      availableDishes: [],
      recentlyCookedDishes: [dish1, dish2],
      isCycleJustCompleted: false,
    };

    const suggested = getSuggestedDishForSlot(rotationOnlyCooked, ['d1']);
    expect(suggested?.id).toBe('d2');
  });

  it('returns null if there are zero eligible dishes in category', () => {
    const emptyRotation: CategoryRotationStatus = {
      mealType: 'dinner',
      totalEligible: 0,
      completedCount: 0,
      remainingCount: 0,
      availableDishes: [],
      recentlyCookedDishes: [],
      isCycleJustCompleted: false,
    };

    const suggested = getSuggestedDishForSlot(emptyRotation);
    expect(suggested).toBeNull();
  });

  describe('generateDaySuggestions', () => {
    const lunch1 = mockDish('l1', 'Chicken Caesar Salad', 'lunch');
    const dinner1 = mockDish('din1', 'Grilled Salmon', 'dinner');

    const baseRotations: Record<MealType, CategoryRotationStatus> = {
      breakfast: baseBreakfastRotation,
      lunch: {
        mealType: 'lunch',
        totalEligible: 1,
        completedCount: 0,
        remainingCount: 1,
        availableDishes: [lunch1],
        recentlyCookedDishes: [],
        isCycleJustCompleted: false,
      },
      dinner: {
        mealType: 'dinner',
        totalEligible: 1,
        completedCount: 0,
        remainingCount: 1,
        availableDishes: [dinner1],
        recentlyCookedDishes: [],
        isCycleJustCompleted: false,
      },
    };

    it('generates suggestions for all 3 empty slots on a day', () => {
      const suggestions = generateDaySuggestions('2026-10-15', {}, baseRotations);
      expect(suggestions).toHaveLength(3);
      expect(suggestions[0].mealType).toBe('breakfast');
      expect(suggestions[0].dish.id).toBe('d2');
      expect(suggestions[1].mealType).toBe('lunch');
      expect(suggestions[1].dish.id).toBe('l1');
      expect(suggestions[2].mealType).toBe('dinner');
      expect(suggestions[2].dish.id).toBe('din1');
    });

    it('skips slots that already have planned, completed, or skipped meals', () => {
      const mealsMap: Record<string, Meal> = {
        '2026-10-15_breakfast': {
          id: 'meal_2026-10-15_breakfast',
          date: '2026-10-15',
          mealType: 'breakfast',
          plannedDishId: 'd1',
          completedDishId: null,
          status: 'planned',
          notes: null,
          updatedAt: '2026-10-15T08:00:00Z',
        },
        '2026-10-15_dinner': {
          id: 'meal_2026-10-15_dinner',
          date: '2026-10-15',
          mealType: 'dinner',
          plannedDishId: null,
          completedDishId: null,
          status: 'skipped',
          notes: null,
          updatedAt: '2026-10-15T18:00:00Z',
        },
      };

      const suggestions = generateDaySuggestions('2026-10-15', mealsMap, baseRotations);
      // Only lunch was empty!
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].mealType).toBe('lunch');
      expect(suggestions[0].dish.id).toBe('l1');
    });
  });

  describe('generateWeekSuggestions', () => {
    const l1 = mockDish('l1', 'Wrap', 'lunch');
    const l2 = mockDish('l2', 'Soup', 'lunch');
    const din1 = mockDish('din1', 'Steak', 'dinner');
    const din2 = mockDish('din2', 'Pasta', 'dinner');

    const rotations: Record<MealType, CategoryRotationStatus> = {
      breakfast: {
        mealType: 'breakfast',
        totalEligible: 2,
        completedCount: 0,
        remainingCount: 2,
        availableDishes: [dish1, dish2],
        recentlyCookedDishes: [],
        isCycleJustCompleted: false,
      },
      lunch: {
        mealType: 'lunch',
        totalEligible: 2,
        completedCount: 0,
        remainingCount: 2,
        availableDishes: [l1, l2],
        recentlyCookedDishes: [],
        isCycleJustCompleted: false,
      },
      dinner: {
        mealType: 'dinner',
        totalEligible: 2,
        completedCount: 0,
        remainingCount: 2,
        availableDishes: [din1, din2],
        recentlyCookedDishes: [],
        isCycleJustCompleted: false,
      },
    };

    it('generates suggestions across the 7 days of the week', () => {
      const suggestions = generateWeekSuggestions('2026-10-12', {}, rotations);
      // 7 days * 3 meals = 21 suggestions
      expect(suggestions).toHaveLength(21);

      // Verify breakfast alternated between d1 and d2
      const breakfasts = suggestions.filter((s) => s.mealType === 'breakfast');
      expect(breakfasts[0].dish.id).toBe('d1');
      expect(breakfasts[1].dish.id).toBe('d2');
    });
  });

  describe('suggestionsToSaveInputs', () => {
    it('sets status to planned and completedDishId to null (Option B invariant)', () => {
      const suggestions = [
        { date: '2026-10-15', mealType: 'breakfast' as MealType, dish: dish1 },
      ];
      const inputs = suggestionsToSaveInputs(suggestions);

      expect(inputs).toHaveLength(1);
      expect(inputs[0].date).toBe('2026-10-15');
      expect(inputs[0].mealType).toBe('breakfast');
      expect(inputs[0].plannedDishId).toBe('d1');
      expect(inputs[0].completedDishId).toBeNull();
      expect(inputs[0].status).toBe('planned');
    });
  });
});
