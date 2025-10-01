/**
 * Centralized Brand Configuration for Harsha Delights
 *
 * This is the single source of truth for all branding elements across
 * the 6 frontend applications. Any branding changes should be made here.
 *
 * Usage:
 * import { brandColors, brandFonts, brandLogos } from '@harshadelights/shared-components/brandConfig'
 */

// ========================================
// BRAND COLORS
// ========================================

/**
 * Official Harsha Delights Color Palette
 * Royal/Luxury theme for premium confectionery brand
 */
export const brandColors = {
  // Primary Colors
  primary: {
    royal: {
      50: '#f8f6ff',
      100: '#f0ebff',
      200: '#e3daff',
      300: '#d0bfff',
      400: '#b89aff',
      500: '#9c6eff', // Main royal purple
      600: '#8b4cf7',
      700: '#7c3aed', // Dark royal purple
      800: '#6b21a8',
      900: '#581c87',
      950: '#3b0764',
    },
  },

  // Secondary Colors
  secondary: {
    gold: {
      50: '#fffdf7',
      100: '#fff9e6',
      200: '#fff2cc',
      300: '#ffe699',
      400: '#ffd633',
      500: '#ffc107', // Main luxury gold
      600: '#e6ac00',
      700: '#cc9900', // Dark gold
      800: '#b38600',
      900: '#996600',
    },
    champagne: {
      50: '#fefdf9',
      100: '#fdf9f0',
      200: '#fbf2d9',
      300: '#f7e6b8',
      400: '#f1d391',
      500: '#e8bc5e', // Main champagne
      600: '#d4a041',
      700: '#b8812a',
      800: '#966521',
      900: '#79511e',
    },
    burgundy: {
      50: '#fdf2f2',
      100: '#fbe8e8',
      200: '#f5d0d0',
      300: '#ebb5b5',
      400: '#dc8f8f',
      500: '#c86a6a',
      600: '#b04848', // Main burgundy
      700: '#8b2f2f',
      800: '#721f1f',
      900: '#5a1818',
    },
  },

  // Gradients (CSS gradient strings)
  gradients: {
    royal: 'linear-gradient(135deg, #7c3aed 0%, #8b4cf7 50%, #9c6eff 100%)',
    gold: 'linear-gradient(135deg, #ffc107 0%, #e6ac00 50%, #cc9900 100%)',
    luxury: 'linear-gradient(135deg, #581c87 0%, #7c3aed 25%, #ffc107 75%, #e6ac00 100%)',
    royalShimmer: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)',
  },

  // Semantic Colors
  semantic: {
    success: '#22c55e',
    warning: '#eab308',
    error: '#ef4444',
    info: '#3b82f6',
  },
} as const;

// ========================================
// TYPOGRAPHY
// ========================================

/**
 * Brand Typography System
 * Multiple font families for different contexts
 */
export const brandFonts = {
  // Font Families
  families: {
    royal: "'Playfair Display', serif", // Luxury serif for headings
    luxury: "'Cormorant Garamond', serif", // Elegant serif for product names
    elegant: "'Crimson Text', serif", // Refined serif for special text
    premium: "'Inter', system-ui, -apple-system, sans-serif", // Modern sans for body
    heading: "'Poppins', system-ui, sans-serif", // Bold sans for subheadings
  },

  // Font Sizes (responsive)
  sizes: {
    hero: 'text-4xl md:text-6xl lg:text-7xl xl:text-8xl',
    h1: 'text-3xl md:text-4xl lg:text-5xl xl:text-6xl',
    h2: 'text-2xl md:text-3xl lg:text-4xl xl:text-5xl',
    h3: 'text-xl md:text-2xl lg:text-3xl',
    h4: 'text-lg md:text-xl lg:text-2xl',
    body: 'text-base md:text-lg',
    small: 'text-sm md:text-base',
    xs: 'text-xs md:text-sm',
  },

  // Font Weights
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Google Fonts Import URL
  googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=Cormorant+Garamond:wght@400;500;600;700&family=Crimson+Text:wght@400;600;700&family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap',
} as const;

// ========================================
// LOGOS & ASSETS
// ========================================

/**
 * Brand Logo Paths
 * Centralized logo management
 */
export const brandLogos = {
  // Main logo variants
  elegant: '/assets/branding/logos/elegant_monogram_logo_for_harsha_delights_a-removebg-preview.png',
  elegantAlt: '/assets/branding/logos/elegant_monogram_logo_for_harsha_delights_a__4_-removebg-preview.png',
  lightBg: '/assets/branding/logos/harsha-delights-light-bg.png',

  // Default getter
  default: () => brandLogos.elegant,

  // Context-specific logos
  forHeader: () => brandLogos.elegant,
  forHero: () => brandLogos.elegantAlt,
  forFooter: () => brandLogos.elegant,
  forLoading: () => brandLogos.elegantAlt,
} as const;

/**
 * Background Images
 */
export const brandBackgrounds = {
  hero: [
    '/assets/branding/backgrounds/BG01.png',
    '/assets/branding/backgrounds/BG-02.png',
    '/assets/branding/backgrounds/BG-03.png',
    '/assets/branding/backgrounds/BG-04.png',
    '/assets/branding/backgrounds/BG-5.png',
    '/assets/branding/backgrounds/BG-06.png',
    '/assets/branding/backgrounds/BG-07.png',
  ],
  getRandomHero: () => {
    const random = Math.floor(Math.random() * brandBackgrounds.hero.length);
    return brandBackgrounds.hero[random];
  },
} as const;

// ========================================
// ANIMATIONS
// ========================================

/**
 * Brand Animation Presets
 */
export const brandAnimations = {
  // Animation class names (Tailwind)
  shimmer: 'animate-royal-shimmer',
  float: 'animate-luxury-float',
  glow: 'animate-gold-glow',
  pulse: 'animate-royal-pulse',

  // Animation durations
  durations: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
  },

  // Easing functions
  easings: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// ========================================
// SHADOWS & EFFECTS
// ========================================

/**
 * Brand Shadow Presets
 */
export const brandShadows = {
  royal: '0 20px 60px rgba(124, 58, 237, 0.15)',
  luxury: '0 25px 50px rgba(0, 0, 0, 0.15)',
  gold: '0 10px 30px rgba(255, 193, 7, 0.3)',
  royalInset: 'inset 0 2px 4px rgba(124, 58, 237, 0.1)',

  // Tailwind class names
  classes: {
    royal: 'shadow-royal',
    luxury: 'shadow-luxury',
    gold: 'shadow-gold',
    royalInset: 'shadow-royal-inset',
  },
} as const;

// ========================================
// COMPONENT STYLE PRESETS
// ========================================

/**
 * Reusable Component Style Presets
 */
export const brandStyles = {
  // Button Styles
  buttons: {
    royal: 'bg-royal-gradient text-white font-semibold px-8 py-4 rounded-xl shadow-royal hover:shadow-luxury hover:scale-105 transition-all duration-300',
    gold: 'bg-gold-gradient text-royal-900 font-semibold px-8 py-4 rounded-xl shadow-gold hover:animate-gold-glow hover:scale-105 transition-all duration-300',
    luxury: 'bg-luxury-gradient text-white font-semibold px-8 py-4 rounded-xl shadow-luxury hover:shadow-royal hover:scale-105 transition-all duration-300',
    outline: 'border-2 border-royal-500 text-royal-700 font-semibold px-8 py-4 rounded-xl hover:bg-royal-50 hover:shadow-royal transition-all duration-300',
  },

  // Card Styles
  cards: {
    luxury: 'bg-white/95 backdrop-blur-md border border-royal-200/50 shadow-luxury rounded-2xl hover:shadow-royal transition-all duration-500 hover:scale-105 hover:border-luxury-gold-300/50',
    royal: 'bg-gradient-to-br from-royal-50 to-royal-100 border border-royal-300 shadow-royal rounded-xl hover:shadow-luxury transition-all duration-300',
    gold: 'bg-gradient-to-br from-luxury-gold-50 to-luxury-champagne-50 border border-luxury-gold-300 shadow-gold rounded-xl hover:animate-gold-glow transition-all duration-300',
    premium: 'bg-white border border-gray-200 shadow-luxury rounded-2xl hover:shadow-royal transition-all duration-300 hover:border-royal-300',
  },

  // Input Styles
  inputs: {
    default: 'border border-gray-300 rounded-lg px-4 py-2 focus:border-royal-500 focus:ring-2 focus:ring-royal-200 transition-all',
    luxury: 'border border-luxury-gold-300 rounded-lg px-4 py-2 focus:border-luxury-gold-500 focus:ring-2 focus:ring-luxury-gold-100 transition-all',
  },
} as const;

// ========================================
// SPACING & LAYOUT
// ========================================

/**
 * Brand Spacing System
 */
export const brandSpacing = {
  section: {
    padding: 'py-16 md:py-24 lg:py-32',
    paddingSmall: 'py-12 md:py-16 lg:py-20',
    paddingLarge: 'py-20 md:py-32 lg:py-40',
  },
  container: {
    padding: 'px-4 sm:px-6 lg:px-8 xl:px-12',
    maxWidth: 'max-w-7xl mx-auto',
  },
  gaps: {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  },
} as const;

// ========================================
// BRAND METADATA
// ========================================

/**
 * Brand Metadata for SEO and Social
 */
export const brandMetadata = {
  name: 'Harsha Delights',
  tagline: 'Premium Confectionery & Sweets',
  description: 'Discover the finest selection of sweets, chocolates, namkeens, and dry fruits. Premium quality confectionery from Harsha Delights.',
  keywords: ['sweets', 'chocolates', 'namkeens', 'dry fruits', 'confectionery', 'Harsha Delights', 'premium sweets', 'luxury confectionery'],

  // Theme colors for browser/mobile
  themeColor: {
    light: '#7c3aed', // Royal purple
    dark: '#9c6eff', // Lighter royal purple
  },

  // Social media
  social: {
    twitter: '@harshadelights',
    facebook: 'harshadelights',
    instagram: '@harshadelights',
  },

  // Contact
  contact: {
    email: 'info@harshadelights.com',
    phone: '+91 9876543210',
    address: 'India',
  },
} as const;

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Get brand color by name
 */
export const getBrandColor = (color: 'royal' | 'gold' | 'champagne' | 'burgundy', shade: number = 500): string => {
  if (color === 'royal') return brandColors.primary.royal[shade as keyof typeof brandColors.primary.royal];
  return brandColors.secondary[color][shade as keyof typeof brandColors.secondary.gold];
};

/**
 * Get CSS variable for brand color
 */
export const getBrandColorVar = (color: 'primary' | 'secondary' | 'accent'): string => {
  return `hsl(var(--${color}))`;
};

/**
 * Get font family by context
 */
export const getBrandFont = (context: 'heading' | 'product' | 'body' | 'special'): string => {
  const fontMap = {
    heading: brandFonts.families.royal,
    product: brandFonts.families.luxury,
    body: brandFonts.families.premium,
    special: brandFonts.families.elegant,
  };
  return fontMap[context];
};

// ========================================
// EXPORTS
// ========================================

/**
 * Complete brand configuration object
 */
export const brandConfig = {
  colors: brandColors,
  fonts: brandFonts,
  logos: brandLogos,
  backgrounds: brandBackgrounds,
  animations: brandAnimations,
  shadows: brandShadows,
  styles: brandStyles,
  spacing: brandSpacing,
  metadata: brandMetadata,

  // Utility functions
  getBrandColor,
  getBrandColorVar,
  getBrandFont,
} as const;

// Default export
export default brandConfig;
