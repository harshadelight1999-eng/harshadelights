# Development Folder Structure & Project Organization
# Harsha Delights Frontend Applications

**Document Version**: 1.0
**Created**: September 20, 2025
**Purpose**: Establish organized development environment for 4 frontend applications

---

## 📁 COMPLETE PROJECT STRUCTURE

```
harshadelights/                                    # Main project root
├── 📋 docs/                                       # Documentation
│   ├── PRD-HARSHA-DELIGHTS-FRONTEND.md           # Product Requirements Document
│   ├── TASK-MANAGEMENT-WORKFLOW.md               # Team workflow and processes
│   ├── DEVELOPMENT-FOLDER-STRUCTURE.md           # This document
│   ├── API-INTEGRATION-GUIDE.md                  # Backend integration guide
│   └── DEPLOYMENT-GUIDE.md                       # Production deployment guide
│
├── 🔧 backend-services/                           # Existing backend (DO NOT MODIFY)
│   ├── api-gateway/                               # Node.js API Gateway
│   ├── ecommerce-backend/                         # Medusa.js backend
│   ├── sync-services/                             # Data synchronization
│   ├── erpnext_customizations/                    # ERPNext custom doctypes
│   ├── espocrm/                                   # CRM system
│   └── docker-compose.yml                        # Backend infrastructure
│
├── 🎨 frontend-applications/                      # NEW: All frontend apps
│   ├── 🏠 01-public-website/                      # harshadelights.com
│   ├── 🛒 02-b2c-ecommerce/                       # shop.harshadelights.com
│   ├── 🏢 03-b2b-portal/                          # partners.harshadelights.com
│   ├── 📱 04-mobile-customer/                     # React Native customer app
│   ├── 📱 05-mobile-sales/                        # Flutter sales team app
│   └── 🔧 shared/                                 # Shared components and utilities
│
├── 📚 frontend-examples/                          # Downloaded reference projects
│   ├── medusa-nextjs-starter/                     # Perfect for B2C integration
│   ├── workos-b2b-starter/                        # Perfect for B2B portal
│   ├── shopco-ecommerce/                          # UI components source
│   ├── react-admin-framework/                     # Admin components source
│   ├── enatega-ecommerce/                         # Mobile app reference
│   └── clientflow-flutter/                        # Flutter CRM patterns
│
├── 🔍 open-source-research/                       # Research and planning materials
│   ├── harsha-delights-system/                    # Previous planning docs
│   ├── medusa/                                    # Medusa.js research
│   ├── erpnext/                                   # ERPNext research
│   └── [other-research-projects]/                 # Additional research
│
└── 🚀 deployment/                                 # Deployment and DevOps
    ├── docker/                                    # Docker configurations
    ├── nginx/                                     # Reverse proxy configs
    ├── scripts/                                   # Deployment scripts
    └── monitoring/                                # Monitoring and logging
```

---

## 🎨 FRONTEND APPLICATIONS DETAILED STRUCTURE

### 1. 🏠 **Public Website** (`01-public-website/`)

**Purpose**: Main company website (harshadelights.com)
**Technology**: Next.js 14 + Shopco UI components + TypeScript
**Priority**: Phase 1 - Immediate

```
01-public-website/
├── 📋 README.md                          # Project documentation
├── 📦 package.json                       # Dependencies and scripts
├── ⚙️ next.config.js                     # Next.js configuration
├── 🎨 tailwind.config.js                 # Tailwind CSS configuration
├── 📝 tsconfig.json                      # TypeScript configuration
├── 🔧 .env.local                         # Environment variables
│
├── 📂 src/
│   ├── 📂 app/                           # Next.js App Router
│   │   ├── layout.tsx                    # Root layout
│   │   ├── page.tsx                      # Home page
│   │   ├── about/                        # About Us pages
│   │   ├── products/                     # Product showcase
│   │   ├── contact/                      # Contact pages
│   │   ├── blog/                         # Blog/News section
│   │   └── [locale]/                     # Multi-language routing
│   │
│   ├── 📂 components/                    # React components
│   │   ├── ui/                           # Basic UI components (from Shopco)
│   │   ├── layout/                       # Layout components (header, footer)
│   │   ├── sections/                     # Page sections (hero, features)
│   │   ├── forms/                        # Contact and lead forms
│   │   └── products/                     # Product showcase components
│   │
│   ├── 📂 lib/                           # Utilities and helpers
│   │   ├── api.ts                        # API integration functions
│   │   ├── constants.ts                  # App constants
│   │   ├── utils.ts                      # Utility functions
│   │   └── validations.ts                # Form validation schemas
│   │
│   ├── 📂 styles/                        # Styling
│   │   ├── globals.css                   # Global styles
│   │   └── components.css                # Component-specific styles
│   │
│   └── 📂 content/                       # Content management
│       ├── en/                           # English content
│       ├── hi/                           # Hindi content
│       ├── gu/                           # Gujarati content
│       └── mr/                           # Marathi content
│
├── 📂 public/                            # Static assets
│   ├── images/                           # Product images, logos
│   ├── icons/                            # Website icons
│   └── documents/                        # PDFs, brochures
│
└── 📂 tests/                             # Testing
    ├── __tests__/                        # Unit tests
    ├── e2e/                              # End-to-end tests
    └── fixtures/                         # Test data
```

### 2. 🛒 **B2C E-commerce** (`02-b2c-ecommerce/`)

**Purpose**: Consumer shopping website (shop.harshadelights.com)
**Technology**: Medusa Next.js Starter + Shopco UI + Redux Toolkit
**Priority**: Phase 2 - Revenue generation

```
02-b2c-ecommerce/
├── 📋 README.md                          # Project documentation
├── 📦 package.json                       # Dependencies (includes @medusajs/js-sdk)
├── ⚙️ next.config.js                     # Next.js + Medusa configuration
├── 🎨 tailwind.config.js                 # Tailwind CSS configuration
├── 📝 tsconfig.json                      # TypeScript configuration
├── 🔧 .env.local                         # Environment variables (Medusa backend URLs)
│
├── 📂 src/
│   ├── 📂 app/                           # Next.js App Router
│   │   ├── [countryCode]/                # Country-specific routing (from Medusa starter)
│   │   │   ├── (main)/                   # Main shopping pages
│   │   │   │   ├── page.tsx              # Product catalog
│   │   │   │   ├── products/             # Product pages
│   │   │   │   ├── cart/                 # Shopping cart
│   │   │   │   ├── account/              # Customer account
│   │   │   │   └── checkout/             # Checkout process
│   │   │   └── (checkout)/               # Checkout-specific layout
│   │   └── layout.tsx                    # Root layout
│   │
│   ├── 📂 lib/                           # Medusa integration
│   │   ├── data/                         # Data fetching (from Medusa starter)
│   │   │   ├── cart.ts                   # Cart operations
│   │   │   ├── products.ts               # Product operations
│   │   │   ├── customer.ts               # Customer operations
│   │   │   └── orders.ts                 # Order operations
│   │   ├── medusa.ts                     # Medusa client configuration
│   │   └── utils.ts                      # Utility functions
│   │
│   ├── 📂 modules/                       # Feature modules (from Medusa starter)
│   │   ├── layout/                       # Layout components (nav, footer)
│   │   ├── products/                     # Product-related components
│   │   ├── cart/                         # Cart functionality
│   │   ├── checkout/                     # Checkout process
│   │   ├── account/                      # Customer account
│   │   └── order/                        # Order management
│   │
│   ├── 📂 components/                    # Reusable components
│   │   ├── ui/                           # UI components (enhanced Shopco)
│   │   ├── forms/                        # Form components
│   │   └── common/                       # Common components
│   │
│   ├── 📂 store/                         # Redux store (from Shopco)
│   │   ├── slices/                       # Redux slices
│   │   ├── store.ts                      # Store configuration
│   │   └── middleware.ts                 # Custom middleware
│   │
│   └── 📂 types/                         # TypeScript types
│       ├── medusa.ts                     # Medusa-specific types
│       ├── global.ts                     # Global types
│       └── api.ts                        # API response types
│
└── 📂 tests/                             # Testing
    ├── __tests__/                        # Unit tests
    ├── integration/                      # Integration tests with Medusa
    └── e2e/                              # End-to-end shopping tests
```

### 3. 🏢 **B2B Portal** (`03-b2b-portal/`)

**Purpose**: Business customer portal (partners.harshadelights.com)
**Technology**: WorkOS B2B Starter + React-Admin + TypeScript
**Priority**: Phase 3 - Business scaling

```
03-b2b-portal/
├── 📋 README.md                          # Project documentation
├── 📦 package.json                       # Dependencies (WorkOS, React-Admin)
├── ⚙️ next.config.js                     # Next.js configuration
├── 🎨 tailwind.config.js                 # Tailwind + Radix UI configuration
├── 📝 tsconfig.json                      # TypeScript configuration
├── 🔧 .env.local                         # Environment variables (WorkOS keys)
│
├── 📂 src/
│   ├── 📂 app/                           # Next.js App Router
│   │   ├── layout.tsx                    # Root layout with WorkOS
│   │   ├── page.tsx                      # Dashboard home
│   │   ├── auth/                         # Authentication pages
│   │   ├── dashboard/                    # Main dashboard
│   │   │   ├── layout.tsx                # Dashboard layout
│   │   │   ├── page.tsx                  # Dashboard overview
│   │   │   ├── orders/                   # Order management
│   │   │   ├── products/                 # Product catalog
│   │   │   ├── account/                  # Account settings
│   │   │   ├── users/                    # User management
│   │   │   ├── analytics/                # Business analytics
│   │   │   └── settings/                 # Organization settings
│   │   └── api/                          # API routes
│   │
│   ├── 📂 components/                    # React components
│   │   ├── auth/                         # Authentication components (WorkOS)
│   │   ├── dashboard/                    # Dashboard components
│   │   ├── admin/                        # React-Admin components
│   │   ├── forms/                        # Business forms
│   │   ├── tables/                       # Data tables and grids
│   │   └── charts/                       # Analytics charts
│   │
│   ├── 📂 lib/                           # Utilities and integrations
│   │   ├── workos.ts                     # WorkOS configuration
│   │   ├── auth.ts                       # Authentication helpers
│   │   ├── api/                          # API integration
│   │   │   ├── customers.ts              # Customer API calls
│   │   │   ├── orders.ts                 # Order API calls
│   │   │   ├── pricing.ts                # Pricing API calls
│   │   │   └── analytics.ts              # Analytics API calls
│   │   └── utils.ts                      # Utility functions
│   │
│   ├── 📂 admin/                         # React-Admin setup
│   │   ├── dataProvider.ts               # Data provider for API Gateway
│   │   ├── authProvider.ts               # Auth provider for WorkOS
│   │   ├── resources/                    # Admin resources
│   │   └── components/                   # Custom admin components
│   │
│   └── 📂 types/                         # TypeScript types
│       ├── workos.ts                     # WorkOS types
│       ├── business.ts                   # Business domain types
│       └── api.ts                        # API types
│
└── 📂 tests/                             # Testing
    ├── __tests__/                        # Unit tests
    ├── integration/                      # Integration tests
    └── e2e/                              # End-to-end business workflows
```

### 4. 📱 **Mobile Customer App** (`04-mobile-customer/`)

**Purpose**: Customer mobile application
**Technology**: React Native + Expo (based on Enatega)
**Priority**: Phase 4 - Mobile engagement

```
04-mobile-customer/
├── 📋 README.md                          # Project documentation
├── 📦 package.json                       # Dependencies (React Native, Expo)
├── ⚙️ app.config.js                      # Expo configuration
├── 📝 tsconfig.json                      # TypeScript configuration
├── 🔧 .env                               # Environment variables
│
├── 📂 src/
│   ├── 📂 screens/                       # Screen components
│   │   ├── auth/                         # Authentication screens
│   │   ├── home/                         # Home and dashboard
│   │   ├── products/                     # Product browsing
│   │   ├── cart/                         # Shopping cart
│   │   ├── orders/                       # Order management
│   │   ├── account/                      # User account
│   │   └── notifications/                # Notifications
│   │
│   ├── 📂 components/                    # Reusable components
│   │   ├── ui/                           # Basic UI components
│   │   ├── forms/                        # Form components
│   │   ├── lists/                        # List components
│   │   └── common/                       # Common components
│   │
│   ├── 📂 navigation/                    # Navigation setup
│   │   ├── AppNavigator.tsx              # Main navigator
│   │   ├── AuthNavigator.tsx             # Auth navigator
│   │   └── TabNavigator.tsx              # Tab navigator
│   │
│   ├── 📂 services/                      # Services and API
│   │   ├── api.ts                        # API client
│   │   ├── auth.ts                       # Authentication service
│   │   ├── notifications.ts              # Push notifications
│   │   └── storage.ts                    # Local storage
│   │
│   ├── 📂 store/                         # State management
│   │   ├── slices/                       # Redux slices
│   │   ├── store.ts                      # Store configuration
│   │   └── middleware.ts                 # Middleware
│   │
│   └── 📂 utils/                         # Utilities
│       ├── constants.ts                  # App constants
│       ├── helpers.ts                    # Helper functions
│       └── validations.ts                # Validation schemas
│
└── 📂 assets/                            # Static assets
    ├── images/                           # Images and icons
    ├── fonts/                            # Custom fonts
    └── animations/                       # Lottie animations
```

### 5. 📱 **Mobile Sales App** (`05-mobile-sales/`)

**Purpose**: Sales team mobile application
**Technology**: Flutter (based on ClientFlow patterns)
**Priority**: Phase 4 - Sales team efficiency

```
05-mobile-sales/
├── 📋 README.md                          # Project documentation
├── 📦 pubspec.yaml                       # Flutter dependencies
├── ⚙️ analysis_options.yaml              # Dart analysis options
├── 🔧 .env                               # Environment variables
│
├── 📂 lib/
│   ├── main.dart                         # App entry point
│   ├── app.dart                          # App configuration
│   │
│   ├── 📂 screens/                       # Screen widgets
│   │   ├── auth/                         # Authentication screens
│   │   ├── dashboard/                    # Dashboard screens
│   │   ├── customers/                    # Customer management
│   │   ├── orders/                       # Order management
│   │   ├── analytics/                    # Sales analytics
│   │   └── settings/                     # Settings screens
│   │
│   ├── 📂 widgets/                       # Reusable widgets
│   │   ├── common/                       # Common widgets
│   │   ├── forms/                        # Form widgets
│   │   ├── charts/                       # Chart widgets
│   │   └── lists/                        # List widgets
│   │
│   ├── 📂 models/                        # Data models
│   │   ├── customer.dart                 # Customer model (from ClientFlow)
│   │   ├── order.dart                    # Order model
│   │   ├── product.dart                  # Product model
│   │   └── user.dart                     # User model
│   │
│   ├── 📂 services/                      # Services
│   │   ├── api_service.dart              # API client
│   │   ├── auth_service.dart             # Authentication
│   │   ├── storage_service.dart          # Local storage
│   │   └── notification_service.dart     # Notifications
│   │
│   ├── 📂 providers/                     # State management
│   │   ├── auth_provider.dart            # Authentication state
│   │   ├── customer_provider.dart        # Customer state
│   │   └── order_provider.dart           # Order state
│   │
│   └── 📂 utils/                         # Utilities
│       ├── constants.dart                # App constants
│       ├── helpers.dart                  # Helper functions
│       └── validators.dart               # Form validators
│
└── 📂 assets/                            # Assets
    ├── images/                           # Images
    ├── icons/                            # Icons
    └── fonts/                            # Fonts
```

### 6. 🔧 **Shared Components** (`shared/`)

**Purpose**: Common components and utilities across all applications
**Technology**: TypeScript + React components + Flutter widgets

```
shared/
├── 📋 README.md                          # Shared components documentation
│
├── 📂 react/                             # Shared React components
│   ├── 📦 package.json                   # React shared package
│   ├── 📂 src/
│   │   ├── components/                   # Reusable React components
│   │   │   ├── ui/                       # Basic UI components
│   │   │   ├── forms/                    # Form components
│   │   │   ├── layout/                   # Layout components
│   │   │   └── business/                 # Business-specific components
│   │   ├── hooks/                        # Custom React hooks
│   │   ├── utils/                        # Utility functions
│   │   ├── types/                        # Shared TypeScript types
│   │   └── constants/                    # Shared constants
│   └── 📂 dist/                          # Built components
│
├── 📂 flutter/                           # Shared Flutter widgets
│   ├── 📦 pubspec.yaml                   # Flutter shared package
│   ├── 📂 lib/
│   │   ├── widgets/                      # Reusable Flutter widgets
│   │   ├── models/                       # Shared data models
│   │   ├── services/                     # Shared services
│   │   └── utils/                        # Utility functions
│   └── 📂 build/                         # Built widgets
│
├── 📂 api/                               # API integration utilities
│   ├── types/                            # API type definitions
│   ├── clients/                          # API client configurations
│   └── schemas/                          # API request/response schemas
│
├── 📂 assets/                            # Shared assets
│   ├── images/                           # Common images
│   ├── icons/                            # Icon sets
│   ├── fonts/                            # Typography
│   └── branding/                         # Brand assets
│
└── 📂 config/                            # Shared configurations
    ├── eslint/                           # ESLint configurations
    ├── prettier/                         # Prettier configurations
    ├── typescript/                       # TypeScript configurations
    └── tailwind/                         # Tailwind CSS configurations
```

---

## 🔄 DEVELOPMENT WORKFLOW INTEGRATION

### Component Extraction Strategy

#### **Phase 1: Prepare Foundation**
1. **Extract from Shopco**: UI components, animations, responsive design patterns
2. **Extract from WorkOS**: Authentication flows, dashboard layouts, enterprise patterns
3. **Extract from Medusa Starter**: E-commerce components, cart logic, customer flows
4. **Extract from React-Admin**: Data grids, forms, admin interfaces
5. **Extract from Enatega**: Mobile navigation, order tracking, push notifications
6. **Extract from ClientFlow**: Flutter CRM patterns, customer models, analytics

#### **Phase 2: Create Shared Library**
1. **Standardize Components**: Create consistent design system
2. **Type Definitions**: Shared TypeScript interfaces and types
3. **API Integration**: Common API client and integration patterns
4. **Utilities**: Shared helper functions and constants

#### **Phase 3: Build Applications**
1. **Start with Public Website**: Foundation for all others
2. **Build B2C E-commerce**: Direct Medusa integration
3. **Develop B2B Portal**: Enterprise features and workflows
4. **Create Mobile Apps**: Customer and sales team applications

### Development Environment Setup

#### **Prerequisites Installation**
```bash
# Node.js and package managers
nvm install 18
npm install -g yarn pnpm

# Mobile development
npm install -g @expo/cli
# Flutter: Follow official installation guide

# Development tools
npm install -g typescript eslint prettier
```

#### **Project Initialization Script**
```bash
#!/bin/bash
# setup-frontend-development.sh

echo "🚀 Setting up Harsha Delights Frontend Development Environment"

# Navigate to project root
cd /Users/devji/harshadelights

# Create folder structure
mkdir -p frontend-applications/{01-public-website,02-b2c-ecommerce,03-b2b-portal,04-mobile-customer,05-mobile-sales,shared}

# Initialize shared components
cd frontend-applications/shared
npm init -y
cd ../..

# Copy reference projects for component extraction
echo "📚 Reference projects available in frontend-examples/"
echo "🎯 Ready to begin Phase 1: Public Website Development"
```

### Git Workflow Strategy

#### **Branch Structure**
```
main                           # Production-ready code
├── develop                    # Integration branch
├── feature/public-website     # Phase 1 development
├── feature/b2c-ecommerce     # Phase 2 development
├── feature/b2b-portal        # Phase 3 development
├── feature/mobile-apps       # Phase 4 development
└── hotfix/*                  # Production hotfixes
```

#### **Development Process**
1. **Feature Branch**: Create from `develop` for each application
2. **Component Extraction**: Create PRs for shared components first
3. **Application Development**: Build applications using shared components
4. **Code Review**: All code reviewed by Claude CLI before merge
5. **Integration Testing**: Test applications with backend services
6. **Deployment**: Merge to `main` for production deployment

---

## 📊 MONITORING & ANALYTICS

### Development Metrics

#### **Code Quality Tracking**
- **TypeScript Coverage**: 100% for new code
- **Test Coverage**: Minimum 80% for all applications
- **ESLint Compliance**: Zero warnings in production code
- **Performance Scores**: Lighthouse 90+ for all web applications

#### **Progress Tracking**
- **Feature Completion**: Percentage complete per application
- **Component Reuse**: Shared component adoption rate
- **Integration Success**: Backend API integration status
- **Quality Gates**: Pass/fail for each quality checkpoint

### Production Monitoring

#### **Performance Monitoring**
- **Core Web Vitals**: LCP, FID, CLS tracking
- **Real User Monitoring**: User experience metrics
- **Error Tracking**: Sentry integration for error monitoring
- **Uptime Monitoring**: Application availability tracking

#### **Business Metrics**
- **User Engagement**: Page views, session duration, conversion rates
- **Application Usage**: Feature adoption, user flows, drop-off points
- **Mobile Metrics**: App downloads, active users, retention rates
- **Business Impact**: Lead generation, order volume, revenue attribution

---

**Document Owner**: Claude CLI & DevJi
**Implementation Date**: September 20, 2025
**Review Schedule**: Weekly progress review, monthly structure assessment

---

*This folder structure provides a scalable, organized foundation for developing all 4 frontend applications while maintaining code quality and team efficiency.*