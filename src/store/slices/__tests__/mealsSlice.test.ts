import { describe, it, expect, vi } from 'vitest';
import mealsReducer, {
  MealsState,
  getMealKey,
  saveMeal,
  saveMealBatch,
  deleteMeal,
} from '../mealsSlice';
import { Meal } from '../../../types/meal';

vi.mock('../../../db/mealsRepository', () => ({
  fetchAllMeals: vi.fn(),
  upsertMeal: vi.fn(),
  upsertMealsBatch: vi.fn(),
  removeMeal: vi.fn(),
}));

describe('Meal Slot State Transitions & Reducer Invariants', () => {
  const initialMealsState: MealsState = {
    meals: {},
    isLoading: false,
    error: null,
  };

  it('T-1: Plan Empty Slot (Empty -> Planned)', () => {
    const plannedMeal: Meal = {
      id: 'meal_2026-10-10_lunch',
      date: '2026-10-10',
      mealType: 'lunch',
      plannedDishId: 'dish_a',
      completedDishId: null,
      status: 'planned',
      notes: null,
      updatedAt: '2026-10-01T12:00:00Z',
    };

    const action = { type: saveMeal.fulfilled.type, payload: plannedMeal };
    const nextState = mealsReducer(initialMealsState, action);

    const key = getMealKey('2026-10-10', 'lunch');
    expect(nextState.meals[key]).toBeDefined();
    expect(nextState.meals[key].status).toBe('planned');
    expect(nextState.meals[key].plannedDishId).toBe('dish_a');
    expect(nextState.meals[key].completedDishId).toBeNull();
  });

  it('T-2: Direct Cook (Empty -> Completed)', () => {
    const completedMeal: Meal = {
      id: 'meal_2026-10-10_lunch',
      date: '2026-10-10',
      mealType: 'lunch',
      plannedDishId: 'dish_a',
      completedDishId: 'dish_a',
      status: 'completed',
      notes: null,
      updatedAt: '2026-10-10T12:00:00Z',
    };

    const action = { type: saveMeal.fulfilled.type, payload: completedMeal };
    const nextState = mealsReducer(initialMealsState, action);

    const key = getMealKey('2026-10-10', 'lunch');
    expect(nextState.meals[key].status).toBe('completed');
    expect(nextState.meals[key].completedDishId).toBe('dish_a');
  });

  it('T-3: Skip Empty Slot (Empty -> Skipped)', () => {
    const skippedMeal: Meal = {
      id: 'meal_2026-10-10_lunch',
      date: '2026-10-10',
      mealType: 'lunch',
      plannedDishId: null,
      completedDishId: null,
      status: 'skipped',
      notes: null,
      updatedAt: '2026-10-10T12:00:00Z',
    };

    const action = { type: saveMeal.fulfilled.type, payload: skippedMeal };
    const nextState = mealsReducer(initialMealsState, action);

    const key = getMealKey('2026-10-10', 'lunch');
    expect(nextState.meals[key].status).toBe('skipped');
    expect(nextState.meals[key].plannedDishId).toBeNull();
    expect(nextState.meals[key].completedDishId).toBeNull();
  });

  it('T-4: Planned -> Cook Planned Dish', () => {
    const startState: MealsState = {
      meals: {
        '2026-10-10_lunch': {
          id: 'meal_2026-10-10_lunch',
          date: '2026-10-10',
          mealType: 'lunch',
          plannedDishId: 'dish_a',
          completedDishId: null,
          status: 'planned',
          notes: null,
          updatedAt: '2026-10-01T12:00:00Z',
        },
      },
      isLoading: false,
      error: null,
    };

    const updatedMeal: Meal = {
      id: 'meal_2026-10-10_lunch',
      date: '2026-10-10',
      mealType: 'lunch',
      plannedDishId: 'dish_a',
      completedDishId: 'dish_a',
      status: 'completed',
      notes: null,
      updatedAt: '2026-10-10T12:30:00Z',
    };

    const action = { type: saveMeal.fulfilled.type, payload: updatedMeal };
    const nextState = mealsReducer(startState, action);

    const key = getMealKey('2026-10-10', 'lunch');
    expect(nextState.meals[key].status).toBe('completed');
    expect(nextState.meals[key].plannedDishId).toBe('dish_a');
    expect(nextState.meals[key].completedDishId).toBe('dish_a');
  });

  it('T-5: Planned -> Cook Different Dish', () => {
    const startState: MealsState = {
      meals: {
        '2026-10-10_lunch': {
          id: 'meal_2026-10-10_lunch',
          date: '2026-10-10',
          mealType: 'lunch',
          plannedDishId: 'dish_a',
          completedDishId: null,
          status: 'planned',
          notes: null,
          updatedAt: '2026-10-01T12:00:00Z',
        },
      },
      isLoading: false,
      error: null,
    };

    const updatedMeal: Meal = {
      id: 'meal_2026-10-10_lunch',
      date: '2026-10-10',
      mealType: 'lunch',
      plannedDishId: 'dish_a', // Preserves planned
      completedDishId: 'dish_b', // Cooked dish b
      status: 'completed',
      notes: null,
      updatedAt: '2026-10-10T12:30:00Z',
    };

    const action = { type: saveMeal.fulfilled.type, payload: updatedMeal };
    const nextState = mealsReducer(startState, action);

    const key = getMealKey('2026-10-10', 'lunch');
    expect(nextState.meals[key].status).toBe('completed');
    expect(nextState.meals[key].plannedDishId).toBe('dish_a');
    expect(nextState.meals[key].completedDishId).toBe('dish_b');
  });

  it('T-6: Undo Cook (Completed -> Planned)', () => {
    const startState: MealsState = {
      meals: {
        '2026-10-10_lunch': {
          id: 'meal_2026-10-10_lunch',
          date: '2026-10-10',
          mealType: 'lunch',
          plannedDishId: 'dish_a',
          completedDishId: 'dish_a',
          status: 'completed',
          notes: null,
          updatedAt: '2026-10-10T12:00:00Z',
        },
      },
      isLoading: false,
      error: null,
    };

    const undoneMeal: Meal = {
      id: 'meal_2026-10-10_lunch',
      date: '2026-10-10',
      mealType: 'lunch',
      plannedDishId: 'dish_a',
      completedDishId: null,
      status: 'planned',
      notes: null,
      updatedAt: '2026-10-10T12:45:00Z',
    };

    const action = { type: saveMeal.fulfilled.type, payload: undoneMeal };
    const nextState = mealsReducer(startState, action);

    const key = getMealKey('2026-10-10', 'lunch');
    expect(nextState.meals[key].status).toBe('planned');
    expect(nextState.meals[key].completedDishId).toBeNull();
  });

  it('T-7: Clear Slot (Delete Meal)', () => {
    const startState: MealsState = {
      meals: {
        '2026-10-10_lunch': {
          id: 'meal_2026-10-10_lunch',
          date: '2026-10-10',
          mealType: 'lunch',
          plannedDishId: 'dish_a',
          completedDishId: 'dish_a',
          status: 'completed',
          notes: null,
          updatedAt: '2026-10-10T12:00:00Z',
        },
      },
      isLoading: false,
      error: null,
    };

    const action = {
      type: deleteMeal.fulfilled.type,
      payload: { date: '2026-10-10', mealType: 'lunch' },
    };
    const nextState = mealsReducer(startState, action);

    const key = getMealKey('2026-10-10', 'lunch');
    expect(nextState.meals[key]).toBeUndefined();
  });

  it('T-8: Batch Save Meals (saveMealBatch)', () => {
    const batchMeals: Meal[] = [
      {
        id: 'meal_2026-10-10_breakfast',
        date: '2026-10-10',
        mealType: 'breakfast',
        plannedDishId: 'dish_b1',
        completedDishId: null,
        status: 'planned',
        notes: null,
        updatedAt: '2026-10-01T12:00:00Z',
      },
      {
        id: 'meal_2026-10-10_dinner',
        date: '2026-10-10',
        mealType: 'dinner',
        plannedDishId: 'dish_d1',
        completedDishId: null,
        status: 'planned',
        notes: null,
        updatedAt: '2026-10-01T12:00:00Z',
      },
    ];

    const action = { type: saveMealBatch.fulfilled.type, payload: batchMeals };
    const nextState = mealsReducer(initialMealsState, action);

    expect(nextState.meals[getMealKey('2026-10-10', 'breakfast')]).toBeDefined();
    expect(nextState.meals[getMealKey('2026-10-10', 'breakfast')].plannedDishId).toBe('dish_b1');
    expect(nextState.meals[getMealKey('2026-10-10', 'dinner')]).toBeDefined();
    expect(nextState.meals[getMealKey('2026-10-10', 'dinner')].plannedDishId).toBe('dish_d1');
  });
});
