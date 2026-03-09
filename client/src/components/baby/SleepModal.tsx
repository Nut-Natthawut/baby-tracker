import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Moon, ChevronLeft, ChevronRight } from 'lucide-react';
import { SleepDetails } from '@/types/baby';
import { roundToNearest30 } from '@/lib/babyUtils';

interface SleepModalProps {
  onClose: () => void;
  onSave: (data: { timestamp: Date; details: SleepDetails }) => void;
  initialData?: { timestamp: Date; details: SleepDetails };
}

const stars = [
  { className: 'top-[15%] left-[10%] w-1 h-1', opacity: 0.8, glow: '0 0 10px rgba(255,255,255,0.9)', duration: 3.4, delay: 0 },
  { className: 'top-[25%] right-[20%] w-1.5 h-1.5', opacity: 0.9, glow: '0 0 12px rgba(255,255,255,0.95)', duration: 4.2, delay: 0.6 },
  { className: 'bottom-[30%] left-[25%] w-1 h-1', opacity: 0.6, glow: '0 0 8px rgba(255,255,255,0.7)', duration: 3.8, delay: 1.1 },
  { className: 'top-[40%] left-[5%] w-0.5 h-0.5', opacity: 0.5, glow: '0 0 6px rgba(255,255,255,0.6)', duration: 3.1, delay: 0.4 },
  { className: 'top-[10%] right-[35%] w-0.5 h-0.5', opacity: 0.7, glow: '0 0 7px rgba(255,255,255,0.8)', duration: 2.9, delay: 0.2 },
  { className: 'bottom-[20%] right-[10%] w-0.5 h-0.5', opacity: 0.6, glow: '0 0 7px rgba(255,255,255,0.65)', duration: 3.6, delay: 1.3 },
  { className: 'top-[60%] left-[80%] w-0.5 h-0.5', opacity: 0.4, glow: '0 0 6px rgba(255,255,255,0.5)', duration: 3.3, delay: 0.9 },
  { className: 'top-[80%] left-[15%] w-0.5 h-0.5', opacity: 0.3, glow: '0 0 5px rgba(255,255,255,0.4)', duration: 4.1, delay: 0.7 },
  { className: 'top-[50%] right-[50%] w-0.5 h-0.5', opacity: 0.5, glow: '0 0 6px rgba(255,255,255,0.55)', duration: 3.5, delay: 0.5 },
];

const SleepModal: React.FC<SleepModalProps> = ({ onClose, onSave, initialData }) => {
  const [endTime, setEndTime] = useState<Date>(
    initialData?.details?.endTime ? new Date(initialData.details.endTime) : roundToNearest30(new Date())
  );
  const [startTime, setStartTime] = useState<Date>(() => {
    if (initialData?.timestamp) return initialData.timestamp;
    const end = roundToNearest30(new Date());
    return new Date(end.getTime() - 60 * 60000);
  });
  const datePickerRef = useRef<HTMLInputElement>(null);
  const [notes, setNotes] = useState(initialData?.details?.notes || '');

  let displayEndTime = new Date(endTime);
  if (displayEndTime < startTime) {
    displayEndTime = new Date(displayEndTime.getTime() + 24 * 60 * 60000);
  }
  const durationMinutes = Math.round((displayEndTime.getTime() - startTime.getTime()) / 60000);
  const pad2 = (value: number) => {
    if (isNaN(value)) return '00';
    return value.toString().padStart(2, '0');
  };

  const cardClass = 'rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl';

  const handleSave = () => {
    let finalStartTime = new Date(startTime);
    let finalEndTime = new Date(endTime);

    if (finalEndTime < finalStartTime) {
      finalEndTime = new Date(finalEndTime.getTime() + 24 * 60 * 60000);
    }

    const finalDuration = Math.round((finalEndTime.getTime() - finalStartTime.getTime()) / 60000);

    const details: SleepDetails = {
      durationMinutes: Math.max(0, finalDuration),
      endTime: finalEndTime,
      notes: notes || undefined,
    };

    onSave({
      timestamp: finalStartTime,
      details,
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const [y, m, d] = e.target.value.split('-').map(Number);
      setStartTime(prev => {
        const newDate = new Date(prev);
        newDate.setFullYear(y, m - 1, d);
        return newDate;
      });
      setEndTime(prev => {
        const newDate = new Date(prev);
        newDate.setFullYear(y, m - 1, d);
        return newDate;
      });
    }
  };

  const handlePrevDay = () => {
    setStartTime(prev => new Date(prev.getTime() - 86400000));
    setEndTime(prev => new Date(prev.getTime() - 86400000));
  };
  const handleNextDay = () => {
    setStartTime(prev => new Date(prev.getTime() + 86400000));
    setEndTime(prev => new Date(prev.getTime() + 86400000));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-end sm:justify-center bg-black/40 backdrop-blur-sm px-0 sm:px-4 pb-0 sm:pb-8">
      <motion.div
        initial={{ y: "100%", opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: "100%", opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg bg-gradient-to-b from-[#0b1024] via-[#172554] to-[#1d4ed8] sm:rounded-[36px] rounded-t-[36px] shadow-2xl border border-white/20 flex flex-col max-h-[90vh] overflow-hidden text-white"
      >
        <div className="absolute inset-0 pointer-events-none">
          {stars.map((star, index) => (
            <motion.span
              key={`${star.className}-${index}`}
              className={`absolute ${star.className} rounded-full bg-white shadow-glow-primary`}
              style={{ opacity: star.opacity, boxShadow: star.glow }}
              animate={{ opacity: [star.opacity, star.opacity * 0.4, star.opacity] }}
              transition={{ duration: star.duration, repeat: Infinity, delay: star.delay, ease: 'easeInOut' }}
            />
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 sticky top-0 bg-white/5 backdrop-blur-md z-10 transition-colors">
          <button onClick={onClose} className="p-2 -ml-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <X size={20} className="text-white" />
          </button>
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-indigo-300 fill-indigo-300" />
            <h2 className="text-xl font-bold tracking-tight text-white">บันทึกการนอน</h2>
          </div>
          <div className="w-10" />
        </div>

        <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-6 py-6">
          <div className="flex flex-col items-center gap-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center flex flex-col gap-2"
            >
              <h1 className="text-white text-3xl font-black leading-tight tracking-tight drop-shadow-lg">
                Sleep & Dream
              </h1>
              <p className="text-indigo-200/80 text-sm">
                การนอนหลับที่ดีช่วยพัฒนาสมองและการเจริญเติบโต
              </p>
            </motion.div>

            <div className="w-full flex flex-col gap-5">
              {/* Date Selector */}
              <div className="text-center w-full">
                <div className="flex items-center justify-between gap-3 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-3">
                  <button
                    onClick={handlePrevDay}
                    className="size-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:opacity-80 transition"
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
                    className="size-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:opacity-80 transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Time Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Start Time */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`${cardClass} p-5 flex flex-col gap-3 items-center text-center relative overflow-hidden group`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider relative z-10">เริ่มหลับ</span>
                  <input
                    type="time"
                    value={`${pad2(startTime.getHours())}:${pad2(startTime.getMinutes())}`}
                    onChange={(e) => {
                      if (!e.target.value) return;
                      const [h, m] = e.target.value.split(':').map(Number);
                      const newStart = new Date(startTime);
                      newStart.setHours(h, m);
                      setStartTime(newStart);
                    }}
                    className="bg-transparent text-4xl font-black text-white text-center w-full focus:outline-none relative z-10 [color-scheme:dark]"
                  />
                  <div className="flex gap-2 justify-center w-full relative z-10">
                    <button onClick={() => setStartTime(new Date(startTime.getTime() - 15 * 60000))} className="flex-1 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition">-15</button>
                    <button onClick={() => setStartTime(new Date())} className="flex-1 py-1.5 rounded-xl bg-indigo-500/30 hover:bg-indigo-500/50 text-xs font-bold text-indigo-100 transition">ตอนนี้</button>
                    <button onClick={() => setStartTime(new Date(startTime.getTime() + 15 * 60000))} className="flex-1 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition">+15</button>
                  </div>
                </motion.div>

                {/* End Time */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`${cardClass} p-5 flex flex-col gap-3 items-center text-center relative overflow-hidden group`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider relative z-10">ตื่นนอน</span>
                  <input
                    type="time"
                    value={`${pad2(endTime.getHours())}:${pad2(endTime.getMinutes())}`}
                    onChange={(e) => {
                      if (!e.target.value) return;
                      const [h, m] = e.target.value.split(':').map(Number);
                      const newEnd = new Date(endTime);
                      newEnd.setHours(h, m);
                      setEndTime(newEnd);
                    }}
                    className="bg-transparent text-4xl font-black text-white text-center w-full focus:outline-none relative z-10 [color-scheme:dark]"
                  />
                  <div className="flex gap-2 justify-center w-full relative z-10">
                    <button onClick={() => setEndTime(new Date(endTime.getTime() - 15 * 60000))} className="flex-1 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition">-15</button>
                    <button onClick={() => setEndTime(new Date())} className="flex-1 py-1.5 rounded-xl bg-fuchsia-500/30 hover:bg-fuchsia-500/50 text-xs font-bold text-fuchsia-100 transition">ตอนนี้</button>
                    <button onClick={() => setEndTime(new Date(endTime.getTime() + 15 * 60000))} className="flex-1 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition">+15</button>
                  </div>
                </motion.div>
              </div>

              {/* Total Duration Info */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-md rounded-3xl p-4 border border-white/10 text-center"
              >
                <span className="text-indigo-200 text-sm uppercase tracking-wider font-bold">รวมเวลาการนอน</span>
                <div className="text-3xl font-black text-white mt-1 tabular-nums">
                  {Math.floor(durationMinutes / 60) > 0 && <span className="mr-2">{Math.floor(durationMinutes / 60)} ชม.</span>}
                  <span>{Math.max(0, durationMinutes) % 60} นาที</span>
                </div>
              </motion.div>

              {/* Recommendations */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`${cardClass} p-5`}
              >
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-2xl text-yellow-300">
                    <Moon size={20} className="fill-yellow-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm mb-1 tracking-tight">คำแนะนำการนอน (ตามวัย)</h3>
                    <ul className="text-xs text-indigo-100 space-y-1 list-disc list-inside">
                      <li><strong>แรกเกิด - 3 เดือน:</strong> 14-17 ชม./วัน</li>
                      <li><strong>4 - 11 เดือน:</strong> 12-15 ชม./วัน</li>
                      <li><strong>1 - 2 ปี:</strong> 11-14 ชม./วัน</li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Notes */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="text-sm font-bold text-indigo-200 uppercase tracking-wider mb-2 block">บันทึกเพิ่มเติม</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ลูกนอนเป็นอย่างไรบ้าง..."
                  className="w-full bg-white/5 border border-white/10 rounded-3xl p-5 text-sm text-white placeholder:text-indigo-200/50 resize-none focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-xl transition-all"
                  rows={3}
                />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="p-6 border-t border-white/10 bg-black/10 backdrop-blur-md sticky bottom-0 z-10 mt-auto">
          <button
            onClick={handleSave}
            className="w-full py-4 rounded-3xl bg-white text-indigo-900 font-bold tracking-tight text-xl shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:bg-indigo-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Moon size={20} className="fill-indigo-900" />
            บันทึกการนอน
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SleepModal;
