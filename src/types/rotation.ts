import { Dish } from './dish';
import { MealType } from './meal';

export interface CategoryRotationStatus {
  mealType: MealType;
  totalEligible: number;
  completedCount: number;
  remainingCount: number;
  availableDishes: Dish[];
  recentlyCookedDishes: Dish[];
  isCycleJustCompleted: boolean;
}
