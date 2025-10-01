'use client';

import { ProductWithPricing } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Plus } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface ProductGridProps {
  products: ProductWithPricing[];
}

export function ProductGrid({ products }: ProductGridProps) {
  const [cart, setCart] = useState<Record<string, number>>({});

  const addToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      const newCart = { ...cart };
      delete newCart[productId];
      setCart(newCart);
    } else {
      setCart(prev => ({
        ...prev,
        [productId]: quantity
      }));
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="aspect-square relative bg-gray-100">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
            />
            {product.discount > 0 && (
              <Badge className="absolute top-2 right-2 bg-luxury-burgundy-600">
                {product.discount}% OFF
              </Badge>
            )}
          </div>
          
          <CardHeader>
            <CardTitle className="text-lg">{product.name}</CardTitle>
            <p className="text-sm text-gray-600">{product.description}</p>
            <Badge variant="outline" className="w-fit">
              {product.category}
            </Badge>
          </CardHeader>

          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">SKU:</span>
                <span className="text-sm font-medium">{product.sku}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Unit:</span>
                <span className="text-sm font-medium">{product.unit}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Min Order:</span>
                <span className="text-sm font-medium">{product.minimumOrderQuantity} {product.unit}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Stock:</span>
                <span className={`text-sm font-medium ${
                  product.inStock ? 'text-luxury-champagne-600' : 'text-luxury-burgundy-600'
                }`}>
                  {product.inStock ? `${product.stockQuantity} available` : 'Out of stock'}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Base Price:</span>
                <span className="text-sm text-gray-500 line-through">
                  {formatCurrency(product.basePrice)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Your Price:</span>
                <span className="text-lg font-bold text-luxury-gold-600">
                  {formatCurrency(product.customerPrice)}
                </span>
              </div>
            </div>
          </CardContent>

          <CardFooter>
            {cart[product.id] ? (
              <div className="flex items-center space-x-2 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(product.id, cart[product.id] - 1)}
                >
                  -
                </Button>
                <span className="flex-1 text-center font-medium">
                  {cart[product.id]} × {formatCurrency(product.customerPrice * cart[product.id])}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(product.id, cart[product.id] + 1)}
                >
                  +
                </Button>
              </div>
            ) : (
              <Button 
                className="w-full" 
                onClick={() => addToCart(product.id)}
                disabled={!product.inStock}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
