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
    <div className="min-h-screen bg-white text-gray-800 flex flex-col font-sans">
      {/* Simple Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        {activeTab === 'home' && (
          <HomeSection onCheckRisk={() => setActiveTab('form')} />
        )}

        {activeTab === 'about' && <AboutSection />}

        {activeTab === 'form' && <PredictionForm />}
      </main>

      {/* Basic Footer */}
      <footer className="border-t border-gray-300 py-3 text-center text-xs text-gray-600 bg-gray-50 mt-8">
        <p>B.Tech College Mini Project &mdash; Early Disease Risk Prediction</p>
        <p className="text-[11px] text-gray-500 mt-0.5">For educational demonstration only.</p>
      </footer>
    </div>
  );
}
