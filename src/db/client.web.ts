// Web compatibility layer for DailyPlate SQLite client
// Backs up data into localStorage so testing in web browser works without worker chunk errors.

interface DishRow {
  id: string;
  name: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'all';
  is_active: number;
  created_at: string;
}

interface MealRow {
  id: string;
  date: string;
  meal_type: string;
  planned_dish_id: string | null;
  completed_dish_id: string | null;
  status: 'planned' | 'completed' | 'skipped';
  notes: string | null;
  updated_at: string;
}

const STORAGE_KEY_DISHES = 'dailyplate_dishes_v1';
const STORAGE_KEY_MEALS = 'dailyplate_meals_v1';

function loadDishes(): DishRow[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DISHES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDishes(items: DishRow[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(STORAGE_KEY_DISHES, JSON.stringify(items));
  } catch {}
}

function loadMeals(): MealRow[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MEALS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMeals(items: MealRow[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(STORAGE_KEY_MEALS, JSON.stringify(items));
  } catch {}
}

export class WebSQLiteDatabase {
  async execAsync(_sql: string): Promise<void> {
    // Schema initialized in memory / localStorage
  }

  async withTransactionAsync<T>(task: () => Promise<T>): Promise<T> {
    return await task();
  }

  async getAllAsync<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (sql.includes('FROM dishes')) {
      const dishes = loadDishes();
      if (sql.includes('is_active = 1')) {
        return dishes
          .filter((d) => d.is_active === 1)
          .sort((a, b) => a.name.localeCompare(b.name)) as unknown as T[];
      }
      return dishes.sort((a, b) => a.name.localeCompare(b.name)) as unknown as T[];
    }

    if (sql.includes('FROM meals')) {
      const meals = loadMeals();
      if (sql.includes('date = ?')) {
        const dateParam = params[0];
        return meals.filter((m) => m.date === dateParam) as unknown as T[];
      }
      if (sql.includes('date >= ? AND date <= ?')) {
        const [start, end] = params;
        return meals.filter((m) => m.date >= start && m.date <= end) as unknown as T[];
      }
      return meals.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.meal_type.localeCompare(b.meal_type);
      }) as unknown as T[];
    }

    return [];
  }

  async runAsync(sql: string, params: any[] = []): Promise<{ changes: number; lastInsertRowId: number }> {
    if (sql.includes('INSERT INTO dishes')) {
      const dishes = loadDishes();
      const [id, name, category, createdAt] = [params[0], params[1], params[2], params[3]];
      dishes.push({
        id,
        name,
        category,
        is_active: 1,
        created_at: createdAt,
      });
      saveDishes(dishes);
      return { changes: 1, lastInsertRowId: 1 };
    }

    if (sql.includes('UPDATE dishes SET name = COALESCE')) {
      const dishes = loadDishes();
      const [name, category, isActive, id] = [params[0], params[1], params[2], params[3]];
      const idx = dishes.findIndex((d) => d.id === id);
      if (idx !== -1) {
        if (name !== null && name !== undefined) dishes[idx].name = name;
        if (category !== null && category !== undefined) dishes[idx].category = category;
        if (isActive !== null && isActive !== undefined) dishes[idx].is_active = isActive;
        saveDishes(dishes);
      }
      return { changes: 1, lastInsertRowId: 1 };
    }

    if (sql.includes('UPDATE dishes SET is_active = 0')) {
      const dishes = loadDishes();
      const id = params[0];
      const idx = dishes.findIndex((d) => d.id === id);
      if (idx !== -1) {
        dishes[idx].is_active = 0;
        saveDishes(dishes);
      }
      return { changes: 1, lastInsertRowId: 1 };
    }

    if (sql.includes('INSERT INTO meals')) {
      const meals = loadMeals();
      const [id, date, mealType, plannedDishId, completedDishId, status, notes, updatedAt] = params;
      const existingIdx = meals.findIndex((m) => m.date === date && m.meal_type === mealType);
      const row: MealRow = {
        id,
        date,
        meal_type: mealType,
        planned_dish_id: plannedDishId,
        completed_dish_id: completedDishId,
        status,
        notes,
        updated_at: updatedAt,
      };
      if (existingIdx !== -1) {
        meals[existingIdx] = row;
      } else {
        meals.push(row);
      }
      saveMeals(meals);
      return { changes: 1, lastInsertRowId: 1 };
    }

    if (sql.includes('DELETE FROM meals')) {
      if (params.length === 0) {
        saveMeals([]);
        return { changes: 1, lastInsertRowId: 0 };
      }
      const meals = loadMeals();
      const [date, mealType] = params;
      const nextMeals = meals.filter((m) => !(m.date === date && m.meal_type === mealType));
      saveMeals(nextMeals);
      return { changes: 1, lastInsertRowId: 1 };
    }

    if (sql.includes('DELETE FROM dishes')) {
      if (params.length === 0) {
        saveDishes([]);
        return { changes: 1, lastInsertRowId: 0 };
      }
    }

    return { changes: 0, lastInsertRowId: 0 };
  }
}

let webDbInstance: WebSQLiteDatabase | null = null;

export async function getDb(): Promise<any> {
  if (!webDbInstance) {
    webDbInstance = new WebSQLiteDatabase();
  }
  return webDbInstance;
}

export async function initDatabase(_db: any): Promise<void> {}
