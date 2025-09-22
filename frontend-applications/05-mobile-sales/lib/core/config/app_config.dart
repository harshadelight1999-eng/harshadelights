class AppConfig {
  static const String appName = 'Harsha Delights Sales';
  static const String appVersion = '1.0.0';
  
  // API Configuration
  static const String baseApiUrl = 'http://localhost:3000/api/v1';
  static const String b2bPortalUrl = 'http://localhost:3003';
  
  // Database Configuration
  static const String dbName = 'harsha_sales.db';
  static const int dbVersion = 1;
  
  // Sync Configuration
  static const Duration syncInterval = Duration(minutes: 15);
  static const Duration offlineTimeout = Duration(seconds: 30);
  
  // Location Configuration
  static const double locationAccuracy = 100.0; // meters
  static const Duration locationUpdateInterval = Duration(minutes: 5);
  
  // Notification Configuration
  static const String notificationChannelId = 'harsha_sales_notifications';
  static const String notificationChannelName = 'Sales Notifications';
  
  // Business Configuration
  static const List<String> customerTiers = ['Gold', 'Silver', 'Bronze'];
  static const Map<String, double> tierDiscounts = {
    'Gold': 0.10,
    'Silver': 0.07,
    'Bronze': 0.05,
  };
  
  // Order Configuration
  static const int maxOrderItems = 100;
  static const double minOrderValue = 500.0;
  
  // Route Optimization
  static const int maxStopsPerRoute = 20;
  static const double maxRouteDistance = 200.0; // kilometers
}
