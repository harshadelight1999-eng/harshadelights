import 'dart:math';
import 'package:flutter/material.dart';
import 'package:hive/hive.dart';
import 'package:json_annotation/json_annotation.dart';

part 'customer_model.g.dart';

@HiveType(typeId: 1)
@JsonSerializable()
class Customer {
  @HiveField(0)
  final String id;
  @HiveField(1)
  final String name;
  @HiveField(2)
  final String email;
  @HiveField(3)
  final String phone;
  @HiveField(4)
  final String businessName;
  @HiveField(5)
  final String businessType;
  @HiveField(6)
  final Address address;
  @HiveField(7)
  final CustomerTier tier;
  @HiveField(8)
  final CustomerStatus status;
  @HiveField(9)
  final double creditLimit;
  @HiveField(10)
  final double outstandingAmount;
  @HiveField(11)
  final DateTime lastOrderDate;
  @HiveField(12)
  final DateTime createdAt;
  @HiveField(13)
  final DateTime updatedAt;
  @HiveField(14)
  final List<String> tags;
  @HiveField(15)
  final String assignedSalesRep;
  @HiveField(16)
  final String territory;
  @HiveField(17)
  final double latitude;
  @HiveField(18)
  final double longitude;
  @HiveField(19)
  final List<ContactPerson> contacts;
  @HiveField(20)
  final CustomerPreferences preferences;
  @HiveField(21)
  final List<CustomerInteraction> interactions;
  @HiveField(22)
  final CustomerMetrics metrics;

  Customer({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.businessName,
    required this.businessType,
    required this.address,
    required this.tier,
    required this.status,
    required this.creditLimit,
    required this.outstandingAmount,
    required this.lastOrderDate,
    required this.createdAt,
    required this.updatedAt,
    required this.tags,
    required this.assignedSalesRep,
    required this.territory,
    required this.latitude,
    required this.longitude,
    required this.contacts,
    required this.preferences,
    required this.interactions,
    required this.metrics,
  });

  factory Customer.fromJson(Map<String, dynamic> json) => _$CustomerFromJson(json);
  Map<String, dynamic> toJson() => _$CustomerToJson(this);
}

@HiveType(typeId: 2)
@JsonSerializable()
class Address {
  @HiveField(0)
  final String street;
  @HiveField(1)
  final String city;
  @HiveField(2)
  final String state;
  @HiveField(3)
  final String zipCode;
  @HiveField(4)
  final String country;
  @HiveField(5)
  final String? landmark;
  @HiveField(6)
  final String? instructions;

  Address({
    required this.street,
    required this.city,
    required this.state,
    required this.zipCode,
    required this.country,
    this.landmark,
    this.instructions,
  });

  factory Address.fromJson(Map<String, dynamic> json) => _$AddressFromJson(json);
  Map<String, dynamic> toJson() => _$AddressToJson(this);
}

@HiveType(typeId: 3)
@JsonSerializable()
class ContactPerson {
  @HiveField(0)
  final String id;
  @HiveField(1)
  final String name;
  @HiveField(2)
  final String designation;
  @HiveField(3)
  final String email;
  @HiveField(4)
  final String phone;
  @HiveField(5)
  final bool isPrimary;
  @HiveField(6)
  final String? department;

  ContactPerson({
    required this.id,
    required this.name,
    required this.designation,
    required this.email,
    required this.phone,
    required this.isPrimary,
    this.department,
  });

  factory ContactPerson.fromJson(Map<String, dynamic> json) => _$ContactPersonFromJson(json);
  Map<String, dynamic> toJson() => _$ContactPersonToJson(this);
}

@HiveType(typeId: 4)
@JsonSerializable()
class CustomerPreferences {
  @HiveField(0)
  final List<String> preferredProducts;
  @HiveField(1)
  final String preferredDeliveryTime;
  @HiveField(2)
  final String paymentTerms;
  @HiveField(3)
  final bool allowsPromotionalEmails;
  @HiveField(4)
  final bool allowsSMSNotifications;
  @HiveField(5)
  final String orderFrequency;
  @HiveField(6)
  final double averageOrderValue;

  CustomerPreferences({
    required this.preferredProducts,
    required this.preferredDeliveryTime,
    required this.paymentTerms,
    required this.allowsPromotionalEmails,
    required this.allowsSMSNotifications,
    required this.orderFrequency,
    required this.averageOrderValue,
  });

  factory CustomerPreferences.fromJson(Map<String, dynamic> json) => _$CustomerPreferencesFromJson(json);
  Map<String, dynamic> toJson() => _$CustomerPreferencesToJson(this);
}

@HiveType(typeId: 5)
@JsonSerializable()
class CustomerInteraction {
  @HiveField(0)
  final String id;
  @HiveField(1)
  final InteractionType type;
  @HiveField(2)
  final String subject;
  @HiveField(3)
  final String description;
  @HiveField(4)
  final DateTime date;
  @HiveField(5)
  final String salesRep;
  @HiveField(6)
  final InteractionOutcome outcome;
  @HiveField(7)
  final String? followUpDate;
  @HiveField(8)
  final List<String>? attachments;

  CustomerInteraction({
    required this.id,
    required this.type,
    required this.subject,
    required this.description,
    required this.date,
    required this.salesRep,
    required this.outcome,
    this.followUpDate,
    this.attachments,
  });

  factory CustomerInteraction.fromJson(Map<String, dynamic> json) => _$CustomerInteractionFromJson(json);
  Map<String, dynamic> toJson() => _$CustomerInteractionToJson(this);
}

@HiveType(typeId: 6)
@JsonSerializable()
class CustomerMetrics {
  @HiveField(0)
  final double totalRevenue;
  @HiveField(1)
  final int totalOrders;
  @HiveField(2)
  final double averageOrderValue;
  @HiveField(3)
  final int daysSinceLastOrder;
  @HiveField(4)
  final double lifetimeValue;
  @HiveField(5)
  final int visitFrequency;
  @HiveField(6)
  final double conversionRate;
  @HiveField(7)
  final CustomerHealthScore healthScore;

  CustomerMetrics({
    required this.totalRevenue,
    required this.totalOrders,
    required this.averageOrderValue,
    required this.daysSinceLastOrder,
    required this.lifetimeValue,
    required this.visitFrequency,
    required this.conversionRate,
    required this.healthScore,
  });

  factory CustomerMetrics.fromJson(Map<String, dynamic> json) => _$CustomerMetricsFromJson(json);
  Map<String, dynamic> toJson() => _$CustomerMetricsToJson(this);
}

@HiveType(typeId: 10)
enum CustomerTier {
  @HiveField(0) bronze,
  @HiveField(1) silver,
  @HiveField(2) gold,
  @HiveField(3) platinum,
  @HiveField(4) diamond,
}

@HiveType(typeId: 11)
enum CustomerStatus {
  @HiveField(0) active,
  @HiveField(1) inactive,
  @HiveField(2) prospect,
  @HiveField(3) lead,
  @HiveField(4) churned,
  @HiveField(5) blocked,
}

@HiveType(typeId: 12)
enum InteractionType {
  @HiveField(0) call,
  @HiveField(1) email,
  @HiveField(2) meeting,
  @HiveField(3) visit,
  @HiveField(4) demo,
  @HiveField(5) followUp,
  @HiveField(6) complaint,
  @HiveField(7) support,
}

@HiveType(typeId: 13)
enum InteractionOutcome {
  @HiveField(0) successful,
  @HiveField(1) pending,
  @HiveField(2) failed,
  @HiveField(3) rescheduled,
  @HiveField(4) cancelled,
  @HiveField(5) converted,
}

@HiveType(typeId: 14)
enum CustomerHealthScore {
  @HiveField(0) excellent,
  @HiveField(1) good,
  @HiveField(2) average,
  @HiveField(3) poor,
  @HiveField(4) critical,
}

// Extension methods for better usability
extension CustomerExtension on Customer {
  bool get isActive => status == CustomerStatus.active;
  bool get isHighValue => tier == CustomerTier.platinum || tier == CustomerTier.diamond;
  bool get needsAttention => metrics.healthScore == CustomerHealthScore.poor || 
                            metrics.healthScore == CustomerHealthScore.critical;
  
  String get displayName => businessName.isNotEmpty ? businessName : name;
  
  String get tierDisplayName {
    switch (tier) {
      case CustomerTier.bronze:
        return 'Bronze';
      case CustomerTier.silver:
        return 'Silver';
      case CustomerTier.gold:
        return 'Gold';
      case CustomerTier.platinum:
        return 'Platinum';
      case CustomerTier.diamond:
        return 'Diamond';
    }
  }
  
  String get statusDisplayName {
    switch (status) {
      case CustomerStatus.active:
        return 'Active';
      case CustomerStatus.inactive:
        return 'Inactive';
      case CustomerStatus.prospect:
        return 'Prospect';
      case CustomerStatus.lead:
        return 'Lead';
      case CustomerStatus.churned:
        return 'Churned';
      case CustomerStatus.blocked:
        return 'Blocked';
    }
  }
  
  ContactPerson? get primaryContact {
    try {
      return contacts.firstWhere((contact) => contact.isPrimary);
    } catch (e) {
      return contacts.isNotEmpty ? contacts.first : null;
    }
  }
  
  bool get hasRecentActivity {
    return DateTime.now().difference(lastOrderDate).inDays <= 30;
  }
  
  double distanceFromCurrentLocation(double currentLat, double currentLng) {
    // Haversine formula for calculating distance
    const double earthRadius = 6371; // Earth's radius in kilometers
    
    double dLat = _degreesToRadians(latitude - currentLat);
    double dLng = _degreesToRadians(longitude - currentLng);
    
    double a = (sin(dLat / 2) * sin(dLat / 2)) +
        cos(_degreesToRadians(currentLat)) *
        cos(_degreesToRadians(latitude)) *
        sin(dLng / 2) *
        sin(dLng / 2);
    
    double c = 2 * atan2(sqrt(a), sqrt(1 - a));
    return earthRadius * c;
  }
  
  double _degreesToRadians(double degrees) {
    return degrees * (pi / 180);
  }
}

extension CustomerMetricsExtension on CustomerMetrics {
  String get healthScoreDisplayName {
    switch (healthScore) {
      case CustomerHealthScore.excellent:
        return 'Excellent';
      case CustomerHealthScore.good:
        return 'Good';
      case CustomerHealthScore.average:
        return 'Average';
      case CustomerHealthScore.poor:
        return 'Poor';
      case CustomerHealthScore.critical:
        return 'Critical';
    }
  }
  
  Color get healthScoreColor {
    switch (healthScore) {
      case CustomerHealthScore.excellent:
        return Colors.green;
      case CustomerHealthScore.good:
        return Colors.lightGreen;
      case CustomerHealthScore.average:
        return Colors.orange;
      case CustomerHealthScore.poor:
        return Colors.deepOrange;
      case CustomerHealthScore.critical:
        return Colors.red;
    }
  }
}
