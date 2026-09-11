import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SavedAssessment } from '../types';
import {
  X,
  User as UserIcon,
  Mail,
  Calendar,
  LogOut,
  Trash2,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  HeartPulse,
  ExternalLink,
} from 'lucide-react';

interface UserProfileModalProps {
  onNavigateToForm?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ onNavigateToForm }) => {
  const { user, profileModalOpen, closeProfileModal, logout, getUserAssessments, deleteAssessment } = useAuth();
  const [assessments, setAssessments] = useState<SavedAssessment[]>([]);

  useEffect(() => {
    if (profileModalOpen) {
      setAssessments(getUserAssessments());
    }
  }, [profileModalOpen, user]);

  if (!profileModalOpen || !user) return null;

  const handleDelete = (id: string) => {
    deleteAssessment(id);
    setAssessments((prev) => prev.filter((a) => a.id !== id));
  };

  const getRiskBadge = (level: 'Low' | 'Moderate' | 'High') => {
    switch (level) {
      case 'Low':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Low Risk
          </span>
        );
      case 'Moderate':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3" />
            Moderate Risk
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3 h-3" />
            High Risk
          </span>
        );
    }
  };

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const formattedJoinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with User Info */}
        <div className="bg-slate-900 text-white p-6 relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            type="button"
            onClick={closeProfileModal}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-600 border-2 border-blue-400 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{user.name}</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-900/80 text-blue-300 border border-blue-700 px-2 py-0.5 rounded-sm">
                  Active Patient
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 mt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Joined {formattedJoinDate}
                </span>
                {user.age && (
                  <span className="text-slate-400">
                    Age: <strong className="text-slate-200">{user.age}</strong>
                  </span>
                )}
                {user.gender && (
                  <span className="text-slate-400">
                    Gender: <strong className="text-slate-200">{user.gender}</strong>
                  </span>
                )}
                {user.phone && (
                  <span className="text-slate-400">
                    Phone: <strong className="text-slate-200">{user.phone}</strong>
                  </span>
                )}
              </div>
              {user.lifestyleNotes && (
                <div className="text-[11px] text-slate-300 mt-1 max-w-lg truncate">
                  <span className="text-slate-400 font-semibold">Lifestyle:</span> {user.lifestyleNotes}
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-red-900/60 hover:border-red-700 text-slate-300 hover:text-red-200 text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Assessments Section */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-blue-600" />
                <span>Saved Risk Assessment History</span>
              </h3>
              <p className="text-xs text-slate-500">
                Reports computed and saved under your personal profile ({assessments.length}{' '}
                {assessments.length === 1 ? 'record' : 'records'}).
              </p>
            </div>

            {onNavigateToForm && (
              <button
                type="button"
                onClick={() => {
                  closeProfileModal();
                  onNavigateToForm();
                }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <span>New Assessment</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          {assessments.length === 0 ? (
            <div className="text-center py-10 px-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                <Activity className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-sm">No Saved Reports Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Run a disease risk evaluation from the Prediction Form and save the report to track your indicators over time.
                </p>
              </div>
              {onNavigateToForm && (
                <button
                  type="button"
                  onClick={() => {
                    closeProfileModal();
                    onNavigateToForm();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-xs cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Run First Assessment Now</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {assessments.map((a) => {
                const dateStr = new Date(a.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={a.id}
                    className="border border-slate-200 rounded-xl p-4 bg-white hover:border-slate-300 transition-colors shadow-2xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{a.disease}</span>
                        {getRiskBadge(a.riskLevel)}
                        <span className="text-xs font-semibold text-slate-500">
                          ({a.probability}% Estimated Risk)
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {dateStr}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDelete(a.id)}
                          className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete this record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Snapshot parameters */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      <div>
                        <span className="text-slate-400 block">BMI:</span>
                        <span className="font-semibold text-slate-700">{a.bmi} kg/m²</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Blood Pressure:</span>
                        <span className="font-semibold text-slate-700">{a.bloodPressure}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Smoking:</span>
                        <span className="font-semibold text-slate-700">{a.smoking}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Family History:</span>
                        <span className="font-semibold text-slate-700 truncate block">
                          {a.familyHistory}
                        </span>
                      </div>
                    </div>

                    {/* Recommendations preview */}
                    {a.recommendations && a.recommendations.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          Key Advice:
                        </span>
                        <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                          {a.recommendations.slice(0, 2).map((rec, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Records stored securely in local browser storage.</span>
          <button
            type="button"
            onClick={closeProfileModal}
            className="px-4 py-1.5 rounded-md bg-white border border-slate-300 font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
