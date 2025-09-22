// App slice for Redux store

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// App state interface
interface AppState {
  isOnline: boolean;
  isInitialized: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  region: string;
  appVersion: string;
  forceUpdate: boolean;
  maintenanceMode: boolean;
  loading: {
    global: boolean;
    splash: boolean;
  };
  error: {
    global: string | null;
    network: string | null;
  };
  modals: {
    authModal: boolean;
    networkModal: boolean;
    updateModal: boolean;
    maintenanceModal: boolean;
  };
  cache: {
    lastSyncTime: string | null;
    syncInProgress: boolean;
  };
}

// Initial state
const initialState: AppState = {
  isOnline: true,
  isInitialized: false,
  theme: 'system',
  language: 'en',
  currency: 'MYR',
  region: 'MY',
  appVersion: '1.0.0',
  forceUpdate: false,
  maintenanceMode: false,
  loading: {
    global: false,
    splash: true,
  },
  error: {
    global: null,
    network: null,
  },
  modals: {
    authModal: false,
    networkModal: false,
    updateModal: false,
    maintenanceModal: false,
  },
  cache: {
    lastSyncTime: null,
    syncInProgress: false,
  },
};

// App slice
const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
      
      if (!action.payload) {
        state.error.network = 'No internet connection';
      } else {
        state.error.network = null;
      }
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
      if (action.payload) {
        state.loading.splash = false;
      }
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setCurrency: (state, action: PayloadAction<string>) => {
      state.currency = action.payload;
    },
    setRegion: (state, action: PayloadAction<string>) => {
      state.region = action.payload;
    },
    setAppVersion: (state, action: PayloadAction<string>) => {
      state.appVersion = action.payload;
    },
    setForceUpdate: (state, action: PayloadAction<boolean>) => {
      state.forceUpdate = action.payload;
      state.modals.updateModal = action.payload;
    },
    setMaintenanceMode: (state, action: PayloadAction<boolean>) => {
      state.maintenanceMode = action.payload;
      state.modals.maintenanceModal = action.payload;
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },
    setSplashLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.splash = action.payload;
    },
    setGlobalError: (state, action: PayloadAction<string | null>) => {
      state.error.global = action.payload;
    },
    setNetworkError: (state, action: PayloadAction<string | null>) => {
      state.error.network = action.payload;
    },
    clearErrors: (state) => {
      state.error.global = null;
      state.error.network = null;
    },
    showModal: (state, action: PayloadAction<keyof AppState['modals']>) => {
      state.modals[action.payload] = true;
    },
    hideModal: (state, action: PayloadAction<keyof AppState['modals']>) => {
      state.modals[action.payload] = false;
    },
    hideAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key as keyof AppState['modals']] = false;
      });
    },
    setSyncInProgress: (state, action: PayloadAction<boolean>) => {
      state.cache.syncInProgress = action.payload;
    },
    setLastSyncTime: (state, action: PayloadAction<string>) => {
      state.cache.lastSyncTime = action.payload;
    },
    resetAppState: () => ({
      ...initialState,
      isInitialized: true,
      loading: {
        global: false,
        splash: false,
      },
    }),
  },
});

// Export actions
export const {
  setOnlineStatus,
  setInitialized,
  setTheme,
  setLanguage,
  setCurrency,
  setRegion,
  setAppVersion,
  setForceUpdate,
  setMaintenanceMode,
  setGlobalLoading,
  setSplashLoading,
  setGlobalError,
  setNetworkError,
  clearErrors,
  showModal,
  hideModal,
  hideAllModals,
  setSyncInProgress,
  setLastSyncTime,
  resetAppState,
} = appSlice.actions;

// Export reducer
export default appSlice.reducer;

// Selectors
export const selectIsOnline = (state: { app: AppState }) => state.app.isOnline;
export const selectIsInitialized = (state: { app: AppState }) => state.app.isInitialized;
export const selectTheme = (state: { app: AppState }) => state.app.theme;
export const selectLanguage = (state: { app: AppState }) => state.app.language;
export const selectCurrency = (state: { app: AppState }) => state.app.currency;
export const selectRegion = (state: { app: AppState }) => state.app.region;
export const selectAppVersion = (state: { app: AppState }) => state.app.appVersion;
export const selectForceUpdate = (state: { app: AppState }) => state.app.forceUpdate;
export const selectMaintenanceMode = (state: { app: AppState }) => state.app.maintenanceMode;
export const selectGlobalLoading = (state: { app: AppState }) => state.app.loading.global;
export const selectSplashLoading = (state: { app: AppState }) => state.app.loading.splash;
export const selectGlobalError = (state: { app: AppState }) => state.app.error.global;
export const selectNetworkError = (state: { app: AppState }) => state.app.error.network;
export const selectModals = (state: { app: AppState }) => state.app.modals;
export const selectSyncInProgress = (state: { app: AppState }) => state.app.cache.syncInProgress;
export const selectLastSyncTime = (state: { app: AppState }) => state.app.cache.lastSyncTime;

// Complex selectors
export const selectHasAnyError = (state: { app: AppState }) =>
  Boolean(state.app.error.global || state.app.error.network);

export const selectIsAnyModalOpen = (state: { app: AppState }) =>
  Object.values(state.app.modals).some(isOpen => isOpen);

export const selectIsAppReady = (state: { app: AppState }) =>
  state.app.isInitialized && !state.app.loading.splash && !state.app.maintenanceMode;
