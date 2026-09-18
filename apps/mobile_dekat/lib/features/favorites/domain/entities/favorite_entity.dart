class FavoriteItem {
  final String id;
  final String staffId;
  final String staffName;
  final String? avatar;
  final String? specialties;

  const FavoriteItem({required this.id, required this.staffId, required this.staffName, this.avatar, this.specialties});

  factory FavoriteItem.fromJson(Map<String, dynamic> json) => FavoriteItem(
        id: json['id'] as String,
        staffId: (json['staffId'] ?? '') as String,
        staffName: (json['staffName'] ?? json['name'] ?? '') as String,
        avatar: json['avatar'] as String?,
        specialties: json['specialties'] as String?,
      );
}
