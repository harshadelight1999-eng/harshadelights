// Redux Store Configuration for Harsha Delights Customer App

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import { MMKV } from 'react-native-mmkv';
import authSlice from './slices/authSlice';
import cartSlice from './slices/cartSlice';
import productsSlice from './slices/productsSlice';
import ordersSlice from './slices/ordersSlice';
import userSlice from './slices/userSlice';
import notificationsSlice from './slices/notificationsSlice';
import wishlistSlice from './slices/wishlistSlice';
import appSlice from './slices/appSlice';

// Initialize MMKV for secure and fast storage
const storage = new MMKV();

// Create redux-persist storage adapter for MMKV
const reduxStorage = {
  setItem: (key: string, value: string) => {
    storage.set(key, value);
    return Promise.resolve(true);
  },
  getItem: (key: string) => {
    const value = storage.getString(key);
    return Promise.resolve(value);
  },
  removeItem: (key: string) => {
    storage.delete(key);
    return Promise.resolve();
  },
};

// Root reducer combining all slices
const rootReducer = combineReducers({
  auth: authSlice,
  cart: cartSlice,
  products: productsSlice,
  orders: ordersSlice,
  user: userSlice,
  notifications: notificationsSlice,
  wishlist: wishlistSlice,
  app: appSlice,
});

// Persist configuration
const persistConfig = {
  key: 'harsha_delights_root',
  storage: reduxStorage,
  whitelist: ['auth', 'cart', 'user', 'wishlist', 'app'], // Only persist these slices
  blacklist: ['products', 'orders', 'notifications'], // Don't persist these (fetch fresh)
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store with middleware
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: __DEV__,
});

// Create persistor
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for better TypeScript support
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;