import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SavedAssessment } from '../types';
import {
  HeartPulse,
  Activity,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Check,
  User as UserIcon,
  LogOut,
  Edit2,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  LogIn,
} from 'lucide-react';

interface MyHealthDashboardProps {
  onNavigateToForm: () => void;
}

export const MyHealthDashboard: React.FC<MyHealthDashboardProps> = ({ onNavigateToForm }) => {
  const {
    user,
    isAuthenticated,
    assessments,
    logout,
    updateUserName,
    openAuthModal,
    login,
  } = useAuth();

  const [selectedAssessment, setSelectedAssessment] = useState<SavedAssessment | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [saveNameSuccess, setSaveNameSuccess] = useState(false);

  // Quick Sign In for signed-out visitors
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Helper date formatter
  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Recent';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const formatLongDate = (isoString?: string) => {
    if (!isoString) return 'Recent';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const getRiskColor = (level: string) => {
    const l = level.toLowerCase();
    if (l.includes('high')) return 'text-rose-700 bg-rose-50 border-rose-200';
    if (l.includes('moderate') || l.includes('medium')) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) return;
    const ok = await updateUserName(editedName);
    if (ok) {
      setIsEditingName(false);
      setSaveNameSuccess(true);
      setTimeout(() => setSaveNameSuccess(false), 2500);
    }
  };

  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    const res = await login(loginEmail, loginPassword);
    setLoginLoading(false);
    if (!res.success) {
      setLoginError(res.error || 'Invalid credentials.');
    }
  };

  const handleQuickDemo = async () => {
    setLoginError(null);
    setLoginLoading(true);
    const res = await login('demo@healthai.org', 'demo123');
    setLoginLoading(false);
    if (!res.success) {
      setLoginError('Could not sign in with demo account.');
    }
  };

  // If not logged in, show friendly consumer sign in view
  if (!isAuthenticated || !user) {
    return (
      <div className="space-y-8 max-w-xl mx-auto py-6 animate-fadeIn">
        <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-white/90 shadow-xl space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
            <HeartPulse className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Health Dashboard
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              Sign in to view your past health assessments, track vital changes, and review personalized prevention plans.
            </p>
          </div>

          <form onSubmit={handleQuickLogin} className="space-y-3.5 text-left pt-2">
            {loginError && (
              <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs">
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Your password"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{loginLoading ? 'Signing In...' : 'Sign In to My Health'}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-200/60 space-y-3">
            <button
              type="button"
              onClick={handleQuickDemo}
              disabled={loginLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>1-Click Demo Login (Alex Morgan)</span>
            </button>

            <p className="text-xs text-slate-500">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => openAuthModal('register')}
                className="font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Derived user statistics
  const totalAssessments = assessments.length;
  const latestAssessment = totalAssessments > 0 ? assessments[0] : null;
  const latestRisk = latestAssessment ? latestAssessment.riskLevel : 'None';
  const latestHealthIndex = latestAssessment
    ? latestAssessment.healthIndex || Math.max(5, Math.min(98, Math.round(100 - latestAssessment.probability)))
    : '--';

  // DETAIL VIEW FOR A SPECIFIC ASSESSMENT
  if (selectedAssessment) {
    const healthIdx =
      selectedAssessment.healthIndex ||
      Math.max(5, Math.min(98, Math.round(100 - selectedAssessment.probability)));

    return (
      <div className="space-y-8 max-w-4xl mx-auto py-2 animate-fadeIn">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => setSelectedAssessment(null)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass-panel glass-panel-hover text-slate-700 font-bold text-xs border border-white/80 cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Health History</span>
        </button>

        {/* Full Assessment Header Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-white/90 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Assessment Date: {formatLongDate(selectedAssessment.date)}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Health Assessment Report
              </h2>
              {selectedAssessment.fullName && (
                <p className="text-xs text-slate-500">
                  Completed for: <strong className="text-slate-700">{selectedAssessment.fullName}</strong>
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400">Health Index</div>
                <div className="text-2xl font-black text-blue-600">{healthIdx} <span className="text-xs font-normal text-slate-400">/ 100</span></div>
              </div>
              <span className={`text-xs px-3.5 py-1.5 font-bold rounded-full border ${getRiskColor(selectedAssessment.riskLevel)}`}>
                {selectedAssessment.riskLevel} Risk
              </span>
            </div>
          </div>

          {/* Health Snapshot Parameters */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Your Health Snapshot
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/80 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">BMI</div>
                <div className="text-base font-extrabold text-slate-900">{selectedAssessment.bmi}</div>
                <div className="text-[11px] text-slate-500">kg/m²</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/80 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Blood Pressure</div>
                <div className="text-base font-extrabold text-slate-900">{selectedAssessment.bloodPressure.split('(')[0]}</div>
                <div className="text-[11px] text-slate-500">Resting</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/80 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Exercise</div>
                <div className="text-base font-extrabold text-slate-900">{selectedAssessment.physicalActivity.split('(')[0]}</div>
                <div className="text-[11px] text-slate-500">Activity Level</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/80 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Lifestyle</div>
                <div className="text-base font-extrabold text-slate-900 truncate">{selectedAssessment.smoking.split('(')[0]}</div>
                <div className="text-[11px] text-slate-500 truncate">{selectedAssessment.alcohol} Alcohol</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/80 space-y-1 col-span-2 sm:col-span-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Family History</div>
                <div className="text-base font-extrabold text-slate-900 truncate">{selectedAssessment.familyHistory}</div>
                <div className="text-[11px] text-slate-500">Hereditary</div>
              </div>
            </div>
          </div>

          {/* Areas We Checked */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Areas We Checked
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                'Type 2 Diabetes',
                'Heart Health',
                'Blood Pressure',
                'Stroke Risk',
                'Metabolic Health',
              ].map((area, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-white/80 border border-slate-200/70 flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{area}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Next Steps */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Your Recommended Next Steps
            </h3>
            <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-2">
              <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-slate-700">
                {selectedAssessment.recommendations && selectedAssessment.recommendations.length > 0 ? (
                  selectedAssessment.recommendations.map((rec, idx) => (
                    <li key={idx} className="leading-relaxed pl-1">
                      {rec}
                    </li>
                  ))
                ) : (
                  <li>Maintain balanced nutrition, stay hydrated, and take routine annual health checkups.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MAIN DASHBOARD VIEW
  return (
    <div className="space-y-10 max-w-5xl mx-auto py-2 animate-fadeIn">
      {/* 1. Welcome Area & Profile Overview */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/90 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user.name} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Here you can view your past health assessments and track changes over time.
            </p>
          </div>

          {/* Account Profile Bar */}
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/70 border border-slate-200/80 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
              {user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div className="text-xs">
              <div className="font-bold text-slate-900">{user.name}</div>
              <div className="text-slate-500 text-[11px] truncate max-w-[140px]">{user.email}</div>
            </div>

            <div className="h-6 w-px bg-slate-200 mx-1"></div>

            <button
              type="button"
              onClick={() => setIsEditingName(!isEditingName)}
              className="p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Edit Name"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={logout}
              className="p-2 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Inline Edit Name Field */}
        {isEditingName && (
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3 animate-fadeIn">
            <div className="text-xs font-bold text-blue-900">Edit Your Account Name</div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-full sm:w-72"
                placeholder="Enter your name"
              />
              <button
                type="button"
                onClick={handleSaveName}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                className="px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {saveNameSuccess && (
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-1.5 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Name updated successfully!</span>
          </div>
        )}
      </div>

      {/* 2. Health Overview: 4 Glass Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Latest Assessment */}
        <div className="glass-panel rounded-3xl p-5 space-y-1.5 border border-white/90 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Latest Assessment</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {latestAssessment ? formatDate(latestAssessment.date) : 'None'}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {latestAssessment ? 'Most recent analysis' : 'No records yet'}
          </div>
        </div>

        {/* Metric 2: Current Risk */}
        <div className="glass-panel rounded-3xl p-5 space-y-1.5 border border-white/90 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Current Risk</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {latestRisk}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Cumulative level
          </div>
        </div>

        {/* Metric 3: Health Index */}
        <div className="glass-panel rounded-3xl p-5 space-y-1.5 border border-white/90 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Health Index</span>
            <Activity className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {latestHealthIndex} {latestHealthIndex !== '--' && <span className="text-xs font-normal text-slate-400">/ 100</span>}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Lifestyle score
          </div>
        </div>

        {/* Metric 4: Total Assessments */}
        <div className="glass-panel rounded-3xl p-5 space-y-1.5 border border-white/90 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Assessments</span>
            <TrendingUp className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {totalAssessments}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Saved in history
          </div>
        </div>
      </div>

      {/* 3. Health History / Timeline Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Your Health History
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Your previous assessments are saved here so you can track your health over time.
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateToForm}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer self-start sm:self-auto"
          >
            <span>Take New Assessment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Empty State */}
        {assessments.length === 0 ? (
          <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center space-y-5 border border-white/90 shadow-md">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-slate-900">
                Your health journey starts here.
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Complete your first health assessment to start building your health history and receive personalized guidance.
              </p>
            </div>

            <button
              type="button"
              onClick={onNavigateToForm}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 cursor-pointer transition-all"
            >
              <span>Start My First Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {assessments.map((item) => {
              const itemIdx = item.healthIndex || Math.max(5, Math.min(98, Math.round(100 - item.probability)));
              return (
                <div
                  key={item.id}
                  className="glass-panel glass-panel-hover rounded-2xl p-5 sm:p-6 border border-white/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-all"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">🩺</span>
                      <span className="font-bold text-slate-900 text-sm sm:text-base">
                        Health Assessment
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500 font-medium">
                        {formatLongDate(item.date)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-medium">Overall Risk:</span>
                        <span className={`font-bold px-2.5 py-0.5 rounded-full border text-[11px] ${getRiskColor(item.riskLevel)}`}>
                          {item.riskLevel.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-medium">Health Index:</span>
                        <span className="font-extrabold text-blue-600">{itemIdx}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-medium">BMI:</span>
                        <span className="font-bold text-slate-800">{item.bmi}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-medium">Blood Pressure:</span>
                        <span className="font-bold text-slate-800">{item.bloodPressure.split('(')[0]}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-medium">Exercise:</span>
                        <span className="font-bold text-slate-800">{item.physicalActivity.split('(')[0]}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedAssessment(item)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 hover:text-blue-600 font-bold text-xs shadow-2xs transition-colors cursor-pointer shrink-0"
                  >
                    <span>View Full Assessment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
