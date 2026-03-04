import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/post_model.dart';
import '../models/reply_model.dart';

class PostService {
  final _supabase = Supabase.instance.client;

  // Fetch all posts with like status
  Future<List<PostModel>> getPosts() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final currentUserId = prefs.getString('user_id');

      final response = await _supabase
          .from('posts')
          .select('*, users(username, profile_picture_url)')
          .order('created_at', ascending: false);

      final posts = (response as List)
          .map((post) => PostModel.fromMap(post))
          .toList();

      // Check which posts current user has liked
      if (currentUserId != null) {
        final likes = await _supabase
            .from('likes')
            .select('post_id')
            .eq('user_id', currentUserId);

        final likedPostIds = (likes as List)
            .map((like) => like['post_id'] as String)
            .toSet();

        for (var post in posts) {
          post.isLiked = likedPostIds.contains(post.id);
        }
      }

      return posts;
    } catch (e) {
      return [];
    }
  }

  // Create a new post
  Future<Map<String, dynamic>> createPost({
    required String content,
  }) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getString('user_id');

      if (userId == null) {
        return {
          'success': false,
          'message': 'You must be logged in to post.',
        };
      }

      await _supabase.from('posts').insert({
        'user_id': userId,
        'content': content,
      });

      return {
        'success': true,
        'message': 'Vent posted successfully!',
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'Something went wrong. Please try again.',
      };
    }
  }

  // Toggle like — strictly one like per user per post
  Future<bool> toggleLike(PostModel post) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getString('user_id');

      if (userId == null) return post.isLiked;

      // Always check actual DB state first
      final existingLike = await _supabase
          .from('likes')
          .select()
          .eq('post_id', post.id)
          .eq('user_id', userId)
          .maybeSingle();

      if (existingLike != null) {
        // Already liked → Unlike
        await _supabase
            .from('likes')
            .delete()
            .eq('post_id', post.id)
            .eq('user_id', userId);

        // Get real count from DB
        final countResponse = await _supabase
            .from('likes')
            .select()
            .eq('post_id', post.id);

        final realCount = (countResponse as List).length;

        await _supabase
            .from('posts')
            .update({'likes_count': realCount}).eq('id', post.id);

        return false; // not liked
      } else {
        // Not liked yet → Like
        await _supabase.from('likes').insert({
          'post_id': post.id,
          'user_id': userId,
        });

        // Get real count from DB
        final countResponse = await _supabase
            .from('likes')
            .select()
            .eq('post_id', post.id);

        final realCount = (countResponse as List).length;

        await _supabase
            .from('posts')
            .update({'likes_count': realCount}).eq('id', post.id);

        return true; // liked
      }
    } catch (e) {
      return post.isLiked;
    }
  }

  // Get replies for a post
  Future<List<ReplyModel>> getReplies(String postId) async {
    try {
      final response = await _supabase
          .from('replies')
          .select('*, users(username, profile_picture_url)')
          .eq('post_id', postId)
          .order('created_at', ascending: true);

      return (response as List)
          .map((reply) => ReplyModel.fromMap(reply))
          .toList();
    } catch (e) {
      return [];
    }
  }

  // Add a reply to a post
  Future<Map<String, dynamic>> addReply({
    required String postId,
    required String content,
  }) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getString('user_id');

      if (userId == null) {
        return {
          'success': false,
          'message': 'You must be logged in to reply.',
        };
      }

      await _supabase.from('replies').insert({
        'post_id': postId,
        'user_id': userId,
        'content': content,
      });

      return {
        'success': true,
        'message': 'Reply added!',
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'Something went wrong. Please try again.',
      };
    }
  }
}