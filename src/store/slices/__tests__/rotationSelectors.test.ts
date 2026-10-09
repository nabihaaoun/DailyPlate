import { describe, it, expect } from 'vitest';
import {
  selectBreakfastRotation,
  selectLunchRotation,
  selectDinnerRotation,
} from '../rotationSelectors';
import { RootState } from '../../index';
import { Dish } from '../../../types/dish';
import { Meal } from '../../../types/meal';

function createMockState(dishes: Dish[], meals: Meal[]): RootState {
  const mealsMap: Record<string, Meal> = {};
  for (const m of meals) {
    mealsMap[`${m.date}_${m.mealType}`] = m;
  }

  return {
    dishes: {
      items: dishes,
      isLoading: false,
      error: null,
    },
    meals: {
      meals: mealsMap,
      isLoading: false,
      error: null,
    },
  };
}

describe('Deterministic Rotation Engine (Option B)', () => {
  const DISH_A: Dish = {
    id: 'dish_a',
    name: 'Aloo Paratha',
    category: 'breakfast',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  };
  const DISH_B: Dish = {
    id: 'dish_b',
    name: 'Chana Masala',
    category: 'breakfast',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  };
  const DISH_C: Dish = {
    id: 'dish_c',
    name: 'Halwa Puri',
    category: 'breakfast',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  };
  const DISH_D: Dish = {
    id: 'dish_d',
    name: 'Nihari',
    category: 'breakfast',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  };

  const DISH_EGGS_ALL: Dish = {
    id: 'dish_eggs',
    name: 'Boiled Eggs',
    category: 'all',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  };

  const DISH_SOLO: Dish = {
    id: 'dish_solo',
    name: 'Oatmeal',
    category: 'dinner',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  };

  // Group A: Normal Rotation Lifecycle
  it('TC-01: Fresh State (Zero History) - all dishes available', () => {
    const state = createMockState([DISH_A, DISH_B, DISH_C], []);
    const status = selectBreakfastRotation(state);

    expect(status.totalEligible).toBe(3);
    expect(status.completedCount).toBe(0);
    expect(status.remainingCount).toBe(3);
    expect(status.availableDishes.map((d) => d.id)).toEqual(['dish_a', 'dish_b', 'dish_c']);
    expect(status.recentlyCookedDishes).toEqual([]);
    expect(status.isCycleJustCompleted).toBe(false);
  });

  it('TC-02: Step-by-Step Progression (1 of 3 Cooked)', () => {
    const meals: Meal[] = [
      {
        id: 'm1',
        date: '2026-10-01',
        mealType: 'breakfast',
        plannedDishId: 'dish_a',
        completedDishId: 'dish_a',
        status: 'completed',
        notes: null,
        updatedAt: '2026-10-01T08:00:00Z',
      },
    ];

    const state = createMockState([DISH_A, DISH_B, DISH_C], meals);
    const status = selectBreakfastRotation(state);

    expect(status.totalEligible).toBe(3);
    expect(status.completedCount).toBe(1);
    expect(status.remainingCount).toBe(2);
    expect(status.availableDishes.map((d) => d.id)).toEqual(['dish_b', 'dish_c']);
    expect(status.recentlyCookedDishes.map((d) => d.id)).toEqual(['dish_a']);
    expect(status.isCycleJustCompleted).toBe(false);
  });

  it('TC-03: Near Cycle Completion (2 of 3 Cooked)', () => {
    const meals: Meal[] = [
      {
        id: 'm1',
        date: '2026-10-01',
        mealType: 'breakfast',
        plannedDishId: 'dish_a',
        completedDishId: 'dish_a',
        status: 'completed',
        notes: null,
        updatedAt: '2026-10-01T08:00:00Z',
      },
      {
        id: 'm2',
        date: '2026-10-02',
        mealType: 'breakfast',
        plannedDishId: 'dish_b',
        completedDishId: 'dish_b',
        status: 'completed',
        notes: null,
        updatedAt: '2026-10-02T08:00:00Z',
      },
    ];

    const state = createMockState([DISH_A, DISH_B, DISH_C], meals);
    const status = selectBreakfastRotation(state);

    expect(status.totalEligible).toBe(3);
    expect(status.completedCount).toBe(2);
    expect(status.remainingCount).toBe(1);
    expect(status.availableDishes.map((d) => d.id)).toEqual(['dish_c']);
    expect(status.recentlyCookedDishes.map((d) => d.id)).toEqual(['dish_a', 'dish_b']);
    expect(status.isCycleJustCompleted).toBe(false);
  });

  it('TC-04: Full Cycle Completion & Automatic Reset (3 of 3 Cooked)', () => {
    const meals: Meal[] = [
      {
        id: 'm1',
        date: '2026-10-01',
        mealType: 'breakfast',
        plannedDishId: 'dish_a',
        completedDishId: 'dish_a',
        status: 'completed',
        notes: null,
        updatedAt: '2026-10-01T08:00:00Z',
      },
      {
        id: 'm2',
        date: '2026-10-02',
        mealType: 'breakfast',
        plannedDishId: 'dish_b',
        completedDishId: 'dish_b',
        status: 'completed',
        notes: null,
        updatedAt: '2026-10-02T08:00:00Z',
      },
      {
        id: 'm3',
        date: '2026-10-03',
        mealType: 'breakfast',
        plannedDishId: 'dish_c',
        completedDishId: 'dish_c',
        status: 'completed',
        notes: null,
        updatedAt: '2026-10-03T08:00:00Z',
      },
    ];

    const state = createMockState([DISH_A, DISH_B, DISH_C], meals);
    const status = selectBreakfastRotation(state);

    expect(status.totalEligible).toBe(3);
    expect(status.completedCount).toBe(0);
    expect(status.remainingCount).toBe(3);
    expect(status.availableDishes.map((d) => d.id)).toEqual(['dish_a', 'dish_b', 'dish_c']);
    expect(status.recentlyCookedDishes).toEqual([]);
    expect(status.isCycleJustCompleted).toBe(true);
  });

  // Group B: Option B Repeat-Cook Handling
  it('TC-05: Option B Single Repeat Mid-Cycle (Cook A, B, A)', () => {
    const meals: Meal[] = [
      {
        id: 'm1',
        date: '2026-10-01',
        mealType: 'breakfast',
        plannedDishId: 'dish_a',
        completedDishId: 'dish_a',
        status: 'completed',
        notes: null,
        updatedAt: '2026-10-01T08:00:00Z',
      },
      {
        id: 'm2',
        date: '2026-10-02',
        mealType: 'breakfast',
        plannedDishId: 'dish_b',
        completedDishId: 'dish_b',
        status: 'completed',
        notes: null,
        updatedAt: '2026-10-02T08:00:00Z',
      },
      {
        id: 'm3',
        date: '2026-10-03',
        mealType: 'breakfast',
        plannedDishId: 'dish_a',
        completedDishId: 'dish_a',
        status: 'completed',
        notes: null,
        updatedAt: '2026-10-03T08:00:00Z',
      },
    ];

    const state = createMockState([DISH_A, DISH_B, DISH_C, DISH_D], meals);
    const status = selectBreakfastRotation(state);

    // Option B invariant: repeating A does NOT reset the cycle!
    expect(status.totalEligible).toBe(4);
    expect(status.completedCount).toBe(2);
    expect(status.remainingCount).toBe(2);
    expect(status.availableDishes.map((d) => d.id)).toEqual(['dish_c', 'dish_d']);
    expect(status.recentlyCookedDishes.map((d) => d.id)).toEqual(['dish_a', 'dish_b']);
    expect(status.isCycleJustCompleted).toBe(false);
  });

  it('TC-06: Option B Multiple Repeats Mid-Cycle (Cook A, B, A, B)', () => {
    const meals: Meal[] = [
      {
        id: 'm1',
        date: '2026-10-01',
        mealType: 'breakfast',
        plannedDishId: 'dish_a',
        completedDishId: 'dish_a',
        status: 'completed',
        notes: null,
        updatedAt: '2026-10-01T08:00:00Z',
      },
      {
        id: 'm2',
        date: '2026-10-02',
        mealType: 'breakfast',
        plannedDishId: 'dish_b',
        completedDishId: 'dish_b',
        status: 'completed',
        notes: null,
        updatedAt: '2026-10-02T08:00:00Z',
      },
      {
        id: 'm3',
        date: '2026-10-03',
        mealType: 'breakfast',
        plannedDishId: 'dish_a',
        completedDishId: 'dish_a',
        status: 'completed',
        notes: null,
        updatedAt: '2026-10-03T08:00:00Z',
      },
      {
        id: 'm4',
        date: '2026-10-04',
        mealType: 'breakfast',
        plannedDishId: 'dish_b',
        completedDishId: 'dish_b',
        status: 'completed',
        notes: null,
        updatedAt: '2026-10-04T08:00:00Z',
      },
    ];

    const state = createMockState([DISH_A, DISH_B, DISH_C, DISH_D], meals);
    const status = selectBreakfastRotation(state);

    expect(status.totalEligible).toBe(4);
    expect(status.completedCount).toBe(2);
    expect(status.remainingCount).toBe(2);
    expect(status.availableDishes.map((d) => d.id)).toEqual(['dish_c', 'dish_d']);
    expect(status.recentlyCookedDishes.map((d) => d.id)).toEqual(['dish_a', 'dish_b']);
    expect(status.isCycleJustCompleted).toBe(false);
  });

  // Group C: Boundary & Edge Cases
  it('TC-07: Single-Dish Category (N = 1) - always available', () => {
    const meals: Meal[] = [
      {
        id: 'm1',
        date: '2026-10-01',
        mealType: 'dinner',
        plannedDishId: 'dish_solo',
        completedDishId: 'dish_solo',
        status: 'completed',
        notes: null,
        updatedAt: '2026-10-01T19:00:00Z',
      },
    ];

    const state = createMockState([DISH_SOLO], meals);
    const status = selectDinnerRotation(state);

    expect(status.totalEligible).toBe(1);
    expect(status.availableDishes.map((d) => d.id)).toEqual(['dish_solo']);
    expect(status.recentlyCookedDishes).toEqual([]);
    expect(status.remainingCount).toBe(1);
    expect(status.isCycleJustCompleted).toBe(false);
  });

  it('TC-08: Empty Category (N = 0) - returns zero counts safely', () => {
    const state = createMockState([], []);
    const status = selectLunchRotation(state);

    expect(status.totalEligible).toBe(0);
    expect(status.completedCount).toBe(0);
    expect(status.remainingCount).toBe(0);
    expect(status.availableDishes).toEqual([]);
    expect(status.recentlyCookedDishes).toEqual([]);
    expect(status.isCycleJustCompleted).toBe(false);
  });

  it('TC-09: Adding a Dish Mid-Cycle', () => {
    const meals: Meal[] = [
      {
        id: 'm1',
        date: '2026-10-01',
        mealType: 'breakfast',
        plannedDishId: 'dish_a',
        completedDishId: 'dish_a',
        status: 'completed',
        notes: null,
        updatedAt: '2026-10-01T08:00:00Z',
      },
      {
        id: 'm2',
        date: '2026-10-02',
        mealType: 'breakfast',
        plannedDishId: 'dish_b',
        completedDishId: 'dish_b',
        status: 'completed',
        notes: null,
        updatedAt: '2026-10-02T08:00:00Z',
      },
    ];

    // User adds DISH_D to inventory
    const state = createMockState([DISH_A, DISH_B, DISH_C, DISH_D], meals);
    const status = selectBreakfastRotation(state);

    expect(status.totalEligible).toBe(4);
    expect(status.completedCount).toBe(2);
    expect(status.remainingCount).toBe(2);
    expect(status.availableDishes.map((d) => d.id)).toEqual(['dish_c', 'dish_d']);
    expect(status.recentlyCookedDishes.map((d) => d.id)).toEqual(['dish_a', 'dish_b']);
  });

  it('TC-10: Deactivating an Uncooked Dish Mid-Cycle', () => {
    const meals: Meal[] = [
      {
        id: 'm1',
        date: '2026-10-01',
        mealType: 'breakfast',
        plannedDishId: 'dish_a',
        completedDishId: 'dish_a',
        status: 'completed',
        notes: null,
        updatedAt: '2026-10-01T08:00:00Z',
      },
    ];

    const inactiveDishB = { ...DISH_B, isActive: false };
    const state = createMockState([DISH_A, inactiveDishB, DISH_C], meals);
    const status = selectBreakfastRotation(state);

    expect(status.totalEligible).toBe(2);
    expect(status.completedCount).toBe(1);
    expect(status.remainingCount).toBe(1);
    expect(status.availableDishes.map((d) => d.id)).toEqual(['dish_c']);
    expect(status.recentlyCookedDishes.map((d) => d.id)).toEqual(['dish_a']);
  });

  it('TC-11: Deactivating an Already-Cooked Dish Mid-Cycle', () => {
    const meals: Meal[] = [
      {
        id: 'm1',
        date: '2026-10-01',
        mealType: 'breakfast',
        plannedDishId: 'dish_a',
        completedDishId: 'dish_a',
        status: 'completed',
        notes: null,
        updatedAt: '2026-10-01T08:00:00Z',
      },
    ];

    // Deactivate DISH_A after cooking it
    const inactiveDishA = { ...DISH_A, isActive: false };
    const state = createMockState([inactiveDishA, DISH_B, DISH_C], meals);
    const status = selectBreakfastRotation(state);

    expect(status.totalEligible).toBe(2);
    expect(status.completedCount).toBe(0);
    expect(status.remainingCount).toBe(2);
    expect(status.availableDishes.map((d) => d.id)).toEqual(['dish_b', 'dish_c']);
    expect(status.recentlyCookedDishes).toEqual([]);
  });

  it('TC-12: Independent Rotation for Category "all" in Multi-Dish Environment', () => {
    const dishLunch1: Dish = {
      id: 'dish_l1',
      name: 'Chicken Karahi',
      category: 'lunch',
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
    };
    const dishLunch2: Dish = {
      id: 'dish_l2',
      name: 'Biryani',
      category: 'lunch',
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
    };
    const dishDinner1: Dish = {
      id: 'dish_d1',
      name: 'Daal',
      category: 'dinner',
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
    };
    const dishDinner2: Dish = {
      id: 'dish_d2',
      name: 'Kebab',
      category: 'dinner',
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
    };

    const dishes = [DISH_EGGS_ALL, DISH_A, dishLunch1, dishLunch2, dishDinner1, dishDinner2];

    // Eggs cooked for Breakfast only
    const meals: Meal[] = [
      {
        id: 'm1',
        date: '2026-10-01',
        mealType: 'breakfast',
        plannedDishId: 'dish_eggs',
        completedDishId: 'dish_eggs',
        status: 'completed',
        notes: null,
        updatedAt: '2026-10-01T08:00:00Z',
      },
    ];

    const state = createMockState(dishes, meals);

    // Breakfast: Eggs is recently cooked
    const bStatus = selectBreakfastRotation(state);
    expect(bStatus.availableDishes.map((d) => d.id)).toEqual(['dish_a']);
    expect(bStatus.recentlyCookedDishes.map((d) => d.id)).toEqual(['dish_eggs']);

    // Lunch: Eggs is still available!
    const lStatus = selectLunchRotation(state);
    expect(lStatus.availableDishes.map((d) => d.id)).toContain('dish_eggs');
    expect(lStatus.recentlyCookedDishes).toEqual([]);

    // Dinner: Eggs is still available!
    const dStatus = selectDinnerRotation(state);
    expect(dStatus.availableDishes.map((d) => d.id)).toContain('dish_eggs');
    expect(dStatus.recentlyCookedDishes).toEqual([]);
  });

  // Group D: Self-Healing & Timeline Modifications
  it('TC-13: Backdated Meal Insertion', () => {
    const meals: Meal[] = [
      {
        id: 'm2',
        date: '2026-10-05',
        mealType: 'breakfast',
        plannedDishId: 'dish_b',
        completedDishId: 'dish_b',
        status: 'completed',
        notes: null,
        updatedAt: '2026-10-05T08:00:00Z',
      },
      // Backdated meal with older calendar date
      {
        id: 'm1',
        date: '2026-10-03',
        mealType: 'breakfast',
        plannedDishId: 'dish_a',
        completedDishId: 'dish_a',
        status: 'completed',
        notes: null,
        updatedAt: '2026-10-06T08:00:00Z',
      },
    ];

    const state = createMockState([DISH_A, DISH_B, DISH_C], meals);
    const status = selectBreakfastRotation(state);

    expect(status.totalEligible).toBe(3);
    expect(status.completedCount).toBe(2);
    expect(status.remainingCount).toBe(1);
    expect(status.availableDishes.map((d) => d.id)).toEqual(['dish_c']);
    expect(status.recentlyCookedDishes.map((d) => d.id)).toEqual(['dish_a', 'dish_b']);
  });

  it('TC-14: Editing a Completed Meal', () => {
    // Oct 1 meal originally DISH_A, edited to DISH_B
    const meals: Meal[] = [
      {
        id: 'm1',
        date: '2026-10-01',
        mealType: 'breakfast',
        plannedDishId: 'dish_a',
        completedDishId: 'dish_b',
        status: 'completed',
        notes: null,
        updatedAt: '2026-10-02T10:00:00Z',
      },
    ];

    const state = createMockState([DISH_A, DISH_B, DISH_C], meals);
    const status = selectBreakfastRotation(state);

    expect(status.availableDishes.map((d) => d.id)).toEqual(['dish_a', 'dish_c']);
    expect(status.recentlyCookedDishes.map((d) => d.id)).toEqual(['dish_b']);
  });

  it('TC-15: Deleting a Completed Meal (Undo Cook)', () => {
    // Only Oct 1 completed; Oct 2 was undone/deleted
    const meals: Meal[] = [
      {
        id: 'm1',
        date: '2026-10-01',
        mealType: 'breakfast',
        plannedDishId: 'dish_a',
        completedDishId: 'dish_a',
        status: 'completed',
        notes: null,
        updatedAt: '2026-10-01T08:00:00Z',
      },
    ];

    const state = createMockState([DISH_A, DISH_B, DISH_C], meals);
    const status = selectBreakfastRotation(state);

    expect(status.availableDishes.map((d) => d.id)).toEqual(['dish_b', 'dish_c']);
    expect(status.recentlyCookedDishes.map((d) => d.id)).toEqual(['dish_a']);
  });

  it('TC-16: Planned Meals Have Zero Impact on Rotation', () => {
    const meals: Meal[] = [
      {
        id: 'm1',
        date: '2026-10-10',
        mealType: 'breakfast',
        plannedDishId: 'dish_a',
        completedDishId: null,
        status: 'planned',
        notes: null,
        updatedAt: '2026-10-01T08:00:00Z',
      },
      {
        id: 'm2',
        date: '2026-10-11',
        mealType: 'breakfast',
        plannedDishId: 'dish_b',
        completedDishId: null,
        status: 'planned',
        notes: null,
        updatedAt: '2026-10-01T08:00:00Z',
      },
    ];

    const state = createMockState([DISH_A, DISH_B, DISH_C], meals);
    const status = selectBreakfastRotation(state);

    expect(status.totalEligible).toBe(3);
    expect(status.completedCount).toBe(0);
    expect(status.remainingCount).toBe(3);
    expect(status.availableDishes.map((d) => d.id)).toEqual(['dish_a', 'dish_b', 'dish_c']);
    expect(status.recentlyCookedDishes).toEqual([]);
  });

  it('TC-17: Planned Dish Differs From Completed Dish', () => {
    // Planned Aloo Paratha, but actually cooked Chana Masala
    const meals: Meal[] = [
      {
        id: 'm1',
        date: '2026-10-01',
        mealType: 'breakfast',
        plannedDishId: 'dish_a',
        completedDishId: 'dish_b',
        status: 'completed',
        notes: null,
        updatedAt: '2026-10-01T08:00:00Z',
      },
    ];

    const state = createMockState([DISH_A, DISH_B, DISH_C], meals);
    const status = selectBreakfastRotation(state);

    // Only DISH_B enters rotation; DISH_A remains un-cooked and available
    expect(status.availableDishes.map((d) => d.id)).toEqual(['dish_a', 'dish_c']);
    expect(status.recentlyCookedDishes.map((d) => d.id)).toEqual(['dish_b']);
  });

  it('TC-18: Skipped / Eat Out Meals Have Zero Impact', () => {
    const meals: Meal[] = [
      {
        id: 'm1',
        date: '2026-10-01',
        mealType: 'breakfast',
        plannedDishId: null,
        completedDishId: null,
        status: 'skipped',
        notes: null,
        updatedAt: '2026-10-01T08:00:00Z',
      },
    ];

    const state = createMockState([DISH_A, DISH_B, DISH_C], meals);
    const status = selectBreakfastRotation(state);

    expect(status.totalEligible).toBe(3);
    expect(status.completedCount).toBe(0);
    expect(status.remainingCount).toBe(3);
    expect(status.availableDishes.map((d) => d.id)).toEqual(['dish_a', 'dish_b', 'dish_c']);
    expect(status.recentlyCookedDishes).toEqual([]);
  });

  it('TC-19: Stable Calendar Date Ordering After Edits', () => {
    // Oct 1 meal edited on Oct 10 to dish C; Oct 2 meal unchanged dish B
    const meals: Meal[] = [
      {
        id: 'm1',
        date: '2026-10-01',
        mealType: 'breakfast',
        plannedDishId: 'dish_a',
        completedDishId: 'dish_c',
        status: 'completed',
        notes: null,
        updatedAt: '2026-10-10T12:00:00Z', // edited late
      },
      {
        id: 'm2',
        date: '2026-10-02',
        mealType: 'breakfast',
        plannedDishId: 'dish_b',
        completedDishId: 'dish_b',
        status: 'completed',
        notes: null,
        updatedAt: '2026-10-02T08:00:00Z',
      },
    ];

    const state = createMockState([DISH_A, DISH_B, DISH_C], meals);
    const status = selectBreakfastRotation(state);

    // Replay order is strictly Oct 1 (C) then Oct 2 (B)
    expect(status.totalEligible).toBe(3);
    expect(status.completedCount).toBe(2);
    expect(status.remainingCount).toBe(1);
    expect(status.availableDishes.map((d) => d.id)).toEqual(['dish_a']);
    expect(status.recentlyCookedDishes.map((d) => d.id)).toEqual(['dish_b', 'dish_c']);
  });

  it('TC-20: Full-Cycle Replay Transition (A, B, C, A)', () => {
    const meals: Meal[] = [
      {
        id: 'm1',
        date: '2026-10-01',
        mealType: 'breakfast',
        plannedDishId: 'dish_a',
        completedDishId: 'dish_a',
        status: 'completed',
        notes: null,
        updatedAt: '2026-10-01T08:00:00Z',
      },
      {
        id: 'm2',
        date: '2026-10-02',
        mealType: 'breakfast',
        plannedDishId: 'dish_b',
        completedDishId: 'dish_b',
        status: 'completed',
        notes: null,
        updatedAt: '2026-10-02T08:00:00Z',
      },
      {
        id: 'm3',
        date: '2026-10-03',
        mealType: 'breakfast',
        plannedDishId: 'dish_c',
        completedDishId: 'dish_c',
        status: 'completed',
        notes: null,
        updatedAt: '2026-10-03T08:00:00Z',
      },
      // A cooked again, starting Cycle 2
      {
        id: 'm4',
        date: '2026-10-04',
        mealType: 'breakfast',
        plannedDishId: 'dish_a',
        completedDishId: 'dish_a',
        status: 'completed',
        notes: null,
        updatedAt: '2026-10-04T08:00:00Z',
      },
    ];

    const state = createMockState([DISH_A, DISH_B, DISH_C], meals);
    const status = selectBreakfastRotation(state);

    // Because the 4th meal starts Cycle 2:
    expect(status.totalEligible).toBe(3);
    expect(status.completedCount).toBe(1);
    expect(status.remainingCount).toBe(2);
    expect(status.availableDishes.map((d) => d.id)).toEqual(['dish_b', 'dish_c']);
    expect(status.recentlyCookedDishes.map((d) => d.id)).toEqual(['dish_a']);
    expect(status.isCycleJustCompleted).toBe(false);
  });
});
