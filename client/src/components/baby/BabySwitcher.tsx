import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus, Check } from 'lucide-react';
import { Baby } from '@/types/baby';
import BabyAvatar from './BabyAvatar';

interface BabySwitcherProps {
  babies: Baby[];
  currentBaby: Baby | null;
  onSelectBaby: (baby: Baby) => void;
  onAddBaby: () => void;
  containerClassName?: string;
  buttonClassName?: string;
  nameClassName?: string;
  chevronClassName?: string;
}

const BabySwitcher: React.FC<BabySwitcherProps> = ({
  babies,
  currentBaby,
  onSelectBaby,
  onAddBaby,
  containerClassName,
  buttonClassName,
  nameClassName,
  chevronClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!currentBaby) return null;

  return (
    <div className={`relative ${containerClassName ?? ''}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl bg-card/50 border border-border/50 hover:bg-card transition-colors ${buttonClassName ?? ''}`}
      >
        <BabyAvatar baby={currentBaby} size="sm" />
        <span className={`font-semibold text-foreground text-base max-w-[140px] truncate ${nameClassName ?? ''}`}>
          {currentBaby.name}
        </span>
        <ChevronDown 
          size={18} 
          className={`text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''} ${chevronClassName ?? ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute top-full left-0 mt-2 w-64 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden"
            >
              <div className="p-2">
                <p className="text-sm text-muted-foreground px-3 py-2 font-medium">
                  เลือกลูกน้อย
                </p>
                
                {babies.map((baby) => (
                  <button
                    key={baby.id}
                    onClick={() => {
                      onSelectBaby(baby);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                      currentBaby.id === baby.id
                        ? 'bg-primary/10'
                        : 'hover:bg-secondary'
                    }`}
                  >
                    <BabyAvatar baby={baby} size="sm" />
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-foreground text-base">
                        {baby.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {baby.gender === 'boy' ? '👦 เด็กชาย' : '👧 เด็กหญิง'}
                      </p>
                    </div>
                    {currentBaby.id === baby.id && (
                      <Check size={20} className="text-primary" />
                    )}
                  </button>
                ))}
              </div>

              <div className="border-t border-border p-2">
                <button
                  onClick={() => {
                    onAddBaby();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                    <Plus size={18} className="text-primary" />
                  </div>
                  <span className="text-base font-medium text-primary">
                    เพิ่มลูกน้อยใหม่
                  </span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BabySwitcher;
