import React, { useState } from 'react';

// Structure of the response expected from the FastAPI backend
interface PredictionResult {
  risk_percentage?: number | string;
  risk_score?: number | string;
  probability?: number | string;
  risk_level?: string;
  prediction?: string;
  target_disease?: string;
  suspected_disease?: string;
  primary_risk?: string;
  disease?: string;
  recommendation?: string | string[];
  recommendations?: string | string[];
  message?: string;
}

const DEFAULT_API_ENDPOINT = 'https://disease-risk-api-e5o7.onrender.com/predict';

// Local Fallback Disease Risk Calculation Engine
function calculateLocalRisk(params: {
  age: number;
  gender: string;
  bmi: number;
  bloodPressure: string;
  smokingHabit: string;
  alcoholConsumption: string;
  physicalActivity: string;
  familyMedicalHistory: string[];
  bloodSugarLevel: string;
}): PredictionResult {
  let score = 15; // base score

  // Age factor
  if (params.age >= 60) score += 20;
  else if (params.age >= 45) score += 14;
  else if (params.age >= 35) score += 7;

  // BMI factor
  if (params.bmi >= 30) score += 18;
  else if (params.bmi >= 25) score += 10;
  else if (params.bmi < 18.5) score += 4;

  // Blood Pressure factor
  const bp = params.bloodPressure.toLowerCase();
  if (bp.includes('stage 2')) score += 24;
  else if (bp.includes('stage 1')) score += 16;
  else if (bp.includes('elevated')) score += 8;

  // Smoking factor
  const smoking = params.smokingHabit.toLowerCase();
  if (smoking.includes('regular')) score += 20;
  else if (smoking.includes('occasional')) score += 10;

  // Alcohol factor
  const alc = params.alcoholConsumption.toLowerCase();
  if (alc.includes('regular')) score += 12;
  else if (alc.includes('occasional')) score += 5;

  // Physical Activity factor
  const act = params.physicalActivity.toLowerCase();
  if (act.includes('sedentary')) score += 15;
  else if (act.includes('active')) score -= 10;
  else if (act.includes('moderate')) score -= 5;

  // Family Medical History
  const history = params.familyMedicalHistory;
  if (history.includes('Heart Disease')) score += 15;
  if (history.includes('Diabetes')) score += 12;
  if (history.includes('High Blood Pressure')) score += 10;
  if (history.includes('High Cholesterol')) score += 8;

  // Blood Sugar Level
  const sugar = params.bloodSugarLevel.toLowerCase();
  if (sugar.includes('high') || sugar.includes('diabetic') || parseInt(sugar, 10) > 140) score += 18;
  else if (parseInt(sugar, 10) > 100) score += 8;

  // Clamp score to 5% - 95%
  score = Math.min(Math.max(score, 5), 95);

  // Determine Risk Level
  let riskLevel = 'Low';
  if (score >= 60) riskLevel = 'High';
  else if (score >= 35) riskLevel = 'Moderate';

  // Determine Suspected Target Disease
  let targetDisease = 'General Lifestyle Health Risk';
  if (history.includes('Heart Disease') || bp.includes('stage') || smoking.includes('regular')) {
    targetDisease = 'Cardiovascular Disease / Hypertension';
  } else if (history.includes('Diabetes') || sugar.includes('high') || params.bmi >= 28) {
    targetDisease = 'Type 2 Diabetes / Metabolic Risk';
  } else if (params.bmi >= 30 && act.includes('sedentary')) {
    targetDisease = 'Metabolic Syndrome & Obesity Risk';
  } else if (bp.includes('elevated') || bp.includes('stage 1')) {
    targetDisease = 'Early Pre-Hypertension';
  }

  // Generate Recommendations
  const recs: string[] = [];
  if (score >= 60) {
    recs.push('Consult a licensed healthcare physician for a comprehensive clinical cardiovascular and metabolic screening.');
  }
  if (params.bmi >= 25) {
    recs.push('Adopt a nutrient-dense, calorie-conscious diet and aim for a healthy BMI between 18.5 and 24.9.');
  }
  if (bp.includes('stage') || bp.includes('elevated')) {
    recs.push('Monitor systolic and diastolic blood pressure twice weekly and restrict sodium intake to under 2,000 mg/day.');
  }
  if (smoking.includes('regular') || smoking.includes('occasional')) {
    recs.push('Enroll in a smoking cessation program to significantly reduce vascular disease and plaque buildup.');
  }
  if (act.includes('sedentary')) {
    recs.push('Incorporate at least 150 minutes of moderate aerobic exercise (such as brisk walking or cycling) each week.');
  }
  if (history.includes('Diabetes') || sugar.includes('high')) {
    recs.push('Schedule fasting blood glucose and HbA1c lab tests to detect early glycemic dysregulation.');
  }
  if (recs.length === 0) {
    recs.push('Continue maintaining balanced nutrition, adequate hydration, regular physical activity, and routine annual health checkups.');
  }

  return {
    risk_percentage: `${score.toFixed(1)}%`,
    risk_score: score,
    risk_level: riskLevel,
    target_disease: targetDisease,
    recommendations: recs,
    prediction: riskLevel,
  };
}

export const PredictionForm: React.FC = () => {
  // Form input states
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [bmi, setBmi] = useState<string>('');
  const [bloodPressure, setBloodPressure] = useState<string>('');
  const [smokingHabit, setSmokingHabit] = useState<string>('');
  const [alcoholConsumption, setAlcoholConsumption] = useState<string>('');
  const [physicalActivity, setPhysicalActivity] = useState<string>('');
  const [familyMedicalHistory, setFamilyMedicalHistory] = useState<string[]>([]);
  const [bloodSugarLevel, setBloodSugarLevel] = useState<string>('');

  // Endpoint configuration
  const [apiUrl] = useState<string>(DEFAULT_API_ENDPOINT);

  // Request & Response states
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [resultSource, setResultSource] = useState<'api' | 'fallback'>('api');
  const [validationError, setValidationError] = useState<string>('');
  const [apiError, setApiError] = useState<string>('');

  // Handle family history checkbox toggle
  const handleCheckboxChange = (disease: string) => {
    if (familyMedicalHistory.includes(disease)) {
      setFamilyMedicalHistory(familyMedicalHistory.filter((item) => item !== disease));
    } else {
      setFamilyMedicalHistory([...familyMedicalHistory, disease]);
    }
  };

  // Helper to load sample testing data
  const handleLoadSample = () => {
    setAge('45');
    setGender('Male');
    setBmi('26.4');
    setBloodPressure('Stage 1 Hypertension');
    setSmokingHabit('Occasional');
    setAlcoholConsumption('Occasional');
    setPhysicalActivity('Sedentary');
    setFamilyMedicalHistory(['High Blood Pressure', 'Diabetes']);
    setBloodSugarLevel('110 mg/dL');
    setValidationError('');
    setApiError('');
    setResult(null);
  };

  // Handle form submission to FastAPI backend
  const handleSubmit = async (e?: React.FormEvent, forceFallback: boolean = false) => {
    if (e) e.preventDefault();

    // Reset previous messages
    setValidationError('');
    setApiError('');

    // Validation check
    if (!age || !gender || !bmi || !bloodPressure || !smokingHabit || !alcoholConsumption || !physicalActivity) {
      setValidationError('Please fill in all the required fields marked with *');
      return;
    }

    const numericAge = Number(age) || 0;
    const numericBmi = parseFloat(bmi) || 0;

    // If user clicked Instant Local Calculation
    if (forceFallback) {
      setLoading(true);
      setLoadingMessage('Calculating risk using built-in clinical risk engine...');
      setTimeout(() => {
        const localData = calculateLocalRisk({
          age: numericAge,
          gender,
          bmi: numericBmi,
          bloodPressure,
          smokingHabit,
          alcoholConsumption,
          physicalActivity,
          familyMedicalHistory,
          bloodSugarLevel,
        });
        setResult(localData);
        setResultSource('fallback');
        setLoading(false);
        setApiError('');
      }, 400);
      return;
    }

    // Prepare JSON payload for FastAPI /predict endpoint
    const payload = {
      age: numericAge,
      gender: gender,
      bmi: numericBmi,
      blood_pressure: bloodPressure,
      bloodPressure: bloodPressure,
      smoking_habit: smokingHabit,
      smokingHabit: smokingHabit,
      alcohol_consumption: alcoholConsumption,
      alcoholConsumption: alcoholConsumption,
      physical_activity: physicalActivity,
      physicalActivity: physicalActivity,
      family_medical_history: familyMedicalHistory,
      familyMedicalHistory: familyMedicalHistory,
      blood_sugar_level: bloodSugarLevel || 'Normal',
      bloodSugarLevel: bloodSugarLevel || 'Normal',
    };

    setLoading(true);
    setLoadingMessage(`Connecting to backend (${apiUrl.includes('onrender.com') ? 'Render server waking up...' : apiUrl})...`);

    // Setup 40s timeout for Render free tier wake-ups
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 40000);

    try {
      const response = await fetch(apiUrl.trim(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
      }

      const data: PredictionResult = await response.json();
      setResult(data);
      setResultSource('api');
      setApiError('');
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const isAbort = err instanceof Error && err.name === 'AbortError';
      const errorMessage = isAbort
        ? 'Request timed out after 40 seconds'
        : err instanceof Error
        ? err.message
        : 'Unable to connect to backend server';

      setApiError(
        `${errorMessage}. If your Render backend was asleep, free-tier services can take 40-50s to wake up on first ping, or CORS might need to be enabled in FastAPI.`
      );
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setAge('');
    setGender('');
    setBmi('');
    setBloodPressure('');
    setSmokingHabit('');
    setAlcoholConsumption('');
    setPhysicalActivity('');
    setFamilyMedicalHistory([]);
    setBloodSugarLevel('');
    setResult(null);
    setValidationError('');
    setApiError('');
  };

  // Format percentage helper
  const getDisplayPercentage = (res: PredictionResult): string => {
    const val = res.risk_percentage ?? res.risk_score ?? res.probability;
    if (val === undefined || val === null) return 'N/A';
    if (typeof val === 'number') {
      // If decimal between 0 and 1, convert to %
      if (val <= 1 && val > 0) {
        return `${(val * 100).toFixed(1)}%`;
      }
      return `${val}%`;
    }
    return String(val).includes('%') ? String(val) : `${val}%`;
  };

  // Format risk level helper
  const getDisplayLevel = (res: PredictionResult): string => {
    return res.risk_level || res.prediction || 'Assessed';
  };

  // Format target/suspected disease helper
  const getTargetDisease = (res: PredictionResult): string => {
    return res.target_disease || res.suspected_disease || res.primary_risk || res.disease || 'N/A';
  };

  // Format recommendations helper
  const getRecommendations = (res: PredictionResult): string[] => {
    const rec = res.recommendation || res.recommendations || res.message;
    if (!rec) return ['Maintain a balanced diet, exercise regularly, and consult a healthcare professional for regular check-ups.'];
    if (Array.isArray(rec)) return rec;
    return [rec];
  };

  // Badge color based on risk level
  const getRiskColorClasses = (level: string) => {
    const l = level.toLowerCase();
    if (l.includes('high') || l.includes('severe') || l.includes('danger')) {
      return 'border-red-500 bg-red-50 text-red-800';
    }
    if (l.includes('moderate') || l.includes('medium') || l.includes('warning')) {
      return 'border-yellow-500 bg-yellow-50 text-yellow-800';
    }
    return 'border-green-500 bg-green-50 text-green-800';
  };

  return (
    <div className="border border-slate-200 rounded-xl p-5 sm:p-7 bg-white shadow-xs space-y-6">
      {/* Clean Header */}
      <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>Risk Prediction Form</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-sm">
              Non-Invasive
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Enter your lifestyle and health parameters to calculate disease risk factors.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLoadSample}
          className="border border-slate-300 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-1.5 text-xs cursor-pointer font-semibold shadow-2xs transition-colors"
          title="Load sample values for testing"
        >
          Load Sample Data
        </button>
      </div>

      {/* Validation Message */}
      {validationError && (
        <div className="border border-red-300 bg-red-50 text-red-700 text-xs p-2.5">
          <strong>Validation Error:</strong> {validationError}
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* 1. Age */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Age *
          </label>
          <input
            type="number"
            min="1"
            max="120"
            placeholder="Enter age (e.g. 45)"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full border border-gray-300 p-2 text-sm"
            required
          />
        </div>

        {/* 2. Gender */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Gender *
          </label>
          <div className="flex gap-4 text-sm text-gray-700">
            {['Male', 'Female', 'Other'].map((g) => (
              <label key={g} className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={gender === g}
                  onChange={(e) => setGender(e.target.value)}
                />
                <span>{g}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 3. BMI */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            BMI (Body Mass Index) *
          </label>
          <input
            type="number"
            step="0.1"
            placeholder="Enter BMI (e.g. 24.5)"
            value={bmi}
            onChange={(e) => setBmi(e.target.value)}
            className="w-full border border-gray-300 p-2 text-sm"
            required
          />
        </div>

        {/* 4. Blood Pressure Level */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Blood Pressure Level *
          </label>
          <select
            value={bloodPressure}
            onChange={(e) => setBloodPressure(e.target.value)}
            className="w-full border border-gray-300 p-2 text-sm bg-white"
            required
          >
            <option value="">-- Select Blood Pressure Level --</option>
            <option value="Normal">Normal (&lt; 120/80 mmHg)</option>
            <option value="Elevated">Elevated (120-129 / &lt; 80 mmHg)</option>
            <option value="Stage 1 Hypertension">Stage 1 Hypertension (130-139 / 80-89 mmHg)</option>
            <option value="Stage 2 Hypertension">Stage 2 Hypertension (&ge; 140 / &ge; 90 mmHg)</option>
            <option value="Low Blood Pressure">Low Blood Pressure (&lt; 90/60 mmHg)</option>
          </select>
        </div>

        {/* 5. Smoking Habit */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Smoking Habit *
          </label>
          <div className="flex gap-4 text-sm text-gray-700">
            {['Non-Smoker', 'Occasional', 'Regular'].map((s) => (
              <label key={s} className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="smoking"
                  value={s}
                  checked={smokingHabit === s}
                  onChange={(e) => setSmokingHabit(e.target.value)}
                />
                <span>{s}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 6. Alcohol Consumption */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Alcohol Consumption *
          </label>
          <div className="flex gap-4 text-sm text-gray-700">
            {['None', 'Occasional', 'Regular'].map((a) => (
              <label key={a} className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="alcohol"
                  value={a}
                  checked={alcoholConsumption === a}
                  onChange={(e) => setAlcoholConsumption(e.target.value)}
                />
                <span>{a}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 7. Physical Activity */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Physical Activity *
          </label>
          <select
            value={physicalActivity}
            onChange={(e) => setPhysicalActivity(e.target.value)}
            className="w-full border border-gray-300 p-2 text-sm bg-white"
            required
          >
            <option value="">-- Select Physical Activity Level --</option>
            <option value="Sedentary">Sedentary (No exercise)</option>
            <option value="Moderate">Moderate (3-4 days/week)</option>
            <option value="Active">Active (Daily exercise)</option>
          </select>
        </div>

        {/* 8. Family Medical History */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Family Medical History
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
            {['Diabetes', 'High Blood Pressure', 'Heart Disease', 'High Cholesterol'].map((item) => (
              <label key={item} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={familyMedicalHistory.includes(item)}
                  onChange={() => handleCheckboxChange(item)}
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 9. Blood Sugar Level */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Blood Sugar Level <span className="text-gray-400 font-normal text-xs">(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. 95 mg/dL or Normal"
            value={bloodSugarLevel}
            onChange={(e) => setBloodSugarLevel(e.target.value)}
            className="w-full border border-gray-300 p-2 text-sm"
          />
        </div>

        {/* Submit & Reset Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            id="btn-submit-form"
            disabled={loading}
            className={`font-bold px-6 py-2 border text-sm flex items-center gap-2 cursor-pointer ${
              loading
                ? 'bg-blue-300 border-blue-400 text-white cursor-not-allowed'
                : 'bg-[#3b82f6] hover:bg-blue-600 text-white border-blue-700'
            }`}
          >
            {loading ? (
              <>
                {/* Simple CSS Loading Spinner */}
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Calculating Risk...</span>
              </>
            ) : (
              <span>Check Risk</span>
            )}
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 border border-gray-300 cursor-pointer text-sm"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Loading Indicator Box */}
      {loading && (
        <div className="border border-blue-200 bg-blue-50 p-3.5 text-xs text-blue-900 space-y-1.5">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
            <span>{loadingMessage || 'Analyzing health parameters and calculating risk score...'}</span>
          </div>
          <p className="text-[11px] text-blue-700 pl-6">
            If the backend is hosted on Render free-tier, it may take 30-50 seconds to complete cold-start boot.
          </p>
        </div>
      )}

      {/* Error Message Box with Actionable Recovery */}
      {apiError && !loading && (
        <div className="border border-red-300 bg-red-50/90 p-4 text-xs text-red-900 space-y-3">
          <div>
            <p className="font-bold text-red-800 text-sm mb-1">Backend Connection Notice</p>
            <p className="text-red-700 leading-relaxed">{apiError}</p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1 border-t border-red-200">
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="border border-red-400 bg-white hover:bg-red-50 text-red-800 px-3 py-1.5 font-bold cursor-pointer text-xs"
            >
              Retry Connection (Wake up Render)
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(undefined, true)}
              className="border border-blue-600 bg-[#3b82f6] hover:bg-blue-600 text-white px-3 py-1.5 font-bold cursor-pointer text-xs"
            >
              Calculate with Built-in Risk Engine (Instant Demo)
            </button>
          </div>

          <div className="border-t border-red-200/80 pt-2 text-[11px] text-gray-700">
            <strong>FastAPI CORS Check:</strong> If using a custom FastAPI server, ensure CORS middleware is included:
            <code className="block bg-white p-1.5 mt-1 border border-red-200 font-mono text-[10px] overflow-x-auto">
              app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
            </code>
          </div>
        </div>
      )}

      {/* Result Card: Displayed right below Check Risk button when API returns response */}
      {result && !loading && (
        <div className="border-2 border-gray-300 p-5 bg-white space-y-4">
          <div className="border-b border-gray-200 pb-2 flex justify-between items-center">
            <h3 className="font-bold text-base text-gray-900">
              Prediction Result
            </h3>
            <span className={`text-xs px-2 py-0.5 font-mono border ${
              resultSource === 'api'
                ? 'bg-green-50 text-green-700 border-green-300'
                : 'bg-blue-50 text-blue-700 border-blue-300'
            }`}>
              {resultSource === 'api' ? 'FastAPI Backend (Live)' : 'Clinical Risk Engine (Offline Model)'}
            </span>
          </div>

          {/* Top Row: 3 Separate Equal-Width Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Box 1: RISK LEVEL */}
            <div className={`border p-4 text-center flex flex-col justify-center items-center ${getRiskColorClasses(getDisplayLevel(result))}`}>
              <div className="text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-90">
                RISK LEVEL
              </div>
              <div className="text-xl font-extrabold tracking-tight">
                {getDisplayLevel(result)}
              </div>
            </div>

            {/* Box 2: SUSPECTED CONDITION / TARGET DISEASE */}
            <div className="border border-blue-300 bg-blue-50/70 p-4 text-center flex flex-col justify-center items-center text-blue-950">
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-800 mb-1.5">
                SUSPECTED CONDITION / TARGET DISEASE
              </div>
              <div className="text-lg font-bold text-blue-900 leading-snug">
                {getTargetDisease(result)}
              </div>
            </div>

            {/* Box 3: CALCULATED RISK PROBABILITY */}
            <div className="border border-indigo-300 bg-indigo-50/70 p-4 text-center flex flex-col justify-center items-center text-indigo-950">
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 mb-1.5">
                CALCULATED RISK PROBABILITY
              </div>
              <div className="text-xl font-extrabold text-indigo-900">
                {getDisplayPercentage(result)}
              </div>
            </div>

          </div>

          {/* Bottom Full-Width Rectangle Card: Recommendations array in clean bullet points */}
          <div className="border border-gray-300 bg-gray-50 p-4 w-full">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-700 mb-2.5 border-b border-gray-200 pb-1.5">
              Recommendations & Guidance
            </h4>
            <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-gray-800">
              {getRecommendations(result).map((rec, idx) => (
                <li key={idx} className="leading-relaxed pl-1">
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          {/* Input Summary */}
          <div className="text-[11px] text-gray-500 border-t border-gray-200 pt-2 flex flex-wrap gap-x-4 gap-y-1">
            <span>Age: <strong>{age}</strong></span>
            <span>Gender: <strong>{gender}</strong></span>
            <span>BMI: <strong>{bmi}</strong></span>
            <span>BP: <strong>{bloodPressure}</strong></span>
            <span>Smoking: <strong>{smokingHabit}</strong></span>
            <span>Activity: <strong>{physicalActivity}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};
