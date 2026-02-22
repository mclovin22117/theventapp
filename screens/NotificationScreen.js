// screens/NotificationScreen.js
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseConfig';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();
  const { appUser } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (!appUser) {
      setLoading(false);
      return;
    }

    fetchNotifications();

    // Subscribe to real-time notifications
    const channel = supabase
      .channel('notifications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${appUser.id}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [appUser]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          sender:users!notifications_sender_id_fkey (
            id,
            username,
            emoji
          ),
          post:posts!notifications_post_id_fkey (
            id,
            text
          )
        `)
        .eq('recipient_id', appUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNotifications(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load notifications.');
    }
  };

  const handleNotificationPress = async (notificationId, postId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      navigation.navigate('PostDetails', { postId });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        {
          backgroundColor: item.read ? colors.card : colors.primary,
          borderColor: item.read ? colors.border : colors.primary,
          opacity: item.read ? 0.6 : 1,
        },
      ]}
      onPress={() => handleNotificationPress(item.id, item.post_id)}
    >
      <Text style={[styles.notificationText, { color: item.read ? colors.text : 'white' }]}>
        <Text style={{ fontWeight: 'bold' }}>
          {item.sender?.emoji} {item.sender?.username}
        </Text>
        {' '}
        {item.type === 'reply' ? 'replied to your thought' : 'liked your thought'}
        {item.post?.text ? `: "${item.post.text.substring(0, 50)}${item.post.text.length > 50 ? '...' : ''}"` : ''}
      </Text>
      <Text style={[styles.notificationTimestamp, { color: item.read ? colors.placeholder : 'white' }]}>
        {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text }}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Header
          tagline="Your Notifications"
          headerBgColor="#1f1f1f"
          headerTextColor="white"
          taglineFontSize={20}
          showLogo={false}
          centerTagline={true}
        />
      </View>
      {notifications.length === 0 ? (
        <View style={styles.noNotificationsContainer}>
          <Text style={[styles.noNotificationsText, { color: colors.text }]}>You have no new notifications.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          contentContainerStyle={styles.listContentContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    position: 'relative',
    backgroundColor: '#1f1f1f',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 12,
    zIndex: 10,
    padding: 8,
  },
  listContentContainer: {
    padding: 16,
  },
  notificationItem: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  notificationText: {
    fontSize: 16,
    lineHeight: 24,
  },
  notificationTimestamp: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'right',
  },
  noNotificationsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noNotificationsText: {
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NotificationScreen;