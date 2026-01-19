import React, { useEffect, useState } from 'react';
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
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [endTime, setEndTime] = useState<Date>(roundToNearest30(new Date()));
  const [notes, setNotes] = useState('');
  const [secondsTick, setSecondsTick] = useState(() => new Date().getSeconds());

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsTick((prev) => (prev + 1) % 60);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  const pad2 = (value: number) => value.toString().padStart(2, '0');
  const wrap = (value: number, max: number) => (value + max) % max;

  const clayCardStyle: React.CSSProperties = {
    backgroundColor: 'rgba(245, 247, 250, 0.95)',
    backdropFilter: 'blur(10px)',
    boxShadow:
      '8px 8px 16px rgba(0, 0, 0, 0.25), -8px -8px 16px rgba(255, 255, 255, 0.08), inset 2px 2px 4px rgba(255, 255, 255, 0.7), inset -2px -2px 4px rgba(0, 0, 0, 0.05)',
    borderRadius: '2rem',
  };

  const clayInsetStyle: React.CSSProperties = {
    backgroundColor: '#e6e9ef',
    boxShadow: 'inset 6px 6px 12px rgba(0, 0, 0, 0.15), inset -6px -6px 12px rgba(255, 255, 255, 0.8)',
  };

  const clayButtonStyle: React.CSSProperties = {
    backgroundColor: '#f0f2f4',
    boxShadow:
      '12px 12px 24px rgba(0, 0, 0, 0.3), -12px -12px 24px rgba(255, 255, 255, 0.1), inset 4px 4px 8px rgba(255, 255, 255, 1), inset -4px -4px 8px rgba(0, 0, 0, 0.1)',
  };

  const slotFadeStyle: React.CSSProperties = {
    background:
      'linear-gradient(180deg, rgba(230,233,239,1) 0%, rgba(230,233,239,0) 20%, rgba(230,233,239,0) 80%, rgba(230,233,239,1) 100%)',
  };

  const handleSave = () => {
    const startTime = new Date(endTime.getTime() - durationMinutes * 60000);
    const details: SleepDetails = {
      durationMinutes,
      endTime,
      notes: notes || undefined,
    };

    onSave({
      timestamp: startTime,
      details,
    });
  };

  const adjustTime = (minutesOffset: number) => {
    const newTime = new Date(endTime.getTime() + minutesOffset * 60000);
    setEndTime(newTime);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden text-white"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#1e3a8a] to-[#3b82f6]" />

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

      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <button
          onClick={onClose}
          className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
        >
          <X size={20} />
        </button>
        <div className="flex items-center gap-3 text-white">
          <div className="size-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg">
            <Moon className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-white text-lg font-bold tracking-wide">Sleep & Dream</h2>
        </div>
        <div className="w-10" />
      </header>

      <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar">
        <div className="flex flex-col items-center gap-8 px-6 pb-10 pt-2">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center flex flex-col gap-2"
          >
            <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-tight drop-shadow-lg">
              ฝันดีนะ
            </h1>
            <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/10 w-fit mx-auto">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white text-sm font-medium tracking-wide">กำลังบันทึกการนอน</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            style={clayCardStyle}
            className="p-6 md:p-8 flex flex-col items-center gap-4 w-full max-w-[520px]"
          >
            <div className="flex items-center justify-center gap-2 md:gap-4 w-full">
              <div className="flex flex-col items-center gap-2">
                <div
                  style={clayInsetStyle}
                  className="relative w-20 h-24 md:w-24 md:h-32 rounded-2xl flex items-center justify-center overflow-hidden"
                >
                  <div className="absolute inset-0 z-10 pointer-events-none" style={slotFadeStyle} />
                  <div className="flex flex-col items-center">
                    <span className="text-gray-300 text-2xl font-bold opacity-40 blur-[0.5px]">
                      {pad2(Math.max(0, hours - 1))}
                    </span>
                    <motion.span
                      key={hours}
                      initial={{ scale: 0.96, opacity: 0.6 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-[#111418] text-5xl md:text-6xl font-black leading-none py-2"
                    >
                      {pad2(hours)}
                    </motion.span>
                    <span className="text-gray-300 text-2xl font-bold opacity-40 blur-[0.5px]">
                      {pad2(Math.min(99, hours + 1))}
                    </span>
                  </div>
                </div>
                <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Hours</span>
              </div>

              <div className="text-slate-300 text-4xl font-bold mb-6">:</div>

              <div className="flex flex-col items-center gap-2">
                <div
                  style={clayInsetStyle}
                  className="relative w-20 h-24 md:w-24 md:h-32 rounded-2xl flex items-center justify-center overflow-hidden"
                >
                  <div className="absolute inset-0 z-10 pointer-events-none" style={slotFadeStyle} />
                  <div className="flex flex-col items-center">
                    <span className="text-gray-300 text-2xl font-bold opacity-40 blur-[0.5px]">
                      {pad2(wrap(minutes - 1, 60))}
                    </span>
                    <motion.span
                      key={minutes}
                      initial={{ scale: 0.96, opacity: 0.6 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-[#111418] text-5xl md:text-6xl font-black leading-none py-2"
                    >
                      {pad2(minutes)}
                    </motion.span>
                    <span className="text-gray-300 text-2xl font-bold opacity-40 blur-[0.5px]">
                      {pad2(wrap(minutes + 1, 60))}
                    </span>
                  </div>
                </div>
                <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Mins</span>
              </div>

              <div className="text-slate-300 text-4xl font-bold mb-6">:</div>

              <div className="flex flex-col items-center gap-2">
                <div
                  style={clayInsetStyle}
                  className="relative w-20 h-24 md:w-24 md:h-32 rounded-2xl flex items-center justify-center overflow-hidden"
                >
                  <div className="absolute inset-0 z-10 pointer-events-none" style={slotFadeStyle} />
                  <div className="flex flex-col items-center">
                    <span className="text-gray-300 text-2xl font-bold opacity-40 blur-[0.5px]">
                      {pad2(wrap(secondsTick - 1, 60))}
                    </span>
                    <motion.span
                      key={secondsTick}
                      initial={{ scale: 0.96, opacity: 0.6 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-primary text-5xl md:text-6xl font-black leading-none py-2"
                    >
                      {pad2(secondsTick)}
                    </motion.span>
                    <span className="text-gray-300 text-2xl font-bold opacity-40 blur-[0.5px]">
                      {pad2(wrap(secondsTick + 1, 60))}
                    </span>
                  </div>
                </div>
                <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Secs</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDurationMinutes(Math.max(15, durationMinutes - 15))}
                style={clayButtonStyle}
                className="size-12 rounded-full flex items-center justify-center text-slate-500 active:scale-95 transition-transform"
                aria-label="ลดเวลา 15 นาที"
              >
                <Minus size={20} />
              </button>
              <button
                onClick={() => setDurationMinutes(Math.min(720, durationMinutes + 15))}
                style={clayButtonStyle}
                className="size-12 rounded-full flex items-center justify-center text-slate-500 active:scale-95 transition-transform"
                aria-label="เพิ่มเวลา 15 นาที"
              >
                <Plus size={20} />
              </button>
            </div>
            <p className="text-sm font-semibold text-slate-500">ระยะเวลาการนอน</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.12 }}
            className="relative group py-2"
          >
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-3xl group-hover:bg-primary/50 transition-all duration-500" />
            <button
              onClick={() => setEndTime(new Date())}
              style={clayButtonStyle}
              className="relative z-10 size-36 md:size-40 rounded-full flex flex-col items-center justify-center gap-2 text-slate-700 active:scale-95 transition-transform"
            >
              <Moon className="w-12 h-12 text-primary drop-shadow-sm" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-primary transition-colors">
                ตื่นแล้ว
              </span>
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-[760px]">
            <div style={clayCardStyle} className="p-5 flex items-center gap-4">
              <div className="size-12 rounded-full bg-blue-100 flex items-center justify-center shadow-inner text-blue-600">
                <Moon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">เวลาตื่น</span>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-2xl font-extrabold text-slate-800">{formatTime(endTime)}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => adjustTime(-30)}
                      className="px-3 py-1.5 rounded-full bg-white/90 text-slate-500 text-xs font-bold shadow-sm hover:bg-white transition"
                    >
                      -30น.
                    </button>
                    <button
                      onClick={() => adjustTime(30)}
                      className="px-3 py-1.5 rounded-full bg-white/90 text-slate-500 text-xs font-bold shadow-sm hover:bg-white transition"
                    >
                      +30น.
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div style={clayCardStyle} className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="size-12 rounded-full bg-indigo-100 flex items-center justify-center shadow-inner text-indigo-600">
                  <Moon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">หมายเหตุ</span>
                  <p className="text-sm font-medium text-slate-500">เพิ่มรายละเอียดการนอน</p>
                </div>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="เช่น หลับปุ๋ย, ตื่นมาร้อง..."
                className="w-full bg-white/80 border border-white/60 rounded-2xl p-3 text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
                rows={3}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-6 pb-6">
        <button
          onClick={handleSave}
          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-lg active:scale-[0.98] transition-transform"
        >
          บันทึก
        </button>
      </div>
    </motion.div>
  );
};

export default SleepModal;
