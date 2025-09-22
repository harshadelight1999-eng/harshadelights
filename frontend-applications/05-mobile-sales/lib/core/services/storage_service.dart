import 'package:hive_flutter/hive_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/customer.dart';
import '../models/order.dart';
import '../models/product.dart';
import '../models/lead.dart';

class StorageService {
  static late Box<Customer> _customersBox;
  static late Box<Order> _ordersBox;
  static late Box<Product> _productsBox;
  static late Box<Lead> _leadsBox;
  static late SharedPreferences _prefs;

  static Future<void> init() async {
    // Register Hive adapters
    Hive.registerAdapter(CustomerAdapter());
    Hive.registerAdapter(AddressAdapter());
    Hive.registerAdapter(CustomerTierAdapter());
    Hive.registerAdapter(CustomerStatusAdapter());
    Hive.registerAdapter(OrderAdapter());
    Hive.registerAdapter(OrderItemAdapter());
    Hive.registerAdapter(OrderStatusAdapter());
    Hive.registerAdapter(ProductAdapter());
    Hive.registerAdapter(ProductWithPricingAdapter());
    Hive.registerAdapter(LeadAdapter());
    Hive.registerAdapter(LeadStatusAdapter());
    Hive.registerAdapter(LeadSourceAdapter());

    // Open boxes
    _customersBox = await Hive.openBox<Customer>('customers');
    _ordersBox = await Hive.openBox<Order>('orders');
    _productsBox = await Hive.openBox<Product>('products');
    _leadsBox = await Hive.openBox<Lead>('leads');

    // Initialize SharedPreferences
    _prefs = await SharedPreferences.getInstance();
  }

  // Customer operations
  static Future<void> saveCustomer(Customer customer) async {
    await _customersBox.put(customer.id, customer);
  }

  static Future<void> saveCustomers(List<Customer> customers) async {
    final Map<String, Customer> customerMap = {
      for (var customer in customers) customer.id: customer
    };
    await _customersBox.putAll(customerMap);
  }

  static Customer? getCustomer(String id) {
    return _customersBox.get(id);
  }

  static List<Customer> getAllCustomers() {
    return _customersBox.values.toList();
  }

  static Future<void> deleteCustomer(String id) async {
    await _customersBox.delete(id);
  }

  // Order operations
  static Future<void> saveOrder(Order order) async {
    await _ordersBox.put(order.id, order);
  }

  static Future<void> saveOrders(List<Order> orders) async {
    final Map<String, Order> orderMap = {
      for (var order in orders) order.id: order
    };
    await _ordersBox.putAll(orderMap);
  }

  static Order? getOrder(String id) {
    return _ordersBox.get(id);
  }

  static List<Order> getAllOrders() {
    return _ordersBox.values.toList();
  }

  static List<Order> getOfflineOrders() {
    return _ordersBox.values.where((order) => order.isOfflineOrder).toList();
  }

  static List<Order> getUnsyncedOrders() {
    return _ordersBox.values.where((order) => !order.isSynced).toList();
  }

  static Future<void> deleteOrder(String id) async {
    await _ordersBox.delete(id);
  }

  // Product operations
  static Future<void> saveProduct(Product product) async {
    await _productsBox.put(product.id, product);
  }

  static Future<void> saveProducts(List<Product> products) async {
    final Map<String, Product> productMap = {
      for (var product in products) product.id: product
    };
    await _productsBox.putAll(productMap);
  }

  static Product? getProduct(String id) {
    return _productsBox.get(id);
  }

  static Product? getProductBySku(String sku) {
    return _productsBox.values.firstWhere(
      (product) => product.sku == sku,
      orElse: () => throw Exception('Product not found'),
    );
  }

  static List<Product> getAllProducts() {
    return _productsBox.values.toList();
  }

  static List<Product> searchProducts(String query) {
    return _productsBox.values.where((product) =>
        product.name.toLowerCase().contains(query.toLowerCase()) ||
        product.sku.toLowerCase().contains(query.toLowerCase()) ||
        product.category.toLowerCase().contains(query.toLowerCase())
    ).toList();
  }

  static Future<void> deleteProduct(String id) async {
    await _productsBox.delete(id);
  }

  // Lead operations
  static Future<void> saveLead(Lead lead) async {
    await _leadsBox.put(lead.id, lead);
  }

  static Future<void> saveLeads(List<Lead> leads) async {
    final Map<String, Lead> leadMap = {
      for (var lead in leads) lead.id: lead
    };
    await _leadsBox.putAll(leadMap);
  }

  static Lead? getLead(String id) {
    return _leadsBox.get(id);
  }

  static List<Lead> getAllLeads() {
    return _leadsBox.values.toList();
  }

  static List<Lead> getOverdueLeads() {
    return _leadsBox.values.where((lead) => lead.isOverdue).toList();
  }

  static Future<void> deleteLead(String id) async {
    await _leadsBox.delete(id);
  }

  // SharedPreferences operations
  static Future<void> setString(String key, String value) async {
    await _prefs.setString(key, value);
  }

  static String? getString(String key) {
    return _prefs.getString(key);
  }

  static Future<void> setBool(String key, bool value) async {
    await _prefs.setBool(key, value);
  }

  static bool? getBool(String key) {
    return _prefs.getBool(key);
  }

  static Future<void> setInt(String key, int value) async {
    await _prefs.setInt(key, value);
  }

  static int? getInt(String key) {
    return _prefs.getInt(key);
  }

  static Future<void> setDouble(String key, double value) async {
    await _prefs.setDouble(key, value);
  }

  static double? getDouble(String key) {
    return _prefs.getDouble(key);
  }

  static Future<void> remove(String key) async {
    await _prefs.remove(key);
  }

  static Future<void> clear() async {
    await _prefs.clear();
  }

  // Sync status operations
  static Future<void> setLastSyncTime(DateTime time) async {
    await setString('last_sync_time', time.toIso8601String());
  }

  static DateTime? getLastSyncTime() {
    final timeString = getString('last_sync_time');
    return timeString != null ? DateTime.parse(timeString) : null;
  }

  static Future<void> setUserId(String userId) async {
    await setString('user_id', userId);
  }

  static String? getUserId() {
    return getString('user_id');
  }

  static Future<void> setAuthToken(String token) async {
    await setString('auth_token', token);
  }

  static String? getAuthToken() {
    return getString('auth_token');
  }

  // Clear all data
  static Future<void> clearAllData() async {
    await _customersBox.clear();
    await _ordersBox.clear();
    await _productsBox.clear();
    await _leadsBox.clear();
    await _prefs.clear();
  }
}
