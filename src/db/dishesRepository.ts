import { getDb } from './client';
import { Dish, CreateDishInput, UpdateDishInput } from '../types/dish';

interface DishRow {
  id: string;
  name: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'all';
  is_active: number;
  created_at: string;
}

function rowToDish(row: DishRow): Dish {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
  };
}

export async function fetchAllDishes(): Promise<Dish[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<DishRow>(
    'SELECT * FROM dishes WHERE is_active = 1 ORDER BY name ASC'
  );
  return rows.map(rowToDish);
}

export async function fetchAllDishesIncludingInactive(): Promise<Dish[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<DishRow>('SELECT * FROM dishes ORDER BY name ASC');
  return rows.map(rowToDish);
}

export async function insertDish(input: CreateDishInput): Promise<Dish> {
  const db = await getDb();
  const id = `dish_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const createdAt = new Date().toISOString();

  await db.runAsync(
    'INSERT INTO dishes (id, name, category, is_active, created_at) VALUES (?, ?, ?, 1, ?)',
    [id, input.name.trim(), input.category, createdAt]
  );

  return {
    id,
    name: input.name.trim(),
    category: input.category,
    isActive: true,
    createdAt,
  };
}

export async function insertBatchDishes(inputs: CreateDishInput[]): Promise<Dish[]> {
  const db = await getDb();
  const created: Dish[] = [];
  const now = new Date().toISOString();

  for (const input of inputs) {
    const id = `dish_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await db.runAsync(
      'INSERT INTO dishes (id, name, category, is_active, created_at) VALUES (?, ?, ?, 1, ?)',
      [id, input.name.trim(), input.category, now]
    );
    created.push({
      id,
      name: input.name.trim(),
      category: input.category,
      isActive: true,
      createdAt: now,
    });
  }
  return created;
}

export async function updateDishRecord(input: UpdateDishInput): Promise<void> {
  const db = await getDb();
  const updates: string[] = [];
  const values: any[] = [];

  if (input.name !== undefined) {
    updates.push('name = ?');
    values.push(input.name.trim());
  }
  if (input.category !== undefined) {
    updates.push('category = ?');
    values.push(input.category);
  }
  if (input.isActive !== undefined) {
    updates.push('is_active = ?');
    values.push(input.isActive ? 1 : 0);
  }

  if (updates.length === 0) return;

  values.push(input.id);
  await db.runAsync(`UPDATE dishes SET ${updates.join(', ')} WHERE id = ?`, values);
}

export async function softDeleteDish(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE dishes SET is_active = 0 WHERE id = ?', [id]);
}
