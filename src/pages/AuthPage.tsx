
import React, { useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import ResendConfirmationForm from '@/components/auth/ResendConfirmationForm';

type FormType = 'login' | 'register' | 'forgot' | 'resend';

const AuthPage: React.FC = () => {
  const [currentForm, setCurrentForm] = useState<FormType>('login');

  const renderForm = () => {
    switch (currentForm) {
      case 'login':
        return (
          <LoginForm
            onToggleForm={() => setCurrentForm('register')}
            onForgotPassword={() => setCurrentForm('forgot')}
            onResendConfirmation={() => setCurrentForm('resend')}
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
      case 'resend':
        return (
          <ResendConfirmationForm
            onBack={() => setCurrentForm('login')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #f3ab6b 0%, #ec6d0b 100%)',
        backgroundImage: `url('/lovable-uploads/background-orange.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay'
      }}
    >
      <div className="w-full max-w-md animate-fade-in">
        {renderForm()}
      </div>
    </div>
  );
};

export default AuthPage;
