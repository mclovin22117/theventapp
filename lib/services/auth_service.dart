import 'dart:io';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  final FirebaseStorage _storage = FirebaseStorage.instance;

  String _emailFromUsername(String username) =>
      '${username.trim().toLowerCase()}@theventapp.app';

  // Register new user
  Future<Map<String, dynamic>> register({
    required String username,
    required String password,
    File? profileImage,
  }) async {
    try {
      final cleanUsername = username.trim();
      final usernameLower = cleanUsername.toLowerCase();

      // Check duplicate username
      final existing = await _db
          .collection('users')
          .where('usernameLower', isEqualTo: usernameLower)
          .limit(1)
          .get();

      if (existing.docs.isNotEmpty) {
        return {
          'success': false,
          'message': 'Username already taken. Try another one.',
        };
      }

      final cred = await _auth.createUserWithEmailAndPassword(
        email: _emailFromUsername(cleanUsername),
        password: password,
      );

      final uid = cred.user!.uid;

      String? profilePictureUrl;
      if (profileImage != null) {
        final ref = _storage.ref('profiles/$uid/profile.jpg');
        await ref.putFile(profileImage);
        profilePictureUrl = await ref.getDownloadURL();
      }

      await _db.collection('users').doc(uid).set({
        'uid': uid,
        'username': cleanUsername,
        'usernameLower': usernameLower,
        'profile_picture_url': profilePictureUrl,
        'created_at': FieldValue.serverTimestamp(),
      });

      await cred.user!.updateDisplayName(cleanUsername);

      return {
        'success': true,
        'message': 'Account created successfully!',
      };
    } on FirebaseAuthException catch (e) {
      return {
        'success': false,
        'message': e.message ?? 'Registration failed.',
      };
    } catch (_) {
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
      final cred = await _auth.signInWithEmailAndPassword(
        email: _emailFromUsername(username),
        password: password,
      );

      return {
        'success': true,
        'message': 'Login successful!',
        'user': cred.user,
      };
    } on FirebaseAuthException {
      return {
        'success': false,
        'message': 'Invalid username or password.',
      };
    } catch (_) {
      return {
        'success': false,
        'message': 'Something went wrong. Please try again later.',
      };
    }
  }

  // Logout user
  Future<void> logout() async {
    await _auth.signOut();
  }

  // Get current logged in user profile
  Future<Map<String, dynamic>?> getCurrentUser() async {
    try {
      final user = _auth.currentUser;
      if (user == null) return null;

      final doc = await _db.collection('users').doc(user.uid).get();
      final data = doc.data();
      if (data == null) return null;

      return {
        'user_id': user.uid,
        'username': data['username'],
        'profile_picture_url': data['profile_picture_url'] ?? '',
      };
    } catch (_) {
      return null;
    }
  }

  bool isLoggedIn() => _auth.currentUser != null;
}