import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { mockUsers } from '../data/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch additional user data from Firestore
        const docRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setUser({ id: firebaseUser.uid, ...docSnap.data() });
        } else {
          // Check if it's a mock admin login that somehow bypassed Firestore
          // We can fallback
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || 'User',
            role: 'patient'
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const docRef = doc(db, 'users', firebaseUser.uid);
      const docSnap = await getDoc(docRef);
      
      let userData = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || 'User',
        role: 'patient'
      };

      if (docSnap.exists()) {
        userData = { id: firebaseUser.uid, ...docSnap.data() };
      }
      
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      let message = 'Invalid email or password.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = 'Invalid email or password.';
      } else {
        message = error.message;
      }
      return { success: false, message };
    }
  };

  const register = async (data) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;
      
      const newUser = {
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        role: 'patient',
        joinedDate: new Date().toISOString().split('T')[0],
      };

      // Save user to Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      
      const userData = { id: firebaseUser.uid, ...newUser };
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      let message = error.message;
      if (error.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists.';
      }
      return { success: false, message };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;
      
      const docRef = doc(db, 'users', firebaseUser.uid);
      const docSnap = await getDoc(docRef);
      
      let userData = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || 'User',
        role: 'patient'
      };

      if (!docSnap.exists()) {
        const newUser = {
          name: userData.name,
          email: userData.email,
          phone: firebaseUser.phoneNumber || '',
          role: 'patient',
          joinedDate: new Date().toISOString().split('T')[0],
        };
        await setDoc(docRef, newUser);
      } else {
        userData = { id: firebaseUser.uid, ...docSnap.data() };
      }
      
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Google Sign-In Error', error);
      let message = error.message;
      if (error.code === 'auth/popup-closed-by-user') {
        message = 'Google sign-in was cancelled.';
      }
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  const updateProfile = async (updates) => {
    if (!user) return;
    
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, updates);
      
      setUser(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error('Error updating profile', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
