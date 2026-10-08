import { configureStore } from '@reduxjs/toolkit';
import dishesReducer from './slices/dishesSlice';
import mealsReducer from './slices/mealsSlice';

export const store = configureStore({
  reducer: {
    dishes: dishesReducer,
    meals: mealsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
