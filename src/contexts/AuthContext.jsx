import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase?.auth?.getSession();
        if (error) {
          console.error('Error getting initial session:', error);
          setAuthError('Failed to retrieve session');
          return;
        }
        
        if (session?.user) {
          setUser(session?.user);
          // Fetch user profile
          fetchUserProfile(session?.user?.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setAuthError('Session initialization failed');
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase?.auth?.onAuthStateChange(
      (event, session) => {
        setAuthError(null); // Clear any previous errors
        
        if (session?.user) {
          setUser(session?.user);
          fetchUserProfile(session?.user?.id);
        } else {
          setUser(null);
          setUserProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.select(`
          *,
          total_performances,
          total_score
        `)?.eq('id', userId)?.single();

      if (error) {
        if (error?.code === 'PGRST116') {
          // Profile doesn't exist yet, this is normal for new users
          console.log('User profile not found, will be created automatically');
        } else {
          console.error('Error fetching user profile:', error);
          setAuthError('Failed to load user profile');
        }
        setUserProfile(null);
      } else {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setAuthError('Profile fetch failed');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      const { data, error } = await supabase?.auth?.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData?.full_name || '',
            username: userData?.username || '',
          }
        }
      });

      if (error) {
        setAuthError(error?.message);
        return { error };
      }

      return { data };
    } catch (error) {
      const errorMessage = 'An unexpected error occurred during sign up';
      setAuthError(errorMessage);
      return { error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      const { data, error } = await supabase?.auth?.signInWithPassword({
        email,
        password
      });

      if (error) {
        setAuthError(error?.message);
        return { error };
      }

      return { data };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('AuthRetryableFetchError')) {
        setAuthError('Cannot connect to authentication service. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.');
      } else {
        setAuthError('Sign in failed. Please try again.');
      }
      return { error: { message: 'Sign in failed' } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setAuthError(null);
      const { error } = await supabase?.auth?.signOut();
      
      if (error) {
        setAuthError(error?.message);
        return { error };
      }

      // Clear local state
      setUser(null);
      setUserProfile(null);
      
      return { error: null };
    } catch (error) {
      setAuthError('Sign out failed');
      return { error: { message: 'Sign out failed' } };
    }
  };

  const updateProfile = async (updates) => {
    try {
      setAuthError(null);
      
      if (!user) {
        throw new Error('No user logged in');
      }

      const { data, error } = await supabase?.from('user_profiles')?.update({
          ...updates,
          updated_at: new Date()?.toISOString()
        })?.eq('id', user?.id)?.select()?.single();

      if (error) {
        setAuthError(error?.message);
        return { error };
      }

      setUserProfile(data);
      return { data };
    } catch (error) {
      setAuthError('Profile update failed');
      return { error: { message: 'Profile update failed' } };
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    authError,
    signUp,
    signIn,
    signOut,
    updateProfile,
    clearError: () => setAuthError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;