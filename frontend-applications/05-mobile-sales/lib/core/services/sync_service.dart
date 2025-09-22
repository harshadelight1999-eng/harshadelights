import 'dart:async';
import 'dart:isolate';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:logger/logger.dart';

import '../config/app_config.dart';
import '../models/customer.dart';
import '../models/order.dart';
import '../models/product.dart';
import '../models/lead.dart';
import 'storage_service.dart';
import 'api_service.dart';
import 'notification_service.dart';

class SyncService {
  static final Logger _logger = Logger();
  static Timer? _syncTimer;
  static bool _isSyncing = false;
  static StreamSubscription<ConnectivityResult>? _connectivitySubscription;

  static Future<void> init() async {
    // Listen for connectivity changes
    _connectivitySubscription = Connectivity().onConnectivityChanged.listen(
      (ConnectivityResult result) {
        if (result != ConnectivityResult.none) {
          // Connected to internet, trigger sync
          _triggerSync();
        }
      },
    );

    // Start periodic sync timer
    _startPeriodicSync();

    // Perform initial sync if connected
    final connectivityResult = await Connectivity().checkConnectivity();
    if (connectivityResult != ConnectivityResult.none) {
      _triggerSync();
    }
  }

  static void dispose() {
    _syncTimer?.cancel();
    _connectivitySubscription?.cancel();
  }

  static void _startPeriodicSync() {
    _syncTimer = Timer.periodic(AppConfig.syncInterval, (timer) {
      _triggerSync();
    });
  }

  static void _triggerSync() {
    if (!_isSyncing) {
      unawaited(performSync());
    }
  }

  static Future<bool> performSync() async {
    if (_isSyncing) {
      _logger.w('Sync already in progress');
      return false;
    }

    _isSyncing = true;
    _logger.i('Starting sync process');

    try {
      // Check connectivity
      final connectivityResult = await Connectivity().checkConnectivity();
      if (connectivityResult == ConnectivityResult.none) {
        _logger.w('No internet connection, skipping sync');
        return false;
      }

      // Upload offline data first
      final uploadSuccess = await _uploadOfflineData();
      
      // Download latest data
      final downloadSuccess = await _downloadLatestData();

      final success = uploadSuccess && downloadSuccess;
      
      if (success) {
        await StorageService.setLastSyncTime(DateTime.now());
        _logger.i('Sync completed successfully');
        
        await NotificationService.showSyncNotification(
          itemsCount: await _getUnsyncedItemsCount(),
          success: true,
        );
      } else {
        _logger.e('Sync failed');
        await NotificationService.showSyncNotification(
          itemsCount: 0,
          success: false,
        );
      }

      return success;
    } catch (e) {
      _logger.e('Sync error: $e');
      await NotificationService.showSyncNotification(
        itemsCount: 0,
        success: false,
      );
      return false;
    } finally {
      _isSyncing = false;
    }
  }

  static Future<bool> _uploadOfflineData() async {
    try {
      _logger.i('Uploading offline data');

      // Get unsynced data
      final unsyncedOrders = StorageService.getUnsyncedOrders();
      final unsyncedLeads = StorageService.getAllLeads()
          .where((lead) => lead.id.startsWith('offline_'))
          .toList();
      final unsyncedCustomers = StorageService.getAllCustomers()
          .where((customer) => customer.id.startsWith('offline_'))
          .toList();

      if (unsyncedOrders.isEmpty && unsyncedLeads.isEmpty && unsyncedCustomers.isEmpty) {
        _logger.i('No offline data to upload');
        return true;
      }

      // Upload to server
      final request = OfflineSyncRequest(
        orders: unsyncedOrders,
        leads: unsyncedLeads,
        customers: unsyncedCustomers,
      );

      final response = await ApiClient.instance.uploadOfflineData(request);

      if (response.success) {
        // Mark orders as synced
        for (final orderId in response.syncedOrderIds) {
          final order = StorageService.getOrder(orderId);
          if (order != null) {
            await StorageService.saveOrder(order.copyWith(isSynced: true));
          }
        }

        // Update lead IDs if they were created on server
        for (int i = 0; i < response.syncedLeadIds.length; i++) {
          if (i < unsyncedLeads.length) {
            final oldId = unsyncedLeads[i].id;
            final newId = response.syncedLeadIds[i];
            
            // Delete old lead and save with new ID
            await StorageService.deleteLead(oldId);
            await StorageService.saveLead(
              unsyncedLeads[i].copyWith(id: newId),
            );
          }
        }

        // Update customer IDs if they were created on server
        for (int i = 0; i < response.syncedCustomerIds.length; i++) {
          if (i < unsyncedCustomers.length) {
            final oldId = unsyncedCustomers[i].id;
            final newId = response.syncedCustomerIds[i];
            
            // Delete old customer and save with new ID
            await StorageService.deleteCustomer(oldId);
            await StorageService.saveCustomer(
              unsyncedCustomers[i].copyWith(id: newId),
            );
          }
        }

        _logger.i('Offline data uploaded successfully');
        return true;
      } else {
        _logger.e('Failed to upload offline data: ${response.message}');
        return false;
      }
    } catch (e) {
      _logger.e('Error uploading offline data: $e');
      return false;
    }
  }

  static Future<bool> _downloadLatestData() async {
    try {
      _logger.i('Downloading latest data');

      final lastSync = StorageService.getLastSyncTime();
      final response = await ApiClient.instance.downloadSyncData(
        lastSync?.toIso8601String(),
      );

      // Save customers
      if (response.customers.isNotEmpty) {
        await StorageService.saveCustomers(response.customers);
        _logger.i('Downloaded ${response.customers.length} customers');
      }

      // Save products
      if (response.products.isNotEmpty) {
        await StorageService.saveProducts(response.products);
        _logger.i('Downloaded ${response.products.length} products');
      }

      // Save orders (only server orders, not offline ones)
      final serverOrders = response.orders
          .where((order) => !order.id.startsWith('offline_'))
          .toList();
      if (serverOrders.isNotEmpty) {
        await StorageService.saveOrders(serverOrders);
        _logger.i('Downloaded ${serverOrders.length} orders');
      }

      _logger.i('Latest data downloaded successfully');
      return true;
    } catch (e) {
      _logger.e('Error downloading latest data: $e');
      return false;
    }
  }

  static Future<int> _getUnsyncedItemsCount() async {
    final unsyncedOrders = StorageService.getUnsyncedOrders().length;
    final unsyncedLeads = StorageService.getAllLeads()
        .where((lead) => lead.id.startsWith('offline_'))
        .length;
    final unsyncedCustomers = StorageService.getAllCustomers()
        .where((customer) => customer.id.startsWith('offline_'))
        .length;
    
    return unsyncedOrders + unsyncedLeads + unsyncedCustomers;
  }

  // Manual sync trigger
  static Future<bool> forcSync() async {
    _logger.i('Manual sync triggered');
    return await performSync();
  }

  // Background sync using isolate
  static Future<void> performBackgroundSync() async {
    try {
      final receivePort = ReceivePort();
      await Isolate.spawn(_backgroundSyncIsolate, receivePort.sendPort);
      
      final result = await receivePort.first as bool;
      _logger.i('Background sync completed: $result');
    } catch (e) {
      _logger.e('Background sync error: $e');
    }
  }

  static void _backgroundSyncIsolate(SendPort sendPort) async {
    try {
      // Initialize services in isolate
      await StorageService.init();
      ApiClient.init();
      
      // Perform sync
      final result = await performSync();
      sendPort.send(result);
    } catch (e) {
      sendPort.send(false);
    }
  }

  // Sync status
  static bool get isSyncing => _isSyncing;

  static DateTime? get lastSyncTime => StorageService.getLastSyncTime();

  static Future<bool> isOnline() async {
    final connectivityResult = await Connectivity().checkConnectivity();
    return connectivityResult != ConnectivityResult.none;
  }

  // Conflict resolution
  static Future<void> resolveConflicts() async {
    // TODO: Implement conflict resolution logic
    // This would handle cases where the same data was modified
    // both offline and on the server
    _logger.i('Conflict resolution not yet implemented');
  }

  // Data validation before sync
  static bool _validateDataBeforeSync(dynamic data) {
    // TODO: Implement data validation
    // Check for required fields, data integrity, etc.
    return true;
  }

  // Retry failed syncs
  static Future<void> retryFailedSyncs() async {
    final unsyncedCount = await _getUnsyncedItemsCount();
    if (unsyncedCount > 0) {
      _logger.i('Retrying sync for $unsyncedCount unsynced items');
      await performSync();
    }
  }

  // Clean up old data
  static Future<void> cleanupOldData() async {
    try {
      final cutoffDate = DateTime.now().subtract(const Duration(days: 30));
      
      // Clean up old orders
      final allOrders = StorageService.getAllOrders();
      for (final order in allOrders) {
        if (order.createdAt.isBefore(cutoffDate) && order.isSynced) {
          await StorageService.deleteOrder(order.id);
        }
      }

      _logger.i('Old data cleanup completed');
    } catch (e) {
      _logger.e('Error during data cleanup: $e');
    }
  }
}

// Helper function for unawaited futures
void unawaited(Future<void> future) {
  future.catchError((error) {
    Logger().e('Unawaited future error: $error');
  });
}
