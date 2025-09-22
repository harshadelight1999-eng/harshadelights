import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/services/api_service.dart';
import '../../../core/services/storage_service.dart';
import '../../../core/models/customer.dart';

// Customers State
class CustomersState {
  final List<Customer> customers;
  final List<Customer> filteredCustomers;
  final bool isLoading;
  final String? error;
  final String searchQuery;
  final CustomerTier? selectedTier;
  final CustomerStatus? selectedStatus;

  const CustomersState({
    this.customers = const [],
    this.filteredCustomers = const [],
    this.isLoading = false,
    this.error,
    this.searchQuery = '',
    this.selectedTier,
    this.selectedStatus,
  });

  CustomersState copyWith({
    List<Customer>? customers,
    List<Customer>? filteredCustomers,
    bool? isLoading,
    String? error,
    String? searchQuery,
    CustomerTier? selectedTier,
    CustomerStatus? selectedStatus,
  }) {
    return CustomersState(
      customers: customers ?? this.customers,
      filteredCustomers: filteredCustomers ?? this.filteredCustomers,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      searchQuery: searchQuery ?? this.searchQuery,
      selectedTier: selectedTier ?? this.selectedTier,
      selectedStatus: selectedStatus ?? this.selectedStatus,
    );
  }
}

// Customers Notifier
class CustomersNotifier extends StateNotifier<CustomersState> {
  final ApiService _apiService;
  final StorageService _storageService;

  CustomersNotifier(this._apiService, this._storageService) : super(const CustomersState()) {
    loadCustomers();
  }

  Future<void> loadCustomers() async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      // Load from local storage first
      final localCustomers = await _storageService.getAllCustomers();
      state = state.copyWith(customers: localCustomers);
      _applyFilters();

      // Then sync with server
      final serverCustomers = await _apiService.getCustomers();
      await _storageService.saveCustomers(serverCustomers);
      
      state = state.copyWith(
        customers: serverCustomers,
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

  void searchCustomers(String query) {
    state = state.copyWith(searchQuery: query);
    _applyFilters();
  }

  void filterByTier(CustomerTier? tier) {
    state = state.copyWith(selectedTier: tier);
    _applyFilters();
  }

  void filterByStatus(CustomerStatus? status) {
    state = state.copyWith(selectedStatus: status);
    _applyFilters();
  }

  void clearFilters() {
    state = state.copyWith(
      searchQuery: '',
      selectedTier: null,
      selectedStatus: null,
    );
    _applyFilters();
  }

  void _applyFilters() {
    var filtered = List<Customer>.from(state.customers);

    // Apply search filter
    if (state.searchQuery.isNotEmpty) {
      filtered = filtered.where((customer) {
        return customer.name.toLowerCase().contains(state.searchQuery.toLowerCase()) ||
               customer.email.toLowerCase().contains(state.searchQuery.toLowerCase()) ||
               customer.phone.toLowerCase().contains(state.searchQuery.toLowerCase());
      }).toList();
    }

    // Apply tier filter
    if (state.selectedTier != null) {
      filtered = filtered.where((customer) => customer.tier == state.selectedTier).toList();
    }

    // Apply status filter
    if (state.selectedStatus != null) {
      filtered = filtered.where((customer) => customer.status == state.selectedStatus).toList();
    }

    state = state.copyWith(filteredCustomers: filtered);
  }

  Future<void> createCustomer(Customer customer) async {
    try {
      final newCustomer = await _apiService.createCustomer(customer);
      await _storageService.saveCustomer(newCustomer);
      
      final updatedCustomers = [...state.customers, newCustomer];
      state = state.copyWith(customers: updatedCustomers);
      _applyFilters();
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  Future<void> updateCustomer(Customer customer) async {
    try {
      final updatedCustomer = await _apiService.updateCustomer(customer);
      await _storageService.saveCustomer(updatedCustomer);
      
      final updatedCustomers = state.customers.map((c) {
        return c.id == customer.id ? updatedCustomer : c;
      }).toList();
      
      state = state.copyWith(customers: updatedCustomers);
      _applyFilters();
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }
}

// Providers
final customersProvider = StateNotifierProvider<CustomersNotifier, CustomersState>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  final storageService = ref.watch(storageServiceProvider);
  return CustomersNotifier(apiService, storageService);
});

final storageServiceProvider = Provider<StorageService>((ref) {
  return StorageService();
});
