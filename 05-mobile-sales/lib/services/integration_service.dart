import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:web_socket_channel/io.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../features/crm/models/customer_model.dart';
import '../features/orders/models/order_model.dart';
import '../features/products/models/product_model.dart';
import 'storage_service.dart';
import 'auth_service.dart';

class IntegrationService {
  static const String _baseUrl = 'http://localhost:4000';
  static const String _wsUrl = 'ws://localhost:4000/ws';
  
  WebSocketChannel? _channel;
  StreamController<Map<String, dynamic>>? _messageController;
  Timer? _heartbeatTimer;
  Timer? _reconnectTimer;
  bool _isConnected = false;
  int _reconnectAttempts = 0;
  static const int _maxReconnectAttempts = 5;

  final StorageService _storage = StorageService();
  final AuthService _auth = AuthService();

  // Singleton pattern
  static final IntegrationService _instance = IntegrationService._internal();
  factory IntegrationService() => _instance;
  IntegrationService._internal();

  Stream<Map<String, dynamic>> get messageStream => 
      _messageController?.stream ?? const Stream.empty();

  bool get isConnected => _isConnected;

  Future<void> initialize() async {
    _messageController = StreamController<Map<String, dynamic>>.broadcast();
    await _connectWebSocket();
    _startHeartbeat();
  }

  Future<void> _connectWebSocket() async {
    try {
      if (_channel != null) {
        await _channel!.sink.close();
      }

      _channel = IOWebSocketChannel.connect(
        Uri.parse(_wsUrl),
        headers: await _getAuthHeaders(),
      );

      _channel!.stream.listen(
        _handleMessage,
        onError: _handleError,
        onDone: _handleDisconnection,
      );

      _isConnected = true;
      _reconnectAttempts = 0;
      
      // Subscribe to relevant channels
      await _subscribeToChannels([
        'customer-updates',
        'order-updates',
        'inventory-updates',
        'territory-updates',
        'all'
      ]);

      print('WebSocket connected successfully');
    } catch (e) {
      print('WebSocket connection failed: $e');
      _scheduleReconnect();
    }
  }

  void _handleMessage(dynamic message) {
    try {
      final data = json.decode(message.toString());
      _messageController?.add(data);
      
      // Handle specific message types
      switch (data['type']) {
        case 'connection-established':
          print('Connection established: ${data['clientId']}');
          break;
        case 'sync-update':
          _handleSyncUpdate(data);
          break;
        case 'pong':
          // Heartbeat response received
          break;
        default:
          print('Received message: ${data['type']}');
      }
    } catch (e) {
      print('Error handling message: $e');
    }
  }

  void _handleError(error) {
    print('WebSocket error: $error');
    _isConnected = false;
    _scheduleReconnect();
  }

  void _handleDisconnection() {
    print('WebSocket disconnected');
    _isConnected = false;
    _scheduleReconnect();
  }

  void _scheduleReconnect() {
    if (_reconnectAttempts >= _maxReconnectAttempts) {
      print('Max reconnection attempts reached');
      return;
    }

    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(
      Duration(seconds: 2 * (_reconnectAttempts + 1)), // Exponential backoff
      () {
        _reconnectAttempts++;
        _connectWebSocket();
      },
    );
  }

  Future<void> _subscribeToChannels(List<String> channels) async {
    if (!_isConnected || _channel == null) return;

    final message = {
      'type': 'subscribe',
      'channels': channels,
    };

    _channel!.sink.add(json.encode(message));
  }

  void _handleSyncUpdate(Map<String, dynamic> data) async {
    final eventType = data['eventType'] as String;
    final eventData = data['data'];
    final source = data['source'] as String;

    // Don't process events from our own app
    if (source == 'flutter-app') return;

    switch (eventType) {
      case 'customer.updated':
        await _handleCustomerUpdate(eventData);
        break;
      case 'order.updated':
        await _handleOrderUpdate(eventData);
        break;
      case 'inventory.updated':
        await _handleInventoryUpdate(eventData);
        break;
      case 'territory.updated':
        await _handleTerritoryUpdate(eventData);
        break;
    }
  }

  Future<void> _handleCustomerUpdate(Map<String, dynamic> data) async {
    try {
      final customer = Customer.fromJson(data);
      await _storage.saveCustomer(customer);
      print('Customer updated: ${customer.name}');
    } catch (e) {
      print('Error handling customer update: $e');
    }
  }

  Future<void> _handleOrderUpdate(Map<String, dynamic> data) async {
    try {
      // Handle order updates from other systems
      print('Order updated: ${data['id']}');
    } catch (e) {
      print('Error handling order update: $e');
    }
  }

  Future<void> _handleInventoryUpdate(Map<String, dynamic> data) async {
    try {
      // Update local product inventory
      final productId = data['productId'] as String;
      final quantity = data['quantity'] as int;
      
      // Update local storage
      await _storage.updateProductInventory(productId, quantity);
      print('Inventory updated for product: $productId');
    } catch (e) {
      print('Error handling inventory update: $e');
    }
  }

  Future<void> _handleTerritoryUpdate(Map<String, dynamic> data) async {
    try {
      // Handle territory updates
      print('Territory updated: ${data['id']}');
    } catch (e) {
      print('Error handling territory update: $e');
    }
  }

  void _startHeartbeat() {
    _heartbeatTimer?.cancel();
    _heartbeatTimer = Timer.periodic(Duration(seconds: 30), (timer) {
      if (_isConnected && _channel != null) {
        _channel!.sink.add(json.encode({'type': 'ping'}));
      }
    });
  }

  // Public API methods for sending events
  Future<void> broadcastCustomerUpdate(Customer customer) async {
    await _sendSyncEvent('customer.updated', customer.toJson());
  }

  Future<void> broadcastOrderCreated(Map<String, dynamic> order) async {
    await _sendSyncEvent('order.created', order);
  }

  Future<void> broadcastOrderUpdated(Map<String, dynamic> order) async {
    await _sendSyncEvent('order.updated', order);
  }

  Future<void> _sendSyncEvent(String eventType, Map<String, dynamic> data) async {
    if (!_isConnected || _channel == null) {
      print('Cannot send sync event: not connected');
      return;
    }

    final message = {
      'type': 'sync-event',
      'eventType': eventType,
      'data': data,
      'priority': 'medium',
      'targets': ['all'],
    };

    _channel!.sink.add(json.encode(message));
  }

  // HTTP API methods for direct integration calls
  Future<List<Customer>> syncCustomersFromB2B() async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/api/integration/customers'),
        headers: await _getAuthHeaders(),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final customers = (data['customers'] as List)
            .map((json) => Customer.fromJson(json))
            .toList();
        
        // Store locally
        for (final customer in customers) {
          await _storage.saveCustomer(customer);
        }
        
        return customers;
      }
    } catch (e) {
      print('Error syncing customers from B2B: $e');
    }
    return [];
  }

  Future<List<Product>> syncProductsFromB2B() async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/api/integration/products'),
        headers: await _getAuthHeaders(),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final products = (data['products'] as List)
            .map((json) => Product.fromJson(json))
            .toList();
        
        // Store locally
        for (final product in products) {
          await _storage.saveProduct(product);
        }
        
        return products;
      }
    } catch (e) {
      print('Error syncing products from B2B: $e');
    }
    return [];
  }

  Future<bool> syncOrderToB2B(Map<String, dynamic> order) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/api/integration/orders'),
        headers: await _getAuthHeaders(),
        body: json.encode(order),
      );

      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      print('Error syncing order to B2B: $e');
      return false;
    }
  }

  Future<Map<String, String>> _getAuthHeaders() async {
    final token = await _auth.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
      'User-Agent': 'Flutter-SalesApp/1.0',
    };
  }

  Future<Map<String, dynamic>?> getIntegrationStatus() async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/api/integration/status'),
        headers: await _getAuthHeaders(),
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
    } catch (e) {
      print('Error getting integration status: $e');
    }
    return null;
  }

  Future<void> performFullSync() async {
    print('Starting full sync...');
    
    try {
      // Sync customers
      await syncCustomersFromB2B();
      
      // Sync products
      await syncProductsFromB2B();
      
      // Sync pending orders
      final pendingOrders = await _storage.getPendingOrders();
      for (final order in pendingOrders) {
        final success = await syncOrderToB2B(order);
        if (success) {
          await _storage.markOrderAsSynced(order['id']);
        }
      }
      
      print('Full sync completed');
    } catch (e) {
      print('Error during full sync: $e');
    }
  }

  void dispose() {
    _heartbeatTimer?.cancel();
    _reconnectTimer?.cancel();
    _channel?.sink.close();
    _messageController?.close();
    _isConnected = false;
  }
}

// Riverpod provider
final integrationServiceProvider = Provider<IntegrationService>((ref) {
  return IntegrationService();
});
