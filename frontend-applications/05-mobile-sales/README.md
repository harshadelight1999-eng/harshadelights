# Harsha Delights Sales Mobile App

A comprehensive Flutter mobile application designed for field sales teams to manage customers, process orders, track leads, and optimize delivery routes on-the-go.

## 🚀 Features

### 📱 **Core Functionality**
- **Customer Management**: Complete customer database with tier-based pricing
- **Order Processing**: Quick order creation with offline support
- **Lead Management**: Track and nurture potential customers
- **Sales Analytics**: Real-time performance dashboards
- **Route Optimization**: Efficient delivery route planning
- **Offline Sync**: Work without internet, sync when connected

### 🔐 **Authentication & Security**
- Secure login with JWT tokens
- Role-based access control
- Biometric authentication support
- Secure local data storage

### 📊 **Sales Features**
- Customer tier management (Gold, Silver, Bronze)
- Real-time pricing with discounts
- Order history and tracking
- Lead scoring and prioritization
- Sales target tracking
- Commission calculations

### 🗺️ **Location Features**
- GPS-based customer location tracking
- Route optimization for multiple stops
- Delivery tracking and updates
- Geofenced check-ins

## 🛠️ Tech Stack

- **Framework**: Flutter 3.24.3
- **State Management**: Riverpod
- **Navigation**: GoRouter
- **Local Database**: Hive + SQLite
- **HTTP Client**: Dio with Retrofit
- **Maps**: Google Maps Flutter
- **Notifications**: Firebase Cloud Messaging
- **Charts**: FL Chart + Syncfusion
- **Authentication**: JWT with secure storage

## 📁 Project Structure

```
lib/
├── core/                           # Core functionality
│   ├── config/                     # App configuration
│   ├── models/                     # Data models
│   ├── services/                   # Core services
│   ├── theme/                      # App theming
│   └── router/                     # Navigation setup
├── features/                       # Feature modules
│   ├── auth/                       # Authentication
│   ├── customers/                  # Customer management
│   ├── orders/                     # Order processing
│   ├── leads/                      # Lead management
│   ├── analytics/                  # Sales analytics
│   ├── route_planning/             # Route optimization
│   └── profile/                    # User profile
├── shared/                         # Shared components
│   ├── presentation/               # UI components
│   └── utils/                      # Utility functions
└── main.dart                       # App entry point
```

## 🚀 Getting Started

### Prerequisites

- Flutter SDK 3.24.3 or higher
- Dart SDK 3.0.0 or higher
- Android Studio / VS Code
- Firebase project setup
- Google Maps API key

### Installation

1. **Clone the repository:**
   ```bash
   cd frontend-applications/05-mobile-sales
   ```

2. **Install dependencies:**
   ```bash
   flutter pub get
   ```

3. **Generate code:**
   ```bash
   flutter packages pub run build_runner build
   ```

4. **Configure Firebase:**
   - Add `google-services.json` (Android)
   - Add `GoogleService-Info.plist` (iOS)

5. **Set up environment variables:**
   ```dart
   // lib/core/config/app_config.dart
   static const String baseApiUrl = 'YOUR_API_URL';
   static const String googleMapsApiKey = 'YOUR_MAPS_API_KEY';
   ```

6. **Run the app:**
   ```bash
   flutter run
   ```

## 📱 App Features

### Customer Management
- **Customer Database**: Complete customer profiles with contact info
- **Tier Management**: Gold, Silver, Bronze customer tiers
- **Credit Tracking**: Monitor credit limits and utilization
- **Location Mapping**: GPS coordinates for efficient routing
- **Order History**: Complete transaction history per customer

### Order Processing
- **Quick Order Entry**: Fast SKU-based ordering
- **Product Catalog**: Browse products with customer-specific pricing
- **Offline Orders**: Create orders without internet connection
- **Order Templates**: Save frequently ordered items
- **Real-time Validation**: Stock and pricing validation

### Lead Management
- **Lead Capture**: Quick lead entry with contact details
- **Lead Scoring**: Priority-based lead management
- **Follow-up Reminders**: Automated reminder notifications
- **Conversion Tracking**: Monitor lead-to-customer conversion
- **Activity Timeline**: Complete interaction history

### Sales Analytics
- **Performance Dashboard**: Real-time sales metrics
- **Target Tracking**: Monitor sales goals and achievements
- **Customer Analytics**: Customer behavior insights
- **Product Performance**: Top-selling products analysis
- **Territory Analysis**: Geographic sales performance

### Route Optimization
- **Multi-stop Planning**: Optimize routes for multiple customers
- **GPS Navigation**: Integrated turn-by-turn directions
- **Delivery Tracking**: Real-time delivery status updates
- **Time Estimation**: Accurate arrival time predictions
- **Route History**: Track completed routes and performance

## 🔧 Configuration

### API Integration

The app integrates with the existing Harsha Delights backend:

```dart
// Base API configuration
static const String baseApiUrl = 'http://localhost:3000/api/v1';
static const String b2bPortalUrl = 'http://localhost:3003';

// API endpoints
GET    /customers              # Get customer list
GET    /customers/:id          # Get customer details
POST   /orders                 # Create new order
GET    /orders                 # Get order list
GET    /products               # Get product catalog
POST   /leads                  # Create new lead
GET    /analytics/sales        # Get sales analytics
```

### Database Schema

Local SQLite database for offline functionality:

```sql
-- Customers table
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  tier TEXT NOT NULL,
  credit_limit REAL NOT NULL,
  credit_utilized REAL NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Orders table
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  total REAL NOT NULL,
  status TEXT NOT NULL,
  is_synced INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers (id)
);

-- Products table
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  base_price REAL NOT NULL,
  stock_quantity INTEGER NOT NULL,
  category TEXT NOT NULL
);
```

### Firebase Configuration

```json
{
  "project_info": {
    "project_id": "harsha-delights-sales",
    "project_number": "123456789"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:123456789:android:abcdef",
        "android_client_info": {
          "package_name": "com.harshadelights.sales"
        }
      }
    }
  ]
}
```

## 📊 Performance Metrics

### Key Performance Indicators
- **Order Processing Time**: < 30 seconds per order
- **Offline Sync Success**: > 99% sync rate
- **App Launch Time**: < 3 seconds cold start
- **Battery Usage**: < 5% per hour of active use
- **Data Usage**: < 10MB per day (excluding maps)

### Optimization Features
- **Lazy Loading**: Load data as needed
- **Image Caching**: Cache product images locally
- **Background Sync**: Sync data in background
- **Compression**: Compress API responses
- **Pagination**: Load data in chunks

## 🔒 Security Features

### Data Protection
- **Encryption**: AES-256 encryption for sensitive data
- **Secure Storage**: Flutter Secure Storage for tokens
- **Certificate Pinning**: Prevent man-in-the-middle attacks
- **Biometric Auth**: Fingerprint/Face ID support
- **Auto-logout**: Automatic session timeout

### Privacy Compliance
- **Data Minimization**: Collect only necessary data
- **User Consent**: Clear privacy policy acceptance
- **Data Retention**: Automatic data cleanup
- **Audit Logs**: Track data access and modifications

## 📱 Platform Support

### Android
- **Minimum SDK**: Android 6.0 (API 23)
- **Target SDK**: Android 14 (API 34)
- **Architecture**: ARM64, ARMv7
- **Features**: Background sync, push notifications

### iOS
- **Minimum Version**: iOS 12.0
- **Target Version**: iOS 17.0
- **Architecture**: ARM64
- **Features**: Background app refresh, push notifications

## 🚀 Deployment

### Development Build
```bash
flutter build apk --debug
flutter build ios --debug
```

### Production Build
```bash
flutter build apk --release
flutter build ios --release
```

### App Store Deployment
```bash
# iOS App Store
flutter build ipa --release
# Upload to App Store Connect

# Google Play Store
flutter build appbundle --release
# Upload to Google Play Console
```

## 🧪 Testing

### Unit Tests
```bash
flutter test
```

### Integration Tests
```bash
flutter test integration_test/
```

### Widget Tests
```bash
flutter test test/widget_test.dart
```

## 📈 Analytics & Monitoring

### Crash Reporting
- Firebase Crashlytics integration
- Automatic crash reporting
- Performance monitoring
- User session tracking

### Usage Analytics
- Screen view tracking
- Feature usage metrics
- User engagement analysis
- Performance bottleneck identification

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
- **Documentation**: Internal Wiki
- **Issues**: GitHub Issues
- **Email**: mobile-dev@harshadelights.com

---

**Built with ❤️ by Harsha Delights Mobile Development Team**
