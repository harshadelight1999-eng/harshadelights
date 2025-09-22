import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'customer_selection_widget.dart';
import '../../crm/models/customer_model.dart';
import '../../crm/providers/customer_provider.dart';

class RouteOptimizationDialog extends ConsumerStatefulWidget {
  final String? currentTerritory;
  final Function(List<String> customerIds, RouteOptimizationSettings settings) onOptimize;

  const RouteOptimizationDialog({
    Key? key,
    this.currentTerritory,
    required this.onOptimize,
  }) : super(key: key);

  @override
  ConsumerState<RouteOptimizationDialog> createState() => _RouteOptimizationDialogState();
}

class _RouteOptimizationDialogState extends ConsumerState<RouteOptimizationDialog>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<String> _selectedCustomerIds = [];
  RouteOptimizationSettings _settings = RouteOptimizationSettings();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      insetPadding: const EdgeInsets.all(16),
      child: Container(
        width: double.infinity,
        height: MediaQuery.of(context).size.height * 0.8,
        child: Column(
          children: [
            _buildHeader(),
            _buildTabBar(),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildCustomerSelectionTab(),
                  _buildSettingsTab(),
                ],
              ),
            ),
            _buildActionButtons(),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.blue[50],
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(12),
          topRight: Radius.circular(12),
        ),
      ),
      child: Row(
        children: [
          const Icon(Icons.route, color: Colors.blue),
          const SizedBox(width: 12),
          const Expanded(
            child: Text(
              'Route Optimization',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          IconButton(
            onPressed: () => Navigator.of(context).pop(),
            icon: const Icon(Icons.close),
          ),
        ],
      ),
    );
  }

  Widget _buildTabBar() {
    return TabBar(
      controller: _tabController,
      tabs: const [
        Tab(
          icon: Icon(Icons.people),
          text: 'Customers',
        ),
        Tab(
          icon: Icon(Icons.settings),
          text: 'Settings',
        ),
      ],
    );
  }

  Widget _buildCustomerSelectionTab() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: CustomerSelectionWidget(
        selectedCustomerIds: _selectedCustomerIds,
        onSelectionChanged: (customerIds) {
          setState(() {
            _selectedCustomerIds = customerIds;
          });
        },
        territoryFilter: widget.currentTerritory,
      ),
    );
  }

  Widget _buildSettingsTab() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildOptimizationTypeSection(),
            const SizedBox(height: 24),
            _buildConstraintsSection(),
            const SizedBox(height: 24),
            _buildPreferencesSection(),
          ],
        ),
      ),
    );
  }

  Widget _buildOptimizationTypeSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Optimization Type',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        ...RouteOptimizationType.values.map((type) {
          return RadioListTile<RouteOptimizationType>(
            title: Text(_getOptimizationTypeTitle(type)),
            subtitle: Text(_getOptimizationTypeDescription(type)),
            value: type,
            groupValue: _settings.optimizationType,
            onChanged: (value) {
              setState(() {
                _settings = _settings.copyWith(optimizationType: value);
              });
            },
          );
        }).toList(),
      ],
    );
  }

  Widget _buildConstraintsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Route Constraints',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        
        // Max stops per route
        ListTile(
          title: const Text('Max Stops per Route'),
          subtitle: Text('${_settings.maxStopsPerRoute} stops'),
          trailing: SizedBox(
            width: 100,
            child: Slider(
              value: _settings.maxStopsPerRoute.toDouble(),
              min: 5,
              max: 20,
              divisions: 15,
              onChanged: (value) {
                setState(() {
                  _settings = _settings.copyWith(maxStopsPerRoute: value.round());
                });
              },
            ),
          ),
        ),
        
        // Max route duration
        ListTile(
          title: const Text('Max Route Duration'),
          subtitle: Text('${_settings.maxRouteDurationHours} hours'),
          trailing: SizedBox(
            width: 100,
            child: Slider(
              value: _settings.maxRouteDurationHours.toDouble(),
              min: 4,
              max: 12,
              divisions: 8,
              onChanged: (value) {
                setState(() {
                  _settings = _settings.copyWith(maxRouteDurationHours: value.round());
                });
              },
            ),
          ),
        ),
        
        // Start time
        ListTile(
          title: const Text('Route Start Time'),
          subtitle: Text(_settings.startTime.format(context)),
          trailing: IconButton(
            icon: const Icon(Icons.access_time),
            onPressed: () async {
              final time = await showTimePicker(
                context: context,
                initialTime: _settings.startTime,
              );
              if (time != null) {
                setState(() {
                  _settings = _settings.copyWith(startTime: time);
                });
              }
            },
          ),
        ),
      ],
    );
  }

  Widget _buildPreferencesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Preferences',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        
        SwitchListTile(
          title: const Text('Avoid Toll Roads'),
          subtitle: const Text('Route will avoid toll roads when possible'),
          value: _settings.avoidTolls,
          onChanged: (value) {
            setState(() {
              _settings = _settings.copyWith(avoidTolls: value);
            });
          },
        ),
        
        SwitchListTile(
          title: const Text('Prioritize High-Value Customers'),
          subtitle: const Text('Premium and Gold tier customers get priority'),
          value: _settings.prioritizeHighValue,
          onChanged: (value) {
            setState(() {
              _settings = _settings.copyWith(prioritizeHighValue: value);
            });
          },
        ),
        
        SwitchListTile(
          title: const Text('Include Return to Start'),
          subtitle: const Text('Route will end at the starting location'),
          value: _settings.returnToStart,
          onChanged: (value) {
            setState(() {
              _settings = _settings.copyWith(returnToStart: value);
            });
          },
        ),
      ],
    );
  }

  Widget _buildActionButtons() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border(
          top: BorderSide(color: Colors.grey[300]!),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: OutlinedButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel'),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: ElevatedButton(
              onPressed: _selectedCustomerIds.isEmpty ? null : () {
                widget.onOptimize(_selectedCustomerIds, _settings);
                Navigator.of(context).pop();
              },
              child: const Text('Optimize Route'),
            ),
          ),
        ],
      ),
    );
  }

  String _getOptimizationTypeTitle(RouteOptimizationType type) {
    switch (type) {
      case RouteOptimizationType.shortest:
        return 'Shortest Distance';
      case RouteOptimizationType.fastest:
        return 'Fastest Time';
      case RouteOptimizationType.balanced:
        return 'Balanced';
    }
  }

  String _getOptimizationTypeDescription(RouteOptimizationType type) {
    switch (type) {
      case RouteOptimizationType.shortest:
        return 'Minimize total distance traveled';
      case RouteOptimizationType.fastest:
        return 'Minimize total travel time';
      case RouteOptimizationType.balanced:
        return 'Balance distance and time';
    }
  }
}

enum RouteOptimizationType {
  shortest,
  fastest,
  balanced,
}

class RouteOptimizationSettings {
  final RouteOptimizationType optimizationType;
  final int maxStopsPerRoute;
  final int maxRouteDurationHours;
  final TimeOfDay startTime;
  final bool avoidTolls;
  final bool prioritizeHighValue;
  final bool returnToStart;

  RouteOptimizationSettings({
    this.optimizationType = RouteOptimizationType.balanced,
    this.maxStopsPerRoute = 10,
    this.maxRouteDurationHours = 8,
    this.startTime = const TimeOfDay(hour: 9, minute: 0),
    this.avoidTolls = false,
    this.prioritizeHighValue = true,
    this.returnToStart = true,
  });

  RouteOptimizationSettings copyWith({
    RouteOptimizationType? optimizationType,
    int? maxStopsPerRoute,
    int? maxRouteDurationHours,
    TimeOfDay? startTime,
    bool? avoidTolls,
    bool? prioritizeHighValue,
    bool? returnToStart,
  }) {
    return RouteOptimizationSettings(
      optimizationType: optimizationType ?? this.optimizationType,
      maxStopsPerRoute: maxStopsPerRoute ?? this.maxStopsPerRoute,
      maxRouteDurationHours: maxRouteDurationHours ?? this.maxRouteDurationHours,
      startTime: startTime ?? this.startTime,
      avoidTolls: avoidTolls ?? this.avoidTolls,
      prioritizeHighValue: prioritizeHighValue ?? this.prioritizeHighValue,
      returnToStart: returnToStart ?? this.returnToStart,
    );
  }
}
