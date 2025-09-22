import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/models/customer.dart';
import '../../../../core/theme/app_theme.dart';

class CustomerCard extends StatelessWidget {
  final Customer customer;
  final VoidCallback? onTap;

  const CustomerCard({
    super.key,
    required this.customer,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header row with name and tier
              Row(
                children: [
                  Expanded(
                    child: Text(
                      customer.name,
                      style: AppTheme.heading3,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  _buildTierChip(customer.tier),
                ],
              ),
              const SizedBox(height: 8),
              
              // Contact info
              Row(
                children: [
                  const Icon(Icons.email, size: 16, color: AppTheme.textLight),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      customer.email,
                      style: AppTheme.bodyMedium.copyWith(color: AppTheme.textLight),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              if (customer.phone != null) ...[
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.phone, size: 16, color: AppTheme.textLight),
                    const SizedBox(width: 8),
                    Text(
                      customer.phone!,
                      style: AppTheme.bodyMedium.copyWith(color: AppTheme.textLight),
                    ),
                  ],
                ),
              ],
              
              const SizedBox(height: 12),
              
              // Credit info and stats
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Credit Available',
                          style: AppTheme.bodySmall,
                        ),
                        Text(
                          _formatCurrency(customer.creditAvailable),
                          style: AppTheme.bodyMedium.copyWith(
                            color: customer.isOverdue ? AppTheme.error : AppTheme.success,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Total Orders',
                          style: AppTheme.bodySmall,
                        ),
                        Text(
                          '${customer.totalOrders}',
                          style: AppTheme.bodyMedium.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Last Order',
                          style: AppTheme.bodySmall,
                        ),
                        Text(
                          _formatDate(customer.lastOrderDate),
                          style: AppTheme.bodyMedium.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 12),
              
              // Status and location
              Row(
                children: [
                  _buildStatusChip(customer.status),
                  const Spacer(),
                  Icon(
                    Icons.location_on,
                    size: 16,
                    color: AppTheme.textLight,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${customer.address.city}, ${customer.address.state}',
                    style: AppTheme.bodySmall,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTierChip(CustomerTier tier) {
    Color color;
    switch (tier) {
      case CustomerTier.gold:
        color = AppTheme.accentGold;
        break;
      case CustomerTier.silver:
        color = Colors.grey[400]!;
        break;
      case CustomerTier.bronze:
        color = Colors.brown[300]!;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color),
      ),
      child: Text(
        tier.name.toUpperCase(),
        style: AppTheme.bodySmall.copyWith(
          color: color,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildStatusChip(CustomerStatus status) {
    Color color;
    switch (status) {
      case CustomerStatus.active:
        color = AppTheme.success;
        break;
      case CustomerStatus.inactive:
        color = AppTheme.textLight;
        break;
      case CustomerStatus.suspended:
        color = AppTheme.error;
        break;
      case CustomerStatus.pending:
        color = AppTheme.warning;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        status.name.toUpperCase(),
        style: AppTheme.caption.copyWith(
          color: color,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  String _formatCurrency(double amount) {
    final formatter = NumberFormat.currency(
      locale: 'en_IN',
      symbol: '₹',
      decimalDigits: 0,
    );
    return formatter.format(amount);
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date).inDays;
    
    if (difference == 0) {
      return 'Today';
    } else if (difference == 1) {
      return 'Yesterday';
    } else if (difference < 7) {
      return '${difference}d ago';
    } else if (difference < 30) {
      return '${(difference / 7).floor()}w ago';
    } else {
      return DateFormat('MMM dd').format(date);
    }
  }
}
