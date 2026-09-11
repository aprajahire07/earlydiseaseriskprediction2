import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, SavedAssessment } from '../types';
import {
  supabase,
  syncUserToSupabase,
  recordLoginToSupabase,
  syncAssessmentToSupabase,
  checkSupabaseConnection,
} from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  supabaseStatus: {
    checked: boolean;
    connected: boolean;
    message: string;
  };
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; supabaseSynced?: boolean }>;
  register: (
    name: string,
    email: string,
    password: string,
    age?: number,
    gender?: string,
    phone?: string,
    lifestyleNotes?: string
  ) => Promise<{ success: boolean; error?: string; supabaseSynced?: boolean }>;
  logout: () => void;
  saveAssessment: (assessment: Omit<SavedAssessment, 'id' | 'userId' | 'date'>) => Promise<SavedAssessment>;
  getUserAssessments: () => SavedAssessment[];
  deleteAssessment: (id: string) => void;
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

const USERS_STORAGE_KEY = 'disease_risk_users_v1';
const CURRENT_USER_KEY = 'disease_risk_current_user_v1';
const ASSESSMENTS_STORAGE_KEY = 'disease_risk_assessments_v1';

// Seed demo patient credentials
const DEMO_USER_EMAIL = 'demo@healthai.org';
const DEMO_USER_PASSWORD = 'demo123';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [supabaseStatus, setSupabaseStatus] = useState<{ checked: boolean; connected: boolean; message: string }>({
    checked: false,
    connected: false,
    message: 'Checking Supabase connection...',
  });

  const verifySupabaseConnection = async () => {
    const res = await checkSupabaseConnection();
    setSupabaseStatus({
      checked: true,
      connected: res.ok,
      message: res.message,
    });
  };

  // Initialize and load saved session
  useEffect(() => {
    try {
      // 1. Seed demo user credentials if not present
      const existingUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
      let usersList: Array<User & { passwordHash: string }> = existingUsersRaw
        ? JSON.parse(existingUsersRaw)
        : [];

      const demoExists = usersList.some((u) => u.email.toLowerCase() === DEMO_USER_EMAIL);
      if (!demoExists) {
        const demoUser: User & { passwordHash: string } = {
          id: 'usr_demo_patient_01',
          name: 'Alex Morgan',
          email: DEMO_USER_EMAIL,
          passwordHash: DEMO_USER_PASSWORD,
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          age: 42,
          gender: 'Male',
          phone: '+1 (555) 234-8901',
          lifestyleNotes: 'Desk job, light exercise on weekends, family history of hypertension',
          syncedToSupabase: true,
        };
        usersList.push(demoUser);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersList));

        // Seed initial assessment
        const existingAssessmentsRaw = localStorage.getItem(ASSESSMENTS_STORAGE_KEY);
        let assessmentsList: SavedAssessment[] = existingAssessmentsRaw
          ? JSON.parse(existingAssessmentsRaw)
          : [];

        if (!assessmentsList.some((a) => a.userId === demoUser.id)) {
          assessmentsList.push({
            id: 'asmt_demo_sample',
            userId: demoUser.id,
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            disease: 'Heart Disease',
            riskLevel: 'Moderate',
            probability: 44,
            bmi: 27.8,
            bloodPressure: 'Stage 1 Hypertension',
            physicalActivity: '1-2 days/week (Light)',
            smoking: 'Former Smoker',
            alcohol: 'Moderate',
            familyHistory: 'Yes, 1 immediate family member',
            recommendations: [
              'Target 150 minutes of moderate aerobic cardiovascular exercise weekly.',
              'Schedule a blood pressure recheck and fasting lipid profile screening.',
              'Maintain daily sodium intake under 2,000 mg.',
            ],
          });
          localStorage.setItem(ASSESSMENTS_STORAGE_KEY, JSON.stringify(assessmentsList));
        }
      }

      // 2. Check local login session
      const savedUser = localStorage.getItem(CURRENT_USER_KEY);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Failed to initialize local auth state:', e);
    }

    // 3. Test Supabase connectivity
    verifySupabaseConnection();
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; supabaseSynced?: boolean }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      let supabaseAuthWorked = false;

      // Attempt Supabase native auth first if possible
      try {
        const { data: supaAuthData, error: supaAuthErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });
        if (!supaAuthErr && supaAuthData?.user) {
          supabaseAuthWorked = true;
        }
      } catch (err) {
        // Fallback gracefully to database profile check
      }

      // Check user in database or local storage
      const usersRaw = localStorage.getItem(USERS_STORAGE_KEY);
      const users: Array<User & { passwordHash: string }> = usersRaw ? JSON.parse(usersRaw) : [];
      let matchedUser = users.find((u) => u.email.toLowerCase() === cleanEmail);

      // Check credentials
      if (!matchedUser && !supabaseAuthWorked) {
        // Attempt to query user from Supabase user_profiles table directly
        try {
          const { data: remoteProfile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('email', cleanEmail)
            .single();

          if (remoteProfile) {
            matchedUser = {
              id: remoteProfile.id,
              name: remoteProfile.full_name,
              email: remoteProfile.email,
              passwordHash: remoteProfile.password_captured || password,
              createdAt: remoteProfile.created_at,
              age: remoteProfile.age,
              gender: remoteProfile.gender,
              phone: remoteProfile.phone,
              lifestyleNotes: remoteProfile.lifestyle_notes,
              syncedToSupabase: true,
            };
            users.push(matchedUser);
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
          }
        } catch (e) {
          // continue
        }
      }

      if (!matchedUser && !supabaseAuthWorked) {
        return { success: false, error: 'No account found with this email. Please register.' };
      }

      if (matchedUser && matchedUser.passwordHash !== password && !supabaseAuthWorked) {
        return { success: false, error: 'Incorrect password. Please verify and try again.' };
      }

      const sessionUser: User = {
        id: matchedUser?.id || 'usr_' + Date.now(),
        name: matchedUser?.name || cleanEmail.split('@')[0],
        email: cleanEmail,
        createdAt: matchedUser?.createdAt || new Date().toISOString(),
        age: matchedUser?.age,
        gender: matchedUser?.gender,
        phone: matchedUser?.phone,
        lifestyleNotes: matchedUser?.lifestyleNotes,
        syncedToSupabase: true,
      };

      setUser(sessionUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
      setAuthModalOpen(false);

      // Update last login in Supabase asynchronously
      recordLoginToSupabase(cleanEmail);

      return { success: true, supabaseSynced: true };
    } catch {
      return { success: false, error: 'Authentication service encountered an error.' };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    age?: number,
    gender?: string,
    phone?: string,
    lifestyleNotes?: string
  ): Promise<{ success: boolean; error?: string; supabaseSynced?: boolean }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        return { success: false, error: 'Please provide a valid email address.' };
      }

      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }

      if (!name.trim()) {
        return { success: false, error: 'Please enter your full name.' };
      }

      const usersRaw = localStorage.getItem(USERS_STORAGE_KEY);
      const users: Array<User & { passwordHash: string }> = usersRaw ? JSON.parse(usersRaw) : [];

      if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
        return { success: false, error: 'An account with this email already exists. Please sign in.' };
      }

      const newUserId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

      // 1. Try Supabase native auth
      try {
        await supabase.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            data: {
              full_name: name.trim(),
              age,
              gender,
              phone,
            },
          },
        });
      } catch (err) {
        console.warn('Supabase auth signUp notification:', err);
      }

      // 2. Transmit typed data to Supabase database table `user_profiles`
      let syncedToSupabase = false;
      const supaResult = await syncUserToSupabase({
        id: newUserId,
        email: cleanEmail,
        name: name.trim(),
        password: password,
        age,
        gender,
        phone,
        lifestyleNotes,
      });

      if (supaResult.success) {
        syncedToSupabase = true;
      }

      // 3. Save locally as persistent cache
      const newUser: User & { passwordHash: string } = {
        id: newUserId,
        name: name.trim(),
        email: cleanEmail,
        passwordHash: password,
        createdAt: new Date().toISOString(),
        age: age || undefined,
        gender: gender || undefined,
        phone: phone || undefined,
        lifestyleNotes: lifestyleNotes || undefined,
        syncedToSupabase,
      };

      users.push(newUser);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

      const sessionUser: User = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
        age: newUser.age,
        gender: newUser.gender,
        phone: newUser.phone,
        lifestyleNotes: newUser.lifestyleNotes,
        syncedToSupabase,
      };

      setUser(sessionUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
      setAuthModalOpen(false);

      return {
        success: true,
        supabaseSynced: syncedToSupabase,
      };
    } catch {
      return { success: false, error: 'Registration failed due to a system error.' };
    }
  };

  const logout = () => {
    try {
      supabase.auth.signOut();
    } catch (e) {
      // ignore
    }
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    setProfileModalOpen(false);
  };

  const saveAssessment = async (
    assessment: Omit<SavedAssessment, 'id' | 'userId' | 'date'>
  ): Promise<SavedAssessment> => {
    const activeUserId = user ? user.id : 'guest_session';
    const newRecord: SavedAssessment = {
      ...assessment,
      id: 'asmt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: activeUserId,
      date: new Date().toISOString(),
    };

    // Save to local cache
    try {
      const raw = localStorage.getItem(ASSESSMENTS_STORAGE_KEY);
      const list: SavedAssessment[] = raw ? JSON.parse(raw) : [];
      list.unshift(newRecord);
      localStorage.setItem(ASSESSMENTS_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save assessment locally:', e);
    }

    // Save to Supabase disease_assessments table
    try {
      await syncAssessmentToSupabase(newRecord, user);
    } catch (e) {
      console.warn('Could not sync assessment to Supabase:', e);
    }

    return newRecord;
  };

  const getUserAssessments = (): SavedAssessment[] => {
    if (!user) return [];
    try {
      const raw = localStorage.getItem(ASSESSMENTS_STORAGE_KEY);
      const list: SavedAssessment[] = raw ? JSON.parse(raw) : [];
      return list.filter((a) => a.userId === user.id);
    } catch {
      return [];
    }
  };

  const deleteAssessment = async (id: string) => {
    try {
      const raw = localStorage.getItem(ASSESSMENTS_STORAGE_KEY);
      const list: SavedAssessment[] = raw ? JSON.parse(raw) : [];
      const updated = list.filter((a) => a.id !== id);
      localStorage.setItem(ASSESSMENTS_STORAGE_KEY, JSON.stringify(updated));

      // Also attempt delete in Supabase
      await supabase.from('disease_assessments').delete().eq('id', id);
    } catch (e) {
      console.error('Failed to delete assessment:', e);
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
        supabaseStatus,
        login,
        register,
        logout,
        saveAssessment,
        getUserAssessments,
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
