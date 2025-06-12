
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
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #f3ab6b 0%, #ec6d0b 100%)',
        backgroundImage: `url('/lovable-uploads/932eb294-c398-43ec-b416-1c3497d2d648.png')`,
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
