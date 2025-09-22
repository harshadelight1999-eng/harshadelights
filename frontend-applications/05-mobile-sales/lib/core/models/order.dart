import 'package:hive/hive.dart';
import 'package:json_annotation/json_annotation.dart';

part 'order.g.dart';

@HiveType(typeId: 4)
@JsonSerializable()
class Order {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String orderNumber;

  @HiveField(2)
  final String customerId;

  @HiveField(3)
  final String customerName;

  @HiveField(4)
  final String salesPersonId;

  @HiveField(5)
  final List<OrderItem> items;

  @HiveField(6)
  final double subtotal;

  @HiveField(7)
  final double tax;

  @HiveField(8)
  final double discount;

  @HiveField(9)
  final double total;

  @HiveField(10)
  final OrderStatus status;

  @HiveField(11)
  final DateTime createdAt;

  @HiveField(12)
  final DateTime? deliveryDate;

  @HiveField(13)
  final String? notes;

  @HiveField(14)
  final String? deliveryAddress;

  @HiveField(15)
  final bool isOfflineOrder;

  @HiveField(16)
  final bool isSynced;

  Order({
    required this.id,
    required this.orderNumber,
    required this.customerId,
    required this.customerName,
    required this.salesPersonId,
    required this.items,
    required this.subtotal,
    required this.tax,
    required this.discount,
    required this.total,
    required this.status,
    required this.createdAt,
    this.deliveryDate,
    this.notes,
    this.deliveryAddress,
    this.isOfflineOrder = false,
    this.isSynced = true,
  });

  factory Order.fromJson(Map<String, dynamic> json) => _$OrderFromJson(json);
  Map<String, dynamic> toJson() => _$OrderToJson(this);

  int get totalItems => items.fold(0, (sum, item) => sum + item.quantity);
  
  Order copyWith({
    String? id,
    String? orderNumber,
    String? customerId,
    String? customerName,
    String? salesPersonId,
    List<OrderItem>? items,
    double? subtotal,
    double? tax,
    double? discount,
    double? total,
    OrderStatus? status,
    DateTime? createdAt,
    DateTime? deliveryDate,
    String? notes,
    String? deliveryAddress,
    bool? isOfflineOrder,
    bool? isSynced,
  }) {
    return Order(
      id: id ?? this.id,
      orderNumber: orderNumber ?? this.orderNumber,
      customerId: customerId ?? this.customerId,
      customerName: customerName ?? this.customerName,
      salesPersonId: salesPersonId ?? this.salesPersonId,
      items: items ?? this.items,
      subtotal: subtotal ?? this.subtotal,
      tax: tax ?? this.tax,
      discount: discount ?? this.discount,
      total: total ?? this.total,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      deliveryDate: deliveryDate ?? this.deliveryDate,
      notes: notes ?? this.notes,
      deliveryAddress: deliveryAddress ?? this.deliveryAddress,
      isOfflineOrder: isOfflineOrder ?? this.isOfflineOrder,
      isSynced: isSynced ?? this.isSynced,
    );
  }
}

@HiveType(typeId: 5)
@JsonSerializable()
class OrderItem {
  @HiveField(0)
  final String productId;

  @HiveField(1)
  final String productName;

  @HiveField(2)
  final String sku;

  @HiveField(3)
  final int quantity;

  @HiveField(4)
  final double unitPrice;

  @HiveField(5)
  final double totalPrice;

  @HiveField(6)
  final String unit;

  OrderItem({
    required this.productId,
    required this.productName,
    required this.sku,
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
    required this.unit,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) => _$OrderItemFromJson(json);
  Map<String, dynamic> toJson() => _$OrderItemToJson(this);
}

@HiveType(typeId: 6)
enum OrderStatus {
  @HiveField(0)
  draft,
  @HiveField(1)
  pending,
  @HiveField(2)
  confirmed,
  @HiveField(3)
  processing,
  @HiveField(4)
  shipped,
  @HiveField(5)
  delivered,
  @HiveField(6)
  cancelled,
  @HiveField(7)
  returned,
}
