import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HomeSection } from './components/HomeSection';
import { AboutSection } from './components/AboutSection';
import { PredictionForm } from './components/PredictionForm';
import { MyHealthDashboard } from './components/MyHealthDashboard';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { HeartPulse } from 'lucide-react';

/**
 * Early Disease Risk Prediction - Premium Health-Tech SaaS
 * Machine Learning Health Platform with Patient Authentication & Glassmorphism Design
 */
function MainContent() {
  const [activeTab, setActiveTab] = useState<string>('home');

  const scrollToAnchor = (tab: string, anchorId?: string) => {
    setActiveTab(tab);
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans relative overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* Ambient background light gradients for glassmorphism */}
      <div className="fixed top-0 right-0 -mr-40 -mt-40 w-96 sm:w-[550px] h-96 sm:h-[550px] bg-gradient-to-br from-blue-400/15 via-indigo-400/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed top-1/3 left-0 -ml-40 w-80 sm:w-[500px] h-80 sm:h-[500px] bg-gradient-to-tr from-teal-400/15 via-cyan-400/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed bottom-10 right-10 w-80 sm:w-[500px] h-80 sm:h-[500px] bg-gradient-to-bl from-purple-400/10 via-blue-400/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Floating Glass Navigation Header with Auth Status */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 relative z-10">
        {activeTab === 'home' && (
          <HomeSection
            onCheckRisk={() => scrollToAnchor('form')}
            onLearnMore={() => scrollToAnchor('about')}
            onNavigateToAuth={() => scrollToAnchor('health')}
          />
        )}

        {activeTab === 'about' && <AboutSection />}

        {activeTab === 'form' && (
          <PredictionForm onNavigateToHealth={() => scrollToAnchor('health')} />
        )}

        {(activeTab === 'health' || activeTab === 'auth') && (
          <MyHealthDashboard onNavigateToForm={() => scrollToAnchor('form')} />
        )}
      </main>

      {/* Auth Modal (Login / Register / Demo) */}
      <AuthModal onOpenFullPortal={() => scrollToAnchor('health')} />

      {/* User Profile & Assessment History Modal */}
      <UserProfileModal onNavigateToForm={() => scrollToAnchor('form')} />

      {/* Premium Healthcare SaaS Footer */}
      <footer className="mt-20 border-t border-slate-200/70 py-12 glass-panel-subtle text-slate-600 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-200/60 text-center md:text-left">
            <div className="space-y-1.5 flex flex-col items-center md:items-start">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-slate-900 text-base tracking-tight">
                  Early Disease Risk Prediction
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Preventive health intelligence made simple.
              </p>
            </div>

            {/* Navigation Quick Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => scrollToAnchor('home')}
                className="hover:text-blue-600 transition-colors cursor-pointer"
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => scrollToAnchor('form')}
                className="hover:text-blue-600 transition-colors cursor-pointer"
              >
                Assessment
              </button>
              <button
                type="button"
                onClick={() => scrollToAnchor('health')}
                className="hover:text-blue-600 transition-colors cursor-pointer font-bold text-blue-600"
              >
                My Health
              </button>
              <button
                type="button"
                onClick={() => scrollToAnchor('home', 'section-conditions')}
                className="hover:text-blue-600 transition-colors cursor-pointer"
              >
                Conditions
              </button>
              <button
                type="button"
                onClick={() => scrollToAnchor('home', 'section-how-it-works')}
                className="hover:text-blue-600 transition-colors cursor-pointer"
              >
                How It Works
              </button>
              <button
                type="button"
                onClick={() => scrollToAnchor('about')}
                className="hover:text-blue-600 transition-colors cursor-pointer"
              >
                About
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 text-center sm:text-left">
            <p>&copy; {new Date().getFullYear()} Early Disease Risk Prediction. All rights reserved.</p>
            <p className="max-w-md">
              Designed for educational awareness and lifestyle risk estimation. Does not replace professional clinical evaluation.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
