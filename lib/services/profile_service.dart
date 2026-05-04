import 'dart:io';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:image_picker/image_picker.dart';

class ProfileService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  final FirebaseStorage _storage = FirebaseStorage.instance;
  final _imagePicker = ImagePicker();

  // Get current user profile
  Future<Map<String, dynamic>?> getProfile() async {
    try {
      final user = _auth.currentUser;
      if (user == null) return null;

      final userDoc = await _db.collection('users').doc(user.uid).get();
      final data = userDoc.data();
      if (data == null) return null;

      final postsSnap = await _db
          .collection('posts')
          .where('user_id', isEqualTo: user.uid)
          .get();

      return {
        ...data,
        'id': user.uid,
        'post_count': postsSnap.docs.length,
      };
    } catch (_) {
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

  // Upload profile picture to Firebase Storage
  Future<Map<String, dynamic>> uploadProfilePicture(XFile image) async {
    try {
      final user = _auth.currentUser;
      if (user == null) {
        return {'success': false, 'message': 'Not logged in'};
      }

      final ref = _storage.ref('profiles/${user.uid}/profile.jpg');
      await ref.putFile(File(image.path));
      final publicUrl = await ref.getDownloadURL();

      await _db.collection('users').doc(user.uid).set({
        'profile_picture_url': publicUrl,
      }, SetOptions(merge: true));

      return {'success': true, 'url': publicUrl};
    } catch (_) {
      return {'success': false, 'message': 'Failed to upload image'};
    }
  }

  // Remove profile picture
  Future<Map<String, dynamic>> removeProfilePicture() async {
    try {
      final user = _auth.currentUser;
      if (user == null) {
        return {'success': false, 'message': 'Not logged in'};
      }

      final ref = _storage.ref('profiles/${user.uid}/profile.jpg');
      await ref.delete().catchError((_) {});

      await _db.collection('users').doc(user.uid).set({
        'profile_picture_url': null,
      }, SetOptions(merge: true));

      return {'success': true};
    } catch (_) {
      return {'success': false, 'message': 'Failed to remove image'};
    }
  }

  // Logout
  Future<void> logout() async {
    await _auth.signOut();
  }
}