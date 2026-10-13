import { describe, it, expect } from 'vitest';
import { filterDishes } from '../dishSearch';
import { Dish } from '../../types/dish';

const mockDish = (id: string, name: string, category: 'breakfast' | 'lunch' | 'dinner' | 'all'): Dish => ({
  id,
  name,
  category,
  isActive: true,
  createdAt: '2026-10-01T00:00:00Z',
});

describe('dishSearch filterDishes', () => {
  const dishes: Dish[] = [
    mockDish('1', 'Pancakes with Maple Syrup', 'breakfast'),
    mockDish('2', 'Grilled Chicken Caesar Salad', 'lunch'),
    mockDish('3', 'Chicken Parmesan', 'dinner'),
    mockDish('4', 'Vegetable Soup', 'all'),
    mockDish('5', 'Avocado Toast', 'breakfast'),
  ];

  it('returns all dishes when search query is empty and filter is all_filter', () => {
    const result = filterDishes(dishes, '');
    expect(result).toHaveLength(5);
  });

  it('filters dishes by case-insensitive name match', () => {
    const result = filterDishes(dishes, 'chicken');
    expect(result).toHaveLength(2);
    expect(result.map((d) => d.id)).toEqual(['2', '3']);
  });

  it('handles leading and trailing whitespace in query', () => {
    const result = filterDishes(dishes, '  pancake  ');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('filters by category and search query simultaneously', () => {
    const result = filterDishes(dishes, 'chicken', 'dinner');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('includes dishes with category all when filtered by a specific category', () => {
    const result = filterDishes(dishes, 'soup', 'lunch');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('4');
  });

  it('returns empty array when no dishes match query', () => {
    const result = filterDishes(dishes, 'beef burger');
    expect(result).toHaveLength(0);
  });
});
