export type MealType = 'breakfast' | 'lunch' | 'dinner';

export type MealStatus = 'planned' | 'completed' | 'skipped';

export interface Meal {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  plannedDishId: string | null;
  completedDishId: string | null;
  status: MealStatus;
  notes: string | null;
  updatedAt: string;
}

export type SaveMealInput = {
  date: string; // YYYY-MM-DD
  mealType: MealType;
  plannedDishId?: string | null;
  completedDishId?: string | null;
  status: MealStatus;
  notes?: string | null;
};
