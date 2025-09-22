import 'package:hive/hive.dart';
import 'package:json_annotation/json_annotation.dart';

part 'product.g.dart';

@HiveType(typeId: 7)
@JsonSerializable()
class Product {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String sku;

  @HiveField(2)
  final String name;

  @HiveField(3)
  final String description;

  @HiveField(4)
  final String category;

  @HiveField(5)
  final List<String> images;

  @HiveField(6)
  final double basePrice;

  @HiveField(7)
  final String unit;

  @HiveField(8)
  final int minimumOrderQuantity;

  @HiveField(9)
  final bool inStock;

  @HiveField(10)
  final int stockQuantity;

  @HiveField(11)
  final Map<String, String> specifications;

  @HiveField(12)
  final DateTime createdAt;

  @HiveField(13)
  final DateTime updatedAt;

  Product({
    required this.id,
    required this.sku,
    required this.name,
    required this.description,
    required this.category,
    required this.images,
    required this.basePrice,
    required this.unit,
    required this.minimumOrderQuantity,
    required this.inStock,
    required this.stockQuantity,
    required this.specifications,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Product.fromJson(Map<String, dynamic> json) => _$ProductFromJson(json);
  Map<String, dynamic> toJson() => _$ProductToJson(this);

  String get primaryImage => images.isNotEmpty ? images.first : '';
  bool get isLowStock => stockQuantity < minimumOrderQuantity * 2;

  Product copyWith({
    String? id,
    String? sku,
    String? name,
    String? description,
    String? category,
    List<String>? images,
    double? basePrice,
    String? unit,
    int? minimumOrderQuantity,
    bool? inStock,
    int? stockQuantity,
    Map<String, String>? specifications,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Product(
      id: id ?? this.id,
      sku: sku ?? this.sku,
      name: name ?? this.name,
      description: description ?? this.description,
      category: category ?? this.category,
      images: images ?? this.images,
      basePrice: basePrice ?? this.basePrice,
      unit: unit ?? this.unit,
      minimumOrderQuantity: minimumOrderQuantity ?? this.minimumOrderQuantity,
      inStock: inStock ?? this.inStock,
      stockQuantity: stockQuantity ?? this.stockQuantity,
      specifications: specifications ?? this.specifications,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

@HiveType(typeId: 8)
@JsonSerializable()
class ProductWithPricing extends Product {
  @HiveField(14)
  final double customerPrice;

  @HiveField(15)
  final double discount;

  @HiveField(16)
  final String discountType;

  ProductWithPricing({
    required super.id,
    required super.sku,
    required super.name,
    required super.description,
    required super.category,
    required super.images,
    required super.basePrice,
    required super.unit,
    required super.minimumOrderQuantity,
    required super.inStock,
    required super.stockQuantity,
    required super.specifications,
    required super.createdAt,
    required super.updatedAt,
    required this.customerPrice,
    required this.discount,
    required this.discountType,
  });

  factory ProductWithPricing.fromJson(Map<String, dynamic> json) => _$ProductWithPricingFromJson(json);
  Map<String, dynamic> toJson() => _$ProductWithPricingToJson(this);

  double get savings => basePrice - customerPrice;
  double get savingsPercentage => (savings / basePrice) * 100;
}
