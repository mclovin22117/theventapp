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
      // ← Use RPC to check if username exists (avoids direct table read)
      final existingUser = await _supabase
          .rpc('check_username_exists', params: {'p_username': username});

      if (existingUser == true) {
        return {
          'success': false,
          'message': 'Username already taken. Try another one.',
        };
      }

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

      await _supabase.rpc('register_user', params: {
        'p_username': username,
        'p_password': password,
        'p_profile_picture_url': profilePictureUrl,
      });

      return {
        'success': true,
        'message': 'Account created successfully!',
      };
    } catch (e) {
      print('REGISTER ERROR: $e');
      return {
        'success': false,
        'message': 'Something went wrong. Please try again later.',
      };
    }
  }

  // Login user
  Future<Map<String, dynamic>> login({
    required String username,
    required String password,
  }) async {
    try {
      final result = await _supabase.rpc('login_user', params: {
        'p_username': username,
        'p_password': password,
      });

      print('LOGIN RESULT: $result');

      if (result == null || result.isEmpty) {
        return {
          'success': false,
          'message': 'Invalid username or password.',
        };
      }

      final user = result[0];

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_id', user['id'].toString());
      await prefs.setString('username', user['username'].toString());
      await prefs.setString(
          'profile_picture_url', user['profile_picture_url']?.toString() ?? '');

      return {
        'success': true,
        'message': 'Login successful!',
        'user': user,
      };
    } catch (e) {
      print('LOGIN ERROR: $e');
      return {
        'success': false,
        'message': 'Something went wrong. Please try again later.',
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