// Main navigation configuration for Harsha Delights Customer App

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAppSelector, useAppDispatch } from '../store';
import {
  selectIsAuthenticated,
  selectIsFirstLaunch,
  selectHasCompletedOnboarding,
} from '../store/slices/authSlice';
import {
  selectIsInitialized,
  selectSplashLoading,
  setInitialized,
} from '../store/slices/appSlice';

// Screen imports
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import {
  ProductDetailsScreen,
  SearchScreen,
  CartScreen,
  CheckoutScreen,
  OrderConfirmationScreen,
  OrderTrackingScreen,
  ProfileScreen,
  AddressScreen,
  AddAddressScreen,
  PaymentMethodsScreen,
  AddPaymentMethodScreen,
  OrderHistoryScreen,
  OrderDetailsScreen,
  WishlistScreen,
  ReviewsScreen,
  WriteReviewScreen,
  NotificationsScreen,
  SettingsScreen,
  SupportScreen,
} from '../screens';

import { RootStackParamList } from '../types';
import { COLORS } from '../constants';

const RootStack = createStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isFirstLaunch = useAppSelector(selectIsFirstLaunch);
  const hasCompletedOnboarding = useAppSelector(selectHasCompletedOnboarding);
  const isInitialized = useAppSelector(selectIsInitialized);
  const splashLoading = useAppSelector(selectSplashLoading);

  useEffect(() => {
    // Initialize app after a short delay
    const timer = setTimeout(() => {
      dispatch(setInitialized(true));
    }, 2000);

    return () => clearTimeout(timer);
  }, [dispatch]);

  // Show splash screen while app is initializing
  if (!isInitialized || splashLoading) {
    return <SplashScreen />;
  }

  // Show onboarding for first-time users
  if (isFirstLaunch || !hasCompletedOnboarding) {
    return <OnboardingScreen />;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: COLORS.background },
        }}>
        {isAuthenticated ? (
          // Authenticated user screens
          <>
            <RootStack.Screen name="Main" component={MainTabNavigator} />
            <RootStack.Screen
              name="ProductDetails"
              component={ProductDetailsScreen}
              options={{
                headerShown: true,
                title: 'Product Details',
                headerStyle: { backgroundColor: COLORS.primary },
                headerTintColor: COLORS.white,
              }}
            />
            <RootStack.Screen
              name="Search"
              component={SearchScreen}
              options={{
                headerShown: true,
                title: 'Search',
                headerStyle: { backgroundColor: COLORS.primary },
                headerTintColor: COLORS.white,
              }}
            />
            <RootStack.Screen
              name="Cart"
              component={CartScreen}
              options={{
                headerShown: true,
                title: 'Shopping Cart',
                headerStyle: { backgroundColor: COLORS.primary },
                headerTintColor: COLORS.white,
              }}
            />
            <RootStack.Screen
              name="Checkout"
              component={CheckoutScreen}
              options={{
                headerShown: true,
                title: 'Checkout',
                headerStyle: { backgroundColor: COLORS.primary },
                headerTintColor: COLORS.white,
              }}
            />
            <RootStack.Screen
              name="OrderConfirmation"
              component={OrderConfirmationScreen}
              options={{
                headerShown: true,
                title: 'Order Confirmation',
                headerStyle: { backgroundColor: COLORS.success },
                headerTintColor: COLORS.white,
                gestureEnabled: false,
                headerLeft: () => null,
              }}
            />
            <RootStack.Screen
              name="OrderTracking"
              component={OrderTrackingScreen}
              options={{
                headerShown: true,
                title: 'Track Order',
                headerStyle: { backgroundColor: COLORS.primary },
                headerTintColor: COLORS.white,
              }}
            />
            <RootStack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                headerShown: true,
                title: 'Profile',
                headerStyle: { backgroundColor: COLORS.primary },
                headerTintColor: COLORS.white,
              }}
            />
            <RootStack.Screen
              name="Address"
              component={AddressScreen}
              options={{
                headerShown: true,
                title: 'Addresses',
                headerStyle: { backgroundColor: COLORS.primary },
                headerTintColor: COLORS.white,
              }}
            />
            <RootStack.Screen
              name="AddAddress"
              component={AddAddressScreen}
              options={{
                headerShown: true,
                title: 'Add Address',
                headerStyle: { backgroundColor: COLORS.primary },
                headerTintColor: COLORS.white,
              }}
            />
            <RootStack.Screen
              name="PaymentMethods"
              component={PaymentMethodsScreen}
              options={{
                headerShown: true,
                title: 'Payment Methods',
                headerStyle: { backgroundColor: COLORS.primary },
                headerTintColor: COLORS.white,
              }}
            />
            <RootStack.Screen
              name="AddPaymentMethod"
              component={AddPaymentMethodScreen}
              options={{
                headerShown: true,
                title: 'Add Payment Method',
                headerStyle: { backgroundColor: COLORS.primary },
                headerTintColor: COLORS.white,
              }}
            />
            <RootStack.Screen
              name="OrderHistory"
              component={OrderHistoryScreen}
              options={{
                headerShown: true,
                title: 'Order History',
                headerStyle: { backgroundColor: COLORS.primary },
                headerTintColor: COLORS.white,
              }}
            />
            <RootStack.Screen
              name="OrderDetails"
              component={OrderDetailsScreen}
              options={{
                headerShown: true,
                title: 'Order Details',
                headerStyle: { backgroundColor: COLORS.primary },
                headerTintColor: COLORS.white,
              }}
            />
            <RootStack.Screen
              name="Wishlist"
              component={WishlistScreen}
              options={{
                headerShown: true,
                title: 'Wishlist',
                headerStyle: { backgroundColor: COLORS.primary },
                headerTintColor: COLORS.white,
              }}
            />
            <RootStack.Screen
              name="Reviews"
              component={ReviewsScreen}
              options={{
                headerShown: true,
                title: 'Reviews',
                headerStyle: { backgroundColor: COLORS.primary },
                headerTintColor: COLORS.white,
              }}
            />
            <RootStack.Screen
              name="WriteReview"
              component={WriteReviewScreen}
              options={{
                headerShown: true,
                title: 'Write Review',
                headerStyle: { backgroundColor: COLORS.primary },
                headerTintColor: COLORS.white,
              }}
            />
            <RootStack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{
                headerShown: true,
                title: 'Notifications',
                headerStyle: { backgroundColor: COLORS.primary },
                headerTintColor: COLORS.white,
              }}
            />
            <RootStack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                headerShown: true,
                title: 'Settings',
                headerStyle: { backgroundColor: COLORS.primary },
                headerTintColor: COLORS.white,
              }}
            />
            <RootStack.Screen
              name="Support"
              component={SupportScreen}
              options={{
                headerShown: true,
                title: 'Support',
                headerStyle: { backgroundColor: COLORS.primary },
                headerTintColor: COLORS.white,
              }}
            />
          </>
        ) : (
          // Unauthenticated user screens
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;