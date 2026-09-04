import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HomeSection } from './components/HomeSection';
import { AboutSection } from './components/AboutSection';
import { PredictionForm } from './components/PredictionForm';

/**
 * College Mini-Project: Early Disease Risk Prediction using Lifestyle and Medical History
 * Simple Frontend Demo
 */
export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Navigation Header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'home' && (
          <HomeSection
            onCheckRisk={() => setActiveTab('form')}
            onLearnMore={() => setActiveTab('about')}
          />
        )}

        {activeTab === 'about' && <AboutSection />}

        {activeTab === 'form' && <PredictionForm />}
      </main>

      {/* Professional Medical Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-600 bg-white mt-12">
        <div className="max-w-5xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-700">
            Early Disease Risk Prediction Platform &bull; Academic Mini Project
          </p>
          <p className="text-[11px] text-slate-500 max-w-xl mx-auto leading-relaxed">
            Designed for educational and early health awareness purposes only. Estimates are computed using multi-parameter lifestyle risk vectors and should not replace clinical medical evaluation.
          </p>
          <p className="text-[10px] text-slate-400 pt-1">
            &copy; {new Date().getFullYear()} Early Health Risk Intelligence. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
