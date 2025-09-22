import 'package:hive/hive.dart';
import 'package:json_annotation/json_annotation.dart';

part 'user.g.dart';

@HiveType(typeId: 5)
@JsonSerializable()
class User extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String email;

  @HiveField(2)
  final String name;

  @HiveField(3)
  final String? phone;

  @HiveField(4)
  final UserRole role;

  @HiveField(5)
  final String? profileImage;

  @HiveField(6)
  final DateTime createdAt;

  @HiveField(7)
  final DateTime lastLogin;

  @HiveField(8)
  final bool isActive;

  @HiveField(9)
  final Map<String, dynamic>? metadata;

  User({
    required this.id,
    required this.email,
    required this.name,
    this.phone,
    required this.role,
    this.profileImage,
    required this.createdAt,
    required this.lastLogin,
    this.isActive = true,
    this.metadata,
  });

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);

  User copyWith({
    String? id,
    String? email,
    String? name,
    String? phone,
    UserRole? role,
    String? profileImage,
    DateTime? createdAt,
    DateTime? lastLogin,
    bool? isActive,
    Map<String, dynamic>? metadata,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      role: role ?? this.role,
      profileImage: profileImage ?? this.profileImage,
      createdAt: createdAt ?? this.createdAt,
      lastLogin: lastLogin ?? this.lastLogin,
      isActive: isActive ?? this.isActive,
      metadata: metadata ?? this.metadata,
    );
  }

  String get displayName => name.isNotEmpty ? name : email;
  String get initials {
    final parts = name.split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name.isNotEmpty ? name[0].toUpperCase() : email[0].toUpperCase();
  }
}

@HiveType(typeId: 6)
enum UserRole {
  @HiveField(0)
  customer,
  
  @HiveField(1)
  salesRep,
  
  @HiveField(2)
  admin,
  
  @HiveField(3)
  manager,
}

@JsonSerializable()
class LoginResponse {
  final User user;
  final String token;
  final String refreshToken;
  final DateTime expiresAt;

  LoginResponse({
    required this.user,
    required this.token,
    required this.refreshToken,
    required this.expiresAt,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) => _$LoginResponseFromJson(json);
  Map<String, dynamic> toJson() => _$LoginResponseToJson(this);
}

@JsonSerializable()
class RefreshTokenResponse {
  final User user;
  final String token;
  final DateTime expiresAt;

  RefreshTokenResponse({
    required this.user,
    required this.token,
    required this.expiresAt,
  });

  factory RefreshTokenResponse.fromJson(Map<String, dynamic> json) => _$RefreshTokenResponseFromJson(json);
  Map<String, dynamic> toJson() => _$RefreshTokenResponseToJson(this);
}
