import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Play, Pause, RotateCcw } from 'lucide-react';
import { FeedingDetails } from '@/types/baby';
import { roundToNearest30, formatTime } from '@/lib/babyUtils';

interface FeedingModalProps {
  onClose: () => void;
  onSave: (data: { timestamp: Date; details: FeedingDetails }) => void;
}

const FeedingModal: React.FC<FeedingModalProps> = ({ onClose, onSave }) => {
  const [method, setMethod] = useState<'bottle' | 'breast'>('bottle');
  const [bottleContent, setBottleContent] = useState<'formula' | 'breastmilk'>('formula');
  const [amount, setAmount] = useState(120);
  const [startTime, setStartTime] = useState<Date>(roundToNearest30(new Date()));
  const [hasSpitUp, setHasSpitUp] = useState(false);
  const [notes, setNotes] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragDirection, setDragDirection] = useState<'up' | 'down' | null>(null);

  // Breast feeding timers
  const [leftSeconds, setLeftSeconds] = useState(0);
  const [rightSeconds, setRightSeconds] = useState(0);
  const [activeTimer, setActiveTimer] = useState<'left' | 'right' | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect
  useEffect(() => {
    if (activeTimer) {
      timerRef.current = setInterval(() => {
        if (activeTimer === 'left') {
          setLeftSeconds(prev => prev + 1);
        } else {
          setRightSeconds(prev => prev + 1);
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeTimer]);

  const handleSave = () => {
    const details: FeedingDetails = {
      method,
      hasSpitUp,
      notes: notes || undefined,
    };

    if (method === 'bottle') {
      details.bottleContent = bottleContent;
      details.amountMl = amount;
    } else {
      details.leftDurationSeconds = leftSeconds;
      details.rightDurationSeconds = rightSeconds;
    }

    onSave({
      timestamp: startTime,
      details,
    });
  };

  const adjustTime = (minutes: number) => {
    const newTime = new Date(startTime.getTime() + minutes * 60000);
    setStartTime(newTime);
  };

  const toggleTimer = (side: 'left' | 'right') => {
    if (activeTimer === side) {
      setActiveTimer(null);
    } else {
      setActiveTimer(side);
    }
  };

  const resetTimer = (side: 'left' | 'right') => {
    if (side === 'left') {
      setLeftSeconds(0);
    } else {
      setRightSeconds(0);
    }
    if (activeTimer === side) {
      setActiveTimer(null);
    }
  };

  const formatTimerDisplay = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Bottle fill calculation
  const fillPercent = Math.min((amount / 300) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <button onClick={onClose} className="p-2 -ml-2">
          <X size={24} className="text-foreground" />
        </button>
        <h2 className="text-lg font-bold text-foreground">บันทึกการกินนม</h2>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-6">
        {/* Method Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMethod('bottle')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              method === 'bottle'
                ? 'bg-feeding text-white shadow-glow-feeding'
                : 'bg-secondary text-secondary-foreground'
            }`}
          >
            🍼 ขวดนม
          </button>
          <button
            onClick={() => setMethod('breast')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              method === 'breast'
                ? 'bg-feeding text-white shadow-glow-feeding'
                : 'bg-secondary text-secondary-foreground'
            }`}
          >
            🤱 เข้าเต้า
          </button>
        </div>

        {method === 'bottle' ? (
          <>
            {/* Bottle Content Toggle */}
            <div className="mb-6">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                ชนิดนม
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setBottleContent('formula')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    bottleContent === 'formula'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  นมผง
                </button>
                <button
                  onClick={() => setBottleContent('breastmilk')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    bottleContent === 'breastmilk'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  นมแม่
                </button>
              </div>
            </div>

            {/* Cute Cartoon Bottle Visualization with Drag */}
            <div className="mb-6">
              <label className="text-sm font-medium text-muted-foreground mb-4 block text-center">
                ปริมาณนม (ลากขึ้น-ลงบนขวด)
              </label>
              
              <div className="flex flex-col items-center gap-4">
                {/* Amount Display Above */}
                <motion.div 
                  key={amount}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="px-6 py-3 bg-card rounded-2xl border-2 border-feeding/30 shadow-lg"
                >
                  <motion.span 
                    className="text-feeding font-bold text-4xl"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.2 }}
                  >
                    {amount}
                  </motion.span>
                  <span className="text-feeding text-xl ml-2">ml</span>
                </motion.div>

                {/* Cute Cartoon Bottle Container with Drag */}
                <div 
                  className="relative touch-none select-none cursor-ns-resize"
                  onMouseDown={(e) => {
                    const startY = e.clientY;
                    const startAmount = amount;
                    let lastY = startY;
                    setIsDragging(true);
                    
                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      const currentY = moveEvent.clientY;
                      const deltaY = startY - currentY;
                      const deltaAmount = Math.round(deltaY * 1.5);
                      const newAmount = Math.max(10, Math.min(300, startAmount + deltaAmount));
                      setAmount(Math.round(newAmount / 10) * 10);
                      
                      // ตรวจสอบทิศทางการลาก
                      if (currentY < lastY) {
                        setDragDirection('up');
                      } else if (currentY > lastY) {
                        setDragDirection('down');
                      }
                      lastY = currentY;
                    };
                    
                    const handleMouseUp = () => {
                      setIsDragging(false);
                      setTimeout(() => setDragDirection(null), 500);
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                  onTouchStart={(e) => {
                    const startY = e.touches[0].clientY;
                    const startAmount = amount;
                    let lastY = startY;
                    setIsDragging(true);
                    
                    const handleTouchMove = (moveEvent: TouchEvent) => {
                      const currentY = moveEvent.touches[0].clientY;
                      const deltaY = startY - currentY;
                      const deltaAmount = Math.round(deltaY * 1.5);
                      const newAmount = Math.max(10, Math.min(300, startAmount + deltaAmount));
                      setAmount(Math.round(newAmount / 10) * 10);
                      
                      // ตรวจสอบทิศทางการลาก
                      if (currentY < lastY) {
                        setDragDirection('up');
                      } else if (currentY > lastY) {
                        setDragDirection('down');
                      }
                      lastY = currentY;
                    };
                    
                    const handleTouchEnd = () => {
                      setIsDragging(false);
                      setTimeout(() => setDragDirection(null), 500);
                      document.removeEventListener('touchmove', handleTouchMove);
                      document.removeEventListener('touchend', handleTouchEnd);
                    };
                    
                    document.addEventListener('touchmove', handleTouchMove, { passive: false });
                    document.addEventListener('touchend', handleTouchEnd);
                  }}
                >
                  <svg 
                    width="180" 
                    height="320" 
                    viewBox="0 0 120 240" 
                    className="drop-shadow-2xl"
                  >
                    <defs>
                      {/* Mask สำหรับ clip น้ำ */}
                      <clipPath id="bottleBodyClip">
                        <rect x="25" y="65" width="70" height="155" rx="12" />
                      </clipPath>
                      
                      {/* สีน้ำนมแบบชั้นเดียว */}
                      <linearGradient id="cuteMillkGradient" x1="0%" y1="0%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor={bottleContent === 'formula' ? '#FDE68A' : '#FFEDD5'} />
                      </linearGradient>

                      {/* Gradient ขวด - ATNN Sky Color */}
                      <linearGradient id="bottleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#C5D5F0" />
                        <stop offset="50%" stopColor="#A5B7E5" />
                        <stop offset="100%" stopColor="#8BA3D9" />
                      </linearGradient>

                      {/* Gradient จุกนม - ATNN Sky Color darker */}
                      <linearGradient id="nippleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#A5B7E5" />
                        <stop offset="100%" stopColor="#7A94CC" />
                      </linearGradient>

                      {/* Bubble animation */}
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>

                    {/* เงาขวด */}
                    <ellipse cx="60" cy="230" rx="35" ry="8" fill="hsl(var(--muted))" opacity="0.3" />

                    {/* ตัวขวดหลัก (Cartoon Style) */}
                    <rect 
                      x="25" 
                      y="65" 
                      width="70" 
                      height="155" 
                      rx="12" 
                      fill="url(#bottleGradient)"
                      stroke="#7A94CC"
                      strokeWidth="3"
                    />

                    {/* น้ำนมใน Bottle - Animated */}
                    <g clipPath="url(#bottleBodyClip)">
                      {(() => {
                        const bottleTop = 65;
                        const bottleHeight = 155;
                        const liquidHeight = (fillPercent / 100) * bottleHeight;
                        const liquidY = bottleTop + bottleHeight - liquidHeight;
                        const milkColor = bottleContent === 'formula' ? '#FFFEF8' : '#FFFBF5';
                        const waveColor = bottleContent === 'formula' ? '#FFF9E6' : '#FFF7ED';
                        
                        return (
                          <>
                            {/* น้ำนมหลัก พร้อม wave สมจริง */}
                            <rect
                              x="25"
                              y={liquidY + 3}
                              width="70"
                              height={liquidHeight}
                              fill={milkColor}
                            />
                            {/* คลื่นผิวน้ำนม - สมจริง */}
                            <motion.path 
                              fill={milkColor}
                              initial={false}
                              animate={{
                                d: [
                                  `M25 ${liquidY + 3} C32 ${liquidY + 1} 38 ${liquidY + 4} 45 ${liquidY + 2} S55 ${liquidY + 5} 60 ${liquidY + 3} S72 ${liquidY + 1} 80 ${liquidY + 4} S90 ${liquidY + 2} 95 ${liquidY + 3} L95 ${liquidY + 8} L25 ${liquidY + 8} Z`,
                                  `M25 ${liquidY + 2} C30 ${liquidY + 4} 40 ${liquidY + 1} 50 ${liquidY + 3} S58 ${liquidY} 65 ${liquidY + 4} S78 ${liquidY + 2} 85 ${liquidY + 1} S92 ${liquidY + 3} 95 ${liquidY + 2} L95 ${liquidY + 8} L25 ${liquidY + 8} Z`,
                                  `M25 ${liquidY + 4} C35 ${liquidY + 2} 42 ${liquidY + 5} 48 ${liquidY + 1} S60 ${liquidY + 4} 68 ${liquidY + 2} S75 ${liquidY + 5} 82 ${liquidY + 3} S88 ${liquidY + 1} 95 ${liquidY + 4} L95 ${liquidY + 8} L25 ${liquidY + 8} Z`,
                                  `M25 ${liquidY + 3} C32 ${liquidY + 1} 38 ${liquidY + 4} 45 ${liquidY + 2} S55 ${liquidY + 5} 60 ${liquidY + 3} S72 ${liquidY + 1} 80 ${liquidY + 4} S90 ${liquidY + 2} 95 ${liquidY + 3} L95 ${liquidY + 8} L25 ${liquidY + 8} Z`
                                ]
                              }}
                              transition={{ 
                                duration: 2.5,
                                repeat: Infinity,
                                ease: "linear"
                              }}
                            />
                            
                            {/* Bubble effects - ฟองอากาศน่ารัก */}
                            {fillPercent > 20 && (
                              <>
                                <motion.circle
                                  cx="42"
                                  cy={liquidY + liquidHeight * 0.4}
                                  r="6"
                                  fill={waveColor}
                                  opacity="0.5"
                                  animate={{ 
                                    y: [-8, 8, -8],
                                    scale: [1, 1.1, 1]
                                  }}
                                  transition={{ 
                                    duration: 2.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                  }}
                                />
                                <motion.circle
                                  cx="72"
                                  cy={liquidY + liquidHeight * 0.6}
                                  r="4"
                                  fill={waveColor}
                                  opacity="0.4"
                                  animate={{ 
                                    y: [-5, 10, -5],
                                    scale: [1, 1.15, 1]
                                  }}
                                  transition={{ 
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 0.8
                                  }}
                                />
                                <motion.circle
                                  cx="55"
                                  cy={liquidY + liquidHeight * 0.75}
                                  r="5"
                                  fill={waveColor}
                                  opacity="0.45"
                                  animate={{ 
                                    y: [-6, 6, -6],
                                    scale: [1, 1.08, 1]
                                  }}
                                  transition={{ 
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 1.5
                                  }}
                                />
                              </>
                            )}
                          </>
                        );
                      })()}
                    </g>

                    {/* ขีดวัดระดับ (Cute rounded) */}
                    <g stroke="#92400E" strokeWidth="2" strokeLinecap="round" opacity="0.4">
                      <line x1="35" y1="200" x2="55" y2="200" />
                      <line x1="40" y1="175" x2="50" y2="175" />
                      <line x1="35" y1="150" x2="55" y2="150" />
                      <line x1="40" y1="125" x2="50" y2="125" />
                      <line x1="35" y1="100" x2="55" y2="100" />
                      <line x1="40" y1="85" x2="50" y2="85" />
                    </g>
                    
                    {/* ตัวเลขขีด */}
                    <g fill="hsl(var(--muted-foreground))" fontSize="10" fontWeight="bold" opacity="0.8">
                      <text x="102" y="203" textAnchor="start">50</text>
                      <text x="102" y="153" textAnchor="start">150</text>
                      <text x="102" y="103" textAnchor="start">250</text>
                    </g>

                    {/* ฝาขวด (Cap) - Cartoon style */}
                    <rect 
                      x="30" 
                      y="52" 
                      width="60" 
                      height="16" 
                      rx="4" 
                      fill="url(#bottleGradient)"
                      stroke="#D97706"
                      strokeWidth="2"
                    />
                    {/* ลายเส้นบนฝา */}
                    <g stroke="#D97706" strokeWidth="1.5" opacity="0.5">
                      <line x1="35" y1="56" x2="35" y2="64" />
                      <line x1="45" y1="56" x2="45" y2="64" />
                      <line x1="55" y1="56" x2="55" y2="64" />
                      <line x1="65" y1="56" x2="65" y2="64" />
                      <line x1="75" y1="56" x2="75" y2="64" />
                      <line x1="85" y1="56" x2="85" y2="64" />
                    </g>

                    {/* จุกนม (Nipple) - น่ารักกว่า */}
                    <path 
                      d="M42 52 Q45 42 52 35 Q60 25 68 35 Q75 42 78 52 Z" 
                      fill="url(#nippleGradient)"
                      stroke="#B45309"
                      strokeWidth="2"
                    />
                    {/* รูจุกนม */}
                    <ellipse cx="60" cy="32" rx="4" ry="2" fill="#92400E" opacity="0.6" />

                    {/* Shine effect on bottle */}
                    <rect 
                      x="32" 
                      y="75" 
                      width="8" 
                      height="40" 
                      rx="4" 
                      fill="white" 
                      opacity="0.25"
                    />
                    <rect 
                      x="32" 
                      y="130" 
                      width="6" 
                      height="20" 
                      rx="3" 
                      fill="white" 
                      opacity="0.2"
                    />

                    {/* Cute face on bottle (optional kawaii style) */}
                    <g opacity="0.15">
                      <circle cx="50" cy="140" r="3" fill="hsl(var(--foreground))" />
                      <circle cx="70" cy="140" r="3" fill="hsl(var(--foreground))" />
                      <path d="M55 150 Q60 155 65 150" stroke="hsl(var(--foreground))" strokeWidth="2" fill="none" strokeLinecap="round" />
                    </g>
                  </svg>
                  
                  {/* Drag hint with animation */}
                  <motion.div 
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-card/80 px-3 py-1 rounded-full border border-border"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ลากขึ้น-ลงเพื่อปรับปริมาณ
                  </motion.div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Breast Feeding with Timer */
          <div className="mb-6">
            <label className="text-sm font-medium text-muted-foreground mb-4 block text-center">
              จับเวลาการให้นม
            </label>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Left Breast Timer */}
              <div className={`relative bg-card rounded-3xl border-2 p-5 transition-all ${
                activeTimer === 'left' 
                  ? 'border-feeding shadow-glow-feeding' 
                  : 'border-border'
              }`}>
                {activeTimer === 'left' && (
                  <div className="absolute inset-0 rounded-3xl bg-feeding/10 animate-pulse" />
                )}
                <div className="relative z-10">
                  <div className="text-center mb-3">
                    <span className="text-4xl">🤱</span>
                    <p className="text-sm font-medium text-muted-foreground mt-1">เต้าซ้าย</p>
                  </div>
                  
                  <div className="text-center mb-4">
                    <span className={`text-4xl font-mono font-bold ${
                      activeTimer === 'left' ? 'text-feeding' : 'text-foreground'
                    }`}>
                      {formatTimerDisplay(leftSeconds)}
                    </span>
                  </div>
                  
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => toggleTimer('left')}
                      className={`p-3 rounded-full transition-all ${
                        activeTimer === 'left'
                          ? 'bg-feeding text-accent-foreground'
                          : 'bg-secondary text-foreground'
                      }`}
                    >
                      {activeTimer === 'left' ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <button
                      onClick={() => resetTimer('left')}
                      className="p-3 rounded-full bg-secondary text-muted-foreground"
                    >
                      <RotateCcw size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Breast Timer */}
              <div className={`relative bg-card rounded-3xl border-2 p-5 transition-all ${
                activeTimer === 'right' 
                  ? 'border-feeding shadow-glow-feeding' 
                  : 'border-border'
              }`}>
                {activeTimer === 'right' && (
                  <div className="absolute inset-0 rounded-3xl bg-feeding/10 animate-pulse" />
                )}
                <div className="relative z-10">
                  <div className="text-center mb-3">
                    <span className="text-4xl transform scale-x-[-1] inline-block">🤱</span>
                    <p className="text-sm font-medium text-muted-foreground mt-1">เต้าขวา</p>
                  </div>
                  
                  <div className="text-center mb-4">
                    <span className={`text-4xl font-mono font-bold ${
                      activeTimer === 'right' ? 'text-feeding' : 'text-foreground'
                    }`}>
                      {formatTimerDisplay(rightSeconds)}
                    </span>
                  </div>
                  
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => toggleTimer('right')}
                      className={`p-3 rounded-full transition-all ${
                        activeTimer === 'right'
                          ? 'bg-feeding text-accent-foreground'
                          : 'bg-secondary text-foreground'
                      }`}
                    >
                      {activeTimer === 'right' ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <button
                      onClick={() => resetTimer('right')}
                      className="p-3 rounded-full bg-secondary text-muted-foreground"
                    >
                      <RotateCcw size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Time */}
            <div className="mt-4 bg-secondary/50 rounded-2xl p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">เวลารวม</p>
              <p className="text-2xl font-bold text-foreground">
                {formatTimerDisplay(leftSeconds + rightSeconds)}
              </p>
            </div>
          </div>
        )}

        {/* Time Adjuster */}
        <div className="mb-6">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            เวลาเริ่มต้น
          </label>
          <div className="flex items-center gap-3 bg-card rounded-2xl border border-border p-3">
            <button
              onClick={() => adjustTime(-30)}
              className="px-3 py-1.5 rounded-lg bg-secondary text-sm font-medium text-muted-foreground"
            >
              -30น.
            </button>
            <div className="flex-1 text-center">
              <span className="text-xl font-bold text-foreground">
                {formatTime(startTime)}
              </span>
            </div>
            <button
              onClick={() => adjustTime(30)}
              className="px-3 py-1.5 rounded-lg bg-secondary text-sm font-medium text-muted-foreground"
            >
              +30น.
            </button>
          </div>
          {/* Start Now Button */}
          <button
            onClick={() => setStartTime(new Date())}
            className="w-full mt-3 py-2.5 rounded-xl bg-feeding/20 text-feeding font-medium text-sm hover:bg-feeding/30 transition-all"
          >
            ⏱️ เริ่มตอนนี้
          </button>
        </div>

        {/* Spit Up Toggle */}
        <button
          onClick={() => setHasSpitUp(!hasSpitUp)}
          className={`w-full mb-6 py-3 px-4 rounded-2xl border flex items-center gap-3 transition-all ${
            hasSpitUp 
              ? 'bg-feeding/20 border-feeding' 
              : 'bg-card border-border'
          }`}
        >
          <AlertTriangle size={20} className={hasSpitUp ? 'text-feeding' : 'text-muted-foreground'} />
          <span className={`font-medium ${hasSpitUp ? 'text-foreground' : 'text-muted-foreground'}`}>
            แหวะนม
          </span>
          <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            hasSpitUp ? 'border-feeding bg-feeding' : 'border-muted-foreground'
          }`}>
            {hasSpitUp && <div className="w-2 h-2 rounded-full bg-background" />}
          </div>
        </button>

        {/* Notes */}
        <div className="mb-6">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            หมายเหตุ (ไม่บังคับ)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="เพิ่มบันทึกเพิ่มเติม..."
            className="w-full bg-card border border-border rounded-2xl p-4 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-feeding/50"
            rows={3}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="p-6 border-t border-border bg-card">
        <button
          onClick={handleSave}
          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-glow-primary active:scale-[0.98] transition-transform"
        >
          บันทึก
        </button>
      </div>
    </motion.div>
  );
};

export default FeedingModal;
