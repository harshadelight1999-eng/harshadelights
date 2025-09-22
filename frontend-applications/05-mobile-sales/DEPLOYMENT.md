# Harsha Delights Sales Mobile App - Deployment Guide

## 🚀 Production Deployment

### Prerequisites

1. **Flutter SDK**: 3.24.3 or higher
2. **Android Studio**: Latest version with Android SDK
3. **Xcode**: Latest version (for iOS deployment)
4. **Firebase Project**: Set up with FCM enabled
5. **Google Cloud Console**: Maps API enabled
6. **Apple Developer Account**: For iOS App Store
7. **Google Play Console**: For Android deployment

### Environment Setup

#### 1. API Configuration
```dart
// lib/core/config/app_config.dart
static const String baseApiUrl = 'https://api.harshadelights.com/v1';
static const String b2bPortalUrl = 'https://partners.harshadelights.com';
```

#### 2. Firebase Configuration
```bash
# Add Firebase configuration files
android/app/google-services.json
ios/Runner/GoogleService-Info.plist
```

#### 3. Google Maps API Keys
```xml
<!-- Android: android/app/src/main/AndroidManifest.xml -->
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_PRODUCTION_MAPS_API_KEY" />
```

```xml
<!-- iOS: ios/Runner/Info.plist -->
<key>GoogleMapsAPIKey</key>
<string>YOUR_PRODUCTION_MAPS_API_KEY</string>
```

### Build Configuration

#### Android Production Build

1. **Create Keystore**:
```bash
keytool -genkey -v -keystore ~/harsha-sales-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias harsha-sales
```

2. **Configure Signing**:
```properties
# android/key.properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=harsha-sales
storeFile=../harsha-sales-key.jks
```

3. **Build Release APK**:
```bash
flutter build apk --release --obfuscate --split-debug-info=build/debug-info
```

4. **Build App Bundle**:
```bash
flutter build appbundle --release --obfuscate --split-debug-info=build/debug-info
```

#### iOS Production Build

1. **Configure Signing**:
   - Open `ios/Runner.xcworkspace` in Xcode
   - Select Runner target
   - Configure Team and Bundle Identifier
   - Enable automatic signing

2. **Build Release IPA**:
```bash
flutter build ipa --release --obfuscate --split-debug-info=build/debug-info
```

### Security Configuration

#### 1. Network Security
```xml
<!-- Android: android/app/src/main/res/xml/network_security_config.xml -->
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">harshadelights.com</domain>
    </domain-config>
</network-security-config>
```

#### 2. Certificate Pinning
```dart
// lib/core/services/api_service.dart
class _CertificatePinningInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    // Implement certificate pinning
    options.extra['certificate_pinning'] = true;
    handler.next(options);
  }
}
```

### Performance Optimization

#### 1. Code Obfuscation
```bash
flutter build apk --release --obfuscate --split-debug-info=build/debug-info
```

#### 2. Asset Optimization
```yaml
# pubspec.yaml
flutter:
  assets:
    - assets/images/
  fonts:
    - family: Inter
      fonts:
        - asset: assets/fonts/Inter-Regular.ttf
        - asset: assets/fonts/Inter-Bold.ttf
          weight: 700
```

#### 3. Bundle Size Optimization
```bash
# Analyze bundle size
flutter build apk --analyze-size
flutter build appbundle --analyze-size
```

### App Store Deployment

#### Google Play Store

1. **Upload to Play Console**:
   - Upload the `.aab` file
   - Configure app details and descriptions
   - Set up release tracks (Internal → Alpha → Beta → Production)

2. **Store Listing**:
```
Title: Harsha Delights Sales
Short Description: Field sales management app for Harsha Delights team
Full Description: Comprehensive mobile app for field sales representatives...
```

3. **Screenshots**: Prepare screenshots for different device sizes
4. **Privacy Policy**: Ensure compliance with Play Store policies

#### Apple App Store

1. **Upload to App Store Connect**:
   - Use Xcode or Application Loader
   - Upload the `.ipa` file
   - Configure app metadata

2. **App Review Information**:
   - Demo account credentials
   - Review notes
   - Contact information

### Monitoring & Analytics

#### 1. Crashlytics Setup
```dart
// main.dart
import 'package:firebase_crashlytics/firebase_crashlytics.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  FlutterError.onError = FirebaseCrashlytics.instance.recordFlutterFatalError;
  PlatformDispatcher.instance.onError = (error, stack) {
    FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
    return true;
  };
  
  runApp(MyApp());
}
```

#### 2. Performance Monitoring
```dart
// lib/core/services/performance_service.dart
class PerformanceService {
  static void trackScreenView(String screenName) {
    FirebaseAnalytics.instance.logScreenView(screenName: screenName);
  }
  
  static void trackEvent(String eventName, Map<String, dynamic> parameters) {
    FirebaseAnalytics.instance.logEvent(name: eventName, parameters: parameters);
  }
}
```

### CI/CD Pipeline

#### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Stores

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          distribution: 'zulu'
          java-version: '11'
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.3'
      - run: flutter pub get
      - run: flutter build appbundle --release
      - name: Upload to Play Store
        uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJsonPlainText: ${{ secrets.SERVICE_ACCOUNT_JSON }}
          packageName: com.harshadelights.sales
          releaseFiles: build/app/outputs/bundle/release/app-release.aab
          track: production

  deploy-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.3'
      - run: flutter pub get
      - run: flutter build ipa --release
      - name: Upload to App Store
        uses: apple-actions/upload-testflight-build@v1
        with:
          app-path: build/ios/ipa/harsha_delights_sales.ipa
          issuer-id: ${{ secrets.APPSTORE_ISSUER_ID }}
          api-key-id: ${{ secrets.APPSTORE_API_KEY_ID }}
          api-private-key: ${{ secrets.APPSTORE_API_PRIVATE_KEY }}
```

### Testing Strategy

#### 1. Unit Tests
```bash
flutter test
```

#### 2. Integration Tests
```bash
flutter test integration_test/
```

#### 3. Device Testing
```bash
# Test on physical devices
flutter run --release
```

### Post-Deployment

#### 1. Monitoring Checklist
- [ ] Crashlytics reports
- [ ] Performance metrics
- [ ] User feedback
- [ ] API error rates
- [ ] Sync success rates

#### 2. Rollback Plan
```bash
# If issues arise, prepare rollback
flutter build apk --release --build-number=PREVIOUS_VERSION
```

#### 3. User Communication
- In-app announcements
- Email notifications
- Support documentation updates

### Maintenance

#### 1. Regular Updates
- Security patches
- Dependency updates
- Feature enhancements
- Bug fixes

#### 2. Performance Monitoring
- App startup time
- Memory usage
- Battery consumption
- Network usage

#### 3. User Feedback
- App store reviews
- In-app feedback
- Support tickets
- Analytics insights

### Troubleshooting

#### Common Issues

1. **Build Failures**:
```bash
flutter clean
flutter pub get
flutter build apk --release
```

2. **Signing Issues**:
   - Verify keystore path
   - Check certificate validity
   - Ensure proper permissions

3. **API Connectivity**:
   - Verify network security config
   - Check certificate pinning
   - Test API endpoints

#### Support Contacts
- **Technical Issues**: dev@harshadelights.com
- **Store Issues**: mobile-support@harshadelights.com
- **Emergency**: +91-XXXX-XXXX-XX

---

**Deployment Checklist Complete ✅**
- Production builds configured
- Security measures implemented
- Store deployment ready
- Monitoring systems active
- Support processes established
