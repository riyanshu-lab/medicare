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

const AuthContext = createContext(null);

const ADMIN_EMAILS = ['riyanshuakash@gmail.com', 'admin@example.com'];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const docSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (docSnap.exists()) {
          const userData = docSnap.data();
          // Auto-promote if email is in ADMIN_EMAILS but role is not admin
          if (ADMIN_EMAILS.includes(firebaseUser.email) && userData.role !== 'admin') {
            await updateDoc(doc(db, 'users', firebaseUser.uid), { role: 'admin' });
            userData.role = 'admin';
          }
          setUser({ id: firebaseUser.uid, ...userData });
        } else {
          // Fallback profile if Firestore is still propagating
          const role = ADMIN_EMAILS.includes(firebaseUser.email) ? 'admin' : 'patient';
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || 'New User',
            role
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Simple Email Register
  const register = async (data) => {
    try {
      const { user: fUser } = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const userData = {
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        role: ADMIN_EMAILS.includes(data.email) ? 'admin' : 'patient',
        joinedDate: new Date().toISOString().split('T')[0],
      };
      await setDoc(doc(db, 'users', fUser.uid), userData);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.code === 'auth/email-already-in-use' ? 'Email already exists.' : error.message };
    }
  };

  // Simple Email Login
  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Invalid credentials.' };
    }
  };

  // Simple Google Login/Signup
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user: fUser } = await signInWithPopup(auth, provider);
      
      const docRef = doc(db, 'users', fUser.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          name: fUser.displayName || 'Google User',
          email: fUser.email,
          phone: fUser.phoneNumber || '',
          role: ADMIN_EMAILS.includes(fUser.email) ? 'admin' : 'patient',
          joinedDate: new Date().toISOString().split('T')[0],
        });
      }
      return { success: true };
    } catch (error) {
      return { success: false, message: error.code === 'auth/popup-closed-by-user' ? 'Sign-in cancelled.' : error.message };
    }
  };

  const logout = () => signOut(auth);

  const updateProfile = async (updates) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.id), updates);
      setUser(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
