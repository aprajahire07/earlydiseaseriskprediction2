import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { DiseasePredictionItem } from '../types';
import { normalizeRenderPredictions } from '../utils/predictionNormalization';
import {
  HeartPulse,
  Activity,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  User as UserIcon,
  ShieldCheck,
  RotateCcw,
  AlertCircle,
  Scale,
  Ruler,
  Check,
  Wifi,
  WifiOff,
  RefreshCw,
  Send,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Bot,
  HelpCircle,
} from 'lucide-react';

// Exact structure expected from Render ML backend
interface BackendPredictionResponse {
  risk_percentage?: string | number;
  risk_score?: string | number;
  probability?: string | number;
  health_score?: string | number;
  risk_level?: string;
  prediction?: string;
  target_disease?: string;
  disease?: string;
  primary_risk?: string;
  recommendations?: string[] | string;
  recommendation?: string[] | string;
}

// Normalized prediction displayed in UI
interface DisplayPrediction {
  risk_percentage: string;
  risk_level: string;
  target_disease: string;
  recommendations: string[];
  health_index: number;
  predictions: DiseasePredictionItem[];
  condition_results: Record<string, number>;
  rawResponse?: any;
}

// Interactive chat message structure
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

// Snapshot of assessed inputs passed to AI context
interface AssessedDataSnapshot {
  fullName: string;
  age: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  bmi: number;
  bloodPressure: string;
  smokingHabit: string;
  alcoholConsumption: string;
  physicalActivity: string;
  familyHistory: string;
  bloodSugar: string;
}

// Render ML Backend URL configuration
const RENDER_BASE_URL = 'https://disease-risk-api-e5o7.onrender.com';
const RENDER_PREDICT_URL = `${RENDER_BASE_URL}/predict`;
const REQUEST_TIMEOUT_MS = 25000;

interface PredictionFormProps {
  onNavigateToHealth?: () => void;
}

type BackendStatus = 'checking' | 'online' | 'offline';
type ButtonState = 'ready' | 'checking' | 'processing' | 'success' | 'error';

export const PredictionForm: React.FC<PredictionFormProps> = ({ onNavigateToHealth }) => {
  const { user, isAuthenticated, saveAssessment, openAuthModal } = useAuth();

  // Section 1: About You
  const [fullName, setFullName] = useState<string>(user?.name || '');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('');

  // Section 2: Body Measurements
  const [heightCm, setHeightCm] = useState<string>('');
  const [weightKg, setWeightKg] = useState<string>('');
  const [bmi, setBmi] = useState<string>('');

  // Section 3: Vitals & Everyday Health
  const [bloodPressure, setBloodPressure] = useState<string>('');
  const [smokingHabit, setSmokingHabit] = useState<string>('');
  const [alcoholConsumption, setAlcoholConsumption] = useState<string>('');
  const [physicalActivity, setPhysicalActivity] = useState<string>('');

  // Section 4: Family Health History & Blood Sugar
  const [familyMedicalHistory, setFamilyMedicalHistory] = useState<string[]>([]);
  const [bloodSugarLevel, setBloodSugarLevel] = useState<string>('');

  // Sample data mode indicator
  const [isSampleDataLoaded, setIsSampleDataLoaded] = useState<boolean>(false);

  // Backend Connectivity & Processing State
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('checking');
  const [buttonState, setButtonState] = useState<ButtonState>('ready');
  const [backendError, setBackendError] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');

  // Result state — ONLY populated from a successful Render API response
  const [result, setResult] = useState<DisplayPrediction | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [showDebugDetails, setShowDebugDetails] = useState<boolean>(false);

  // Unique assessment ID generated upon each successful Render ML response
  const [assessmentId, setAssessmentId] = useState<string>('');
  const [submittedSnapshot, setSubmittedSnapshot] = useState<AssessedDataSnapshot | null>(null);

  // Automatic AI Health Summary State
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAiSummaryLoading, setIsAiSummaryLoading] = useState<boolean>(false);
  const [aiSummaryError, setAiSummaryError] = useState<string | null>(null);

  // Inline Interactive AI Chat State (strictly max 5 user messages per assessment)
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userMessageCount, setUserMessageCount] = useState<number>(0);
  const [chatRemaining, setChatRemaining] = useState<number>(5);
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom of chat when new messages or loading states occur
  useEffect(() => {
    if (isChatOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatLoading, isChatOpen]);

  // Fetch automatic AI Health Summary from server
  const fetchAiSummary = async (assessmentData: AssessedDataSnapshot, renderRes: DisplayPrediction) => {
    setIsAiSummaryLoading(true);
    setAiSummaryError(null);
    try {
      const res = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment: assessmentData,
          renderResult: renderRes,
        }),
      });
      if (!res.ok) throw new Error('AI summary response failed');
      const data = await res.json();
      if (data && data.summary) {
        setAiSummary(data.summary);
      }
    } catch (err) {
      console.warn('AI summary fetch warning:', err);
      setAiSummaryError('AI summary is momentarily unavailable.');
    } finally {
      setIsAiSummaryLoading(false);
    }
  };

  // Send an inline chat message to Gemini via server (strictly capped at 5 user messages)
  const handleSendChatMessage = async (textToSend?: string) => {
    const query = (textToSend ?? chatInput).trim();
    if (!query || isChatLoading || userMessageCount >= 5 || chatRemaining <= 0) return;

    setChatError(null);
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      role: 'user',
      text: query,
      timestamp: new Date(),
    };

    const updated = [...chatMessages, userMsg];
    setChatMessages(updated);
    setChatInput('');
    setIsChatLoading(true);

    const nextCount = userMessageCount + 1;
    setUserMessageCount(nextCount);
    setChatRemaining(Math.max(0, 5 - nextCount));

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId,
          assessment: submittedSnapshot,
          renderResult: result,
          messages: updated.map((m) => ({ role: m.role, text: m.text })),
          question: query,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429 || data?.limitReached) {
          setUserMessageCount(5);
          setChatRemaining(0);
          setChatError(data?.error || "You've reached the 5-question limit for this assessment.");
          return;
        }
        throw new Error(data?.error || 'Failed to receive AI reply');
      }

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        role: 'assistant',
        text: data.reply || 'Thank you for your question. Maintaining healthy habits and consulting your physician is recommended.',
        timestamp: new Date(),
      };

      setChatMessages([...updated, aiMsg]);
      if (typeof data.used === 'number') {
        setUserMessageCount(data.used);
      }
      if (typeof data.remaining === 'number') {
        setChatRemaining(data.remaining);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setChatError('AI assistant is momentarily unavailable. Please try again.');
      // Revert quota consumption on network failure
      setUserMessageCount(userMessageCount);
      setChatRemaining(Math.max(0, 5 - userMessageCount));
    } finally {
      setIsChatLoading(false);
    }
  };

  // Pre-fill user name if logged in
  useEffect(() => {
    if (user?.name && !fullName) {
      setFullName(user.name);
    }
  }, [user?.name]);

  // Check Render Backend Availability
  const checkBackendHealth = useCallback(async (): Promise<boolean> => {
    setBackendStatus('checking');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${RENDER_BASE_URL}/`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        setBackendStatus('online');
        return true;
      } else {
        setBackendStatus('offline');
        return false;
      }
    } catch {
      setBackendStatus('offline');
      return false;
    }
  }, []);

  // Check health on mount
  useEffect(() => {
    checkBackendHealth();
  }, [checkBackendHealth]);

  // Automatic BMI Calculation whenever height or weight changes (read-only)
  useEffect(() => {
    const h = parseFloat(heightCm);
    const w = parseFloat(weightKg);

    if (h > 0 && w > 0) {
      const heightMeters = h / 100;
      const calculatedBmi = w / (heightMeters * heightMeters);
      if (calculatedBmi > 10 && calculatedBmi < 90) {
        setBmi(calculatedBmi.toFixed(1));
      } else {
        setBmi('');
      }
    } else {
      setBmi('');
    }
  }, [heightCm, weightKg]);

  // Derived BMI info for visual indicator
  const bmiDetails = useMemo(() => {
    const val = parseFloat(bmi);
    if (!val || isNaN(val)) return null;

    let category = 'Healthy range';
    let color = 'text-emerald-700 bg-emerald-50 border-emerald-200';

    if (val < 18.5) {
      category = 'Underweight';
      color = 'text-sky-700 bg-sky-50 border-sky-200';
    } else if (val <= 24.9) {
      category = 'Healthy range';
      color = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    } else if (val <= 29.9) {
      category = 'Overweight';
      color = 'text-amber-700 bg-amber-50 border-amber-200';
    } else {
      category = 'Obesity range';
      color = 'text-rose-700 bg-rose-50 border-rose-200';
    }

    const minScale = 15;
    const maxScale = 38;
    const clamped = Math.max(minScale, Math.min(maxScale, val));
    const percentage = ((clamped - minScale) / (maxScale - minScale)) * 100;

    return {
      value: val,
      category,
      color,
      percentage: Math.max(4, Math.min(96, percentage)),
    };
  }, [bmi]);

  // Dynamic step progress (1 to 4)
  const currentStep = useMemo(() => {
    let step = 1;
    const section1Filled = !!(age && gender);
    const section2Filled = !!(heightCm && weightKg && bmi);
    const section3Filled = !!(bloodPressure && smokingHabit && alcoholConsumption && physicalActivity);

    if (section1Filled) step = 2;
    if (section1Filled && section2Filled) step = 3;
    if (section1Filled && section2Filled && section3Filled) step = 4;
    return step;
  }, [age, gender, heightCm, weightKg, bmi, bloodPressure, smokingHabit, alcoholConsumption, physicalActivity]);

  // Family history chip toggling
  const handleToggleFamilyCondition = (condition: string) => {
    if (condition === 'None of these') {
      if (familyMedicalHistory.includes('None of these')) {
        setFamilyMedicalHistory([]);
      } else {
        setFamilyMedicalHistory(['None of these']);
      }
      return;
    }

    const withoutNone = familyMedicalHistory.filter((c) => c !== 'None of these');
    if (withoutNone.includes(condition)) {
      setFamilyMedicalHistory(withoutNone.filter((c) => c !== condition));
    } else {
      setFamilyMedicalHistory([...withoutNone, condition]);
    }
  };

  // Helper to load sample test inputs (DOES NOT TRIGGER PREDICTION OR FALLBACK)
  const handleLoadSample = () => {
    setFullName(user?.name ? `${user.name} (Sample)` : 'Alex Morgan');
    setAge('42');
    setGender('Male');
    setHeightCm('175');
    setWeightKg('78');
    setBloodPressure('Stage 1 Hypertension (130-139/80-89 mmHg)');
    setSmokingHabit('Occasional');
    setAlcoholConsumption('Moderate');
    setPhysicalActivity('Moderate');
    setFamilyMedicalHistory(['High Blood Pressure', 'Diabetes']);
    setBloodSugarLevel('Elevated (105 mg/dL)');
    setIsSampleDataLoaded(true);
    setValidationError('');
    setBackendError(false);
    setResult(null);
    setIsSaved(false);
    setButtonState('ready');
  };

  // Helper to clear sample values and return to blank personal form
  const handleClearSample = () => {
    setFullName(user?.name || '');
    setAge('');
    setGender('');
    setHeightCm('');
    setWeightKg('');
    setBmi('');
    setBloodPressure('');
    setSmokingHabit('');
    setAlcoholConsumption('');
    setPhysicalActivity('');
    setFamilyMedicalHistory([]);
    setBloodSugarLevel('');
    setIsSampleDataLoaded(false);
    setResult(null);
    setValidationError('');
    setBackendError(false);
    setIsSaved(false);
    setButtonState('ready');
  };

  // Form submission: STRICTLY calls Render ML backend
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setValidationError('');
    setBackendError(false);

    // 1. Frontend Input Validation
    if (!age) {
      setValidationError('Please enter your age.');
      return;
    }
    const numAge = parseInt(age, 10);
    if (isNaN(numAge) || numAge < 1 || numAge > 120) {
      setValidationError('Please enter a valid age between 1 and 120.');
      return;
    }

    if (!gender) {
      setValidationError('Please select your biological sex.');
      return;
    }

    if (!heightCm) {
      setValidationError('Enter your height so we can calculate BMI.');
      return;
    }
    const numHeight = parseFloat(heightCm);
    if (isNaN(numHeight) || numHeight < 60 || numHeight > 260) {
      setValidationError('Please check your height measurement (enter between 60 and 260 cm).');
      return;
    }

    if (!weightKg) {
      setValidationError('Enter your weight so we can calculate BMI.');
      return;
    }
    const numWeight = parseFloat(weightKg);
    if (isNaN(numWeight) || numWeight < 20 || numWeight > 350) {
      setValidationError('Please check your weight measurement (enter between 20 and 350 kg).');
      return;
    }

    if (!bmi) {
      setValidationError('Unable to calculate BMI. Please verify height and weight.');
      return;
    }

    if (!bloodPressure) {
      setValidationError('Please select your blood pressure category.');
      return;
    }

    if (!smokingHabit) {
      setValidationError('Please tell us if you smoke.');
      return;
    }

    if (!alcoholConsumption) {
      setValidationError('Please tell us how often you drink alcohol.');
      return;
    }

    if (!physicalActivity) {
      setValidationError('Please select how active you are.');
      return;
    }

    const numericBmi = parseFloat(bmi) || 24;

    // Reset any previous prediction result — NEVER show old data
    setResult(null);
    setIsSaved(false);
    setButtonState('processing');

    // 2. Prepare payload for Render ML backend
    const familyStr =
      familyMedicalHistory.length > 0 && !familyMedicalHistory.includes('None of these')
        ? familyMedicalHistory.join(', ')
        : 'None';

    const payload = {
      age: numAge,
      gender,
      bmi: numericBmi,
      blood_pressure: bloodPressure,
      smoking: smokingHabit,
      alcohol: alcoholConsumption,
      physical_activity: physicalActivity,
      family_history: familyStr,
      blood_sugar: bloodSugarLevel.trim() || 'Normal',
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      const response = await fetch(RENDER_PREDICT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 3. HTTP status validation: If response is not ok, FAIL. NEVER fallback.
      if (!response.ok) {
        throw new Error(`Backend returned status ${response.status}`);
      }

      // 4. JSON parsing validation
      const data: BackendPredictionResponse = await response.json();

      if (!data || typeof data !== 'object') {
        throw new Error('Malformed backend response');
      }

      // 5. Response field validation: Required fields must exist
      const rawRiskLevel = data.risk_level || data.prediction;
      const rawRiskPercentage = data.risk_percentage ?? data.probability ?? data.risk_score;
      const rawTargetDisease = data.target_disease || data.disease || data.primary_risk;
      const rawRecs = data.recommendations ?? data.recommendation;

      if (!rawRiskLevel || rawRiskPercentage === undefined || rawRiskPercentage === null || !rawTargetDisease) {
        throw new Error('Backend response missing required prediction fields');
      }

      // Format recommendations safely
      const formattedRecs: string[] = Array.isArray(rawRecs)
        ? rawRecs.map(String)
        : typeof rawRecs === 'string' && rawRecs.trim().length > 0
        ? [rawRecs]
        : ['Maintain balanced nutrition, stay active, and schedule routine clinical checkups.'];

      // Derive health index from backend risk percentage
      const percentNum = parseFloat(String(rawRiskPercentage).replace('%', '')) || 25;
      const healthIdx = Math.max(5, Math.min(98, Math.round(100 - percentNum)));

      // Parse all disease predictions directly returned by Render ML model
      const normalizedPredictions = normalizeRenderPredictions(data);

      if (!normalizedPredictions || normalizedPredictions.length === 0) {
        throw new Error('Prediction data was not returned by the ML server.');
      }

      // Build condition_results map for storage and historical retrieval
      const conditionResultsMap: Record<string, number> = {};
      for (const p of normalizedPredictions) {
        conditionResultsMap[p.disease] = p.percentage;
      }

      const displayResult: DisplayPrediction = {
        risk_percentage: String(rawRiskPercentage).includes('%') ? String(rawRiskPercentage) : `${rawRiskPercentage}%`,
        risk_level: String(rawRiskLevel),
        target_disease: String(rawTargetDisease),
        recommendations: formattedRecs,
        health_index: healthIdx,
        predictions: normalizedPredictions,
        condition_results: conditionResultsMap,
        rawResponse: data,
      };

      // 6. SUCCESS: Render backend provided valid prediction
      setResult(displayResult);
      setBackendStatus('online');
      setButtonState('success');

      // Create snapshot of exact evaluated parameters for contextual AI analysis
      const newAssessmentId = `asmt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      setAssessmentId(newAssessmentId);

      const assessedSnapshot: AssessedDataSnapshot = {
        fullName: fullName.trim() || user?.name || 'User',
        age: numAge,
        gender,
        heightCm: numHeight,
        weightKg: numWeight,
        bmi: numericBmi,
        bloodPressure,
        smokingHabit,
        alcoholConsumption,
        physicalActivity,
        familyHistory: familyStr,
        bloodSugar: bloodSugarLevel.trim() || 'Normal',
      };
      setSubmittedSnapshot(assessedSnapshot);

      // Reset inline chat state for this fresh assessment
      setIsChatOpen(false);
      setChatMessages([]);
      setUserMessageCount(0);
      setChatRemaining(5);
      setChatInput('');
      setIsChatLoading(false);
      setChatError(null);

      // Automatically fetch AI Health Summary for this result
      fetchAiSummary(assessedSnapshot, displayResult);

      // 7. ONLY AFTER SUCCESSFUL RENDER RESPONSE: Save to Supabase
      if (isAuthenticated && user) {
        const calculatedRiskLevel: 'Low' | 'Moderate' | 'High' =
          String(rawRiskLevel).toLowerCase().includes('high')
            ? 'High'
            : String(rawRiskLevel).toLowerCase().includes('moderate') || String(rawRiskLevel).toLowerCase().includes('medium')
            ? 'Moderate'
            : 'Low';

        try {
          await saveAssessment({
            fullName: fullName.trim() || user.name,
            disease: String(rawTargetDisease),
            riskLevel: calculatedRiskLevel,
            probability: percentNum,
            healthIndex: healthIdx,
            bmi: numericBmi,
            bloodPressure,
            physicalActivity,
            smoking: smokingHabit,
            alcohol: alcoholConsumption,
            familyHistory: familyStr,
            bloodSugarLevel: bloodSugarLevel || 'Normal',
            recommendations: formattedRecs,
            checkedAreas: normalizedPredictions.map((p) => p.disease),
            isSample: isSampleDataLoaded,
            predictions: normalizedPredictions,
            condition_results: conditionResultsMap,
            rawRenderResponse: data,
          });
          setIsSaved(true);
        } catch (saveErr) {
          console.warn('Supabase assessment record save warning:', saveErr);
        }
      }

      // Scroll to result card
      setTimeout(() => {
        const el = document.getElementById('assessment-result-card');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch {
      // 8. RENDER BACKEND FAILED: NO PREDICTION, NO FALLBACK, NO SUPABASE SAVE
      setResult(null);
      setIsSaved(false);
      setBackendStatus('offline');
      setBackendError(true);
      setButtonState('error');

      // Scroll smoothly to the error card
      setTimeout(() => {
        const el = document.getElementById('backend-unavailable-card');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  // Reset form
  const handleReset = () => {
    if (!user) setFullName('');
    setAge('');
    setGender('');
    setHeightCm('');
    setWeightKg('');
    setBmi('');
    setBloodPressure('');
    setSmokingHabit('');
    setAlcoholConsumption('');
    setPhysicalActivity('');
    setFamilyMedicalHistory([]);
    setBloodSugarLevel('');
    setResult(null);
    setValidationError('');
    setBackendError(false);
    setIsSaved(false);
    setButtonState('ready');

    // Reset AI summary & chat
    setAiSummary(null);
    setIsAiSummaryLoading(false);
    setAiSummaryError(null);
    setIsChatOpen(false);
    setChatMessages([]);
    setUserMessageCount(0);
    setChatRemaining(5);
    setChatInput('');
    setIsChatLoading(false);
    setChatError(null);
    setAssessmentId('');
    setSubmittedSnapshot(null);
    setShowDebugDetails(false);

    // Scroll back to the top of the form smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const familyConditionsList = [
    'Diabetes',
    'High Blood Pressure',
    'Heart Disease',
    'High Cholesterol',
    'None of these',
  ];

  return (
    <div className="space-y-8 max-w-3xl mx-auto py-2">
      {/* Main Glass Container */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 space-y-8 border border-white/90 shadow-xl backdrop-blur-xl relative">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-20 bg-blue-500/10 blur-2xl rounded-full pointer-events-none -z-10" />

        {/* Header & Badges */}
        <div className="space-y-3 pb-6 border-b border-slate-200/60">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/90 text-blue-700 border border-blue-200/80 text-[11px] font-bold tracking-wide uppercase w-fit">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>✦ Health Risk Assessment</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Backend status indicator */}
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${
                  backendStatus === 'online'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : backendStatus === 'checking'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
                title={
                  backendStatus === 'online'
                    ? 'Render ML Prediction Service Online'
                    : backendStatus === 'checking'
                    ? 'Checking connection to ML Prediction Service'
                    : 'Render ML Prediction Service Offline'
                }
              >
                {backendStatus === 'online' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>ML Service Live</span>
                  </>
                ) : backendStatus === 'checking' ? (
                  <>
                    <RefreshCw className="w-3 h-3 text-amber-600 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>ML Service Offline</span>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={handleLoadSample}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-slate-600 bg-white/80 hover:bg-white border border-slate-200/80 hover:border-slate-300 shadow-2xs transition-all cursor-pointer w-fit"
                title="Load sample data for testing (does not trigger prediction)"
              >
                <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                <span>Load Sample Data</span>
              </button>
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Let's understand your health
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              A 2-minute clinical ML assessment connecting to our Render machine learning engine.
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="pt-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span className="uppercase tracking-wider text-blue-600">
                Step {currentStep} of 4
              </span>
              <span className="text-slate-400 font-medium hidden sm:inline">
                About You → Body → Lifestyle → Family History
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    stepNum <= currentStep
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
                      : 'bg-slate-200/70'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Sample Data Visual Indicator Banner */}
        {isSampleDataLoaded && (
          <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-950 font-extrabold text-[10px] uppercase tracking-wider shrink-0">
                Sample Data
              </span>
              <span className="font-medium text-amber-900">
                Example values — replace with your information
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearSample}
              className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer shrink-0 self-end sm:self-auto"
            >
              Clear Example Values
            </button>
          </div>
        )}

        {/* Validation Notice Banner */}
        {validationError && (
          <div className="p-3.5 rounded-2xl border border-rose-200 bg-rose-50/90 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{validationError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* SECTION 1 — ABOUT YOU */}
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                Section 01
              </span>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Let's start with you
              </h2>
              <p className="text-xs text-slate-500">
                A few basic details help us personalize your assessment.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Name Field */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Your Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white/90 hover:bg-white focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Age <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 35"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white/90 hover:bg-white focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
                  required
                />
              </div>

              {/* Biological Sex */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Sex <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Male', 'Female', 'Other'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setGender(s)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                        gender === s
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2 — BODY MEASUREMENTS */}
          <div className="space-y-4 pt-4 border-t border-slate-200/60">
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                Section 02
              </span>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Your Body Measurements
              </h2>
              <p className="text-xs text-slate-500">
                These numbers help us understand your current health baseline.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Height with unit */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Height <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex rounded-xl border border-slate-200 bg-white/90 hover:bg-white focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 transition-all overflow-hidden">
                  <div className="pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Ruler className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    min="60"
                    max="260"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    placeholder="Enter height"
                    className="w-full pl-2.5 pr-2 py-2.5 text-sm bg-transparent focus:outline-hidden text-slate-800 placeholder:text-slate-400"
                    required
                  />
                  <div className="bg-slate-100/80 px-3 flex items-center text-xs font-bold text-slate-600 border-l border-slate-200">
                    cm
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">e.g. 175 cm</span>
              </div>

              {/* Weight with unit */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Weight <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex rounded-xl border border-slate-200 bg-white/90 hover:bg-white focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 transition-all overflow-hidden">
                  <div className="pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Scale className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    min="20"
                    max="300"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="Enter weight"
                    className="w-full pl-2.5 pr-2 py-2.5 text-sm bg-transparent focus:outline-hidden text-slate-800 placeholder:text-slate-400"
                    required
                  />
                  <div className="bg-slate-100/80 px-3 flex items-center text-xs font-bold text-slate-600 border-l border-slate-200">
                    kg
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">e.g. 70 kg</span>
              </div>
            </div>

            {/* Calculated BMI Glass Card & Visual Gauge */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/80 border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Calculated Body Mass Index
                  </span>
                  <div className="flex items-baseline gap-2.5 mt-0.5">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                      {bmi || '--'}
                    </span>
                    {bmiDetails ? (
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${bmiDetails.color}`}>
                        ✓ {bmiDetails.category}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">
                        Enter height & weight to calculate
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 max-w-xs sm:text-right">
                  Calculated automatically from your height and weight.
                </div>
              </div>

              {/* BMI Horizontal Visual Indicator */}
              <div className="space-y-2 pt-1">
                <div className="relative">
                  <div className="h-2.5 rounded-full w-full bg-slate-200 overflow-hidden flex">
                    <div className="h-full bg-sky-300 w-[15%]" title="Underweight (<18.5)" />
                    <div className="h-full bg-emerald-400 w-[28%]" title="Healthy (18.5 - 24.9)" />
                    <div className="h-full bg-amber-400 w-[22%]" title="Overweight (25 - 29.9)" />
                    <div className="h-full bg-rose-400 w-[35%]" title="Obesity (≥30)" />
                  </div>

                  {bmiDetails && (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -ml-2.5 transition-all duration-300"
                      style={{ left: `${bmiDetails.percentage}%` }}
                    >
                      <div className="w-5 h-5 rounded-full bg-slate-900 border-2 border-white shadow-md flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-[10px] font-bold text-slate-500 pt-0.5">
                  <div className="text-sky-700">Underweight (&lt;18.5)</div>
                  <div className="text-emerald-700">Healthy (18.5–24.9)</div>
                  <div className="text-amber-700">Overweight (25–29.9)</div>
                  <div className="text-rose-700">Obesity (≥30)</div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 leading-normal">
                Note: BMI is a general screening measure, not a diagnosis.
              </div>
            </div>
          </div>

          {/* SECTION 3 — EVERYDAY HEALTH */}
          <div className="space-y-4 pt-4 border-t border-slate-200/60">
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                Section 03
              </span>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Your Everyday Health
              </h2>
              <p className="text-xs text-slate-500">
                Tell us about a few habits and measurements.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Blood Pressure */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Your blood pressure <span className="text-rose-500">*</span>
                </label>
                <select
                  value={bloodPressure}
                  onChange={(e) => setBloodPressure(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white/90 hover:bg-white focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-slate-800"
                  required
                >
                  <option value="">-- Select blood pressure category --</option>
                  <option value="Normal (<120/80 mmHg)">Normal (Under 120 / 80 mmHg)</option>
                  <option value="Elevated (120-129/<80 mmHg)">Elevated (120-129 / Under 80 mmHg)</option>
                  <option value="Stage 1 Hypertension (130-139/80-89 mmHg)">Stage 1 (130-139 / 80-89 mmHg)</option>
                  <option value="Stage 2 Hypertension (≥140/≥90 mmHg)">Stage 2 (140+ / 90+ mmHg)</option>
                </select>
              </div>

              {/* Physical Activity */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  How active are you? <span className="text-rose-500">*</span>
                </label>
                <select
                  value={physicalActivity}
                  onChange={(e) => setPhysicalActivity(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white/90 hover:bg-white focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-slate-800"
                  required
                >
                  <option value="">-- Select activity level --</option>
                  <option value="Active">Active (Daily exercise / sport)</option>
                  <option value="Moderate">Moderate (3–4 days of movement/week)</option>
                  <option value="Sedentary">Sedentary (Little to no regular exercise)</option>
                </select>
              </div>

              {/* Smoking */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Do you smoke? <span className="text-rose-500">*</span>
                </label>
                <select
                  value={smokingHabit}
                  onChange={(e) => setSmokingHabit(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white/90 hover:bg-white focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-slate-800"
                  required
                >
                  <option value="">-- Select smoking status --</option>
                  <option value="Never Smoker">Never Smoker (Smoke-free)</option>
                  <option value="Former Smoker">Former Smoker (Quit)</option>
                  <option value="Occasional">Occasional Smoker</option>
                  <option value="Regular Smoker">Regular Smoker (Daily)</option>
                </select>
              </div>

              {/* Alcohol */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  How often do you drink alcohol? <span className="text-rose-500">*</span>
                </label>
                <select
                  value={alcoholConsumption}
                  onChange={(e) => setAlcoholConsumption(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white/90 hover:bg-white focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-slate-800"
                  required
                >
                  <option value="">-- Select alcohol intake --</option>
                  <option value="None">None / Rarely</option>
                  <option value="Moderate">Moderate (1–2 drinks/week)</option>
                  <option value="Regular">Regular / Frequent</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 4 — FAMILY HEALTH HISTORY */}
          <div className="space-y-4 pt-4 border-t border-slate-200/60">
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                Section 04
              </span>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Health conditions in your family
              </h2>
              <p className="text-xs text-slate-500">
                Some health conditions can run in families. Select all that apply.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              {familyConditionsList.map((item) => {
                const isSelected = familyMedicalHistory.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleToggleFamilyCondition(item)}
                    className={`p-3 rounded-2xl text-xs font-semibold border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <span>{item}</span>
                    {isSelected ? (
                      <Check className="w-4 h-4 text-white shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Blood Sugar Optional */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Blood sugar (optional)
              </label>
              <p className="text-[11px] text-slate-500 mb-2">
                If you know your recent blood sugar reading, you can add it here.
              </p>
              <input
                type="text"
                placeholder="e.g. 95 mg/dL or Normal"
                value={bloodSugarLevel}
                onChange={(e) => setBloodSugarLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white/90 hover:bg-white focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Form CTA & Controls */}
          <div className="pt-4 border-t border-slate-200/60 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <button
                  type="submit"
                  id="btn-submit-assessment"
                  disabled={buttonState === 'processing' || backendStatus === 'offline'}
                  className={`w-full sm:w-auto font-bold px-8 py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer ${
                    buttonState === 'processing'
                      ? 'bg-blue-400 text-white cursor-not-allowed'
                      : backendStatus === 'offline'
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed border border-slate-300'
                      : buttonState === 'success'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25'
                      : buttonState === 'error'
                      ? 'bg-slate-900 hover:bg-slate-800 text-white'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25 hover:shadow-lg active:scale-98'
                  }`}
                >
                  {buttonState === 'processing' ? (
                    <>
                      <Activity className="w-4 h-4 text-white animate-spin" />
                      <span>Analyzing your health...</span>
                    </>
                  ) : buttonState === 'checking' ? (
                    <>
                      <RefreshCw className="w-4 h-4 text-white animate-spin" />
                      <span>Checking prediction service...</span>
                    </>
                  ) : buttonState === 'success' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Assessment Complete ✓</span>
                    </>
                  ) : buttonState === 'error' ? (
                    <>
                      <RotateCcw className="w-4 h-4 text-white" />
                      <span>Try Again</span>
                    </>
                  ) : backendStatus === 'offline' ? (
                    <>
                      <WifiOff className="w-4 h-4 text-slate-500" />
                      <span>Prediction service unavailable</span>
                    </>
                  ) : (
                    <>
                      <span>Check My Health Risk →</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-slate-500 font-medium pl-1 text-center sm:text-left">
                  {backendStatus === 'offline' ? (
                    <span className="text-rose-600 font-semibold">
                      Prediction service unavailable. Click below to reconnect.
                    </span>
                  ) : (
                    'Takes about 2 minutes • Non-invasive'
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2 self-center sm:self-auto">
                {backendStatus === 'offline' && (
                  <button
                    type="button"
                    onClick={() => {
                      checkBackendHealth();
                      setBackendError(false);
                      setButtonState('ready');
                    }}
                    className="px-4 py-2.5 rounded-2xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Check Connection</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={buttonState === 'processing'}
                  className="px-5 py-3 rounded-2xl border border-slate-200 bg-white/80 hover:bg-white text-slate-600 font-semibold text-xs transition-colors cursor-pointer text-center"
                >
                  Reset Form
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* BACKEND UNAVAILABLE ERROR STATE CARD (When Render is offline or unreachable) */}
      {backendError && (
        <div
          id="backend-unavailable-card"
          className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4 border border-rose-200/90 bg-rose-50/40 shadow-xl text-center animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
            <AlertCircle className="w-6 h-6" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Health Check Temporarily Unavailable
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Your assessment couldn't be processed because the prediction service is currently unavailable.
            </p>
            <p className="text-xs text-slate-400">
              Please try again when the prediction service is back online.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setBackendError(false);
                setButtonState('ready');
                checkBackendHealth();
              }}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      )}

      {/* ASSESSMENT RESULT CARD (Rendered ONLY after successful Render backend response) */}
      {result && buttonState !== 'processing' && !backendError && (
        <div
          id="assessment-result-card"
          className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-white/90 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 relative overflow-hidden"
        >
          {/* Subtle Ambient Backing Glow */}
          <div className="absolute top-0 right-0 w-80 h-32 bg-blue-500/10 blur-2xl rounded-full pointer-events-none -z-10" />

          {/* Report Header */}
          <div className="border-b border-slate-200/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full mb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified ML Assessment Completed</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Your Health Risk Summary
              </h3>
              {fullName && (
                <p className="text-xs text-slate-500">
                  Personal assessment prepared for <strong className="text-slate-800">{fullName}</strong>
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white/80 hover:bg-white text-slate-600 text-xs font-semibold cursor-pointer shadow-2xs"
              >
                New Assessment
              </button>
            </div>
          </div>

          {/* 3 Metric Summary Boxes: Overall Risk, Health Score, Model Risk */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Box 1: OVERALL HEALTH RISK */}
            <div
              className={`p-5 rounded-2xl text-center flex flex-col justify-center items-center border ${
                result.risk_level.toLowerCase().includes('high')
                  ? 'border-rose-200 bg-rose-50/90 text-rose-950'
                  : result.risk_level.toLowerCase().includes('moderate') || result.risk_level.toLowerCase().includes('medium')
                  ? 'border-amber-200 bg-amber-50/90 text-amber-950'
                  : 'border-emerald-200 bg-emerald-50/90 text-emerald-950'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-80">
                Overall Health Risk
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight">
                {result.risk_level}
              </div>
            </div>

            {/* Box 2: HEALTH SCORE */}
            <div className="p-5 rounded-2xl text-center flex flex-col justify-center items-center bg-indigo-50/90 border border-indigo-200 text-indigo-950">
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 mb-1">
                Health Score
              </div>
              <div className="text-2xl sm:text-3xl font-black text-indigo-900">
                {result.health_index}
                <span className="text-xs font-normal text-indigo-600"> / 100</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Evaluated Baseline
              </div>
            </div>

            {/* Box 3: OVERALL MODEL RISK PROBABILITY */}
            <div className="p-5 rounded-2xl text-center flex flex-col justify-center items-center bg-blue-50/90 border border-blue-200 text-blue-950">
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700 mb-1">
                Calculated Risk Score
              </div>
              <div className="text-2xl sm:text-3xl font-black text-blue-950">
                {result.risk_percentage}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Model Composite Index
              </div>
            </div>
          </div>

          {/* YOUR DISEASE RISK RESULTS — EVERY CONDITION RETURNED BY RENDER ML */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
              <div>
                <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <span>Your Disease Risk Results</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Multi-condition probabilities evaluated directly by the Render machine learning engine ({result.predictions.length} condition{result.predictions.length === 1 ? '' : 's'})
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold self-start sm:self-auto">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Prediction source: Render ML model</span>
              </div>
            </div>

            {/* Multi-Disease Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {result.predictions.map((item, idx) => (
                <div
                  key={idx}
                  className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-200/90 bg-white/90 shadow-xs hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-sm font-bold text-slate-900 leading-snug break-words">
                        {item.disease}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        Powered by your ML assessment
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xl sm:text-2xl font-black text-slate-900">
                        {item.percentageFormatted}
                      </div>
                      <span
                        className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          item.riskCategory === 'High'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : item.riskCategory === 'Moderate'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {item.riskCategory} Risk
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress / Risk Bar */}
                  <div className="space-y-1">
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.riskCategory === 'High'
                            ? 'bg-gradient-to-r from-rose-500 to-rose-600'
                            : item.riskCategory === 'Moderate'
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                            : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(4, item.percentage))}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Automatic Saving Confirmation Bar */}
          {isSampleDataLoaded ? (
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
              <div className="flex items-center gap-2 font-bold">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Sample Data Test Response — Live prediction from Render ML Engine (not stored as real patient history).
                </span>
              </div>
              <button
                type="button"
                onClick={handleClearSample}
                className="font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer shrink-0"
              >
                Enter Your Real Health Data &rarr;
              </button>
            </div>
          ) : isAuthenticated && user ? (
            <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Your assessment has been saved to My Health ✓</span>
              </div>
              {onNavigateToHealth && (
                <button
                  type="button"
                  onClick={onNavigateToHealth}
                  className="font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer shrink-0"
                >
                  View in My Health &rarr;
                </button>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-blue-50/90 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-950">
              <div>
                <span className="font-bold">Sign in to save your assessment history.</span>{' '}
                Track your vitals over time and see historical improvement.
              </div>
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shrink-0 transition-colors shadow-2xs"
              >
                Sign In to Save History &rarr;
              </button>
            </div>
          )}

          {/* Recommended Next Steps from ML model */}
          <div className="p-5 rounded-2xl bg-white/80 border border-slate-200/80 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Recommended Next Steps from ML Engine</span>
            </h4>
            <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-700">
              {result.recommendations.map((rec, idx) => (
                <li key={idx} className="leading-relaxed pl-1">
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          {/* AUTOMATIC AI HEALTH SUMMARY */}
          <div
            id="ai-health-summary-panel"
            className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-white/95 via-blue-50/40 to-indigo-50/50 border border-blue-200/80 shadow-sm space-y-3 relative overflow-hidden backdrop-blur-xl"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 tracking-tight">
                    AI Health Summary
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Clinical preventive perspective synthesized by Gemini
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100/70 border border-blue-200 text-blue-700 text-[10px] font-bold">
                <ShieldCheck className="w-3 h-3 text-blue-600" />
                <span>Grounded in Render ML Result</span>
              </div>
            </div>

            {isAiSummaryLoading ? (
              <div className="py-6 flex flex-col items-center justify-center gap-3 text-center">
                <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-slate-700">
                    Synthesizing your personalized health analysis...
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Connecting vitals with preventive lifestyle insights
                  </p>
                </div>
              </div>
            ) : aiSummary ? (
              <div className="space-y-3">
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2 whitespace-pre-line">
                  {aiSummary}
                </div>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Educational preventive analysis • Not a diagnostic determination</span>
                  <span className="font-medium text-slate-500">Gemini 3.8 Flash</span>
                </div>
              </div>
            ) : aiSummaryError ? (
              <div className="py-3 flex items-center justify-between text-xs text-rose-600 bg-rose-50/60 p-3 rounded-xl border border-rose-200">
                <span>{aiSummaryError}</span>
                {submittedSnapshot && (
                  <button
                    type="button"
                    onClick={() => fetchAiSummary(submittedSnapshot, result)}
                    className="font-bold underline text-rose-700 hover:text-rose-900 cursor-pointer"
                  >
                    Retry Summary
                  </button>
                )}
              </div>
            ) : null}
          </div>

          {/* INLINE AI CHAT TRIGGER & PANEL */}
          <div className="pt-2 border-t border-slate-200/60 space-y-4">
            {!isChatOpen ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-cyan-50/70 border border-blue-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Have a question about your result?</span>
                  </h4>
                  <p className="text-xs text-slate-600">
                    Ask our inline AI assistant about your risk level, BMI, or specific preventive habits.
                  </p>
                </div>
                <button
                  type="button"
                  id="btn-ask-ai"
                  onClick={() => setIsChatOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 active:scale-98 transition-all cursor-pointer shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span>✨ Ask AI</span>
                </button>
              </div>
            ) : (
              /* Expanded Glassmorphism Chat Panel */
              <div
                id="inline-ai-chat-panel"
                className="glass-panel rounded-2xl p-4 sm:p-6 space-y-4 border border-blue-200/80 bg-white/80 shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200"
              >
                {/* Chat Header */}
                <div className="flex items-center justify-between border-b border-slate-200/70 pb-3 gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <span>AI Assessment Assistant</span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Discussing your {result.risk_level} risk • {result.target_disease}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Remaining message counter badge */}
                    <div
                      id="ai-message-counter"
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                        chatRemaining > 1
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : chatRemaining === 1
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {chatRemaining > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      )}
                      <span>{chatRemaining} of 5 questions remaining</span>
                    </div>

                    {/* Minimize / Close Toggle */}
                    <button
                      type="button"
                      onClick={() => setIsChatOpen(false)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Hide chat"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Quick Question Suggestions (Shown before user sends first message) */}
                {userMessageCount === 0 && !isChatLoading && (
                  <div className="space-y-1.5 p-3 rounded-xl bg-blue-50/60 border border-blue-100/80">
                    <div className="text-[11px] font-bold text-blue-800 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                      <span>Suggested questions you can ask right now:</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {[
                        'Why is my risk at this level?',
                        'What habits should I improve first?',
                        'Is my BMI considered healthy?',
                      ].map((suggestion, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendChatMessage(suggestion)}
                          className="text-xs px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-700 hover:text-blue-700 border border-slate-200/80 hover:border-blue-300 font-medium transition-all shadow-2xs hover:shadow-xs cursor-pointer text-left"
                        >
                          ✦ {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scrollable Chat Window (Height 260px - 320px) */}
                <div
                  id="chat-message-container"
                  className="h-[270px] overflow-y-auto pr-1 space-y-3 rounded-xl bg-slate-50/50 p-3 border border-slate-200/60 scroll-smooth"
                >
                  {/* Initial Welcome AI Message */}
                  <div className="flex items-start gap-2.5 max-w-[85%] mr-auto">
                    <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="bg-white/95 border border-slate-200/80 rounded-2xl rounded-tl-xs p-3 text-xs sm:text-sm text-slate-800 shadow-2xs leading-relaxed">
                      Hello{fullName ? `, ${fullName}` : ''}! I'm your AI health assistant. I've reviewed your assessment result (<strong>{result.risk_level} risk</strong> in {result.target_disease}) and recorded vitals. What would you like to know about your numbers or recommended next steps?
                    </div>
                  </div>

                  {/* Conversation Messages */}
                  {chatMessages.map((msg) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-2 max-w-[85%] ${
                          isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                        }`}
                      >
                        {!isUser && (
                          <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div
                          className={`p-3 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                            isUser
                              ? 'bg-blue-600 text-white rounded-2xl rounded-tr-xs font-medium'
                              : 'bg-white/95 border border-slate-200/80 rounded-2xl rounded-tl-xs text-slate-800'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}

                  {/* Smooth Loading Indicator */}
                  {isChatLoading && (
                    <div className="flex items-start gap-2 max-w-[85%] mr-auto">
                      <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div className="bg-white/90 border border-slate-200/80 rounded-2xl rounded-tl-xs p-3 text-xs text-slate-500 shadow-2xs flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                        <span>AI is reviewing your assessment vitals...</span>
                      </div>
                    </div>
                  )}

                  {/* Inline Error Notice */}
                  {chatError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 text-center font-medium">
                      {chatError}
                    </div>
                  )}

                  {/* Limit Reached Banner inside Chat Window */}
                  {(userMessageCount >= 5 || chatRemaining <= 0) && (
                    <div
                      id="chat-limit-reached-card"
                      className="p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-center space-y-2 mt-2"
                    >
                      <div className="text-xs font-bold text-amber-900 flex items-center justify-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>You've reached the 5-question limit for this assessment.</span>
                      </div>
                      <p className="text-[11px] text-amber-700">
                        To ask more questions, start a new health assessment with your latest information.
                      </p>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Start New Assessment</span>
                      </button>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input & Submission Controls */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendChatMessage();
                  }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      disabled={isChatLoading || userMessageCount >= 5 || chatRemaining <= 0}
                      placeholder={
                        userMessageCount >= 5 || chatRemaining <= 0
                          ? "5-question limit reached for this assessment."
                          : "Ask about your risk score, BMI, or next steps..."
                      }
                      className={`flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border transition-all ${
                        userMessageCount >= 5 || chatRemaining <= 0
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-white/90 hover:bg-white focus:bg-white border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-slate-800'
                      }`}
                    />
                    <button
                      type="submit"
                      id="btn-send-chat"
                      disabled={
                        !chatInput.trim() ||
                        isChatLoading ||
                        userMessageCount >= 5 ||
                        chatRemaining <= 0
                      }
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all ${
                        !chatInput.trim() ||
                        isChatLoading ||
                        userMessageCount >= 5 ||
                        chatRemaining <= 0
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-98 shadow-blue-500/20'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-1 px-1">
                    <span>
                      Educational answers strictly grounded in your current assessment.
                    </span>
                    <span>
                      Message {Math.min(5, userMessageCount)} of 5 used
                    </span>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* DEVELOPER DEBUG: ML RESPONSE DETAILS */}
          <div className="pt-2 border-t border-slate-200/60">
            <button
              type="button"
              onClick={() => setShowDebugDetails(!showDebugDetails)}
              className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>{showDebugDetails ? '▼' : '▶'} ML Response Details (Debug Inspector)</span>
            </button>
            {showDebugDetails && result.rawResponse && (
              <div className="mt-2 p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto shadow-inner border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[10px] font-sans font-bold uppercase tracking-wider">
                  Raw JSON Payload from Render API ({RENDER_PREDICT_URL})
                </div>
                <pre className="text-emerald-400 whitespace-pre-wrap">{JSON.stringify(result.rawResponse, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
