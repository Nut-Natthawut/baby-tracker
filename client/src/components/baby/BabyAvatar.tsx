import React from 'react';
import { Baby } from '@/types/baby';

interface BabyAvatarProps {
  baby: Baby | null;
  size?: 'sm' | 'md' | 'lg';
}

const sizeConfigs = {
  sm: { container: 'w-10 h-10', svg: 40 },
  md: { container: 'w-16 h-16', svg: 64 },
  lg: { container: 'w-24 h-24', svg: 96 },
};

const BabyAvatar: React.FC<BabyAvatarProps> = ({ baby, size = 'md' }) => {
  const config = sizeConfigs[size];
  
  const skinColor = '#FFDCB5';
  const cheekColor = baby?.gender === 'girl' ? '#FFB6C1' : '#FFD4A3';
  const bgGradient = baby?.gender === 'boy' 
    ? 'from-blue-400 to-blue-500' 
    : baby?.gender === 'girl' 
      ? 'from-pink-400 to-pink-500' 
      : 'from-purple-400 to-purple-500';

  return (
    <div className={`${config.container} rounded-full bg-gradient-to-br ${bgGradient} flex items-center justify-center shadow-lg overflow-hidden`}>
      <svg width={config.svg * 0.85} height={config.svg * 0.85} viewBox="0 0 80 80">
        {/* Face */}
        <circle cx="40" cy="42" r="28" fill={skinColor} />
        
        {/* Hair tuft */}
        <path 
          d="M30 18 Q35 8 40 14 Q45 8 50 18 Q48 12 40 10 Q32 12 30 18" 
          fill="#4A3728"
        />
        <ellipse cx="40" cy="16" rx="8" ry="5" fill="#4A3728" />
        
        {/* Eyes */}
        <ellipse cx="30" cy="40" rx="4" ry="5" fill="#2D2D2D" />
        <ellipse cx="50" cy="40" rx="4" ry="5" fill="#2D2D2D" />
        
        {/* Eye shine */}
        <circle cx="31" cy="39" r="1.5" fill="white" />
        <circle cx="51" cy="39" r="1.5" fill="white" />
        
        {/* Cheeks */}
        <ellipse cx="22" cy="48" rx="6" ry="4" fill={cheekColor} opacity="0.6" />
        <ellipse cx="58" cy="48" rx="6" ry="4" fill={cheekColor} opacity="0.6" />
        
        {/* Smile */}
        <path 
          d="M34 52 Q40 58 46 52" 
          stroke="#D4A574" 
          strokeWidth="2" 
          fill="none" 
          strokeLinecap="round"
        />
        
        {/* Nose */}
        <ellipse cx="40" cy="46" rx="2" ry="1.5" fill="#E8C4A0" />
      </svg>
    </div>
  );
};

export default BabyAvatar;
