import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:geolocator/geolocator.dart';

import '../models/customer_model.dart';
import '../providers/customer_provider.dart';
import '../widgets/customer_card.dart';
import '../widgets/customer_search_delegate.dart';
import '../widgets/customer_filter_bottom_sheet.dart';

class CustomerListScreen extends ConsumerStatefulWidget {
  const CustomerListScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<CustomerListScreen> createState() => _CustomerListScreenState();
}

class _CustomerListScreenState extends ConsumerState<CustomerListScreen> {
  final ScrollController _scrollController = ScrollController();
  Position? _currentPosition;
  String _searchQuery = '';
  CustomerFilter _currentFilter = const CustomerFilter();

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _getCurrentLocation() async {
    try {
      final position = await Geolocator.getCurrentPosition();
      setState(() {
        _currentPosition = position;
      });
    } catch (e) {
      // Handle location permission or error
    }
  }

  void _onScroll() {
    if (_scrollController.position.pixels == _scrollController.position.maxScrollExtent) {
      // Load more customers if needed
      ref.read(customerProvider.notifier).loadMoreCustomers();
    }
  }

  @override
  Widget build(BuildContext context) {
    final customerState = ref.watch(customerProvider);
    final filteredCustomers = _filterCustomers(customerState.customers);

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text(
          'Customers',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () => _showSearch(context),
          ),
          IconButton(
            icon: Stack(
              children: [
                const Icon(Icons.filter_list),
                if (_currentFilter.hasActiveFilters)
                  Positioned(
                    right: 0,
                    top: 0,
                    child: Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: Colors.orange,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
              ],
            ),
            onPressed: () => _showFilterBottomSheet(context),
          ),
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => context.push('/customers/add'),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(customerProvider.notifier).refreshCustomers(),
        child: Column(
          children: [
            // Quick Stats
            Container(
              padding: const EdgeInsets.all(16),
              color: Colors.white,
              child: Row(
                children: [
                  Expanded(
                    child: _buildStatCard(
                      'Total',
                      filteredCustomers.length.toString(),
                      Colors.blue,
                      Icons.people,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildStatCard(
                      'Active',
                      filteredCustomers.where((c) => c.isActive).length.toString(),
                      Colors.green,
                      Icons.check_circle,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildStatCard(
                      'High Value',
                      filteredCustomers.where((c) => c.isHighValue).length.toString(),
                      Colors.orange,
                      Icons.star,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildStatCard(
                      'Need Attention',
                      filteredCustomers.where((c) => c.needsAttention).length.toString(),
                      Colors.red,
                      Icons.warning,
                    ),
                  ),
                ],
              ),
            ),
            
            // Search Results Info
            if (_searchQuery.isNotEmpty || _currentFilter.hasActiveFilters)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                color: Colors.grey[100],
                child: Row(
                  children: [
                    Icon(Icons.info_outline, size: 16, color: Colors.grey[600]),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        '${filteredCustomers.length} customers found',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[600],
                        ),
                      ),
                    ),
                    if (_searchQuery.isNotEmpty || _currentFilter.hasActiveFilters)
                      TextButton(
                        onPressed: _clearFilters,
                        child: const Text('Clear All'),
                      ),
                  ],
                ),
              ),

            // Customer List
            Expanded(
              child: customerState.isLoading && filteredCustomers.isEmpty
                  ? const Center(child: CircularProgressIndicator())
                  : filteredCustomers.isEmpty
                      ? _buildEmptyState()
                      : ListView.builder(
                          controller: _scrollController,
                          padding: const EdgeInsets.all(16),
                          itemCount: filteredCustomers.length + (customerState.hasMore ? 1 : 0),
                          itemBuilder: (context, index) {
                            if (index == filteredCustomers.length) {
                              return const Center(
                                child: Padding(
                                  padding: EdgeInsets.all(16),
                                  child: CircularProgressIndicator(),
                                ),
                              );
                            }

                            final customer = filteredCustomers[index];
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 12),
                              child: CustomerCard(
                                customer: customer,
                                currentPosition: _currentPosition,
                                onTap: () => context.push('/customers/${customer.id}'),
                                onCall: () => _makeCall(customer),
                                onNavigate: () => _navigateToCustomer(customer),
                              ),
                            );
                          },
                        ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/customers/add'),
        backgroundColor: Colors.orange,
        icon: const Icon(Icons.add),
        label: const Text('Add Customer'),
      ),
    );
  }

  Widget _buildStatCard(String title, String value, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          Text(
            title,
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.people_outline,
            size: 64,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            _searchQuery.isNotEmpty || _currentFilter.hasActiveFilters
                ? 'No customers match your criteria'
                : 'No customers yet',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w500,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _searchQuery.isNotEmpty || _currentFilter.hasActiveFilters
                ? 'Try adjusting your search or filters'
                : 'Add your first customer to get started',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[500],
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: _searchQuery.isNotEmpty || _currentFilter.hasActiveFilters
                ? _clearFilters
                : () => context.push('/customers/add'),
            icon: Icon(_searchQuery.isNotEmpty || _currentFilter.hasActiveFilters
                ? Icons.clear
                : Icons.add),
            label: Text(_searchQuery.isNotEmpty || _currentFilter.hasActiveFilters
                ? 'Clear Filters'
                : 'Add Customer'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.orange,
              foregroundColor: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  List<Customer> _filterCustomers(List<Customer> customers) {
    var filtered = customers;

    // Apply search query
    if (_searchQuery.isNotEmpty) {
      filtered = filtered.where((customer) {
        final query = _searchQuery.toLowerCase();
        return customer.name.toLowerCase().contains(query) ||
            customer.businessName.toLowerCase().contains(query) ||
            customer.email.toLowerCase().contains(query) ||
            customer.phone.contains(query) ||
            customer.address.city.toLowerCase().contains(query);
      }).toList();
    }

    // Apply filters
    if (_currentFilter.status != null) {
      filtered = filtered.where((c) => c.status == _currentFilter.status).toList();
    }

    if (_currentFilter.tier != null) {
      filtered = filtered.where((c) => c.tier == _currentFilter.tier).toList();
    }

    if (_currentFilter.territory != null) {
      filtered = filtered.where((c) => c.territory == _currentFilter.territory).toList();
    }

    if (_currentFilter.needsAttention) {
      filtered = filtered.where((c) => c.needsAttention).toList();
    }

    if (_currentFilter.hasRecentActivity) {
      filtered = filtered.where((c) => c.hasRecentActivity).toList();
    }

    // Sort by distance if location is available
    if (_currentPosition != null && _currentFilter.sortByDistance) {
      filtered.sort((a, b) {
        final distanceA = a.distanceFromCurrentLocation(
          _currentPosition!.latitude,
          _currentPosition!.longitude,
        );
        final distanceB = b.distanceFromCurrentLocation(
          _currentPosition!.latitude,
          _currentPosition!.longitude,
        );
        return distanceA.compareTo(distanceB);
      });
    }

    return filtered;
  }

  void _showSearch(BuildContext context) async {
    final result = await showSearch(
      context: context,
      delegate: CustomerSearchDelegate(
        customers: ref.read(customerProvider).customers,
      ),
    );

    if (result != null) {
      setState(() {
        _searchQuery = result;
      });
    }
  }

  void _showFilterBottomSheet(BuildContext context) async {
    final result = await showModalBottomSheet<CustomerFilter>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => CustomerFilterBottomSheet(
        currentFilter: _currentFilter,
        availableTerritories: _getAvailableTerritories(),
      ),
    );

    if (result != null) {
      setState(() {
        _currentFilter = result;
      });
    }
  }

  void _clearFilters() {
    setState(() {
      _searchQuery = '';
      _currentFilter = const CustomerFilter();
    });
  }

  List<String> _getAvailableTerritories() {
    final customers = ref.read(customerProvider).customers;
    return customers.map((c) => c.territory).toSet().toList()..sort();
  }

  void _makeCall(Customer customer) {
    // Implement phone call functionality
    // This would typically use url_launcher to make a phone call
  }

  void _navigateToCustomer(Customer customer) {
    // Implement navigation to customer location
    // This would typically open Google Maps or similar
  }
}

// Filter model
class CustomerFilter {
  final CustomerStatus? status;
  final CustomerTier? tier;
  final String? territory;
  final bool needsAttention;
  final bool hasRecentActivity;
  final bool sortByDistance;

  const CustomerFilter({
    this.status,
    this.tier,
    this.territory,
    this.needsAttention = false,
    this.hasRecentActivity = false,
    this.sortByDistance = false,
  });

  bool get hasActiveFilters =>
      status != null ||
      tier != null ||
      territory != null ||
      needsAttention ||
      hasRecentActivity ||
      sortByDistance;

  CustomerFilter copyWith({
    CustomerStatus? status,
    CustomerTier? tier,
    String? territory,
    bool? needsAttention,
    bool? hasRecentActivity,
    bool? sortByDistance,
  }) {
    return CustomerFilter(
      status: status ?? this.status,
      tier: tier ?? this.tier,
      territory: territory ?? this.territory,
      needsAttention: needsAttention ?? this.needsAttention,
      hasRecentActivity: hasRecentActivity ?? this.hasRecentActivity,
      sortByDistance: sortByDistance ?? this.sortByDistance,
    );
  }
}
