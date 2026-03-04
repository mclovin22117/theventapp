import 'package:flutter/material.dart';
import '../models/post_model.dart';
import '../models/reply_model.dart';
import '../services/post_service.dart';

class PostDetailsScreen extends StatefulWidget {
  final PostModel post;

  const PostDetailsScreen({super.key, required this.post});

  @override
  State<PostDetailsScreen> createState() => _PostDetailsScreenState();
}

class _PostDetailsScreenState extends State<PostDetailsScreen> {
  final PostService _postService = PostService();
  final _replyController = TextEditingController();
  List<ReplyModel> _replies = [];
  bool _isLoadingReplies = true;
  bool _isSubmittingReply = false;
  late int _likesCount;

  @override
  void initState() {
    super.initState();
    _likesCount = widget.post.likesCount;
    _loadReplies();
  }

  Future<void> _loadReplies() async {
    setState(() => _isLoadingReplies = true);
    final replies = await _postService.getReplies(widget.post.id);
    setState(() {
      _replies = replies;
      _isLoadingReplies = false;
    });
  }

  Future<void> _likePost() async {
    // Save old state in case we need to revert
    final previousIsLiked = widget.post.isLiked;
    final previousLikesCount = _likesCount;

    // Update UI instantly
    setState(() {
      widget.post.isLiked = !widget.post.isLiked;
      _likesCount += widget.post.isLiked ? 1 : -1;
      widget.post.likesCount = _likesCount;
    });

    // Sync with database and get real result
    final isNowLiked = await _postService.toggleLike(widget.post);

    // Update with real DB result
    setState(() {
      widget.post.isLiked = isNowLiked;
      if (isNowLiked == previousIsLiked) {
        _likesCount = previousLikesCount;
        widget.post.likesCount = previousLikesCount;
      }
    });
  }

  Future<void> _submitReply() async {
    final content = _replyController.text.trim();

    if (content.isEmpty) return;

    setState(() => _isSubmittingReply = true);

    final result = await _postService.addReply(
      postId: widget.post.id,
      content: content,
    );

    setState(() => _isSubmittingReply = false);

    if (result['success']) {
      _replyController.clear();
      await _loadReplies();
    } else {
      _showMessage(result['message']);
    }
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: const Color(0xFF2C2C2C),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }

  String _timeAgo(DateTime dateTime) {
    final difference = DateTime.now().difference(dateTime);
    if (difference.inSeconds < 60) return 'just now';
    if (difference.inMinutes < 60) return '${difference.inMinutes}m ago';
    if (difference.inHours < 24) return '${difference.inHours}h ago';
    if (difference.inDays < 7) return '${difference.inDays}d ago';
    return '${(difference.inDays / 7).floor()}w ago';
  }

  @override
  void dispose() {
    _replyController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: true, // ← Add this
      backgroundColor: const Color(0xFF0D0D0D),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D0D0D),
        elevation: 0,
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          icon: const Icon(
            Icons.arrow_back_ios,
            color: Colors.white,
          ),
        ),
        title: const Text(
          'Vent',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: Column(
        children: [
          // Scrollable Content
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
        children: [
          // Scrollable Content
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Post Card
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1A1A1A),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: const Color(0xFF2C2C2C),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // User Info
                        Row(
                          children: [
                            CircleAvatar(
                              radius: 22,
                              backgroundColor: const Color(0xFF2C2C2C),
                              backgroundImage: widget.post.profilePictureUrl !=
                                          null &&
                                      widget.post.profilePictureUrl!.isNotEmpty
                                  ? NetworkImage(widget.post.profilePictureUrl!)
                                  : null,
                              child: widget.post.profilePictureUrl == null ||
                                      widget.post.profilePictureUrl!.isEmpty
                                  ? const Icon(
                                      Icons.person_outline,
                                      color: Color(0xFF9E9E9E),
                                      size: 22,
                                    )
                                  : null,
                            ),
                            const SizedBox(width: 10),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  widget.post.username,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 15,
                                  ),
                                ),
                                Text(
                                  _timeAgo(widget.post.createdAt),
                                  style: const TextStyle(
                                    color: Color(0xFF9E9E9E),
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),

                        // Full Post Content
                        Text(
                          widget.post.content,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 15,
                            height: 1.6,
                          ),
                        ),
                        const SizedBox(height: 14),

                        // Like Button
                        GestureDetector(
                          onTap: _likePost,
                          child: Row(
                            children: [
                              Icon(
                                widget.post.isLiked
                                    ? Icons.favorite
                                    : Icons.favorite_border,
                                color: widget.post.isLiked
                                    ? const Color(0xFFFF4D6D)
                                    : const Color(0xFF9E9E9E),
                                size: 22,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                '$_likesCount',
                                style: TextStyle(
                                  color: widget.post.isLiked
                                      ? const Color(0xFFFF4D6D)
                                      : const Color(0xFF9E9E9E),
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Replies Section Header
                  Row(
                    children: [
                      const Text(
                        'Replies',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFF7C4DFF).withOpacity(0.2),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          '${_replies.length}',
                          style: const TextStyle(
                            color: Color(0xFF7C4DFF),
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Replies List
                  _isLoadingReplies
                      ? const Center(
                          child: CircularProgressIndicator(
                            color: Color(0xFF7C4DFF),
                          ),
                        )
                      : _replies.isEmpty
                          ? const Center(
                              child: Padding(
                                padding: EdgeInsets.symmetric(vertical: 24),
                                child: Text(
                                  'No replies yet. Be the first to reply!',
                                  style: TextStyle(
                                    color: Color(0xFF9E9E9E),
                                    fontSize: 13,
                                  ),
                                ),
                              ),
                            )
                          : ListView.builder(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              itemCount: _replies.length,
                              itemBuilder: (context, index) {
                                final reply = _replies[index];
                                return Container(
                                  margin: const EdgeInsets.only(bottom: 10),
                                  padding: const EdgeInsets.all(14),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF1A1A1A),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: const Color(0xFF2C2C2C),
                                    ),
                                  ),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      // Reply User Info
                                      Row(
                                        children: [
                                          CircleAvatar(
                                            radius: 16,
                                            backgroundColor:
                                                const Color(0xFF2C2C2C),
                                            backgroundImage: reply
                                                            .profilePictureUrl !=
                                                        null &&
                                                    reply.profilePictureUrl!
                                                        .isNotEmpty
                                                ? NetworkImage(
                                                    reply.profilePictureUrl!)
                                                : null,
                                            child: reply.profilePictureUrl ==
                                                        null ||
                                                    reply.profilePictureUrl!
                                                        .isEmpty
                                                ? const Icon(
                                                    Icons.person_outline,
                                                    color: Color(0xFF9E9E9E),
                                                    size: 16,
                                                  )
                                                : null,
                                          ),
                                          const SizedBox(width: 8),
                                          Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                reply.username,
                                                style: const TextStyle(
                                                  color: Colors.white,
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 13,
                                                ),
                                              ),
                                              Text(
                                                _timeAgo(reply.createdAt),
                                                style: const TextStyle(
                                                  color: Color(0xFF9E9E9E),
                                                  fontSize: 11,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 8),

                                      // Reply Content
                                      Text(
                                        reply.content,
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 14,
                                          height: 1.5,
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              },
                            ),
                ],
              ),
            ),
          ),

          // Reply Input Box at Bottom
          Container(
            padding: EdgeInsets.only(
              left: 16,
              right: 16,
              top: 12,
              bottom: MediaQuery.of(context).viewInsets.bottom + 12,
            ),
            decoration: const BoxDecoration(
              color: Color(0xFF1A1A1A),
              border: Border(
                top: BorderSide(
                  color: Color(0xFF2C2C2C),
                  width: 1,
                ),
              ),
            ),
            child: Row(
              children: [
                // Reply Text Field
                Expanded(
                  child: TextField(
                    controller: _replyController,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                    ),
                    decoration: InputDecoration(
                      hintText: 'Write a reply...',
                      hintStyle: const TextStyle(
                        color: Color(0xFF9E9E9E),
                        fontSize: 14,
                      ),
                      filled: true,
                      fillColor: const Color(0xFF2C2C2C),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide.none,
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: const BorderSide(
                          color: Color(0xFF7C4DFF),
                          width: 1.5,
                        ),
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 10,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),

                // Send Button
                GestureDetector(
                  onTap: _isSubmittingReply ? null : _submitReply,
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: const BoxDecoration(
                      color: Color(0xFF7C4DFF),
                      shape: BoxShape.circle,
                    ),
                    child: _isSubmittingReply
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2,
                            ),
                          )
                        : const Icon(
                            Icons.send,
                            color: Colors.white,
                            size: 18,
                          ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}