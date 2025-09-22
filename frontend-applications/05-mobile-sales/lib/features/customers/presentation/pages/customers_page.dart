import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/models/customer.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../shared/presentation/widgets/search_bar_widget.dart';
import '../../../../shared/presentation/widgets/filter_chip_widget.dart';
import '../widgets/customer_card.dart';
import '../providers/customers_provider.dart';

class CustomersPage extends ConsumerStatefulWidget {
  const CustomersPage({super.key});

  @override
  ConsumerState<CustomersPage> createState() => _CustomersPageState();
}

class _CustomersPageState extends ConsumerState<CustomersPage> {
  String _searchQuery = '';
  CustomerTier? _selectedTier;
  CustomerStatus? _selectedStatus;

  @override
  Widget build(BuildContext context) {
    final customersAsync = ref.watch(customersProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Customers'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              // TODO: Navigate to add customer page
            },
          ),
          IconButton(
            icon: const Icon(Icons.sync),
            onPressed: () {
              ref.refresh(customersProvider);
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Search and Filters
          Container(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                SearchBarWidget(
                  hintText: 'Search customers...',
                  onChanged: (value) {
                    setState(() {
                      _searchQuery = value;
                    });
                  },
                ),
                const SizedBox(height: 12),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      FilterChipWidget(
                        label: 'All Tiers',
                        isSelected: _selectedTier == null,
                        onSelected: (selected) {
                          setState(() {
                            _selectedTier = null;
                          });
                        },
                      ),
                      const SizedBox(width: 8),
                      ...CustomerTier.values.map((tier) => Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: FilterChipWidget(
                          label: tier.name.toUpperCase(),
                          isSelected: _selectedTier == tier,
                          onSelected: (selected) {
                            setState(() {
                              _selectedTier = selected ? tier : null;
                            });
                          },
                        ),
                      )),
                      const SizedBox(width: 16),
                      FilterChipWidget(
                        label: 'All Status',
                        isSelected: _selectedStatus == null,
                        onSelected: (selected) {
                          setState(() {
                            _selectedStatus = null;
                          });
                        },
                      ),
                      const SizedBox(width: 8),
                      ...CustomerStatus.values.map((status) => Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: FilterChipWidget(
                          label: status.name.toUpperCase(),
                          isSelected: _selectedStatus == status,
                          onSelected: (selected) {
                            setState(() {
                              _selectedStatus = selected ? status : null;
                            });
                          },
                        ),
                      )),
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          // Customer List
          Expanded(
            child: customersAsync.when(
              data: (customers) {
                final filteredCustomers = _filterCustomers(customers);
                
                if (filteredCustomers.isEmpty) {
                  return const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.people_outline,
                          size: 64,
                          color: Colors.grey,
                        ),
                        SizedBox(height: 16),
                        Text(
                          'No customers found',
                          style: TextStyle(
                            fontSize: 18,
                            color: Colors.grey,
                          ),
                        ),
                      ],
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () async {
                    ref.refresh(customersProvider);
                  },
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: filteredCustomers.length,
                    itemBuilder: (context, index) {
                      final customer = filteredCustomers[index];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: CustomerCard(
                          customer: customer,
                          onTap: () {
                            context.pushNamed(
                              'customer-detail',
                              pathParameters: {'customerId': customer.id},
                            );
                          },
                        ),
                      );
                    },
                  ),
                );
              },
              loading: () => const Center(
                child: CircularProgressIndicator(),
              ),
              error: (error, stack) => Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.error_outline,
                      size: 64,
                      color: Colors.red,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Error loading customers',
                      style: AppTheme.heading3,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      error.toString(),
                      style: AppTheme.bodyMedium,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () {
                        ref.refresh(customersProvider);
                      },
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // TODO: Navigate to add customer page
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  List<Customer> _filterCustomers(List<Customer> customers) {
    return customers.where((customer) {
      // Search filter
      if (_searchQuery.isNotEmpty) {
        final query = _searchQuery.toLowerCase();
        if (!customer.name.toLowerCase().contains(query) &&
            !customer.email.toLowerCase().contains(query) &&
            !(customer.phone?.toLowerCase().contains(query) ?? false)) {
          return false;
        }
      }

      // Tier filter
      if (_selectedTier != null && customer.tier != _selectedTier) {
        return false;
      }

      // Status filter
      if (_selectedStatus != null && customer.status != _selectedStatus) {
        return false;
      }

      return true;
    }).toList();
  }
}
