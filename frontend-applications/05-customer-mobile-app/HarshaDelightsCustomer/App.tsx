/**
 * Harsha Delights Customer Mobile App
 * A comprehensive React Native app for confectionery shopping
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';

// Store and navigation
import { store, persistor } from './src/store';
import RootNavigator from './src/navigation';

// Services and providers
import { NetworkProvider } from './src/providers/NetworkProvider';
import { NotificationProvider } from './src/providers/NotificationProvider';
import { ThemeProvider } from './src/providers/ThemeProvider';

// Components
import SplashScreen from './src/screens/SplashScreen';
import ErrorBoundary from './src/components/ErrorBoundary';
import GlobalModals from './src/components/GlobalModals';

// Redux actions
import { setOnlineStatus } from './src/store/slices/appSlice';

// Constants
import { COLORS } from './src/constants';

// Ignore specific warnings for cleaner development experience
LogBox.ignoreLogs([
  'VirtualizedLists should never be nested',
  'Setting a timer for a long period of time',
  'Non-serializable values were found in the navigation state',
]);

const App: React.FC = () => {
  useEffect(() => {
    // Monitor network connectivity
    const unsubscribe = NetInfo.addEventListener(state => {
      store.dispatch(setOnlineStatus(state.isConnected ?? false));
    });

    return unsubscribe;
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <PersistGate loading={<SplashScreen />} persistor={persistor}>
            <ErrorBoundary>
              <ThemeProvider>
                <NetworkProvider>
                  <NotificationProvider>
                    <StatusBar
                      barStyle="light-content"
                      backgroundColor={COLORS.primary}
                    />
                    <RootNavigator />
                    <GlobalModals />
                    <Toast />
                  </NotificationProvider>
                </NetworkProvider>
              </ThemeProvider>
            </ErrorBoundary>
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
