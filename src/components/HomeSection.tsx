import React from 'react';

interface HomeSectionProps {
  onCheckRisk: () => void;
}

export const HomeSection: React.FC<HomeSectionProps> = ({ onCheckRisk }) => {
  return (
    <div className="space-y-6">
      {/* Main Home Box */}
      <div className="border border-gray-300 p-6 bg-white text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-[#3b82f6] mb-3">
          Early Disease Risk Prediction using Lifestyle and Medical History
        </h1>

        <p className="text-base text-gray-700 max-w-2xl mx-auto mb-5 leading-relaxed">
          This project is designed to study disease risk using lifestyle and medical history information.
        </p>

        {/* Check Risk Button */}
        <div className="mb-5">
          <button
            type="button"
            id="btn-check-risk"
            onClick={onCheckRisk}
            className="bg-[#3b82f6] hover:bg-blue-600 text-white font-bold px-6 py-2 border border-blue-700 cursor-pointer text-sm sm:text-base"
          >
            Check Risk
          </button>
        </div>

        {/* Note */}
        <div className="text-xs font-bold text-gray-800 max-w-md mx-auto pt-2">
          Note: This is a student project for educational purposes.
        </div>
      </div>

      {/* Brief Overview Section */}
      <div className="border border-gray-300 p-4 bg-white">
        <h2 className="text-base font-bold text-gray-800 mb-2 border-b border-gray-200 pb-1">
          Project Summary
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          This is a college mini-project frontend interface designed to collect user lifestyle factors (such as BMI, physical activity, smoking, and alcohol intake) and medical history indicators (such as blood pressure and family history) for early health risk evaluation.
        </p>
      </div>
    </div>
  );
};
