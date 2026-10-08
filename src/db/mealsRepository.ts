import { getDb } from './client';
import { Meal, MealType, SaveMealInput } from '../types/meal';

interface MealRow {
  id: string;
  date: string;
  meal_type: MealType;
  planned_dish_id: string | null;
  completed_dish_id: string | null;
  status: 'planned' | 'completed' | 'skipped';
  notes: string | null;
  updated_at: string;
}

function rowToMeal(row: MealRow): Meal {
  return {
    id: row.id,
    date: row.date,
    mealType: row.meal_type,
    plannedDishId: row.planned_dish_id,
    completedDishId: row.completed_dish_id,
    status: row.status,
    notes: row.notes,
    updatedAt: row.updated_at,
  };
}

export async function fetchAllMeals(): Promise<Meal[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<MealRow>(
    'SELECT * FROM meals ORDER BY date ASC, meal_type ASC'
  );
  return rows.map(rowToMeal);
}

export async function fetchMealsByDate(date: string): Promise<Meal[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<MealRow>(
    'SELECT * FROM meals WHERE date = ? ORDER BY meal_type ASC',
    [date]
  );
  return rows.map(rowToMeal);
}

export async function fetchMealsInRange(startDate: string, endDate: string): Promise<Meal[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<MealRow>(
    'SELECT * FROM meals WHERE date >= ? AND date <= ? ORDER BY date ASC, meal_type ASC',
    [startDate, endDate]
  );
  return rows.map(rowToMeal);
}

export async function upsertMeal(input: SaveMealInput): Promise<Meal> {
  const db = await getDb();
  const now = new Date().toISOString();
  const id = `meal_${input.date}_${input.mealType}`;

  await db.runAsync(
    `INSERT INTO meals (id, date, meal_type, planned_dish_id, completed_dish_id, status, notes, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(date, meal_type) DO UPDATE SET
       planned_dish_id = COALESCE(excluded.planned_dish_id, meals.planned_dish_id),
       completed_dish_id = COALESCE(excluded.completed_dish_id, meals.completed_dish_id),
       status = excluded.status,
       notes = excluded.notes,
       updated_at = excluded.updated_at`,
    [
      id,
      input.date,
      input.mealType,
      input.plannedDishId !== undefined ? input.plannedDishId : null,
      input.completedDishId !== undefined ? input.completedDishId : null,
      input.status,
      input.notes || null,
      now,
    ]
  );

  return {
    id,
    date: input.date,
    mealType: input.mealType,
    plannedDishId: input.plannedDishId !== undefined ? input.plannedDishId : null,
    completedDishId: input.completedDishId !== undefined ? input.completedDishId : null,
    status: input.status,
    notes: input.notes || null,
    updatedAt: now,
  };
}

export async function removeMeal(date: string, mealType: MealType): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM meals WHERE date = ? AND meal_type = ?', [date, mealType]);
}
