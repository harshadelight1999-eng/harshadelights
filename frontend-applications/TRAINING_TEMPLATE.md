# 🎯 Frontend Training Template for AI Agents

## Overview
This document provides standardized patterns and examples for AI agents (Gemini, Windsurf, Grok) to build consistent, professional applications for Harsha Delights.

## 📐 Standards & Rules

### Code Quality Standards
- **TypeScript Only** - All components must be fully typed
- **No Placeholder Content** - Real business data only
- **Production Ready** - Code must compile and run without errors
- **Component Architecture** - Reusable, modular design
- **Performance First** - Optimized builds, proper imports

### Business Standards
- **Brand Consistency** - Use Harsha Delights colors, fonts, messaging
- **Indian Market Focus** - ₹ currency, Hindi/Gujarati/Marathi support
- **Confectionery Specific** - Sweets, chocolates, namkeens, dry fruits
- **Professional Tone** - Premium quality, heritage, trust

## 🏗️ Architecture Patterns

### Project Structure
```
src/
├── components/
│   ├── ui/              # Shared UI components
│   ├── layout/          # Header, Footer, Navigation
│   └── sections/        # Page sections (Hero, Products, etc.)
├── lib/                 # Utilities, API clients
├── styles/              # Global CSS, Tailwind config
└── app/                 # Next.js App Router pages
```

### Component Pattern
```typescript
'use client';

import { useState } from 'react';
import { Button } from '../ui/Button';
import { Icon } from 'lucide-react';

interface ComponentProps {
  title: string;
  data: DataType[];
  onAction?: () => void;
}

export default function Component({ title, data, onAction }: ComponentProps) {
  const [state, setState] = useState<StateType>(initialState);

  const handleAction = () => {
    // Business logic
    onAction?.();
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Content */}
      </div>
    </section>
  );
}
```

## 🎨 Design System

### Colors (Tailwind)
```typescript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      'harsha-orange': {
        50: '#fff7ed',
        500: '#f97316',
        600: '#ea580c',
        900: '#9a3412',
      },
      'harsha-gold': {
        500: '#f59e0b',
        600: '#d97706',
      }
    }
  }
}
```

### Typography
- **Headings**: font-bold, text-gray-900
- **Body**: text-gray-600, leading-relaxed
- **CTAs**: font-semibold, text-white

### Components
- **Buttons**: Consistent variants (primary, secondary, outline)
- **Cards**: Shadow, rounded-lg, hover effects
- **Sections**: py-16, max-w-7xl mx-auto

## 📱 Application Templates

### 1. B2C E-commerce (shop.harshadelights.com)
**Purpose**: Online shopping for consumers
**Key Features**:
- Product catalog with search/filters
- Shopping cart and checkout
- User accounts and order history
- Payment integration (UPI, cards)
- Mobile-responsive design

**Required Sections**:
```typescript
// Home Page
- Hero (featured products, offers)
- Categories (sweets, chocolates, namkeens)
- Bestsellers
- Testimonials
- Newsletter signup

// Product Pages
- Product grid with filters
- Product details with variants
- Related products
- Reviews and ratings

// Checkout Flow
- Cart summary
- Address selection
- Payment options
- Order confirmation
```

### 2. B2B Portal (partners.harshadelights.com)
**Purpose**: Wholesale and partner management
**Key Features**:
- Bulk ordering interface
- Wholesale pricing tiers
- Order management dashboard
- Credit terms and invoicing
- Distributor network tools

**Required Sections**:
```typescript
// Dashboard
- Order summary and analytics
- Pending orders and shipments
- Payment status
- Quick reorder options

// Catalog
- Bulk pricing display
- Minimum order quantities
- Seasonal availability
- Custom packaging options

// Account Management
- Credit limits and terms
- Order history and invoicing
- Support ticket system
- Document downloads
```

### 3. Mobile Applications
**Purpose**: Native mobile experience
**Platforms**: React Native (iOS/Android), Flutter
**Key Features**:
- Push notifications for offers
- Location-based store finder
- Barcode scanning for products
- Offline cart functionality
- Social sharing features

## 🔧 Technical Implementation

### Required Dependencies
```json
{
  "next": "^14.2.0",
  "react": "^18.3.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.4.0",
  "lucide-react": "^0.446.0",
  "framer-motion": "^11.5.4",
  "clsx": "^2.1.1",
  "class-variance-authority": "^0.7.0"
}
```

### Build Scripts
```json
{
  "scripts": {
    "dev": "next dev -p [PORT]",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

### Environment Setup
```env
NEXT_PUBLIC_SITE_URL=https://[subdomain].harshadelights.com
NEXT_PUBLIC_API_URL=https://api.harshadelights.com
NEXT_PUBLIC_COMPANY_NAME="Harsha Delights"
NEXT_PUBLIC_COMPANY_PHONE="+91-98765-43210"
NEXT_PUBLIC_COMPANY_EMAIL="info@harshadelights.com"
```

## 📊 Performance Targets

### Core Web Vitals
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1

### Build Optimization
- **Bundle Size**: < 500KB initial
- **Image Optimization**: WebP/AVIF formats
- **Code Splitting**: Route-based chunks
- **Tree Shaking**: Remove unused code

## 🔒 Security Standards

### Data Protection
- **Input Validation**: All user inputs sanitized
- **HTTPS Only**: Secure connections required
- **API Security**: JWT tokens, rate limiting
- **PII Handling**: GDPR/privacy compliant

### Content Security
- **CSP Headers**: Content Security Policy
- **XSS Prevention**: Sanitized output
- **CSRF Protection**: Token validation
- **Dependency Security**: Regular updates

## 📝 Documentation Requirements

### Component Documentation
```typescript
/**
 * Product Card Component
 *
 * Displays product information with image, title, price, and actions
 * Used in product grids, recommendations, and search results
 *
 * @param product - Product data object
 * @param onAddToCart - Callback for add to cart action
 * @param showRating - Whether to display star ratings
 *
 * @example
 * <ProductCard
 *   product={productData}
 *   onAddToCart={handleAddToCart}
 *   showRating={true}
 * />
 */
```

### API Integration
```typescript
// Example API client pattern
export const productApi = {
  getAll: (filters?: ProductFilters) =>
    apiClient.get<Product[]>('/products', { params: filters }),

  getById: (id: string) =>
    apiClient.get<Product>(`/products/${id}`),

  search: (query: string) =>
    apiClient.get<Product[]>('/products/search', { params: { q: query } })
};
```

## ✅ Quality Checklist

Before marking any component complete, verify:

- [ ] **TypeScript**: No type errors, proper interfaces
- [ ] **Build**: Compiles successfully with `npm run build`
- [ ] **Lint**: Passes ESLint with no warnings
- [ ] **Performance**: Optimized images, minimal re-renders
- [ ] **Responsive**: Works on mobile, tablet, desktop
- [ ] **Accessibility**: ARIA labels, keyboard navigation
- [ ] **SEO**: Meta tags, structured data
- [ ] **Business Logic**: Real data, proper error handling
- [ ] **Testing**: Unit tests for critical functions
- [ ] **Documentation**: Component props and usage examples

## 🚀 Deployment Standards

### Environment Configuration
- **Development**: localhost with hot reload
- **Staging**: staging.harshadelights.com for testing
- **Production**: [subdomain].harshadelights.com

### CI/CD Pipeline
1. **Code Quality**: Lint, type-check, test
2. **Build**: Generate optimized production build
3. **Security**: Dependency vulnerability scan
4. **Deploy**: Automated deployment with rollback
5. **Monitor**: Performance and error tracking

## 📞 Support & Resources

### Reference Implementation
- **Public Website**: `/frontend-applications/01-public-website/`
- **Shared Components**: `/frontend-applications/shared/`
- **Documentation**: `README.md` files in each project

### Business Context
- **Company**: Premium confectionery manufacturer since 1998
- **Products**: Traditional sweets, chocolates, namkeens, dry fruits
- **Markets**: B2C retail, B2B wholesale, corporate gifts
- **Regions**: India (Gujarat, Maharashtra, Delhi, Mumbai)

---

**Remember**: This is training material. Focus on creating professional, production-ready code that demonstrates best practices for other AI agents to learn from.