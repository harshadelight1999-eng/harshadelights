# Harsha Delights Public Website

A premium Next.js website for Harsha Delights confectionery business, featuring a modern, responsive design optimized for SEO and performance.

## 🚀 Live Development Server

The website is currently running at: **http://localhost:3001**

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx      # Root layout with SEO & internationalization
│   └── page.tsx        # Homepage with all sections
├── components/
│   ├── layout/         # Layout components
│   │   ├── Header.tsx  # Navigation with multi-level dropdowns
│   │   └── Footer.tsx  # Comprehensive footer with links & social
│   ├── sections/       # Page sections
│   │   ├── Hero.tsx           # Hero section with CTA
│   │   ├── FeaturedProducts.tsx # Product showcase
│   │   ├── Categories.tsx     # Product categories
│   │   ├── AboutUs.tsx        # Company story & timeline
│   │   ├── WhyChooseUs.tsx    # Value propositions
│   │   ├── Testimonials.tsx   # Customer reviews
│   │   └── Contact.tsx        # Contact form & info
│   └── ui/             # UI components
│       └── Button.tsx  # Styled button component
├── lib/                # Utilities
│   └── utils.ts        # Helper functions
└── styles/
    └── globals.css     # Global styles & theme
```

## ✨ Features

### 🎨 Modern Design
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Brand Colors**: Custom Harsha Delights orange/yellow theme
- **Smooth Animations**: Framer Motion powered transitions
- **Glass Effects**: Modern UI with backdrop blur effects

### 🔍 SEO Optimized
- **Meta Tags**: Comprehensive meta tags and Open Graph
- **Structured Data**: JSON-LD for business information
- **Sitemap Ready**: Configured for search engine indexing
- **Performance**: Optimized images and code splitting

### 🌐 International Ready
- **Multi-language Support**: English, Hindi, Gujarati, Marathi
- **Locale Detection**: Automatic language detection
- **RTL Support**: Ready for right-to-left languages

### 📱 Components

#### Header Component
- Multi-level navigation with product categories
- Search functionality
- Shopping cart integration
- Mobile responsive menu
- Language switcher

#### Hero Section
- Animated product showcase
- Call-to-action buttons
- Trust indicators and statistics
- Dynamic background effects

#### Featured Products
- Interactive product cards
- Rating and review display
- Add to cart functionality
- Product quick actions (wishlist, view)

#### Categories Section
- Product category overview
- Statistics and metrics
- Trending/popular badges
- Interactive hover effects

#### About Us
- Company timeline with animations
- Core values showcase
- Achievement statistics
- Heritage story presentation

#### Why Choose Us
- Quality assurance features
- Trust indicators
- Certification displays
- Interactive feature cards

#### Testimonials
- Customer review carousel
- Rating displays
- Category filtering
- Auto-rotation with manual controls

#### Contact Section
- Interactive contact form
- Multiple contact methods
- Quick action buttons
- Map integration ready

#### Footer
- Newsletter subscription
- Comprehensive link structure
- Social media integration
- Payment method display
- Trust badges and certifications

## 🛠️ Technical Stack

- **Framework**: Next.js 14 with App Router
- **UI**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom theme
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Forms**: Native HTML with validation
- **Theme**: next-themes for dark mode support

## 🎯 Business Features

### Confectionery-Specific
- **Product Categories**: Sweets, Chocolates, Namkeens, Dry Fruits
- **Gift Collections**: Special occasion packaging
- **B2B Portal**: Business partnership integration
- **Bulk Orders**: Wholesale pricing support

### Indian Market Focus
- **Currency**: Indian Rupees (₹) formatting
- **Languages**: Multi-language support for Indian markets
- **Cultural**: Festival and celebration-focused content
- **Local**: Indian business practices and preferences

## 🚀 Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 📊 Performance

- **Lighthouse Score**: Optimized for 90+ scores
- **Core Web Vitals**: LCP, FID, CLS optimized
- **Bundle Size**: Code splitting and tree shaking
- **SEO**: 100% accessibility compliance ready

## 🔗 Integration Points

### Backend APIs
- Product catalog integration
- Customer management
- Order processing
- Inventory tracking

### E-commerce Features
- Shopping cart functionality
- Checkout process integration
- Payment gateway ready
- Order tracking system

### CRM Integration
- Customer data sync
- Newsletter management
- Feedback collection
- Support ticket system

## 🎨 Design System

### Colors
- **Primary**: Orange (#f97316) - Harsha Delights brand
- **Secondary**: Yellow (#eab308) - Accent color
- **Success**: Green (#22c55e)
- **Warning**: Yellow (#f59e0b)
- **Error**: Red (#ef4444)

### Typography
- **Headings**: Poppins font family
- **Body**: Inter font family
- **Responsive**: Fluid typography scaling

### Components
- **Buttons**: Multiple variants with loading states
- **Cards**: Hover effects and shadows
- **Forms**: Validation and error states
- **Navigation**: Multi-level with animations

## 📈 Next Steps

1. **Content Management**: Integrate with headless CMS
2. **E-commerce**: Connect to Medusa.js backend
3. **Authentication**: User accounts and profiles
4. **Search**: Advanced product search functionality
5. **Analytics**: Google Analytics and conversion tracking

## 🤝 Contributing

This is the foundation template for other frontend applications. When creating new applications (B2C, B2B, Mobile), use this structure and component patterns for consistency.

### Code Standards
- TypeScript strict mode
- ESLint + Prettier configuration
- Component-based architecture
- Responsive design principles
- SEO best practices

---

**Built with ❤️ for Harsha Delights**
*Premium Confectionery Since 1998*