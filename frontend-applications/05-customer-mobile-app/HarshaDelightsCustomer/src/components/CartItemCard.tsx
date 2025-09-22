// Cart item card component - inspired by ClientFlow cart patterns

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppDispatch } from '../store';
import { updateCartItem, removeFromCart } from '../store/slices/cartSlice';
import { CartItem } from '../types';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDER_RADIUS } from '../constants';
import QuantitySelector from './QuantitySelector';

interface CartItemCardProps {
  item: CartItem;
  onPress?: (item: CartItem) => void;
  style?: any;
  editable?: boolean;
}

const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onPress,
  style,
  editable = true,
}) => {
  const dispatch = useAppDispatch();
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price: number, currency: string = 'MYR') => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(price);
  };

  const calculateItemTotal = () => {
    const productTotal = item.product.price * item.quantity;
    const customizationsTotal = item.customizations?.reduce(
      (sum, customization) => sum + (customization.additionalPrice || 0),
      0
    ) || 0;
    return productTotal + customizationsTotal;
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem();
      return;
    }

    dispatch(updateCartItem({
      itemId: item.id,
      quantity: newQuantity,
      customizations: item.customizations,
    }));
  };

  const handleRemoveItem = () => {
    Alert.alert(
      'Remove Item',
      `Are you sure you want to remove \"${item.product.name}\" from your cart?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            dispatch(removeFromCart(item.id));
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleItemPress = () => {
    if (onPress) {
      onPress(item);
    }
  };

  const renderCustomizations = () => {
    if (!item.customizations || item.customizations.length === 0) {
      return null;
    }

    return (
      <View style={styles.customizationsContainer}>
        {item.customizations.map((customization, index) => (
          <View key={index} style={styles.customizationItem}>
            <Text style={styles.customizationType}>{customization.type}:</Text>
            <Text style={styles.customizationValue}>{customization.value}</Text>
            {customization.additionalPrice && customization.additionalPrice > 0 && (
              <Text style={styles.customizationPrice}>
                +{formatPrice(customization.additionalPrice, item.product.currency)}
              </Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderStockWarning = () => {
    if (item.product.inStock && item.product.stockQuantity >= item.quantity) {
      return null;
    }

    if (!item.product.inStock) {
      return (
        <View style={[styles.warningContainer, { backgroundColor: COLORS.error }]}>
          <Icon name="error" size={16} color={COLORS.white} />
          <Text style={styles.warningText}>Out of stock</Text>
        </View>
      );
    }

    if (item.product.stockQuantity < item.quantity) {
      return (
        <View style={[styles.warningContainer, { backgroundColor: COLORS.warning }]}>
          <Icon name="warning" size={16} color={COLORS.white} />
          <Text style={styles.warningText}>
            Only {item.product.stockQuantity} available
          </Text>
        </View>
      );
    }

    return null;
  };

  const renderPriceComparison = () => {
    if (!item.product.originalPrice || item.product.originalPrice <= item.product.price) {
      return null;
    }

    const originalTotal = item.product.originalPrice * item.quantity;
    const savings = originalTotal - (item.product.price * item.quantity);

    return (
      <View style={styles.priceComparisonContainer}>
        <Text style={styles.originalTotalPrice}>
          {formatPrice(originalTotal, item.product.currency)}
        </Text>
        <Text style={styles.savingsText}>
          You save {formatPrice(savings, item.product.currency)}
        </Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handleItemPress}
      activeOpacity={0.8}>

      {/* Product Image */}
      <View style={styles.imageContainer}>
        <FastImage
          source={{
            uri: item.product.images[0] || 'https://via.placeholder.com/100',
            priority: FastImage.priority.normal,
          }}
          style={styles.productImage}
          onError={() => setImageError(true)}
          resizeMode={FastImage.resizeMode.cover}
        />

        {!item.product.inStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>

      {/* Product Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.product.name}
          </Text>

          {editable && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={handleRemoveItem}>
              <Icon name="close" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.category}>{item.product.category.name}</Text>

        {renderCustomizations()}
        {renderStockWarning()}

        <View style={styles.priceQuantityContainer}>
          <View style={styles.priceContainer}>
            <Text style={styles.unitPrice}>
              {formatPrice(item.product.price, item.product.currency)} each
            </Text>
            <Text style={styles.totalPrice}>
              {formatPrice(calculateItemTotal(), item.product.currency)}
            </Text>
            {renderPriceComparison()}
          </View>

          {editable && (
            <View style={styles.quantityContainer}>
              <QuantitySelector
                quantity={item.quantity}
                onQuantityChange={handleQuantityChange}
                min={0}
                max={item.product.stockQuantity}
                disabled={!item.product.inStock}
              />
            </View>
          )}
        </View>

        {/* Unit of measure */}
        {item.product.unitOfMeasure && (
          <Text style={styles.unitOfMeasure}>
            Unit: {item.product.unitOfMeasure}
          </Text>
        )}

        {/* Weight information */}
        {item.product.weight && (
          <Text style={styles.weightInfo}>
            Weight: {item.product.weight}kg per unit
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  imageContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    marginRight: SPACING.md,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.white,
    textAlign: 'center',
  },
  detailsContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  productName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  removeButton: {
    padding: SPACING.xs,
  },
  category: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  customizationsContainer: {
    marginBottom: SPACING.sm,
  },
  customizationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  customizationType: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textSecondary,
    marginRight: SPACING.xs,
  },
  customizationValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.text,
    flex: 1,
  },
  customizationPrice: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.success,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.xs,
    marginBottom: SPACING.sm,
  },
  warningText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.white,
    marginLeft: SPACING.xs,
  },
  priceQuantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: SPACING.xs,
  },
  priceContainer: {
    flex: 1,
  },
  unitPrice: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  totalPrice: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.primary,
  },
  priceComparisonContainer: {
    marginTop: SPACING.xs,
  },
  originalTotalPrice: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  savingsText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.success,
  },
  quantityContainer: {
    marginLeft: SPACING.md,
  },
  unitOfMeasure: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  weightInfo: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});

export default CartItemCard;