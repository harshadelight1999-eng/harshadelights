import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/services/api_service.dart';
import '../../../core/services/storage_service.dart';
import '../../../core/models/order.dart';
import '../../../core/models/customer.dart';
import '../../../core/models/product.dart';

// Orders State
class OrdersState {
  final List<Order> orders;
  final List<Order> filteredOrders;
  final bool isLoading;
  final String? error;
  final OrderStatus? selectedStatus;
  final DateTime? selectedDate;

  const OrdersState({
    this.orders = const [],
    this.filteredOrders = const [],
    this.isLoading = false,
    this.error,
    this.selectedStatus,
    this.selectedDate,
  });

  OrdersState copyWith({
    List<Order>? orders,
    List<Order>? filteredOrders,
    bool? isLoading,
    String? error,
    OrderStatus? selectedStatus,
    DateTime? selectedDate,
  }) {
    return OrdersState(
      orders: orders ?? this.orders,
      filteredOrders: filteredOrders ?? this.filteredOrders,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      selectedStatus: selectedStatus ?? this.selectedStatus,
      selectedDate: selectedDate ?? this.selectedDate,
    );
  }
}

// Order Creation State
class OrderCreationState {
  final Customer? selectedCustomer;
  final List<OrderItem> items;
  final String? deliveryAddress;
  final DateTime? deliveryDate;
  final String? notes;
  final bool isLoading;
  final String? error;

  const OrderCreationState({
    this.selectedCustomer,
    this.items = const [],
    this.deliveryAddress,
    this.deliveryDate,
    this.notes,
    this.isLoading = false,
    this.error,
  });

  OrderCreationState copyWith({
    Customer? selectedCustomer,
    List<OrderItem>? items,
    String? deliveryAddress,
    DateTime? deliveryDate,
    String? notes,
    bool? isLoading,
    String? error,
  }) {
    return OrderCreationState(
      selectedCustomer: selectedCustomer ?? this.selectedCustomer,
      items: items ?? this.items,
      deliveryAddress: deliveryAddress ?? this.deliveryAddress,
      deliveryDate: deliveryDate ?? this.deliveryDate,
      notes: notes ?? this.notes,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }

  double get totalAmount {
    return items.fold(0.0, (sum, item) => sum + item.totalPrice);
  }

  int get totalItems {
    return items.fold(0, (sum, item) => sum + item.quantity);
  }
}

// Orders Notifier
class OrdersNotifier extends StateNotifier<OrdersState> {
  final ApiService _apiService;
  final StorageService _storageService;

  OrdersNotifier(this._apiService, this._storageService) : super(const OrdersState()) {
    loadOrders();
  }

  Future<void> loadOrders() async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      // Load from local storage first
      final localOrders = await _storageService.getAllOrders();
      state = state.copyWith(orders: localOrders);
      _applyFilters();

      // Then sync with server
      final serverOrders = await _apiService.getOrders();
      await _storageService.saveOrders(serverOrders);
      
      state = state.copyWith(
        orders: serverOrders,
        isLoading: false,
      );
      _applyFilters();
    } catch (e) {
      state = state.copyWith(
        error: e.toString(),
        isLoading: false,
      );
    }
  }

  void filterByStatus(OrderStatus? status) {
    state = state.copyWith(selectedStatus: status);
    _applyFilters();
  }

  void filterByDate(DateTime? date) {
    state = state.copyWith(selectedDate: date);
    _applyFilters();
  }

  void _applyFilters() {
    var filtered = List<Order>.from(state.orders);

    // Apply status filter
    if (state.selectedStatus != null) {
      filtered = filtered.where((order) => order.status == state.selectedStatus).toList();
    }

    // Apply date filter
    if (state.selectedDate != null) {
      filtered = filtered.where((order) {
        return order.createdAt.year == state.selectedDate!.year &&
               order.createdAt.month == state.selectedDate!.month &&
               order.createdAt.day == state.selectedDate!.day;
      }).toList();
    }

    state = state.copyWith(filteredOrders: filtered);
  }
}

// Order Creation Notifier
class OrderCreationNotifier extends StateNotifier<OrderCreationState> {
  final ApiService _apiService;
  final StorageService _storageService;

  OrderCreationNotifier(this._apiService, this._storageService) : super(const OrderCreationState());

  void selectCustomer(Customer customer) {
    state = state.copyWith(selectedCustomer: customer);
  }

  void addItem(Product product, int quantity) {
    final existingIndex = state.items.indexWhere((item) => item.productId == product.id);
    
    if (existingIndex >= 0) {
      // Update existing item
      final updatedItems = List<OrderItem>.from(state.items);
      updatedItems[existingIndex] = updatedItems[existingIndex].copyWith(
        quantity: updatedItems[existingIndex].quantity + quantity,
      );
      state = state.copyWith(items: updatedItems);
    } else {
      // Add new item
      final newItem = OrderItem(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        productId: product.id,
        productName: product.name,
        quantity: quantity,
        unitPrice: product.price,
        totalPrice: product.price * quantity,
      );
      state = state.copyWith(items: [...state.items, newItem]);
    }
  }

  void updateItemQuantity(String itemId, int quantity) {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    final updatedItems = state.items.map((item) {
      if (item.id == itemId) {
        return item.copyWith(
          quantity: quantity,
          totalPrice: item.unitPrice * quantity,
        );
      }
      return item;
    }).toList();

    state = state.copyWith(items: updatedItems);
  }

  void removeItem(String itemId) {
    final updatedItems = state.items.where((item) => item.id != itemId).toList();
    state = state.copyWith(items: updatedItems);
  }

  void setDeliveryInfo(String address, DateTime date) {
    state = state.copyWith(
      deliveryAddress: address,
      deliveryDate: date,
    );
  }

  void setNotes(String notes) {
    state = state.copyWith(notes: notes);
  }

  Future<bool> submitOrder() async {
    if (state.selectedCustomer == null || state.items.isEmpty) {
      state = state.copyWith(error: 'Please select customer and add items');
      return false;
    }

    state = state.copyWith(isLoading: true, error: null);

    try {
      final order = Order(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        customerId: state.selectedCustomer!.id,
        customerName: state.selectedCustomer!.name,
        items: state.items,
        totalAmount: state.totalAmount,
        status: OrderStatus.pending,
        createdAt: DateTime.now(),
        deliveryAddress: state.deliveryAddress ?? state.selectedCustomer!.address.fullAddress,
        deliveryDate: state.deliveryDate,
        notes: state.notes,
      );

      await _apiService.createOrder(order);
      await _storageService.saveOrder(order);

      // Reset state
      state = const OrderCreationState();
      return true;
    } catch (e) {
      state = state.copyWith(
        error: e.toString(),
        isLoading: false,
      );
      return false;
    }
  }

  Future<bool> saveDraft() async {
    if (state.selectedCustomer == null || state.items.isEmpty) {
      state = state.copyWith(error: 'Please select customer and add items');
      return false;
    }

    try {
      final order = Order(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        customerId: state.selectedCustomer!.id,
        customerName: state.selectedCustomer!.name,
        items: state.items,
        totalAmount: state.totalAmount,
        status: OrderStatus.draft,
        createdAt: DateTime.now(),
        deliveryAddress: state.deliveryAddress ?? state.selectedCustomer!.address.fullAddress,
        deliveryDate: state.deliveryDate,
        notes: state.notes,
      );

      await _storageService.saveOrder(order);
      
      // Reset state
      state = const OrderCreationState();
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }

  void clearOrder() {
    state = const OrderCreationState();
  }
}

// Providers
final ordersProvider = StateNotifierProvider<OrdersNotifier, OrdersState>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  final storageService = ref.watch(storageServiceProvider);
  return OrdersNotifier(apiService, storageService);
});

final orderCreationProvider = StateNotifierProvider<OrderCreationNotifier, OrderCreationState>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  final storageService = ref.watch(storageServiceProvider);
  return OrderCreationNotifier(apiService, storageService);
});
