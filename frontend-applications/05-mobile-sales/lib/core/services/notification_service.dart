import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:logger/logger.dart';
import '../config/app_config.dart';

class NotificationService {
  static final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  static final FlutterLocalNotificationsPlugin _localNotifications = 
      FlutterLocalNotificationsPlugin();
  static final Logger _logger = Logger();

  static Future<void> init() async {
    // Request permissions
    await _requestPermissions();
    
    // Initialize local notifications
    await _initLocalNotifications();
    
    // Configure Firebase messaging
    await _configureFCM();
    
    // Get FCM token
    await _getFCMToken();
  }

  static Future<void> _requestPermissions() async {
    final settings = await _firebaseMessaging.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );

    _logger.i('Notification permission status: ${settings.authorizationStatus}');
  }

  static Future<void> _initLocalNotifications() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _localNotifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );

    // Create notification channel for Android
    const androidChannel = AndroidNotificationChannel(
      AppConfig.notificationChannelId,
      AppConfig.notificationChannelName,
      description: 'Notifications for sales team activities',
      importance: Importance.high,
    );

    await _localNotifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(androidChannel);
  }

  static Future<void> _configureFCM() async {
    // Handle foreground messages
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);
    
    // Handle background messages
    FirebaseMessaging.onBackgroundMessage(_handleBackgroundMessage);
    
    // Handle notification taps when app is terminated
    FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);
    
    // Check if app was opened from a notification
    final initialMessage = await _firebaseMessaging.getInitialMessage();
    if (initialMessage != null) {
      _handleNotificationTap(initialMessage);
    }
  }

  static Future<String?> _getFCMToken() async {
    try {
      final token = await _firebaseMessaging.getToken();
      _logger.i('FCM Token: $token');
      return token;
    } catch (e) {
      _logger.e('Error getting FCM token: $e');
      return null;
    }
  }

  static Future<void> _handleForegroundMessage(RemoteMessage message) async {
    _logger.i('Received foreground message: ${message.messageId}');
    
    // Show local notification
    await _showLocalNotification(
      title: message.notification?.title ?? 'New Notification',
      body: message.notification?.body ?? '',
      payload: message.data.toString(),
    );
  }

  static Future<void> _handleBackgroundMessage(RemoteMessage message) async {
    _logger.i('Received background message: ${message.messageId}');
    // Handle background message logic here
  }

  static void _handleNotificationTap(RemoteMessage message) {
    _logger.i('Notification tapped: ${message.messageId}');
    // Handle navigation based on message data
    final data = message.data;
    
    if (data.containsKey('type')) {
      switch (data['type']) {
        case 'new_order':
          // Navigate to orders page
          break;
        case 'lead_update':
          // Navigate to leads page
          break;
        case 'customer_message':
          // Navigate to customer detail
          break;
        default:
          // Navigate to dashboard
          break;
      }
    }
  }

  static void _onNotificationTapped(NotificationResponse response) {
    _logger.i('Local notification tapped: ${response.payload}');
    // Handle local notification tap
  }

  static Future<void> _showLocalNotification({
    required String title,
    required String body,
    String? payload,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      AppConfig.notificationChannelId,
      AppConfig.notificationChannelName,
      channelDescription: 'Notifications for sales team activities',
      importance: Importance.high,
      priority: Priority.high,
      showWhen: true,
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _localNotifications.show(
      DateTime.now().millisecondsSinceEpoch.remainder(100000),
      title,
      body,
      details,
      payload: payload,
    );
  }

  // Public methods for sending notifications
  static Future<void> showOrderNotification({
    required String orderId,
    required String customerName,
    required String status,
  }) async {
    await _showLocalNotification(
      title: 'Order Update',
      body: 'Order for $customerName is now $status',
      payload: 'order:$orderId',
    );
  }

  static Future<void> showLeadNotification({
    required String leadId,
    required String companyName,
    required String message,
  }) async {
    await _showLocalNotification(
      title: 'Lead Update',
      body: '$companyName: $message',
      payload: 'lead:$leadId',
    );
  }

  static Future<void> showFollowUpReminder({
    required String leadId,
    required String companyName,
  }) async {
    await _showLocalNotification(
      title: 'Follow-up Reminder',
      body: 'Time to follow up with $companyName',
      payload: 'followup:$leadId',
    );
  }

  static Future<void> showSyncNotification({
    required int itemsCount,
    required bool success,
  }) async {
    await _showLocalNotification(
      title: success ? 'Sync Complete' : 'Sync Failed',
      body: success 
          ? 'Successfully synced $itemsCount items'
          : 'Failed to sync data. Will retry later.',
      payload: 'sync:${success ? 'success' : 'failed'}',
    );
  }

  static Future<void> scheduleFollowUpReminder({
    required String leadId,
    required String companyName,
    required DateTime reminderTime,
  }) async {
    // Schedule a local notification for future delivery
    await _localNotifications.zonedSchedule(
      leadId.hashCode,
      'Follow-up Reminder',
      'Time to follow up with $companyName',
      reminderTime,
      const NotificationDetails(
        android: AndroidNotificationDetails(
          AppConfig.notificationChannelId,
          AppConfig.notificationChannelName,
          channelDescription: 'Follow-up reminders',
          importance: Importance.high,
          priority: Priority.high,
        ),
        iOS: DarwinNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        ),
      ),
      payload: 'followup:$leadId',
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
    );
  }

  static Future<void> cancelScheduledNotification(int id) async {
    await _localNotifications.cancel(id);
  }

  static Future<void> cancelAllNotifications() async {
    await _localNotifications.cancelAll();
  }
}
