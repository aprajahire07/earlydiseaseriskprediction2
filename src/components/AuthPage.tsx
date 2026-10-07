import React from 'react';
import { MyHealthDashboard } from './MyHealthDashboard';

interface AuthPageProps {
  onNavigateToForm?: () => void;
}

/**
 * Re-export MyHealthDashboard as AuthPage for backwards compatibility
 * Complete removal of technical Supabase administration UI
 */
export const AuthPage: React.FC<AuthPageProps> = ({ onNavigateToForm }) => {
  return <MyHealthDashboard onNavigateToForm={onNavigateToForm || (() => {})} />;
};
