
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8 w-auto',
    md: 'h-12 w-auto',
    lg: 'h-16 w-auto',
    xl: 'h-24 w-auto'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo SVG da marca Bem Ti Vê */}
      <svg 
        className={sizeClasses[size]} 
        viewBox="0 0 120 120" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Círculo principal */}
        <circle cx="60" cy="60" r="55" fill="url(#greenGradient)" stroke="#fb923c" strokeWidth="3"/>
        
        {/* Folhas decorativas */}
        <path 
          d="M30 40 Q45 25 60 40 Q55 55 40 60 Q25 55 30 40z" 
          fill="#4ade80" 
          opacity="0.8"
        />
        <path 
          d="M80 45 Q95 30 90 50 Q75 65 60 50 Q70 35 80 45z" 
          fill="#22c55e" 
          opacity="0.6"
        />
        
        {/* Texto estilizado "BTV" */}
        <text 
          x="60" 
          y="75" 
          textAnchor="middle" 
          className="fill-primary font-bold text-2xl"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          BTV
        </text>
        
        {/* Gradiente */}
        <defs>
          <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>
        </defs>
      </svg>
      
      {size !== 'sm' && (
        <div className="flex flex-col">
          <span className="text-primary font-bold text-xl leading-tight">
            Bem Ti Vê
          </span>
          <span className="text-muted-foreground text-sm">
            Gestão Culinária
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
