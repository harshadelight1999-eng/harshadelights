// Network connectivity provider for offline support

import React, { useEffect, createContext, useContext } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useAppDispatch, useAppSelector } from '../store';
import { setOnlineStatus, selectIsOnline } from '../store/slices/appSlice';
import { setOfflineMode, syncOfflineCart } from '../store/slices/cartSlice';

interface NetworkContextType {
  isOnline: boolean;
  isOffline: boolean;
  networkType: string | null;
}

const NetworkContext = createContext<NetworkContextType>({
  isOnline: true,
  isOffline: false,
  networkType: null,
});

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

interface NetworkProviderProps {
  children: React.ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const isOnline = useAppSelector(selectIsOnline);
  const [networkType, setNetworkType] = React.useState<string | null>(null);

  useEffect(() => {
    // Initial network state check
    NetInfo.fetch().then((state: NetInfoState) => {
      dispatch(setOnlineStatus(state.isConnected ?? false));
      dispatch(setOfflineMode(!(state.isConnected ?? false)));
      setNetworkType(state.type);
    });

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const wasOnline = isOnline;
      const isCurrentlyOnline = state.isConnected ?? false;

      dispatch(setOnlineStatus(isCurrentlyOnline));
      dispatch(setOfflineMode(!isCurrentlyOnline));
      setNetworkType(state.type);

      // Handle network state transitions
      if (!wasOnline && isCurrentlyOnline) {
        // Came back online - sync offline data
        handleOnlineRecovery();
      } else if (wasOnline && !isCurrentlyOnline) {
        // Went offline - enable offline mode
        handleOfflineMode();
      }
    });

    return unsubscribe;
  }, [dispatch, isOnline]);

  const handleOnlineRecovery = async () => {
    try {
      // Sync offline cart items
      await dispatch(syncOfflineCart()).unwrap();

      // You can add more sync operations here:
      // - Sync wishlist items
      // - Sync user preferences
      // - Upload cached analytics data
      // - Refresh product data

      console.log('✅ Successfully synced offline data');
    } catch (error) {
      console.error('❌ Failed to sync offline data:', error);
    }
  };

  const handleOfflineMode = () => {
    console.log('📴 Switched to offline mode');
    // You can add offline-specific initialization here
  };

  const contextValue: NetworkContextType = {
    isOnline,
    isOffline: !isOnline,
    networkType,
  };

  return (
    <NetworkContext.Provider value={contextValue}>
      {children}
    </NetworkContext.Provider>
  );
};