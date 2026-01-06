import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2, Users } from 'lucide-react';
import { Baby } from '@/types/baby';
import { calculateAge } from '@/lib/babyUtils';
import BabyAvatar from './BabyAvatar';
import ThemeToggle from './ThemeToggle';

interface SettingsModalProps {
  baby: Baby | null;
  onClose: () => void;
  onEditBaby: () => void;
  onClearData: () => void;
  onOpenCaregivers: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  baby, 
  onClose, 
  onEditBaby, 
  onClearData,
  onOpenCaregivers,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-border">
        <button onClick={onClose} className="p-2 -ml-2">
          <ArrowLeft size={24} className="text-foreground" />
        </button>
        <h2 className="text-lg font-bold text-foreground">ตั้งค่า</h2>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Baby Profile Card */}
        {baby && (
          <div className="px-6 py-6">
            <div className="bg-card rounded-3xl border border-border p-6">
              <div className="flex items-center gap-4 mb-4">
                <BabyAvatar baby={baby} size="md" />
                <div>
                  <h3 className="text-xl font-bold text-foreground">{baby.name}</h3>
                  <p className="text-muted-foreground">
                    อายุ {calculateAge(baby.birthDate)}
                  </p>
                  {baby.weight && (
                    <p className="text-sm text-muted-foreground">
                      น้ำหนัก {baby.weight} กก.
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onEditBaby}
                className="w-full py-3 rounded-xl bg-secondary text-foreground font-semibold hover:bg-secondary/80 transition-colors"
              >
                แก้ไขข้อมูล
              </button>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div className="px-6 pb-6">
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            <div className="border-t border-border" />
            
            {/* Caregivers */}
            <button
              onClick={onOpenCaregivers}
              className="w-full flex items-center gap-4 px-4 py-4 hover:bg-secondary/50 transition-colors text-left"
            >
              <div className="p-2 rounded-xl bg-accent/20">
                <Users size={20} className="text-accent" />
              </div>
              <div>
                <p className="font-semibold text-foreground">ผู้ดูแลร่วม</p>
                <p className="text-xs text-muted-foreground">จัดการสมาชิกครอบครัว</p>
              </div>
            </button>

            <div className="border-t border-border" />
            
            {/* Clear Data */}
            <button
              onClick={onClearData}
              className="w-full flex items-center gap-4 px-4 py-4 hover:bg-secondary/50 transition-colors text-left"
            >
              <div className="p-2 rounded-xl bg-destructive/20">
                <Trash2 size={20} className="text-destructive" />
              </div>
              <div>
                <p className="font-semibold text-destructive">ล้างข้อมูลทั้งหมด</p>
                <p className="text-xs text-muted-foreground">ลบข้อมูลลูกและบันทึกทั้งหมด</p>
              </div>
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="px-6 pb-8 text-center">
          <p className="text-sm text-muted-foreground">Baby Tracker v1.0</p>
          <p className="text-xs text-muted-foreground mt-1">
            ระบบบันทึกการดูแลทารก
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsModal;
