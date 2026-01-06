import React, { useState, useEffect } from 'react';

interface CuteBabyAvatarProps {
  mood?: 'happy' | 'sleeping';
  skinColor?: string;
  size?: 'sm' | 'md' | 'lg';
  gender?: 'boy' | 'girl';
}

const sizeConfigs = {
  sm: { container: 160, svg: 100 },
  md: { container: 220, svg: 140 },
  lg: { container: 280, svg: 180 },
};

const CuteBabyAvatar: React.FC<CuteBabyAvatarProps> = ({ 
  mood = 'happy', 
  skinColor = '#F5D0C5',
  size = 'md',
  gender = 'boy'
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const config = sizeConfigs[size];

  // Logic สำหรับทำให้ตากระพริบอัตโนมัติ
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 4000);

    return () => clearInterval(blinkInterval);
  }, []);

  // สีฟ้าสำหรับผู้ชาย, ชมพูสำหรับผู้หญิง
  const bgColor = gender === 'boy' 
    ? 'hsl(210 80% 80%)' // ฟ้าอ่อน
    : 'hsl(340 80% 85%)'; // ชมพูอ่อน
  
  const diaperColor = gender === 'boy'
    ? '#60A5FA' // ฟ้า
    : '#F472B6'; // ชมพู

  const cheekColor = gender === 'boy'
    ? '#93C5FD' // ฟ้าแก้ม
    : '#FBCFE8'; // ชมพูแก้ม

  return (
    <div 
      className="relative flex items-center justify-center"
      style={{ width: config.container, height: config.container }}
    >
      {/* วงกลมพื้นหลัง (Glow Effect) */}
      <div 
        className="absolute rounded-full opacity-60 animate-pulse"
        style={{ 
          width: config.container * 0.9, 
          height: config.container * 0.9,
          background: `radial-gradient(circle, ${bgColor} 0%, transparent 70%)`
        }}
      />

      {/* ตัว SVG น้องเด็ก */}
      <svg 
        width={config.svg} 
        height={config.svg * 1.3} 
        viewBox="0 0 100 130"
        className="relative z-10"
        style={{ animation: 'float 3s ease-in-out infinite' }}
      >
        {/* --- ส่วนลำตัว (Body) --- */}
        {/* ขาซ้าย */}
        <ellipse cx="38" cy="115" rx="10" ry="14" fill={skinColor} />
        {/* ขาขวา */}
        <ellipse cx="62" cy="115" rx="10" ry="14" fill={skinColor} />
        {/* แขนซ้าย */}
        <ellipse cx="22" cy="80" rx="8" ry="14" fill={skinColor} transform="rotate(-20 22 80)" />
        {/* แขนขวา */}
        <ellipse cx="78" cy="80" rx="8" ry="14" fill={skinColor} transform="rotate(20 78 80)" />
        {/* ลำตัวหลัก */}
        <ellipse cx="50" cy="85" rx="28" ry="30" fill={skinColor} />
        
        {/* ผ้าอ้อม (Diaper) */}
        <ellipse cx="50" cy="98" rx="24" ry="18" fill={diaperColor} />
        <ellipse cx="50" cy="95" rx="22" ry="14" fill="white" opacity="0.3" />

        {/* --- ส่วนหัว (Head) --- */}
        {/* หูซ้าย */}
        <circle cx="22" cy="42" r="8" fill={skinColor} />
        {/* หูขวา */}
        <circle cx="78" cy="42" r="8" fill={skinColor} />
        {/* หน้า */}
        <ellipse cx="50" cy="45" rx="30" ry="32" fill={skinColor} />
        
        {/* ผม (Hair Swirl) */}
        <path 
          d="M50 13 Q55 5 60 15 Q50 8 45 15 Q48 7 50 13" 
          fill="#5D4037"
          stroke="#5D4037"
          strokeWidth="2"
        />
        <circle cx="50" cy="18" r="5" fill="#5D4037" />

        {/* หน้าตา (Face Features) */}
        {/* แก้มแดง */}
        <ellipse cx="28" cy="52" rx="8" ry="5" fill={cheekColor} opacity="0.7" />
        <ellipse cx="72" cy="52" rx="8" ry="5" fill={cheekColor} opacity="0.7" />

        {/* ตา (Eyes) - มี Logic กระพริบ */}
        {isBlinking ? (
          // ตาปิด
          <g>
            <path d="M36 42 Q40 46 44 42" stroke="#5D4037" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M56 42 Q60 46 64 42" stroke="#5D4037" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </g>
        ) : (
          // ตาเปิด
          <g>
            <circle cx="40" cy="42" r="5" fill="#2D2D2D" />
            <circle cx="60" cy="42" r="5" fill="#2D2D2D" />
            {/* Eye shine */}
            <circle cx="41.5" cy="40.5" r="1.5" fill="white" />
            <circle cx="61.5" cy="40.5" r="1.5" fill="white" />
          </g>
        )}

        {/* ปาก (Mouth) */}
        {mood === 'happy' ? (
          <path d="M42 56 Q50 64 58 56" stroke="#D4A574" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        ) : (
          <ellipse cx="50" cy="58" rx="4" ry="2" fill="#D4A574" />
        )}
      </svg>
      
      {/* สถานะ (Status Badge) */}
      <div 
        className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg ${
          mood === 'happy' 
            ? 'bg-secondary text-secondary-foreground' 
            : 'bg-sleep/20 text-sleep'
        }`}
      >
        {mood === 'happy' ? '😊 Feeling Good' : '😴 Sleeping'}
      </div>
    </div>
  );
};

export default CuteBabyAvatar;
