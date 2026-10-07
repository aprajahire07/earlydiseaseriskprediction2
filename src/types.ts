export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  age?: number;
  gender?: string;
  phone?: string;
  lifestyleNotes?: string;
  syncedToSupabase?: boolean;
}

export interface DiseasePredictionItem {
  disease: string;
  probability: number;
  percentage: number;
  percentageFormatted: string;
  riskCategory?: 'Low' | 'Moderate' | 'High';
  source: 'render_ml';
  rawLabel?: string;
}

export interface SavedAssessment {
  id: string;
  userId: string;
  fullName?: string;
  date: string;
  disease: string;
  riskLevel: 'Low' | 'Moderate' | 'High';
  probability: number;
  healthIndex?: number;
  bmi: number;
  bloodPressure: string;
  physicalActivity: string;
  smoking: string;
  alcohol: string;
  familyHistory: string;
  bloodSugarLevel?: string;
  recommendations: string[];
  checkedAreas?: string[];
  isSample?: boolean;
  predictions?: DiseasePredictionItem[];
  condition_results?: Record<string, number>;
  rawRenderResponse?: any;
}
