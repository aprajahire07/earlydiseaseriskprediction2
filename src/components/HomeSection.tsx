import React, { useState } from 'react';
import {
  HeartPulse,
  Activity,
  Gauge,
  Brain,
  Scale,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
  Compass,
  Check,
  ChevronRight,
  Info,
  TrendingUp,
  X,
  Flame,
  Stethoscope,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HomeSectionProps {
  onCheckRisk: () => void;
  onLearnMore?: () => void;
  onNavigateToAuth?: () => void;
}

interface ConditionModalInfo {
  number: string;
  name: string;
  sub: string;
  description: string;
  indicators: string[];
  prevention: string;
}

export const HomeSection: React.FC<HomeSectionProps> = ({
  onCheckRisk,
  onLearnMore,
  onNavigateToAuth,
}) => {
  const { isAuthenticated, user, openAuthModal } = useAuth();
  const [selectedCondition, setSelectedCondition] = useState<ConditionModalInfo | null>(null);

  const conditions = [
    {
      number: '01',
      id: 'diabetes',
      name: 'Type 2 Diabetes',
      sub: 'Blood sugar & metabolic health',
      icon: Activity,
      iconBg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      description: 'How your body handles insulin and daily sugar. High blood sugar can develop quietly over years.',
      indicators: ['Body Mass Index (BMI)', 'Sugar & refined carbs in diet', 'Daily activity level', 'Family diabetes history'],
      prevention: 'Balanced meals with fiber, 30 minutes of daily movement, maintaining healthy body weight.',
    },
    {
      number: '02',
      id: 'heart-disease',
      name: 'Heart Health',
      sub: 'Heart and circulation',
      icon: HeartPulse,
      iconBg: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
      description: 'Blood flow through arteries to your heart muscle. Plaque buildup can strain circulation over time.',
      indicators: ['Blood pressure category', 'Smoking & tobacco habit', 'Cholesterol level history', 'Sedentary routine'],
      prevention: 'Regular cardio walking, smoke-free lifestyle, heart-healthy unsaturated fats.',
    },
    {
      number: '03',
      id: 'hypertension',
      name: 'Blood Pressure',
      sub: 'Pressure inside your arteries',
      icon: Gauge,
      iconBg: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      description: 'The continuous pressure exerted on blood vessel walls. Often has zero symptoms until checked.',
      indicators: ['Resting blood pressure', 'Sodium & salt intake', 'Sleep quality & stress', 'Family hypertension'],
      prevention: 'Lower sodium intake, stress relief, aerobic exercise, periodic BP cuff checks.',
    },
    {
      number: '04',
      id: 'stroke',
      name: 'Stroke Risk',
      sub: 'Brain blood-flow health',
      icon: Brain,
      iconBg: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      description: 'Sustained oxygen and blood supply to brain cells. Strongly connected to unmanaged blood pressure.',
      indicators: ['High blood pressure history', 'Smoking & alcohol habits', 'Arterial stiffness', 'Age & genetics'],
      prevention: 'Managing BP within target ranges, healthy circulation, avoiding tobacco.',
    },
    {
      number: '05',
      id: 'metabolic-disease',
      name: 'Metabolic Health',
      sub: 'Weight, cholesterol & metabolism',
      icon: Scale,
      iconBg: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      description: 'A cluster of waist measurement, lipid balances, and energy regulation that influences overall vitality.',
      indicators: ['Waist circumference / BMI', 'Triglycerides & HDL markers', 'Physical inactivity', 'Insulin sensitivity'],
      prevention: 'Whole unprocessed foods, strength and cardio exercise, quality restorative sleep.',
    },
  ];

  const scrollToHowItWorks = () => {
    const el = document.getElementById('section-how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-20 sm:space-y-28 py-4">
      {/* 1. HERO SECTION */}
      <section className="relative pt-2 sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Small Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/80 border border-blue-200/60 backdrop-blur-md shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="text-[11px] sm:text-xs font-bold tracking-wider text-blue-800 uppercase">
                Preventive Health Intelligence
              </span>
            </div>

            {/* Large Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Understand Your Health Risk{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Before It Becomes a Problem.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-normal">
              Answer a few simple questions about your lifestyle, vital signs and family history to get an easy-to-understand health risk assessment.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                type="button"
                id="btn-hero-check-risk"
                onClick={onCheckRisk}
                className="group inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              >
                <span>Check My Health Risk</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                id="btn-hero-explore"
                onClick={scrollToHowItWorks}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl glass-panel glass-panel-hover text-slate-700 font-semibold text-base border border-white/80 cursor-pointer shadow-xs"
              >
                <span>Explore How It Works</span>
              </button>
            </div>

            {/* Trust Line */}
            <div className="pt-2 flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500">
              <span className="flex items-center gap-1.5 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                2-minute assessment
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Non-invasive
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-700">Educational</span>
            </div>
          </div>

          {/* Right Column: Floating Glass Health Snapshot Card */}
          <div className="lg:col-span-5 relative">
            {/* Ambient decorative glow behind snapshot */}
            <div className="absolute -inset-2 bg-gradient-to-tr from-blue-400/20 via-indigo-400/15 to-teal-400/20 rounded-3xl blur-2xl -z-10"></div>

            <div className="glass-panel rounded-3xl p-6 sm:p-7 shadow-xl border border-white/90 relative overflow-hidden space-y-6">
              {/* Header with Sample Badge */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
                    <HeartPulse className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                      Health Snapshot
                    </h2>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Multi-parameter correlation
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-bold text-slate-600 bg-slate-100/90 border border-slate-200/80 px-2.5 py-1 rounded-full">
                  Sample Assessment
                </span>
              </div>

              {/* Example Snapshot Parameters */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/60 border border-white/80 text-xs">
                  <span className="text-slate-500 font-medium">BMI</span>
                  <span className="font-bold text-slate-800">23.4 <span className="text-[11px] font-normal text-emerald-600 font-medium">(Healthy)</span></span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/60 border border-white/80 text-xs">
                  <span className="text-slate-500 font-medium">Blood Pressure</span>
                  <span className="font-bold text-slate-800">118/76 <span className="text-[11px] font-normal text-emerald-600 font-medium">(Optimal)</span></span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/60 border border-white/80 text-xs">
                  <span className="text-slate-500 font-medium">Exercise</span>
                  <span className="font-bold text-slate-800">180 min/week</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/60 border border-white/80 text-xs">
                  <span className="text-slate-500 font-medium">Family History</span>
                  <span className="font-bold text-slate-800">Moderate</span>
                </div>
              </div>

              {/* Large Score Ring Visual */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white flex items-center justify-between shadow-md">
                <div className="space-y-0.5">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                    Low Current Risk
                  </div>
                  <div className="text-base font-extrabold text-white">
                    Healthy Lifestyle Pattern
                  </div>
                  <div className="text-[11px] text-slate-400">
                    5 of 5 key markers in balance
                  </div>
                </div>

                {/* Ring visualization with glowing circle */}
                <div className="relative flex items-center justify-center shrink-0">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                      strokeDasharray="89, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-sm font-black text-white leading-none">89</span>
                    <span className="text-[8px] text-emerald-400 font-bold uppercase">Index</span>
                  </div>
                </div>
              </div>

              {/* Try Form CTA */}
              <button
                type="button"
                onClick={onCheckRisk}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-50/80 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-blue-200/60"
              >
                <span>Calculate Your Own Health Parameters</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST / VALUE STRIP */}
      <section className="relative">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="glass-panel glass-panel-hover rounded-2xl p-4 sm:p-5 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">5</div>
              <div className="text-xs font-semibold text-slate-700">Health Conditions</div>
              <div className="text-[11px] text-slate-500">Comprehensive coverage</div>
            </div>
          </div>

          <div className="glass-panel glass-panel-hover rounded-2xl p-4 sm:p-5 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">2 min</div>
              <div className="text-xs font-semibold text-slate-700">Assessment</div>
              <div className="text-[11px] text-slate-500">Quick non-invasive check</div>
            </div>
          </div>

          <div className="glass-panel glass-panel-hover rounded-2xl p-4 sm:p-5 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">Lifestyle</div>
              <div className="text-xs font-semibold text-slate-700">Based Analysis</div>
              <div className="text-[11px] text-slate-500">Habits, BP &amp; vitals</div>
            </div>
          </div>

          <div className="glass-panel glass-panel-hover rounded-2xl p-4 sm:p-5 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">Private</div>
              <div className="text-xs font-semibold text-slate-700">&amp; Non-Invasive</div>
              <div className="text-[11px] text-slate-500">No lab samples required</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CONDITIONS SECTION */}
      <section id="section-conditions" className="space-y-8 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Target Health Domains</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Five Areas of Your Health We Look At
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              We combine everyday health information to identify patterns that may deserve attention.
            </p>
          </div>

          {onLearnMore && (
            <button
              type="button"
              onClick={onLearnMore}
              className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer shrink-0"
            >
              <span>Explore full details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 5 Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {conditions.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="glass-panel glass-panel-hover rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 relative overflow-hidden group border border-white/90 shadow-sm"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                      {item.number}
                    </span>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${item.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      {item.sub}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => setSelectedCondition(item)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-all cursor-pointer group-hover:translate-x-0.5"
                  >
                    <span>What we look at</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* 6th Card: Quick Action Tile */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-600/20">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center border border-white/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Check Your Own Score
                </h3>
                <p className="text-xs sm:text-sm text-blue-100 mt-1 leading-relaxed">
                  Evaluate all 5 health domains in under two minutes with our intuitive assessment.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onCheckRisk}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
            >
              <span>Start Health Check</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. STANDOUT PERSONAL RISK CTA (Dark Glass Card) */}
      <section className="relative">
        <div className="glass-dark rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl border border-white/10">
          {/* Subtle ambient lighting inside dark card */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant Personal Assessment</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Curious About Your Own Health Risk?
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl font-normal">
                Answer a few simple questions and get a personalized risk overview in about 2 minutes.
              </p>

              {/* 5 Checked Items */}
              <div className="pt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs sm:text-sm font-semibold text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Lifestyle
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Blood pressure
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  BMI
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Exercise
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Family history
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <button
                type="button"
                id="btn-dark-cta-check"
                onClick={onCheckRisk}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.99] transition-all cursor-pointer"
              >
                <span>Start My Health Check</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {onNavigateToAuth && !isAuthenticated && (
                <button
                  type="button"
                  onClick={onNavigateToAuth}
                  className="w-full py-3.5 px-5 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-white/15 transition-colors cursor-pointer"
                >
                  <span>Sign In to Save History</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section id="section-how-it-works" className="space-y-10 scroll-mt-24">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
            <span>Simple Workflow</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Your Health Check in 3 Simple Steps
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-normal">
            Easy, clear steps designed for normal everyday understanding.
          </p>
        </div>

        {/* 3 Steps Timeline with Connecting line */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Step 1 */}
          <div className="glass-panel glass-panel-hover rounded-3xl p-6 sm:p-7 space-y-4 relative border border-white/90">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-blue-600/25">
                01
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Step 1
              </span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Tell Us About You
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-normal">
                Share simple information about your lifestyle, body measurements and family history.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="glass-panel glass-panel-hover rounded-3xl p-6 sm:p-7 space-y-4 relative border border-white/90">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-indigo-600/25">
                02
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Step 2
              </span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                We Look for Patterns
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-normal">
                Our system compares the information to known health risk patterns.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="glass-panel glass-panel-hover rounded-3xl p-6 sm:p-7 space-y-4 relative border border-white/90">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-teal-600/25">
                03
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Step 3
              </span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Get Your Risk Overview
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-normal">
                See your risk level and practical steps that may help you stay healthier.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. HEALTH BENCHMARKS (Simple Numbers Worth Knowing) */}
      <section className="space-y-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Target Indicators</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Simple Numbers Worth Knowing
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Standard health targets that make it easier to understand your assessment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: BMI */}
          <div className="glass-panel glass-panel-hover rounded-3xl p-6 space-y-4 border border-white/90">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Body Mass Index</span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">Optimal</span>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                18.5 – 24.9
              </div>
              <div className="text-xs font-semibold text-slate-600 mt-0.5">
                Healthy weight range
              </div>
            </div>
            {/* Visual mini indicator bar */}
            <div className="space-y-1.5 pt-1">
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden flex">
                <div className="w-[30%] bg-blue-300"></div>
                <div className="w-[45%] bg-emerald-500"></div>
                <div className="w-[25%] bg-amber-400"></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>Underweight</span>
                <span className="font-bold text-emerald-600">Healthy Range</span>
                <span>Elevated</span>
              </div>
            </div>
          </div>

          {/* Card 2: Blood Pressure */}
          <div className="glass-panel glass-panel-hover rounded-3xl p-6 space-y-4 border border-white/90">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Blood Pressure</span>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">Normotensive</span>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                Below 120/80
              </div>
              <div className="text-xs font-semibold text-slate-600 mt-0.5">
                Typical healthy target (mmHg)
              </div>
            </div>
            {/* Visual mini indicator bar */}
            <div className="space-y-1.5 pt-1">
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden flex">
                <div className="w-[50%] bg-emerald-500"></div>
                <div className="w-[25%] bg-amber-400"></div>
                <div className="w-[25%] bg-rose-500"></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span className="font-bold text-emerald-600">&lt; 120/80</span>
                <span>Elevated</span>
                <span>High BP</span>
              </div>
            </div>
          </div>

          {/* Card 3: Exercise */}
          <div className="glass-panel glass-panel-hover rounded-3xl p-6 space-y-4 border border-white/90">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Exercise</span>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">Target</span>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                150+ min
              </div>
              <div className="text-xs font-semibold text-slate-600 mt-0.5">
                Recommended activity per week
              </div>
            </div>
            {/* Visual mini indicator bar */}
            <div className="space-y-1.5 pt-1">
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden flex">
                <div className="w-[25%] bg-slate-300"></div>
                <div className="w-[35%] bg-blue-400"></div>
                <div className="w-[40%] bg-teal-500"></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>0 min</span>
                <span>75 min</span>
                <span className="font-bold text-teal-600">150+ mins</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. INSIGHT CARDS */}
      <section className="space-y-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
            <Info className="w-3.5 h-3.5" />
            <span>Health Insights</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Why Early Awareness Matters
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Insight 1 */}
          <div className="glass-panel glass-panel-hover rounded-3xl p-6 sm:p-7 space-y-4 border border-white/90 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Many Health Risks Can Be Reduced
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Up to 80% of common heart issues and type 2 diabetes risks are linked to modifiable habits like diet, daily activity, and sleep.
              </p>
            </div>
            <button
              type="button"
              onClick={onCheckRisk}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer pt-2"
            >
              <span>Learn more</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Insight 2 */}
          <div className="glass-panel glass-panel-hover rounded-3xl p-6 sm:p-7 space-y-4 border border-white/90 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Some Risks Stay Quiet
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Conditions such as elevated blood pressure rarely cause obvious symptoms early on. Checking numbers uncovers quiet strains early.
              </p>
            </div>
            <button
              type="button"
              onClick={onCheckRisk}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer pt-2"
            >
              <span>Learn more</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Insight 3 */}
          <div className="glass-panel glass-panel-hover rounded-3xl p-6 sm:p-7 space-y-4 border border-white/90 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Small Habits Can Make a Difference
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Modest adjustments — brisk 20-minute daily walks, drinking water, and managing sodium — deliver compound long-term protection.
              </p>
            </div>
            <button
              type="button"
              onClick={onCheckRisk}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer pt-2"
            >
              <span>Learn more</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section className="relative">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-5 border border-white/90 shadow-xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-indigo-50/40 to-teal-50/50 pointer-events-none -z-10"></div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Know Your Risk.{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Take the Next Step.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed font-normal">
            A quick assessment can help you understand which everyday health factors deserve more attention.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              id="btn-final-cta-check"
              onClick={onCheckRisk}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              <span>Start Health Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Takes about 2 minutes • No personal identification needed
          </div>
        </div>
      </section>

      {/* 9. MEDICAL DISCLAIMER */}
      <div className="glass-panel-subtle rounded-2xl p-4 sm:p-5 flex items-start gap-3 border border-white/80 max-w-3xl mx-auto">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="text-xs font-bold text-slate-800">
            Educational tool
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-normal">
            This assessment is designed to help you understand general health risk patterns. It is not a medical diagnosis or a replacement for professional medical advice.
          </p>
        </div>
      </div>

      {/* Condition Details Modal (What we look at) */}
      {selectedCondition && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedCondition(null)}
        >
          <div
            className="relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/90 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-blue-600">
                  {selectedCondition.number}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedCondition.name}
                  </h3>
                  <p className="text-xs font-medium text-slate-500">
                    {selectedCondition.sub}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCondition(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {selectedCondition.description}
            </p>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                What Our Assessment Checks:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {selectedCondition.indicators.map((ind, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-white/70 border border-white/80">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="font-medium text-slate-700">{ind}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Healthy Habit Focus</span>
              </div>
              <p className="text-blue-800 leading-relaxed">
                {selectedCondition.prevention}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedCondition(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedCondition(null);
                  onCheckRisk();
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Check My Risk Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
