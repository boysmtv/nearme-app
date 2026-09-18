class StaffEntity {
  final String id;
  final String name;
  final String? displayName;
  final String? title;
  final String? bio;
  final String? avatar;
  final List<String> specialties;
  final double rating;
  final int reviewCount;

  const StaffEntity({
    required this.id,
    required this.name,
    this.displayName,
    this.title,
    this.bio,
    this.avatar,
    this.specialties = const [],
    this.rating = 0,
    this.reviewCount = 0,
  });
}
