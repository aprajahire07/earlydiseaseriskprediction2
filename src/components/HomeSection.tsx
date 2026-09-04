import React from 'react';
import {
  HeartPulse,
  Activity,
  Gauge,
  Brain,
  Scale,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Stethoscope,
  Sparkles,
  TrendingUp,
  Info,
} from 'lucide-react';

interface HomeSectionProps {
  onCheckRisk: () => void;
  onLearnMore?: () => void;
}

export const HomeSection: React.FC<HomeSectionProps> = ({
  onCheckRisk,
  onLearnMore,
}) => {
  const targetDiseases = [
    {
      id: 'diabetes',
      title: 'Diabetes (Type 2)',
      category: 'Metabolic & Glycemic',
      icon: Activity,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      summary: 'Impaired insulin regulation causing glucose accumulation in the bloodstream.',
      keyFactors: 'High BMI, sedentary lifestyle, dietary sugars, heredity',
    },
    {
      id: 'heart-disease',
      title: 'Heart Disease',
      category: 'Cardiovascular Health',
      icon: HeartPulse,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      badgeColor: 'bg-rose-100 text-rose-800',
      summary: 'Coronary artery narrowing and plaque deposition restricting blood flow.',
      keyFactors: 'High BP, smoking, high LDL cholesterol, physical inactivity',
    },
    {
      id: 'hypertension',
      title: 'Hypertension',
      category: 'Vascular & Arterial Pressure',
      icon: Gauge,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      badgeColor: 'bg-amber-100 text-amber-800',
      summary: 'Persistent elevated force against artery walls straining heart and blood vessels.',
      keyFactors: 'Excess sodium, chronic stress, lack of exercise, genetics',
    },
    {
      id: 'metabolic-disease',
      title: 'Metabolic Disease',
      category: 'Systemic Health',
      icon: Scale,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      badgeColor: 'bg-purple-100 text-purple-800',
      summary: 'A cluster of abdominal obesity, high glucose, and lipid dysregulation.',
      keyFactors: 'Visceral abdominal fat, insulin resistance, processed diets',
    },
    {
      id: 'stroke',
      title: 'Stroke',
      category: 'Cerebrovascular Health',
      icon: Brain,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      badgeColor: 'bg-blue-100 text-blue-800',
      summary: 'Disruption of blood and oxygen flow to brain tissues caused by clots or bleeds.',
      keyFactors: 'Uncontrolled hypertension, smoking, arterial plaque, diabetes',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Enter Vitals & Lifestyle Metrics',
      description:
        'Input non-invasive metrics including BMI, blood pressure category, physical activity level, smoking, alcohol, and family medical background.',
    },
    {
      number: '02',
      title: 'Machine Learning Correlation',
      description:
        'Our trained predictive algorithm cross-evaluates your multi-variable health vector against clinical epidemiological risk patterns.',
    },
    {
      number: '03',
      title: 'Stratified Risk Score & Guidance',
      description:
        'Receive immediate risk level stratification (Low / Moderate / High), identified suspect condition, calculated probability %, and preventive action steps.',
    },
  ];

  const benchmarks = [
    {
      label: 'Healthy BMI Range',
      value: '18.5 – 24.9',
      unit: 'kg/m²',
      desc: 'Optimal body mass index',
    },
    {
      label: 'Target Blood Pressure',
      value: '< 120 / 80',
      unit: 'mmHg',
      desc: 'Normal systolic & diastolic',
    },
    {
      label: 'Aerobic Physical Activity',
      value: '150+',
      unit: 'mins/week',
      desc: 'Moderate intensity exercise',
    },
    {
      label: 'Sodium Restriction',
      value: '< 2,000',
      unit: 'mg/day',
      desc: 'Recommended cardiovascular intake',
    },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/50 p-6 sm:p-10 shadow-xs">
        <div className="max-w-3xl space-y-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/90 px-3 py-1 text-xs font-semibold text-blue-700 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Preventive AI Healthcare &bull; Machine Learning Risk Stratification</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Early Chronic Disease Risk Prediction Using Lifestyle &amp; Medical History
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
            Evaluate your personal risk profile for <strong>5 critical chronic conditions</strong>. Our machine learning system analyzes daily habits, physiological vitals, and family heredity to support proactive healthcare before symptoms manifest.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              id="btn-check-risk"
              onClick={onCheckRisk}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 text-sm sm:text-base shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <span>Start Risk Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onLearnMore && (
              <button
                type="button"
                onClick={onLearnMore}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-5 py-3 text-sm sm:text-base shadow-xs transition-all cursor-pointer"
              >
                <span>About the 5 Diseases</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>

          {/* Trust Indicators Pill List */}
          <div className="pt-4 border-t border-blue-100/80 flex flex-wrap gap-y-2 gap-x-5 text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              5 Chronic Diseases Evaluated
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Non-Invasive Lifestyle Indicators
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Instant Predictive Feedback
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              100% Free &amp; Educational
            </span>
          </div>
        </div>
      </section>

      {/* 2. Target 5 Diseases Grid */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span>5 Target Conditions Evaluated</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              The model evaluates lifestyle risk correlations for these key non-communicable diseases.
            </p>
          </div>
          {onLearnMore && (
            <button
              type="button"
              onClick={onLearnMore}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>View full medical details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {targetDiseases.map((d) => {
            const Icon = d.icon;
            return (
              <div
                key={d.id}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-xs transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${d.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${d.badgeColor}`}>
                      {d.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">
                    {d.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {d.summary}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <strong className="text-slate-700">Primary Triggers:</strong>{' '}
                  <span>{d.keyFactors}</span>
                </div>
              </div>
            );
          })}

          {/* 6th Card: Action prompt */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-sm">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full inline-block">
                Predictive Model
              </span>
              <h3 className="font-bold text-lg text-white">
                Find Out Your Risk Score
              </h3>
              <p className="text-xs text-blue-100 leading-relaxed">
                Provide your parameters to generate a 3-tier risk score, pinpoint suspect condition vulnerability, and access lifestyle interventions.
              </p>
            </div>

            <button
              type="button"
              onClick={onCheckRisk}
              className="w-full bg-white text-blue-700 hover:bg-blue-50 font-bold py-2.5 px-4 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
            >
              <span>Calculate Risk Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. How It Works (3 Simple Steps) */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            How The Prediction System Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            From user input to actionable health guidance in three streamlined stages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {steps.map((st) => (
            <div
              key={st.number}
              className="relative bg-slate-50 border border-slate-200/80 rounded-xl p-5 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-blue-600/40">
                  {st.number}
                </span>
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {st.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {st.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Clinical Benchmarks / Lifestyle Insights */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Key Health Benchmarks for Prevention</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Standard health targets that support long-term cardiovascular and metabolic longevity.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {benchmarks.map((b, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-xl p-4 text-center space-y-1"
            >
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {b.label}
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-blue-600">
                {b.value}
              </div>
              <div className="text-[11px] font-bold text-slate-700">
                {b.unit}
              </div>
              <div className="text-[10px] text-slate-400">
                {b.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Why Early Detection Matters */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">80% Preventable</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            The World Health Organization notes that up to 80% of premature heart disease, strokes, and type 2 diabetes can be prevented with early lifestyle modifications.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
            <Stethoscope className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Silent Progression</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Hypertension and metabolic dysfunction often develop without noticeable symptoms for years. Risk estimation brings hidden physiological strains to light.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
            <Info className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Actionable Guidance</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Instead of just a score, the platform provides evidence-based dietary, physical activity, and medical monitoring recommendations.
          </p>
        </div>
      </section>

      {/* 6. Bottom Banner CTA */}
      <section className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-blue-50 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
        <div className="space-y-1.5 max-w-xl">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Ready to check your personal risk profile?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Takes less than 2 minutes to fill out. You can also load sample data with one click to test the system immediately.
          </p>
        </div>

        <button
          type="button"
          onClick={onCheckRisk}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 text-sm shadow-sm hover:shadow cursor-pointer transition-all shrink-0"
        >
          <span>Open Prediction Form</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* 7. Responsible Medical Disclaimer */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 space-y-1">
        <div className="font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
          <span>Medical Notice &bull; Academic Demonstration</span>
        </div>
        <p className="text-slate-700 leading-relaxed text-[11px]">
          The predictions provided by this platform are for educational and informational demonstration only and should not be considered a medical diagnosis. Users should consult a qualified healthcare professional for proper evaluation and personalized clinical advice.
        </p>
      </div>
    </div>
  );
};

