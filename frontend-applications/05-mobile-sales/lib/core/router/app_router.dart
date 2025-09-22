import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/splash_page.dart';
import '../../features/dashboard/presentation/pages/dashboard_page.dart';
import '../../features/customers/presentation/pages/customers_page.dart';
import '../../features/customers/presentation/pages/customer_detail_page.dart';
import '../../features/orders/presentation/pages/orders_page.dart';
import '../../features/orders/presentation/pages/create_order_page.dart';
import '../../features/orders/presentation/pages/order_detail_page.dart';
import '../../features/leads/presentation/pages/leads_page.dart';
import '../../features/leads/presentation/pages/lead_detail_page.dart';
import '../../features/analytics/presentation/pages/analytics_page.dart';
import '../../features/route_planning/presentation/pages/route_planning_page.dart';
import '../../features/profile/presentation/pages/profile_page.dart';
import '../../shared/presentation/pages/main_navigation_page.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/splash',
    routes: [
      // Splash & Auth
      GoRoute(
        path: '/splash',
        name: 'splash',
        builder: (context, state) => const SplashPage(),
      ),
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginPage(),
      ),
      
      // Main Navigation Shell
      ShellRoute(
        builder: (context, state, child) => MainNavigationPage(child: child),
        routes: [
          // Dashboard
          GoRoute(
            path: '/dashboard',
            name: 'dashboard',
            builder: (context, state) => const DashboardPage(),
          ),
          
          // Customers
          GoRoute(
            path: '/customers',
            name: 'customers',
            builder: (context, state) => const CustomersPage(),
            routes: [
              GoRoute(
                path: '/:customerId',
                name: 'customer-detail',
                builder: (context, state) => CustomerDetailPage(
                  customerId: state.pathParameters['customerId']!,
                ),
              ),
            ],
          ),
          
          // Orders
          GoRoute(
            path: '/orders',
            name: 'orders',
            builder: (context, state) => const OrdersPage(),
            routes: [
              GoRoute(
                path: '/create',
                name: 'create-order',
                builder: (context, state) => const CreateOrderPage(),
              ),
              GoRoute(
                path: '/:orderId',
                name: 'order-detail',
                builder: (context, state) => OrderDetailPage(
                  orderId: state.pathParameters['orderId']!,
                ),
              ),
            ],
          ),
          
          // Leads
          GoRoute(
            path: '/leads',
            name: 'leads',
            builder: (context, state) => const LeadsPage(),
            routes: [
              GoRoute(
                path: '/:leadId',
                name: 'lead-detail',
                builder: (context, state) => LeadDetailPage(
                  leadId: state.pathParameters['leadId']!,
                ),
              ),
            ],
          ),
          
          // Analytics
          GoRoute(
            path: '/analytics',
            name: 'analytics',
            builder: (context, state) => const AnalyticsPage(),
          ),
          
          // Route Planning
          GoRoute(
            path: '/routes',
            name: 'routes',
            builder: (context, state) => const RoutePlanningPage(),
          ),
          
          // Profile
          GoRoute(
            path: '/profile',
            name: 'profile',
            builder: (context, state) => const ProfilePage(),
          ),
        ],
      ),
    ],
    redirect: (context, state) {
      // TODO: Implement authentication check
      // final isAuthenticated = ref.read(authProvider).isAuthenticated;
      // if (!isAuthenticated && state.location != '/login' && state.location != '/splash') {
      //   return '/login';
      // }
      return null;
    },
  );
});
