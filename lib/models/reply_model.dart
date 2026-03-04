class ReplyModel {
  final String id;
  final String postId;
  final String userId;
  final String content;
  final DateTime createdAt;
  final String username;
  final String? profilePictureUrl;

  ReplyModel({
    required this.id,
    required this.postId,
    required this.userId,
    required this.content,
    required this.createdAt,
    required this.username,
    this.profilePictureUrl,
  });

  factory ReplyModel.fromMap(Map<String, dynamic> map) {
    return ReplyModel(
      id: map['id'],
      postId: map['post_id'],
      userId: map['user_id'],
      content: map['content'],
      createdAt: DateTime.parse(map['created_at']),
      username: map['users']['username'],
      profilePictureUrl: map['users']['profile_picture_url'],
    );
  }
}