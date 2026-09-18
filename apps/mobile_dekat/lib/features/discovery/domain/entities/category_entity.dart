class CategoryEntity {
  final String id;
  final String name;
  final String? icon;

  const CategoryEntity({required this.id, required this.name, this.icon});
}

class FaqEntity {
  final String id;
  final String question;
  final String answer;
  final String? category;
  final int sortOrder;
  final bool isActive;

  const FaqEntity({
    required this.id,
    required this.question,
    required this.answer,
    this.category,
    this.sortOrder = 0,
    this.isActive = true,
  });
}

class PolicyEntity {
  final String id;
  final String title;
  final String body;
  final String type;
  final int version;
  final bool isActive;

  const PolicyEntity({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    this.version = 1,
    this.isActive = true,
  });
}
