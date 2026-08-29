import React from 'react';
import { LoginScreen } from '../components/LoginScreen';

interface LoginPageProps {
  onBack?: () => void;
  onNavigatePage: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBack, onNavigatePage }) => {
  return (
    <LoginScreen
      onBack={onBack}
      onNavigatePage={onNavigatePage}
    />
  );
};

export default LoginPage;
