// Main tab navigation for authenticated users

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppSelector } from '../store';
import { selectCartItemCount } from '../store/slices/cartSlice';
import { selectUnreadCount } from '../store/slices/notificationsSlice';

// Screen imports
import {
  HomeScreen,
  CategoriesScreen,
  SearchScreen,
  CartScreen,
  ProfileScreen,
  ProductDetailsScreen,
  CategoryProductsScreen,
} from '../screens';

import {
  MainTabParamList,
  HomeStackParamList,
  CategoriesStackParamList,
  SearchStackParamList,
  CartStackParamList,
  ProfileStackParamList,
} from '../types';

import { COLORS, TYPOGRAPHY, SPACING } from '../constants';

const MainTab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const CategoriesStack = createStackNavigator<CategoriesStackParamList>();
const SearchStack = createStackNavigator<SearchStackParamList>();
const CartStack = createStackNavigator<CartStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();

// Stack navigators for each tab
const HomeStackNavigator: React.FC = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}>
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
      <HomeStack.Screen
        name="ProductDetails"
        component={ProductDetailsScreen}
        options={{
          headerShown: true,
          title: 'Product Details',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
        }}
      />
      <HomeStack.Screen
        name="CategoryProducts"
        component={CategoryProductsScreen}
        options={({ route }) => ({
          headerShown: true,
          title: route.params.categoryName,
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
        })}
      />
    </HomeStack.Navigator>
  );
};

const CategoriesStackNavigator: React.FC = () => {
  return (
    <CategoriesStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}>
      <CategoriesStack.Screen name="CategoriesScreen" component={CategoriesScreen} />
      <CategoriesStack.Screen
        name="CategoryProducts"
        component={CategoryProductsScreen}
        options={({ route }) => ({
          headerShown: true,
          title: route.params.categoryName,
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
        })}
      />
      <CategoriesStack.Screen
        name="ProductDetails"
        component={ProductDetailsScreen}
        options={{
          headerShown: true,
          title: 'Product Details',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
        }}
      />
    </CategoriesStack.Navigator>
  );
};

const SearchStackNavigator: React.FC = () => {
  return (
    <SearchStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}>
      <SearchStack.Screen name="SearchScreen" component={SearchScreen} />
      <SearchStack.Screen
        name="ProductDetails"
        component={ProductDetailsScreen}
        options={{
          headerShown: true,
          title: 'Product Details',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
        }}
      />
    </SearchStack.Navigator>
  );
};

const CartStackNavigator: React.FC = () => {
  return (
    <CartStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}>
      <CartStack.Screen name="CartScreen" component={CartScreen} />
    </CartStack.Navigator>
  );
};

const ProfileStackNavigator: React.FC = () => {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}>
      <ProfileStack.Screen name="ProfileScreen" component={ProfileScreen} />
    </ProfileStack.Navigator>
  );
};

// Badge component for tab icons
const TabBadge: React.FC<{ count: number; color?: string }> = ({
  count,
  color = COLORS.error
}) => {
  if (count === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: -4,
        right: -8,
        backgroundColor: color,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
      }}>
      <span
        style={{
          color: COLORS.white,
          fontSize: 11,
          fontWeight: '600',
          textAlign: 'center',
        }}>
        {count > 99 ? '99+' : count.toString()}
      </span>
    </div>
  );
};

// Main tab navigator
const MainTabNavigator: React.FC = () => {
  const cartItemCount = useAppSelector(selectCartItemCount);
  const notificationCount = useAppSelector(selectUnreadCount);

  return (
    <MainTab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Categories':
              iconName = 'category';
              break;
            case 'Search':
              iconName = 'search';
              break;
            case 'Cart':
              iconName = 'shopping-cart';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'home';
          }

          return (
            <div style={{ position: 'relative' }}>
              <Icon name={iconName} size={size} color={color} />
              {route.name === 'Cart' && <TabBadge count={cartItemCount} />}
              {route.name === 'Profile' && <TabBadge count={notificationCount} />}
            </div>
          );
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          paddingBottom: SPACING.xs,
          paddingTop: SPACING.xs,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: TYPOGRAPHY.fontSize.xs,
          fontFamily: TYPOGRAPHY.fontFamily.medium,
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: SPACING.xs,
        },
      })}>
      <MainTab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          title: 'Home',
        }}
      />
      <MainTab.Screen
        name="Categories"
        component={CategoriesStackNavigator}
        options={{
          title: 'Categories',
        }}
      />
      <MainTab.Screen
        name="Search"
        component={SearchStackNavigator}
        options={{
          title: 'Search',
        }}
      />
      <MainTab.Screen
        name="Cart"
        component={CartStackNavigator}
        options={{
          title: 'Cart',
        }}
      />
      <MainTab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          title: 'Profile',
        }}
      />
    </MainTab.Navigator>
  );
};

export default MainTabNavigator;