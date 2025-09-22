# Harsha Delights B2B Portal

A comprehensive B2B customer portal built with Next.js, WorkOS authentication, and modern React components for wholesale ordering and account management.

## 🚀 Features

### Authentication & Organization Management
- **WorkOS Authentication**: Enterprise-grade authentication with SSO support
- **Multi-User Organizations**: Support for multiple users per organization
- **Role-Based Access Control**: Admin, purchaser, and viewer roles
- **Enterprise SSO**: Google Workspace, Microsoft Azure AD, Okta integration

### Product Management
- **Product Catalog**: Browse products with customer-specific pricing
- **Advanced Filters**: Filter by category, price range, and availability
- **Search Functionality**: Search by product name, SKU, or category
- **Real-time Pricing**: Dynamic pricing based on customer tier

### Ordering System
- **Quick Order by SKU**: Rapid ordering using product SKUs
- **CSV Upload**: Bulk order placement via CSV file upload
- **Order Templates**: Save and reuse order templates
- **Real-time Validation**: SKU validation and availability checking

### Account Management
- **Credit Management**: Credit limit tracking and utilization
- **Invoice Management**: Download invoices and track payments
- **Order History**: Comprehensive order tracking and status updates
- **Analytics Dashboard**: Purchase analytics and spending insights

### Customer Tiers
- **Gold Tier**: 10% discount, priority delivery, dedicated account manager
- **Silver Tier**: 7% discount, standard delivery, email support
- **Bronze Tier**: 5% discount, standard delivery, phone support

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Authentication**: WorkOS AuthKit
- **UI Components**: Radix UI + Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for analytics
- **CSV Processing**: PapaParse for bulk uploads
- **State Management**: Zustand
- **API**: REST API integration with existing backend

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── api/                      # API routes
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # Main dashboard
│   ├── products/                 # Product catalog
│   ├── orders/                   # Order management
│   ├── account/                  # Account management
│   └── quick-order/              # Quick ordering
├── components/                   # Reusable components
│   ├── ui/                       # UI component library
│   ├── layout/                   # Layout components
│   ├── products/                 # Product-specific components
│   ├── orders/                   # Order-specific components
│   └── auth/                     # Authentication components
├── lib/                          # Utility libraries
│   ├── auth.ts                   # Authentication utilities
│   ├── utils.ts                  # General utilities
│   └── validations/              # Form validations
└── types/                        # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager
- WorkOS account and API keys
- Existing backend API (Medusa.js, ERPNext, etc.)

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd frontend-applications/03-b2b-portal
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup:**
   ```bash
   cp .env.example .env.local
   ```

   Fill in the required environment variables:
   ```env
   # WorkOS Configuration
   WORKOS_CLIENT_ID=your_workos_client_id
   WORKOS_API_KEY=your_workos_api_key
   WORKOS_REDIRECT_URI=http://localhost:3003/auth/callback
   WORKOS_COOKIE_PASSWORD=your_secure_cookie_password_at_least_32_characters

   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
   NEXT_PUBLIC_MEDUSA_API_URL=http://localhost:7000

   # Application Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3003
   NEXT_PUBLIC_APP_NAME="Harsha Delights B2B Portal"
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3003`

## 🔧 Configuration

### WorkOS Setup

1. Create a WorkOS account at [workos.com](https://workos.com)
2. Create a new project and get your API keys
3. Configure redirect URIs in WorkOS dashboard
4. Set up organization and user management

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `WORKOS_CLIENT_ID` | WorkOS client ID | Yes |
| `WORKOS_API_KEY` | WorkOS API key | Yes |
| `WORKOS_REDIRECT_URI` | OAuth redirect URI | Yes |
| `WORKOS_COOKIE_PASSWORD` | Secure cookie password | Yes |
| `NEXT_PUBLIC_API_URL` | Backend API base URL | Yes |
| `NEXT_PUBLIC_MEDUSA_API_URL` | Medusa.js API URL | No |
| `NEXT_PUBLIC_APP_URL` | Application base URL | Yes |

## 📡 API Integration

### Backend Endpoints

The application expects the following API endpoints:

```
GET    /api/v1/products              # Get products with pricing
GET    /api/v1/products/:id          # Get product details
GET    /api/v1/orders                # Get user orders
POST   /api/v1/orders                # Create new order
GET    /api/v1/orders/:id            # Get order details
GET    /api/v1/account               # Get account information
GET    /api/v1/invoices              # Get invoices
GET    /api/v1/customers/pricing     # Get customer-specific pricing
```

### Authentication Headers

All API requests include the WorkOS JWT token:
```javascript
headers: {
  'Authorization': `Bearer ${workosToken}`,
  'Content-Type': 'application/json'
}
```

## 🎨 UI Components

The application uses a comprehensive UI component library:

### Core Components
- **Button**: Multiple variants and sizes
- **Card**: Content containers with headers
- **Input**: Form inputs with validation
- **Table**: Data tables with sorting and pagination
- **Modal/Dialog**: Overlay components
- **Toast**: Notification system

### Layout Components
- **Navbar**: Main navigation with user menu
- **Sidebar**: Filter and navigation panels
- **Footer**: Site footer with links

### Business Components
- **ProductGrid**: Product catalog display
- **OrderForm**: Order placement interface
- **Dashboard**: Analytics and overview
- **AccountSummary**: Account information display

## 🔐 Authentication Flow

1. **Sign In**: User clicks "Sign In" → Redirected to WorkOS
2. **Organization Selection**: User selects organization (if multiple)
3. **Callback**: WorkOS redirects back with JWT token
4. **User Creation**: User profile created/updated in database
5. **Dashboard**: User redirected to dashboard

## 📊 Analytics & Reporting

### Dashboard Metrics
- Total orders and spending
- Average order value
- Credit utilization
- Top products purchased
- Monthly spending trends

### Customer Insights
- Purchase patterns
- Product preferences
- Order frequency
- Seasonal trends

## 🚀 Deployment

### Vercel Deployment

1. **Connect Repository:**
   ```bash
   # Push code to GitHub/GitLab
   git add .
   git commit -m "Initial B2B portal setup"
   git push origin main
   ```

2. **Vercel Configuration:**
   ```json
   {
     "functions": {
       "src/app/api/**/*.ts": {
         "maxDuration": 30
       }
     },
     "env": {
       "WORKOS_CLIENT_ID": "@workos-client-id",
       "WORKOS_API_KEY": "@workos-api-key",
       "WORKOS_COOKIE_PASSWORD": "@workos-cookie-password"
     }
   }
   ```

3. **Environment Variables:**
   Set all required environment variables in Vercel dashboard

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3003
CMD ["npm", "start"]
```

## 🔍 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
npm run test         # Run tests
npm run format       # Format code with Prettier
```

### Code Quality

- **ESLint**: Configured for React/Next.js best practices
- **Prettier**: Code formatting
- **TypeScript**: Strict type checking
- **Husky**: Pre-commit hooks for quality checks

### Testing

```bash
npm run test           # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Ensure all tests pass
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- **Documentation**: [Internal Wiki]
- **Issues**: GitHub Issues
- **Email**: dev@harshadelights.com

## 🔄 Updates & Maintenance

### Regular Maintenance Tasks
- Update dependencies monthly
- Monitor WorkOS service status
- Review and update security policies
- Backup user data and configurations

### Version Updates
- Follow semantic versioning
- Document breaking changes
- Update migration guides
- Notify users of major updates

---

**Built with ❤️ by Harsha Delights Development Team**
