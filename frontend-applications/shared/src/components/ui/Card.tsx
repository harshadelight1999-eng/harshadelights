import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm transition-all",
  {
    variants: {
      variant: {
        default: "border-border",
        elevated: "shadow-lg border-border/50",
        outlined: "border-2 border-border bg-background",
        filled: "border-0 bg-muted",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
      interactive: {
        true: "cursor-pointer hover:shadow-md hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
      interactive: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, interactive, asChild, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "div";

    if (asChild) {
      return <>{props.children}</>;
    }

    return (
      <Comp
        ref={ref}
        className={cn(cardVariants({ variant, padding, interactive }), className)}
        tabIndex={interactive ? 0 : undefined}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));

CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));

CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));

CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));

CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));

CardFooter.displayName = "CardFooter";

// Product Card - Business-specific card for confectionery products
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

const ProductCard = React.forwardRef<HTMLDivElement, ProductCardProps>(
  ({
    image,
    title,
    description,
    price,
    originalPrice,
    rating,
    reviewCount,
    onAddToCart,
    onQuickView,
    badge,
    inStock = true,
    className,
    ...props
  }, ref) => {
    return (
      <Card
        ref={ref}
        variant="elevated"
        padding="none"
        interactive
        className={cn("overflow-hidden", className)}
        {...props}
      >
        <div className="relative">
          <img
            src={image}
            alt={title}
            className="w-full h-48 object-cover"
          />
          {badge && (
            <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
              {badge}
            </span>
          )}
          {!inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-medium">Out of Stock</span>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <CardTitle className="text-lg mb-2 line-clamp-2">{title}</CardTitle>
          {description && (
            <CardDescription className="mb-3 line-clamp-2">
              {description}
            </CardDescription>
          )}

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary">
                ₹{(price / 100).toFixed(2)}
              </span>
              {originalPrice && originalPrice > price && (
                <span className="text-sm text-muted-foreground line-through">
                  ₹{(originalPrice / 100).toFixed(2)}
                </span>
              )}
            </div>
            {rating && (
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">{rating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">
                  ({reviewCount || 0})
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {onAddToCart && inStock && (
              <button
                onClick={onAddToCart}
                className="flex-1 bg-primary text-primary-foreground px-3 py-2 rounded text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Add to Cart
              </button>
            )}
            {onQuickView && (
              <button
                onClick={onQuickView}
                className="px-3 py-2 border border-input rounded text-sm font-medium hover:bg-accent transition-colors"
              >
                Quick View
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

ProductCard.displayName = "ProductCard";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  ProductCard,
  cardVariants,
};