import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isSigningOut: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, userData: SignUpData) => Promise<{ error: Error | null; needsEmailConfirmation?: boolean }>;
  signOut: () => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

interface SignUpData {
  username: string;
  fullName: string;
  timezone: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Fetch user profile
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.log('Profile fetch info:', error.message);
        return null;
      }
      return data as Profile | null;
    } catch (error) {
      console.log('Error fetching profile:', error);
      return null;
    }
  };

  // Create or update profile
  const createOrUpdateProfile = async (
    userId: string, 
    userData: { username: string; fullName: string; timezone: string }
  ): Promise<{ error: Error | null }> => {
    try {
      // Use upsert to handle both insert and update
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          username: userData.username,
          full_name: userData.fullName,
          timezone: userData.timezone,
          daily_calorie_goal: 2000,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.log('Profile upsert error:', error);
        return { error: error as unknown as Error };
      }
      return { error: null };
    } catch (error) {
      console.log('Error creating profile:', error);
      return { error: error as Error };
    }
  };

  // Initialize session
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initSession = async () => {
      try {
        console.log('Initializing auth session...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.log('Session error:', error.message);
        }

        if (mounted) {
          console.log('Session loaded:', session ? 'authenticated' : 'not authenticated');
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            const profileData = await fetchProfile(session.user.id);
            if (mounted) {
              setProfile(profileData);
            }
          }
          
          setIsLoading(false);
        }
      } catch (error) {
        console.log('Error initializing session:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Set a timeout to force loading to complete after 5 seconds
    timeoutId = setTimeout(() => {
      if (mounted && isLoading) {
        console.log('Auth timeout - forcing loading to complete');
        setIsLoading(false);
      }
    }, 5000);

    initSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            const profileData = await fetchProfile(session.user.id);
            if (mounted) {
              setProfile(profileData);
            }
          } else {
            setProfile(null);
          }

          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with email
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Sign up with email
  const signUp = async (email: string, password: string, userData: SignUpData) => {
    try {
      // Sign up the user with metadata
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: userData.username,
            full_name: userData.fullName,
            timezone: userData.timezone,
          }
        }
      });

      if (signUpError) {
        return { error: signUpError as Error };
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        // Email confirmation required - profile will be created by trigger or on first login
        return { error: null, needsEmailConfirmation: true };
      }

      // If we have a session (email confirmation disabled), create the profile
      if (data.user && data.session) {
        const { error: profileError } = await createOrUpdateProfile(data.user.id, userData);
        if (profileError) {
          console.log('Profile creation error (non-blocking):', profileError);
          // Don't fail signup if profile creation fails - it can be created later
        }
      }

      return { error: null, needsEmailConfirmation: false };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Sign out
  const signOut = async (): Promise<{ error: Error | null }> => {
    setIsSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.log('Sign out error:', error.message);
        // Still clear local state even if API fails
        setSession(null);
        setUser(null);
        setProfile(null);
        return { error: error as unknown as Error };
      }
      // Clear local state on success
      setSession(null);
      setUser(null);
      setProfile(null);
      return { error: null };
    } catch (error) {
      console.log('Sign out exception:', error);
      // Always clear local state regardless of API result
      setSession(null);
      setUser(null);
      setProfile(null);
      return { error: error as Error };
    } finally {
      setIsSigningOut(false);
    }
  };

  // Update profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id,
          ...updates, 
          updated_at: new Date().toISOString() 
        }, {
          onConflict: 'id'
        });

      if (!error) {
        const updatedProfile = await fetchProfile(user.id);
        setProfile(updatedProfile);
      }

      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Refresh profile
  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  const value: AuthContextType = {
    session,
    user,
    profile,
    isLoading,
    isSigningOut,
    isAuthenticated: !!session && !!user,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
