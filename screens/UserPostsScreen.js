// screens/UserPostsScreen.js
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { supabase } from '../supabaseConfig';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const UserPostsScreen = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();
  const { appUser } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (!appUser) {
      setLoading(false);
      return;
    }

    fetchPosts();

    // Subscribe to real-time updates for user's posts
    const channel = supabase
      .channel('user_posts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `user_id=eq.${appUser.id}`,
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [appUser]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          users!posts_user_id_fkey (
            id,
            username,
            emoji,
            profile_pic
          )
        `)
        .eq('user_id', appUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check which posts the user has liked
      const { data: userLikes, error: likesError } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', appUser.id);

      if (likesError) throw likesError;

      const likedPostIds = new Set(userLikes.map(like => like.post_id));

      // Map posts with user data and like status
      const postsWithUserData = data.map(post => ({
        ...post,
        username: post.users.username,
        emoji: post.users.emoji,
        profile_pic: post.users.profile_pic,
        isLiked: likedPostIds.has(post.id),
      }));

      setPosts(postsWithUserData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load your posts.');
    }
  };

  const handleDeletePost = (postId) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to delete this post? This action cannot be undone.');
      if (confirmed) {
        supabase
          .from('posts')
          .delete()
          .eq('id', postId)
          .then(() => {
            alert('Post deleted successfully!');
            fetchPosts();
          })
          .catch((error) => {
            console.error('Error deleting post:', error);
            alert('Failed to delete post.');
          });
      }
    } else {
      Alert.alert(
        'Delete Post',
        'Are you sure you want to delete this post? This action cannot be undone.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            onPress: async () => {
              try {
                const { error } = await supabase
                  .from('posts')
                  .delete()
                  .eq('id', postId);
                
                if (error) throw error;
                
                Alert.alert('Success', 'Post deleted successfully!');
                fetchPosts();
              } catch (error) {
                console.error('Error deleting post:', error);
                Alert.alert('Error', 'Failed to delete post.');
              }
            },
          },
        ]
      );
    }
  };

  const handleLike = async (postId, postUserId) => {
    if (!appUser) {
      Alert.alert('Login Required', 'You must be logged in to like a thought.');
      return;
    }
    if (appUser.id === postUserId) {
      Alert.alert('Action Not Allowed', 'You cannot like your own thought.');
      return;
    }

    try {
      // Optimistic update
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { 
                ...post, 
                isLiked: true, 
                likes_count: (post.likes_count || 0) + 1 
              }
            : post
        )
      );

      const { error } = await supabase
        .from('likes')
        .insert([{ post_id: postId, user_id: appUser.id }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error liking post:', error);
      Alert.alert('Error', 'Failed to like post.');
      // Revert optimistic update
      fetchPosts();
    }
  };

  const handleUnlike = async (postId) => {
    if (!appUser) {
      Alert.alert('Login Required', 'You must be logged in to unlike a thought.');
      return;
    }

    try {
      // Optimistic update
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { 
                ...post, 
                isLiked: false, 
                likes_count: Math.max((post.likes_count || 0) - 1, 0) 
              }
            : post
        )
      );

      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', appUser.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error unliking post:', error);
      Alert.alert('Error', 'Failed to unlike post.');
      // Revert optimistic update
      fetchPosts();
    }
  };

  const renderItem = ({ item }) => {
    const hasLiked = item.isLiked;
    const likeCount = item.likes_count || 0;
    const replyCount = item.replies_count || 0;

    const buttonDisabled = !appUser || appUser.id === item.user_id;

    return (
      <View style={[styles.postItemWrapper, { borderColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.postItem, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('PostDetails', { postId: item.id })}
          activeOpacity={0.7}
        >
          <View style={styles.postHeader}>
            <Text style={[styles.postAuthor, { color: colors.primary }]}>
              {item.emoji} {item.username}
            </Text>
            {item.category && (
              <View style={[styles.tagContainer, { borderColor: colors.primary }]}>
                <Text style={[styles.tagText, { color: colors.primary }]}>{item.category}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.postText, { color: colors.text }]}>{item.text}</Text>

          <View style={styles.postFooter}>
            {item.created_at && (
              <Text style={[styles.postTimestamp, { color: colors.placeholder }]}>
                {new Date(item.created_at).toLocaleString()}
              </Text>
            )}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                onPress={(event) => {
                  event.stopPropagation();
                  if (hasLiked) {
                    handleUnlike(item.id);
                  } else {
                    handleLike(item.id, item.user_id);
                  }
                }}
                style={styles.actionButton}
                disabled={buttonDisabled}
              >
                <Text style={[styles.actionButtonText, { color: hasLiked ? 'red' : colors.text }]}>
                  ❤️ {likeCount}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={(event) => {
                  event.stopPropagation();
                  navigation.navigate('PostDetails', { postId: item.id });
                }}
                style={styles.actionButton}
                disabled={false}
              >
                <Text style={[styles.actionButtonText, { color: colors.text }]}>
                  💬 {replyCount}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeletePost(item.id)}>
          <Ionicons name="trash-outline" size={24} color="#dc3545" />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text }}>Loading posts...</Text>
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
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Header
          tagline="Your Posts"
          headerBgColor="#1f1f1f"
          headerTextColor="white"
          taglineFontSize={20}
          showLogo={false}
          centerTagline={true}
        />
      </View>
      {posts.length === 0 ? (
        <View style={styles.noPostsContainer}>
          <Text style={[styles.noPostsText, { color: colors.text }]}>You haven't shared any thoughts yet.</Text>
        </View>
      ) : (
        <View style={styles.contentWrapper}>
          <FlatList
            data={posts}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContentContainer}
            numColumns={Platform.OS === 'web' ? 3 : 1}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  contentWrapper: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 1000,
  },
  listContentContainer: {
    padding: 20,
  },
  postItemWrapper: {
    position: 'relative',
    margin: 10,
    width: 300,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    ...Platform.select({
      web: {
        marginBottom: 20,
      },
    }),
  },
  postItem: {
    padding: 15,
    backgroundColor: 'white',
    width: '100%',
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      },
    }),
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  tagContainer: {
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  postAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  postText: {
    fontSize: 16,
    lineHeight: 24,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  postTimestamp: {
    fontSize: 12,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    marginLeft: 10,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noPostsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPostsText: {
    fontSize: 18,
  },
});

export default UserPostsScreen;