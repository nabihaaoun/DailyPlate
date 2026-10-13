import { Dish } from '../types/dish';
import { DishFilterType } from '../components/CategoryFilterPills';

/**
 * Filters a list of dishes by category and real-time search query.
 * Case-insensitive, trimmed, and matches substrings across dish names.
 */
export function filterDishes(
  dishes: Dish[],
  searchQuery: string,
  categoryFilter: DishFilterType = 'all_filter'
): Dish[] {
  const q = searchQuery.toLowerCase().trim();

  return dishes.filter((dish) => {
    const matchesCategory =
      categoryFilter === 'all_filter' ||
      dish.category === categoryFilter ||
      dish.category === 'all';

    const matchesQuery = q.length === 0 || dish.name.toLowerCase().includes(q);

    return matchesCategory && matchesQuery;
  });
}
