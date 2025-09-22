// Product card component for product listing

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppSelector, useAppDispatch } from '../store';
import { selectIsInWishlist } from '../store/slices/wishlistSlice';
import { addToWishlist, removeFromWishlist } from '../store/slices/wishlistSlice';
import { addToCart } from '../store/slices/cartSlice';
import { Product } from '../types';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDER_RADIUS } from '../constants';
import StarRating from './StarRating';
import AddToCartButton from './AddToCartButton';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.lg * 3) / 2;

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  style?: any;
  layout?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  style,
  layout = 'grid',
}) => {
  const dispatch = useAppDispatch();
  const isInWishlist = useAppSelector(selectIsInWishlist(product.id));
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleWishlistToggle = () => {
    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
    } else {
      dispatch(addToWishlist(product));
    }
  };

  const handleAddToCart = () => {
    dispatch(addToCart({
      product,
      quantity: 1,
    }));
  };

  const handleProductPress = () => {
    onPress(product);
  };

  const formatPrice = (price: number, currency: string = 'MYR') => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(price);
  };

  const renderDiscountBadge = () => {
    if (!product.originalPrice || product.originalPrice <= product.price) {
      return null;
    }

    const discountPercentage = Math.round(
      ((product.originalPrice - product.price) / product.originalPrice) * 100
    );

    return (
      <View style={styles.discountBadge}>
        <Text style={styles.discountText}>-{discountPercentage}%</Text>
      </View>
    );
  };

  const renderStockStatus = () => {
    if (!product.inStock) {
      return (
        <View style={styles.outOfStockOverlay}>
          <Text style={styles.outOfStockText}>Out of Stock</Text>
        </View>
      );
    }

    if (product.stockQuantity <= 5) {
      return (
        <View style={styles.lowStockBadge}>
          <Text style={styles.lowStockText}>Only {product.stockQuantity} left</Text>
        </View>
      );
    }

    return null;
  };

  const renderDietaryBadges = () => {
    const badges = [];

    if (product.isVegetarian) {
      badges.push(
        <View key="vegetarian" style={[styles.dietaryBadge, { backgroundColor: COLORS.success }]}>
          <Text style={styles.dietaryBadgeText}>🥬</Text>
        </View>
      );
    }

    if (product.isVegan) {
      badges.push(
        <View key="vegan" style={[styles.dietaryBadge, { backgroundColor: COLORS.success }]}>
          <Text style={styles.dietaryBadgeText}>🌱</Text>
        </View>
      );
    }

    if (product.isGlutenFree) {
      badges.push(
        <View key="glutenFree" style={[styles.dietaryBadge, { backgroundColor: COLORS.warning }]}>
          <Text style={styles.dietaryBadgeText}>🌾</Text>
        </View>
      );
    }

    return badges.length > 0 ? (
      <View style={styles.dietaryBadgesContainer}>
        {badges}
      </View>
    ) : null;
  };

  if (layout === 'list') {
    return (
      <TouchableOpacity
        style={[styles.listCard, style]}
        onPress={handleProductPress}
        activeOpacity={0.8}>

        <View style={styles.listImageContainer}>
          <FastImage
            source={{
              uri: product.images[0] || 'https://via.placeholder.com/150',
              priority: FastImage.priority.normal,
            }}
            style={styles.listImage}
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => setImageError(true)}
            resizeMode={FastImage.resizeMode.cover}
          />

          {renderDiscountBadge()}
          {renderStockStatus()}
        </View>

        <View style={styles.listContent}>
          <View style={styles.listHeader}>
            <Text style={styles.productName} numberOfLines={2}>
              {product.name}
            </Text>

            <TouchableOpacity
              style={styles.wishlistButton}
              onPress={handleWishlistToggle}>
              <Icon
                name={isInWishlist ? 'favorite' : 'favorite-border'}
                size={24}
                color={isInWishlist ? COLORS.error : COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.category}>{product.category.name}</Text>

          <View style={styles.ratingContainer}>
            <StarRating rating={product.ratings.average} size={16} />
            <Text style={styles.ratingText}>
              ({product.ratings.totalReviews})
            </Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {formatPrice(product.price, product.currency)}
            </Text>
            {product.originalPrice && product.originalPrice > product.price && (
              <Text style={styles.originalPrice}>
                {formatPrice(product.originalPrice, product.currency)}
              </Text>
            )}
          </View>

          {renderDietaryBadges()}

          <AddToCartButton
            product={product}
            onPress={handleAddToCart}
            disabled={!product.inStock}
            style={styles.addToCartButton}
          />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.gridCard, style]}
      onPress={handleProductPress}
      activeOpacity={0.8}>

      <View style={styles.imageContainer}>
        <FastImage
          source={{
            uri: product.images[0] || 'https://via.placeholder.com/150',
            priority: FastImage.priority.normal,
          }}
          style={styles.productImage}
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
          onError={() => setImageError(true)}
          resizeMode={FastImage.resizeMode.cover}
        />

        {renderDiscountBadge()}
        {renderStockStatus()}

        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={handleWishlistToggle}>
          <Icon
            name={isInWishlist ? 'favorite' : 'favorite-border'}
            size={20}
            color={isInWishlist ? COLORS.error : COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>

        <Text style={styles.category}>{product.category.name}</Text>

        <View style={styles.ratingContainer}>
          <StarRating rating={product.ratings.average} size={14} />
          <Text style={styles.ratingText}>
            ({product.ratings.totalReviews})
          </Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {formatPrice(product.price, product.currency)}
          </Text>
          {product.originalPrice && product.originalPrice > product.price && (
            <Text style={styles.originalPrice}>
              {formatPrice(product.originalPrice, product.currency)}
            </Text>
          )}
        </View>

        {renderDietaryBadges()}

        <AddToCartButton
          product={product}
          onPress={handleAddToCart}
          disabled={!product.inStock}
          style={styles.addToCartButton}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gridCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  listCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  imageContainer: {
    position: 'relative',
    borderTopLeftRadius: BORDER_RADIUS.md,
    borderTopRightRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  listImageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    marginRight: SPACING.md,
  },
  productImage: {
    width: '100%',
    height: 140,
  },
  listImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.xs,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
  },
  discountText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.white,
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
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.white,
  },
  lowStockBadge: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.warning,
    borderRadius: BORDER_RADIUS.xs,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
  },
  lowStockText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.white,
  },
  wishlistButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  content: {
    padding: SPACING.md,
    flex: 1,
  },
  listContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  productName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    flex: 1,
  },
  category: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  price: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.primary,
    marginRight: SPACING.sm,
  },
  originalPrice: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  dietaryBadgesContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  dietaryBadge: {
    borderRadius: BORDER_RADIUS.xs,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    marginRight: SPACING.xs,
  },
  dietaryBadgeText: {
    fontSize: 12,
  },
  addToCartButton: {
    marginTop: 'auto',
  },
});

export default ProductCard;