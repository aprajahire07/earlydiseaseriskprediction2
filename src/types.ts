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

export interface SavedAssessment {
  id: string;
  userId: string;
  date: string;
  disease: string;
  riskLevel: 'Low' | 'Moderate' | 'High';
  probability: number;
  bmi: number;
  bloodPressure: string;
  physicalActivity: string;
  smoking: string;
  alcohol: string;
  familyHistory: string;
  recommendations: string[];
}
