import * as React from "react";
import { type VariantProps } from "class-variance-authority";
declare const cardVariants: (props?: ({
    variant?: "default" | "elevated" | "outlined" | "filled" | null | undefined;
    padding?: "default" | "sm" | "lg" | "none" | null | undefined;
    interactive?: boolean | null | undefined;
} & import("class-variance-authority/dist/types").ClassProp) | undefined) => string;
export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
    asChild?: boolean;
}
declare const Card: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>;
declare const CardHeader: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
declare const CardTitle: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLHeadingElement> & React.RefAttributes<HTMLParagraphElement>>;
declare const CardDescription: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>>;
declare const CardContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
declare const CardFooter: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export interface ProductCardProps extends Omit<CardProps, 'children'> {
    image: string;
    title: string;
    description?: string;
    price: number;
    originalPrice?: number;
    rating?: number;
    reviewCount?: number;
    onAddToCart?: () => void;
    onQuickView?: () => void;
    badge?: string;
    inStock?: boolean;
}
declare const ProductCard: React.ForwardRefExoticComponent<ProductCardProps & React.RefAttributes<HTMLDivElement>>;
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, ProductCard, cardVariants, };
//# sourceMappingURL=Card.d.ts.map