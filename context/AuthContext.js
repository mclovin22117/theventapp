// context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setError(null);
        
        if (user) {
          setCurrentUser(user);
          
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setAppUser(userData);
            await AsyncStorage.setItem('appUser', JSON.stringify(userData));
          } else {
            console.warn("User data not found in Firestore for UID:", user.uid);
            const userData = {
              username: user.email?.split('@')[0] || 'user',
              createdAt: new Date(),
            };
            await setDoc(userDocRef, userData);
            setAppUser(userData);
          }
        } else {
          setCurrentUser(null);
          setAppUser(null);
          await AsyncStorage.removeItem('appUser');
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError('Authentication error occurred');
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const register = async (username, password) => {
    try {
      setError(null);
      setLoading(true);

      // Check if username is already taken
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        throw new Error('Username is already taken. Please choose another.');
      }

      // Generate a unique email from username for Firebase Auth
      // Firebase requires an email, but we'll use username@thevent.app format
      const generatedEmail = `${username.toLowerCase()}@thevent.app`;

      // Create Firebase Auth user using the generated email and password
      const userCredential = await createUserWithEmailAndPassword(auth, generatedEmail, password);
      const firebaseUser = userCredential.user;

      // Store user data in Firestore (without storing email)
      const userData = {
        username: username,
        createdAt: new Date(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);

      // User is now automatically logged in via onAuthStateChanged
      return { user: firebaseUser, username: username };
    } catch (err) {
      console.error('Registration error:', err);
      
      let errorMessage = 'Registration failed';
      if (err.message.includes('already taken')) {
        errorMessage = err.message;
      } else if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Username is already taken. Please choose another.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password must be at least 6 characters.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Login function now uses username and converts it to email format
  const login = async (username, password) => {
    try {
      setError(null);
      setLoading(true);

      // Convert username to the generated email format
      const generatedEmail = `${username.toLowerCase()}@thevent.app`;

      const userCredential = await signInWithEmailAndPassword(auth, generatedEmail, password);
      
      return userCredential.user;
    } catch (err) {
      console.error('Login error:', err);
      
      let errorMessage = 'Login failed';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') { // to Catch common login failures
        errorMessage = 'Invalid username or password.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid username format.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
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
      await signOut(auth);
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