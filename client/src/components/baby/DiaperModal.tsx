import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Check, CalendarDays , ChevronLeft, ChevronRight} from 'lucide-react';
import { DiaperDetails, POO_COLORS, POO_TEXTURES } from '@/types/baby';
import { roundToNearest30, formatTime } from '@/lib/babyUtils';

interface DiaperModalProps {
  onClose: () => void;
  onSave: (data: { timestamp: Date; details: DiaperDetails }) => void;
  initialData?: { timestamp: Date; details: DiaperDetails };
}

type DiaperStatus = 'clean' | 'pee' | 'poo' | 'mixed';

const getPooFillColor = (pooColor: string) => {
  return POO_COLORS.find((color) => color.id === pooColor)?.color || '#8B4513';
};

const getTextureVisual = (id: string, fillColor: string) => {
  switch (id) {
    case 'runny':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10">
          <ellipse cx="20" cy="28" rx="16" ry="6" fill={fillColor} opacity="0.6" />
          <ellipse cx="20" cy="26" rx="12" ry="4" fill={fillColor} opacity="0.8" />
          <circle cx="12" cy="24" r="2" fill={fillColor} opacity="0.5" />
          <circle cx="28" cy="25" r="1.5" fill={fillColor} opacity="0.5" />
        </svg>
      );
    case 'mushy':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10">
          <ellipse cx="20" cy="28" rx="14" ry="8" fill={fillColor} />
          <ellipse cx="18" cy="22" rx="8" ry="5" fill={fillColor} />
          <ellipse cx="24" cy="20" rx="5" ry="4" fill={fillColor} />
        </svg>
      );
    case 'sticky':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10">
          <path d="M10 32 Q12 20 20 18 Q28 20 30 32 Z" fill={fillColor} />
          <ellipse cx="20" cy="16" rx="6" ry="4" fill={fillColor} />
          <circle cx="20" cy="12" r="3" fill={fillColor} />
        </svg>
      );
    case 'solid':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10">
          <path d="M12 32 C12 28 14 24 20 22 C26 24 28 28 28 32 Z" fill={fillColor} />
          <ellipse cx="20" cy="20" rx="7" ry="5" fill={fillColor} />
          <ellipse cx="20" cy="14" rx="5" ry="4" fill={fillColor} />
          <circle cx="20" cy="10" r="3" fill={fillColor} />
        </svg>
      );
    case 'hard':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10">
          <circle cx="14" cy="28" r="5" fill={fillColor} />
          <circle cx="26" cy="28" r="5" fill={fillColor} />
          <circle cx="20" cy="20" r="5" fill={fillColor} />
          <circle cx="20" cy="12" r="4" fill={fillColor} />
        </svg>
      );
    default:
      return null;
  }
};

const DiaperModal: React.FC<DiaperModalProps> = ({ onClose, onSave, initialData }) => {
  const [status, setStatus] = useState<DiaperStatus>((initialData?.details?.status as DiaperStatus) || 'clean');
  const [pooColor, setPooColor] = useState<string>(initialData?.details?.pooColor || '');
  const [pooTexture, setPooTexture] = useState<string>(initialData?.details?.pooTexture || '');
  const [startTime, setStartTime] = useState<Date>(initialData?.timestamp || roundToNearest30(new Date()));
  const datePickerRef = useRef<HTMLInputElement>(null);
  const [notes, setNotes] = useState(initialData?.details?.notes || '');

  const handleSave = () => {
    const details: DiaperDetails = {
      status,
      notes: notes || undefined,
    };

    if (status === 'poo' || status === 'mixed') {
      if (pooColor) details.pooColor = pooColor;
      if (pooTexture) details.pooTexture = pooTexture;
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

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const [y, m, d] = e.target.value.split('-').map(Number);
      setStartTime(prev => {
        const newDate = new Date(prev);
        newDate.setFullYear(y, m - 1, d);
        return newDate;
      });
    }
  };


  const handlePrevDay = () => setStartTime(prev => new Date(prev.getTime() - 86400000));
  const handleNextDay = () => setStartTime(prev => new Date(prev.getTime() + 86400000));
  const handleToday = () => setStartTime(new Date());

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const showPooOptions = status === 'poo' || status === 'mixed';
  const pooFillColor = getPooFillColor(pooColor);

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
        <h2 className="text-xl font-bold text-foreground">เปลี่ยนผ้าอ้อม</h2>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-6">
        {/* Status Selection */}
        <div className="mb-6">
          <p className="text-base font-semibold text-muted-foreground mb-3 block">
            สถานะ
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => setStatus('clean')}
              className={`py-5 rounded-2xl text-base font-semibold flex flex-col items-center gap-2 transition-all ${status === 'clean'
                  ? 'bg-diaper text-accent-foreground shadow-glow-diaper'
                  : 'bg-card border border-border text-muted-foreground'
                }`}
            >
              <span className="text-2xl">✨</span>
              <span className="text-sm">สะอาด</span>
            </button>
            <button
              onClick={() => setStatus('pee')}
              className={`py-5 rounded-2xl text-base font-semibold flex flex-col items-center gap-2 transition-all ${status === 'pee'
                  ? 'bg-diaper text-accent-foreground shadow-glow-diaper'
                  : 'bg-card border border-border text-muted-foreground'
                }`}
            >
              <span className="text-2xl">💧</span>
              <span className="text-sm">ฉี่</span>
            </button>
            <button
              onClick={() => setStatus('poo')}
              className={`py-5 rounded-2xl text-base font-semibold flex flex-col items-center gap-2 transition-all ${status === 'poo'
                  ? 'bg-diaper text-accent-foreground shadow-glow-diaper'
                  : 'bg-card border border-border text-muted-foreground'
                }`}
            >
              <span className="text-2xl">💩</span>
              <span className="text-sm">อึ</span>
            </button>
            <button
              onClick={() => setStatus('mixed')}
              className={`py-5 rounded-2xl text-base font-semibold flex flex-col items-center gap-2 transition-all ${status === 'mixed'
                  ? 'bg-diaper text-accent-foreground shadow-glow-diaper'
                  : 'bg-card border border-border text-muted-foreground'
                }`}
            >
              <span className="text-2xl">💧💩</span>
              <span className="text-sm">ฉี่+อึ</span>
            </button>
          </div>
        </div>

        {/* Poo Color (only show if poo or mixed) */}
        {showPooOptions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6"
          >
            <p className="text-base font-semibold text-muted-foreground mb-3 block">
              สีอุจจาระ
            </p>
            <div className="flex gap-3 flex-wrap">
              {POO_COLORS.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setPooColor(color.id)}
                  className={`relative p-1 rounded-full transition-all ${pooColor === color.id
                      ? 'ring-2 ring-diaper ring-offset-2 ring-offset-background'
                      : ''
                    }`}
                >
                  <div
                    className="w-12 h-12 rounded-full border-2 border-border"
                    style={{ backgroundColor: color.color }}
                  />
                  {pooColor === color.id && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check size={16} className="text-primary-foreground drop-shadow-lg" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {pooColor && POO_COLORS.find(c => c.id === pooColor)?.label}
            </p>
          </motion.div>
        )}

        {/* Poo Texture (only show if poo or mixed) */}
        {showPooOptions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6"
          >
            <p className="text-base font-semibold text-muted-foreground mb-3 block">
              ลักษณะ
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {POO_TEXTURES.map((texture) => {
                return (
                  <button
                    key={texture.id}
                    onClick={() => setPooTexture(texture.id)}
                    className={`flex flex-col items-center py-4 px-3 rounded-xl transition-all ${pooTexture === texture.id
                        ? 'bg-diaper/20 border-2 border-diaper'
                        : 'bg-card border border-border'
                      }`}
                  >
                    <div className="mb-2">
                      {getTextureVisual(texture.id, pooFillColor)}
                    </div>
                    <span className={`text-sm font-medium text-center ${pooTexture === texture.id ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                      {texture.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Time Adjuster */}
                {/* Date Selector */}
        <div className="mb-4 text-center w-full">
          <div className="flex items-center justify-between gap-3 bg-card rounded-2xl border border-border p-3">
            <button
              onClick={handlePrevDay}
              className="size-8 rounded-full bg-white/90 flex items-center justify-center text-gray-600 hover:opacity-80 transition"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex-1 flex flex-col items-center justify-center relative">
              <input
                ref={datePickerRef}
                type="date"
                value={startTime.toISOString().split('T')[0]}
                onChange={handleDateChange}
                className="absolute opacity-0 w-full h-full cursor-pointer z-10 top-0 left-0"
              />
              <div className="flex items-center justify-center gap-2 py-1 cursor-pointer pointer-events-none">
                <span className="text-lg font-bold truncate">
                  {startTime.getDate() === new Date().getDate() && startTime.getMonth() === new Date().getMonth() && startTime.getFullYear() === new Date().getFullYear() ? 
                    'วันนี้' : formatDate(startTime)}
                </span>
              </div>
            </div>
            <button
              onClick={handleNextDay}
              disabled={startTime.getDate() === new Date().getDate() && startTime.getMonth() === new Date().getMonth() && startTime.getFullYear() === new Date().getFullYear()}
              className="size-8 rounded-full bg-white/90 flex items-center justify-center text-gray-600 hover:opacity-80 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <div className="mb-6">
          <p className="text-base font-semibold text-muted-foreground mb-2 block">
            เวลา
          </p>
          <div className="flex items-center justify-center gap-3 bg-card rounded-2xl border border-border p-3">
            <button
              onClick={() => adjustTime(-30)}
              className="px-4 py-2.5 rounded-xl bg-secondary text-base font-semibold text-muted-foreground"
            >
              -30น.
            </button>
            <div className="flex-1 text-center">
              <span className="text-2xl font-bold text-foreground">
                {formatTime(startTime)}
              </span>
            </div>
            <button
              onClick={() => adjustTime(30)}
              className="px-4 py-2.5 rounded-xl bg-secondary text-base font-semibold text-muted-foreground"
            >
              +30น.
            </button>
          </div>
          {/* Start Now Button */}
          <button
            onClick={() => setStartTime(new Date())}
            className="w-full mt-3 py-3 rounded-xl bg-diaper/20 text-diaper font-semibold text-base hover:bg-diaper/30 transition-all"
          >
            ⏱️ เริ่มตอนนี้
          </button>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label htmlFor="diaper-notes" className="text-base font-semibold text-muted-foreground mb-2 block">
            หมายเหตุ (ไม่บังคับ)
          </label>
          <textarea
            id="diaper-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="เพิ่มบันทึกเพิ่มเติม..."
            className="w-full bg-card border border-border rounded-2xl p-4 text-base text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-diaper/50"
            rows={4}
          />
        </div>
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

export default DiaperModal;
