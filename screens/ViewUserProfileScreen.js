import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert, Platform, Image, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabaseConfig';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../components/Header';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ViewUserProfileScreen = ({ route }) => {
  const { userId } = route.params;
  const { colors } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [latestPostPic, setLatestPostPic] = useState(null);
  const [checkedPostsForPic, setCheckedPostsForPic] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [imageReachable, setImageReachable] = useState(null);
  const insets = useSafeAreaInsets();

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
          setDebugInfo(JSON.stringify({ userDoc: data }, null, 2));
        } else {
          setUser(null);
          setDebugInfo('No user doc found');
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        Alert.alert('Error', 'Could not load user profile.');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`user_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new) {
            setUser(payload.new);
            setDebugInfo(JSON.stringify({ userDoc: payload.new }, null, 2));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Fallback: if no profile_pic in user doc, try to grab from most recent post
  useEffect(() => {
    const fetchLatestPostPic = async () => {
      if (!user || user.profile_pic || checkedPostsForPic) return;
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('profile_pic')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!error && data && data.profile_pic) {
          setLatestPostPic(data.profile_pic);
        }
      } catch (_) {
        // silent
      } finally {
        setCheckedPostsForPic(true);
      }
    };
    fetchLatestPostPic();
  }, [user, userId, checkedPostsForPic]);

  // Refresh on screen focus to catch recently added profile pictures
  useFocusEffect(
    useCallback(() => {
      if (user && user.profile_pic) return;
      setCheckedPostsForPic(false);
    }, [user])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setUser(data);
      }
      // re-attempt post fallback on manual refresh
      setCheckedPostsForPic(false);
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, [userId]);

  // Test if the profile_pic URL (if present) is reachable
  useEffect(() => {
    const test = async () => {
      if (!user || !user.profile_pic) {
        setImageReachable(null);
        return;
      }
      try {
        // Use HEAD if supported; fallback to GET
        const res = await fetch(user.profile_pic, { method: 'HEAD' }).catch(() => fetch(user.profile_pic));
        setImageReachable(res.ok);
      } catch {
        setImageReachable(false);
      }
    };
    test();
  }, [user?.profile_pic]);

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
      <View style={{ height: Platform.OS === 'web' ? 8 : Math.max(insets.top, 12) }} />
      <Header tagline="User Profile" headerBgColor="black" headerTextColor="white" taglineFontSize={20} showLogo={false} />
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Show profile picture if available, else fallback to emoji */}
        {user.profile_pic || latestPostPic ? (
          <View style={{ marginBottom: 16 }}>
            <Image
              source={{ uri: user.profile_pic || latestPostPic }}
              style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#222' }}
              onLoadStart={() => { setImgLoading(true); setImgError(false); }}
              onLoadEnd={() => setImgLoading(false)}
              onError={() => { setImgError(true); setImgLoading(false); }}
            />
            {imgLoading && (
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color={colors.primary} />
              </View>
            )}
          </View>
        ) : (
          <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 46 }}>{user.emoji || '🙂'}</Text>
          </View>
        )}
        <Text style={{ color: colors.text, fontSize: 24, fontWeight: '700' }}>{user.username}</Text>
        <Text style={{ color: colors.placeholder, fontSize: 13, marginTop: 6 }}>User ID: {userId}</Text>
        {/* DEBUG BLOCK (remove after confirming) */}
        <View style={{ marginTop: 14, alignSelf: 'stretch', backgroundColor: '#222', padding: 10, borderRadius: 8 }}>
          <Text style={{ color: colors.placeholder, fontSize: 12, fontWeight: 'bold' }}>Debug:</Text>
          <Text style={{ color: colors.placeholder, fontSize: 11 }}>profile_pic field: {String(user.profile_pic || null)}</Text>
          <Text style={{ color: colors.placeholder, fontSize: 11 }}>latestPostPic fallback: {String(latestPostPic || null)}</Text>
          <Text style={{ color: colors.placeholder, fontSize: 11 }}>imageReachable: {imageReachable === null ? 'n/a' : imageReachable ? 'yes' : 'no'}</Text>
          <Text style={{ color: colors.placeholder, fontSize: 11, marginTop: 6 }} selectable>
            {debugInfo}
          </Text>
        </View>
        {imgError && (
          <Text style={{ color: 'tomato', marginTop: 10, fontSize: 12 }}>
            Failed to load profile image.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ViewUserProfileScreen;

const styles = StyleSheet.create({
});