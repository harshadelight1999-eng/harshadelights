/**
 * Semantic Color Mappings for Harsha Delights
 *
 * This file maps generic UI concepts (success, warning, error) to our
 * luxury brand colors (royal purple, gold, champagne, burgundy).
 *
 * Usage:
 * import { semanticColors, chartColors } from '@harshadelights/shared-components/colorMappings'
 */

import { brandColors } from './brandConfig'

// ========================================
// SEMANTIC COLOR SYSTEM
// ========================================

/**
 * Semantic colors mapped to luxury brand palette
 */
export const semanticColors = {
  // Status indicators
  success: {
    light: brandColors.secondary.champagne[100],
    DEFAULT: brandColors.secondary.champagne[500],
    dark: brandColors.secondary.champagne[700],
    text: brandColors.secondary.champagne[900],
  },
  warning: {
    light: brandColors.secondary.gold[100],
    DEFAULT: brandColors.secondary.gold[500],
    dark: brandColors.secondary.gold[700],
    text: brandColors.secondary.gold[900],
  },
  error: {
    light: brandColors.secondary.burgundy[100],
    DEFAULT: brandColors.secondary.burgundy[600],
    dark: brandColors.secondary.burgundy[800],
    text: brandColors.secondary.burgundy[900],
  },
  info: {
    light: brandColors.primary.royal[100],
    DEFAULT: brandColors.primary.royal[500],
    dark: brandColors.primary.royal[700],
    text: brandColors.primary.royal[900],
  },
} as const

// ========================================
// TAILWIND CLASS MAPPINGS
// ========================================

/**
 * Pre-built Tailwind classes for common UI patterns
 */
export const semanticClassNames = {
  // Badge variants
  badge: {
    success: 'bg-luxury-champagne-100 text-luxury-champagne-800 border border-luxury-champagne-200',
    warning: 'bg-luxury-gold-100 text-luxury-gold-800 border border-luxury-gold-200',
    error: 'bg-luxury-burgundy-100 text-luxury-burgundy-800 border border-luxury-burgundy-200',
    info: 'bg-royal-100 text-royal-800 border border-royal-200',
    default: 'bg-gray-100 text-gray-800 border border-gray-200',
  },

  // Alert/notification boxes
  alert: {
    success: 'bg-luxury-champagne-50 border border-luxury-champagne-200 text-luxury-champagne-900',
    warning: 'bg-luxury-gold-50 border border-luxury-gold-200 text-luxury-gold-900',
    error: 'bg-luxury-burgundy-50 border border-luxury-burgundy-200 text-luxury-burgundy-900',
    info: 'bg-royal-50 border border-royal-200 text-royal-900',
  },

  // Button variants
  button: {
    primary: 'bg-royal-gradient text-white font-medium shadow-royal hover:shadow-luxury',
    secondary: 'bg-gold-gradient text-royal-900 font-medium shadow-gold',
    luxury: 'bg-luxury-gradient text-white font-medium shadow-luxury hover:shadow-royal',
    outline: 'border-2 border-royal-500 text-royal-700 hover:bg-royal-50',
    success: 'bg-luxury-champagne-600 hover:bg-luxury-champagne-700 text-white',
    warning: 'bg-luxury-gold-600 hover:bg-luxury-gold-700 text-white',
    error: 'bg-luxury-burgundy-600 hover:bg-luxury-burgundy-700 text-white',
  },

  // Icon backgrounds
  iconBg: {
    success: 'bg-luxury-champagne-100 text-luxury-champagne-600',
    warning: 'bg-luxury-gold-100 text-luxury-gold-600',
    error: 'bg-luxury-burgundy-100 text-luxury-burgundy-600',
    info: 'bg-royal-100 text-royal-600',
    primary: 'bg-royal-gradient text-white',
    secondary: 'bg-gold-gradient text-white',
  },

  // Progress bars
  progress: {
    success: 'bg-luxury-champagne-600',
    warning: 'bg-luxury-gold-600',
    error: 'bg-luxury-burgundy-600',
    info: 'bg-royal-600',
    primary: 'bg-royal-gradient',
  },

  // Status dots/indicators
  dot: {
    success: 'bg-luxury-champagne-500',
    warning: 'bg-luxury-gold-500',
    error: 'bg-luxury-burgundy-600',
    info: 'bg-royal-500',
    active: 'bg-luxury-champagne-500',
    inactive: 'bg-gray-300',
  },
} as const

// ========================================
// CHART COLOR PALETTES
// ========================================

/**
 * Color palettes for charts and data visualization
 * Using luxury brand colors for consistency
 */
export const chartColors = {
  // Primary chart palette (5 colors)
  primary: [
    brandColors.primary.royal[500],      // Royal purple
    brandColors.secondary.gold[500],     // Luxury gold
    brandColors.secondary.champagne[500], // Champagne
    brandColors.secondary.burgundy[600],  // Burgundy
    brandColors.primary.royal[700],      // Dark royal
  ],

  // Extended palette (10 colors for complex charts)
  extended: [
    brandColors.primary.royal[500],
    brandColors.secondary.gold[500],
    brandColors.secondary.champagne[500],
    brandColors.secondary.burgundy[600],
    brandColors.primary.royal[700],
    brandColors.secondary.gold[700],
    brandColors.primary.royal[300],
    brandColors.secondary.champagne[700],
    brandColors.secondary.burgundy[400],
    brandColors.secondary.gold[300],
  ],

  // Gradient colors for area charts
  gradients: {
    royal: {
      stroke: brandColors.primary.royal[500],
      fill: brandColors.primary.royal[100],
    },
    gold: {
      stroke: brandColors.secondary.gold[500],
      fill: brandColors.secondary.gold[100],
    },
    champagne: {
      stroke: brandColors.secondary.champagne[500],
      fill: brandColors.secondary.champagne[100],
    },
    burgundy: {
      stroke: brandColors.secondary.burgundy[600],
      fill: brandColors.secondary.burgundy[100],
    },
  },

  // Heatmap colors
  heatmap: [
    brandColors.primary.royal[100],
    brandColors.primary.royal[300],
    brandColors.primary.royal[500],
    brandColors.primary.royal[700],
    brandColors.primary.royal[900],
  ],
} as const

// ========================================
// STATUS-SPECIFIC MAPPINGS
// ========================================

/**
 * Order status color mappings
 */
export const orderStatusColors = {
  pending: semanticClassNames.badge.warning,
  processing: semanticClassNames.badge.info,
  shipped: semanticClassNames.badge.info,
  delivered: semanticClassNames.badge.success,
  cancelled: semanticClassNames.badge.error,
  refunded: semanticClassNames.badge.error,
} as const

/**
 * Payment status color mappings
 */
export const paymentStatusColors = {
  pending: semanticClassNames.badge.warning,
  authorized: semanticClassNames.badge.info,
  captured: semanticClassNames.badge.success,
  failed: semanticClassNames.badge.error,
  refunded: semanticClassNames.badge.error,
  partially_refunded: semanticClassNames.badge.warning,
} as const

/**
 * Inventory status color mappings
 */
export const inventoryStatusColors = {
  in_stock: semanticClassNames.badge.success,
  low_stock: semanticClassNames.badge.warning,
  out_of_stock: semanticClassNames.badge.error,
  discontinued: semanticClassNames.badge.default,
} as const

/**
 * Priority level color mappings
 */
export const priorityColors = {
  low: semanticClassNames.badge.success,
  medium: semanticClassNames.badge.warning,
  high: semanticClassNames.badge.error,
  urgent: semanticClassNames.badge.error,
} as const

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Get semantic badge class based on status type
 */
export function getBadgeClass(status: string, type: 'order' | 'payment' | 'inventory' | 'priority' = 'order'): string {
  const normalized = status.toLowerCase().replace(/\s+/g, '_')

  switch (type) {
    case 'order':
      return orderStatusColors[normalized as keyof typeof orderStatusColors] || semanticClassNames.badge.default
    case 'payment':
      return paymentStatusColors[normalized as keyof typeof paymentStatusColors] || semanticClassNames.badge.default
    case 'inventory':
      return inventoryStatusColors[normalized as keyof typeof inventoryStatusColors] || semanticClassNames.badge.default
    case 'priority':
      return priorityColors[normalized as keyof typeof priorityColors] || semanticClassNames.badge.default
    default:
      return semanticClassNames.badge.default
  }
}

/**
 * Get chart color by index
 */
export function getChartColor(index: number, extended = false): string {
  const palette = extended ? chartColors.extended : chartColors.primary
  return palette[index % palette.length]
}

/**
 * Get alert class based on type
 */
export function getAlertClass(type: 'success' | 'warning' | 'error' | 'info'): string {
  return semanticClassNames.alert[type]
}

/**
 * Get button class based on variant
 */
export function getButtonClass(variant: 'primary' | 'secondary' | 'luxury' | 'outline' | 'success' | 'warning' | 'error'): string {
  return semanticClassNames.button[variant]
}

// ========================================
// EXPORTS
// ========================================

export default {
  semanticColors,
  semanticClassNames,
  chartColors,
  orderStatusColors,
  paymentStatusColors,
  inventoryStatusColors,
  priorityColors,
  getBadgeClass,
  getChartColor,
  getAlertClass,
  getButtonClass,
} as const
