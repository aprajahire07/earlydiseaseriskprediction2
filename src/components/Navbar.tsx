import React from 'react';
import { HeartPulse, Home, FileText, Activity, User as UserIcon, LogIn, History, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, isAuthenticated, openAuthModal, openProfileModal } = useAuth();

  const initials = user
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : '';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Website Brand / Logo */}
        <div
          onClick={() => setActiveTab('home')}
          className="cursor-pointer flex items-center gap-2.5 group select-none"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition-colors">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
              Early Disease Risk Prediction
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Lifestyle &amp; Hereditary Health Risk Intelligence
            </p>
          </div>
        </div>

        {/* Navigation Links & Auth Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
          <nav className="flex items-center gap-1">
            <button
              id="nav-home"
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            <button
              id="nav-about"
              onClick={() => setActiveTab('about')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                activeTab === 'about'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>About Project</span>
            </button>

            <button
              id="nav-form"
              onClick={() => setActiveTab('form')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                activeTab === 'form'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Prediction Form</span>
            </button>

            <button
              id="nav-auth"
              onClick={() => setActiveTab('auth')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                activeTab === 'auth'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Login &amp; Signup</span>
            </button>
          </nav>

          {/* Vertical divider */}
          <div className="hidden sm:block h-5 w-px bg-slate-200 mx-1"></div>

          {/* User Auth Status */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn-user-profile"
                onClick={openProfileModal}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-700 transition-colors cursor-pointer shadow-2xs"
                title="View account profile and assessment history"
              >
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                  {initials}
                </div>
                <span className="font-semibold text-xs max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                <History className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                id="btn-sign-in"
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-600" />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                id="btn-register"
                onClick={() => openAuthModal('register')}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-md font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer shadow-2xs text-xs"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
