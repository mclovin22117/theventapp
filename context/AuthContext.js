// context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../supabaseConfig';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [appUser, setAppUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleAuthChange(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await handleAuthChange(session.user);
      } else {
        setCurrentUser(null);
        setAppUser(null);
        await AsyncStorage.removeItem('appUser');
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthChange = async (user) => {
    try {
      setError(null);
      setCurrentUser(user);
      
      // Fetch user profile from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', user.id)
        .single();
      
      if (userError && userError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching user data:', userError);
      }
      
      if (userData) {
        setAppUser(userData);
        await AsyncStorage.setItem('appUser', JSON.stringify(userData));
      } else {
        console.warn("User data not found for auth_id:", user.id);
      }
    } catch (err) {
      console.error('Auth state change error:', err);
      setError('Authentication error occurred');
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, password) => {
    try {
      setError(null);
      setLoading(true);

      // Check if username is already taken
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .limit(1);

      if (checkError) {
        throw checkError;
      }

      if (existingUsers && existingUsers.length > 0) {
        throw new Error('Username is already taken. Please choose another.');
      }

      // Generate a unique email from username for Supabase Auth
      const generatedEmail = `${username.toLowerCase()}@thevent.app`;

      // Create Supabase Auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: generatedEmail,
        password: password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Create user profile in users table
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            auth_id: authData.user.id,
            username: username,
            emoji: '😊',
            created_at: new Date().toISOString(),
          }
        ]);

      if (insertError) {
        // If user creation fails, try to clean up auth user
        console.error('Failed to create user profile:', insertError);
        throw new Error('Failed to create user profile');
      }

      return { user: authData.user, username: username };
    } catch (err) {
      console.error('Registration error:', err);
      
      let errorMessage = 'Registration failed';
      if (err.message.includes('already taken')) {
        errorMessage = err.message;
      } else if (err.message.includes('User already registered')) {
        errorMessage = 'Username is already taken. Please choose another.';
      } else if (err.message.includes('Password should be at least 6 characters')) {
        errorMessage = 'Password must be at least 6 characters.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      setError(null);
      setLoading(true);

      // Convert username to the generated email format
      const generatedEmail = `${username.toLowerCase()}@thevent.app`;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: generatedEmail,
        password: password,
      });

      if (error) throw error;
      
      return data.user;
    } catch (err) {
      console.error('Login error:', err);
      
      let errorMessage = 'Login failed';
      if (err.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid username or password.';
      } else if (err.message.includes('Email not confirmed')) {
        errorMessage = 'Please confirm your email address.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout');
      throw err;
    }
  };

  const value = {
    currentUser,
    appUser,
    loading,
    error,
    register,
    login,
    logout,
    clearError: () => setError(null)
  };

  if (loading && !currentUser && !error) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading authentication...</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
