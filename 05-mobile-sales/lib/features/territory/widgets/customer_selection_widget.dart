import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../crm/models/customer_model.dart';
import '../../crm/providers/customer_provider.dart';

class CustomerSelectionWidget extends ConsumerStatefulWidget {
  final List<String> selectedCustomerIds;
  final Function(List<String>) onSelectionChanged;
  final String? territoryFilter;

  const CustomerSelectionWidget({
    Key? key,
    required this.selectedCustomerIds,
    required this.onSelectionChanged,
    this.territoryFilter,
  }) : super(key: key);

  @override
  ConsumerState<CustomerSelectionWidget> createState() => _CustomerSelectionWidgetState();
}

class _CustomerSelectionWidgetState extends ConsumerState<CustomerSelectionWidget> {
  String _searchQuery = '';
  CustomerTier? _selectedTier;
  bool _showActiveOnly = true;

  @override
  Widget build(BuildContext context) {
    final customersAsync = ref.watch(customersProvider);

    return Column(
      children: [
        _buildSearchAndFilters(),
        const SizedBox(height: 16),
        Expanded(
          child: customersAsync.when(
            data: (customers) {
              final filteredCustomers = _filterCustomers(customers);
              
              if (filteredCustomers.isEmpty) {
                return _buildEmptyState();
              }

              return _buildCustomerList(filteredCustomers);
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (error, stack) => _buildErrorState(error),
          ),
        ),
        _buildSelectionSummary(),
      ],
    );
  }

  Widget _buildSearchAndFilters() {
    return Column(
      children: [
        // Search bar
        TextField(
          decoration: InputDecoration(
            hintText: 'Search customers...',
            prefixIcon: const Icon(Icons.search),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            filled: true,
            fillColor: Colors.grey[50],
          ),
          onChanged: (value) {
            setState(() {
              _searchQuery = value;
            });
          },
        ),
        const SizedBox(height: 12),
        
        // Filter chips
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              FilterChip(
                label: const Text('Active Only'),
                selected: _showActiveOnly,
                onSelected: (selected) {
                  setState(() {
                    _showActiveOnly = selected;
                  });
                },
              ),
              const SizedBox(width: 8),
              FilterChip(
                label: const Text('Premium'),
                selected: _selectedTier == CustomerTier.premium,
                onSelected: (selected) {
                  setState(() {
                    _selectedTier = selected ? CustomerTier.premium : null;
                  });
                },
              ),
              const SizedBox(width: 8),
              FilterChip(
                label: const Text('Gold'),
                selected: _selectedTier == CustomerTier.gold,
                onSelected: (selected) {
                  setState(() {
                    _selectedTier = selected ? CustomerTier.gold : null;
                  });
                },
              ),
              const SizedBox(width: 8),
              FilterChip(
                label: const Text('Silver'),
                selected: _selectedTier == CustomerTier.silver,
                onSelected: (selected) {
                  setState(() {
                    _selectedTier = selected ? CustomerTier.silver : null;
                  });
                },
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCustomerList(List<Customer> customers) {
    return ListView.builder(
      itemCount: customers.length,
      itemBuilder: (context, index) {
        final customer = customers[index];
        final isSelected = widget.selectedCustomerIds.contains(customer.id);
        
        return Card(
          margin: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
          child: CheckboxListTile(
            value: isSelected,
            onChanged: (selected) {
              _toggleCustomerSelection(customer.id, selected ?? false);
            },
            title: Text(
              customer.name,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(customer.email),
                const SizedBox(height: 4),
                Row(
                  children: [
                    _buildTierChip(customer.tier),
                    const SizedBox(width: 8),
                    _buildStatusChip(customer.status),
                    const Spacer(),
                    if (customer.primaryAddress != null)
                      Icon(
                        Icons.location_on,
                        size: 16,
                        color: Colors.grey[600],
                      ),
                  ],
                ),
              ],
            ),
            secondary: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  '${customer.metrics.totalOrders}',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                const Text(
                  'Orders',
                  style: TextStyle(fontSize: 12),
                ),
              ],
            ),
            controlAffinity: ListTileControlAffinity.leading,
          ),
        );
      },
    );
  }

  Widget _buildTierChip(CustomerTier tier) {
    Color color;
    switch (tier) {
      case CustomerTier.premium:
        color = Colors.purple;
        break;
      case CustomerTier.gold:
        color = Colors.amber;
        break;
      case CustomerTier.silver:
        color = Colors.grey;
        break;
      case CustomerTier.bronze:
        color = Colors.brown;
        break;
    }

    return Chip(
      label: Text(
        tier.name.toUpperCase(),
        style: const TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.bold,
        ),
      ),
      backgroundColor: color.withOpacity(0.1),
      side: BorderSide(color: color, width: 1),
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
      visualDensity: VisualDensity.compact,
    );
  }

  Widget _buildStatusChip(CustomerStatus status) {
    Color color;
    switch (status) {
      case CustomerStatus.active:
        color = Colors.green;
        break;
      case CustomerStatus.inactive:
        color = Colors.grey;
        break;
      case CustomerStatus.prospect:
        color = Colors.blue;
        break;
      case CustomerStatus.churned:
        color = Colors.red;
        break;
    }

    return Chip(
      label: Text(
        status.name.toUpperCase(),
        style: const TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.bold,
        ),
      ),
      backgroundColor: color.withOpacity(0.1),
      side: BorderSide(color: color, width: 1),
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
      visualDensity: VisualDensity.compact,
    );
  }

  Widget _buildSelectionSummary() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.blue[50],
        border: Border(
          top: BorderSide(color: Colors.grey[300]!),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            '${widget.selectedCustomerIds.length} customers selected',
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),
          Row(
            children: [
              TextButton(
                onPressed: widget.selectedCustomerIds.isEmpty ? null : () {
                  widget.onSelectionChanged([]);
                },
                child: const Text('Clear All'),
              ),
              const SizedBox(width: 8),
              ElevatedButton(
                onPressed: widget.selectedCustomerIds.isEmpty ? null : () {
                  Navigator.of(context).pop();
                },
                child: const Text('Done'),
              ),
            ],
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
            'No customers found',
            style: TextStyle(
              fontSize: 18,
              color: Colors.grey[600],
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Try adjusting your search or filters',
            style: TextStyle(
              color: Colors.grey[500],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(Object error) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.error_outline,
            size: 64,
            color: Colors.red[400],
          ),
          const SizedBox(height: 16),
          Text(
            'Error loading customers',
            style: TextStyle(
              fontSize: 18,
              color: Colors.red[600],
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            error.toString(),
            style: TextStyle(
              color: Colors.grey[600],
            ),
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
    );
  }

  List<Customer> _filterCustomers(List<Customer> customers) {
    return customers.where((customer) {
      // Territory filter
      if (widget.territoryFilter != null && 
          customer.territory != widget.territoryFilter) {
        return false;
      }

      // Active status filter
      if (_showActiveOnly && customer.status != CustomerStatus.active) {
        return false;
      }

      // Tier filter
      if (_selectedTier != null && customer.tier != _selectedTier) {
        return false;
      }

      // Search query filter
      if (_searchQuery.isNotEmpty) {
        final query = _searchQuery.toLowerCase();
        return customer.name.toLowerCase().contains(query) ||
               customer.email.toLowerCase().contains(query) ||
               customer.phone.toLowerCase().contains(query);
      }

      return true;
    }).toList();
  }

  void _toggleCustomerSelection(String customerId, bool selected) {
    final currentSelection = List<String>.from(widget.selectedCustomerIds);
    
    if (selected) {
      if (!currentSelection.contains(customerId)) {
        currentSelection.add(customerId);
      }
    } else {
      currentSelection.remove(customerId);
    }
    
    widget.onSelectionChanged(currentSelection);
  }
}
