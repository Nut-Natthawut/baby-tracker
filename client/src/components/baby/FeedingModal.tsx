import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Transition } from 'framer-motion';
import { X, AlertTriangle, Play, Pause, RotateCcw } from 'lucide-react';
import { FeedingDetails } from '@/types/baby';
import { roundToNearest30, formatTime } from '@/lib/babyUtils';

interface FeedingModalProps {
  onClose: () => void;
  onSave: (data: { timestamp: Date; details: FeedingDetails }) => void;
}

type FeedingMethod = 'bottle' | 'breast';
type BottleContent = 'formula' | 'breastmilk';
type BreastSide = 'left' | 'right';
type DragDirection = 'up' | 'down';

const getMilkPalette = (bottleContent: BottleContent) => {
  return bottleContent === 'formula'
    ? {
        base: '#FFF3BF',
        mid: '#FDE68A',
        foam: '#FFF7D6',
        bubble: '#FFE9A3',
        highlight: '#FFFDF6',
      }
    : {
        base: '#FFE8D6',
        mid: '#FAD2B0',
        foam: '#FFF1E2',
        bubble: '#FDCBA8',
        highlight: '#FFF7ED',
      };
};

const getBottleTilt = (direction: DragDirection | null) => {
  if (direction === 'up') return -3;
  if (direction === 'down') return 3;
  return 0;
};

const getDragHint = (direction: DragDirection | null) => {
  if (direction === 'up') return 'เพิ่มปริมาณ';
  if (direction === 'down') return 'ลดปริมาณ';
  return 'ลากขึ้น-ลงเพื่อปรับปริมาณ';
};

const formatTimerDisplay = (totalSeconds: number) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const useBreastTimers = () => {
  const [leftSeconds, setLeftSeconds] = useState(0);
  const [rightSeconds, setRightSeconds] = useState(0);
  const [activeTimer, setActiveTimer] = useState<BreastSide | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (activeTimer) {
      timerRef.current = setInterval(() => {
        if (activeTimer === 'left') {
          setLeftSeconds(prev => prev + 1);
        } else {
          setRightSeconds(prev => prev + 1);
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeTimer]);

  const toggleTimer = (side: BreastSide) => {
    setActiveTimer((prev) => (prev === side ? null : side));
  };

  const resetTimer = (side: BreastSide) => {
    if (side === 'left') {
      setLeftSeconds(0);
    } else {
      setRightSeconds(0);
    }

    setActiveTimer((prev) => (prev === side ? null : prev));
  };

  return { leftSeconds, rightSeconds, activeTimer, toggleTimer, resetTimer };
};

interface BottleSectionProps {
  bottleContent: BottleContent;
  amount: number;
  onBottleContentChange: (value: BottleContent) => void;
  onAmountChange: (value: number) => void;
}

const BottleSection: React.FC<BottleSectionProps> = ({
  bottleContent,
  amount,
  onBottleContentChange,
  onAmountChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragDirection, setDragDirection] = useState<DragDirection | null>(null);

  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const fillPercent = Math.min((safeAmount / 300) * 100, 100);
  const milkPalette = getMilkPalette(bottleContent);
  const bottleTilt = getBottleTilt(dragDirection);
  const dragHint = getDragHint(dragDirection);
  const dragHintClass = isDragging
    ? 'text-foreground bg-feeding/15 border-feeding/30'
    : 'text-muted-foreground bg-card/80 border-border';
  const dragAnimation = isDragging ? { y: 0 } : { y: [0, -6, 0] };
  const dragTransition: Transition = isDragging
    ? { type: 'spring' as const, stiffness: 220, damping: 18 }
    : { duration: 4, repeat: Infinity, ease: 'easeInOut' as const };
  const bottleContentActiveClass = 'bg-primary text-primary-foreground';
  const bottleContentInactiveClass = 'bg-secondary text-muted-foreground';
  const formulaClass = bottleContent === 'formula' ? bottleContentActiveClass : bottleContentInactiveClass;
  const breastmilkClass = bottleContent === 'breastmilk' ? bottleContentActiveClass : bottleContentInactiveClass;

  const clampAmount = (value: number) => Math.max(10, Math.min(300, value));
  const applyRoundedAmount = (value: number) => {
    if (!Number.isFinite(value)) return;
    const rounded = Math.round(clampAmount(value) / 10) * 10;
    onAmountChange(rounded);
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    const startY = event.clientY;
    const startAmount = safeAmount;
    let lastY = startY;
    setIsDragging(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentY = moveEvent.clientY;
      const deltaY = startY - currentY;
      const deltaAmount = Math.round(deltaY * 1.5);
      applyRoundedAmount(startAmount + deltaAmount);

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
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const startY = event.touches[0].clientY;
    const startAmount = safeAmount;
    let lastY = startY;
    setIsDragging(true);

    const handleTouchMove = (moveEvent: TouchEvent) => {
      moveEvent.preventDefault();
      const currentY = moveEvent.touches[0].clientY;
      const deltaY = startY - currentY;
      const deltaAmount = Math.round(deltaY * 1.5);
      applyRoundedAmount(startAmount + deltaAmount);

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
  };

  return (
    <>
      <div className="mb-6">
        <p className="text-base font-semibold text-muted-foreground mb-3 block">
          ชนิดนม
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => onBottleContentChange('formula')}
            className={`flex-1 py-3 rounded-xl text-base font-semibold transition-all ${formulaClass}`}
          >
            นมผง
          </button>
          <button
            onClick={() => onBottleContentChange('breastmilk')}
            className={`flex-1 py-3 rounded-xl text-base font-semibold transition-all ${breastmilkClass}`}
          >
            นมแม่
          </button>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-base font-semibold text-muted-foreground mb-4 block text-center">
          ปริมาณนม (ลากขึ้น-ลงบนขวด)
        </p>

        <div className="flex flex-col items-center gap-4">
          <motion.div
            key={safeAmount}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="px-6 py-3 bg-card rounded-2xl border-2 border-feeding/30 shadow-lg"
          >
            <motion.span
              className="text-feeding font-bold text-5xl"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.2 }}
            >
              {safeAmount}
            </motion.span>
            <span className="text-feeding text-2xl ml-2">ml</span>
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => applyRoundedAmount(safeAmount - 30)}
              className="px-4 py-2.5 rounded-full bg-secondary text-foreground text-base font-semibold"
            >
              -30 ml
            </button>
            {[60, 90, 120, 150].map((value) => (
              <button
                key={value}
                onClick={() => onAmountChange(value)}
                className={`px-4 py-2.5 rounded-full text-base font-semibold ${
                  safeAmount === value ? 'bg-feeding text-white' : 'bg-card border border-border text-muted-foreground'
                }`}
              >
                {value} ml
              </button>
            ))}
            <button
              onClick={() => applyRoundedAmount(safeAmount + 30)}
              className="px-4 py-2.5 rounded-full bg-secondary text-foreground text-base font-semibold"
            >
              +30 ml
            </button>
          </div>

          <motion.div
            className="relative touch-none select-none cursor-ns-resize"
            animate={dragAnimation}
            transition={dragTransition}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <motion.div
              className="origin-bottom"
              animate={{ rotate: bottleTilt, scale: isDragging ? 1.03 : 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              <svg
                width="180"
                height="320"
                viewBox="0 0 120 240"
                className="drop-shadow-2xl"
              >
                <defs>
                  <clipPath id="bottleBodyClip">
                    <rect x="25" y="65" width="70" height="155" rx="12" />
                  </clipPath>

                  <linearGradient id="milkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={milkPalette.highlight} />
                    <stop offset="55%" stopColor={milkPalette.base} />
                    <stop offset="100%" stopColor={milkPalette.mid} />
                  </linearGradient>

                  <linearGradient id="glassHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                  </linearGradient>

                  <linearGradient id="bottleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#E3ECFF" />
                    <stop offset="50%" stopColor="#B9C7F2" />
                    <stop offset="100%" stopColor="#8BA3D9" />
                  </linearGradient>

                  <linearGradient id="nippleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F7D2B8" />
                    <stop offset="100%" stopColor="#E6A983" />
                  </linearGradient>

                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <ellipse cx="60" cy="230" rx="35" ry="8" fill="hsl(var(--muted))" opacity="0.3" />

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
                <rect
                  x="32"
                  y="72"
                  width="10"
                  height="130"
                  rx="6"
                  fill="url(#glassHighlight)"
                  opacity="0.6"
                />

                <g clipPath="url(#bottleBodyClip)">
                  {(() => {
                    const bottleTop = 65;
                    const bottleHeight = 155;
                    const liquidHeight = (fillPercent / 100) * bottleHeight;
                    const liquidY = bottleTop + bottleHeight - liquidHeight;
                    const milkTop = liquidY + 3;
                    const foamColor = milkPalette.foam;
                    const bubbleColor = milkPalette.bubble;

                    return (
                      <>
                        <motion.rect
                          x="25"
                          width="70"
                          animate={{ y: milkTop, height: Math.max(0, liquidHeight) }}
                          transition={{ type: 'spring', stiffness: 180, damping: 20 }}
                          fill="url(#milkGradient)"
                        />
                        <motion.path
                          fill={foamColor}
                          initial={false}
                          animate={{
                            d: [
                              `M25 ${milkTop} C32 ${milkTop - 2} 38 ${milkTop + 1} 45 ${milkTop - 1} S55 ${milkTop + 2} 60 ${milkTop} S72 ${milkTop - 2} 80 ${milkTop + 1} S90 ${milkTop - 1} 95 ${milkTop} L95 ${milkTop + 6} L25 ${milkTop + 6} Z`,
                              `M25 ${milkTop - 1} C30 ${milkTop + 1} 40 ${milkTop - 2} 50 ${milkTop} S58 ${milkTop - 3} 65 ${milkTop + 2} S78 ${milkTop} 85 ${milkTop - 2} S92 ${milkTop + 1} 95 ${milkTop - 1} L95 ${milkTop + 6} L25 ${milkTop + 6} Z`,
                              `M25 ${milkTop + 1} C35 ${milkTop - 1} 42 ${milkTop + 2} 48 ${milkTop - 2} S60 ${milkTop + 1} 68 ${milkTop - 1} S75 ${milkTop + 2} 82 ${milkTop} S88 ${milkTop - 2} 95 ${milkTop + 1} L95 ${milkTop + 6} L25 ${milkTop + 6} Z`,
                              `M25 ${milkTop} C32 ${milkTop - 2} 38 ${milkTop + 1} 45 ${milkTop - 1} S55 ${milkTop + 2} 60 ${milkTop} S72 ${milkTop - 2} 80 ${milkTop + 1} S90 ${milkTop - 1} 95 ${milkTop} L95 ${milkTop + 6} L25 ${milkTop + 6} Z`,
                            ],
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                        />

                        {fillPercent > 20 && (
                          <>
                            <motion.circle
                              cx="42"
                              cy={liquidY + liquidHeight * 0.4}
                              r="6"
                              fill={bubbleColor}
                              filter="url(#glow)"
                              opacity="0.5"
                              animate={{
                                y: [-8, 8, -8],
                                scale: [1, 1.1, 1],
                              }}
                              transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                ease: 'easeInOut',
                              }}
                            />
                            <motion.circle
                              cx="72"
                              cy={liquidY + liquidHeight * 0.6}
                              r="4"
                              fill={bubbleColor}
                              filter="url(#glow)"
                              opacity="0.4"
                              animate={{
                                y: [-5, 10, -5],
                                scale: [1, 1.15, 1],
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: 0.8,
                              }}
                            />
                            <motion.circle
                              cx="55"
                              cy={liquidY + liquidHeight * 0.75}
                              r="5"
                              fill={bubbleColor}
                              filter="url(#glow)"
                              opacity="0.45"
                              animate={{
                                y: [-6, 6, -6],
                                scale: [1, 1.08, 1],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: 1.5,
                              }}
                            />
                          </>
                        )}
                      </>
                    );
                  })()}
                </g>

                <g stroke="#7C8FB8" strokeWidth="2" strokeLinecap="round" opacity="0.45">
                  <line x1="35" y1="200" x2="55" y2="200" />
                  <line x1="40" y1="175" x2="50" y2="175" />
                  <line x1="35" y1="150" x2="55" y2="150" />
                  <line x1="40" y1="125" x2="50" y2="125" />
                  <line x1="35" y1="100" x2="55" y2="100" />
                  <line x1="40" y1="85" x2="50" y2="85" />
                </g>

                <g fill="hsl(var(--muted-foreground))" fontSize="10" fontWeight="bold" opacity="0.8">
                  <text x="102" y="203" textAnchor="start">50</text>
                  <text x="102" y="153" textAnchor="start">150</text>
                  <text x="102" y="103" textAnchor="start">250</text>
                </g>

                <rect
                  x="30"
                  y="52"
                  width="60"
                  height="16"
                  rx="4"
                  fill="url(#bottleGradient)"
                  stroke="#7C8FB8"
                  strokeWidth="2"
                />
                <g stroke="#7C8FB8" strokeWidth="1.5" opacity="0.5">
                  <line x1="35" y1="56" x2="35" y2="64" />
                  <line x1="45" y1="56" x2="45" y2="64" />
                  <line x1="55" y1="56" x2="55" y2="64" />
                  <line x1="65" y1="56" x2="65" y2="64" />
                  <line x1="75" y1="56" x2="75" y2="64" />
                  <line x1="85" y1="56" x2="85" y2="64" />
                </g>

                <path
                  d="M42 52 Q45 42 52 35 Q60 25 68 35 Q75 42 78 52 Z"
                  fill="url(#nippleGradient)"
                  stroke="#C07A52"
                  strokeWidth="2"
                />
                <ellipse cx="60" cy="32" rx="4" ry="2" fill="#B4683F" opacity="0.6" />

                <motion.rect
                  x="32"
                  y="75"
                  width="8"
                  height="40"
                  rx="4"
                  fill="white"
                  animate={{ x: [32, 36, 32], opacity: [0.15, 0.3, 0.15] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.rect
                  x="32"
                  y="130"
                  width="6"
                  height="20"
                  rx="3"
                  fill="white"
                  animate={{ x: [34, 30, 34], opacity: [0.12, 0.25, 0.12] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                />

                <g opacity="0.15">
                  <circle cx="50" cy="140" r="3" fill="hsl(var(--foreground))" />
                  <circle cx="70" cy="140" r="3" fill="hsl(var(--foreground))" />
                  <path d="M55 150 Q60 155 65 150" stroke="hsl(var(--foreground))" strokeWidth="2" fill="none" strokeLinecap="round" />
                </g>
              </svg>
            </motion.div>

            <motion.div
              className={`absolute -bottom-2 left-1/2 -translate-x-1/2 text-sm px-3 py-1 rounded-full border ${dragHintClass}`}
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {dragHint}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

interface BreastSectionProps {
  leftSeconds: number;
  rightSeconds: number;
  activeTimer: BreastSide | null;
  onToggle: (side: BreastSide) => void;
  onReset: (side: BreastSide) => void;
}

const BreastSection: React.FC<BreastSectionProps> = ({
  leftSeconds,
  rightSeconds,
  activeTimer,
  onToggle,
  onReset,
}) => {
  const isLeftActive = activeTimer === 'left';
  const isRightActive = activeTimer === 'right';
  const timerPanelActiveClass = 'border-feeding shadow-glow-feeding';
  const timerPanelInactiveClass = 'border-border';
  const leftTimerPanelClass = isLeftActive ? timerPanelActiveClass : timerPanelInactiveClass;
  const rightTimerPanelClass = isRightActive ? timerPanelActiveClass : timerPanelInactiveClass;
  const leftTimerTextClass = isLeftActive ? 'text-feeding' : 'text-foreground';
  const rightTimerTextClass = isRightActive ? 'text-feeding' : 'text-foreground';
  const timerButtonActiveClass = 'bg-feeding text-accent-foreground';
  const timerButtonInactiveClass = 'bg-secondary text-foreground';
  const leftTimerButtonClass = isLeftActive ? timerButtonActiveClass : timerButtonInactiveClass;
  const rightTimerButtonClass = isRightActive ? timerButtonActiveClass : timerButtonInactiveClass;
  const leftTimerIcon = isLeftActive ? <Pause size={20} /> : <Play size={20} />;
  const rightTimerIcon = isRightActive ? <Pause size={20} /> : <Play size={20} />;

  return (
    <div className="mb-6">
      <p className="text-base font-semibold text-muted-foreground mb-4 block text-center">
        จับเวลาการให้นม
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div className={`relative bg-card rounded-3xl border-2 p-6 transition-all ${leftTimerPanelClass}`}>
          {isLeftActive && (
            <div className="absolute inset-0 rounded-3xl bg-feeding/10 animate-pulse" />
          )}
          <div className="relative z-10">
            <div className="text-center mb-3">
              <span className="text-4xl">🤱</span>
              <p className="text-base font-semibold text-muted-foreground mt-1">เต้าซ้าย</p>
            </div>

            <div className="text-center mb-4">
              <span className={`text-5xl font-mono font-bold ${leftTimerTextClass}`}>
                {formatTimerDisplay(leftSeconds)}
              </span>
            </div>

            <div className="flex gap-2 justify-center">
              <button
                onClick={() => onToggle('left')}
                className={`p-4 rounded-full transition-all ${leftTimerButtonClass}`}
              >
                {leftTimerIcon}
              </button>
              <button
                onClick={() => onReset('left')}
                className="p-4 rounded-full bg-secondary text-muted-foreground"
              >
                <RotateCcw size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className={`relative bg-card rounded-3xl border-2 p-6 transition-all ${rightTimerPanelClass}`}>
          {isRightActive && (
            <div className="absolute inset-0 rounded-3xl bg-feeding/10 animate-pulse" />
          )}
          <div className="relative z-10">
            <div className="text-center mb-3">
              <span className="text-4xl transform scale-x-[-1] inline-block">🤱</span>
              <p className="text-base font-semibold text-muted-foreground mt-1">เต้าขวา</p>
            </div>

            <div className="text-center mb-4">
              <span className={`text-5xl font-mono font-bold ${rightTimerTextClass}`}>
                {formatTimerDisplay(rightSeconds)}
              </span>
            </div>

            <div className="flex gap-2 justify-center">
              <button
                onClick={() => onToggle('right')}
                className={`p-4 rounded-full transition-all ${rightTimerButtonClass}`}
              >
                {rightTimerIcon}
              </button>
              <button
                onClick={() => onReset('right')}
                className="p-4 rounded-full bg-secondary text-muted-foreground"
              >
                <RotateCcw size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-secondary/50 rounded-2xl p-4 text-center">
        <p className="text-sm text-muted-foreground mb-1">เวลารวม</p>
        <p className="text-2xl font-bold text-foreground">
          {formatTimerDisplay(leftSeconds + rightSeconds)}
        </p>
      </div>
    </div>
  );
};

interface TimeAdjusterProps {
  label: string;
  time: Date;
  onAdjust: (minutes: number) => void;
  onNow: () => void;
  nowClassName: string;
  nowLabel: string;
}

const TimeAdjuster: React.FC<TimeAdjusterProps> = ({
  label,
  time,
  onAdjust,
  onNow,
  nowClassName,
  nowLabel,
}) => {
  return (
    <div className="mb-6">
      <p className="text-base font-semibold text-muted-foreground mb-2 block">
        {label}
      </p>
      <div className="flex items-center gap-3 bg-card rounded-2xl border border-border p-3">
        <button
          onClick={() => onAdjust(-30)}
          className="px-4 py-2.5 rounded-xl bg-secondary text-base font-semibold text-muted-foreground"
        >
          -30น.
        </button>
        <div className="flex-1 text-center">
          <span className="text-2xl font-bold text-foreground">
            {formatTime(time)}
          </span>
        </div>
        <button
          onClick={() => onAdjust(30)}
          className="px-4 py-2.5 rounded-xl bg-secondary text-base font-semibold text-muted-foreground"
        >
          +30น.
        </button>
      </div>
      <button
        onClick={onNow}
        className={`w-full mt-3 py-3 rounded-xl text-base font-semibold transition-all ${nowClassName}`}
      >
        {nowLabel}
      </button>
    </div>
  );
};

interface SpitUpToggleProps {
  value: boolean;
  onToggle: () => void;
}

const SpitUpToggle: React.FC<SpitUpToggleProps> = ({ value, onToggle }) => {
  const containerClass = value ? 'bg-feeding/20 border-feeding' : 'bg-card border-border';
  const iconClass = value ? 'text-feeding' : 'text-muted-foreground';
  const textClass = value ? 'text-foreground' : 'text-muted-foreground';
  const dotClass = value ? 'border-feeding bg-feeding' : 'border-muted-foreground';

  return (
    <button
      onClick={onToggle}
      className={`w-full mb-6 py-4 px-5 rounded-2xl border flex items-center gap-3 transition-all ${containerClass}`}
    >
      <AlertTriangle size={20} className={iconClass} />
      <span className={`text-base font-semibold ${textClass}`}>
        แหวะนม
      </span>
      <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${dotClass}`}>
        {value && <div className="w-2 h-2 rounded-full bg-background" />}
      </div>
    </button>
  );
};

interface NotesSectionProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

const NotesSection: React.FC<NotesSectionProps> = ({
  id,
  label,
  placeholder,
  value,
  onChange,
}) => {
  return (
    <div className="mb-6">
      <label htmlFor={id} className="text-base font-semibold text-muted-foreground mb-2 block">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-card border border-border rounded-2xl p-4 text-base text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-feeding/50"
        rows={4}
      />
    </div>
  );
};

const FeedingModal: React.FC<FeedingModalProps> = ({ onClose, onSave }) => {
  const [method, setMethod] = useState<FeedingMethod>('bottle');
  const [bottleContent, setBottleContent] = useState<BottleContent>('formula');
  const [amount, setAmount] = useState(120);
  const [startTime, setStartTime] = useState<Date>(roundToNearest30(new Date()));
  const [hasSpitUp, setHasSpitUp] = useState(false);
  const [notes, setNotes] = useState('');
  const { leftSeconds, rightSeconds, activeTimer, toggleTimer, resetTimer } = useBreastTimers();

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

  const methodActiveClass = 'bg-feeding text-white shadow-glow-feeding';
  const methodInactiveClass = 'bg-secondary text-secondary-foreground';
  const bottleMethodClass = method === 'bottle' ? methodActiveClass : methodInactiveClass;
  const breastMethodClass = method === 'breast' ? methodActiveClass : methodInactiveClass;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <button onClick={onClose} className="p-2 -ml-2">
          <X size={24} className="text-foreground" />
        </button>
        <h2 className="text-xl font-bold text-foreground">บันทึกการกินนม</h2>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-6">
        {/* Method Toggle */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setMethod('bottle')}
            className={`flex-1 py-4 rounded-2xl text-lg font-semibold transition-all ${bottleMethodClass}`}
          >
            🍼 ขวดนม
          </button>
          <button
            onClick={() => setMethod('breast')}
            className={`flex-1 py-4 rounded-2xl text-lg font-semibold transition-all ${breastMethodClass}`}
          >
            🤱 เข้าเต้า
          </button>
        </div>

        {method === 'bottle' ? (
          <BottleSection
            bottleContent={bottleContent}
            amount={amount}
            onBottleContentChange={setBottleContent}
            onAmountChange={setAmount}
          />
        ) : (
          <BreastSection
            leftSeconds={leftSeconds}
            rightSeconds={rightSeconds}
            activeTimer={activeTimer}
            onToggle={toggleTimer}
            onReset={resetTimer}
          />
        )}

        <TimeAdjuster
          label="เวลาเริ่มต้น"
          time={startTime}
          onAdjust={adjustTime}
          onNow={() => setStartTime(new Date())}
          nowClassName="bg-feeding/20 text-feeding hover:bg-feeding/30"
          nowLabel="⏱️ เริ่มตอนนี้"
        />

        <SpitUpToggle
          value={hasSpitUp}
          onToggle={() => setHasSpitUp(prev => !prev)}
        />

        <NotesSection
          id="feeding-notes"
          label="หมายเหตุ (ไม่บังคับ)"
          placeholder="เพิ่มบันทึกเพิ่มเติม..."
          value={notes}
          onChange={setNotes}
        />
      </div>

      {/* Save Button */}
      <div className="p-6 border-t border-border bg-card">
        <button
          onClick={handleSave}
          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-xl shadow-glow-primary active:scale-[0.98] transition-transform"
        >
          บันทึก
        </button>
      </div>
    </motion.div>
  );
};

export default FeedingModal;
