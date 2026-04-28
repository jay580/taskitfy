import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChanged, loginWithEmail, logout as authLogout } from '../services/auth';
import { getUserProfile, isUserSuspended } from '../services/firestore';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { UserProfile } from '../types';

interface AuthContextType {
  firebaseUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ role: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  userProfile: null,
  loading: true,
  login: async () => ({ role: 'student' }),
  logout: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Track if we just logged in to avoid double profile fetch
  const justLoggedIn = useRef(false);

  // Helper: auto-unsuspend if suspensionEnd has passed
  const autoUnsuspendIfExpired = async (profile: UserProfile) => {
    if (profile.isSuspended && profile.suspensionEnd) {
      const endDate = new Date(profile.suspensionEnd);
      if (Date.now() >= endDate.getTime()) {
        // Suspension has expired – clear it in Firestore
        try {
          await updateDoc(doc(db, 'users', profile.uid), {
            isSuspended: false,
          });
          profile.isSuspended = false;
        } catch (e) {
          console.error('Failed to auto-unsuspend user:', e);
        }
      }
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (user) => {
      setFirebaseUser(user);
      
      if (user) {
        // Skip profile fetch if we just logged in (profile already set)
        if (justLoggedIn.current) {
          justLoggedIn.current = false;
          setLoading(false);
          return;
        }
        
        try {
          let profile = await getUserProfile(user.uid);
          
          if (!profile) {
            console.warn("User has no profile (likely deleted). Logging out.");
            await authLogout();
            setFirebaseUser(null);
            setUserProfile(null);
            setLoading(false);
            return;
          }
          
          // Auto-unsuspend if expired
          await autoUnsuspendIfExpired(profile);
          
          if (isUserSuspended(profile)) {
            console.warn("User is suspended. Logging out.");
            await authLogout();
            setFirebaseUser(null);
            setUserProfile(null);
            setLoading(false);
            return;
          }
          
          setUserProfile(profile);
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<{ role: string }> => {
    const cred = await loginWithEmail(email, password);
    let profile = await getUserProfile(cred.user.uid);
    
    if (!profile) {
      await authLogout();
      throw new Error("Your account has been deleted or deactivated.");
    }

    // Auto-unsuspend if expired before checking
    await autoUnsuspendIfExpired(profile);

    if (isUserSuspended(profile)) {
      await authLogout();
      let msg = "Your account is currently suspended.";
      if (profile.suspensionEnd) {
        const endDate = new Date(profile.suspensionEnd);
        const formattedDate = endDate.toLocaleDateString();
        const formattedTime = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        msg += ` Suspension ends: ${formattedDate} at ${formattedTime}.`;
      }
      throw new Error(msg);
    }
    
    // Mark that we just logged in so onAuthStateChanged skips the fetch
    justLoggedIn.current = true;
    setFirebaseUser(cred.user);
    setUserProfile(profile);
    
    return { role: profile.role };
  };

  const logout = async () => {
    await authLogout();
    setUserProfile(null);
  };

  const refreshProfile = async () => {
    if (firebaseUser) {
      const profile = await getUserProfile(firebaseUser.uid);
      setUserProfile(profile);
    }
  };

  return (
    <AuthContext.Provider
      value={{ firebaseUser, userProfile, loading, login, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}
