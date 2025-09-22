// Notifications slice for Redux store

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Notification, NotificationType } from '../../types';
import { notificationService } from '../../services/notificationService';

// Notifications state interface
interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  settings: {
    pushEnabled: boolean;
    emailEnabled: boolean;
    smsEnabled: boolean;
    orderUpdates: boolean;
    promotions: boolean;
    newProducts: boolean;
  };
}

// Initial state
const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  settings: {
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    orderUpdates: true,
    promotions: true,
    newProducts: true,
  },
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await notificationService.getNotifications(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationIds: string[], { rejectWithValue }) => {
    try {
      await notificationService.markAsRead(notificationIds);
      return notificationIds;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark as read');
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all as read');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await notificationService.deleteNotification(notificationId);
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete notification');
    }
  }
);

export const updateNotificationSettings = createAsyncThunk(
  'notifications/updateSettings',
  async (settings: Partial<NotificationsState['settings']>, { rejectWithValue }) => {
    try {
      const response = await notificationService.updateSettings(settings);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update settings');
    }
  }
);

// Notifications slice
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      const notification = action.payload;
      
      // Add to beginning of array
      state.notifications.unshift(notification);
      
      // Update unread count if notification is unread
      if (!notification.isRead) {
        state.unreadCount += 1;
      }
      
      // Limit to 100 notifications
      if (state.notifications.length > 100) {
        state.notifications = state.notifications.slice(0, 100);
      }
    },
    markLocalAsRead: (state, action: PayloadAction<string[]>) => {
      const notificationIds = action.payload;
      
      state.notifications = state.notifications.map(notification => {
        if (notificationIds.includes(notification.id) && !notification.isRead) {
          state.unreadCount -= 1;
          return { ...notification, isRead: true };
        }
        return notification;
      });
    },
    removeLocalNotification: (state, action: PayloadAction<string>) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);
      
      if (notification && !notification.isRead) {
        state.unreadCount -= 1;
      }
      
      state.notifications = state.notifications.filter(n => n.id !== notificationId);
    },
    updateSettings: (state, action: PayloadAction<Partial<NotificationsState['settings']>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    resetNotificationsState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        const { notifications, unreadCount } = action.payload;
        
        state.notifications = notifications;
        state.unreadCount = unreadCount;
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Mark as read
    builder
      .addCase(markAsRead.pending, (state) => {
        state.error = null;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notificationIds = action.payload;
        
        state.notifications = state.notifications.map(notification => {
          if (notificationIds.includes(notification.id) && !notification.isRead) {
            state.unreadCount -= 1;
            return { ...notification, isRead: true };
          }
          return notification;
        });
        
        state.error = null;
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Mark all as read
    builder
      .addCase(markAllAsRead.pending, (state) => {
        state.error = null;
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(notification => ({
          ...notification,
          isRead: true,
        }));
        state.unreadCount = 0;
        state.error = null;
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete notification
    builder
      .addCase(deleteNotification.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notification = state.notifications.find(n => n.id === notificationId);
        
        if (notification && !notification.isRead) {
          state.unreadCount -= 1;
        }
        
        state.notifications = state.notifications.filter(n => n.id !== notificationId);
        state.error = null;
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Update notification settings
    builder
      .addCase(updateNotificationSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateNotificationSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = { ...state.settings, ...action.payload };
        state.error = null;
      })
      .addCase(updateNotificationSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  clearError,
  addNotification,
  markLocalAsRead,
  removeLocalNotification,
  updateSettings,
  resetNotificationsState,
} = notificationsSlice.actions;

// Export reducer
export default notificationsSlice.reducer;

// Selectors
export const selectNotifications = (state: { notifications: NotificationsState }) => state.notifications.notifications;
export const selectUnreadCount = (state: { notifications: NotificationsState }) => state.notifications.unreadCount;
export const selectNotificationsLoading = (state: { notifications: NotificationsState }) => state.notifications.isLoading;
export const selectNotificationsError = (state: { notifications: NotificationsState }) => state.notifications.error;
export const selectNotificationSettings = (state: { notifications: NotificationsState }) => state.notifications.settings;

// Complex selectors
export const selectUnreadNotifications = (state: { notifications: NotificationsState }) =>
  state.notifications.notifications.filter(notification => !notification.isRead);

export const selectNotificationsByType = (type: NotificationType) => (state: { notifications: NotificationsState }) =>
  state.notifications.notifications.filter(notification => notification.type === type);
