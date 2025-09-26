/**
 * Asset Path Constants - Easy Management for Sales Team
 * 
 * TEAM INSTRUCTIONS:
 * 1. To change any image, simply replace the file in the corresponding folder
 * 2. Keep the same filename or update the path here
 * 3. All paths are relative to the public folder
 */

// Logo Assets
export const LOGOS = {
  main: '/shared/assets/branding/logos/harsha-delights-light-bg.png',
  elegant: '/shared/assets/branding/logos/elegant-monogram-logo.png',
} as const;

// Background Images for Hero Section
export const HERO_BACKGROUNDS = [
  '/shared/assets/branding/backgrounds/BG01.png',
  '/shared/assets/branding/backgrounds/BG-02.png', 
  '/shared/assets/branding/backgrounds/BG-03.png',
  '/shared/assets/branding/backgrounds/BG-04.png',
  '/shared/assets/branding/backgrounds/BG-5.png',
  '/shared/assets/branding/backgrounds/BG-06.png',
  '/shared/assets/branding/backgrounds/BG-07.png',
] as const;

// Product Category Images
export const CATEGORIES = {
  traditionalSweets: '/shared/assets/products/categories/traditional-sweets.png',
  premiumChocolates: '/shared/assets/products/categories/premium-chocolates.png',
  namkeens: '/shared/assets/products/categories/namkeens.png',
  dryFruits: '/shared/assets/products/categories/dry-fruits.png',
} as const;

// Product Images
export const PRODUCTS = {
  placeholder: '/shared/assets/products/confectionery/colorful-indian-sweets.png',
  chocolates: '/shared/assets/products/confectionery/chocolates.png',
  miniSamosas: '/shared/assets/products/confectionery/mini-samosas.png',
  gathiya: '/shared/assets/products/confectionery/gathiya.png',
  chakliMurukku: '/shared/assets/products/confectionery/chakli-murukku.png',
  chivdaBombayMix: '/shared/assets/products/confectionery/chivda-bombay-mix.png',
  bhakarwadi: '/shared/assets/products/confectionery/bhakarwadi.png',
} as const;

// Badge/Tier Assets  
export const BADGES = {
  bronze: '/shared/assets/ui/badges/bronze-tier.png',
  silver: '/shared/assets/ui/badges/silver-tier.png', 
  gold: '/shared/assets/ui/badges/gold-tier.png',
  topReviewer: '/shared/assets/ui/badges/top-reviewer.png',
  firstOrder: '/shared/assets/ui/badges/first-order-welcome.png',
} as const;

// Feature Icons
export const FEATURES = {
  quality: '/shared/assets/ui/features/quality.png',
  heritage: '/shared/assets/ui/features/heritage.png',
  bulkOrdering: '/shared/assets/ui/features/bulk-ordering.png',
  gifting: '/shared/assets/ui/features/gifting.png',
} as const;

// UI Illustrations
export const ILLUSTRATIONS = {
  emptyCart: '/shared/assets/ui/illustrations/empty-cart.png',
  mobileOnboarding: '/shared/assets/ui/mobile/onboarding.png',
} as const;

// Marketing Banners
export const BANNERS = {
  promotional: '/shared/assets/branding/banners/promotional-banner-1200x630.png',
} as const;

// Existing Sweet Images (from sweetspics folder)
export const SWEET_GALLERY = {
  gheeChandrakala: '/shared/assets/products/categories/sweetspics/Ghee Chandrakala.jpeg',
  foodviva: '/shared/assets/products/categories/sweetspics/foodviva_com.jpeg',
  // Add more as needed by team
} as const;