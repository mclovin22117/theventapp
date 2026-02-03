// screens/AboutScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, Image, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const APP_VERSION = '2.0';
const ADMIN_EMAIL = 'admin@example.com'; // Replace with your contact email
const GITHUB_URL = 'https://github.com/yourusername/theventapp'; // Replace with your repo

const AboutScreen = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleContactPress = () => {
    Linking.openURL(`mailto:${ADMIN_EMAIL}`);
  };

  const handleGithubPress = () => {
    Linking.openURL(GITHUB_URL);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ flex: 1 }}>
        <View style={{ height: Platform.OS === 'web' ? 8 : Math.max(insets.top, 12) }} />
        <Header
          tagline="About The Vent"
          headerBgColor="#1f1f1f"
          headerTextColor="white"
          taglineFontSize={20}
          showLogo={false}
        />
        <View style={{ height: Platform.OS === 'web' ? 10 : 8 }} />
        <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 32 }}>
          <View style={styles.content}>
            <Image source={require('../assets/ventlogo.png')} style={styles.logo} />
            <Text style={[styles.title, { color: colors.text }]}>The Vent</Text>
            <Text style={[styles.version, { color: colors.placeholder }]}>Version {APP_VERSION}</Text>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Welcome</Text>
              <Text style={[styles.paragraph, { color: colors.text }]}>
                The Vent is a safe, anonymous space to share your thoughts, feelings, and opinions. Express yourself freely and connect with others—without the pressure of revealing your identity.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Our Mission</Text>
              <Text style={[styles.paragraph, { color: colors.text }]}>
                We believe everyone deserves a place to be heard. Our mission is to foster a supportive, respectful, and open community where you can vent, reflect, and find solidarity.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Community Guidelines</Text>
              <Text style={[styles.paragraph, { color: colors.text }]}>
                • Be respectful and kind{'\n'}
                • No hate speech, bullying, or harassment{'\n'}
                • Do not share personal information{'\n'}
                • No spam or inappropriate content{'\n'}
                • Violations may result in removal of content or account
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Privacy & Anonymity</Text>
              <Text style={[styles.paragraph, { color: colors.text }]}>
                Your posts are anonymous to the community. Each user has a unique username and User ID for moderation purposes. Your posts are linked to your account, but your identity remains private to other users. We never sell your data or use it for advertising.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Authentication</Text>
              <Text style={[styles.paragraph, { color: colors.text }]}>
                The Vent uses a simple username and password system. No real email is required—the app automatically generates an internal identifier for your account. This means maximum privacy: we don't collect or store any personal contact information.
              </Text>
              <Text style={[styles.paragraph, { color: colors.text }]}>
                Important: Keep your username and password safe! Since no email is stored, we cannot help you recover your account if you forget your credentials.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Open Source</Text>
              <Text style={[styles.paragraph, { color: colors.text }]}>
                The Vent is 100% free and open source, built with Supabase (PostgreSQL). The entire codebase is available on GitHub for transparency and community contributions. No vendor lock-in, no proprietary services.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact & Feedback</Text>
              <Text style={[styles.paragraph, { color: colors.text }]}>
                Have suggestions/want to contribute or need support? Reach out at <Text style={{ fontWeight: 'bold', color: colors.primary }} onPress={handleContactPress}>{ADMIN_EMAIL}</Text>.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.border }]}
              onPress={handleGithubPress}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>View on GitHub</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#FF6B35' }]}
              onPress={() => navigation.navigate('Support')}
            >
              <Text style={[styles.buttonText, { color: '#ffffff' }]}>☕ Support Me</Text>
            </TouchableOpacity>

            <Text style={[styles.footer, { color: colors.placeholder }]}>Made with ❤️ by a Tech Enthusiast</Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  logo: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 12,
    borderRadius: 16,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 1,
  },
  version: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#888',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
  footer: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    marginHorizontal: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AboutScreen;