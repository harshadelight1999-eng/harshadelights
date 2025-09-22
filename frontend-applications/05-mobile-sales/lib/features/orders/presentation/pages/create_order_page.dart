import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/models/customer.dart';
import '../../../../core/models/product.dart';
import '../../../../core/models/order.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../shared/presentation/widgets/search_bar_widget.dart';
import '../widgets/customer_selector.dart';
import '../widgets/product_selector.dart';
import '../widgets/order_item_card.dart';
import '../widgets/order_summary_card.dart';
import '../providers/create_order_provider.dart';

class CreateOrderPage extends ConsumerStatefulWidget {
  const CreateOrderPage({super.key});

  @override
  ConsumerState<CreateOrderPage> createState() => _CreateOrderPageState();
}

class _CreateOrderPageState extends ConsumerState<CreateOrderPage> {
  final _formKey = GlobalKey<FormState>();
  final _notesController = TextEditingController();
  final _deliveryAddressController = TextEditingController();

  @override
  void dispose() {
    _notesController.dispose();
    _deliveryAddressController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final orderState = ref.watch(createOrderProvider);
    final orderNotifier = ref.read(createOrderProvider.notifier);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Order'),
        actions: [
          TextButton(
            onPressed: orderState.items.isNotEmpty ? _saveAsDraft : null,
            child: const Text(
              'Save Draft',
              style: TextStyle(color: Colors.white),
            ),
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Customer Selection
                    Text(
                      'Select Customer',
                      style: AppTheme.heading3,
                    ),
                    const SizedBox(height: 12),
                    CustomerSelector(
                      selectedCustomer: orderState.selectedCustomer,
                      onCustomerSelected: orderNotifier.selectCustomer,
                    ),
                    
                    const SizedBox(height: 24),
                    
                    // Product Selection
                    Text(
                      'Add Products',
                      style: AppTheme.heading3,
                    ),
                    const SizedBox(height: 12),
                    ProductSelector(
                      onProductSelected: (product, quantity) {
                        orderNotifier.addItem(product, quantity);
                      },
                    ),
                    
                    const SizedBox(height: 24),
                    
                    // Order Items
                    if (orderState.items.isNotEmpty) ...[
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Order Items (${orderState.items.length})',
                            style: AppTheme.heading3,
                          ),
                          TextButton(
                            onPressed: orderNotifier.clearItems,
                            child: const Text('Clear All'),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      ...orderState.items.map((item) => Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: OrderItemCard(
                          item: item,
                          onQuantityChanged: (newQuantity) {
                            orderNotifier.updateItemQuantity(item.productId, newQuantity);
                          },
                          onRemove: () {
                            orderNotifier.removeItem(item.productId);
                          },
                        ),
                      )),
                      
                      const SizedBox(height: 24),
                    ],
                    
                    // Delivery Information
                    Text(
                      'Delivery Information',
                      style: AppTheme.heading3,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _deliveryAddressController,
                      decoration: const InputDecoration(
                        labelText: 'Delivery Address (Optional)',
                        hintText: 'Enter custom delivery address',
                        prefixIcon: Icon(Icons.location_on),
                      ),
                      maxLines: 2,
                    ),
                    
                    const SizedBox(height: 16),
                    
                    // Order Notes
                    TextFormField(
                      controller: _notesController,
                      decoration: const InputDecoration(
                        labelText: 'Order Notes (Optional)',
                        hintText: 'Add any special instructions',
                        prefixIcon: Icon(Icons.note),
                      ),
                      maxLines: 3,
                    ),
                    
                    const SizedBox(height: 24),
                    
                    // Order Summary
                    if (orderState.items.isNotEmpty) ...[
                      OrderSummaryCard(
                        subtotal: orderState.subtotal,
                        tax: orderState.tax,
                        discount: orderState.discount,
                        total: orderState.total,
                      ),
                    ],
                  ],
                ),
              ),
            ),
            
            // Bottom Action Bar
            if (orderState.items.isNotEmpty)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Theme.of(context).scaffoldBackgroundColor,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 4,
                      offset: const Offset(0, -2),
                    ),
                  ],
                ),
                child: SafeArea(
                  child: Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: _saveAsDraft,
                          child: const Text('Save as Draft'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        flex: 2,
                        child: ElevatedButton(
                          onPressed: orderState.selectedCustomer != null 
                              ? _submitOrder 
                              : null,
                          child: orderState.isSubmitting
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                  ),
                                )
                              : const Text('Submit Order'),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  void _saveAsDraft() async {
    if (orderState.items.isEmpty) return;

    final orderNotifier = ref.read(createOrderProvider.notifier);
    
    try {
      await orderNotifier.saveAsDraft(
        notes: _notesController.text.trim(),
        deliveryAddress: _deliveryAddressController.text.trim(),
      );
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Order saved as draft'),
            backgroundColor: AppTheme.success,
          ),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to save draft: $e'),
            backgroundColor: AppTheme.error,
          ),
        );
      }
    }
  }

  void _submitOrder() async {
    if (!_formKey.currentState!.validate()) return;
    if (orderState.selectedCustomer == null || orderState.items.isEmpty) return;

    final orderNotifier = ref.read(createOrderProvider.notifier);
    
    try {
      await orderNotifier.submitOrder(
        notes: _notesController.text.trim(),
        deliveryAddress: _deliveryAddressController.text.trim(),
      );
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Order submitted successfully'),
            backgroundColor: AppTheme.success,
          ),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to submit order: $e'),
            backgroundColor: AppTheme.error,
          ),
        );
      }
    }
  }
}
