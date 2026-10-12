import { describe, it, expect } from 'vitest';
import {
  getWeekDays,
  formatMonthYear,
  addDays,
} from '../date';
import { makeSelectRotationForCategory } from '../../store/slices/rotationSelectors';
import { Dish } from '../../types/dish';
import { Meal } from '../../types/meal';

describe('Date Navigation & Planner Invariants', () => {
  it('DN-1: getWeekDays returns exactly 7 days starting from Monday', () => {
    // 2026-10-14 is Wednesday
    const week = getWeekDays('2026-10-14');
    expect(week).toHaveLength(7);
    expect(week[0]).toBe('2026-10-12'); // Monday
    expect(week[1]).toBe('2026-10-13'); // Tuesday
    expect(week[2]).toBe('2026-10-14'); // Wednesday
    expect(week[3]).toBe('2026-10-15'); // Thursday
    expect(week[4]).toBe('2026-10-16'); // Friday
    expect(week[5]).toBe('2026-10-17'); // Saturday
    expect(week[6]).toBe('2026-10-18'); // Sunday
  });

  it('DN-2: getWeekDays handles Sunday anchor correctly as end of week', () => {
    // 2026-10-18 is Sunday
    const week = getWeekDays('2026-10-18');
    expect(week).toHaveLength(7);
    expect(week[0]).toBe('2026-10-12');
    expect(week[6]).toBe('2026-10-18');
  });

  it('DN-3: formatMonthYear formats correctly across years and months', () => {
    expect(formatMonthYear('2026-10-12')).toBe('October 2026');
    expect(formatMonthYear('2027-01-01')).toBe('January 2027');
  });

  it('DN-4: Week jumping via +/- 7 days stays aligned with week grid', () => {
    const currentMonday = getWeekDays('2026-10-14')[0];
    const nextWeekMonday = getWeekDays(addDays('2026-10-14', 7))[0];
    const prevWeekMonday = getWeekDays(addDays('2026-10-14', -7))[0];

    expect(nextWeekMonday).toBe('2026-10-19');
    expect(prevWeekMonday).toBe('2026-10-05');
    expect(currentMonday).toBe('2026-10-12');
  });

  it('DN-5: Moving a planned meal to another date has zero effect on rotation', () => {
    const dishes: Dish[] = [
      { id: 'd1', name: 'Eggs', category: 'breakfast', isActive: true, createdAt: '2026-10-01' },
      { id: 'd2', name: 'Pancakes', category: 'breakfast', isActive: true, createdAt: '2026-10-01' },
      { id: 'd3', name: 'Oats', category: 'breakfast', isActive: true, createdAt: '2026-10-01' },
    ];

    const selectBreakfast = makeSelectRotationForCategory('breakfast');

    // Initial state: 1 completed meal
    const initialMeals: Record<string, Meal> = {
      'meal_2026-10-01_breakfast': {
        id: 'm1',
        date: '2026-10-01',
        mealType: 'breakfast',
        plannedDishId: 'd1',
        completedDishId: 'd1',
        status: 'completed',
        notes: null,
        updatedAt: '2026-10-01',
      },
      // Planned meal on 2026-10-15
      'meal_2026-10-15_breakfast': {
        id: 'm2',
        date: '2026-10-15',
        mealType: 'breakfast',
        plannedDishId: 'd2',
        completedDishId: null,
        status: 'planned',
        notes: null,
        updatedAt: '2026-10-02',
      },
    };

    const stateBefore = {
      dishes: { items: dishes, isLoading: false, error: null },
      meals: { meals: initialMeals, isLoading: false, error: null },
    };

    const rotationBefore = selectBreakfast(stateBefore as any);
    expect(rotationBefore.completedCount).toBe(1);
    expect(rotationBefore.remainingCount).toBe(2);

    // Simulate Move: remove from 2026-10-15, add to 2026-10-20
    const movedMeals: Record<string, Meal> = {
      ...initialMeals,
    };
    delete movedMeals['meal_2026-10-15_breakfast'];
    movedMeals['meal_2026-10-20_breakfast'] = {
      id: 'm3',
      date: '2026-10-20',
      mealType: 'breakfast',
      plannedDishId: 'd2',
      completedDishId: null,
      status: 'planned',
      notes: null,
      updatedAt: '2026-10-03',
    };

    const stateAfter = {
      dishes: { items: dishes, isLoading: false, error: null },
      meals: { meals: movedMeals, isLoading: false, error: null },
    };

    const rotationAfter = selectBreakfast(stateAfter as any);

    // CRITICAL INVARIANT: Rotation must be 100% identical before and after move!
    expect(rotationAfter.completedCount).toBe(rotationBefore.completedCount);
    expect(rotationAfter.remainingCount).toBe(rotationBefore.remainingCount);
    expect(rotationAfter.availableDishes).toEqual(rotationBefore.availableDishes);
    expect(rotationAfter.recentlyCookedDishes).toEqual(rotationBefore.recentlyCookedDishes);
    expect(rotationAfter.isCycleJustCompleted).toBe(false);
  });
});
