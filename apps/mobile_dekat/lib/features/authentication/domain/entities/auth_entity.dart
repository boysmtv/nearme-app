class AuthUser {
  final String id;
  final String email;
  final String? name;
  final String role;
  final bool hasProfile;

  const AuthUser({required this.id, required this.email, this.name, required this.role, this.hasProfile = false});

  factory AuthUser.fromJson(Map<String, dynamic> json) => AuthUser(
        id: json['id'] as String,
        email: (json['email'] ?? '') as String,
        name: json['name'] as String?,
        role: (json['role'] ?? 'ROLE_CUSTOMER') as String,
        hasProfile: json['hasProfile'] == true,
      );
}

class AuthTokens {
  final String accessToken;
  final String refreshToken;
  const AuthTokens({required this.accessToken, required this.refreshToken});
}
