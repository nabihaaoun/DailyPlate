export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'all';

export interface Dish {
  id: string;
  name: string;
  category: MealCategory;
  isActive: boolean;
  createdAt: string;
}

export type CreateDishInput = {
  name: string;
  category: MealCategory;
};

export type UpdateDishInput = {
  id: string;
  name?: string;
  category?: MealCategory;
  isActive?: boolean;
};
