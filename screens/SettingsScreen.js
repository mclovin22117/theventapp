// screens/SettingsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Switch, Alert, TouchableOpacity, Linking, ScrollView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';
import { db } from '../firebaseConfig';
import { doc, collection, onSnapshot, query, where, updateDoc, getDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

const APP_VERSION = '1.3.0';
const ADMIN_EMAIL = 'capsprout2001@proton.me';
const GITHUB_URL = 'https://github.com/mclovin22117/theventapp';

export default function SettingsScreen() {
  const { appUser, currentUser, loading, logout } = useAuth();
  const { theme, toggleTheme, colors, isDarkMode } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [publicProfile, setPublicProfile] = useState(true);
  const [profilePic, setProfilePic] = useState(null);

  const handleUpdateApp = () => {
    Linking.openURL('https://github.com/reetik-rana/theventapp/releases').catch((err) => {
      Alert.alert('Error', 'Could not open the update page.');
    });
  };

  const handleContactPress = () => {
    Linking.openURL(`mailto:${ADMIN_EMAIL}`);
  };

  const handleGithubPress = () => {
    Linking.openURL(GITHUB_URL);
  };

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', currentUser.uid),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setUnreadNotifications(querySnapshot.size);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Fetch publicProfile and profilePic settings on mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.publicProfile !== undefined) {
          setPublicProfile(data.publicProfile);
        }
        if (data.profilePic) {
          setProfilePic(data.profilePic);
        }
      }
    };
    fetchUserData();
  }, [currentUser]);

  // Update publicProfile in Firestore
  const handleTogglePublicProfile = async () => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      await updateDoc(userDocRef, { publicProfile: !publicProfile });
      setPublicProfile(!publicProfile);
    } catch (error) {
      Alert.alert('Error', 'Could not update profile visibility.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Failed to log out', 'Please try again.');
    }
  };

  // Upload image to Cloudinary
  const pickAndUpload = async () => {
    if (!currentUser) {
      Alert.alert('Not logged in', 'Please log in to upload a profile picture.');
      return;
    }
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Permission to access photos is required.');
        return;
      }

      const mediaTypes =
        (ImagePicker.MediaType && ImagePicker.MediaType.Images) ||
        (ImagePicker.MediaTypeOptions && ImagePicker.MediaTypeOptions.Images);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes,
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1],
        base64: true,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset.base64) {
        Alert.alert('Error', 'Could not read image data (no base64). Try another image.');
        return;
      }

      // Cloudinary upload configuration
      const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/dycn1rw2e/image/upload';
      const UPLOAD_PRESET = 'thevent-profiles-v2';

      const mime = asset.mimeType || 'image/jpeg';
      const dataUrl = `data:${mime};base64,${asset.base64}`;

      const formData = new FormData();
      formData.append('file', dataUrl);
      formData.append('upload_preset', UPLOAD_PRESET);

      Alert.alert('Uploading', 'Uploading your profile picture...');

      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.secure_url) {
        const errMsg =
          (responseData.error && responseData.error.message) ||
          'Unknown upload error (no secure_url). Check preset / cloud name.';
        throw new Error(errMsg);
      }

      const cloudinaryUrl = responseData.secure_url;
      setProfilePic(cloudinaryUrl);

      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, { profilePic: cloudinaryUrl });

      Alert.alert('Success', 'Profile picture updated!');
    } catch (error) {
      console.error('Image upload error:', error);
      Alert.alert('Upload Failed', error.message);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  if (!currentUser || !appUser) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text, fontSize: 18 }}>No user data found. Please log in.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={Platform.OS === 'web' ? styles.webWrapper : { flex: 1 }}>
        <View style={{ height: Platform.OS === 'web' ? 8 : Math.max(insets.top, 12) }} />
        
        {/* Header with Back Button */}
        <View style={[styles.headerWithBack, { backgroundColor: '#1f1f1f' }]}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings & About</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <View style={{ height: Platform.OS === 'web' ? 10 : 8 }} />
        
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={Platform.OS === 'web'}
        >
          {/* Profile Section */}
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile</Text>
            
            <View style={styles.profilePicContainer}>
              {profilePic ? (
                <Image source={{ uri: profilePic }} style={styles.profilePic} />
              ) : (
                <View style={[styles.profilePicPlaceholder, { backgroundColor: colors.border }]}>
                  <Ionicons name="person" size={50} color={colors.placeholder} />
                </View>
              )}
              <TouchableOpacity onPress={pickAndUpload} style={[styles.uploadButton, { backgroundColor: '#1f1f1f' }]}>
                <Text style={styles.uploadButtonText}>
                  {profilePic ? 'Change Picture' : 'Upload Picture'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: colors.text }]}>Username:</Text>
              <Text style={[styles.value, { color: '#ffffff' }]}>{appUser.username}</Text>
            </View>

            <View style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Public Profile</Text>
                <Text style={[styles.settingDescription, { color: colors.placeholder }]}>
                  Allow others to view your profile
                </Text>
              </View>
              <Switch
                value={publicProfile}
                onValueChange={handleTogglePublicProfile}
                trackColor={{ false: colors.border, true: '#888888' }}
                thumbColor={publicProfile ? colors.card : colors.placeholder}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
                <Text style={[styles.settingDescription, { color: colors.placeholder }]}>
                  Toggle between light and dark theme
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: '#888888' }}
                thumbColor={isDarkMode ? colors.card : colors.placeholder}
              />
            </View>

            <TouchableOpacity
              style={[styles.notificationsButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications" size={24} color={colors.text} />
              <Text style={[styles.notificationsButtonText, { color: colors.text }]}>
                Notifications
              </Text>
              {unreadNotifications > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadNotifications}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#1f1f1f' }]}
              onPress={() => navigation.navigate('UserPosts', { userId: currentUser.uid })}
            >
              <Text style={styles.buttonText}>View My Posts</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.logoutButton, { backgroundColor: '#d32f2f' }]} onPress={handleLogout}>
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* About Section */}
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Image source={require('../assets/ventlogo.png')} style={styles.logo} />
            {/* <Text style={[styles.appTitle, { color: colors.text }]}>The Vent</Text> */}
            <Text style={[styles.version, { color: colors.placeholder }]}>Version {APP_VERSION}</Text>

            <View style={styles.aboutSection}>
              <Text style={[styles.aboutTitle, { color: colors.text }]}>Welcome</Text>
              <Text style={[styles.paragraph, { color: colors.text }]}>
                The Vent is a safe, anonymous space to share your thoughts, feelings, and opinions. Express yourself freely and connect with others—without the pressure of revealing your identity.
              </Text>
            </View>

            <View style={styles.aboutSection}>
              <Text style={[styles.aboutTitle, { color: colors.text }]}>Our Mission</Text>
              <Text style={[styles.paragraph, { color: colors.text }]}>
                We believe everyone deserves a place to be heard. Our mission is to foster a supportive, respectful, and open community where you can vent, reflect, and find solidarity.
              </Text>
            </View>

            <View style={styles.aboutSection}>
              <Text style={[styles.aboutTitle, { color: colors.text }]}>Community Guidelines</Text>
              <Text style={[styles.paragraph, { color: colors.text }]}>
                • Be respectful and kind{'\n'}
                • No hate speech, bullying, or harassment{'\n'}
                • Do not share personal information{'\n'}
                • No spam or inappropriate content{'\n'}
                • Violations may result in removal of content or account
              </Text>
            </View>

            <View style={styles.aboutSection}>
              <Text style={[styles.aboutTitle, { color: colors.text }]}>Privacy & Anonymity</Text>
              <Text style={[styles.paragraph, { color: colors.text }]}>
                Your posts are anonymous to the community, but are linked to a unique User ID (UID) for moderation and account recovery. Only the platform admin can access this information, and it is never sold or used for advertising.
              </Text>
            </View>

            <View style={styles.aboutSection}>
              <Text style={[styles.aboutTitle, { color: colors.text }]}>Contact & Feedback</Text>
              <Text style={[styles.paragraph, { color: colors.text }]}>
                Have suggestions or need support? Reach out at{' '}
                <Text style={{ fontWeight: 'bold', color: '#e0e0e0' }} onPress={handleContactPress}>
                  {ADMIN_EMAIL}
                </Text>.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#1f1f1f', marginTop: 16 }]}
              onPress={handleUpdateApp}
            >
              <Text style={styles.buttonText}>Check for Updates</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.border, marginTop: 8 }]}
              onPress={handleGithubPress}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>View on GitHub</Text>
            </TouchableOpacity>

            <Text style={[styles.footer, { color: colors.placeholder }]}>Mclovin without a last name</Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webWrapper: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerWithBack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 3,
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    ...Platform.select({
      web: {
        overflowY: 'scroll',
        height: '100%',
      },
    }),
  },
  section: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  profilePicContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  profilePicPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 4,
  },
  notificationsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 16,
  },
  notificationsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  badge: {
    backgroundColor: '#d32f2f',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  logo: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 12,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  aboutSection: {
    marginBottom: 20,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 24,
  },
});
