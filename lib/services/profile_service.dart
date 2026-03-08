import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:image_picker/image_picker.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ProfileService {
  final _supabase = Supabase.instance.client;
  final _imagePicker = ImagePicker();

  // Get current user profile
  Future<Map<String, dynamic>?> getProfile() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getString('user_id');
      if (userId == null) return null;

      final response = await _supabase
          .from('users')
          .select('*, posts(count)')
          .eq('id', userId)
          .single();

      // ← Fix: Extract count correctly from posts array
      final postCount = (response['posts'] as List).isNotEmpty
          ? response['posts'][0]['count'] ?? 0
          : 0;

      return {
        ...response,
        'post_count': postCount, // ← Add flat post_count field
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
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getString('user_id');
      if (userId == null) {
        return {'success': false, 'message': 'Not logged in'};
      }

      final fileName = '$userId/profile.jpg';
      final bytes = await image.readAsBytes();

      // Upload to Supabase Storage
      await _supabase.storage.from('avatars').uploadBinary(
            fileName,
            bytes,
            fileOptions: const FileOptions(
              upsert: true,
              contentType: 'image/jpeg',
            ),
          );

      // Get public URL
      final publicUrl =
          _supabase.storage.from('avatars').getPublicUrl(fileName);

      // Update user profile
      await _supabase.from('users').update({
        'profile_picture_url': '$publicUrl?t=${DateTime.now().millisecondsSinceEpoch}',
      }).eq('id', userId);

      return {'success': true, 'url': publicUrl};
    } catch (e) {
      return {'success': false, 'message': 'Failed to upload image'};
    }
  }

  // Remove profile picture
  Future<Map<String, dynamic>> removeProfilePicture() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getString('user_id');
      if (userId == null) {
        return {'success': false, 'message': 'Not logged in'};
      }

      final fileName = '$userId/profile.jpg';

      // Delete from storage
      await _supabase.storage.from('avatars').remove([fileName]);

      // Update user profile
      await _supabase.from('users').update({
        'profile_picture_url': null,
      }).eq('id', userId);

      return {'success': true};
    } catch (e) {
      return {'success': false, 'message': 'Failed to remove image'};
    }
  }

  // Logout
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    await _supabase.auth.signOut();
  }
}