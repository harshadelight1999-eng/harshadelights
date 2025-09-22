import 'package:hive/hive.dart';
import 'package:json_annotation/json_annotation.dart';
import 'address.dart';

part 'lead.g.dart';

@HiveType(typeId: 9)
@JsonSerializable()
class Lead {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String companyName;

  @HiveField(2)
  final String contactPerson;

  @HiveField(3)
  final String email;

  @HiveField(4)
  final String? phone;

  @HiveField(5)
  final Address address;

  @HiveField(6)
  final LeadStatus status;

  @HiveField(7)
  final LeadSource source;

  @HiveField(8)
  final double estimatedValue;

  @HiveField(9)
  final DateTime createdAt;

  @HiveField(10)
  final DateTime? lastContactDate;

  @HiveField(11)
  final DateTime? nextFollowUpDate;

  @HiveField(12)
  final String? notes;

  @HiveField(13)
  final List<String> interestedProducts;

  @HiveField(14)
  final String salesPersonId;

  @HiveField(15)
  final int priority; // 1-5, 5 being highest

  Lead({
    required this.id,
    required this.companyName,
    required this.contactPerson,
    required this.email,
    this.phone,
    required this.address,
    required this.status,
    required this.source,
    required this.estimatedValue,
    required this.createdAt,
    this.lastContactDate,
    this.nextFollowUpDate,
    this.notes,
    required this.interestedProducts,
    required this.salesPersonId,
    required this.priority,
  });

  factory Lead.fromJson(Map<String, dynamic> json) => _$LeadFromJson(json);
  Map<String, dynamic> toJson() => _$LeadToJson(this);

  bool get isOverdue => nextFollowUpDate != null && 
      nextFollowUpDate!.isBefore(DateTime.now());

  int get daysSinceCreated => DateTime.now().difference(createdAt).inDays;

  Lead copyWith({
    String? id,
    String? companyName,
    String? contactPerson,
    String? email,
    String? phone,
    Address? address,
    LeadStatus? status,
    LeadSource? source,
    double? estimatedValue,
    DateTime? createdAt,
    DateTime? lastContactDate,
    DateTime? nextFollowUpDate,
    String? notes,
    List<String>? interestedProducts,
    String? salesPersonId,
    int? priority,
  }) {
    return Lead(
      id: id ?? this.id,
      companyName: companyName ?? this.companyName,
      contactPerson: contactPerson ?? this.contactPerson,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      address: address ?? this.address,
      status: status ?? this.status,
      source: source ?? this.source,
      estimatedValue: estimatedValue ?? this.estimatedValue,
      createdAt: createdAt ?? this.createdAt,
      lastContactDate: lastContactDate ?? this.lastContactDate,
      nextFollowUpDate: nextFollowUpDate ?? this.nextFollowUpDate,
      notes: notes ?? this.notes,
      interestedProducts: interestedProducts ?? this.interestedProducts,
      salesPersonId: salesPersonId ?? this.salesPersonId,
      priority: priority ?? this.priority,
    );
  }
}

@HiveType(typeId: 10)
enum LeadStatus {
  @HiveField(0)
  new_lead,
  @HiveField(1)
  contacted,
  @HiveField(2)
  qualified,
  @HiveField(3)
  proposal_sent,
  @HiveField(4)
  negotiation,
  @HiveField(5)
  won,
  @HiveField(6)
  lost,
  @HiveField(7)
  follow_up,
}

@HiveType(typeId: 11)
enum LeadSource {
  @HiveField(0)
  website,
  @HiveField(1)
  referral,
  @HiveField(2)
  cold_call,
  @HiveField(3)
  trade_show,
  @HiveField(4)
  social_media,
  @HiveField(5)
  advertisement,
  @HiveField(6)
  walk_in,
  @HiveField(7)
  other,
}
