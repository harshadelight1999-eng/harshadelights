// App Constants for Harsha Delights Customer App

export const APP_CONFIG = {
  name: 'Harsha Delights',
  version: '1.0.0',
  bundleId: 'com.harshadelights.customer',
  deepLinkPrefix: 'harshadelights://',
};

export const API_CONFIG = {
  baseUrl: process.env.NODE_ENV === 'production'
    ? 'https://api.harshadelights.com'
    : 'http://localhost:3000',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};

export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyOTP: '/auth/verify-otp',
    profile: '/auth/profile',
  },
  // Products
  products: {
    list: '/products',
    detail: '/products/:id',
    search: '/products/search',
    categories: '/products/categories',
    subcategories: '/products/subcategories',
    reviews: '/products/:id/reviews',
    featured: '/products/featured',
    trending: '/products/trending',
    recommendations: '/products/recommendations',
  },
  // Cart
  cart: {
    get: '/cart',
    add: '/cart/items',
    update: '/cart/items/:id',
    remove: '/cart/items/:id',
    clear: '/cart/clear',
    validate: '/cart/validate',
  },
  // Orders
  orders: {
    create: '/orders',
    list: '/orders',
    detail: '/orders/:id',
    track: '/orders/:id/tracking',
    cancel: '/orders/:id/cancel',
    rate: '/orders/:id/rate',
  },
  // User
  user: {
    profile: '/user/profile',
    addresses: '/user/addresses',
    paymentMethods: '/user/payment-methods',
    wishlist: '/user/wishlist',
    notifications: '/user/notifications',
    reviews: '/user/reviews',
  },
  // Coupons
  coupons: {
    list: '/coupons',
    validate: '/coupons/validate',
    apply: '/coupons/apply',
  },
  // Support
  support: {
    contact: '/support/contact',
    faq: '/support/faq',
    tickets: '/support/tickets',
  },
};

export const STORAGE_KEYS = {
  accessToken: '@harsha_delights_access_token',
  refreshToken: '@harsha_delights_refresh_token',
  userProfile: '@harsha_delights_user_profile',
  cartItems: '@harsha_delights_cart_items',
  wishlistItems: '@harsha_delights_wishlist',
  recentSearches: '@harsha_delights_recent_searches',
  addresses: '@harsha_delights_addresses',
  paymentMethods: '@harsha_delights_payment_methods',
  notifications: '@harsha_delights_notifications',
  appSettings: '@harsha_delights_app_settings',
  onboardingCompleted: '@harsha_delights_onboarding_completed',
  firstLaunch: '@harsha_delights_first_launch',
};

export const COLORS = {
  primary: '#0175FF',
  primaryDark: '#004CBB',
  primaryLight: '#66A3FF',
  secondary: '#FF6B35',
  secondaryDark: '#CC4E1A',
  secondaryLight: '#FF9970',
  accent: '#FFD700',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  card: '#FFFFFF',
  text: '#212529',
  textSecondary: '#6C757D',
  textLight: '#ADB5BD',
  border: '#DEE2E6',
  divider: '#E9ECEF',
  success: '#28A745',
  warning: '#FFC107',
  error: '#DC3545',
  info: '#17A2B8',
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F8F9FA',
    100: '#E9ECEF',
    200: '#DEE2E6',
    300: '#CED4DA',
    400: '#ADB5BD',
    500: '#6C757D',
    600: '#495057',
    700: '#343A40',
    800: '#212529',
    900: '#000000',
  },
};

export const TYPOGRAPHY = {
  fontFamily: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 36,
    xxxl: 40,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 50,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
};

export const SCREEN_DIMENSIONS = {
  screenWidth: 375, // iPhone SE width as baseline
  screenHeight: 667, // iPhone SE height as baseline
};

export const VALIDATION_RULES = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[+]?[(]?[\d\s\-\(\)]{10,}$/,
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
  },
  name: {
    minLength: 2,
    maxLength: 50,
  },
  address: {
    minLength: 5,
    maxLength: 100,
  },
  postalCode: /^[0-9]{5,6}$/,
};

export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100,
};

export const CACHE_DURATIONS = {
  short: 5 * 60 * 1000, // 5 minutes
  medium: 30 * 60 * 1000, // 30 minutes
  long: 24 * 60 * 60 * 1000, // 24 hours
  persistent: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const NOTIFICATION_TYPES = {
  orderUpdate: 'order_update',
  promotion: 'promotion',
  newProduct: 'new_product',
  delivery: 'delivery',
  payment: 'payment',
  reviewRequest: 'review_request',
  system: 'system',
};

export const ORDER_STATUSES = {
  pending: { label: 'Order Placed', color: COLORS.warning },
  confirmed: { label: 'Confirmed', color: COLORS.info },
  preparing: { label: 'Preparing', color: COLORS.secondary },
  readyForPickup: { label: 'Ready for Pickup', color: COLORS.accent },
  outForDelivery: { label: 'Out for Delivery', color: COLORS.primary },
  delivered: { label: 'Delivered', color: COLORS.success },
  cancelled: { label: 'Cancelled', color: COLORS.error },
  refunded: { label: 'Refunded', color: COLORS.textSecondary },
};

export const DIETARY_PREFERENCES = [
  { id: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
  { id: 'vegan', label: 'Vegan', icon: '🌱' },
  { id: 'gluten_free', label: 'Gluten Free', icon: '🌾' },
];

export const PAYMENT_METHODS = [
  { id: 'credit_card', label: 'Credit Card', icon: 'credit-card' },
  { id: 'debit_card', label: 'Debit Card', icon: 'credit-card-outline' },
  { id: 'cash_on_delivery', label: 'Cash on Delivery', icon: 'cash' },
  { id: 'digital_wallet', label: 'Digital Wallet', icon: 'wallet' },
];

export const ERROR_MESSAGES = {
  network: 'Network connection error. Please check your internet connection.',
  server: 'Server error. Please try again later.',
  unauthorized: 'You are not authorized to perform this action.',
  notFound: 'The requested resource was not found.',
  validation: 'Please check your input and try again.',
  timeout: 'Request timeout. Please try again.',
  unknown: 'An unexpected error occurred. Please try again.',
};

export const SUCCESS_MESSAGES = {
  login: 'Welcome back! You have successfully logged in.',
  register: 'Account created successfully! Please verify your email.',
  passwordReset: 'Password reset successfully.',
  profileUpdate: 'Profile updated successfully.',
  orderPlaced: 'Your order has been placed successfully!',
  itemAddedToCart: 'Item added to cart successfully.',
  itemRemovedFromCart: 'Item removed from cart.',
  reviewSubmitted: 'Thank you for your review!',
  addressSaved: 'Address saved successfully.',
  paymentMethodSaved: 'Payment method saved successfully.',
};

export const ANIMATION_DURATIONS = {
  fast: 200,
  normal: 300,
  slow: 500,
};

export const IMAGE_SIZES = {
  thumbnail: { width: 80, height: 80 },
  small: { width: 150, height: 150 },
  medium: { width: 300, height: 300 },
  large: { width: 600, height: 600 },
  banner: { width: 800, height: 400 },
};

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

export const APP_STORE_URLS = {
  ios: 'https://apps.apple.com/app/harsha-delights/id123456789',
  android: 'https://play.google.com/store/apps/details?id=com.harshadelights.customer',
};

export const SOCIAL_LINKS = {
  website: 'https://harshadelights.com',
  facebook: 'https://facebook.com/harshadelights',
  instagram: 'https://instagram.com/harshadelights',
  twitter: 'https://twitter.com/harshadelights',
  whatsapp: 'https://wa.me/60123456789',
};