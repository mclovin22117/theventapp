import 'dart:io';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  final _supabase = Supabase.instance.client;

  // Register new user
  Future<Map<String, dynamic>> register({
    required String username,
    required String password,
    File? profileImage,
  }) async {
    try {
      // Step 1: Check if username already exists
      final existingUser = await _supabase
          .from('users')
          .select()
          .eq('username', username)
          .maybeSingle();

      if (existingUser != null) {
        return {
          'success': false,
          'message': 'Username already taken. Try another one.',
        };
      }

      // Step 2: Upload profile picture if provided
      String? profilePictureUrl;
      if (profileImage != null) {
        final fileName =
            '${username}_${DateTime.now().millisecondsSinceEpoch}.jpg';

        await _supabase.storage.from('profiles').upload(
              fileName,
              profileImage,
              fileOptions: const FileOptions(
                contentType: 'image/jpeg',
                upsert: true,
              ),
            );

        profilePictureUrl =
            _supabase.storage.from('profiles').getPublicUrl(fileName);
      }

      // Step 3: Insert user into database
      await _supabase.from('users').insert({
        'username': username,
        'password': password,
        'profile_picture_url': profilePictureUrl,
      });

      return {
        'success': true,
        'message': 'Account created successfully!',
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'Something went wrong. Please try again.',
      };
    }
  }

  // Login user
  Future<Map<String, dynamic>> login({
    required String username,
    required String password,
  }) async {
    try {
      // Find user by username and password
      final user = await _supabase
          .from('users')
          .select()
          .eq('username', username)
          .eq('password', password)
          .maybeSingle();

      if (user == null) {
        return {
          'success': false,
          'message': 'Invalid username or password.',
        };
      }

      // Save user session locally
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_id', user['id']);
      await prefs.setString('username', user['username']);
      await prefs.setString(
          'profile_picture_url', user['profile_picture_url'] ?? '');

      return {
        'success': true,
        'message': 'Login successful!',
        'user': user,
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'Something went wrong. Please try again.',
      };
    }
  }

  // Logout user
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }

  // Get current logged in user
  Future<Map<String, dynamic>?> getCurrentUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userId = prefs.getString('user_id');
    if (userId == null) return null;

    return {
      'user_id': userId,
      'username': prefs.getString('username'),
      'profile_picture_url': prefs.getString('profile_picture_url'),
    };
  }
}