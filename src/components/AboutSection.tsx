import React, { useState } from 'react';

export const AboutSection: React.FC = () => {
  const [selectedDisease, setSelectedDisease] = useState<string>('all');

  const diseases = [
    {
      id: 'diabetes',
      name: '1. Diabetes (Type 2 Diabetes)',
      badge: 'Metabolic & Glycemic Health',
      intro: 'A chronic condition that impairs how your body turns food into energy.',
      whatIsIt:
        'Diabetes occurs when the pancreas cannot produce enough insulin, or the body cannot effectively utilize the insulin it produces. This causes sugar (glucose) to build up in the bloodstream instead of fueling your cells.',
      riskFactors: [
        'High BMI (overweight or obesity)',
        'Sedentary lifestyle with low physical activity',
        'Unhealthy diet rich in refined sugars and processed carbohydrates',
        'Age 45 or older',
        'Family medical history of diabetes',
      ],
      symptoms: [
        'Frequent urination, especially at night',
        'Excessive thirst and dry mouth',
        'Unexplained weight loss or persistent fatigue',
        'Slow-healing cuts and blurred vision',
      ],
      whyEarlyDetection:
        'Estimating risk early helps catch prediabetes in its reversible stages. With prompt lifestyle adjustments, people can avoid permanent nerve damage, kidney disease, vision loss, and cardiovascular complications.',
      prevention:
        'Eat a balanced diet rich in fiber and whole grains, engage in at least 30 minutes of daily exercise, maintain a healthy weight, and perform routine fasting blood sugar or HbA1c screenings.',
    },
    {
      id: 'heart-disease',
      name: '2. Heart Disease (Cardiovascular Disease)',
      badge: 'Cardiovascular Health',
      intro: 'A range of conditions affecting the structure and blood vessels of the heart.',
      whatIsIt:
        'Heart disease most commonly involves coronary artery disease, where fatty deposits (plaque) build up inside the arteries that supply blood to the heart muscle, narrowing blood flow over time.',
      riskFactors: [
        'Elevated blood pressure and high LDL cholesterol',
        'Active tobacco smoking or exposure to secondhand smoke',
        'Physical inactivity and chronic psychological stress',
        'Excess body weight and abdominal fat',
        'Genetic predisposition and family history of early heart attacks',
      ],
      symptoms: [
        'Chest tightness, pressure, or aching discomfort (angina)',
        'Shortness of breath during mild exertion',
        'Pain radiating to the left arm, neck, jaw, or upper back',
        'Dizziness, unexplained cold sweats, or chronic fatigue',
      ],
      whyEarlyDetection:
        'Cardiovascular damage accumulates silently over decades. Recognizing elevated risk early allows timely interventions before a critical event such as a heart attack or heart failure occurs.',
      prevention:
        'Adopt a heart-healthy Mediterranean diet low in saturated and trans fats, quit smoking, manage daily stress, exercise regularly, and schedule regular lipid profile and blood pressure checks.',
    },
    {
      id: 'hypertension',
      name: '3. Hypertension (High Blood Pressure)',
      badge: 'Vascular Health',
      intro: 'A widespread vascular condition where blood pushes against artery walls too forcefully.',
      whatIsIt:
        'Blood pressure is the measure of the force of circulating blood against the walls of the arteries. Hypertension occurs when this pressure remains persistently elevated (at or above 130/80 mmHg), causing the heart to work harder.',
      riskFactors: [
        'High dietary sodium (salt) consumption',
        'Lack of routine aerobic physical exercise',
        'High alcohol intake and frequent smoking',
        'Excess weight and untreated sleep apnea',
        'Advancing age and family history of high blood pressure',
      ],
      symptoms: [
        'Often called a "silent killer" because it typically produces no noticeable warning signs.',
        'In very severe cases: morning headaches, dizziness, nosebleeds, or blurred vision.',
      ],
      whyEarlyDetection:
        'Because high blood pressure is symptomless in its initial stages, early risk screening detects rising arterial tension before it causes irreversible damage to the heart, brain, kidneys, and eyes.',
      prevention:
        'Reduce sodium intake to under 2,000 mg per day, eat potassium-rich foods (fruits and vegetables), limit alcohol, practice relaxation techniques, and check your blood pressure twice a month.',
    },
    {
      id: 'metabolic-disease',
      name: '4. Metabolic Disease (Metabolic Syndrome)',
      badge: 'Systemic Health',
      intro: 'A cluster of simultaneous metabolic abnormalities that compound long-term health risks.',
      whatIsIt:
        'Metabolic syndrome is a collection of interrelated risk factors—including excess abdominal waist circumference, elevated fasting blood sugar, high blood pressure, and abnormal blood lipids (high triglycerides and low HDL cholesterol)—occurring together in an individual.',
      riskFactors: [
        'Abdominal (visceral) obesity and high waist-to-hip ratio',
        'Underlying insulin resistance',
        'Sedentary desk jobs with minimal daily movement',
        'Diets dominated by ultra-processed foods and sweetened beverages',
        'Hormonal imbalances and genetic background',
      ],
      symptoms: [
        'A large waist measurement (apple-shaped body type)',
        'Post-meal lethargy and mid-day energy crashes',
        'Frequent cravings for sugary or high-carbohydrate foods',
        'Skin tags or darkened skin patches around the neck and armpits',
      ],
      whyEarlyDetection:
        'Having metabolic syndrome multiplies your chances of developing type 2 diabetes by five times and heart disease by three times. Early identification provides a clear window to reverse metabolic dysfunction naturally.',
      prevention:
        'Combine calorie-conscious whole-food meals with resistance and aerobic training, avoid sugary drinks, prioritize 7–8 hours of quality sleep, and undergo annual routine metabolic blood panels.',
    },
    {
      id: 'stroke',
      name: '5. Stroke (Cerebrovascular Disease)',
      badge: 'Neurological & Cerebrovascular Health',
      intro: 'A critical medical emergency where blood supply to the brain is suddenly compromised.',
      whatIsIt:
        'A stroke occurs when a blood vessel supplying oxygen and nutrients to the brain is either blocked by a blood clot (ischemic stroke) or bursts open (hemorrhagic stroke). Without oxygen, brain cells begin to die within minutes.',
      riskFactors: [
        'Uncontrolled chronic high blood pressure (the single biggest risk factor)',
        'Cigarette smoking, which damages blood vessel linings and thickens blood',
        'High cholesterol and carotid artery plaque buildup',
        'Unmanaged diabetes and cardiovascular arrhythmias (such as atrial fibrillation)',
        'Obesity and lack of regular physical activity',
      ],
      symptoms: [
        'Face drooping or uneven smile on one side',
        'Arm weakness or numbness when lifting both arms',
        'Slurred speech or difficulty understanding spoken words',
        'Sudden loss of balance, dizziness, or acute severe headache',
      ],
      whyEarlyDetection:
        'Up to 80% of strokes are preventable when underlying risk factors—particularly hypertension and arterial stiffness—are identified early and controlled before a vascular rupture or clot occurs.',
      prevention:
        'Keep blood pressure within normal ranges (< 120/80 mmHg), quit all tobacco products, manage blood sugar levels, consume antioxidant-rich foods, and attend regular cardiovascular and carotid screenings.',
    },
  ];

  const filteredDiseases =
    selectedDisease === 'all'
      ? diseases
      : diseases.filter((d) => d.id === selectedDisease);

  return (
    <div className="space-y-6">
      {/* 1. Introductory Overview Box */}
      <div className="border border-slate-200 rounded-xl p-5 sm:p-7 bg-white shadow-xs space-y-3">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center justify-between">
          <span>About Our Disease Prediction System</span>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
            Educational ML
          </span>
        </h1>
        <p className="text-sm text-slate-700 leading-relaxed">
          Our platform uses machine learning models to estimate the personal risk profile of five major chronic health conditions—<strong>Diabetes</strong>, <strong>Heart Disease</strong>, <strong>Hypertension</strong>, <strong>Metabolic Disease</strong>, and <strong>Stroke</strong>—based on user-provided lifestyle parameters and medical background.
        </p>
        <p className="text-sm text-slate-700 leading-relaxed">
          By examining non-invasive indicators such as Body Mass Index (BMI), blood pressure stages, physical exercise habits, smoking and alcohol patterns, and family medical heredity, our system highlights potential vulnerability factors early. The goal is to empower users with proactive health awareness, encourage timely physician consultations, and support positive lifestyle choices before chronic conditions progress.
        </p>
      </div>

      {/* 2. Target Diseases Section */}
      <div className="border border-slate-200 rounded-xl p-5 sm:p-7 bg-white shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Understanding the 5 Diseases We Analyze
            </h2>
            <p className="text-xs text-slate-500">
              Educational guides on each condition, common risk triggers, symptoms, and preventive actions.
            </p>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setSelectedDisease('all')}
              className={`px-3 py-1 rounded-md border cursor-pointer font-medium transition-all ${
                selectedDisease === 'all'
                  ? 'bg-blue-600 text-white border-blue-700 font-bold shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              All (5)
            </button>
            {diseases.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDisease(d.id)}
                className={`px-2.5 py-1 rounded-md border cursor-pointer font-medium transition-all ${
                  selectedDisease === d.id
                    ? 'bg-blue-600 text-white border-blue-700 font-bold shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {d.name.split('.')[1].split('(')[0].trim()}
              </button>
            ))}
          </div>
        </div>

        {/* Diseases List Cards */}
        <div className="space-y-4 pt-1">
          {filteredDiseases.map((d) => (
            <div
              key={d.id}
              className="border border-slate-200 rounded-xl bg-white p-4 sm:p-5 space-y-3 hover:border-slate-300 transition-colors shadow-2xs"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-slate-100 pb-2">
                <h3 className="text-base font-bold text-slate-900">
                  {d.name}
                </h3>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                  {d.badge}
                </span>
              </div>

              {/* Short Intro */}
              <p className="text-xs sm:text-sm text-slate-700 font-medium italic">
                {d.intro}
              </p>

              {/* What Is It */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
                  What is it?
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {d.whatIsIt}
                </p>
              </div>

              {/* Risk Factors & Symptoms Two-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {/* Risk Factors */}
                <div className="border border-slate-200 rounded-lg bg-slate-50/70 p-3">
                  <h5 className="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
                    Common Risk Factors
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                    {d.riskFactors.map((rf, idx) => (
                      <li key={idx} className="leading-snug">
                        {rf}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Common Symptoms */}
                <div className="border border-slate-200 rounded-lg bg-slate-50/70 p-3">
                  <h5 className="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                    Common Symptoms
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                    {d.symptoms.map((sym, idx) => (
                      <li key={idx} className="leading-snug">
                        {sym}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Why Early Detection Matters */}
              <div className="border-t border-slate-100 pt-2 text-xs sm:text-sm">
                <span className="font-bold text-slate-800">
                  Why Early Detection Matters:{' '}
                </span>
                <span className="text-slate-700 leading-relaxed">
                  {d.whyEarlyDetection}
                </span>
              </div>

              {/* How Lifestyle and Checkups Help */}
              <div className="border-t border-slate-100 pt-2 text-xs sm:text-sm">
                <span className="font-bold text-slate-800">
                  Prevention & Checkups:{' '}
                </span>
                <span className="text-slate-700 leading-relaxed">
                  {d.prevention}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Project Context & Objectives Box */}
      <div className="border border-slate-200 rounded-xl p-5 sm:p-7 bg-white shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-1">
          Project Architecture &amp; Objective
        </h2>
        <p className="text-sm text-slate-700 leading-relaxed">
          The goal of this initiative is to identify how non-clinical lifestyle parameters interact with hereditary history to influence vulnerability to chronic diseases.
        </p>
        <div className="border border-slate-200 rounded-lg bg-slate-50 p-4 text-xs text-slate-700 space-y-2">
          <p>
            <strong>Step 1:</strong> User enters standard lifestyle metrics (BMI, blood pressure level, smoking, alcohol, exercise frequency, and family medical background).
          </p>
          <p>
            <strong>Step 2:</strong> Data is formatted into standardized feature vectors.
          </p>
          <p>
            <strong>Step 3:</strong> Machine learning algorithms evaluate risk probabilities for target conditions.
          </p>
          <p>
            <strong>Step 4:</strong> The interface delivers a risk level breakdown along with lifestyle recommendations.
          </p>
        </div>
      </div>

      {/* 4. Required Medical Disclaimer */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 space-y-1">
        <div className="font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
          <span>Medical Disclaimer</span>
        </div>
        <p className="leading-relaxed text-slate-700 text-[11px]">
          The predictions provided by this platform are for educational and informational purposes only and should not be considered a medical diagnosis. Users should consult a qualified healthcare professional for proper evaluation and medical advice.
        </p>
      </div>
    </div>
  );
};

