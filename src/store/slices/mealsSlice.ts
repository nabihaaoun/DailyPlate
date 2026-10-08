import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Meal, MealType, SaveMealInput } from '../../types/meal';
import { fetchAllMeals, upsertMeal, removeMeal } from '../../db/mealsRepository';

export interface MealsState {
  meals: Record<string, Meal>; // key: `${date}_${mealType}`
  isLoading: boolean;
  error: string | null;
}

const initialState: MealsState = {
  meals: {},
  isLoading: false,
  error: null,
};

export function getMealKey(date: string, mealType: MealType): string {
  return `${date}_${mealType}`;
}

export const loadAllMeals = createAsyncThunk('meals/loadAll', async () => {
  return await fetchAllMeals();
});

export const saveMeal = createAsyncThunk('meals/save', async (input: SaveMealInput) => {
  return await upsertMeal(input);
});

export const deleteMeal = createAsyncThunk(
  'meals/delete',
  async ({ date, mealType }: { date: string; mealType: MealType }) => {
    await removeMeal(date, mealType);
    return { date, mealType };
  }
);

export const mealsSlice = createSlice({
  name: 'meals',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // loadAllMeals
    builder.addCase(loadAllMeals.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loadAllMeals.fulfilled, (state, action: PayloadAction<Meal[]>) => {
      state.isLoading = false;
      const map: Record<string, Meal> = {};
      for (const meal of action.payload) {
        map[getMealKey(meal.date, meal.mealType)] = meal;
      }
      state.meals = map;
    });
    builder.addCase(loadAllMeals.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to load meals';
    });

    // saveMeal
    builder.addCase(saveMeal.fulfilled, (state, action: PayloadAction<Meal>) => {
      const key = getMealKey(action.payload.date, action.payload.mealType);
      state.meals[key] = action.payload;
    });

    // deleteMeal
    builder.addCase(deleteMeal.fulfilled, (state, action) => {
      const key = getMealKey(action.payload.date, action.payload.mealType);
      delete state.meals[key];
    });
  },
});

export default mealsSlice.reducer;
