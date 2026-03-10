import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, User, Calendar, Scale } from 'lucide-react';
import { Baby } from '@/types/baby';
import CuteBabyAvatar from './CuteBabyAvatar';

interface BabyProfileModalProps {
  baby: Baby | null;
  onClose: () => void;
  onSave: (data: Omit<Baby, 'id'>) => void;
}

const BabyProfileModal: React.FC<BabyProfileModalProps> = ({ baby, onClose, onSave }) => {
  const [name, setName] = useState(baby?.name || '');
  const [birthDate, setBirthDate] = useState(() => {
    if (!baby?.birthDate) return '';
    try {
      return new Date(baby.birthDate).toISOString().split('T')[0];
    } catch {
      return baby.birthDate;
    }
  });
  const [gender, setGender] = useState<'boy' | 'girl'>(baby?.gender || 'boy');
  const [weight, setWeight] = useState(baby?.weight || '');

  const handleSave = () => {
    if (!name.trim() || !birthDate) return;

    onSave({
      name: name.trim(),
      birthDate,
      gender,
      weight: weight || undefined,
    });
  };

  const isValid = Boolean(name.trim() && birthDate);
  const title = baby ? 'แก้ไขข้อมูลลูก' : 'เพิ่มข้อมูลลูก';
  const subtitle = baby ? 'ปรับข้อมูลพื้นฐานของลูก' : 'กรอกข้อมูลพื้นฐานของลูก';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-0 sm:px-4 pb-0 sm:pb-8"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full sm:max-w-xl h-[92dvh] sm:h-auto sm:max-h-[92vh] rounded-t-[30px] sm:rounded-[28px] border border-white/60 dark:border-white/10 bg-background text-foreground shadow-[0_24px_65px_-35px_rgba(15,23,42,0.6)] flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-border/70 px-4 sm:px-6 pt-[max(0.9rem,env(safe-area-inset-top))] pb-4">
          <button
            onClick={onClose}
            className="size-9 rounded-full bg-secondary/50 hover:bg-secondary transition-colors flex items-center justify-center"
            aria-label="Close"
          >
            <X size={20} className="text-foreground" />
          </button>
          <div className="flex-1 px-3 text-center">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">{title}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
          <div className="w-9" />
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-4 sm:px-6 py-5 sm:py-6">
          <div className="flex justify-center mb-6 sm:mb-8">
            <CuteBabyAvatar gender={gender} size="lg" mood="happy" />
          </div>

          <div className="mb-6">
            <p className="text-sm sm:text-base font-semibold text-muted-foreground mb-3 block">เพศ</p>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setGender('boy')}
                className={`py-4 sm:py-6 px-3 rounded-2xl sm:rounded-3xl text-sm sm:text-base font-semibold flex flex-col items-center gap-2.5 sm:gap-3 transition-all border-2 ${
                  gender === 'boy'
                    ? 'bg-blue-500 text-white border-blue-400 shadow-lg shadow-blue-500/30'
                    : 'bg-card border-border text-muted-foreground hover:border-blue-300'
                }`}
              >
                <svg width="42" height="42" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="#E0F2FE" />
                  <ellipse cx="50" cy="52" rx="28" ry="30" fill="#F5D0C5" />
                  <ellipse cx="50" cy="28" rx="20" ry="12" fill="#8B7355" />
                  <circle cx="35" cy="22" r="6" fill="#8B7355" />
                  <circle cx="65" cy="22" r="6" fill="#8B7355" />
                  <circle cx="38" cy="48" r="4" fill="#2D2D2D" />
                  <circle cx="62" cy="48" r="4" fill="#2D2D2D" />
                  <circle cx="39.5" cy="46.5" r="1.5" fill="white" />
                  <circle cx="63.5" cy="46.5" r="1.5" fill="white" />
                  <ellipse cx="28" cy="56" rx="6" ry="4" fill="#93C5FD" opacity="0.6" />
                  <ellipse cx="72" cy="56" rx="6" ry="4" fill="#93C5FD" opacity="0.6" />
                  <path d="M42 62 Q50 70 58 62" stroke="#D4A574" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </svg>
                <span className="leading-none">ผู้ชาย</span>
              </button>

              <button
                type="button"
                onClick={() => setGender('girl')}
                className={`py-4 sm:py-6 px-3 rounded-2xl sm:rounded-3xl text-sm sm:text-base font-semibold flex flex-col items-center gap-2.5 sm:gap-3 transition-all border-2 ${
                  gender === 'girl'
                    ? 'bg-pink-500 text-white border-pink-400 shadow-lg shadow-pink-500/30'
                    : 'bg-card border-border text-muted-foreground hover:border-pink-300'
                }`}
              >
                <svg width="42" height="42" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="#FCE7F3" />
                  <ellipse cx="50" cy="52" rx="28" ry="30" fill="#F5D0C5" />
                  <ellipse cx="50" cy="28" rx="22" ry="12" fill="#8B7355" />
                  <circle cx="32" cy="22" r="6" fill="#8B7355" />
                  <circle cx="68" cy="22" r="6" fill="#8B7355" />
                  <circle cx="72" cy="18" r="5" fill="#F472B6" />
                  <circle cx="78" cy="14" r="4" fill="#F472B6" />
                  <circle cx="75" cy="16" r="2.5" fill="#FBCFE8" />
                  <circle cx="38" cy="48" r="4" fill="#2D2D2D" />
                  <circle cx="62" cy="48" r="4" fill="#2D2D2D" />
                  <circle cx="39.5" cy="46.5" r="1.5" fill="white" />
                  <circle cx="63.5" cy="46.5" r="1.5" fill="white" />
                  <ellipse cx="28" cy="56" rx="6" ry="4" fill="#FBCFE8" opacity="0.7" />
                  <ellipse cx="72" cy="56" rx="6" ry="4" fill="#FBCFE8" opacity="0.7" />
                  <path d="M42 62 Q50 70 58 62" stroke="#D4A574" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </svg>
                <span className="leading-none">ผู้หญิง</span>
              </button>
            </div>
          </div>

          <div className="mb-5">
            <label htmlFor="baby-name" className="text-sm sm:text-base font-semibold text-muted-foreground mb-2 block">
              ชื่อ *
            </label>
            <div className="relative w-full min-w-0">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                id="baby-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ชื่อลูกน้อย"
                className="w-full min-w-0 max-w-full h-12 sm:h-14 bg-card border border-border rounded-2xl pl-11 sm:pl-12 pr-4 text-[16px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="mb-5">
            <label htmlFor="baby-birthdate" className="text-sm sm:text-base font-semibold text-muted-foreground mb-2 block">
              วันเกิด *
            </label>
            <div className="relative w-full min-w-0">
              <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                id="baby-birthdate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full min-w-0 max-w-full h-12 sm:h-14 bg-card border border-border rounded-2xl pl-11 sm:pl-12 pr-12 sm:pr-14 text-[16px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="mb-2">
            <label htmlFor="baby-weight" className="text-sm sm:text-base font-semibold text-muted-foreground mb-2 block">
              น้ำหนัก (กก.) - ไม่บังคับ
            </label>
            <div className="relative w-full min-w-0">
              <Scale size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                id="baby-weight"
                type="number"
                min="0"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="เช่น 3.5"
                className="w-full min-w-0 max-w-full h-12 sm:h-14 bg-card border border-border rounded-2xl pl-11 sm:pl-12 pr-4 text-[16px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-border/70 bg-card/95 px-4 sm:px-6 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <button
            onClick={handleSave}
            disabled={!isValid}
            className={`w-full h-12 sm:h-14 rounded-2xl font-bold text-base sm:text-lg transition-all active:scale-[0.98] ${
              isValid
                ? 'bg-primary text-primary-foreground shadow-glow-primary'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            บันทึก
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BabyProfileModal;
