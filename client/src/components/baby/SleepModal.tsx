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
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [endTime, setEndTime] = useState<Date>(roundToNearest30(new Date()));
  const [notes, setNotes] = useState('');

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  const pad2 = (value: number) => value.toString().padStart(2, '0');
  const sleepTargetMinutes = 12 * 60;
  const sleepTargetHours = sleepTargetMinutes / 60;
  const minDuration = 15;
  const maxDuration = sleepTargetMinutes;
  const durationStep = 15;
  const quickDurations = [30, 60, 90, 120, 180, 240];

  const clampDuration = (value: number) => Math.min(maxDuration, Math.max(minDuration, value));
  const startTime = new Date(endTime.getTime() - durationMinutes * 60000);
  const sleepPercent = Math.min(100, Math.round((durationMinutes / sleepTargetMinutes) * 100));
  const endTimeValue = `${pad2(endTime.getHours())}:${pad2(endTime.getMinutes())}`;

  const formatDurationLabel = (totalMinutes: number) => {
    if (totalMinutes < 60) return `${totalMinutes}น.`;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return m === 0 ? `${h}ชม.` : `${h}ชม. ${m}น.`;
  };

  const cardClass =
    'rounded-[28px] border border-white/15 bg-white/95 text-slate-900 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.6)] backdrop-blur-xl';
  const softActionClass =
    'bg-slate-900/5 border border-white/70 text-slate-700 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.35)] hover:bg-slate-900/10 active:scale-95 transition-transform';

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

  const handleDurationChange = (value: number) => {
    setDurationMinutes(clampDuration(value));
  };

  const adjustTime = (minutesOffset: number) => {
    const newTime = new Date(endTime.getTime() + minutesOffset * 60000);
    setEndTime(newTime);
  };

  const handleEndTimeChange = (value: string) => {
    const [hourStr, minuteStr] = value.split(':');
    const nextHour = Number(hourStr);
    const nextMinute = Number(minuteStr);
    if (Number.isNaN(nextHour) || Number.isNaN(nextMinute)) return;
    const nextTime = new Date(endTime);
    nextTime.setHours(nextHour, nextMinute, 0, 0);
    setEndTime(nextTime);
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
              <span className="text-white text-base font-medium tracking-wide">กำลังบันทึกการนอน</span>
            </div>
          </motion.div>

          <div className="w-full max-w-[820px] flex flex-col gap-5">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className={`${cardClass} p-6 md:p-8`}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">ระยะเวลาการนอน</span>
                  <div className="flex items-end gap-2 mt-2">
                    <span className="text-4xl md:text-5xl font-black text-slate-800">{hours}</span>
                    <span className="text-base font-bold text-slate-400">ชม.</span>
                    <span className="text-4xl md:text-5xl font-black text-slate-800">{pad2(minutes)}</span>
                    <span className="text-base font-bold text-slate-400">น.</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">เริ่มหลับประมาณ {formatTime(startTime)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDurationChange(durationMinutes - durationStep)}
                    className={`size-12 rounded-2xl flex items-center justify-center ${softActionClass}`}
                    aria-label={`ลดเวลา ${durationStep} นาที`}
                  >
                    <Minus size={18} />
                  </button>
                  <button
                    onClick={() => handleDurationChange(durationMinutes + durationStep)}
                    className={`size-12 rounded-2xl flex items-center justify-center ${softActionClass}`}
                    aria-label={`เพิ่มเวลา ${durationStep} นาที`}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <div className="mt-5">
                <input
                  type="range"
                  min={minDuration}
                  max={maxDuration}
                  step={durationStep}
                  value={durationMinutes}
                  onChange={(event) => handleDurationChange(Number(event.target.value))}
                  className="w-full h-2 rounded-full bg-slate-200/80 accent-primary"
                  aria-label="ปรับระยะเวลาการนอน"
                />
                <div className="flex justify-between text-xs text-slate-400 font-semibold mt-2">
                  <span>{formatDurationLabel(minDuration)}</span>
                  <span>{formatDurationLabel(maxDuration)}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {quickDurations.map((value) => {
                  const isActive = durationMinutes === value;
                  return (
                    <button
                      key={value}
                      onClick={() => handleDurationChange(value)}
                      className={`px-3 py-2 rounded-full text-sm font-bold transition ${isActive
                        ? "bg-primary text-white shadow-md"
                        : "bg-slate-900/5 text-slate-600 hover:bg-slate-900/10"
                        }`}
                    >
                      {formatDurationLabel(value)}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-500">
                  <span>เป้าหมาย {sleepTargetHours} ชม.</span>
                  <span className="text-primary font-black">{sleepPercent}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary"
                    style={{ width: `${sleepPercent}%` }}
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`${cardClass} p-5 md:p-6 flex flex-col gap-4`}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">เวลาตื่น</span>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <input
                      type="time"
                      value={endTimeValue}
                      onChange={(event) => handleEndTimeChange(event.target.value)}
                      className="rounded-2xl border border-white/70 bg-white/95 px-4 py-3 text-2xl font-black text-slate-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <span className="text-sm font-semibold text-slate-500">แตะเพื่อเลือกเวลา</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">หรือปรับทีละ 30 นาทีด้วยปุ่มด้านล่าง</p>
                </div>
                <button
                  onClick={() => setEndTime(new Date())}
                  className={`px-5 py-3 rounded-2xl font-bold ${softActionClass}`}
                >
                  ตอนนี้
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => adjustTime(-30)}
                  className={`px-4 py-2 rounded-full text-sm font-bold ${softActionClass}`}
                >
                  -30น.
                </button>
                <button
                  onClick={() => adjustTime(30)}
                  className={`px-4 py-2 rounded-full text-sm font-bold ${softActionClass}`}
                >
                  +30น.
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className={`${cardClass} p-5 md:p-6`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="size-12 rounded-2xl bg-slate-900/5 border border-white/70 flex items-center justify-center shadow-inner text-slate-700">
                  <Moon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">หมายเหตุ</span>
                  <p className="text-base font-medium text-slate-500">เพิ่มรายละเอียดการนอน</p>
                </div>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="เช่น หลับปุ๋ย, ตื่นมาร้อง..."
                className="w-full bg-white/95 border border-white/70 rounded-2xl p-3 text-base text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
                rows={4}
              />
            </motion.div>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-6 pb-6">
        <button
          onClick={handleSave}
          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-xl shadow-lg active:scale-[0.98] transition-transform"
        >
          บันทึก
        </button>
      </div>
    </motion.div>
  );
};

export default SleepModal;
