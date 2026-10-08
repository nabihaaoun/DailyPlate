import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('dailyplate.db');
    await initDatabase(dbInstance);
  }
  return dbInstance;
}

export async function initDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS dishes (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('breakfast', 'lunch', 'dinner', 'all')),
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS meals (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT NOT NULL,
      meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
      planned_dish_id TEXT REFERENCES dishes(id) ON DELETE SET NULL,
      completed_dish_id TEXT REFERENCES dishes(id) ON DELETE SET NULL,
      status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'completed', 'skipped')),
      notes TEXT,
      updated_at TEXT NOT NULL,
      CONSTRAINT uq_date_meal UNIQUE (date, meal_type)
    );

    CREATE INDEX IF NOT EXISTS idx_meals_date ON meals(date);
    CREATE INDEX IF NOT EXISTS idx_meals_status ON meals(meal_type, status);
  `);
}
