import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Minus, Plus, Moon } from 'lucide-react';
import { SleepDetails } from '@/types/baby';
import { roundToNearest30, formatTime } from '@/lib/babyUtils';

interface SleepModalProps {
  onClose: () => void;
  onSave: (data: { timestamp: Date; details: SleepDetails }) => void;
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

const SleepModal: React.FC<SleepModalProps> = ({ onClose, onSave }) => {
  // Initialize with end time now, start time 1 hour ago
  const [endTime, setEndTime] = useState<Date>(roundToNearest30(new Date()));
  const [startTime, setStartTime] = useState<Date>(() => {
    const end = roundToNearest30(new Date());
    return new Date(end.getTime() - 60 * 60000); // Default 1 hour duration
  });
  const [notes, setNotes] = useState('');

  const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
  const pad2 = (value: number) => value.toString().padStart(2, '0');

  const cardClass = 'rounded-[28px] border border-white/15 bg-white/95 text-slate-900 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.6)] backdrop-blur-xl';

  const handleSave = () => {
    // Ensure duration is positive?
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

    // If negative (end before start), maybe they meant overnight? add 24h?
    // For simplicity, we just save as is or warn? 
    // Usually if user sets Start 23:00 End 01:00, the dates should reflect that.
    // The simple time pickers only change HH:MM on the specific Date object.

    // Auto-fix for overnight:
    // If endTime < startTime, assume simple overnight case if within reasonable range (e.g. < 24h)
    // But since we modify the specific Date object in state, if we use setHours below, we are changing the SAME day.
    // So if Start 10:00 End 09:00 -> duration -1 hour.
    // We should probably check if duration <= 0, add 1 day to EndTime?
    let finalEndTime = endTime;
    if (finalEndTime <= startTime) {
      finalEndTime = new Date(endTime.getTime() + 24 * 60 * 60000);
    }

    // Recalc duration with final end time
    const finalDuration = Math.round((finalEndTime.getTime() - startTime.getTime()) / 60000);

    const details: SleepDetails = {
      durationMinutes: Math.max(0, finalDuration),
      endTime: finalEndTime,
      notes: notes || undefined,
    };

    onSave({
      timestamp: startTime,
      details,
    });
  };


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden text-white"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b1024] via-[#172554] to-[#1d4ed8]" />

      <div className="absolute inset-0 pointer-events-none">
        {stars.map((star, index) => (
          <motion.span
            key={`${star.className}-${index}`}
            className={`absolute ${star.className} rounded-full bg-white`}
            style={{ opacity: star.opacity, boxShadow: star.glow }}
            animate={{ opacity: [star.opacity, star.opacity * 0.4, star.opacity] }}
            transition={{ duration: star.duration, repeat: Infinity, delay: star.delay, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <button
          onClick={onClose}
          className="flex size-11 items-center justify-center rounded-full bg-white/10 text-white border border-white/15 hover:bg-white/20 transition"
        >
          <X size={20} />
        </button>
        <div className="flex items-center gap-3 text-white">
          <div className="size-11 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg border border-white/15">
            <Moon className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-white text-xl font-bold tracking-wide">Sleep & Dream</h2>
        </div>
        <div className="w-10" />
      </header>

      <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar">
        <div className="flex flex-col items-center gap-6 px-6 pb-10 pt-2">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center flex flex-col gap-2"
          >
            <h1 className="text-white text-3xl md:text-4xl font-black leading-tight tracking-tight drop-shadow-lg">
              บันทึกการนอน
            </h1>
            <p className="text-slate-300 text-sm">
              การนอนหลับที่ดีช่วยพัฒนาสมองและการเจริญเติบโต
            </p>
          </motion.div>

          <div className="w-full max-w-md flex flex-col gap-5">

            {/* Time Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Time */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className={`${cardClass} p-5 flex flex-col gap-3 items-center text-center relative overflow-hidden group`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider relative z-10">เริ่มหลับ</span>
                <input
                  type="time"
                  value={`${pad2(startTime.getHours())}:${pad2(startTime.getMinutes())}`}
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(':').map(Number);
                    const newStart = new Date(startTime);
                    newStart.setHours(h, m);
                    // Adjust end time if start is after end? No, let user handle it or shift end time?
                    // Better UX: if start > end, assume overnight, allow it.
                    // But here we rely on duration calculates.
                    // Let's keep it simple: update start, recalc duration?
                    // No, prompted design is Start & End.
                    // So we update state directly.
                    setStartTime(newStart);
                  }}
                  className="bg-transparent text-4xl font-black text-slate-800 text-center w-full focus:outline-none relative z-10"
                />
                <div className="flex gap-2 justify-center relative z-10">
                  <button onClick={() => setStartTime(new Date(startTime.getTime() - 15 * 60000))} className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600">-15</button>
                  <button onClick={() => setStartTime(new Date())} className="p-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-xs font-bold text-primary">ตอนนี้</button>
                  <button onClick={() => setStartTime(new Date(startTime.getTime() + 15 * 60000))} className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600">+15</button>
                </div>
              </motion.div>

              {/* End Time */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className={`${cardClass} p-5 flex flex-col gap-3 items-center text-center relative overflow-hidden group`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider relative z-10">ตื่นนอน</span>
                <input
                  type="time"
                  value={`${pad2(endTime.getHours())}:${pad2(endTime.getMinutes())}`}
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(':').map(Number);
                    const newEnd = new Date(endTime);
                    newEnd.setHours(h, m);
                    setEndTime(newEnd);
                  }}
                  className="bg-transparent text-5xl font-black text-slate-800 text-center w-full focus:outline-none relative z-10"
                />
                <div className="flex gap-2 justify-center relative z-10 w-full">
                  <button onClick={() => setEndTime(new Date(endTime.getTime() - 15 * 60000))} className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600 transition">-15</button>
                  <button onClick={() => setEndTime(new Date())} className="flex-1 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-xs font-bold text-primary transition">ตอนนี้</button>
                  <button onClick={() => setEndTime(new Date(endTime.getTime() + 15 * 60000))} className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600 transition">+15</button>
                </div>
              </motion.div>
            </div>

            {/* Total Duration Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center"
            >
              <span className="text-slate-300 text-sm uppercase tracking-wider font-bold">รวมเวลาการนอน</span>
              <div className="text-3xl font-black text-white mt-1">
                {Math.floor(durationMinutes / 60) > 0 && <span className="mr-2">{Math.floor(durationMinutes / 60)} ชม.</span>}
                <span>{durationMinutes % 60} นาที</span>
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
                <div className="bg-yellow-100/50 p-2 rounded-xl text-yellow-600">
                  <Moon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm mb-1">คำแนะนำการนอน (ตามวัย)</h3>
                  <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
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
              className={`${cardClass} p-5`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">บันทึกเพิ่มเติม</span>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ลูกนอนเป็นอย่างไรบ้าง..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all"
                rows={3}
              />
            </motion.div>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-6 pb-6">
        <button
          onClick={handleSave}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 text-white font-bold text-xl shadow-lg shadow-indigo-500/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          <Moon size={20} className="fill-white" />
          บันทึกการนอน
        </button>
      </div>
    </motion.div>
  );
};

export default SleepModal;
