'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from './supabase/client';
import { Profile, Commitment } from './types';
import { getBrowserTimezone } from './date-utils';

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  commitments: Commitment[];
  isLoading: boolean;
  isOnboarded: boolean;
  signUpWithEmail: (email: string, pass: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  signInWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<void>;
  loginWithTelegramPayload: (payload: any) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  const refreshUserData = async () => {
    if (!supabase) {
      // Local real-profile persistence for testing with friends
      const activeUserId = localStorage.getItem('wa_active_user_id');
      const allUsersJson = localStorage.getItem('wa_registered_users');
      const allUsers = allUsersJson ? JSON.parse(allUsersJson) : [];

      if (activeUserId) {
        const found = allUsers.find((u: any) => u.id === activeUserId);
        if (found) {
          setUser({ id: found.id, email: found.email });
          setProfile(found.profile);

          const allCommitsJson = localStorage.getItem(`wa_commitments_${found.id}`);
          setCommitments(allCommitsJson ? JSON.parse(allCommitsJson) : []);
          setIsLoading(false);
          return;
        }
      }

      setUser(null);
      setProfile(null);
      setCommitments([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setUser(null);
        setProfile(null);
        setCommitments([]);
        setIsLoading(false);
        return;
      }

      setUser(session.user);

      // Extract Google full name and PFP
      const meta = session.user.user_metadata || {};
      const googleName = meta.full_name || meta.name || session.user.email?.split('@')[0] || 'Challenger';
      const googlePfp = meta.avatar_url || meta.picture || null;

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      const profilePayload: Profile = {
        id: session.user.id,
        display_name: profileData?.display_name || googleName,
        avatar_url: googlePfp || profileData?.avatar_url || null,
        timezone: profileData?.timezone || getBrowserTimezone(),
        challenge_started_at: profileData?.challenge_started_at || new Date().toISOString(),
        body_weight_kg: profileData?.body_weight_kg || 70,
      };

      try {
        await supabase.from('profiles').upsert(profilePayload, { onConflict: 'id' });
      } catch (upsertErr) {
        console.warn('Profile upsert warning:', upsertErr);
      }

      setProfile(profilePayload);

      // Fetch commitments
      const { data: commitData } = await supabase
        .from('commitments')
        .select('*')
        .eq('user_id', session.user.id)
        .order('sort_order', { ascending: true });

      setCommitments(commitData || []);
    } catch (err) {
      console.warn('Supabase auth load notice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUserData();

    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          const meta = session.user.user_metadata || {};
          const googleName = meta.full_name || meta.name || session.user.email?.split('@')[0] || 'Warrior';
          const googlePfp = meta.avatar_url || meta.picture || null;

          const updated: Profile = {
            id: session.user.id,
            display_name: googleName,
            avatar_url: googlePfp,
            timezone: getBrowserTimezone(),
            challenge_started_at: new Date().toISOString(),
            body_weight_kg: 70,
          };

          try {
            await supabase.from('profiles').upsert(updated, { onConflict: 'id' });
          } catch (e) {
            // Ignore
          }
          setProfile(updated);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setCommitments([]);
        }
        setIsLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const signUpWithEmail = async (email: string, pass: string, displayName: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    if (!supabase) {
      // Local registration
      const newUserId = `user_${Date.now()}`;
      const newProfile: Profile = {
        id: newUserId,
        display_name: displayName.trim() || email.split('@')[0],
        avatar_url: null,
        timezone: getBrowserTimezone(),
        challenge_started_at: new Date().toISOString(),
        body_weight_kg: 70,
        created_at: new Date().toISOString(),
      };

      const allUsersJson = localStorage.getItem('wa_registered_users');
      const allUsers = allUsersJson ? JSON.parse(allUsersJson) : [];
      allUsers.push({ id: newUserId, email, pass, profile: newProfile });
      localStorage.setItem('wa_registered_users', JSON.stringify(allUsers));
      localStorage.setItem('wa_active_user_id', newUserId);

      setUser({ id: newUserId, email });
      setProfile(newProfile);
      setCommitments([]);
      setIsLoading(false);
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: { full_name: displayName.trim() },
        },
      });

      if (error) throw error;
      if (data.user) {
        const newProfile: Profile = {
          id: data.user.id,
          display_name: displayName.trim() || email.split('@')[0],
          avatar_url: null,
          timezone: getBrowserTimezone(),
          challenge_started_at: new Date().toISOString(),
          body_weight_kg: 70,
        };
        await supabase.from('profiles').upsert([newProfile]);
        setUser(data.user);
        setProfile(newProfile);
      }
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const signInWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    if (!supabase) {
      const allUsersJson = localStorage.getItem('wa_registered_users');
      const allUsers = allUsersJson ? JSON.parse(allUsersJson) : [];
      const found = allUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

      if (!found) {
        setIsLoading(false);
        return { success: false, error: 'User not found. Please create an account.' };
      }
      if (found.pass && found.pass !== pass) {
        setIsLoading(false);
        return { success: false, error: 'Incorrect password.' };
      }

      localStorage.setItem('wa_active_user_id', found.id);
      setUser({ id: found.id, email: found.email });
      setProfile(found.profile);

      const allCommitsJson = localStorage.getItem(`wa_commitments_${found.id}`);
      setCommitments(allCommitsJson ? JSON.parse(allCommitsJson) : []);
      setIsLoading(false);
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) throw error;
      await refreshUserData();
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const loginWithGoogle = async () => {
    if (!supabase) {
      // Local Google mock login
      const newUserId = `user_google_${Date.now()}`;
      const newProfile: Profile = {
        id: newUserId,
        display_name: 'Google Warrior',
        avatar_url: null,
        timezone: getBrowserTimezone(),
        challenge_started_at: new Date().toISOString(),
        body_weight_kg: 72,
        created_at: new Date().toISOString(),
      };
      const allUsersJson = localStorage.getItem('wa_registered_users');
      const allUsers = allUsersJson ? JSON.parse(allUsersJson) : [];
      allUsers.push({ id: newUserId, email: 'google.warrior@winterarc.io', profile: newProfile });
      localStorage.setItem('wa_registered_users', JSON.stringify(allUsers));
      localStorage.setItem('wa_active_user_id', newUserId);

      setUser({ id: newUserId, email: 'google.warrior@winterarc.io' });
      setProfile(newProfile);
      setCommitments([]);
      return;
    }

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/app/individual`,
      },
    });
  };

  const loginWithTelegramPayload = async (payload: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Telegram verification failed');

      if (supabase && data.access_token) {
        await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });
      }
      await refreshUserData();
      return true;
    } catch (err) {
      console.error('Telegram login error:', err);
      return false;
    }
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setCommitments([]);
    localStorage.removeItem('wa_active_user_id');
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;
    const updated = { ...profile, ...updates };
    setProfile(updated);

    if (!supabase) {
      const allUsersJson = localStorage.getItem('wa_registered_users');
      if (allUsersJson) {
        const allUsers = JSON.parse(allUsersJson);
        const idx = allUsers.findIndex((u: any) => u.id === profile.id);
        if (idx >= 0) {
          allUsers[idx].profile = updated;
          localStorage.setItem('wa_registered_users', JSON.stringify(allUsers));
        }
      }
      return;
    }

    await supabase.from('profiles').update(updates).eq('id', profile.id);
  };

  const isOnboarded = commitments.length >= 5;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        commitments,
        isLoading,
        isOnboarded,
        signUpWithEmail,
        signInWithEmail,
        loginWithGoogle,
        loginWithTelegramPayload,
        logout,
        updateProfile,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
