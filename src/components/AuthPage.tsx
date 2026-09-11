import React, { useState } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  RefreshCw,
  UserCheck,
  Activity,
  Phone,
  FileCode2,
  Calendar,
  Lock,
  Mail,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  SUPABASE_PROJECT_URL,
  SUPABASE_PROJECT_ID,
  SUPABASE_ANON_KEY,
  SUPABASE_SETUP_SQL,
} from '../lib/supabase';

interface AuthPageProps {
  onNavigateToForm?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onNavigateToForm }) => {
  const {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    supabaseStatus,
    verifySupabaseConnection,
    openProfileModal,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'sql'>('signup');

  // Sign In Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Sign Up Form States (collecting user data)
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupShowPassword, setSignupShowPassword] = useState(false);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('');
  const [lifestyleNotes, setLifestyleNotes] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSuccessData, setSignupSuccessData] = useState<{
    name: string;
    email: string;
    table: string;
    synced: boolean;
  } | null>(null);

  // SQL Copy State
  const [copiedSql, setCopiedSql] = useState(false);
  const [refreshingConnection, setRefreshingConnection] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleRefreshConnection = async () => {
    setRefreshingConnection(true);
    await verifySupabaseConnection();
    setRefreshingConnection(false);
  };

  // Sign In Handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    const res = await login(loginEmail, loginPassword);
    setLoginLoading(false);

    if (!res.success) {
      setLoginError(res.error || 'Login failed. Please check your credentials.');
    }
  };

  // Sign Up Handler
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);
    setSignupLoading(true);

    const parsedAge = age ? parseInt(age, 10) : undefined;
    const res = await register(
      fullName,
      signupEmail,
      signupPassword,
      parsedAge,
      gender,
      phone,
      lifestyleNotes
    );

    setSignupLoading(false);

    if (!res.success) {
      setSignupError(res.error || 'Registration failed. Please try again.');
    } else {
      setSignupSuccessData({
        name: fullName,
        email: signupEmail,
        table: 'user_profiles',
        synced: res.supabaseSynced ?? true,
      });
    }
  };

  // Auto-fill demo patient for quick test
  const handleAutoFillDemo = () => {
    setFullName('Sarah Jenkins');
    setSignupEmail(`patient_${Math.floor(Math.random() * 900 + 100)}@example.com`);
    setSignupPassword('HealthPass2026!');
    setAge('38');
    setGender('Female');
    setPhone('+1 (555) 789-0123');
    setLifestyleNotes('Desk job 8h/day, moderate cardiovascular workouts on weekends, low sodium diet.');
    setSignupError(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Top Banner / Supabase Integration Info */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Database className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Supabase User Data &amp; Auth Portal
              </h2>
            </div>
            <p className="text-xs text-slate-600">
              Collect user registration details, credentials, and lifestyle parameters synced directly into your{' '}
              <span className="font-semibold text-slate-800">Supabase cloud database</span>.
            </p>
          </div>

          {/* Live Supabase Connection Badge */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs shrink-0">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  supabaseStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <div>
                <div className="font-semibold text-slate-800 flex items-center gap-1">
                  <span>Supabase:</span>
                  <span className={supabaseStatus.connected ? 'text-emerald-700' : 'text-amber-700'}>
                    {supabaseStatus.connected ? 'Connected' : 'Configured'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  ID: {SUPABASE_PROJECT_ID}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRefreshConnection}
              disabled={refreshingConnection}
              className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Test Supabase Connection"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshingConnection ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Supabase Endpoint Quick Bar */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-1 truncate max-w-full">
            <span className="font-semibold text-slate-600">Project Endpoint:</span>
            <span className="text-slate-800 truncate">{SUPABASE_PROJECT_URL}</span>
          </div>
          <a
            href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-sans font-semibold"
          >
            <span>Open Supabase Dashboard</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('signup')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'signup'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Sign Up (Collect User Data)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('login')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'login'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span>Login / Sign In</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sql')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'sql'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <FileCode2 className="w-4 h-4 text-emerald-600" />
          <span>Supabase SQL Setup Code</span>
          <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">
            SQL
          </span>
        </button>
      </div>

      {/* Authenticated User Status Bar */}
      {isAuthenticated && user && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-slate-900">
                Logged in as {user.name} ({user.email})
              </div>
              <div className="text-slate-600 text-[11px]">
                Active patient profile &bull; Synced with Supabase records
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openProfileModal}
              className="px-3 py-1.5 bg-white border border-blue-300 hover:bg-blue-100 text-blue-800 font-semibold rounded-md shadow-2xs transition-colors cursor-pointer"
            >
              View Profile &amp; History
            </button>
            <button
              type="button"
              onClick={logout}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-md transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: SIGN UP (COLLECT USER DATA) */}
      {activeTab === 'signup' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">User Data Registration Form</h3>
              <p className="text-xs text-slate-500">
                Collect patient personal, contact, and lifestyle background and insert into Supabase table{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 font-mono text-blue-700 rounded text-[11px]">
                  user_profiles
                </code>
              </p>
            </div>
            <button
              type="button"
              onClick={handleAutoFillDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Auto-Fill Sample Data</span>
            </button>
          </div>

          {signupSuccessData && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>User Record Saved Successfully!</span>
              </div>
              <p className="text-xs text-emerald-800">
                User <strong>{signupSuccessData.name}</strong> ({signupSuccessData.email}) was registered.
                {signupSuccessData.synced
                  ? ' Data was dispatched and saved to Supabase table "' + signupSuccessData.table + '".'
                  : ' Local record created. Make sure to run the SQL script to create the Supabase table.'}
              </p>
              <div className="pt-1 flex items-center gap-3">
                {onNavigateToForm && (
                  <button
                    type="button"
                    onClick={onNavigateToForm}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-900 underline hover:text-emerald-950"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Proceed to Disease Risk Prediction Form &rarr;</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {signupError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{signupError}</span>
            </div>
          )}

          <form onSubmit={handleSignupSubmit} className="space-y-4">
            {/* Full Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="john.doe@example.com"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Password & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={signupShowPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-10 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setSignupShowPassword(!signupShowPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {signupShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Encrypted &amp; captured securely into Supabase
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Age & Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Patient Age
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 35"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Biological Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other / Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            {/* Lifestyle & Medical Background */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lifestyle Habits &amp; Medical Background Notes
              </label>
              <textarea
                rows={3}
                value={lifestyleNotes}
                onChange={(e) => setLifestyleNotes(e.target.value)}
                placeholder="e.g. Sedentary computer job, mild smoker, family history of Type-2 diabetes, vegetarian diet..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                This data is mapped to lifestyle features for subsequent disease risk predictions.
              </span>
            </div>

            {/* Privacy & Supabase guarantee */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800">Supabase Transmission:</span> Submitting
                this form will automatically insert this record into the{' '}
                <code className="font-mono text-blue-700 font-semibold">user_profiles</code> table on
                Supabase project <code className="font-mono">{SUPABASE_PROJECT_ID}</code>.
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={signupLoading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm text-sm"
            >
              {signupLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Submitting to Supabase Database...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Register &amp; Save Data to Supabase</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: SIGN IN / LOGIN */}
      {activeTab === 'login' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs max-w-lg mx-auto space-y-6">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <LogIn className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Sign In to Health Portal</h3>
            <p className="text-xs text-slate-500">
              Access your medical history, saved disease risk assessments, and synced profile.
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type={loginShowPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-10 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setLoginShowPassword(!loginShowPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {loginShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm text-sm"
            >
              {loginLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Quick Sign-in Button */}
          <div className="pt-4 border-t border-slate-200">
            <div className="text-center text-xs text-slate-500 mb-2 font-medium">Or test with demo patient:</div>
            <button
              type="button"
              onClick={async () => {
                setLoginEmail('demo@healthai.org');
                setLoginPassword('demo123');
                setLoginLoading(true);
                await login('demo@healthai.org', 'demo123');
                setLoginLoading(false);
              }}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-300"
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Sign In as Demo Patient (Alex Morgan)</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: SUPABASE SQL SETUP CODE */}
      {activeTab === 'sql' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">Supabase SQL Schema &amp; Setup</h3>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Paste this SQL code into the <strong>SQL Editor</strong> in your Supabase dashboard to create the tables
                and permissions.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopySql}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer shrink-0"
            >
              {copiedSql ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>SQL Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy SQL Code</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Instructions Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Open Supabase</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Go to{' '}
                <a
                  href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline font-semibold"
                >
                  supabase.com/dashboard
                </a>{' '}
                and open project <code className="font-mono text-[10px]">{SUPABASE_PROJECT_ID}</code>.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>Navigate to SQL Editor</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                In the left navigation bar, click the <strong>SQL Editor</strong> icon (&gt;_) and click{' '}
                <strong>New Query</strong>.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                  3
                </span>
                <span>Paste &amp; Run</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Paste the SQL code below and click the green <strong>Run</strong> button. Your tables and policies will be created instantly!
              </p>
            </div>
          </div>

          {/* Formatted Code Block */}
          <div className="relative">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 text-slate-300 text-xs rounded-t-lg font-mono border-b border-slate-800">
              <span>supabase_schema_setup.sql</span>
              <button
                type="button"
                onClick={handleCopySql}
                className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto rounded-b-lg max-h-96 leading-relaxed border border-slate-800 selection:bg-emerald-900 selection:text-white">
              <code>{SUPABASE_SETUP_SQL}</code>
            </pre>
          </div>

          {/* Tables Overview */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">Tables Created By This Script</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 border border-slate-200 rounded-lg bg-slate-50 space-y-1.5">
                <div className="font-bold text-blue-800 font-mono flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-blue-600" />
                  <span>public.user_profiles</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Stores what users type on the Signup and Login page: full name, email address, password, age,
                  gender, phone, lifestyle notes, registration date, and last login timestamp.
                </p>
              </div>

              <div className="p-3 border border-slate-200 rounded-lg bg-slate-50 space-y-1.5">
                <div className="font-bold text-emerald-800 font-mono flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  <span>public.disease_assessments</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Stores clinical machine learning evaluations: target disease (Diabetes, Heart Disease, Stroke,
                  Hypertension), calculated risk level, probability score %, BMI, vitals, and actionable recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
