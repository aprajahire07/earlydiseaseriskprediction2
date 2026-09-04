import React from 'react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="bg-[#3b82f6] text-white border-b border-gray-300">
      <div className="max-w-4xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Website Title */}
        <div 
          onClick={() => setActiveTab('home')}
          className="cursor-pointer font-bold text-lg text-center sm:text-left"
        >
          Early Disease Risk Prediction
        </div>

        {/* Navigation Links */}
        <nav className="flex gap-2 text-sm">
          <button
            id="nav-home"
            onClick={() => setActiveTab('home')}
            className={`px-3 py-1 border border-white cursor-pointer ${
              activeTab === 'home'
                ? 'bg-white text-[#3b82f6] font-bold'
                : 'bg-transparent text-white hover:bg-blue-600'
            }`}
          >
            Home
          </button>
          
          <button
            id="nav-about"
            onClick={() => setActiveTab('about')}
            className={`px-3 py-1 border border-white cursor-pointer ${
              activeTab === 'about'
                ? 'bg-white text-[#3b82f6] font-bold'
                : 'bg-transparent text-white hover:bg-blue-600'
            }`}
          >
            About Project
          </button>

          <button
            id="nav-form"
            onClick={() => setActiveTab('form')}
            className={`px-3 py-1 border border-white cursor-pointer ${
              activeTab === 'form'
                ? 'bg-white text-[#3b82f6] font-bold'
                : 'bg-transparent text-white hover:bg-blue-600'
            }`}
          >
            Risk Prediction Form
          </button>
        </nav>
      </div>
    </header>
  );
};
