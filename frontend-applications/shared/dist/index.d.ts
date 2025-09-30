import * as class_variance_authority_dist_types from 'class-variance-authority/dist/types';
import * as React from 'react';
import { VariantProps } from 'class-variance-authority';
import * as react_jsx_runtime from 'react/jsx-runtime';
import { ClassValue } from 'clsx';

declare const buttonVariants: (props?: ({
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "primary" | "success" | "warning" | null | undefined;
    size?: "default" | "sm" | "lg" | "xl" | "icon" | null | undefined;
} & class_variance_authority_dist_types.ClassProp) | undefined) => string;
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}
declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;

interface LuxuryHeroProps {
    title?: string;
    subtitle?: string;
    description?: string;
    primaryCTA?: {
        text: string;
        href: string;
    };
    secondaryCTA?: {
        text: string;
        href: string;
    };
    autoRotateBackground?: boolean;
    rotationInterval?: number;
    className?: string;
}
declare function LuxuryHero({ title, subtitle, description, primaryCTA, secondaryCTA, autoRotateBackground, rotationInterval, className }: LuxuryHeroProps): react_jsx_runtime.JSX.Element;

interface LuxuryProductCardProps {
    product: {
        id: string;
        title: string;
        description: string;
        price: number;
        comparePrice?: number;
        thumbnail?: string;
        category: string;
        rating?: number;
        reviews?: number;
        inStock: boolean;
        stockCount?: number;
        isPremium?: boolean;
        isNew?: boolean;
    };
    onAddToCart?: (productId: string) => void;
    onWishlist?: (productId: string) => void;
    onQuickView?: (productId: string) => void;
    className?: string;
}
declare function LuxuryProductCard({ product, onAddToCart, onWishlist, onQuickView, className }: LuxuryProductCardProps): react_jsx_runtime.JSX.Element;

/**
 * Asset Management Utility for Harsha Delights
 * Centralized system for managing team-changeable assets
 */
declare const backgrounds: {
    readonly hero: {
        readonly bg1: "/assets/branding/backgrounds/BG01.png";
        readonly bg2: "/assets/branding/backgrounds/BG-02.png";
        readonly bg3: "/assets/branding/backgrounds/BG-03.png";
        readonly bg4: "/assets/branding/backgrounds/BG-04.png";
        readonly bg5: "/assets/branding/backgrounds/BG-5.png";
        readonly bg6: "/assets/branding/backgrounds/BG-06.png";
        readonly bg7: "/assets/branding/backgrounds/BG-07.png";
    };
    readonly getRandomHero: () => "/assets/branding/backgrounds/BG01.png" | "/assets/branding/backgrounds/BG-02.png" | "/assets/branding/backgrounds/BG-03.png" | "/assets/branding/backgrounds/BG-04.png" | "/assets/branding/backgrounds/BG-5.png" | "/assets/branding/backgrounds/BG-06.png" | "/assets/branding/backgrounds/BG-07.png";
};
declare const logos: {
    readonly elegant: "/assets/branding/logos/elegant_monogram_logo_for_harsha_delights_a-removebg-preview.png";
    readonly elegantAlt: "/assets/branding/logos/elegant_monogram_logo_for_harsha_delights_a__4_-removebg-preview.png";
    readonly getDefault: () => "/assets/branding/logos/elegant_monogram_logo_for_harsha_delights_a-removebg-preview.png";
    readonly getVariant: (variant?: "elegant" | "elegantAlt") => "/assets/branding/logos/elegant_monogram_logo_for_harsha_delights_a-removebg-preview.png" | "/assets/branding/logos/elegant_monogram_logo_for_harsha_delights_a__4_-removebg-preview.png";
};
declare const products: {
    readonly confectionery: "/assets/products/confectionery";
    readonly seasonal: "/assets/products/seasonal";
    readonly premium: "/assets/products/premium";
    readonly categories: "/assets/products/categories";
    readonly getImagePath: (category: "confectionery" | "seasonal" | "premium" | "categories", filename: string) => string;
};
declare const luxuryStyles: {
    readonly backgrounds: {
        readonly royalGradient: "bg-royal-gradient";
        readonly goldGradient: "bg-gold-gradient";
        readonly luxuryGradient: "bg-luxury-gradient";
        readonly hero: (bgNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7) => string;
    };
    readonly fonts: {
        readonly royal: "font-royal";
        readonly luxury: "font-luxury";
        readonly elegant: "font-elegant";
        readonly premium: "font-premium";
    };
    readonly animations: {
        readonly shimmer: "animate-royal-shimmer";
        readonly float: "animate-luxury-float";
        readonly glow: "animate-gold-glow";
        readonly pulse: "animate-royal-pulse";
    };
    readonly shadows: {
        readonly royal: "shadow-royal";
        readonly luxury: "shadow-luxury";
        readonly gold: "shadow-gold";
        readonly royalInset: "shadow-royal-inset";
    };
    readonly colors: {
        readonly royal: {
            readonly text: "text-royal-700";
            readonly bg: "bg-royal-500";
            readonly border: "border-royal-300";
        };
        readonly luxury: {
            readonly gold: {
                readonly text: "text-luxury-gold-700";
                readonly bg: "bg-luxury-gold-500";
                readonly border: "border-luxury-gold-300";
            };
            readonly burgundy: {
                readonly text: "text-luxury-burgundy-700";
                readonly bg: "bg-luxury-burgundy-500";
                readonly border: "border-luxury-burgundy-300";
            };
            readonly champagne: {
                readonly text: "text-luxury-champagne-700";
                readonly bg: "bg-luxury-champagne-500";
                readonly border: "border-luxury-champagne-300";
            };
        };
    };
};
declare const cardStyles: {
    readonly luxury: "\n    bg-white/95 backdrop-blur-md \n    border border-royal-200/50 \n    shadow-luxury rounded-2xl \n    hover:shadow-royal transition-all duration-500\n    hover:scale-105 hover:border-luxury-gold-300/50\n  ";
    readonly royal: "\n    bg-gradient-to-br from-royal-50 to-royal-100 \n    border border-royal-300 \n    shadow-royal rounded-xl \n    hover:shadow-luxury transition-all duration-300\n  ";
    readonly gold: "\n    bg-gradient-to-br from-luxury-gold-50 to-luxury-champagne-50 \n    border border-luxury-gold-300 \n    shadow-gold rounded-xl \n    hover:animate-gold-glow transition-all duration-300\n  ";
    readonly premium: "\n    bg-white border border-gray-200 \n    shadow-luxury rounded-2xl \n    hover:shadow-royal transition-all duration-300\n    hover:border-royal-300\n  ";
};
declare const buttonStyles: {
    readonly royal: "\n    bg-royal-gradient text-white font-semibold\n    px-8 py-4 rounded-xl shadow-royal\n    hover:shadow-luxury hover:scale-105\n    transition-all duration-300\n  ";
    readonly gold: "\n    bg-gold-gradient text-royal-900 font-semibold\n    px-8 py-4 rounded-xl shadow-gold\n    hover:animate-gold-glow hover:scale-105\n    transition-all duration-300\n  ";
    readonly luxury: "\n    bg-luxury-gradient text-white font-semibold\n    px-8 py-4 rounded-xl shadow-luxury\n    hover:shadow-royal hover:scale-105\n    transition-all duration-300\n  ";
    readonly outline: "\n    border-2 border-royal-500 text-royal-700 font-semibold\n    px-8 py-4 rounded-xl hover:bg-royal-50\n    hover:shadow-royal transition-all duration-300\n  ";
};
declare const utils: {
    readonly combineStyles: (...styles: string[]) => string;
    readonly responsive: {
        readonly text: {
            readonly hero: "text-4xl md:text-6xl lg:text-7xl xl:text-8xl";
            readonly heading: "text-2xl md:text-3xl lg:text-4xl xl:text-5xl";
            readonly subheading: "text-lg md:text-xl lg:text-2xl xl:text-3xl";
            readonly body: "text-base md:text-lg lg:text-xl";
        };
        readonly spacing: {
            readonly section: "py-16 md:py-24 lg:py-32";
            readonly container: "px-4 sm:px-6 lg:px-8 xl:px-12";
        };
    };
};

/**
 * Utility function to merge CSS classes with Tailwind CSS conflict resolution
 * Combines clsx for conditional classes with tailwind-merge for conflict resolution
 */
declare function cn(...inputs: ClassValue[]): string;
/**
 * Compare two arrays for equality by converting to strings
 * Useful for shallow comparison of arrays
 */
declare const compareArrays: (a: any[], b: any[]) => boolean;
/**
 * Format price for display in Indian Rupees
 * @param price - Price in paise (smallest currency unit)
 * @param currency - Currency code (default: INR)
 */
declare const formatPrice: (price: number, currency?: string) => string;
/**
 * Format weight for confectionery products
 * @param weight - Weight in grams
 */
declare const formatWeight: (weight: number) => string;
/**
 * Generate slug from string for URLs
 * @param text - Text to convert to slug
 */
declare const generateSlug: (text: string) => string;
/**
 * Truncate text to specified length with ellipsis
 * @param text - Text to truncate
 * @param length - Maximum length
 */
declare const truncateText: (text: string, length: number) => string;
/**
 * Debounce function for search and input handling
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 */
declare const debounce: <T extends (...args: any[]) => any>(func: T, wait: number) => ((...args: Parameters<T>) => void);

export { Button, LuxuryHero, LuxuryProductCard, backgrounds, buttonStyles, buttonVariants, cardStyles, cn, compareArrays, debounce, formatPrice, formatWeight, generateSlug, logos, luxuryStyles, products, truncateText, utils };
