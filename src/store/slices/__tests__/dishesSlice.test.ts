import { describe, it, expect, vi } from 'vitest';
import {
  dishesSlice,
  DishesState,
  loadDishes,
  addDish,
  addBatchDishes,
  updateDish,
  removeDish,
  seedSampleDishes,
} from '../dishesSlice';
import { Dish } from '../../../types/dish';

vi.mock('../../../db/dishesRepository', () => ({
  fetchAllDishes: vi.fn(),
  insertDish: vi.fn(),
  insertBatchDishes: vi.fn(),
  updateDishRecord: vi.fn(),
  softDeleteDish: vi.fn(),
}));

describe('Dishes Slice & State Invariants', () => {
  const dishesReducer = dishesSlice.reducer;
  const initialState: DishesState = {
    items: [],
    isLoading: false,
    error: null,
  };

  it('D-1: Initial state is empty and not loading', () => {
    const state = dishesReducer(undefined, { type: '@@INIT' });
    expect(state.items).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('D-2: loadDishes.pending sets isLoading=true and clears error', () => {
    const errorState: DishesState = {
      items: [],
      isLoading: false,
      error: 'Previous error',
    };
    const state = dishesReducer(errorState, { type: loadDishes.pending.type });
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('D-3: loadDishes.fulfilled populates items and sets isLoading=false', () => {
    const sampleItems: Dish[] = [
      { id: '1', name: 'Biryani', category: 'lunch', isActive: true, createdAt: '2026-10-01' },
      { id: '2', name: 'Pancakes', category: 'breakfast', isActive: true, createdAt: '2026-10-01' },
    ];
    const loadingState: DishesState = { items: [], isLoading: true, error: null };
    const state = dishesReducer(loadingState, {
      type: loadDishes.fulfilled.type,
      payload: sampleItems,
    });
    expect(state.isLoading).toBe(false);
    expect(state.items).toHaveLength(2);
    expect(state.items).toEqual(sampleItems);
  });

  it('D-4: loadDishes.rejected stores error and resets isLoading', () => {
    const loadingState: DishesState = { items: [], isLoading: true, error: null };
    const state = dishesReducer(loadingState, {
      type: loadDishes.rejected.type,
      error: { message: 'Database connection failed' },
    });
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Database connection failed');
  });

  it('D-5: addDish.fulfilled appends dish and maintains alphabetical sort', () => {
    const existingState: DishesState = {
      items: [
        { id: '1', name: 'Chicken Karahi', category: 'lunch', isActive: true, createdAt: '2026-10-01' },
        { id: '2', name: 'Zucchini Bread', category: 'breakfast', isActive: true, createdAt: '2026-10-01' },
      ],
      isLoading: false,
      error: null,
    };
    const newDish: Dish = {
      id: '3',
      name: 'Aloo Paratha',
      category: 'breakfast',
      isActive: true,
      createdAt: '2026-10-01',
    };

    const state = dishesReducer(existingState, {
      type: addDish.fulfilled.type,
      payload: newDish,
    });

    expect(state.items).toHaveLength(3);
    // Alphabetical order: Aloo Paratha, Chicken Karahi, Zucchini Bread
    expect(state.items[0].name).toBe('Aloo Paratha');
    expect(state.items[1].name).toBe('Chicken Karahi');
    expect(state.items[2].name).toBe('Zucchini Bread');
  });

  it('D-6: addBatchDishes.fulfilled appends multiple dishes and maintains alphabetical sort', () => {
    const existingState: DishesState = {
      items: [
        { id: '1', name: 'Dal Tadka', category: 'dinner', isActive: true, createdAt: '2026-10-01' },
      ],
      isLoading: false,
      error: null,
    };
    const batchDishes: Dish[] = [
      { id: '2', name: 'Biryani', category: 'lunch', isActive: true, createdAt: '2026-10-01' },
      { id: '3', name: 'Egg Bhurji', category: 'breakfast', isActive: true, createdAt: '2026-10-01' },
    ];

    const state = dishesReducer(existingState, {
      type: addBatchDishes.fulfilled.type,
      payload: batchDishes,
    });

    expect(state.items).toHaveLength(3);
    expect(state.items.map((d) => d.name)).toEqual(['Biryani', 'Dal Tadka', 'Egg Bhurji']);
  });

  it('D-7: updateDish.fulfilled updates dish fields and re-sorts if name changes', () => {
    const existingState: DishesState = {
      items: [
        { id: '1', name: 'Biryani', category: 'lunch', isActive: true, createdAt: '2026-10-01' },
        { id: '2', name: 'Curry', category: 'dinner', isActive: true, createdAt: '2026-10-01' },
      ],
      isLoading: false,
      error: null,
    };

    const state = dishesReducer(existingState, {
      type: updateDish.fulfilled.type,
      payload: { id: '1', name: 'Zesty Biryani', category: 'dinner' },
    });

    expect(state.items[1].name).toBe('Zesty Biryani');
    expect(state.items[1].category).toBe('dinner');
    // Re-sorted: Curry first, then Zesty Biryani
    expect(state.items[0].name).toBe('Curry');
  });

  it('D-8: removeDish.fulfilled removes dish from items list', () => {
    const existingState: DishesState = {
      items: [
        { id: '1', name: 'Biryani', category: 'lunch', isActive: true, createdAt: '2026-10-01' },
        { id: '2', name: 'Curry', category: 'dinner', isActive: true, createdAt: '2026-10-01' },
      ],
      isLoading: false,
      error: null,
    };

    const state = dishesReducer(existingState, {
      type: removeDish.fulfilled.type,
      payload: '1',
    });

    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBe('2');
  });

  it('D-9: seedSampleDishes.fulfilled replaces items with seeded list', () => {
    const seedDishes: Dish[] = [
      { id: '1', name: 'Aloo Paratha', category: 'breakfast', isActive: true, createdAt: '2026-10-01' },
      { id: '2', name: 'Chicken Karahi', category: 'lunch', isActive: true, createdAt: '2026-10-01' },
    ];

    const state = dishesReducer(initialState, {
      type: seedSampleDishes.fulfilled.type,
      payload: seedDishes,
    });

    expect(state.items).toHaveLength(2);
    expect(state.items[0].name).toBe('Aloo Paratha');
  });
});
