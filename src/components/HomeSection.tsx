import React from 'react';
import {
  HeartPulse,
  Activity,
  Gauge,
  Brain,
  Scale,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Clock,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HomeSectionProps {
  onCheckRisk: () => void;
  onLearnMore?: () => void;
  onNavigateToAuth?: () => void;
}

export const HomeSection: React.FC<HomeSectionProps> = ({
  onCheckRisk,
  onLearnMore,
}) => {
  const { isAuthenticated, user, openAuthModal } = useAuth();

  const conditions = [
    {
      id: 'diabetes',
      name: 'Type 2 Diabetes',
      tag: 'Blood Sugar',
      icon: Activity,
      iconColor: 'bg-emerald-50 text-emerald-600',
      description: 'High blood sugar caused by body weight, processed foods, and low exercise.',
      cause: 'Main causes: High BMI, sugary diets, family history',
    },
    {
      id: 'heart-disease',
      name: 'Heart Disease',
      tag: 'Cardiovascular',
      icon: HeartPulse,
      iconColor: 'bg-rose-50 text-rose-600',
      description: 'Narrowing of heart arteries that slows down normal blood circulation.',
      cause: 'Main causes: High BP, smoking, high cholesterol, lack of exercise',
    },
    {
      id: 'hypertension',
      name: 'High Blood Pressure',
      tag: 'Vascular Strain',
      icon: Gauge,
      iconColor: 'bg-amber-50 text-amber-600',
      description: 'Continuous heavy pressure on artery walls that strains your heart.',
      cause: 'Main causes: High salt intake, stress, lack of sleep, genetics',
    },
    {
      id: 'stroke',
      name: 'Stroke Risk',
      tag: 'Brain Circulation',
      icon: Brain,
      iconColor: 'bg-blue-50 text-blue-600',
      description: 'Sudden blockage or leak in blood flow carrying oxygen to the brain.',
      cause: 'Main causes: Untreated high BP, smoking, diabetes',
    },
    {
      id: 'metabolic-disease',
      name: 'Metabolic Syndrome',
      tag: 'Body Metabolism',
      icon: Scale,
      iconColor: 'bg-purple-50 text-purple-600',
      description: 'A dangerous cluster of belly fat, high glucose, and unhealthy cholesterol.',
      cause: 'Main causes: Visceral belly fat, poor diet, inactive lifestyle',
    },
  ];

  const steps = [
    {
      number: '1',
      title: 'Enter Basic Details',
      text: 'Fill simple everyday details like age, BMI, blood pressure, physical activity, and family history.',
    },
    {
      number: '2',
      title: 'Instant Analysis',
      text: 'The system instantly calculates your cumulative health score and checks your risk level.',
    },
    {
      number: '3',
      title: 'Get Results & Tips',
      text: 'See your risk level (Low, Moderate, High) and simple lifestyle habits to stay protected.',
    },
  ];

  return (
    <div className="space-y-14 sm:space-y-18 py-2">
      {/* 1. Hero Section - Simple, Clean, Friendly */}
      <section className="pt-2 sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>Quick 2-Minute Health Check</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Check Your Disease Risk in 2 Minutes
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Find out if your daily habits, blood pressure, and family medical background put you at risk for heart disease, diabetes, or stroke.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                id="btn-check-risk"
                onClick={onCheckRisk}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold px-6 py-3.5 text-base shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <span>Check Your Risk Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {!isAuthenticated ? (
                <button
                  type="button"
                  id="btn-hero-sign-in"
                  onClick={() => openAuthModal('login')}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-5 py-3.5 text-base shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>Sign In / Sign Up</span>
                </button>
              ) : (
                <span className="text-sm font-medium text-slate-600">
                  Welcome back, <strong className="text-slate-800">{user?.name}</strong>
                </span>
              )}
            </div>

            {/* 3 Simple highlights - clean unboxed text */}
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                5 Health Conditions Checked
              </span>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Takes Less Than 2 Minutes
              </span>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                100% Free &amp; Instant
              </span>
            </div>
          </div>

          {/* Right Live Sample Card */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="text-sm font-bold text-slate-900">
                  Example Assessment
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Sample Result
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Body Mass Index</div>
                  <div className="text-base font-bold text-slate-800">23.2 kg/m²</div>
                  <div className="text-emerald-600 text-[11px]">Normal Weight</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Blood Pressure</div>
                  <div className="text-base font-bold text-slate-800">120/80 mmHg</div>
                  <div className="text-emerald-600 text-[11px]">Healthy BP</div>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Calculated Risk</div>
                  <div className="text-base font-bold text-emerald-400">Low Overall Risk</div>
                  <div className="text-xs text-slate-300">Keep up your daily walking!</div>
                </div>
                <div className="text-2xl font-black text-white">91%</div>
              </div>

              <button
                type="button"
                onClick={onCheckRisk}
                className="w-full py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Check Your Own Risk Score</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 5 Conditions Section - Straightforward, Easy English */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              5 Health Conditions We Check
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Simple lifestyle factors can protect you from these common health issues.
            </p>
          </div>
          {onLearnMore && (
            <button
              type="button"
              onClick={onLearnMore}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>Learn more details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {conditions.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-all flex flex-col justify-between space-y-4 shadow-2xs"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${item.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-400">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">
                    {item.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-100 text-xs text-slate-500">
                  {item.cause}
                </div>
              </div>
            );
          })}

          {/* Direct CTA card */}
          <div className="bg-blue-600 text-white rounded-xl p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-sm inline-block">
                Start Now
              </span>
              <h3 className="font-bold text-lg text-white">
                Ready to find out your score?
              </h3>
              <p className="text-xs text-blue-100 leading-relaxed">
                Answer simple questions about exercise, diet, and habits. You get your results right away.
              </p>
            </div>

            <button
              type="button"
              onClick={onCheckRisk}
              className="w-full bg-white text-blue-700 hover:bg-blue-50 font-bold py-2.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <span>Open Prediction Form</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. How It Works - Clean 3 Steps */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="text-center max-w-md mx-auto space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            How It Works in 3 Simple Steps
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Quick, private, and straightforward.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((st) => (
            <div key={st.number} className="space-y-2 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                {st.number}
              </div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {st.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {st.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Simple Bottom CTA */}
      <section className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
        <div className="space-y-1 max-w-lg">
          <h2 className="text-lg sm:text-xl font-bold text-white">
            Take 2 minutes to check your health risk today
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            No registration required to run the test. Test with your own numbers or use sample data.
          </p>
        </div>

        <button
          type="button"
          onClick={onCheckRisk}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 text-sm shadow-sm cursor-pointer transition-colors shrink-0"
        >
          <span>Start Health Check</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* 5. Simple Medical Disclaimer */}
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-xs flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 leading-relaxed">
          <strong>Note:</strong> This tool is created for educational awareness and health guidance. It does not replace advice or tests from a qualified doctor.
        </p>
      </div>
    </div>
  );
};
