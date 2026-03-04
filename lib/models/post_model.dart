class PostModel {
  final String id;
  final String userId;
  final String content;
  int likesCount;
  bool isLiked;
  final DateTime createdAt;
  final String username;
  final String? profilePictureUrl;

  PostModel({
    required this.id,
    required this.userId,
    required this.content,
    required this.likesCount,
    this.isLiked = false,
    required this.createdAt,
    required this.username,
    this.profilePictureUrl,
  });

  factory PostModel.fromMap(Map<String, dynamic> map) {
    return PostModel(
      id: map['id'],
      userId: map['user_id'],
      content: map['content'],
      likesCount: map['likes_count'] ?? 0,
      createdAt: DateTime.parse(map['created_at']),
      username: map['users']['username'],
      profilePictureUrl: map['users']['profile_picture_url'],
    );
  }
}