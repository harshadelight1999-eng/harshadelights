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
export default function LuxuryProductCard({ product, onAddToCart, onWishlist, onQuickView, className }: LuxuryProductCardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=LuxuryProductCard.d.ts.map