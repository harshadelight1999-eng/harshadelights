import { type ClassValue } from "clsx";
/**
 * Utility function to merge CSS classes with Tailwind CSS conflict resolution
 * Combines clsx for conditional classes with tailwind-merge for conflict resolution
 */
export declare function cn(...inputs: ClassValue[]): string;
/**
 * Compare two arrays for equality by converting to strings
 * Useful for shallow comparison of arrays
 */
export declare const compareArrays: (a: any[], b: any[]) => boolean;
/**
 * Format price for display in Indian Rupees
 * @param price - Price in paise (smallest currency unit)
 * @param currency - Currency code (default: INR)
 */
export declare const formatPrice: (price: number, currency?: string) => string;
/**
 * Format weight for confectionery products
 * @param weight - Weight in grams
 */
export declare const formatWeight: (weight: number) => string;
/**
 * Generate slug from string for URLs
 * @param text - Text to convert to slug
 */
export declare const generateSlug: (text: string) => string;
/**
 * Truncate text to specified length with ellipsis
 * @param text - Text to truncate
 * @param length - Maximum length
 */
export declare const truncateText: (text: string, length: number) => string;
/**
 * Debounce function for search and input handling
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 */
export declare const debounce: <T extends (...args: any[]) => any>(func: T, wait: number) => ((...args: Parameters<T>) => void);
//# sourceMappingURL=utils.d.ts.map