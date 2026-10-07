import React from 'react';
import {
  HeartPulse,
  Activity,
  Gauge,
  Brain,
  Scale,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  TrendingUp,
  Database,
  ChevronRight,
  CheckCircle,
  Clock,
  Lock,
} from 'lucide-react';

interface HomeSectionProps {
  onCheckRisk: () => void;
  onLearnMore?: () => void;
  onNavigateToAuth?: () => void;
}

export const HomeSection: React.FC<HomeSectionProps> = ({
  onCheckRisk,
  onLearnMore,
  onNavigateToAuth,
}) => {
  const targetDiseases = [
    {
      id: 'diabetes',
      title: 'Type 2 Diabetes',
      category: 'Metabolic & Glycemic Health',
      icon: Activity,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      summary: 'Evaluates impaired insulin regulation, glucose accumulation, and metabolic resistance.',
      keyFactors: 'Elevated BMI, sedentary routine, refined sugars, family history',
    },
    {
      id: 'heart-disease',
      title: 'Cardiovascular Disease',
      category: 'Heart & Arterial Health',
      icon: HeartPulse,
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
      summary: 'Assesses arterial plaque accumulation, coronary strain, and blood flow impediments.',
      keyFactors: 'Hypertension, smoking, high LDL cholesterol, inactivity',
    },
    {
      id: 'hypertension',
      title: 'Hypertension',
      category: 'Vascular & Arterial Pressure',
      icon: Gauge,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      summary: 'Measures continuous elevated force against artery walls straining vital organs.',
      keyFactors: 'High sodium intake, chronic stress, poor sleep, heredity',
    },
    {
      id: 'stroke',
      title: 'Cerebrovascular Stroke',
      category: 'Brain Circulation',
      icon: Brain,
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
      summary: 'Determines susceptibility to disrupted arterial blood and oxygen flow to brain tissue.',
      keyFactors: 'Unmanaged BP, atrial conditions, arterial stiffness, smoking',
    },
    {
      id: 'metabolic-disease',
      title: 'Metabolic Syndrome',
      category: 'Systemic Health',
      icon: Scale,
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
      summary: 'Evaluates the dangerous cluster of abdominal adiposity, dyslipidemia, and glucose imbalance.',
      keyFactors: 'Visceral abdominal fat, insulin resistance, ultra-processed diet',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Input Lifestyle Vitals',
      description: 'Enter everyday non-invasive health parameters such as BMI, blood pressure, exercise frequency, sleep, and family medical background.',
    },
    {
      step: '02',
      title: 'Algorithmic Correlation',
      description: 'The predictive system correlates multi-variable physiological parameters with clinical epidemiological risk patterns.',
    },
    {
      step: '03',
      title: 'Stratified Risk Score',
      description: 'Receive instant stratified risk assessment (Low, Moderate, High) with suspect condition highlights and personalized prevention guidance.',
    },
  ];

  const benchmarks = [
    {
      label: 'Optimal Body Mass Index',
      value: '18.5 – 24.9',
      unit: 'kg/m²',
      description: 'Standard metabolic baseline',
    },
    {
      label: 'Target Blood Pressure',
      value: '< 120 / 80',
      unit: 'mmHg',
      description: 'Normal systolic & diastolic',
    },
    {
      label: 'Aerobic Exercise',
      value: '150+',
      unit: 'mins / week',
      description: 'Moderate cardio target',
    },
    {
      label: 'Preventable Burden',
      value: 'Up to 80%',
      unit: 'of cases',
      description: 'Via early lifestyle action',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 py-2">
      {/* 1. Hero Section - Spacious, Airy, Premium */}
      <section className="relative pt-4 sm:pt-8 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            {/* Clean category kicker (no pill boxes) */}
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span>Preventive Health Intelligence</span>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <span className="text-slate-500 font-medium normal-case">Machine Learning Risk Stratification</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Early Chronic Disease Risk Prediction
            </h1>

            {/* Subtitle with comfortable line height */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Evaluate your personal vulnerability across <strong>5 critical non-communicable conditions</strong> using everyday lifestyle habits, physiological vitals, and family medical history.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                id="btn-check-risk"
                onClick={onCheckRisk}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold px-6 py-3.5 text-base shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <span>Start Risk Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {onNavigateToAuth && (
                <button
                  type="button"
                  id="btn-hero-auth"
                  onClick={onNavigateToAuth}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-[0.99] text-slate-800 font-semibold px-5 py-3.5 text-base shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
                >
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>Patient Login / Sign Up</span>
                </button>
              )}

              {onLearnMore && (
                <button
                  type="button"
                  onClick={onLearnMore}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-blue-600 px-3 py-2 transition-colors cursor-pointer"
                >
                  <span>Learn about diseases</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Clean metadata strip - Unboxed text with subtle typographic separators */}
            <div className="pt-4 border-t border-slate-200/80 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                5 Conditions Assessed
              </span>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Instant 2-Minute Feedback
              </span>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <Lock className="w-3.5 h-3.5 text-slate-600" />
                Non-Invasive &amp; Confidential
              </span>
            </div>
          </div>

          {/* Right Hero: Clean, Elegant Live Risk Preview Card */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Predictive Assessment Preview</div>
                    <div className="text-[11px] text-slate-500">Clinical Lifestyle Multi-Vector Model</div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                  Active Demo
                </span>
              </div>

              {/* Sample Profile Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Body Mass Index</div>
                  <div className="text-lg font-bold text-slate-900 mt-0.5">23.4 <span className="text-xs font-normal text-slate-500">kg/m²</span></div>
                  <div className="text-[11px] text-emerald-600 font-medium">Healthy Weight Range</div>
                </div>
                <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Blood Pressure</div>
                  <div className="text-lg font-bold text-slate-900 mt-0.5">118/76 <span className="text-xs font-normal text-slate-500">mmHg</span></div>
                  <div className="text-[11px] text-emerald-600 font-medium">Optimal Normotensive</div>
                </div>
                <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Weekly Exercise</div>
                  <div className="text-lg font-bold text-slate-900 mt-0.5">180 <span className="text-xs font-normal text-slate-500">mins</span></div>
                  <div className="text-[11px] text-blue-600 font-medium">Active Lifestyle</div>
                </div>
                <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Hereditary Factor</div>
                  <div className="text-lg font-bold text-slate-900 mt-0.5">Moderate</div>
                  <div className="text-[11px] text-amber-600 font-medium">Type 2 Diabetes History</div>
                </div>
              </div>

              {/* Calculated Result Snapshot */}
              <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Overall Evaluated Risk</div>
                  <div className="text-base font-bold text-white mt-0.5">Low Cumulative Risk</div>
                  <div className="text-xs text-slate-300">Preventive recommendations ready</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-emerald-400">89%</div>
                  <div className="text-[10px] text-slate-400 font-medium">Health Index</div>
                </div>
              </div>

              {/* Action prompt */}
              <button
                type="button"
                onClick={onCheckRisk}
                className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-blue-600 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200/80"
              >
                <span>Calculate Your Own Health Parameters</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Target 5 Conditions - Clean, Spacious Cards */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-semibold text-blue-700 tracking-wide uppercase">
              Target Health Domains
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              5 Critical Chronic Conditions Evaluated
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Our predictive algorithms evaluate multidimensional lifestyle habits and physiological indicators correlated with these leading non-communicable diseases.
            </p>
          </div>

          {onLearnMore && (
            <button
              type="button"
              onClick={onLearnMore}
              className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer shrink-0"
            >
              <span>View clinical details</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Clean, balanced grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {targetDiseases.map((d) => {
            const Icon = d.icon;
            return (
              <div
                key={d.id}
                className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-6 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${d.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-slate-500">
                      {d.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">
                      {d.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1.5">
                      {d.summary}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Key Triggers:</span>{' '}
                  <span className="text-slate-600">{d.keyFactors}</span>
                </div>
              </div>
            );
          })}

          {/* 6th Card: Simple, Elegant Action Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col justify-between space-y-5 shadow-xs">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">
                  Check Your Personal Risk
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-1.5">
                  Answer non-invasive questions about physical activity, diet, BP category, and family background to generate your stratified risk score.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onCheckRisk}
              className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
            >
              <span>Launch Prediction Form</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. How It Works - Clean 3-Step Process with Generous Spacing */}
      <section className="bg-white border border-slate-200/80 rounded-2xl p-8 sm:p-12 space-y-10 shadow-2xs">
        <div className="max-w-xl mx-auto text-center space-y-2">
          <div className="text-xs font-semibold text-blue-700 tracking-wide uppercase">
            Simple Process
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How The Prediction System Works
          </h2>
          <p className="text-sm text-slate-600">
            From everyday health inputs to stratified clinical guidance in three clear steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
          {steps.map((st) => (
            <div key={st.step} className="space-y-3">
              <div className="text-3xl sm:text-4xl font-black text-blue-600/40">
                {st.step}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {st.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {st.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Clinical Benchmarks for Prevention */}
      <section className="space-y-6">
        <div className="space-y-1.5">
          <div className="text-xs font-semibold text-blue-700 tracking-wide uppercase">
            Clinical Indicators
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Target Health Benchmarks</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Standard clinical targets recommended for sustainable cardiovascular and metabolic wellness.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {benchmarks.map((b, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-1 shadow-2xs"
            >
              <div className="text-[11px] font-semibold text-slate-500">
                {b.label}
              </div>
              <div className="text-2xl font-extrabold text-blue-600 pt-1">
                {b.value}
              </div>
              <div className="text-xs font-semibold text-slate-700">
                {b.unit}
              </div>
              <div className="text-[11px] text-slate-400 pt-0.5">
                {b.description}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Why Early Detection Matters - Clean, Calm Insights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-2.5 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">80% Preventable</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            The World Health Organization notes that up to 80% of premature heart attacks, strokes, and type 2 diabetes can be prevented through early behavioral modifications.
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-2.5 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Stethoscope className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Silent Progression</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Hypertension and insulin resistance advance quietly for years without noticeable symptoms. Early lifestyle estimation brings subtle metabolic strain to light.
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-2.5 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Actionable Guidance</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Rather than just a static probability number, the platform outputs evidence-based dietary, physical exercise, and medical monitoring recommendations.
          </p>
        </div>
      </section>

      {/* 6. Clean Bottom Banner CTA */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-12 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Ready to evaluate your personalized risk profile?
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Takes less than 2 minutes to complete. You can also load sample patient data with a single click to test the system immediately.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onCheckRisk}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3.5 text-sm shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <span>Open Assessment Form</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 7. Quiet, Responsible Medical Disclaimer */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200/70 bg-slate-50/80 text-slate-600 text-xs flex items-start gap-3">
        <div className="w-5 h-5 text-slate-400 shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <div className="font-semibold text-slate-700 text-xs">
            Medical &amp; Academic Notice
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            The predictions generated by this platform are designed for educational, preventive awareness, and academic demonstration only. They do not constitute clinical diagnosis. Always consult a certified healthcare professional for personalized medical assessment.
          </p>
        </div>
      </div>
    </div>
  );
};
