import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../../core/services/api_service.dart';
import '../../../core/models/customer.dart';
import '../../auth/providers/auth_provider.dart';

// Route Planning State
class RoutePlanningState {
  final List<Customer> selectedCustomers;
  final List<LatLng> optimizedRoute;
  final Map<String, Marker> markers;
  final Set<Polyline> polylines;
  final bool isLoading;
  final String? error;
  final double totalDistance;
  final Duration estimatedTime;
  final bool isMapView;

  const RoutePlanningState({
    this.selectedCustomers = const [],
    this.optimizedRoute = const [],
    this.markers = const {},
    this.polylines = const {},
    this.isLoading = false,
    this.error,
    this.totalDistance = 0.0,
    this.estimatedTime = Duration.zero,
    this.isMapView = true,
  });

  RoutePlanningState copyWith({
    List<Customer>? selectedCustomers,
    List<LatLng>? optimizedRoute,
    Map<String, Marker>? markers,
    Set<Polyline>? polylines,
    bool? isLoading,
    String? error,
    double? totalDistance,
    Duration? estimatedTime,
    bool? isMapView,
  }) {
    return RoutePlanningState(
      selectedCustomers: selectedCustomers ?? this.selectedCustomers,
      optimizedRoute: optimizedRoute ?? this.optimizedRoute,
      markers: markers ?? this.markers,
      polylines: polylines ?? this.polylines,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      totalDistance: totalDistance ?? this.totalDistance,
      estimatedTime: estimatedTime ?? this.estimatedTime,
      isMapView: isMapView ?? this.isMapView,
    );
  }
}

// Route Planning Notifier
class RoutePlanningNotifier extends StateNotifier<RoutePlanningState> {
  final ApiService _apiService;

  RoutePlanningNotifier(this._apiService) : super(const RoutePlanningState());

  void addCustomer(Customer customer) {
    if (!state.selectedCustomers.any((c) => c.id == customer.id)) {
      final updatedCustomers = [...state.selectedCustomers, customer];
      state = state.copyWith(selectedCustomers: updatedCustomers);
      _updateMarkers();
    }
  }

  void removeCustomer(String customerId) {
    final updatedCustomers = state.selectedCustomers
        .where((c) => c.id != customerId)
        .toList();
    state = state.copyWith(selectedCustomers: updatedCustomers);
    _updateMarkers();
    
    if (updatedCustomers.isEmpty) {
      state = state.copyWith(
        optimizedRoute: [],
        polylines: {},
        totalDistance: 0.0,
        estimatedTime: Duration.zero,
      );
    }
  }

  void toggleView() {
    state = state.copyWith(isMapView: !state.isMapView);
  }

  Future<void> optimizeRoute() async {
    if (state.selectedCustomers.length < 2) {
      state = state.copyWith(error: 'Please select at least 2 customers');
      return;
    }

    state = state.copyWith(isLoading: true, error: null);

    try {
      // Convert customers to coordinates
      final waypoints = state.selectedCustomers.map((customer) {
        return LatLng(
          customer.address.latitude ?? 0.0,
          customer.address.longitude ?? 0.0,
        );
      }).toList();

      // Simple route optimization (in production, use Google Directions API)
      final optimizedRoute = _optimizeRouteLocally(waypoints);
      
      // Calculate total distance and time
      final routeInfo = await _calculateRouteInfo(optimizedRoute);
      
      // Create polylines
      final polylines = _createPolylines(optimizedRoute);

      state = state.copyWith(
        optimizedRoute: optimizedRoute,
        polylines: polylines,
        totalDistance: routeInfo['distance'] ?? 0.0,
        estimatedTime: routeInfo['duration'] ?? Duration.zero,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        error: e.toString(),
        isLoading: false,
      );
    }
  }

  void _updateMarkers() {
    final markers = <String, Marker>{};
    
    for (int i = 0; i < state.selectedCustomers.length; i++) {
      final customer = state.selectedCustomers[i];
      final markerId = MarkerId(customer.id);
      
      markers[customer.id] = Marker(
        markerId: markerId,
        position: LatLng(
          customer.address.latitude ?? 0.0,
          customer.address.longitude ?? 0.0,
        ),
        infoWindow: InfoWindow(
          title: customer.name,
          snippet: customer.address.fullAddress,
        ),
        icon: BitmapDescriptor.defaultMarkerWithHue(
          i == 0 ? BitmapDescriptor.hueGreen : BitmapDescriptor.hueRed,
        ),
      );
    }

    state = state.copyWith(markers: markers);
  }

  Set<Polyline> _createPolylines(List<LatLng> route) {
    if (route.length < 2) return {};

    return {
      Polyline(
        polylineId: const PolylineId('route'),
        points: route,
        color: const Color(0xFFE67E22),
        width: 4,
        patterns: [],
      ),
    };
  }

  Future<Map<String, dynamic>> _calculateRouteInfo(List<LatLng> route) async {
    // Simple distance calculation (in real app, use Google Directions API)
    double totalDistance = 0.0;
    
    for (int i = 0; i < route.length - 1; i++) {
      final distance = _calculateDistance(route[i], route[i + 1]);
      totalDistance += distance;
    }

    // Estimate time based on average speed (40 km/h)
    final estimatedHours = totalDistance / 40.0;
    final estimatedTime = Duration(
      hours: estimatedHours.floor(),
      minutes: ((estimatedHours - estimatedHours.floor()) * 60).round(),
    );

    return {
      'distance': totalDistance,
      'duration': estimatedTime,
    };
  }

  List<LatLng> _optimizeRouteLocally(List<LatLng> waypoints) {
    // Simple nearest neighbor algorithm for route optimization
    if (waypoints.length <= 2) return waypoints;
    
    final optimized = <LatLng>[waypoints.first];
    final remaining = List<LatLng>.from(waypoints.skip(1));
    
    while (remaining.isNotEmpty) {
      final current = optimized.last;
      double minDistance = double.infinity;
      int nearestIndex = 0;
      
      for (int i = 0; i < remaining.length; i++) {
        final distance = _calculateDistance(current, remaining[i]);
        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = i;
        }
      }
      
      optimized.add(remaining.removeAt(nearestIndex));
    }
    
    return optimized;
  }

  double _calculateDistance(LatLng point1, LatLng point2) {
    // Haversine formula for distance calculation
    const double earthRadius = 6371; // km
    
    final double lat1Rad = point1.latitude * (pi / 180);
    final double lat2Rad = point2.latitude * (pi / 180);
    final double deltaLatRad = (point2.latitude - point1.latitude) * (pi / 180);
    final double deltaLngRad = (point2.longitude - point1.longitude) * (pi / 180);

    final double a = sin(deltaLatRad / 2) * sin(deltaLatRad / 2) +
        cos(lat1Rad) * cos(lat2Rad) *
        sin(deltaLngRad / 2) * sin(deltaLngRad / 2);
    
    final double c = 2 * asin(sqrt(a));
    
    return earthRadius * c;
  }

  Future<void> startNavigation() async {
    if (state.optimizedRoute.isEmpty) {
      state = state.copyWith(error: 'Please optimize route first');
      return;
    }

    try {
      // In a real app, integrate with navigation apps like Google Maps
      // For now, we'll just simulate starting navigation
      await Future.delayed(const Duration(seconds: 1));
      
      // You could open external navigation app here
      // await _openNavigationApp(state.optimizedRoute.first);
      
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  void clearRoute() {
    state = const RoutePlanningState();
  }
}

// Providers
final routePlanningProvider = StateNotifierProvider<RoutePlanningNotifier, RoutePlanningState>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return RoutePlanningNotifier(apiService);
});
