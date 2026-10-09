import React, { useState } from 'react';
import {
  HeartPulse,
  Menu,
  X,
  User as UserIcon,
  LogIn,
  History,
  Activity,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, isAuthenticated, openAuthModal, openProfileModal } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const initials = user
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : '';

  const handleNavClick = (tab: string, anchorId?: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    if (anchorId) {
      setTimeout(() => {
        const el = document.getElementById(anchorId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-3 sm:top-4 z-50 px-3 sm:px-6 max-w-6xl mx-auto w-full transition-all">
      <div className="glass-nav rounded-2xl sm:rounded-full px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 shadow-md border border-white/80 dark:border-white/10">
        {/* Brand / Logo */}
        <div
          onClick={() => handleNavClick('home')}
          className="cursor-pointer flex items-center gap-2.5 group select-none shrink-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <HeartPulse className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base tracking-tight leading-none">
              Early Disease Risk
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden md:inline-block leading-tight mt-0.5">
              Preventive Health SaaS
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <button
            type="button"
            id="nav-home"
            onClick={() => handleNavClick('home')}
            className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
            }`}
          >
            Home
          </button>

          <button
            type="button"
            id="nav-risk-assessment"
            onClick={() => handleNavClick('form')}
            className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === 'form'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
            }`}
          >
            Risk Assessment
          </button>

          <button
            type="button"
            id="nav-conditions"
            onClick={() => handleNavClick('home', 'section-conditions')}
            className="px-3 py-1.5 rounded-full hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-all cursor-pointer"
          >
            Conditions
          </button>

          <button
            type="button"
            id="nav-how-it-works"
            onClick={() => handleNavClick('home', 'section-how-it-works')}
            className="px-3 py-1.5 rounded-full hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-all cursor-pointer"
          >
            How It Works
          </button>

          <button
            type="button"
            id="nav-about"
            onClick={() => handleNavClick('about')}
            className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === 'about'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
            }`}
          >
            About
          </button>
        </nav>

        {/* Right Actions: My Health & Sign In & Hamburger Menu */}
        <div className="flex items-center gap-2 text-xs">
          {/* My Health Dashboard Button */}
          <button
            type="button"
            id="btn-nav-my-health"
            onClick={() => handleNavClick('health')}
            className={`hidden sm:flex px-3.5 py-1.5 rounded-full font-semibold transition-all cursor-pointer items-center gap-1.5 border ${
              activeTab === 'health' || activeTab === 'auth'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700/80 hover:bg-white dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${activeTab === 'health' || activeTab === 'auth' ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
            <span>My Health</span>
          </button>

          {/* User Auth Status */}
          {isAuthenticated && user ? (
            <button
              type="button"
              id="btn-user-profile"
              onClick={openProfileModal}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
              title="View account profile and history"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                {initials}
              </div>
              <span className="font-semibold text-xs max-w-[90px] truncate">{user.name.split(' ')[0]}</span>
              <History className="w-3.5 h-3.5 text-slate-400" />
            </button>
          ) : (
            <button
              type="button"
              id="btn-sign-in"
              onClick={() => openAuthModal('login')}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white transition-all cursor-pointer shadow-sm shadow-slate-900/10"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Hamburger Menu Toggle Button */}
          <button
            type="button"
            id="btn-hamburger-menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 sm:p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer flex items-center justify-center border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Glass Dropdown Hamburger Menu */}
      {mobileMenuOpen && (
        <div
          id="hamburger-dropdown-menu"
          className="mt-2 glass-nav rounded-2xl p-4 shadow-xl border border-white/90 dark:border-slate-700/80 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* 🌙 Dark Mode Toggle inside Hamburger Menu */}
          <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-800/80 backdrop-blur-sm flex items-center justify-between transition-colors">
            <div className="flex items-center gap-2.5">
              <span className="text-base select-none" role="img" aria-label="Dark Mode Moon">🌙</span>
              <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">Dark Mode</span>
            </div>
            <button
              type="button"
              role="switch"
              id="hamburger-dark-mode-toggle"
              aria-checked={isDark}
              aria-label="Toggle Dark Mode"
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                isDark ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isDark ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <nav className="flex flex-col gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className={`p-2.5 rounded-xl text-left transition-colors flex items-center justify-between ${
                activeTab === 'home' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>Home</span>
              <ArrowRight className="w-4 h-4 opacity-70" />
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('form')}
              className={`p-2.5 rounded-xl text-left transition-colors flex items-center justify-between ${
                activeTab === 'form' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>Risk Assessment</span>
              <ArrowRight className="w-4 h-4 opacity-70" />
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('home', 'section-conditions')}
              className="p-2.5 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between"
            >
              <span>Conditions</span>
              <ArrowRight className="w-4 h-4 opacity-70" />
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('home', 'section-how-it-works')}
              className="p-2.5 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between"
            >
              <span>How It Works</span>
              <ArrowRight className="w-4 h-4 opacity-70" />
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('about')}
              className={`p-2.5 rounded-xl text-left transition-colors flex items-center justify-between ${
                activeTab === 'about' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>About Project</span>
              <ArrowRight className="w-4 h-4 opacity-70" />
            </button>
          </nav>

          <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => handleNavClick('health')}
              className={`w-full p-2.5 rounded-xl border font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                activeTab === 'health' || activeTab === 'auth'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <Activity className={`w-4 h-4 ${activeTab === 'health' || activeTab === 'auth' ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
              <span>My Health Dashboard</span>
            </button>

            {isAuthenticated && user ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openProfileModal();
                }}
                className="w-full p-2.5 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                <span>My Profile ({user.name.split(' ')[0]})</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal('login');
                }}
                className="w-full p-2.5 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

