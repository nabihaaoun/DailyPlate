import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Dish, CreateDishInput, UpdateDishInput } from '../../types/dish';
import {
  fetchAllDishes,
  insertDish,
  insertBatchDishes,
  updateDishRecord,
  softDeleteDish,
} from '../../db/dishesRepository';

export interface DishesState {
  items: Dish[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DishesState = {
  items: [],
  isLoading: false,
  error: null,
};

export const loadDishes = createAsyncThunk('dishes/load', async () => {
  return await fetchAllDishes();
});

export const addDish = createAsyncThunk('dishes/add', async (input: CreateDishInput) => {
  return await insertDish(input);
});

export const addBatchDishes = createAsyncThunk(
  'dishes/addBatch',
  async (inputs: CreateDishInput[]) => {
    return await insertBatchDishes(inputs);
  }
);

export const updateDish = createAsyncThunk(
  'dishes/update',
  async (input: UpdateDishInput) => {
    await updateDishRecord(input);
    return input;
  }
);

export const removeDish = createAsyncThunk('dishes/remove', async (id: string) => {
  await softDeleteDish(id);
  return id;
});

export const seedSampleDishes = createAsyncThunk('dishes/seed', async () => {
  const existing = await fetchAllDishes();
  if (existing.length > 0) return existing;

  const sampleDishes: CreateDishInput[] = [
    { name: 'Aloo Paratha', category: 'breakfast' },
    { name: 'Omelette & Toast', category: 'breakfast' },
    { name: 'Chana Masala', category: 'breakfast' },
    { name: 'Halwa Puri', category: 'breakfast' },
    { name: 'Chicken Karahi', category: 'lunch' },
    { name: 'Biryani', category: 'lunch' },
    { name: 'Daal Rice', category: 'lunch' },
    { name: 'Palak Paneer', category: 'lunch' },
    { name: 'Chapli Kebab', category: 'dinner' },
    { name: 'Mixed Vegetable Curry', category: 'dinner' },
    { name: 'Chicken Tikka', category: 'dinner' },
    { name: 'Kadhi Pakora', category: 'dinner' },
  ];

  return await insertBatchDishes(sampleDishes);
});

export const dishesSlice = createSlice({
  name: 'dishes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // loadDishes
    builder.addCase(loadDishes.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loadDishes.fulfilled, (state, action: PayloadAction<Dish[]>) => {
      state.isLoading = false;
      state.items = action.payload;
    });
    builder.addCase(loadDishes.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to load dishes';
    });

    // addDish
    builder.addCase(addDish.fulfilled, (state, action: PayloadAction<Dish>) => {
      state.items.push(action.payload);
      state.items.sort((a, b) => a.name.localeCompare(b.name));
    });

    // addBatchDishes
    builder.addCase(addBatchDishes.fulfilled, (state, action: PayloadAction<Dish[]>) => {
      state.items.push(...action.payload);
      state.items.sort((a, b) => a.name.localeCompare(b.name));
    });

    // updateDish
    builder.addCase(updateDish.fulfilled, (state, action: PayloadAction<UpdateDishInput>) => {
      const idx = state.items.findIndex((d) => d.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = {
          ...state.items[idx],
          ...action.payload,
        };
        state.items.sort((a, b) => a.name.localeCompare(b.name));
      }
    });

    // removeDish
    builder.addCase(removeDish.fulfilled, (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((d) => d.id !== action.payload);
    });

    // seedSampleDishes
    builder.addCase(seedSampleDishes.fulfilled, (state, action: PayloadAction<Dish[]>) => {
      state.items = action.payload;
      state.items.sort((a, b) => a.name.localeCompare(b.name));
    });
  },
});

export default dishesSlice.reducer;
