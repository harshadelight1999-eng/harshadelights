'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import { RootState, AppDispatch } from '@/store/store';
import { getFeaturedProducts } from '@/store/slices/productsSlice';
import { addToCart } from '@/store/slices/cartSlice';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';

export default function FeaturedProducts() {
  const dispatch = useDispatch<AppDispatch>();
  const { featuredProducts, isLoading } = useSelector((state: RootState) => state.products);

  useEffect(() => {
    dispatch(getFeaturedProducts());
  }, [dispatch]);

  const handleAddToCart = (productId: string, variantId: string, title: string, price: number) => {
    dispatch(addToCart({
      product_id: productId,
      variant_id: variantId,
      quantity: 1,
    }));
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <div className="aspect-square bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded mb-4 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Products
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our most popular and highest-rated confectionery items
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => {
            const mainVariant = product.variants[0];
            const hasDiscount = mainVariant?.compare_at_price && mainVariant.compare_at_price > mainVariant.price;

            return (
              <div
                key={product.id}
                className="group bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
                    <ShoppingCart className="w-16 h-16 text-yellow-400" />
                  </div>

                  {/* Discount Badge */}
                  {hasDiscount && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {Math.round(((mainVariant.compare_at_price! - mainVariant.price) / mainVariant.compare_at_price!) * 100)}% OFF
                    </div>
                  )}

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-yellow-50 transition-colors">
                        <Heart className="w-4 h-4 text-gray-600" />
                      </button>
                      <Link
                        href={`/products/${product.handle}`}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-yellow-50 transition-colors"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <div className="text-sm text-yellow-600 font-medium mb-1">
                    {product.categories[0]?.name}
                  </div>

                  <h3 className="font-heading text-lg font-bold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors line-clamp-1">
                    {product.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.subtitle || product.description}
                  </p>

                  {/* Rating (placeholder for now) */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">(4.5)</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl font-bold text-gray-900">
                      ₹{mainVariant?.price}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{mainVariant.compare_at_price}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(
                      product.id,
                      mainVariant.id,
                      product.title,
                      mainVariant.price
                    )}
                    className="w-full btn-primary flex items-center justify-center gap-2 hover:shadow-lg"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/products"
            className="btn-secondary inline-flex items-center"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}