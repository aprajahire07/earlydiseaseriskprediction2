import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, SavedAssessment } from '../types';
import {
  supabase,
  syncUserToSupabase,
  recordLoginToSupabase,
  syncAssessmentToSupabase,
  fetchUserAssessmentsFromSupabase,
  updateUserNameInSupabase,
  checkSupabaseConnection,
} from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  assessments: SavedAssessment[];
  supabaseStatus: {
    checked: boolean;
    connected: boolean;
    message: string;
  };
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
    age?: number,
    gender?: string,
    phone?: string,
    lifestyleNotes?: string
  ) => Promise<{ success: boolean; error?: string; sessionCreated?: boolean }>;
  logout: () => Promise<void>;
  updateUserName: (newName: string) => Promise<boolean>;
  saveAssessment: (assessment: Omit<SavedAssessment, 'id' | 'userId' | 'date'>) => Promise<SavedAssessment>;
  getUserAssessments: () => SavedAssessment[];
  refreshAssessments: () => Promise<void>;
  deleteAssessment: (id: string) => Promise<void>;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  authModalOpen: boolean;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  profileModalOpen: boolean;
  verifySupabaseConnection: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [assessments, setAssessments] = useState<SavedAssessment[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [supabaseStatus, setSupabaseStatus] = useState<{ checked: boolean; connected: boolean; message: string }>({
    checked: false,
    connected: false,
    message: 'Checking connection...',
  });

  const verifySupabaseConnection = async () => {
    const res = await checkSupabaseConnection();
    setSupabaseStatus({
      checked: true,
      connected: res.ok,
      message: res.message,
    });
  };

  // Helper to fetch profile from Supabase user_profiles/profiles table
  const fetchUserProfile = async (supabaseUser: any): Promise<User> => {
    const userId = supabaseUser.id;
    const userEmail = supabaseUser.email || '';
    const userMetadataName =
      supabaseUser.user_metadata?.full_name ||
      supabaseUser.user_metadata?.name ||
      '';

    let resolvedName = userMetadataName;
    let age: number | undefined;
    let gender: string | undefined;
    let phone: string | undefined;
    let lifestyleNotes: string | undefined;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        if (data.full_name) resolvedName = data.full_name;
        if (data.age) age = data.age;
        if (data.gender) gender = data.gender;
        if (data.phone) phone = data.phone;
        if (data.lifestyle_notes) lifestyleNotes = data.lifestyle_notes;
      } else {
        // Also check if public.profiles exists
        const { data: pData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (pData && pData.full_name) {
          resolvedName = pData.full_name;
        }
      }
    } catch (e) {
      console.warn('Error fetching Supabase profile details:', e);
    }

    // Default friendly name from email if no name is found
    if (!resolvedName) {
      resolvedName = userEmail ? userEmail.split('@')[0] : 'Patient';
    }

    return {
      id: userId,
      email: userEmail,
      name: resolvedName,
      createdAt: supabaseUser.created_at || new Date().toISOString(),
      age,
      gender,
      phone,
      lifestyleNotes,
      syncedToSupabase: true,
    };
  };

  // Helper to load assessments strictly belonging to authenticated user from Supabase
  const loadUserAssessments = async (userId: string) => {
    if (!userId) {
      setAssessments([]);
      return;
    }
    try {
      const remoteList = await fetchUserAssessmentsFromSupabase(userId);
      setAssessments(remoteList);
    } catch (e) {
      console.warn('Error fetching assessments from Supabase:', e);
      setAssessments([]);
    }
  };

  // Production Supabase Auth session & onAuthStateChange subscription
  useEffect(() => {
    let mounted = true;

    // 1. Get initial session from real Supabase Auth
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (!mounted) return;
      if (error) {
        console.warn('Supabase getSession error:', error.message);
        setUser(null);
        setAssessments([]);
        return;
      }

      if (session?.user) {
        const profile = await fetchUserProfile(session.user);
        if (mounted) {
          setUser(profile);
          await loadUserAssessments(profile.id);
        }
      } else {
        setUser(null);
        setAssessments([]);
      }
    });

    // 2. Listen to real Supabase auth state changes
    const { data: authSubscription } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (session?.user) {
          const profile = await fetchUserProfile(session.user);
          if (mounted) {
            setUser(profile);
            await loadUserAssessments(profile.id);
          }
        } else {
          if (mounted) {
            setUser(null);
            setAssessments([]);
          }
        }
      }
    );

    verifySupabaseConnection();

    return () => {
      mounted = false;
      authSubscription?.subscription?.unsubscribe();
    };
  }, []);

  const refreshAssessments = async () => {
    if (user?.id) {
      await loadUserAssessments(user.id);
    }
  };

  // 100% REAL Supabase Login with signInWithPassword
  // Human-friendly error formatter that sanitizes technical backend and Supabase details
  const formatAuthError = (err: any, fallbackMessage: string): string => {
    if (!err) return fallbackMessage;
    const rawMsg = typeof err === 'string' ? err : err?.message || err?.error_description || String(err);
    const lower = rawMsg.toLowerCase();

    // Email rate-limit error (over_email_send_rate_limit) or request rate limit
    if (
      lower.includes('over_email_send_rate_limit') ||
      lower.includes('over_request_rate_limit') ||
      lower.includes('rate_limit') ||
      lower.includes('rate limit') ||
      lower.includes('too many requests') ||
      lower.includes('only request this once every')
    ) {
      return 'Too many signup attempts. Please try again later.';
    }

    // User already registered
    if (
      lower.includes('user_already_exists') ||
      lower.includes('already registered') ||
      lower.includes('already in use')
    ) {
      return 'An account with this email already exists. Please sign in instead.';
    }

    // Invalid credentials
    if (
      lower.includes('invalid login credentials') ||
      lower.includes('invalid credentials') ||
      lower.includes('invalid email or password')
    ) {
      return 'Invalid email or password. Please try again.';
    }

    // Password requirements
    if (
      lower.includes('weak_password') ||
      lower.includes('password should be') ||
      lower.includes('at least 6 characters')
    ) {
      return 'Password must be at least 6 characters long.';
    }

    // Technical database, Supabase, or internal details
    if (
      lower.includes('supabase') ||
      lower.includes('database') ||
      lower.includes('relation') ||
      lower.includes('schema') ||
      lower.includes('table') ||
      lower.includes('postgrest') ||
      lower.includes('jwt') ||
      lower.includes('internal error')
    ) {
      return fallbackMessage;
    }

    return rawMsg || fallbackMessage;
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !password) {
        return { success: false, error: 'Please enter both email and password.' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (error || !data.user) {
        return {
          success: false,
          error: formatAuthError(error, 'Invalid email or password. Please try again.'),
        };
      }

      const profile = await fetchUserProfile(data.user);
      setUser(profile);
      await loadUserAssessments(profile.id);
      recordLoginToSupabase(cleanEmail);
      setAuthModalOpen(false);

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: formatAuthError(err, 'Invalid email or password. Please try again.'),
      };
    }
  };

  // 100% REAL Supabase Sign Up with signUp and profiles table storage
  const register = async (
    name: string,
    email: string,
    password: string,
    age?: number,
    gender?: string,
    phone?: string,
    lifestyleNotes?: string
  ): Promise<{ success: boolean; error?: string; sessionCreated?: boolean }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name.trim();

      if (!cleanEmail || !cleanEmail.includes('@')) {
        return { success: false, error: 'Please provide a valid email address.' };
      }

      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }

      if (!cleanName) {
        return { success: false, error: 'Please enter your full name.' };
      }

      // 1. Call real Supabase Auth signUp
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            full_name: cleanName,
            name: cleanName,
          },
        },
      });

      if (error) {
        return {
          success: false,
          error: formatAuthError(error, 'Unable to create your account right now. Please try again.'),
        };
      }

      const createdUser = data.user;
      if (!createdUser) {
        return {
          success: false,
          error: 'Unable to create your account right now. Please try again.',
        };
      }

      // 2. Store real profile information in Supabase user_profiles and profiles
      await syncUserToSupabase({
        id: createdUser.id,
        email: cleanEmail,
        name: cleanName,
        age,
        gender,
        phone,
        lifestyleNotes,
      });

      // If Supabase has email confirmation turned off, session is immediately active
      if (data.session) {
        const profile: User = {
          id: createdUser.id,
          name: cleanName,
          email: cleanEmail,
          createdAt: createdUser.created_at || new Date().toISOString(),
          age,
          gender,
          phone,
          lifestyleNotes,
          syncedToSupabase: true,
        };
        setUser(profile);
        setAssessments([]);
        setAuthModalOpen(false);
        return { success: true, sessionCreated: true };
      }

      // If email confirmation is required by Supabase project settings
      setAuthModalOpen(false);
      return {
        success: true,
        sessionCreated: false,
      };
    } catch (err: any) {
      return {
        success: false,
        error: formatAuthError(err, 'Unable to create your account right now. Please try again.'),
      };
    }
  };

  // Update profile name in Supabase
  const updateUserName = async (newName: string): Promise<boolean> => {
    if (!user || !newName.trim()) return false;
    const trimmed = newName.trim();

    try {
      const updatedUser: User = { ...user, name: trimmed };
      setUser(updatedUser);

      // Update in Supabase profiles & auth metadata
      await updateUserNameInSupabase(user.id, trimmed);
      try {
        await supabase.auth.updateUser({
          data: { full_name: trimmed, name: trimmed },
        });
      } catch {
        // ignore metadata update failure
      }
      return true;
    } catch (e) {
      console.warn('Error updating name in Supabase:', e);
      return false;
    }
  };

  // 100% REAL Logout with supabase.auth.signOut()
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signOut error:', e);
    }
    setUser(null);
    setAssessments([]);
    setProfileModalOpen(false);
  };

  // Save assessment with REAL authenticated Supabase user ID: user_id = supabase.auth.getUser().data.user.id
  const saveAssessment = async (
    assessment: Omit<SavedAssessment, 'id' | 'userId' | 'date'>
  ): Promise<SavedAssessment> => {
    // Get fresh user from Supabase auth
    const { data: userData } = await supabase.auth.getUser();
    const activeUserId = userData?.user?.id || user?.id;

    if (!activeUserId) {
      throw new Error('Authentication required: Cannot save assessment without an authenticated user.');
    }

    const computedIndex =
      assessment.healthIndex ??
      Math.max(5, Math.min(98, Math.round(100 - (assessment.probability || 30))));

    const newRecord: SavedAssessment = {
      ...assessment,
      id: 'asmt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: activeUserId,
      fullName: assessment.fullName || user?.name || undefined,
      healthIndex: computedIndex,
      date: new Date().toISOString(),
      checkedAreas: assessment.checkedAreas || [
        'Type 2 Diabetes',
        'Heart Health',
        'Blood Pressure',
        'Stroke Risk',
        'Metabolic Health',
      ],
    };

    // Update in-memory state for immediate UI feedback
    setAssessments((prev) => [newRecord, ...prev]);

    // Save strictly to Supabase disease_assessments table
    try {
      await syncAssessmentToSupabase(newRecord, user);
    } catch (e) {
      console.warn('Could not sync assessment to Supabase:', e);
    }

    return newRecord;
  };

  const getUserAssessments = (): SavedAssessment[] => {
    return assessments;
  };

  const deleteAssessment = async (id: string) => {
    if (!user) return;
    try {
      setAssessments((prev) => prev.filter((a) => a.id !== id));
      await supabase.from('disease_assessments').delete().eq('id', id);
    } catch (e) {
      console.error('Failed to delete assessment from Supabase:', e);
    }
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const openProfileModal = () => {
    setProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setProfileModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        assessments,
        supabaseStatus,
        login,
        register,
        logout,
        updateUserName,
        saveAssessment,
        getUserAssessments,
        refreshAssessments,
        deleteAssessment,
        openAuthModal,
        closeAuthModal,
        authModalOpen,
        authModalMode,
        setAuthModalMode,
        openProfileModal,
        closeProfileModal,
        profileModalOpen,
        verifySupabaseConnection,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
