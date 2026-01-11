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
  // Ensure birthDate is strictly YYYY-MM-DD for input[type="date"]
  const [birthDate, setBirthDate] = useState(() => {
    if (!baby?.birthDate) return '';
    try {
      return new Date(baby.birthDate).toISOString().split('T')[0];
    } catch (e) {
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

  const isValid = name.trim() && birthDate;

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
        <h2 className="text-lg font-bold text-foreground">
          {baby ? 'แก้ไขข้อมูลลูก' : 'เพิ่มข้อมูลลูก'}
        </h2>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-6">
        {/* Avatar Preview */}
        <div className="flex justify-center mb-8">
          <CuteBabyAvatar
            gender={gender}
            size="lg"
            mood="happy"
          />
        </div>

        {/* Gender Selection */}
        <div className="mb-6">
          <label className="text-sm font-medium text-muted-foreground mb-3 block">
            เพศ
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setGender('boy')}
              className={`py-6 px-4 rounded-3xl font-semibold flex flex-col items-center gap-3 transition-all border-2 ${gender === 'boy'
                  ? 'bg-blue-500 text-white border-blue-400 shadow-lg shadow-blue-500/30'
                  : 'bg-card border-border text-muted-foreground hover:border-blue-300'
                }`}
            >
              {/* Boy Avatar */}
              <svg width="48" height="48" viewBox="0 0 100 100">
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
              <span className="text-base">ผู้ชาย</span>
            </button>
            <button
              onClick={() => setGender('girl')}
              className={`py-6 px-4 rounded-3xl font-semibold flex flex-col items-center gap-3 transition-all border-2 ${gender === 'girl'
                  ? 'bg-pink-500 text-white border-pink-400 shadow-lg shadow-pink-500/30'
                  : 'bg-card border-border text-muted-foreground hover:border-pink-300'
                }`}
            >
              {/* Girl Avatar */}
              <svg width="48" height="48" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="#FCE7F3" />
                <ellipse cx="50" cy="52" rx="28" ry="30" fill="#F5D0C5" />
                <ellipse cx="50" cy="28" rx="22" ry="12" fill="#8B7355" />
                <circle cx="32" cy="22" r="6" fill="#8B7355" />
                <circle cx="68" cy="22" r="6" fill="#8B7355" />
                {/* Bow */}
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
              <span className="text-base">ผู้หญิง</span>
            </button>
          </div>
        </div>

        {/* Name Input */}
        <div className="mb-6">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            ชื่อ *
          </label>
          <div className="relative">
            <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ชื่อลูกน้อย"
              className="w-full bg-card border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Birth Date Input */}
        <div className="mb-6">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            วันเกิด *
          </label>
          <div className="relative">
            <Calendar size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full bg-card border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Weight Input */}
        <div className="mb-6">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            น้ำหนัก (กก.) - ไม่บังคับ
          </label>
          <div className="relative">
            <Scale size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="เช่น 3.5"
              className="w-full bg-card border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="p-6 border-t border-border bg-card">
        <button
          onClick={handleSave}
          disabled={!isValid}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all active:scale-[0.98] ${isValid
              ? 'bg-primary text-primary-foreground shadow-glow-primary'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
        >
          บันทึก
        </button>
      </div>
    </motion.div>
  );
};

export default BabyProfileModal;
