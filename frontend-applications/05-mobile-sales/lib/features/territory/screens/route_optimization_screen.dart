import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'dart:async';
import 'dart:math' as math;

import '../models/route_model.dart';
import '../providers/route_provider.dart';
import '../widgets/route_optimization_panel.dart';
import '../widgets/customer_visit_card.dart';
import '../../crm/models/customer_model.dart';

class RouteOptimizationScreen extends ConsumerStatefulWidget {
  const RouteOptimizationScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<RouteOptimizationScreen> createState() => _RouteOptimizationScreenState();
}

class _RouteOptimizationScreenState extends ConsumerState<RouteOptimizationScreen> {
  GoogleMapController? _mapController;
  Position? _currentPosition;
  Set<Marker> _markers = {};
  Set<Polyline> _polylines = {};
  bool _isOptimizing = false;
  bool _showPanel = false;
  
  final PageController _pageController = PageController();
  int _currentCustomerIndex = 0;

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _getCurrentLocation() async {
    try {
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      setState(() {
        _currentPosition = position;
      });
      _updateMapLocation();
    } catch (e) {
      // Handle location error
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Unable to get current location')),
      );
    }
  }

  void _updateMapLocation() {
    if (_mapController != null && _currentPosition != null) {
      _mapController!.animateCamera(
        CameraUpdate.newLatLng(
          LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final routeState = ref.watch(routeProvider);
    
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          'Route Optimization',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.my_location),
            onPressed: _getCurrentLocation,
          ),
          IconButton(
            icon: Icon(_showPanel ? Icons.map : Icons.list),
            onPressed: () => setState(() => _showPanel = !_showPanel),
          ),
        ],
      ),
      body: Stack(
        children: [
          // Google Map
          GoogleMap(
            onMapCreated: (GoogleMapController controller) {
              _mapController = controller;
              _updateMapLocation();
            },
            initialCameraPosition: CameraPosition(
              target: _currentPosition != null
                  ? LatLng(_currentPosition!.latitude, _currentPosition!.longitude)
                  : const LatLng(19.0760, 72.8777), // Mumbai default
              zoom: 12,
            ),
            markers: _markers,
            polylines: _polylines,
            myLocationEnabled: true,
            myLocationButtonEnabled: false,
            zoomControlsEnabled: false,
            mapToolbarEnabled: false,
          ),

          // Route Statistics Card
          Positioned(
            top: 16,
            left: 16,
            right: 16,
            child: Card(
              elevation: 4,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Today\'s Route',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        if (routeState.optimizedRoute != null)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.green.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              'Optimized',
                              style: TextStyle(
                                color: Colors.green[700],
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: _buildStatItem(
                            'Customers',
                            routeState.plannedVisits.length.toString(),
                            Icons.people,
                            Colors.blue,
                          ),
                        ),
                        Expanded(
                          child: _buildStatItem(
                            'Distance',
                            routeState.optimizedRoute?.totalDistance != null
                                ? '${(routeState.optimizedRoute!.totalDistance / 1000).toStringAsFixed(1)} km'
                                : '--',
                            Icons.route,
                            Colors.orange,
                          ),
                        ),
                        Expanded(
                          child: _buildStatItem(
                            'Est. Time',
                            routeState.optimizedRoute?.estimatedDuration != null
                                ? _formatDuration(routeState.optimizedRoute!.estimatedDuration)
                                : '--',
                            Icons.access_time,
                            Colors.green,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Customer List Panel
          if (_showPanel)
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
                height: MediaQuery.of(context).size.height * 0.4,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black26,
                      blurRadius: 10,
                      offset: Offset(0, -2),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    // Panel Header
                    Container(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          Container(
                            width: 40,
                            height: 4,
                            decoration: BoxDecoration(
                              color: Colors.grey[300],
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                          const Spacer(),
                          Text(
                            'Planned Visits (${routeState.plannedVisits.length})',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const Spacer(),
                          IconButton(
                            icon: const Icon(Icons.close),
                            onPressed: () => setState(() => _showPanel = false),
                          ),
                        ],
                      ),
                    ),
                    
                    // Customer List
                    Expanded(
                      child: PageView.builder(
                        controller: _pageController,
                        onPageChanged: (index) {
                          setState(() => _currentCustomerIndex = index);
                          _focusOnCustomer(routeState.plannedVisits[index].customer);
                        },
                        itemCount: routeState.plannedVisits.length,
                        itemBuilder: (context, index) {
                          final visit = routeState.plannedVisits[index];
                          return Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: CustomerVisitCard(
                              visit: visit,
                              isActive: index == _currentCustomerIndex,
                              onNavigate: () => _navigateToCustomer(visit.customer),
                              onCall: () => _callCustomer(visit.customer),
                              onMarkVisited: () => _markAsVisited(visit),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),

          // Floating Action Buttons
          Positioned(
            bottom: _showPanel ? MediaQuery.of(context).size.height * 0.4 + 20 : 20,
            right: 20,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (!_isOptimizing && routeState.plannedVisits.isNotEmpty)
                  FloatingActionButton(
                    heroTag: 'optimize',
                    onPressed: _optimizeRoute,
                    backgroundColor: Colors.orange,
                    child: const Icon(Icons.route),
                  ),
                const SizedBox(height: 12),
                FloatingActionButton(
                  heroTag: 'add',
                  onPressed: _addCustomerToRoute,
                  backgroundColor: Colors.blue,
                  child: const Icon(Icons.add_location),
                ),
              ],
            ),
          ),

          // Loading Overlay
          if (_isOptimizing)
            Container(
              color: Colors.black54,
              child: const Center(
                child: Card(
                  child: Padding(
                    padding: EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        CircularProgressIndicator(),
                        SizedBox(height: 16),
                        Text(
                          'Optimizing route...',
                          style: TextStyle(fontSize: 16),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon, Color color) {
    return Column(
      children: [
        Icon(icon, color: color, size: 20),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[600],
          ),
        ),
      ],
    );
  }

  String _formatDuration(Duration duration) {
    final hours = duration.inHours;
    final minutes = duration.inMinutes.remainder(60);
    if (hours > 0) {
      return '${hours}h ${minutes}m';
    }
    return '${minutes}m';
  }

  Future<void> _optimizeRoute() async {
    if (_currentPosition == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Current location not available')),
      );
      return;
    }

    setState(() => _isOptimizing = true);

    try {
      await ref.read(routeProvider.notifier).optimizeRoute(
        startLocation: LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
      );
      
      _updateMapWithRoute();
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Route optimized successfully!'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to optimize route: $e')),
      );
    } finally {
      setState(() => _isOptimizing = false);
    }
  }

  void _updateMapWithRoute() {
    final routeState = ref.read(routeProvider);
    final optimizedRoute = routeState.optimizedRoute;
    
    if (optimizedRoute == null) return;

    // Update markers
    final markers = <Marker>{};
    
    // Add current location marker
    if (_currentPosition != null) {
      markers.add(
        Marker(
          markerId: const MarkerId('current_location'),
          position: LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
          infoWindow: const InfoWindow(title: 'Your Location'),
        ),
      );
    }

    // Add customer markers
    for (int i = 0; i < optimizedRoute.waypoints.length; i++) {
      final waypoint = optimizedRoute.waypoints[i];
      markers.add(
        Marker(
          markerId: MarkerId('customer_${waypoint.customer.id}'),
          position: LatLng(waypoint.customer.latitude, waypoint.customer.longitude),
          icon: BitmapDescriptor.defaultMarkerWithHue(
            waypoint.isVisited ? BitmapDescriptor.hueGreen : BitmapDescriptor.hueRed,
          ),
          infoWindow: InfoWindow(
            title: waypoint.customer.displayName,
            snippet: 'Stop ${i + 1} • ${waypoint.estimatedArrival.format(context)}',
          ),
          onTap: () => _focusOnCustomer(waypoint.customer),
        ),
      );
    }

    // Add route polyline
    final polylines = <Polyline>{};
    if (optimizedRoute.routePoints.isNotEmpty) {
      polylines.add(
        Polyline(
          polylineId: const PolylineId('optimized_route'),
          points: optimizedRoute.routePoints,
          color: Colors.blue,
          width: 4,
          patterns: [PatternItem.dash(20), PatternItem.gap(10)],
        ),
      );
    }

    setState(() {
      _markers = markers;
      _polylines = polylines;
    });

    // Fit map to show all markers
    if (_mapController != null && markers.isNotEmpty) {
      _fitMapToMarkers();
    }
  }

  void _fitMapToMarkers() {
    if (_markers.isEmpty) return;

    double minLat = _markers.first.position.latitude;
    double maxLat = _markers.first.position.latitude;
    double minLng = _markers.first.position.longitude;
    double maxLng = _markers.first.position.longitude;

    for (final marker in _markers) {
      minLat = math.min(minLat, marker.position.latitude);
      maxLat = math.max(maxLat, marker.position.latitude);
      minLng = math.min(minLng, marker.position.longitude);
      maxLng = math.max(maxLng, marker.position.longitude);
    }

    _mapController?.animateCamera(
      CameraUpdate.newLatLngBounds(
        LatLngBounds(
          southwest: LatLng(minLat, minLng),
          northeast: LatLng(maxLat, maxLng),
        ),
        100.0, // padding
      ),
    );
  }

  void _focusOnCustomer(Customer customer) {
    _mapController?.animateCamera(
      CameraUpdate.newLatLngZoom(
        LatLng(customer.latitude, customer.longitude),
        16,
      ),
    );
  }

  void _addCustomerToRoute() {
    // Show customer selection dialog
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.7,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  const Text(
                    'Add Customer to Route',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),
            // Customer selection list would go here
            const Expanded(
              child: Center(
                child: Text('Customer selection UI would be implemented here'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _navigateToCustomer(Customer customer) {
    // Launch navigation app
    // Implementation would use url_launcher to open Google Maps
  }

  void _callCustomer(Customer customer) {
    // Make phone call
    // Implementation would use url_launcher to make a call
  }

  void _markAsVisited(PlannedVisit visit) {
    ref.read(routeProvider.notifier).markVisitAsCompleted(visit.id);
    _updateMapWithRoute();
  }
}
