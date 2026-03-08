import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Minus, CalendarDays , ChevronLeft, ChevronRight} from 'lucide-react';
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
    // Allow only numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    // Limit to 3 digits max (999ml)
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#f7f2e8] text-[#4a3b33] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#e6d6c6] bg-[#f7f2e8]">
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-full hover:bg-[#efe5d8] transition-colors"
          aria-label="ปิด"
        >
          <X size={22} className="text-[#4a3b33]" />
        </button>
        <h2 className="text-xl font-bold text-[#4a3b33]">บันทึกการปั๊มนม</h2>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-6">
        {/* Amount Input Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Left Breast */}
          <div className="p-5 rounded-3xl border border-[#e3d3c4] bg-[#fbf7ee] shadow-sm">
            <div className="text-center">
              <span className="text-3xl mb-2 block">🤱</span>
              <p className="text-sm text-[#9b8776] mb-3 font-semibold">ซ้าย</p>
              <div className="flex items-center justify-center gap-2">
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={amountLeft}
                  onChange={(e) => handleAmountChange(e.target.value, 'left')}
                  placeholder="0"
                  className="w-28 text-center text-3xl font-bold h-14 rounded-full border border-[#ff7a48] bg-[#fffaf2] text-[#4a3b33] focus-visible:ring-[#ff7a48]/40"
                />
                <span className="text-[#9b8776] text-base">ml</span>
              </div>
            </div>
          </div>

          {/* Right Breast */}
          <div className="p-5 rounded-3xl border border-[#e3d3c4] bg-[#fbf7ee] shadow-sm">
            <div className="text-center">
              <span className="text-3xl mb-2 block">🤱</span>
              <p className="text-sm text-[#9b8776] mb-3 font-semibold">ขวา</p>
              <div className="flex items-center justify-center gap-2">
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={amountRight}
                  onChange={(e) => handleAmountChange(e.target.value, 'right')}
                  placeholder="0"
                  className="w-28 text-center text-3xl font-bold h-14 rounded-full border border-[#ff7a48] bg-[#fffaf2] text-[#4a3b33] focus-visible:ring-[#ff7a48]/40"
                />
                <span className="text-[#9b8776] text-base">ml</span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Display */}
        <div className="rounded-3xl p-4 mb-6 text-center border border-[#f4c6a4] bg-[#f9e2d1]">
          <p className="text-base text-[#9b8776] mb-1 font-semibold">รวมทั้งหมด</p>
          <span className="text-5xl font-bold text-[#ff6a3d]">{totalAmount}</span>
          <span className="text-[#ff6a3d] text-xl ml-2">ml</span>
        </div>

        {/* Duration */}
        <div className="mb-6">
          <p className="text-base font-semibold text-[#9b8776] mb-2 block">
            ระยะเวลาปั๊ม
          </p>
          <div className="flex items-center gap-4 bg-[#fbf7ee] rounded-3xl border border-[#e3d3c4] p-4">
            <button
              onClick={() => setDurationMinutes(Math.max(5, durationMinutes - 5))}
              className="p-3 rounded-full bg-[#e6edf9] text-[#5b5b5b] hover:bg-[#dfe7f7] transition-colors"
            >
              <Minus size={20} />
            </button>
            <div className="flex-1 text-center">
              <span className="text-4xl font-bold text-[#4a3b33]">{durationMinutes}</span>
              <span className="text-[#9b8776] ml-2 text-base">นาที</span>
            </div>
            <button
              onClick={() => setDurationMinutes(Math.min(60, durationMinutes + 5))}
              className="p-3 rounded-full bg-[#e6edf9] text-[#5b5b5b] hover:bg-[#dfe7f7] transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Time Adjuster */}
                {/* Date Selector */}
        <div className="mb-4 text-center w-full">
          <div className="flex items-center justify-between gap-3 bg-[#fbf7ee] rounded-3xl border border-[#e3d3c4] p-3">
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
          <p className="text-base font-semibold text-[#9b8776] mb-2 block">
            เวลา
          </p>
          <div className="flex items-center gap-3 bg-[#fbf7ee] rounded-3xl border border-[#e3d3c4] p-3">
            <button
              onClick={() => adjustTime(-30)}
              className="px-4 py-2.5 rounded-full bg-[#e6edf9] text-base font-semibold text-[#5b5b5b]"
            >
              -30น.
            </button>
            <div className="flex-1 text-center">
              <span className="text-2xl font-bold text-[#4a3b33]">
                {formatTime(startTime)}
              </span>
            </div>
            <button
              onClick={() => adjustTime(30)}
              className="px-4 py-2.5 rounded-full bg-[#e6edf9] text-base font-semibold text-[#5b5b5b]"
            >
              +30น.
            </button>
          </div>
          <button
            onClick={() => setStartTime(new Date())}
            className="w-full mt-3 py-3 rounded-full bg-[#f8d6c4] text-[#ff6a3d] font-semibold text-base hover:bg-[#f6ccb7] transition-all"
          >
            ⏱️ เริ่มตอนนี้
          </button>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label htmlFor="pumping-notes" className="text-base font-semibold text-[#9b8776] mb-2 block">
            หมายเหตุ (ไม่บังคับ)
          </label>
          <textarea
            id="pumping-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="เพิ่มบันทึกเพิ่มเติม..."
            className="w-full bg-[#fbf7ee] border border-[#e3d3c4] rounded-3xl p-4 text-base text-[#4a3b33] placeholder:text-[#b29c8a] resize-none focus:outline-none focus:ring-2 focus:ring-[#ff7a48]/30"
            rows={4}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="p-6 border-t border-[#e6d6c6] bg-[#f7f2e8]">
        <button
          onClick={handleSave}
          disabled={totalAmount === 0}
          className="w-full py-4 rounded-2xl bg-[#ffb993] text-[#5a2b17] font-bold text-xl shadow-[0_14px_30px_-22px_rgba(90,43,23,0.6)] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          บันทึก
        </button>
      </div>
    </motion.div>
  );
};

export default PumpingModal;
