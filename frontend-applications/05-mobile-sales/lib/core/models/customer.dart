import 'package:hive/hive.dart';
import 'package:json_annotation/json_annotation.dart';

part 'customer.g.dart';

@HiveType(typeId: 0)
@JsonSerializable()
class Customer {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String name;

  @HiveField(2)
  final String email;

  @HiveField(3)
  final String? phone;

  @HiveField(4)
  final String? gstNumber;

  @HiveField(5)
  final CustomerTier tier;

  @HiveField(6)
  final Address address;

  @HiveField(7)
  final double creditLimit;

  @HiveField(8)
  final double creditUtilized;

  @HiveField(9)
  final String paymentTerms;

  @HiveField(10)
  final CustomerStatus status;

  @HiveField(11)
  final DateTime createdAt;

  @HiveField(12)
  final DateTime lastOrderDate;

  @HiveField(13)
  final double totalOrderValue;

  @HiveField(14)
  final int totalOrders;

  @HiveField(15)
  final String? notes;

  Customer({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.gstNumber,
    required this.tier,
    required this.address,
    required this.creditLimit,
    required this.creditUtilized,
    required this.paymentTerms,
    required this.status,
    required this.createdAt,
    required this.lastOrderDate,
    required this.totalOrderValue,
    required this.totalOrders,
    this.notes,
  });

  factory Customer.fromJson(Map<String, dynamic> json) => _$CustomerFromJson(json);
  Map<String, dynamic> toJson() => _$CustomerToJson(this);

  double get creditAvailable => creditLimit - creditUtilized;
  double get creditUtilizationPercentage => (creditUtilized / creditLimit) * 100;
  bool get isOverdue => creditUtilized > creditLimit;

  Customer copyWith({
    String? id,
    String? name,
    String? email,
    String? phone,
    String? gstNumber,
    CustomerTier? tier,
    Address? address,
    double? creditLimit,
    double? creditUtilized,
    String? paymentTerms,
    CustomerStatus? status,
    DateTime? createdAt,
    DateTime? lastOrderDate,
    double? totalOrderValue,
    int? totalOrders,
    String? notes,
  }) {
    return Customer(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      gstNumber: gstNumber ?? this.gstNumber,
      tier: tier ?? this.tier,
      address: address ?? this.address,
      creditLimit: creditLimit ?? this.creditLimit,
      creditUtilized: creditUtilized ?? this.creditUtilized,
      paymentTerms: paymentTerms ?? this.paymentTerms,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      lastOrderDate: lastOrderDate ?? this.lastOrderDate,
      totalOrderValue: totalOrderValue ?? this.totalOrderValue,
      totalOrders: totalOrders ?? this.totalOrders,
      notes: notes ?? this.notes,
    );
  }
}

@HiveType(typeId: 1)
@JsonSerializable()
class Address {
  @HiveField(0)
  final String street;

  @HiveField(1)
  final String city;

  @HiveField(2)
  final String state;

  @HiveField(3)
  final String pincode;

  @HiveField(4)
  final String country;

  @HiveField(5)
  final double? latitude;

  @HiveField(6)
  final double? longitude;

  Address({
    required this.street,
    required this.city,
    required this.state,
    required this.pincode,
    required this.country,
    this.latitude,
    this.longitude,
  });

  factory Address.fromJson(Map<String, dynamic> json) => _$AddressFromJson(json);
  Map<String, dynamic> toJson() => _$AddressToJson(this);

  String get fullAddress => '$street, $city, $state $pincode, $country';
}

@HiveType(typeId: 2)
enum CustomerTier {
  @HiveField(0)
  gold,
  @HiveField(1)
  silver,
  @HiveField(2)
  bronze,
}

@HiveType(typeId: 3)
enum CustomerStatus {
  @HiveField(0)
  active,
  @HiveField(1)
  inactive,
  @HiveField(2)
  suspended,
  @HiveField(3)
  pending,
}
