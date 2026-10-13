import { getDb } from './client';
import { Dish } from '../types/dish';
import { Meal } from '../types/meal';
import { fetchAllDishesIncludingInactive } from './dishesRepository';
import { fetchAllMeals } from './mealsRepository';

export interface DailyPlateBackup {
  version: 1;
  exportedAt: string;
  dishes: Dish[];
  meals: Meal[];
}

/**
 * Exports all dishes and meal logs into a portable JSON backup payload.
 */
export async function exportDatabaseBackup(): Promise<DailyPlateBackup> {
  const dishes = await fetchAllDishesIncludingInactive();
  const meals = await fetchAllMeals();
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    dishes,
    meals,
  };
}

/**
 * Imports and replaces local database state with the backup payload inside a transaction.
 */
export async function importDatabaseBackup(
  backup: DailyPlateBackup
): Promise<{ dishesCount: number; mealsCount: number }> {
  if (
    !backup ||
    backup.version !== 1 ||
    !Array.isArray(backup.dishes) ||
    !Array.isArray(backup.meals)
  ) {
    throw new Error('Invalid backup file format');
  }

  const db = await getDb();

  await db.withTransactionAsync(async () => {
    // 1. Clear existing meals and dishes
    await db.runAsync('DELETE FROM meals;');
    await db.runAsync('DELETE FROM dishes;');

    // 2. Insert dishes
    for (const d of backup.dishes) {
      await db.runAsync(
        'INSERT INTO dishes (id, name, category, is_active, created_at) VALUES (?, ?, ?, ?, ?)',
        [d.id, d.name, d.category, d.isActive ? 1 : 0, d.createdAt || new Date().toISOString()]
      );
    }

    // 3. Insert meals
    for (const m of backup.meals) {
      await db.runAsync(
        `INSERT INTO meals (id, date, meal_type, planned_dish_id, completed_dish_id, status, notes, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          m.id,
          m.date,
          m.mealType,
          m.plannedDishId,
          m.completedDishId,
          m.status,
          m.notes,
          m.updatedAt || new Date().toISOString(),
        ]
      );
    }
  });

  return {
    dishesCount: backup.dishes.length,
    mealsCount: backup.meals.length,
  };
}

/**
 * Completely clears all meals and dishes.
 */
export async function resetDatabaseToCleanState(): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM meals;');
    await db.runAsync('DELETE FROM dishes;');
  });
}
