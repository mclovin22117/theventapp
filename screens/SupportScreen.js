// screens/SupportScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const SupportScreen = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Header
          tagline="Support The Vent"
          headerBgColor="#1f1f1f"
          headerTextColor="white"
          taglineFontSize={20}
          showLogo={false}
          centerTagline={true}
        />
      </View>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
          <View style={styles.content}>
            <Image source={require('../assets/ventlogo.png')} style={styles.logo} />
            
            <Text style={[styles.title, { color: colors.text }]}>Support This Project</Text>
            
            <Text style={[styles.message, { color: colors.text }]}>
              The Vent is a free, open-source project built with passion. If you find this app helpful and would like to support its development, any contribution would be greatly appreciated! ❤️
            </Text>

            <Text style={[styles.message, { color: colors.text }]}>
              Your support helps keep the servers running, enables new features, and ensures the app remains free and accessible to everyone.
            </Text>

            {/* QR Code Placeholder */}
            <View style={[styles.qrContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Image 
                source={require('../assets/upiqr.png')} 
                style={styles.qrImage}
              />
              <Text style={[styles.qrCaption, { color: colors.placeholder }]}>
                Scan to support via UPI
              </Text>
            </View>

            <Text style={[styles.thankYou, { color: colors.text }]}>
              Thank you for being part of this community! 🙏
            </Text>

            <Text style={[styles.footer, { color: colors.placeholder }]}>
              Every contribution, no matter how small, makes a difference!
            </Text>
          </View>
        </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    position: 'relative',
    zIndex: 1,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: Platform.OS === 'ios' ? 12 : 16,
    zIndex: 10,
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    minHeight: '100%',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
    borderRadius: 16,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  qrContainer: {
    marginVertical: 30,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
  },
  qrImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  qrText: {
    fontSize: 18,
    fontWeight: '600',
  },
  qrSubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  qrCaption: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  thankYou: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  footer: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
  },
});

export default SupportScreen;
