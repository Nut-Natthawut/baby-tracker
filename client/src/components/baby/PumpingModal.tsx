import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Minus, ChevronLeft, ChevronRight, Droplets } from 'lucide-react';
import { PumpingDetails } from '@/types/baby';
import { roundToNearest30, formatTime } from '@/lib/babyUtils';
import { Input } from '@/components/ui/input';

interface PumpingModalProps {
  onClose: () => void;
  onSave: (data: { timestamp: Date; details: PumpingDetails }) => void;
  initialData?: { timestamp: Date; details: PumpingDetails };
}

const PumpingModal: React.FC<PumpingModalProps> = ({ onClose, onSave, initialData }) => {
  const [amountLeft, setAmountLeft] = useState<string>(initialData?.details?.amountLeftMl?.toString() || '');
  const [amountRight, setAmountRight] = useState<string>(initialData?.details?.amountRightMl?.toString() || '');
  const [durationMinutes, setDurationMinutes] = useState(initialData?.details?.durationMinutes || 15);
  const [startTime, setStartTime] = useState<Date>(initialData?.timestamp || roundToNearest30(new Date()));
  const datePickerRef = useRef<HTMLInputElement>(null);
  const [notes, setNotes] = useState(initialData?.details?.notes || '');

  const handleAmountChange = (value: string, side: 'left' | 'right') => {
    const numericValue = value.replace(/[^0-9]/g, '');
    const limitedValue = numericValue.slice(0, 3);

    if (side === 'left') {
      setAmountLeft(limitedValue);
    } else {
      setAmountRight(limitedValue);
    }
  };

  const handleSave = () => {
    const leftMl = parseInt(amountLeft) || 0;
    const rightMl = parseInt(amountRight) || 0;

    const details: PumpingDetails = {
      durationMinutes,
      amountLeftMl: leftMl > 0 ? leftMl : undefined,
      amountRightMl: rightMl > 0 ? rightMl : undefined,
      amountTotalMl: leftMl + rightMl,
      notes: notes || undefined,
    };

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

  const totalAmount = (parseInt(amountLeft) || 0) + (parseInt(amountRight) || 0);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-end sm:justify-center bg-black/40 backdrop-blur-sm px-0 sm:px-4 pb-0 sm:pb-8">
      <motion.div
        initial={{ y: "100%", opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: "100%", opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg bg-background/95 backdrop-blur-2xl sm:rounded-[36px] rounded-t-[36px] shadow-2xl border border-white/20 flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/50 sticky top-0 bg-background/50 backdrop-blur-md z-10 transition-colors">
          <button onClick={onClose} className="p-2 -ml-2 rounded-full bg-secondary/50 hover:bg-secondary transition-colors">
            <X size={20} className="text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <Droplets size={20} className="text-orange-400" />
            <h2 className="text-xl font-bold tracking-tight text-foreground">บันทึกการปั๊มนม</h2>
          </div>
          <div className="w-10" />
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-6">
          {/* Amount Input Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Left Breast */}
            <div className="p-5 rounded-3xl border border-white/5 bg-white/90 dark:bg-card/50 backdrop-blur-sm shadow-sm flex flex-col items-center">
              <span className="text-3xl mb-2 block">🤱</span>
              <p className="text-sm text-muted-foreground mb-3 font-semibold uppercase tracking-wider">ซ้าย</p>
              <div className="flex items-center justify-center gap-2">
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={amountLeft}
                  onChange={(e) => handleAmountChange(e.target.value, 'left')}
                  placeholder="0"
                  className="w-28 text-center text-3xl font-bold h-14 rounded-2xl border border-white/10 bg-background/50 text-foreground focus-visible:ring-orange-400/40 shadow-inner"
                />
                <span className="text-muted-foreground font-medium text-base">ml</span>
              </div>
            </div>

            {/* Right Breast */}
            <div className="p-5 rounded-3xl border border-white/5 bg-white/90 dark:bg-card/50 backdrop-blur-sm shadow-sm flex flex-col items-center">
              <span className="text-3xl mb-2 block">🤱</span>
              <p className="text-sm text-muted-foreground mb-3 font-semibold uppercase tracking-wider">ขวา</p>
              <div className="flex items-center justify-center gap-2">
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={amountRight}
                  onChange={(e) => handleAmountChange(e.target.value, 'right')}
                  placeholder="0"
                  className="w-28 text-center text-3xl font-bold h-14 rounded-2xl border border-white/10 bg-background/50 text-foreground focus-visible:ring-orange-400/40 shadow-inner"
                />
                <span className="text-muted-foreground font-medium text-base">ml</span>
              </div>
            </div>
          </div>

          {/* Total Display */}
          <div className="rounded-3xl p-6 mb-6 text-center border border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-orange-400/10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-400/10 rounded-full blur-2xl -ml-8 -mb-8"></div>

            <p className="text-sm text-orange-600/80 dark:text-orange-400/80 mb-2 font-bold uppercase tracking-widest relative z-10">รวมทั้งหมด</p>
            <div className="flex items-baseline justify-center relative z-10">
              <span className="text-6xl font-black text-orange-500 tracking-tighter tabular-nums drop-shadow-sm">{totalAmount}</span>
              <span className="text-orange-500/70 font-semibold text-xl ml-2">ml</span>
            </div>
          </div>

          {/* Duration */}
          <div className="mb-6">
            <p className="text-base font-semibold text-muted-foreground mb-2 block">
              ระยะเวลาปั๊ม
            </p>
            <div className="flex items-center gap-4 bg-white/90 dark:bg-card/50 backdrop-blur-sm rounded-3xl border border-white/5 p-4">
              <button
                onClick={() => setDurationMinutes(Math.max(5, durationMinutes - 5))}
                className="p-3 rounded-2xl bg-secondary/80 text-foreground hover:bg-secondary transition-colors"
              >
                <Minus size={20} />
              </button>
              <div className="flex-1 text-center">
                <span className="text-4xl font-bold tracking-tight text-foreground tabular-nums">{durationMinutes}</span>
                <span className="text-muted-foreground ml-2 text-base font-medium">นาที</span>
              </div>
              <button
                onClick={() => setDurationMinutes(Math.min(60, durationMinutes + 5))}
                className="p-3 rounded-2xl bg-secondary/80 text-foreground hover:bg-secondary transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Date Selector */}
          <div className="mb-4 text-center w-full">
            <div className="flex items-center justify-between gap-3 bg-white/90 dark:bg-card/50 backdrop-blur-sm rounded-3xl border border-white/5 p-3">
              <button
                onClick={handlePrevDay}
                className="size-8 rounded-full bg-secondary/50 flex items-center justify-center text-foreground hover:bg-secondary transition-colors"
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
                  <span className="text-lg font-bold tracking-tight truncate">
                    {startTime.getDate() === new Date().getDate() && startTime.getMonth() === new Date().getMonth() && startTime.getFullYear() === new Date().getFullYear() ?
                      'วันนี้' : formatDate(startTime)}
                  </span>
                </div>
              </div>
              <button
                onClick={handleNextDay}
                disabled={startTime.getDate() === new Date().getDate() && startTime.getMonth() === new Date().getMonth() && startTime.getFullYear() === new Date().getFullYear()}
                className="size-8 rounded-full bg-secondary/50 flex items-center justify-center text-foreground hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Time & Quick Start */}
          <div className="mb-6">
            <p className="text-base font-semibold text-muted-foreground mb-2 block">
              เวลา
            </p>
            <div className="flex items-center gap-3 bg-white/90 dark:bg-card/50 backdrop-blur-sm rounded-3xl border border-white/5 p-3">
              <button
                onClick={() => adjustTime(-30)}
                className="px-4 py-2.5 rounded-2xl bg-secondary/50 hover:bg-secondary text-base font-semibold text-foreground transition-colors"
              >
                -30น.
              </button>
              <div className="flex-1 text-center">
                <span className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
                  {formatTime(startTime)}
                </span>
              </div>
              <button
                onClick={() => adjustTime(30)}
                className="px-4 py-2.5 rounded-2xl bg-secondary/50 hover:bg-secondary text-base font-semibold text-foreground transition-colors"
              >
                +30น.
              </button>
            </div>
            <button
              onClick={() => setStartTime(new Date())}
              className="w-full mt-3 py-3 rounded-2xl bg-orange-500/10 text-orange-500 font-bold text-base hover:bg-orange-500/20 transition-all border border-orange-500/20"
            >
              ⏱️ เริ่มตอนนี้
            </button>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label htmlFor="pumping-notes" className="text-base font-semibold text-muted-foreground mb-2 block">
              หมายเหตุ (ไม่บังคับ)
            </label>
            <textarea
              id="pumping-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เพิ่มบันทึกเพิ่มเติม..."
              className="w-full bg-white/90 dark:bg-card/50 backdrop-blur-sm border border-white/5 rounded-3xl p-5 text-base text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-orange-400/50 transition-all shadow-inner"
              rows={4}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="p-6 border-t border-border/50 bg-background/50 backdrop-blur-md sticky bottom-0 z-10">
          <button
            onClick={handleSave}
            disabled={totalAmount === 0}
            className="w-full py-4 rounded-3xl bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold tracking-tight text-xl shadow-lg shadow-orange-500/30 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Droplets size={20} className="fill-white/20" />
            บันทึก
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PumpingModal;
