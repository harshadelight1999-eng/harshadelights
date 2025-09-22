// Push notifications provider

import React, { useEffect, createContext, useContext } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import PushNotification, { Importance } from 'react-native-push-notification';
import { useAppDispatch, useAppSelector } from '../store';
import { selectIsAuthenticated, selectUser } from '../store/slices/authSlice';
import { addNotification } from '../store/slices/notificationsSlice';
import { updateOrderStatus } from '../store/slices/ordersSlice';
import { NotificationType } from '../types';

interface NotificationContextType {
  requestPermission: () => Promise<boolean>;
  getToken: () => Promise<string | null>;
  hasPermission: boolean;
}

const NotificationContext = createContext<NotificationContextType>({
  requestPermission: async () => false,
  getToken: async () => null,
  hasPermission: false,
});

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const [hasPermission, setHasPermission] = React.useState(false);

  useEffect(() => {
    initializeNotifications();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      setupAuthenticatedNotifications();
    }
  }, [isAuthenticated, user]);

  const initializeNotifications = async () => {
    // Configure push notifications
    PushNotification.configure({
      // Called when Token is generated (iOS and Android)
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },

      // Called when a remote is received or opened/clicked
      onNotification: function (notification) {
        handleNotificationReceived(notification);
      },

      // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
      onAction: function (notification) {
        console.log('ACTION:', notification.action);
        console.log('NOTIFICATION:', notification);
      },

      // (optional) Called when the user fails to register for remote notifications
      onRegistrationError: function (err) {
        console.error(err.message, err);
      },

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Should the initial notification be popped automatically
      popInitialNotification: true,

      // (optional) default: true
      requestPermissions: true,
    });

    // Create notification channels (Android)
    if (Platform.OS === 'android') {
      createNotificationChannels();
    }

    // Check initial permission status
    const authStatus = await messaging().hasPermission();
    setHasPermission(
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  };

  const createNotificationChannels = () => {
    PushNotification.createChannel(
      {
        channelId: 'order-updates',
        channelName: 'Order Updates',
        channelDescription: 'Notifications about your order status',
        playSound: true,
        soundName: 'default',
        importance: Importance.HIGH,
        vibrate: true,
      },
      (created) => console.log(`createChannel 'order-updates' returned '${created}'`)
    );

    PushNotification.createChannel(
      {
        channelId: 'promotions',
        channelName: 'Promotions',
        channelDescription: 'Special offers and discounts',
        playSound: true,
        soundName: 'default',
        importance: Importance.DEFAULT,
        vibrate: false,
      },
      (created) => console.log(`createChannel 'promotions' returned '${created}'`)
    );

    PushNotification.createChannel(
      {
        channelId: 'general',
        channelName: 'General',
        channelDescription: 'General notifications',
        playSound: true,
        soundName: 'default',
        importance: Importance.DEFAULT,
        vibrate: true,
      },
      (created) => console.log(`createChannel 'general' returned '${created}'`)
    );
  };

  const setupAuthenticatedNotifications = async () => {
    // Get FCM token
    const token = await getToken();
    if (token && user) {
      // Send token to backend to associate with user
      try {
        // await updateUserFCMToken(user.id, token);
        console.log('FCM Token sent to backend:', token);
      } catch (error) {
        console.error('Failed to update FCM token:', error);
      }
    }

    // Listen for foreground messages
    const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
      handleForegroundMessage(remoteMessage);
    });

    // Listen for background messages
    messaging().onNotificationOpenedApp((remoteMessage) => {
      handleNotificationOpened(remoteMessage);
    });

    // Check if app was opened from a notification (app was quit)
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          handleNotificationOpened(remoteMessage);
        }
      });

    return unsubscribeForeground;
  };

  const requestPermission = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          return false;
        }
      }

      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      setHasPermission(enabled);
      return enabled;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const getToken = async (): Promise<string | null> => {
    try {
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) return null;
      }

      const token = await messaging().getToken();
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  };

  const handleForegroundMessage = (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
    console.log('Foreground message received:', remoteMessage);

    // Show local notification
    PushNotification.localNotification({
      channelId: getChannelId(remoteMessage.data?.type as NotificationType),
      title: remoteMessage.notification?.title || 'Harsha Delights',
      message: remoteMessage.notification?.body || 'You have a new notification',
      data: remoteMessage.data,
      userInfo: remoteMessage.data,
    });

    // Add to notifications store
    if (remoteMessage.data) {
      dispatch(addNotification({
        id: remoteMessage.messageId || `notif_${Date.now()}`,
        userId: user?.id || '',
        type: (remoteMessage.data.type as NotificationType) || 'system',
        title: remoteMessage.notification?.title || 'Notification',
        message: remoteMessage.notification?.body || '',
        data: remoteMessage.data,
        isRead: false,
        createdAt: new Date().toISOString(),
      }));
    }

    // Handle specific notification types
    handleNotificationAction(remoteMessage);
  };

  const handleNotificationReceived = (notification: any) => {
    console.log('Local notification received:', notification);

    if (notification.userInteraction) {
      // User tapped on notification
      handleNotificationTapped(notification);
    }
  };

  const handleNotificationOpened = (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
    console.log('Notification opened app:', remoteMessage);
    handleNotificationAction(remoteMessage);
  };

  const handleNotificationTapped = (notification: any) => {
    console.log('Notification tapped:', notification);
    // Navigate to appropriate screen based on notification data
    // This would typically use navigation service
  };

  const handleNotificationAction = (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
    const { data } = remoteMessage;
    if (!data) return;

    switch (data.type) {
      case 'order_update':
        if (data.orderId && data.status) {
          dispatch(updateOrderStatus({
            orderId: data.orderId,
            status: data.status as any,
            timestamp: new Date().toISOString(),
            message: data.message || 'Order status updated',
          }));
        }
        break;

      case 'promotion':
        // Handle promotion notification
        console.log('Promotion notification:', data);
        break;

      case 'new_product':
        // Handle new product notification
        console.log('New product notification:', data);
        break;

      default:
        console.log('Unknown notification type:', data.type);
    }
  };

  const getChannelId = (type: NotificationType): string => {
    switch (type) {
      case 'order_update':
      case 'delivery':
      case 'payment':
        return 'order-updates';
      case 'promotion':
        return 'promotions';
      default:
        return 'general';
    }
  };

  const contextValue: NotificationContextType = {
    requestPermission,
    getToken,
    hasPermission,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};