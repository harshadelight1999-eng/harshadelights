import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import 'package:logger/logger.dart';

import '../config/app_config.dart';
import '../models/customer.dart';
import '../models/order.dart';
import '../models/product.dart';
import '../models/lead.dart';
import 'storage_service.dart';

part 'api_service.g.dart';

@RestApi(baseUrl: AppConfig.baseApiUrl)
abstract class ApiService {
  factory ApiService(Dio dio, {String baseUrl}) = _ApiService;

  // Authentication
  @POST('/auth/login')
  Future<AuthResponse> login(@Body() LoginRequest request);

  @POST('/auth/refresh')
  Future<AuthResponse> refreshToken(@Body() RefreshTokenRequest request);

  @POST('/auth/logout')
  Future<void> logout();

  // Customers
  @GET('/customers')
  Future<List<Customer>> getCustomers({
    @Query('page') int? page,
    @Query('limit') int? limit,
    @Query('search') String? search,
    @Query('tier') String? tier,
    @Query('status') String? status,
  });

  @GET('/customers/{id}')
  Future<Customer> getCustomer(@Path('id') String id);

  @POST('/customers')
  Future<Customer> createCustomer(@Body() Customer customer);

  @PUT('/customers/{id}')
  Future<Customer> updateCustomer(@Path('id') String id, @Body() Customer customer);

  // Products
  @GET('/products')
  Future<List<ProductWithPricing>> getProducts({
    @Query('page') int? page,
    @Query('limit') int? limit,
    @Query('search') String? search,
    @Query('category') String? category,
    @Query('customer_id') String? customerId,
  });

  @GET('/products/{id}')
  Future<ProductWithPricing> getProduct(@Path('id') String id);

  @GET('/products/sku/{sku}')
  Future<ProductWithPricing> getProductBySku(@Path('sku') String sku);

  // Orders
  @GET('/orders')
  Future<List<Order>> getOrders({
    @Query('page') int? page,
    @Query('limit') int? limit,
    @Query('status') String? status,
    @Query('customer_id') String? customerId,
  });

  @GET('/orders/{id}')
  Future<Order> getOrder(@Path('id') String id);

  @POST('/orders')
  Future<Order> createOrder(@Body() CreateOrderRequest request);

  @PUT('/orders/{id}')
  Future<Order> updateOrder(@Path('id') String id, @Body() UpdateOrderRequest request);

  @PUT('/orders/{id}/status')
  Future<Order> updateOrderStatus(@Path('id') String id, @Body() OrderStatusUpdate request);

  // Leads
  @GET('/leads')
  Future<List<Lead>> getLeads({
    @Query('page') int? page,
    @Query('limit') int? limit,
    @Query('status') String? status,
    @Query('priority') int? priority,
  });

  @GET('/leads/{id}')
  Future<Lead> getLead(@Path('id') String id);

  @POST('/leads')
  Future<Lead> createLead(@Body() Lead lead);

  @PUT('/leads/{id}')
  Future<Lead> updateLead(@Path('id') String id, @Body() Lead lead);

  @PUT('/leads/{id}/status')
  Future<Lead> updateLeadStatus(@Path('id') String id, @Body() LeadStatusUpdate request);

  // Analytics
  @GET('/analytics/dashboard')
  Future<DashboardAnalytics> getDashboardAnalytics();

  @GET('/analytics/sales')
  Future<SalesAnalytics> getSalesAnalytics({
    @Query('period') String? period,
    @Query('start_date') String? startDate,
    @Query('end_date') String? endDate,
  });

  // Sync
  @POST('/sync/upload')
  Future<SyncResponse> uploadOfflineData(@Body() OfflineSyncRequest request);

  @GET('/sync/download')
  Future<SyncDataResponse> downloadSyncData(@Query('last_sync') String? lastSync);
}

class ApiClient {
  static late ApiService _apiService;
  static final Logger _logger = Logger();

  static void init() {
    final dio = Dio();
    
    // Add interceptors
    dio.interceptors.add(_AuthInterceptor());
    dio.interceptors.add(_LoggingInterceptor());
    dio.interceptors.add(_ErrorInterceptor());
    
    _apiService = ApiService(dio);
  }

  static ApiService get instance => _apiService;
}

class _AuthInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final token = StorageService.getAuthToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      // Token expired, try to refresh
      try {
        final refreshToken = StorageService.getString('refresh_token');
        if (refreshToken != null) {
          final response = await _apiService.refreshToken(
            RefreshTokenRequest(refreshToken: refreshToken),
          );
          
          await StorageService.setString('auth_token', response.accessToken);
          if (response.refreshToken != null) {
            await StorageService.setString('refresh_token', response.refreshToken!);
          }
          
          // Retry the original request
          final opts = err.requestOptions;
          opts.headers['Authorization'] = 'Bearer ${response.accessToken}';
          final cloneReq = await Dio().fetch(opts);
          handler.resolve(cloneReq);
          return;
        }
      } catch (e) {
        // Refresh failed, redirect to login
        await StorageService.remove('auth_token');
        await StorageService.remove('refresh_token');
        // TODO: Navigate to login page
      }
    }
    handler.next(err);
  }
}

class _LoggingInterceptor extends Interceptor {
  final Logger _logger = Logger();

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    _logger.d('${options.method} ${options.uri}');
    if (options.data != null) {
      _logger.d('Request Data: ${options.data}');
    }
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    _logger.d('${response.statusCode} ${response.requestOptions.uri}');
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    _logger.e('${err.response?.statusCode} ${err.requestOptions.uri}');
    _logger.e('Error: ${err.message}');
    handler.next(err);
  }
}

class _ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    String message;
    
    switch (err.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        message = 'Connection timeout. Please check your internet connection.';
        break;
      case DioExceptionType.connectionError:
        message = 'No internet connection. Working in offline mode.';
        break;
      case DioExceptionType.badResponse:
        message = _handleHttpError(err.response?.statusCode);
        break;
      default:
        message = 'An unexpected error occurred. Please try again.';
    }
    
    final customError = DioException(
      requestOptions: err.requestOptions,
      response: err.response,
      type: err.type,
      error: message,
    );
    
    handler.next(customError);
  }

  String _handleHttpError(int? statusCode) {
    switch (statusCode) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication failed. Please login again.';
      case 403:
        return 'Access denied. You don\'t have permission.';
      case 404:
        return 'Resource not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}

// Request/Response models
class LoginRequest {
  final String email;
  final String password;
  final bool rememberMe;

  LoginRequest({
    required this.email,
    required this.password,
    this.rememberMe = false,
  });

  Map<String, dynamic> toJson() => {
    'email': email,
    'password': password,
    'remember_me': rememberMe,
  };
}

class AuthResponse {
  final String accessToken;
  final String? refreshToken;
  final String userId;
  final String userName;
  final String userEmail;

  AuthResponse({
    required this.accessToken,
    this.refreshToken,
    required this.userId,
    required this.userName,
    required this.userEmail,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) => AuthResponse(
    accessToken: json['access_token'],
    refreshToken: json['refresh_token'],
    userId: json['user_id'],
    userName: json['user_name'],
    userEmail: json['user_email'],
  );
}

class RefreshTokenRequest {
  final String refreshToken;

  RefreshTokenRequest({required this.refreshToken});

  Map<String, dynamic> toJson() => {'refresh_token': refreshToken};
}

class CreateOrderRequest {
  final String customerId;
  final List<OrderItem> items;
  final String? notes;
  final String? deliveryAddress;

  CreateOrderRequest({
    required this.customerId,
    required this.items,
    this.notes,
    this.deliveryAddress,
  });

  Map<String, dynamic> toJson() => {
    'customer_id': customerId,
    'items': items.map((item) => item.toJson()).toList(),
    'notes': notes,
    'delivery_address': deliveryAddress,
  };
}

class UpdateOrderRequest {
  final OrderStatus? status;
  final String? notes;
  final DateTime? deliveryDate;

  UpdateOrderRequest({
    this.status,
    this.notes,
    this.deliveryDate,
  });

  Map<String, dynamic> toJson() => {
    if (status != null) 'status': status!.name,
    if (notes != null) 'notes': notes,
    if (deliveryDate != null) 'delivery_date': deliveryDate!.toIso8601String(),
  };
}

class OrderStatusUpdate {
  final OrderStatus status;

  OrderStatusUpdate({required this.status});

  Map<String, dynamic> toJson() => {'status': status.name};
}

class LeadStatusUpdate {
  final LeadStatus status;

  LeadStatusUpdate({required this.status});

  Map<String, dynamic> toJson() => {'status': status.name};
}

class DashboardAnalytics {
  final String salesPersonName;
  final int todayOrders;
  final double todayRevenue;
  final int newLeads;
  final int customersVisited;
  final double ordersTrend;
  final double revenueTrend;
  final double leadsTrend;
  final double visitsTrend;
  final double monthlyRevenue;
  final double monthlyTarget;
  final int daysRemainingInMonth;
  final List<SalesDataPoint> weeklySales;
  final List<ActivityItem> recentActivities;

  DashboardAnalytics({
    required this.salesPersonName,
    required this.todayOrders,
    required this.todayRevenue,
    required this.newLeads,
    required this.customersVisited,
    required this.ordersTrend,
    required this.revenueTrend,
    required this.leadsTrend,
    required this.visitsTrend,
    required this.monthlyRevenue,
    required this.monthlyTarget,
    required this.daysRemainingInMonth,
    required this.weeklySales,
    required this.recentActivities,
  });

  factory DashboardAnalytics.fromJson(Map<String, dynamic> json) => DashboardAnalytics(
    salesPersonName: json['sales_person_name'],
    todayOrders: json['today_orders'],
    todayRevenue: json['today_revenue'].toDouble(),
    newLeads: json['new_leads'],
    customersVisited: json['customers_visited'],
    ordersTrend: json['orders_trend'].toDouble(),
    revenueTrend: json['revenue_trend'].toDouble(),
    leadsTrend: json['leads_trend'].toDouble(),
    visitsTrend: json['visits_trend'].toDouble(),
    monthlyRevenue: json['monthly_revenue'].toDouble(),
    monthlyTarget: json['monthly_target'].toDouble(),
    daysRemainingInMonth: json['days_remaining_in_month'],
    weeklySales: (json['weekly_sales'] as List)
        .map((item) => SalesDataPoint.fromJson(item))
        .toList(),
    recentActivities: (json['recent_activities'] as List)
        .map((item) => ActivityItem.fromJson(item))
        .toList(),
  );
}

class SalesDataPoint {
  final DateTime date;
  final double amount;

  SalesDataPoint({required this.date, required this.amount});

  factory SalesDataPoint.fromJson(Map<String, dynamic> json) => SalesDataPoint(
    date: DateTime.parse(json['date']),
    amount: json['amount'].toDouble(),
  );
}

class ActivityItem {
  final String id;
  final String type;
  final String title;
  final String description;
  final DateTime timestamp;

  ActivityItem({
    required this.id,
    required this.type,
    required this.title,
    required this.description,
    required this.timestamp,
  });

  factory ActivityItem.fromJson(Map<String, dynamic> json) => ActivityItem(
    id: json['id'],
    type: json['type'],
    title: json['title'],
    description: json['description'],
    timestamp: DateTime.parse(json['timestamp']),
  );
}

class SalesAnalytics {
  final double totalRevenue;
  final int totalOrders;
  final double averageOrderValue;
  final List<SalesDataPoint> salesTrend;

  SalesAnalytics({
    required this.totalRevenue,
    required this.totalOrders,
    required this.averageOrderValue,
    required this.salesTrend,
  });

  factory SalesAnalytics.fromJson(Map<String, dynamic> json) => SalesAnalytics(
    totalRevenue: json['total_revenue'].toDouble(),
    totalOrders: json['total_orders'],
    averageOrderValue: json['average_order_value'].toDouble(),
    salesTrend: (json['sales_trend'] as List)
        .map((item) => SalesDataPoint.fromJson(item))
        .toList(),
  );
}

class OfflineSyncRequest {
  final List<Order> orders;
  final List<Lead> leads;
  final List<Customer> customers;

  OfflineSyncRequest({
    required this.orders,
    required this.leads,
    required this.customers,
  });

  Map<String, dynamic> toJson() => {
    'orders': orders.map((order) => order.toJson()).toList(),
    'leads': leads.map((lead) => lead.toJson()).toList(),
    'customers': customers.map((customer) => customer.toJson()).toList(),
  };
}

class SyncResponse {
  final bool success;
  final String message;
  final List<String> syncedOrderIds;
  final List<String> syncedLeadIds;
  final List<String> syncedCustomerIds;

  SyncResponse({
    required this.success,
    required this.message,
    required this.syncedOrderIds,
    required this.syncedLeadIds,
    required this.syncedCustomerIds,
  });

  factory SyncResponse.fromJson(Map<String, dynamic> json) => SyncResponse(
    success: json['success'],
    message: json['message'],
    syncedOrderIds: List<String>.from(json['synced_order_ids']),
    syncedLeadIds: List<String>.from(json['synced_lead_ids']),
    syncedCustomerIds: List<String>.from(json['synced_customer_ids']),
  );
}

class SyncDataResponse {
  final List<Customer> customers;
  final List<Product> products;
  final List<Order> orders;
  final DateTime lastSync;

  SyncDataResponse({
    required this.customers,
    required this.products,
    required this.orders,
    required this.lastSync,
  });

  factory SyncDataResponse.fromJson(Map<String, dynamic> json) => SyncDataResponse(
    customers: (json['customers'] as List)
        .map((item) => Customer.fromJson(item))
        .toList(),
    products: (json['products'] as List)
        .map((item) => Product.fromJson(item))
        .toList(),
    orders: (json['orders'] as List)
        .map((item) => Order.fromJson(item))
        .toList(),
    lastSync: DateTime.parse(json['last_sync']),
  );
}
