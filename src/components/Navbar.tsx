import React from 'react';
import { HeartPulse, Home, FileText, Activity } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
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

        {/* Navigation Links */}
        <nav className="flex items-center gap-1.5 text-xs sm:text-sm">
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
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              activeTab === 'form'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Risk Prediction Form</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
