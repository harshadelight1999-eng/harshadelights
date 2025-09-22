// Shopping cart screen - inspired by ClientFlow cart functionality

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppSelector, useAppDispatch } from '../store';
import {
  selectCartItems,
  selectCartSubtotal,
  selectCartTax,
  selectCartTotal,
  selectCartItemCount,
  selectCartLoading,
  selectCartError,
  fetchCart,
  clearCart,
  validateCart,
} from '../store/slices/cartSlice';
import { CartStackParamList, CartItem } from '../types';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../constants';
import CartItemCard from '../components/CartItemCard';
import CustomButton from '../components/CustomButton';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

type CartScreenNavigationProp = StackNavigationProp<CartStackParamList, 'CartScreen'>;

interface Props {
  navigation: CartScreenNavigationProp;
}

const CartScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();

  // Redux state
  const cartItems = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const tax = useAppSelector(selectCartTax);
  const total = useAppSelector(selectCartTotal);
  const itemCount = useAppSelector(selectCartItemCount);
  const isLoading = useAppSelector(selectCartLoading);
  const error = useAppSelector(selectCartError);

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [validatingCart, setValidatingCart] = useState(false);

  useEffect(() => {
    // Fetch cart on component mount
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    // Update navigation title with item count
    navigation.setOptions({
      title: `Shopping Cart${itemCount > 0 ? ` (${itemCount})` : ''}`,
    });
  }, [navigation, itemCount]);

  const formatPrice = (price: number, currency: string = 'MYR') => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(price);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchCart());
    setRefreshing(false);
  };

  const handleValidateCart = async () => {
    setValidatingCart(true);
    try {
      await dispatch(validateCart()).unwrap();
      // Show success message or handle price updates
    } catch (error) {
      Alert.alert('Cart Validation', 'Some items in your cart have been updated due to price or availability changes.');
    } finally {
      setValidatingCart(false);
    }
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear Cart',
          style: 'destructive',
          onPress: () => {
            dispatch(clearCart());
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before proceeding to checkout.');
      return;
    }

    // Validate cart before checkout
    handleValidateCart().then(() => {
      navigation.navigate('Checkout');
    });
  };

  const handleItemPress = (item: CartItem) => {
    navigation.navigate('ProductDetails', { productId: item.product.id });
  };

  const renderCartItem = ({ item }: { item: CartItem }) => {
    return (
      <CartItemCard
        item={item}
        onPress={handleItemPress}
        editable={true}
      />
    );
  };

  const renderCartSummary = () => {
    if (cartItems.length === 0) return null;

    return (
      <View style={styles.summaryContainer}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <TouchableOpacity onPress={handleValidateCart} disabled={validatingCart}>
            <View style={styles.validateButton}>
              <Icon
                name="refresh"
                size={16}
                color={COLORS.primary}
                style={validatingCart ? { opacity: 0.5 } : {}}
              />
              <Text style={[styles.validateText, validatingCart && { opacity: 0.5 }]}>
                Validate Prices
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal ({itemCount} items)</Text>
          <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax (GST 6%)</Text>
          <Text style={styles.summaryValue}>{formatPrice(tax)}</Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(total)}</Text>
        </View>

        <Text style={styles.deliveryNote}>
          * Delivery charges will be calculated at checkout
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (cartItems.length === 0) return null;

    return (
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={styles.clearCartButton}
          onPress={handleClearCart}>
          <Text style={styles.clearCartText}>Clear Cart</Text>
        </TouchableOpacity>

        <CustomButton
          title="Proceed to Checkout"
          onPress={handleProceedToCheckout}
          loading={validatingCart}
          disabled={cartItems.length === 0 || !cartItems.every(item => item.product.inStock)}
          style={styles.checkoutButton}
        />
      </View>
    );
  };

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="Loading your cart..." />
      </SafeAreaView>
    );
  }

  if (error && cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorMessage
          message={error}
          onRetry={() => dispatch(fetchCart())}
        />
      </SafeAreaView>
    );
  }

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon="shopping-cart"
          title="Your cart is empty"
          message="Add some delicious treats to your cart and enjoy sweet moments!"
          actionText="Start Shopping"
          onAction={() => navigation.navigate('Home')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListFooterComponent={() => (
          <View>
            {renderCartSummary()}
            {renderFooter()}
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },
  summaryContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    ...SHADOWS.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  summaryTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.text,
  },
  validateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  validateText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.text,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.text,
  },
  totalValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.primary,
  },
  deliveryNote: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
  footerContainer: {
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  clearCartButton: {
    alignSelf: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  clearCartText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.error,
    textDecorationLine: 'underline',
  },
  checkoutButton: {
    marginHorizontal: 0,
  },
});

export default CartScreen;