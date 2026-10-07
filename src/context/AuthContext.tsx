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
  updateUserName: (newName: string) => Promise<boolean>;
  saveAssessment: (assessment: Omit<SavedAssessment, 'id' | 'userId' | 'date'>) => Promise<SavedAssessment>;
  getUserAssessments: () => SavedAssessment[];
  refreshAssessments: () => Promise<void>;
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

  // Helper to load isolated assessments for a user
  const loadUserAssessments = async (currentUser: User) => {
    // 1. Load from local storage (filtered by user id)
    try {
      const raw = localStorage.getItem(`${ASSESSMENTS_STORAGE_KEY}_${currentUser.id}`);
      if (raw) {
        const localList: SavedAssessment[] = JSON.parse(raw);
        setAssessments(localList);
      } else {
        // Check legacy global list
        const legacyRaw = localStorage.getItem(ASSESSMENTS_STORAGE_KEY);
        if (legacyRaw) {
          const list: SavedAssessment[] = JSON.parse(legacyRaw);
          const userOnly = list.filter((a) => a.userId === currentUser.id);
          setAssessments(userOnly);
          localStorage.setItem(`${ASSESSMENTS_STORAGE_KEY}_${currentUser.id}`, JSON.stringify(userOnly));
        }
      }
    } catch (e) {
      console.warn('Error reading local assessments:', e);
    }

    // 2. Fetch directly from Supabase by user_id
    try {
      const remoteList = await fetchUserAssessmentsFromSupabase(currentUser.id);
      if (remoteList && remoteList.length > 0) {
        setAssessments(remoteList);
        localStorage.setItem(`${ASSESSMENTS_STORAGE_KEY}_${currentUser.id}`, JSON.stringify(remoteList));
      }
    } catch (e) {
      console.warn('Error fetching remote assessments:', e);
    }
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
          lifestyleNotes: 'Desk job, light exercise on weekends',
          syncedToSupabase: true,
        };
        usersList.push(demoUser);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersList));

        // Seed initial assessment for demo user
        const demoAssessments: SavedAssessment[] = [
          {
            id: 'asmt_demo_sample_1',
            userId: demoUser.id,
            fullName: 'Alex Morgan',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            disease: 'Heart Health',
            riskLevel: 'Low',
            probability: 22,
            healthIndex: 89,
            bmi: 23.4,
            bloodPressure: '118/76',
            physicalActivity: '180 min/week',
            smoking: 'Non-Smoker',
            alcohol: 'None',
            familyHistory: 'Moderate',
            recommendations: [
              'Continue maintaining 150+ minutes of aerobic activity weekly.',
              'Maintain your balanced diet and hydration.',
              'Schedule annual routine health checkup.',
            ],
            checkedAreas: ['Type 2 Diabetes', 'Heart Health', 'Blood Pressure', 'Stroke Risk', 'Metabolic Health'],
          },
          {
            id: 'asmt_demo_sample_2',
            userId: demoUser.id,
            fullName: 'Alex Morgan',
            date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            disease: 'Blood Pressure',
            riskLevel: 'Moderate',
            probability: 38,
            healthIndex: 78,
            bmi: 24.8,
            bloodPressure: '128/82',
            physicalActivity: '90 min/week',
            smoking: 'Non-Smoker',
            alcohol: 'Occasional',
            familyHistory: 'Moderate',
            recommendations: [
              'Target 150 minutes of moderate aerobic cardiovascular exercise weekly.',
              'Monitor resting blood pressure twice monthly.',
              'Maintain daily sodium intake under 2,000 mg.',
            ],
            checkedAreas: ['Type 2 Diabetes', 'Heart Health', 'Blood Pressure', 'Stroke Risk', 'Metabolic Health'],
          },
        ];
        localStorage.setItem(`${ASSESSMENTS_STORAGE_KEY}_${demoUser.id}`, JSON.stringify(demoAssessments));
      }

      // 2. Check local login session
      const savedUser = localStorage.getItem(CURRENT_USER_KEY);
      if (savedUser) {
        const parsedUser: User = JSON.parse(savedUser);
        setUser(parsedUser);
        loadUserAssessments(parsedUser);
      }
    } catch (e) {
      console.error('Failed to initialize local auth state:', e);
    }

    verifySupabaseConnection();
  }, []);

  // When user state changes, reload their assessments
  useEffect(() => {
    if (user) {
      loadUserAssessments(user);
    } else {
      setAssessments([]);
    }
  }, [user?.id]);

  const refreshAssessments = async () => {
    if (user) {
      await loadUserAssessments(user);
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; supabaseSynced?: boolean }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !password) {
        return { success: false, error: 'Please enter both email and password.' };
      }

      const usersRaw = localStorage.getItem(USERS_STORAGE_KEY);
      const users: Array<User & { passwordHash: string }> = usersRaw ? JSON.parse(usersRaw) : [];

      const matchedUser = users.find(
        (u) => u.email.toLowerCase() === cleanEmail && u.passwordHash === password
      );

      if (!matchedUser) {
        return { success: false, error: 'Invalid email or password.' };
      }

      const sessionUser: User = {
        id: matchedUser.id,
        name: matchedUser.name,
        email: matchedUser.email,
        createdAt: matchedUser.createdAt,
        age: matchedUser.age,
        gender: matchedUser.gender,
        phone: matchedUser.phone,
        lifestyleNotes: matchedUser.lifestyleNotes,
        syncedToSupabase: matchedUser.syncedToSupabase,
      };

      setUser(sessionUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
      setAuthModalOpen(false);

      // Async record login to Supabase
      recordLoginToSupabase(sessionUser.email);
      loadUserAssessments(sessionUser);

      return { success: true };
    } catch {
      return { success: false, error: 'An error occurred during sign in.' };
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
        return { success: false, error: 'Please enter your name.' };
      }

      const usersRaw = localStorage.getItem(USERS_STORAGE_KEY);
      const users: Array<User & { passwordHash: string }> = usersRaw ? JSON.parse(usersRaw) : [];

      if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
        return { success: false, error: 'An account with this email already exists. Please sign in.' };
      }

      const newUserId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

      // 1. Sync typed data to Supabase database table `user_profiles`
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

      // 2. Save locally
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
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const updateUserName = async (newName: string): Promise<boolean> => {
    if (!user || !newName.trim()) return false;
    const trimmed = newName.trim();

    try {
      // 1. Update state
      const updatedUser: User = { ...user, name: trimmed };
      setUser(updatedUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

      // 2. Update in user list
      const usersRaw = localStorage.getItem(USERS_STORAGE_KEY);
      if (usersRaw) {
        const users: Array<User & { passwordHash: string }> = JSON.parse(usersRaw);
        const idx = users.findIndex((u) => u.id === user.id);
        if (idx !== -1) {
          users[idx].name = trimmed;
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        }
      }

      // 3. Update in Supabase
      await updateUserNameInSupabase(user.id, trimmed);
      return true;
    } catch (e) {
      console.warn('Error updating name:', e);
      return false;
    }
  };

  const logout = () => {
    try {
      supabase.auth.signOut();
    } catch (e) {
      // ignore
    }
    setUser(null);
    setAssessments([]);
    localStorage.removeItem(CURRENT_USER_KEY);
    setProfileModalOpen(false);
  };

  const saveAssessment = async (
    assessment: Omit<SavedAssessment, 'id' | 'userId' | 'date'>
  ): Promise<SavedAssessment> => {
    const activeUserId = user ? user.id : 'guest_session';
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

    // 1. Update in-memory state if belongs to active user
    if (user && activeUserId === user.id) {
      setAssessments((prev) => [newRecord, ...prev]);

      // Save to isolated local storage for user
      try {
        const userStorageKey = `${ASSESSMENTS_STORAGE_KEY}_${user.id}`;
        const raw = localStorage.getItem(userStorageKey);
        const list: SavedAssessment[] = raw ? JSON.parse(raw) : [];
        list.unshift(newRecord);
        localStorage.setItem(userStorageKey, JSON.stringify(list));
      } catch (e) {
        console.error('Failed to save assessment to user storage:', e);
      }
    }

    // 2. Automatically save to Supabase disease_assessments table
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

      const userStorageKey = `${ASSESSMENTS_STORAGE_KEY}_${user.id}`;
      const raw = localStorage.getItem(userStorageKey);
      if (raw) {
        const list: SavedAssessment[] = JSON.parse(raw);
        const updated = list.filter((a) => a.id !== id);
        localStorage.setItem(userStorageKey, JSON.stringify(updated));
      }

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
