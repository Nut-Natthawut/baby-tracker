import React from 'react';

interface BabyCareLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

const BabyCareLogo: React.FC<BabyCareLogoProps> = ({ className = '', size = 'md' }) => {
  const dimension = sizeMap[size];
  
  return (
    <svg 
      width={dimension} 
      height={dimension} 
      viewBox="0 0 100 100" 
      className={className}
    >
      {/* Background circle with gradient */}
      <defs>
        <linearGradient id="logoBgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(20 85% 75%)" />
          <stop offset="100%" stopColor="hsl(16 80% 65%)" />
        </linearGradient>
        <linearGradient id="faceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE4D6" />
          <stop offset="100%" stopColor="#F5D0C5" />
        </linearGradient>
      </defs>
      
      {/* Main circle background */}
      <circle cx="50" cy="50" r="48" fill="url(#logoBgGradient)" />
      
      {/* Inner glow */}
      <circle cx="50" cy="50" r="42" fill="none" stroke="white" strokeWidth="2" opacity="0.3" />
      
      {/* Baby face */}
      <g transform="translate(50, 52)">
        {/* Head */}
        <ellipse cx="0" cy="0" rx="26" ry="28" fill="url(#faceGradient)" />
        
        {/* Hair */}
        <ellipse cx="0" cy="-22" rx="18" ry="10" fill="#8B7355" />
        <circle cx="-15" cy="-18" r="6" fill="#8B7355" />
        <circle cx="15" cy="-18" r="6" fill="#8B7355" />
        
        {/* Hair curl */}
        <path 
          d="M0 -32 Q5 -40 10 -32 Q5 -36 0 -32" 
          fill="#8B7355"
        />
        <circle cx="0" cy="-30" r="4" fill="#8B7355" />
        
        {/* Ears */}
        <circle cx="-25" cy="-4" r="6" fill="#F5D0C5" />
        <circle cx="25" cy="-4" r="6" fill="#F5D0C5" />
        
        {/* Cheeks */}
        <ellipse cx="-16" cy="6" rx="6" ry="4" fill="#FFCCBC" opacity="0.8" />
        <ellipse cx="16" cy="6" rx="6" ry="4" fill="#FFCCBC" opacity="0.8" />
        
        {/* Eyes */}
        <ellipse cx="-9" cy="-4" rx="4" ry="5" fill="#3D3D3D" />
        <ellipse cx="9" cy="-4" rx="4" ry="5" fill="#3D3D3D" />
        
        {/* Eye shine */}
        <circle cx="-7.5" cy="-5.5" r="1.5" fill="white" />
        <circle cx="10.5" cy="-5.5" r="1.5" fill="white" />
        
        {/* Smile */}
        <path 
          d="M-8 10 Q0 18 8 10" 
          stroke="#E88B8B" 
          strokeWidth="2.5" 
          fill="none" 
          strokeLinecap="round" 
        />
      </g>
      
      {/* Decorative hearts */}
      <g fill="#FF9AA2" opacity="0.9">
        <path d="M18 20 C18 18, 15 15, 12 18 C9 15, 6 18, 6 20 C6 24, 12 28, 12 28 C12 28, 18 24, 18 20" transform="scale(0.5) translate(140, 30)" />
        <path d="M18 20 C18 18, 15 15, 12 18 C9 15, 6 18, 6 20 C6 24, 12 28, 12 28 C12 28, 18 24, 18 20" transform="scale(0.4) translate(35, 50)" />
      </g>
    </svg>
  );
};

export default BabyCareLogo;
