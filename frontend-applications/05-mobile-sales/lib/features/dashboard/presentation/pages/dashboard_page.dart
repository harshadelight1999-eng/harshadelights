import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../shared/presentation/widgets/metric_card.dart';
import '../../../../shared/presentation/widgets/quick_action_card.dart';
import '../widgets/sales_chart.dart';
import '../widgets/recent_activities.dart';
import '../widgets/target_progress.dart';
import '../providers/dashboard_provider.dart';

class DashboardPage extends ConsumerWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboardAsync = ref.watch(dashboardProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Sales Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {
              // TODO: Navigate to notifications
            },
          ),
          IconButton(
            icon: const Icon(Icons.person_outline),
            onPressed: () {
              context.pushNamed('profile');
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.refresh(dashboardProvider);
        },
        child: dashboardAsync.when(
          data: (dashboard) => SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Welcome Section
                _buildWelcomeSection(dashboard.salesPersonName),
                
                const SizedBox(height: 24),
                
                // Key Metrics
                Text(
                  'Today\'s Performance',
                  style: AppTheme.heading2,
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: MetricCard(
                        title: 'Orders Today',
                        value: '${dashboard.todayOrders}',
                        icon: Icons.shopping_cart,
                        color: AppTheme.primaryOrange,
                        trend: dashboard.ordersTrend,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: MetricCard(
                        title: 'Revenue Today',
                        value: _formatCurrency(dashboard.todayRevenue),
                        icon: Icons.attach_money,
                        color: AppTheme.success,
                        trend: dashboard.revenueTrend,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: MetricCard(
                        title: 'New Leads',
                        value: '${dashboard.newLeads}',
                        icon: Icons.trending_up,
                        color: AppTheme.accentGold,
                        trend: dashboard.leadsTrend,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: MetricCard(
                        title: 'Customers Visited',
                        value: '${dashboard.customersVisited}',
                        icon: Icons.people,
                        color: AppTheme.primaryRed,
                        trend: dashboard.visitsTrend,
                      ),
                    ),
                  ],
                ),
                
                const SizedBox(height: 24),
                
                // Target Progress
                Text(
                  'Monthly Target Progress',
                  style: AppTheme.heading2,
                ),
                const SizedBox(height: 16),
                TargetProgress(
                  currentValue: dashboard.monthlyRevenue,
                  targetValue: dashboard.monthlyTarget,
                  daysRemaining: dashboard.daysRemainingInMonth,
                ),
                
                const SizedBox(height: 24),
                
                // Quick Actions
                Text(
                  'Quick Actions',
                  style: AppTheme.heading2,
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: QuickActionCard(
                        title: 'New Order',
                        subtitle: 'Create quick order',
                        icon: Icons.add_shopping_cart,
                        color: AppTheme.primaryOrange,
                        onTap: () => context.pushNamed('create-order'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: QuickActionCard(
                        title: 'Add Lead',
                        subtitle: 'Capture new lead',
                        icon: Icons.person_add,
                        color: AppTheme.accentGold,
                        onTap: () {
                          // TODO: Navigate to add lead
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: QuickActionCard(
                        title: 'Route Plan',
                        subtitle: 'Plan delivery route',
                        icon: Icons.route,
                        color: AppTheme.success,
                        onTap: () => context.pushNamed('routes'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: QuickActionCard(
                        title: 'Sync Data',
                        subtitle: 'Sync offline data',
                        icon: Icons.sync,
                        color: AppTheme.primaryRed,
                        onTap: () {
                          // TODO: Trigger sync
                        },
                      ),
                    ),
                  ],
                ),
                
                const SizedBox(height: 24),
                
                // Sales Chart
                Text(
                  'Sales Trend (Last 7 Days)',
                  style: AppTheme.heading2,
                ),
                const SizedBox(height: 16),
                SalesChart(salesData: dashboard.weeklySales),
                
                const SizedBox(height: 24),
                
                // Recent Activities
                Text(
                  'Recent Activities',
                  style: AppTheme.heading2,
                ),
                const SizedBox(height: 16),
                RecentActivities(activities: dashboard.recentActivities),
                
                const SizedBox(height: 80), // Bottom padding for FAB
              ],
            ),
          ),
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
                  'Error loading dashboard',
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
                    ref.refresh(dashboardProvider);
                  },
                  child: const Text('Retry'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildWelcomeSection(String salesPersonName) {
    final now = DateTime.now();
    final hour = now.hour;
    String greeting;
    
    if (hour < 12) {
      greeting = 'Good Morning';
    } else if (hour < 17) {
      greeting = 'Good Afternoon';
    } else {
      greeting = 'Good Evening';
    }

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppTheme.primaryOrange, AppTheme.primaryRed],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '$greeting,',
            style: AppTheme.heading3.copyWith(color: Colors.white),
          ),
          Text(
            salesPersonName,
            style: AppTheme.heading1.copyWith(color: Colors.white),
          ),
          const SizedBox(height: 8),
          Text(
            DateFormat('EEEE, MMMM d, y').format(now),
            style: AppTheme.bodyMedium.copyWith(
              color: Colors.white.withOpacity(0.9),
            ),
          ),
        ],
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
}
