import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:image_picker/image_picker.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class ProfileService {
  final _supabase = Supabase.instance.client;
  final _imagePicker = ImagePicker();

  // Get current user profile
  Future<Map<String, dynamic>?> getProfile() async {
    try {
      // ← Use Supabase Auth session instead of SharedPreferences
      final authUser = _supabase.auth.currentUser;
      if (authUser == null) return null;

      final response = await _supabase
          .from('users')
          .select('*, posts(count)')
          .eq('auth_id', authUser.id) // ← Use auth_id instead of id
          .single();

      final postCount = (response['posts'] as List).isNotEmpty
          ? response['posts'][0]['count'] ?? 0
          : 0;

      return {
        ...response,
        'post_count': postCount,
      };
    } catch (e) {
      print('GET PROFILE ERROR: $e');
      return null;
    }
  }

  // Pick image from gallery
  Future<XFile?> pickImage() async {
    try {
      final image = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 512,
        maxHeight: 512,
        imageQuality: 80,
      );
      return image;
    } catch (e) {
      return null;
    }
  }

  // Upload profile picture to Supabase Storage
  Future<Map<String, dynamic>> uploadProfilePicture(XFile image) async {
    try {
      // ← Use Supabase Auth session instead of SharedPreferences
      final authUser = _supabase.auth.currentUser;
      if (authUser == null) {
        return {'success': false, 'message': 'Not logged in'};
      }

      // Get user id from users table
      final userProfile = await _supabase
          .from('users')
          .select('id')
          .eq('auth_id', authUser.id)
          .single();

      final userId = userProfile['id'];
      final fileName = '$userId/profile.jpg';
      final bytes = await image.readAsBytes();

      await _supabase.storage.from('avatars').uploadBinary(
            fileName,
            bytes,
            fileOptions: const FileOptions(
              upsert: true,
              contentType: 'image/jpeg',
            ),
          );

      final publicUrl =
          _supabase.storage.from('avatars').getPublicUrl(fileName);

      await _supabase.from('users').update({
        'profile_picture_url':
            '$publicUrl?t=${DateTime.now().millisecondsSinceEpoch}',
      }).eq('auth_id', authUser.id); // ← Use auth_id

      return {'success': true, 'url': publicUrl};
    } catch (e) {
      return {'success': false, 'message': 'Failed to upload image'};
    }
  }

  // Remove profile picture
  Future<Map<String, dynamic>> removeProfilePicture() async {
    try {
      // ← Use Supabase Auth session instead of SharedPreferences
      final authUser = _supabase.auth.currentUser;
      if (authUser == null) {
        return {'success': false, 'message': 'Not logged in'};
      }

      final userProfile = await _supabase
          .from('users')
          .select('id')
          .eq('auth_id', authUser.id)
          .single();

      final userId = userProfile['id'];
      final fileName = '$userId/profile.jpg';

      await _supabase.storage.from('avatars').remove([fileName]);

      await _supabase.from('users').update({
        'profile_picture_url': null,
      }).eq('auth_id', authUser.id); // ← Use auth_id

      return {'success': true};
    } catch (e) {
      return {'success': false, 'message': 'Failed to remove image'};
    }
  }

  // Logout
  Future<void> logout() async {
    await _supabase.auth.signOut(); // ← Only Supabase Auth signout needed
  }
}