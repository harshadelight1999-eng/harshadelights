# @harshadelights/shared-components

High-quality, reusable UI components and utilities for Harsha Delights frontend applications.

## 🎯 Overview

This shared component library provides a consistent design system and reusable components across all Harsha Delights applications:

- 🏠 Public Website (harshadelights.com)
- 🛒 B2C E-commerce (shop.harshadelights.com)
- 🏢 B2B Portal (portal.harshadelights.com)
- 📱 Customer Mobile App (React Native)
- 📱 Sales Mobile App (Flutter)

## 🚀 Technology Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Radix UI** for accessible primitives
- **Class Variance Authority** for type-safe variants
- **Framer Motion** for animations
- **React Simple Star Rating** for ratings

## 📦 Installation

```bash
# Install the shared components
npm install @harshadelights/shared-components

# Install peer dependencies
npm install react react-dom
```

## 🎨 Components

### Basic UI Components

#### Button
```tsx
import { Button } from '@harshadelights/shared-components';

<Button variant="primary" size="lg">
  Add to Cart
</Button>
```

**Variants**: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`, `primary`, `success`, `warning`
**Sizes**: `default`, `sm`, `lg`, `xl`, `icon`
**Features**: Loading states, left/right icons, business-specific styling

#### Input & InputGroup
```tsx
import { Input, InputGroup } from '@harshadelights/shared-components';

<Input
  label="Email Address"
  placeholder="Enter your email"
  error="Please enter a valid email"
/>

<InputGroup label="Phone Number">
  <InputGroup.Text>+91</InputGroup.Text>
  <InputGroup.Input placeholder="9876543210" />
</InputGroup>
```

#### Card & ProductCard
```tsx
import { Card, ProductCard } from '@harshadelights/shared-components';

<Card variant="elevated" interactive>
  <Card.Header>
    <Card.Title>Featured Products</Card.Title>
    <Card.Description>Our bestselling confectionery items</Card.Description>
  </Card.Header>
  <Card.Content>
    Card content here...
  </Card.Content>
</Card>

<ProductCard
  image="/products/gulab-jamun.jpg"
  title="Premium Gulab Jamun"
  description="Traditional sweet made with finest ingredients"
  price={25000} // in paise (₹250.00)
  originalPrice={30000}
  rating={4.8}
  reviewCount={156}
  badge="Bestseller"
  onAddToCart={() => console.log('Added to cart')}
  onQuickView={() => console.log('Quick view')}
/>
```

#### Rating
```tsx
import { Rating, DisplayRating } from '@harshadelights/shared-components';

// Interactive rating
<Rating
  initialValue={0}
  onClick={(rate) => console.log(rate)}
  showTooltip
/>

// Display-only rating
<DisplayRating
  rating={4.8}
  showValue
  showCount
  count={156}
/>
```

### Business Components

#### ProductCard
Business-specific card component for confectionery products with:
- Product image display
- Price formatting in Indian Rupees
- Rating and review count
- Stock status
- Add to Cart and Quick View functionality
- Badge support for offers/new products

## 🛠️ Utilities

### Core Utilities
```tsx
import { cn, formatPrice, formatWeight, generateSlug } from '@harshadelights/shared-components';

// CSS class merging with Tailwind conflict resolution
const className = cn("text-lg", "text-blue-500", "text-red-500"); // "text-lg text-red-500"

// Format price in Indian Rupees
const price = formatPrice(25000); // "₹250.00"

// Format weight for products
const weight = formatWeight(1500); // "1.5kg"

// Generate URL-friendly slugs
const slug = generateSlug("Premium Gulab Jamun"); // "premium-gulab-jamun"
```

### Testing Utilities
```tsx
import { renderWithStore, mockProducts, mockUser, setupTestEnvironment } from '@harshadelights/shared-components';

// Enhanced render function with Redux store
const { getByText, store } = renderWithStore(<MyComponent />, {
  initialState: { cart: { items: [] } }
});

// Use mock data in tests
const products = mockProducts;
const user = mockUser;

// Setup test environment
setupTestEnvironment();
```

### Business Utilities
- `formatPrice(price, currency)` - Format prices in INR
- `formatWeight(weight)` - Format weights in grams/kilograms
- `generateSlug(text)` - Create URL-friendly slugs
- `truncateText(text, length)` - Truncate text with ellipsis
- `debounce(func, wait)` - Debounce function calls

### Authentication Utilities
- `authClient` - Unified authentication client for B2C/B2B/mobile
- Session management with automatic refresh
- User profile and permission handling

## 🎨 Styling

### CSS Variables
The library uses CSS custom properties for theming:

```css
:root {
  --primary: 24 95% 53%; /* Harsha Delights Orange */
  --secondary: 210 40% 96%;
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... more variables */
}
```

### Brand Colors
- **Primary Orange**: `harsha-orange-500` (#f97316)
- **Secondary Yellow**: `harsha-yellow-500` (#eab308)
- **Neutral Grays**: Standard Tailwind gray palette

### Utility Classes
```css
.product-price     /* Consistent price styling */
.product-title     /* Product title styling */
.product-description /* Product description styling */
.btn-primary       /* Primary button styling */
.btn-secondary     /* Secondary button styling */
```

## 🔧 Development

### Building the Library
```bash
# Install dependencies
npm install

# Build the library
npm run build

# Watch mode for development
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix
```

### Testing
```bash
# Run tests
npm test

# Watch mode
npm test:watch
```

### Storybook
```bash
# Start Storybook
npm run storybook

# Build Storybook
npm run build-storybook
```

## 📚 Design System

### Typography
- **Font Family**: Inter (body), Poppins (headings)
- **Font Sizes**: Tailwind default scale
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Spacing
- **Component Padding**: 4px, 8px, 12px, 16px, 24px, 32px
- **Component Margins**: Consistent with padding scale
- **Border Radius**: 4px (sm), 6px (default), 8px (md), 12px (lg)

### Colors
- **Primary**: Orange gradient for main actions
- **Secondary**: Neutral grays for secondary actions
- **Success**: Green for positive actions
- **Warning**: Yellow for caution
- **Error**: Red for destructive actions

## 🤝 Contributing

### Component Development Guidelines

1. **TypeScript First**: All components must be written in TypeScript
2. **Accessibility**: Follow WCAG 2.1 AA guidelines
3. **Performance**: Optimize for bundle size and runtime performance
4. **Testing**: Minimum 80% test coverage
5. **Documentation**: Comprehensive JSDoc comments

### Adding New Components

1. Create component in `src/components/ui/`
2. Add TypeScript interfaces for props
3. Use `forwardRef` for proper ref handling
4. Implement proper accessibility attributes
5. Add to index exports
6. Write tests and stories
7. Update documentation

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for Harsha Delights Confectionery Business**