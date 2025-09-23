/**
 * Asset Management Utility for Harsha Delights
 * Centralized system for managing team-changeable assets
 */

// Asset base paths
const ASSET_BASE = '/assets'

// Background images (team-manageable)
export const backgrounds = {
  hero: {
    bg1: `${ASSET_BASE}/branding/backgrounds/BG01.png`,
    bg2: `${ASSET_BASE}/branding/backgrounds/BG-02.png`,
    bg3: `${ASSET_BASE}/branding/backgrounds/BG-03.png`,
    bg4: `${ASSET_BASE}/branding/backgrounds/BG-04.png`,
    bg5: `${ASSET_BASE}/branding/backgrounds/BG-5.png`,
    bg6: `${ASSET_BASE}/branding/backgrounds/BG-06.png`,
    bg7: `${ASSET_BASE}/branding/backgrounds/BG-07.png`,
  },
  // Function to get random background
  getRandomHero: () => {
    const bgKeys = Object.keys(backgrounds.hero) as Array<keyof typeof backgrounds.hero>
    const randomKey = bgKeys[Math.floor(Math.random() * bgKeys.length)]
    return backgrounds.hero[randomKey]
  }
} as const

// Logo variants (team-manageable)
export const logos = {
  elegant: `${ASSET_BASE}/branding/logos/elegant_monogram_logo_for_harsha_delights_a-removebg-preview.png`,
  elegantAlt: `${ASSET_BASE}/branding/logos/elegant_monogram_logo_for_harsha_delights_a__4_-removebg-preview.png`,
  // Default logo getter
  getDefault: () => logos.elegant,
  getVariant: (variant: 'elegant' | 'elegantAlt' = 'elegant') => logos[variant]
} as const

// Product image categories (team-manageable)
export const products = {
  confectionery: `${ASSET_BASE}/products/confectionery`,
  seasonal: `${ASSET_BASE}/products/seasonal`,
  premium: `${ASSET_BASE}/products/premium`,
  categories: `${ASSET_BASE}/products/categories`,
  
  // Helper function to build product image paths
  getImagePath: (category: 'confectionery' | 'seasonal' | 'premium' | 'categories', filename: string) => {
    return `${products[category]}/${filename}`
  }
} as const

// CSS classes for luxury styling
export const luxuryStyles = {
  // Background utilities
  backgrounds: {
    royalGradient: 'bg-royal-gradient',
    goldGradient: 'bg-gold-gradient',
    luxuryGradient: 'bg-luxury-gradient',
    hero: (bgNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7) => `bg-hero-bg-${bgNumber}`,
  },
  
  // Typography
  fonts: {
    royal: 'font-royal', // Playfair Display
    luxury: 'font-luxury', // Cormorant Garamond
    elegant: 'font-elegant', // Crimson Text
    premium: 'font-premium', // Inter
  },
  
  // Animations
  animations: {
    shimmer: 'animate-royal-shimmer',
    float: 'animate-luxury-float',
    glow: 'animate-gold-glow',
    pulse: 'animate-royal-pulse',
  },
  
  // Shadows
  shadows: {
    royal: 'shadow-royal',
    luxury: 'shadow-luxury',
    gold: 'shadow-gold',
    royalInset: 'shadow-royal-inset',
  },
  
  // Color utilities
  colors: {
    royal: {
      text: 'text-royal-700',
      bg: 'bg-royal-500',
      border: 'border-royal-300',
    },
    luxury: {
      gold: {
        text: 'text-luxury-gold-700',
        bg: 'bg-luxury-gold-500',
        border: 'border-luxury-gold-300',
      },
      burgundy: {
        text: 'text-luxury-burgundy-700',
        bg: 'bg-luxury-burgundy-500',
        border: 'border-luxury-burgundy-300',
      },
      champagne: {
        text: 'text-luxury-champagne-700',
        bg: 'bg-luxury-champagne-500',
        border: 'border-luxury-champagne-300',
      },
    },
  },
} as const

// Premium card styling presets
export const cardStyles = {
  luxury: `
    bg-white/95 backdrop-blur-md 
    border border-royal-200/50 
    shadow-luxury rounded-2xl 
    hover:shadow-royal transition-all duration-500
    hover:scale-105 hover:border-luxury-gold-300/50
  `,
  
  royal: `
    bg-gradient-to-br from-royal-50 to-royal-100 
    border border-royal-300 
    shadow-royal rounded-xl 
    hover:shadow-luxury transition-all duration-300
  `,
  
  gold: `
    bg-gradient-to-br from-luxury-gold-50 to-luxury-champagne-50 
    border border-luxury-gold-300 
    shadow-gold rounded-xl 
    hover:animate-gold-glow transition-all duration-300
  `,
  
  premium: `
    bg-white border border-gray-200 
    shadow-luxury rounded-2xl 
    hover:shadow-royal transition-all duration-300
    hover:border-royal-300
  `
} as const

// Button styling presets
export const buttonStyles = {
  royal: `
    bg-royal-gradient text-white font-semibold
    px-8 py-4 rounded-xl shadow-royal
    hover:shadow-luxury hover:scale-105
    transition-all duration-300
  `,
  
  gold: `
    bg-gold-gradient text-royal-900 font-semibold
    px-8 py-4 rounded-xl shadow-gold
    hover:animate-gold-glow hover:scale-105
    transition-all duration-300
  `,
  
  luxury: `
    bg-luxury-gradient text-white font-semibold
    px-8 py-4 rounded-xl shadow-luxury
    hover:shadow-royal hover:scale-105
    transition-all duration-300
  `,
  
  outline: `
    border-2 border-royal-500 text-royal-700 font-semibold
    px-8 py-4 rounded-xl hover:bg-royal-50
    hover:shadow-royal transition-all duration-300
  `
} as const

// Utility functions
export const utils = {
  // Combine multiple style classes
  combineStyles: (...styles: string[]) => styles.join(' '),
  
  // Get responsive classes
  responsive: {
    text: {
      hero: 'text-4xl md:text-6xl lg:text-7xl xl:text-8xl',
      heading: 'text-2xl md:text-3xl lg:text-4xl xl:text-5xl',
      subheading: 'text-lg md:text-xl lg:text-2xl xl:text-3xl',
      body: 'text-base md:text-lg lg:text-xl',
    },
    spacing: {
      section: 'py-16 md:py-24 lg:py-32',
      container: 'px-4 sm:px-6 lg:px-8 xl:px-12',
    }
  }
} as const