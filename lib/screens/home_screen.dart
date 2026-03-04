import 'package:flutter/material.dart';
import '../models/post_model.dart';
import '../services/post_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final PostService _postService = PostService();
  List<PostModel> _posts = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPosts();
  }

  Future<void> _loadPosts() async {
    setState(() => _isLoading = true);
    final posts = await _postService.getPosts();
    setState(() {
      _posts = posts;
      _isLoading = false;
    });
  }

  // Toggle like instantly on home screen
  Future<void> _toggleLike(PostModel post) async {
    // Save old state in case we need to revert
    final previousIsLiked = post.isLiked;
    final previousLikesCount = post.likesCount;

    // Update UI instantly
    setState(() {
      post.isLiked = !post.isLiked;
      post.likesCount += post.isLiked ? 1 : -1;
    });

    // Sync with database and get real result
    final isNowLiked = await _postService.toggleLike(post);

    // Update with real DB result
    setState(() {
      post.isLiked = isNowLiked;
      // If DB result differs from our optimistic update, revert count
      if (isNowLiked == previousIsLiked) {
        post.likesCount = previousLikesCount;
      }
    });
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
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D0D0D),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D0D0D),
        elevation: 0,
        title: Row(
          children: [
            Image.asset(
              'assets/images/logo.png',
              width: 32,
              height: 32,
            ),
            const SizedBox(width: 8),
            const Text(
              'TheVent',
              style: TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.0,
              ),
            ),
          ],
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: IconButton(
              onPressed: () {
                Navigator.pushNamed(context, '/post')
                    .then((_) => _loadPosts());
              },
              icon: Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: const Color(0xFF7C4DFF),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.add,
                  color: Colors.white,
                  size: 20,
                ),
              ),
            ),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(
                color: Color(0xFF7C4DFF),
              ),
            )
          : _posts.isEmpty
              ? const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.inbox_outlined,
                        color: Color(0xFF9E9E9E),
                        size: 64,
                      ),
                      SizedBox(height: 16),
                      Text(
                        'No vents yet',
                        style: TextStyle(
                          color: Color(0xFF9E9E9E),
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      SizedBox(height: 8),
                      Text(
                        'Be the first one to vent!',
                        style: TextStyle(
                          color: Color(0xFF9E9E9E),
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadPosts,
                  color: const Color(0xFF7C4DFF),
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                    itemCount: _posts.length,
                    itemBuilder: (context, index) {
                      final post = _posts[index];
                      return GestureDetector(
                        onTap: () {
                          Navigator.pushNamed(
                            context,
                            '/post-details',
                            arguments: post,
                          ).then((_) {
                            // Refresh likes count when coming back
                            setState(() {});
                          });
                        },
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1A1A1A),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: const Color(0xFF2C2C2C),
                              width: 1,
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // User Info Row
                              Row(
                                children: [
                                  CircleAvatar(
                                    radius: 20,
                                    backgroundColor:
                                        const Color(0xFF2C2C2C),
                                    backgroundImage: post.profilePictureUrl !=
                                                null &&
                                            post.profilePictureUrl!.isNotEmpty
                                        ? NetworkImage(
                                            post.profilePictureUrl!)
                                        : null,
                                    child: post.profilePictureUrl == null ||
                                            post.profilePictureUrl!.isEmpty
                                        ? const Icon(
                                            Icons.person_outline,
                                            color: Color(0xFF9E9E9E),
                                            size: 20,
                                          )
                                        : null,
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          post.username,
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontWeight: FontWeight.bold,
                                            fontSize: 14,
                                          ),
                                        ),
                                        Text(
                                          _timeAgo(post.createdAt),
                                          style: const TextStyle(
                                            color: Color(0xFF9E9E9E),
                                            fontSize: 12,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),

                              // Post Content
                              Text(
                                post.content,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 14,
                                  height: 1.5,
                                ),
                                maxLines: 4,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 12),

                              // Like Button
                              GestureDetector(
                                onTap: () => _toggleLike(post),
                                child: Row(
                                  children: [
                                    Icon(
                                      post.isLiked
                                          ? Icons.favorite
                                          : Icons.favorite_border,
                                      color: post.isLiked
                                          ? const Color(0xFFFF4D6D)
                                          : const Color(0xFF9E9E9E),
                                      size: 20,
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      '${post.likesCount}',
                                      style: TextStyle(
                                        color: post.isLiked
                                            ? const Color(0xFFFF4D6D)
                                            : const Color(0xFF9E9E9E),
                                        fontSize: 13,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}