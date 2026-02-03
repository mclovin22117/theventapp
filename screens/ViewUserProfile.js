import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabaseConfig';
import Header from '../components/Header';

const ViewUserProfileScreen = ({ route }) => {
  const { userId } = route.params;
  const { colors } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;

        if (data) {
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error('Error fetching user:', e);
        Alert.alert('Error', 'Could not load user profile.');
        setUser(null);
      }
      setLoading(false);
    };
    fetchUser();
  }, [userId]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!user || user.public_profile === false) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Header tagline="User Profile" headerBgColor="#1f1f1f" headerTextColor="white" taglineFontSize={20} showLogo={false} />
        <Text style={{ color: colors.text, fontSize: 18, marginTop: 20 }}>This profile is private.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Header tagline="User Profile" headerBgColor="black" headerTextColor="white" taglineFontSize={20} showLogo={false} />
      <View style={{ padding: 20 }}>
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: 'bold' }}>{user.username}</Text>
        <Text style={{ color: colors.placeholder, fontSize: 14, marginTop: 8 }}>User ID: {userId}</Text>
        {/* Add more public info here if desired */}
      </View>
    </SafeAreaView>
  );
};

export default ViewUserProfileScreen;

const styles = StyleSheet.create({
  // Add styles as needed
});
