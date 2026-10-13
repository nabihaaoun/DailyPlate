import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as dishesRepo from '../dishesRepository';
import * as mealsRepo from '../mealsRepository';
import * as clientModule from '../client';
import {
  exportDatabaseBackup,
  importDatabaseBackup,
  resetDatabaseToCleanState,
  DailyPlateBackup,
} from '../dataManagementRepository';

const mockRunAsync = vi.fn();
const mockWithTransactionAsync = vi.fn(async (fn: () => Promise<any>) => await fn());
const mockDb = {
  runAsync: mockRunAsync,
  withTransactionAsync: mockWithTransactionAsync,
};

vi.mock('../client', () => ({
  getDb: vi.fn(async () => ({
    runAsync: vi.fn(),
    withTransactionAsync: vi.fn(async (fn: () => Promise<any>) => await fn()),
  })),
  initDatabase: vi.fn(),
}));

vi.mock('../dishesRepository', () => ({
  fetchAllDishesIncludingInactive: vi.fn(),
}));

vi.mock('../mealsRepository', () => ({
  fetchAllMeals: vi.fn(),
}));

describe('Data Management Repository & Local Backup Invariants', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(clientModule.getDb).mockResolvedValue(mockDb as any);
  });

  it('DM-1: exportDatabaseBackup produces a valid V1 payload', async () => {
    vi.mocked(dishesRepo.fetchAllDishesIncludingInactive).mockResolvedValue([
      { id: 'd1', name: 'Biryani', category: 'lunch', isActive: true, createdAt: '2026-10-01' },
    ]);
    vi.mocked(mealsRepo.fetchAllMeals).mockResolvedValue([
      {
        id: 'm1',
        date: '2026-10-12',
        mealType: 'lunch',
        plannedDishId: 'd1',
        completedDishId: 'd1',
        status: 'completed',
        notes: null,
        updatedAt: '2026-10-12',
      },
    ]);

    const backup = await exportDatabaseBackup();

    expect(backup.version).toBe(1);
    expect(typeof backup.exportedAt).toBe('string');
    expect(backup.dishes).toHaveLength(1);
    expect(backup.meals).toHaveLength(1);
    expect(backup.dishes[0].name).toBe('Biryani');
  });

  it('DM-2: importDatabaseBackup rejects invalid or corrupt payload structures', async () => {
    await expect(importDatabaseBackup(null as any)).rejects.toThrow('Invalid backup file format');
    await expect(importDatabaseBackup({ version: 2 } as any)).rejects.toThrow(
      'Invalid backup file format'
    );
    await expect(
      importDatabaseBackup({ version: 1, dishes: 'not-an-array', meals: [] } as any)
    ).rejects.toThrow('Invalid backup file format');
  });

  it('DM-3: importDatabaseBackup executes inside transaction and inserts items', async () => {
    const validBackup: DailyPlateBackup = {
      version: 1,
      exportedAt: '2026-10-12T12:00:00Z',
      dishes: [
        {
          id: 'd1',
          name: 'Aloo Paratha',
          category: 'breakfast',
          isActive: true,
          createdAt: '2026-10-01',
        },
      ],
      meals: [
        {
          id: 'm1',
          date: '2026-10-12',
          mealType: 'breakfast',
          plannedDishId: 'd1',
          completedDishId: 'd1',
          status: 'completed',
          notes: null,
          updatedAt: '2026-10-12',
        },
      ],
    };

    const res = await importDatabaseBackup(validBackup);

    expect(res.dishesCount).toBe(1);
    expect(res.mealsCount).toBe(1);
    expect(mockDb.withTransactionAsync).toHaveBeenCalledTimes(1);
    expect(mockDb.runAsync).toHaveBeenCalledWith('DELETE FROM meals;');
    expect(mockDb.runAsync).toHaveBeenCalledWith('DELETE FROM dishes;');
  });

  it('DM-4: resetDatabaseToCleanState clears meals and dishes tables inside transaction', async () => {
    await resetDatabaseToCleanState();

    expect(mockDb.withTransactionAsync).toHaveBeenCalledTimes(1);
    expect(mockDb.runAsync).toHaveBeenCalledWith('DELETE FROM meals;');
    expect(mockDb.runAsync).toHaveBeenCalledWith('DELETE FROM dishes;');
  });
});
