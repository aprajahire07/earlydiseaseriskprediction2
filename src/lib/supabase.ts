import { createClient } from '@supabase/supabase-js';
import { User, SavedAssessment } from '../types';

export const SUPABASE_PROJECT_URL =
  ((import.meta as any)?.env?.VITE_SUPABASE_URL as string) ||
  'https://lkhrgqdmfwclkrpbziou.supabase.co';

export const SUPABASE_ANON_KEY =
  ((import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY as string) ||
  'sb_publishable_jhclED9qM1cvlNYCf1BTxA_C4oXsSoz';

export const SUPABASE_PROJECT_ID = 'lkhrgqdmfwclkrpbziou';

// Initialize Supabase Client
export const supabase = createClient(SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * SQL script for Supabase SQL Editor.
 * This sets up user_profiles and disease_assessments tables with open Row Level Security policies
 * so data typed during signup/login and prediction can be collected smoothly.
 */
export const SUPABASE_SETUP_SQL = `-- ==============================================================================
-- SUPABASE DATABASE SETUP FOR EARLY DISEASE RISK PREDICTION APP
-- Project ID: ${SUPABASE_PROJECT_ID}
-- Run this script in your Supabase Project -> SQL Editor -> New Query
-- ==============================================================================

-- 1. Create user_profiles table for collecting user data typed in Login & Signup
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  password_captured TEXT,
  age INTEGER,
  gender TEXT,
  phone TEXT,
  lifestyle_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_login_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create disease_assessments table for health risk predictions
CREATE TABLE IF NOT EXISTS public.disease_assessments (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_email TEXT,
  user_name TEXT,
  disease TEXT NOT NULL,
  risk_level TEXT NOT NULL,
  probability NUMERIC NOT NULL,
  bmi NUMERIC,
  blood_pressure TEXT,
  physical_activity TEXT,
  smoking TEXT,
  alcohol TEXT,
  family_history TEXT,
  recommendations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disease_assessments ENABLE ROW LEVEL SECURITY;

-- 4. Create permissive policies for the web client (anon key) to insert and view data
DROP POLICY IF EXISTS "Allow anon all on user_profiles" ON public.user_profiles;
CREATE POLICY "Allow anon all on user_profiles"
  ON public.user_profiles
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on disease_assessments" ON public.disease_assessments;
CREATE POLICY "Allow anon all on disease_assessments"
  ON public.disease_assessments
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Helpful index for fast queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles (email);
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON public.disease_assessments (user_id);
`;

/**
 * Check if the Supabase database is accessible
 */
export async function checkSupabaseConnection(): Promise<{ ok: boolean; message: string; details?: any }> {
  try {
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count', { count: 'exact', head: true });

    const ping = Date.now() - startTime;

    if (error) {
      // If table doesn't exist yet, Supabase is still responding
      if (error.code === '42P01') {
        return {
          ok: true,
          message: 'Connected to Supabase! (Table "user_profiles" not yet created. Run SQL script).',
          details: { ping, code: error.code },
        };
      }
      return {
        ok: false,
        message: `Supabase returned: ${error.message} (${error.code || 'Auth/Config error'})`,
        details: error,
      };
    }

    return {
      ok: true,
      message: `Successfully connected to Supabase (${ping}ms latency)`,
      details: { ping, count: data },
    };
  } catch (err: any) {
    return {
      ok: false,
      message: `Connection error: ${err?.message || 'Unable to reach Supabase API'}`,
      details: err,
    };
  }
}

/**
 * Save typed user registration data directly to Supabase table
 */
export async function syncUserToSupabase(user: {
  id: string;
  email: string;
  name: string;
  password?: string;
  age?: number;
  gender?: string;
  phone?: string;
  lifestyleNotes?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = {
      id: user.id,
      email: user.email.toLowerCase().trim(),
      full_name: user.name.trim(),
      password_captured: user.password || null,
      age: user.age || null,
      gender: user.gender || null,
      phone: user.phone || null,
      lifestyle_notes: user.lifestyleNotes || null,
      created_at: new Date().toISOString(),
      last_login_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('user_profiles')
      .upsert(payload, { onConflict: 'email' });

    if (error) {
      console.warn('Supabase profile sync warning:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.warn('Supabase sync exception:', err);
    return { success: false, error: err?.message || 'Failed to sync to Supabase' };
  }
}

/**
 * Record a login event in Supabase
 */
export async function recordLoginToSupabase(email: string): Promise<void> {
  try {
    await supabase
      .from('user_profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('email', email.toLowerCase().trim());
  } catch (err) {
    console.warn('Could not update last login time in Supabase:', err);
  }
}

/**
 * Sync assessment report to Supabase disease_assessments table
 */
export async function syncAssessmentToSupabase(
  assessment: SavedAssessment,
  user?: User | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = {
      id: assessment.id,
      user_id: assessment.userId,
      user_email: user?.email || null,
      user_name: user?.name || null,
      disease: assessment.disease,
      risk_level: assessment.riskLevel,
      probability: assessment.probability,
      bmi: assessment.bmi,
      blood_pressure: assessment.bloodPressure,
      physical_activity: assessment.physicalActivity,
      smoking: assessment.smoking,
      alcohol: assessment.alcohol,
      family_history: assessment.familyHistory,
      recommendations: assessment.recommendations,
      created_at: assessment.date || new Date().toISOString(),
    };

    const { error } = await supabase.from('disease_assessments').insert(payload);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error saving assessment' };
  }
}
