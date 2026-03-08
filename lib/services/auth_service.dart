import 'dart:io';
import 'package:supabase_flutter/supabase_flutter.dart';

class AuthService {
  final _supabase = Supabase.instance.client;

  // Register new user
  Future<Map<String, dynamic>> register({
    required String username,
    required String password,
    File? profileImage,
  }) async {
    try {
      // Check if username already exists
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

      // ← Use Supabase Auth to register
      final authResponse = await _supabase.auth.signUp(
        email: '$username@theventapp.com', // ← Fake email using username
        password: password,
        data: {
          'username': username,
          'profile_picture_url': profilePictureUrl,
        },
      );

      if (authResponse.user == null) {
        return {
          'success': false,
          'message': 'Registration failed. Please try again.',
        };
      }

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
      print('🔐 Attempting login for: $username');

      final authResponse = await _supabase.auth.signInWithPassword(
        email: '$username@theventapp.com',
        password: password,
      );

      print('✅ Auth Response: ${authResponse.user}');

      if (authResponse.user == null) {
        return {
          'success': false,
          'message': 'Invalid username or password.',
        };
      }

      return {
        'success': true,
        'message': 'Login successful!',
        'user': authResponse.user,
      };
    } on AuthException catch (e) {
      print('❌ AUTH EXCEPTION: ${e.message}'); // ← This will show exact error
      return {
        'success': false,
        'message': e.message,  // ← Show exact Supabase error
      };
    } catch (e) {
      print('❌ LOGIN ERROR: $e');
      return {
        'success': false,
        'message': e.toString(), // ← Show exact error
      };
    }
  }

  // Logout user
  Future<void> logout() async {
    await _supabase.auth.signOut();
  }

  // Get current logged in user
  Future<Map<String, dynamic>?> getCurrentUser() async {
    try {
      final authUser = _supabase.auth.currentUser;
      if (authUser == null) return null;

      // ← Fetch user profile from users table using auth_id
      final profile = await _supabase
          .from('users')
          .select()
          .eq('auth_id', authUser.id)
          .single();

      return {
        'user_id': profile['id'],
        'auth_id': authUser.id,
        'username': profile['username'],
        'profile_picture_url': profile['profile_picture_url'] ?? '',
      };
    } catch (e) {
      print('GET CURRENT USER ERROR: $e');
      return null;
    }
  }

  // Check if user is logged in
  bool isLoggedIn() {
    return _supabase.auth.currentUser != null;
  }
}