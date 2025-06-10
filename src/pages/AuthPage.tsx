
import React, { useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

type FormType = 'login' | 'register' | 'forgot';

const AuthPage: React.FC = () => {
  const [currentForm, setCurrentForm] = useState<FormType>('login');

  const renderForm = () => {
    switch (currentForm) {
      case 'login':
        return (
          <LoginForm
            onToggleForm={() => setCurrentForm('register')}
            onForgotPassword={() => setCurrentForm('forgot')}
          />
        );
      case 'register':
        return (
          <RegisterForm
            onToggleForm={() => setCurrentForm('login')}
          />
        );
      case 'forgot':
        return (
          <ForgotPasswordForm
            onBack={() => setCurrentForm('login')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bem-ti-ve-cream via-background to-bem-ti-ve-green/10 leaves-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {renderForm()}
      </div>
    </div>
  );
};

export default AuthPage;
