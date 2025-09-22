import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../core/models/customer.dart';
import '../providers/route_planning_provider.dart';
import '../../../../shared/presentation/widgets/search_bar_widget.dart';
import '../widgets/route_summary_card.dart';
import '../widgets/customer_stop_card.dart';

class RoutePlanningPage extends ConsumerStatefulWidget {
  const RoutePlanningPage({super.key});

  @override
  ConsumerState<RoutePlanningPage> createState() => _RoutePlanningPageState();
}

class _RoutePlanningPageState extends ConsumerState<RoutePlanningPage> {
  GoogleMapController? _mapController;
  String _searchQuery = '';
  bool _showMap = true;

  @override
  Widget build(BuildContext context) {
    final routeState = ref.watch(routePlanningProvider);
    final routeNotifier = ref.read(routePlanningProvider.notifier);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Route Planning'),
        actions: [
          IconButton(
            icon: Icon(_showMap ? Icons.list : Icons.map),
            onPressed: () {
              setState(() {
                _showMap = !_showMap;
              });
            },
          ),
          if (routeState.selectedCustomers.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.route),
              onPressed: () => _optimizeRoute(),
            ),
        ],
      ),
      body: Column(
        children: [
          // Search and Controls
          Container(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                SearchBarWidget(
                  hintText: 'Search customers to add to route...',
                  onChanged: (value) {
                    setState(() {
                      _searchQuery = value;
                    });
                  },
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: routeState.selectedCustomers.isNotEmpty
                            ? () => _optimizeRoute()
                            : null,
                        icon: const Icon(Icons.auto_fix_high),
                        label: const Text('Optimize Route'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: routeState.selectedCustomers.isNotEmpty
                            ? () => routeNotifier.clearRoute()
                            : null,
                        icon: const Icon(Icons.clear),
                        label: const Text('Clear Route'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Route Summary
          if (routeState.optimizedRoute != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: RouteSummaryCard(
                route: routeState.optimizedRoute!,
                onStartNavigation: () => _startNavigation(),
              ),
            ),

          // Content
          Expanded(
            child: _showMap ? _buildMapView() : _buildListView(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _getCurrentLocation(),
        child: const Icon(Icons.my_location),
      ),
    );
  }

  Widget _buildMapView() {
    final routeState = ref.watch(routePlanningProvider);

    return GoogleMap(
      onMapCreated: (GoogleMapController controller) {
        _mapController = controller;
      },
      initialCameraPosition: const CameraPosition(
        target: LatLng(28.6139, 77.2090), // Delhi coordinates
        zoom: 12,
      ),
      markers: _buildMarkers(routeState.selectedCustomers),
      polylines: routeState.optimizedRoute != null
          ? {
              Polyline(
                polylineId: const PolylineId('route'),
                points: routeState.optimizedRoute!.waypoints
                    .map((point) => LatLng(point.latitude, point.longitude))
                    .toList(),
                color: AppTheme.primaryOrange,
                width: 4,
              ),
            }
          : {},
      myLocationEnabled: true,
      myLocationButtonEnabled: false,
    );
  }

  Widget _buildListView() {
    final routeState = ref.watch(routePlanningProvider);
    final availableCustomers = _getFilteredCustomers();

    return Column(
      children: [
        // Selected Customers
        if (routeState.selectedCustomers.isNotEmpty) ...[
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                Text(
                  'Route Stops (${routeState.selectedCustomers.length})',
                  style: AppTheme.heading3,
                ),
                const Spacer(),
                Text(
                  'Drag to reorder',
                  style: AppTheme.bodySmall,
                ),
              ],
            ),
          ),
          SizedBox(
            height: 200,
            child: ReorderableListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: routeState.selectedCustomers.length,
              onReorder: (oldIndex, newIndex) {
                ref.read(routePlanningProvider.notifier)
                    .reorderCustomers(oldIndex, newIndex);
              },
              itemBuilder: (context, index) {
                final customer = routeState.selectedCustomers[index];
                return Container(
                  key: ValueKey(customer.id),
                  width: 280,
                  margin: const EdgeInsets.only(left: 16, right: 8),
                  child: CustomerStopCard(
                    customer: customer,
                    stopNumber: index + 1,
                    onRemove: () {
                      ref.read(routePlanningProvider.notifier)
                          .removeCustomer(customer);
                    },
                  ),
                );
              },
            ),
          ),
          const Divider(),
        ],

        // Available Customers
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: availableCustomers.length,
            itemBuilder: (context, index) {
              final customer = availableCustomers[index];
              final isSelected = routeState.selectedCustomers
                  .any((c) => c.id == customer.id);

              return Card(
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: isSelected
                        ? AppTheme.primaryOrange
                        : AppTheme.textLight,
                    child: Text(
                      customer.name.substring(0, 1).toUpperCase(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  title: Text(customer.name),
                  subtitle: Text(
                    '${customer.address.city}, ${customer.address.state}',
                  ),
                  trailing: isSelected
                      ? const Icon(Icons.check_circle, color: AppTheme.success)
                      : IconButton(
                          icon: const Icon(Icons.add_circle_outline),
                          onPressed: () {
                            ref.read(routePlanningProvider.notifier)
                                .addCustomer(customer);
                          },
                        ),
                  onTap: isSelected
                      ? null
                      : () {
                          ref.read(routePlanningProvider.notifier)
                              .addCustomer(customer);
                        },
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Set<Marker> _buildMarkers(List<Customer> customers) {
    return customers.asMap().entries.map((entry) {
      final index = entry.key;
      final customer = entry.value;
      
      if (customer.address.latitude == null || customer.address.longitude == null) {
        return null;
      }

      return Marker(
        markerId: MarkerId(customer.id),
        position: LatLng(
          customer.address.latitude!,
          customer.address.longitude!,
        ),
        infoWindow: InfoWindow(
          title: customer.name,
          snippet: customer.address.city,
        ),
        icon: BitmapDescriptor.defaultMarkerWithHue(
          index == 0
              ? BitmapDescriptor.hueGreen // Start
              : index == customers.length - 1
                  ? BitmapDescriptor.hueRed // End
                  : BitmapDescriptor.hueOrange, // Waypoint
        ),
      );
    }).whereType<Marker>().toSet();
  }

  List<Customer> _getFilteredCustomers() {
    // TODO: Get customers from provider
    // For now, return empty list
    return [];
  }

  Future<void> _getCurrentLocation() async {
    try {
      final permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        final requestPermission = await Geolocator.requestPermission();
        if (requestPermission == LocationPermission.denied) {
          return;
        }
      }

      final position = await Geolocator.getCurrentPosition();
      
      if (_mapController != null) {
        await _mapController!.animateCamera(
          CameraUpdate.newLatLng(
            LatLng(position.latitude, position.longitude),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to get location: $e'),
            backgroundColor: AppTheme.error,
          ),
        );
      }
    }
  }

  Future<void> _optimizeRoute() async {
    final routeNotifier = ref.read(routePlanningProvider.notifier);
    
    try {
      await routeNotifier.optimizeRoute();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Route optimized successfully'),
            backgroundColor: AppTheme.success,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to optimize route: $e'),
            backgroundColor: AppTheme.error,
          ),
        );
      }
    }
  }

  void _startNavigation() {
    // TODO: Integrate with navigation app
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Navigation integration - Coming Soon'),
      ),
    );
  }
}
