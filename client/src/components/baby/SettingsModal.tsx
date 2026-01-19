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
  onDeleteBaby: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  baby,
  onClose,
  onEditBaby,
  onClearData,
  onOpenCaregivers,
  onDeleteBaby,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 bg-[#f7f7f5] dark:bg-[#0f172a] text-[#111418] dark:text-gray-100 overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          className="absolute -top-20 -right-20 h-[320px] w-[320px] rounded-full bg-papaya/25 blur-3xl"
          animate={{ y: [0, 16, 0], x: [0, -10, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-[30%] -left-28 h-[360px] w-[360px] rounded-full bg-sky/25 blur-3xl"
          animate={{ y: [0, -12, 0], x: [0, 10, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 right-[10%] h-[240px] w-[240px] rounded-full bg-saguaro/20 blur-3xl"
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 flex h-full flex-col">
        {/* Header */}
        <div className="sticky top-0 z-20 border-b border-white/70 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl">
          <div className="mx-auto flex items-center gap-3 px-4 md:px-8 py-4 max-w-[1100px]">
            <button
              onClick={onClose}
              className="flex items-center justify-center size-10 rounded-full bg-white/80 dark:bg-white/10 border border-white/70 dark:border-white/10 text-gray-700 dark:text-gray-200 shadow-[0_10px_25px_-18px_rgba(15,23,42,0.45)] transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="leading-tight">
              <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-muted-foreground">Settings</p>
              <h2 className="text-lg md:text-xl font-black tracking-[-0.02em] text-foreground">ตั้งค่า</h2>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="mx-auto w-full max-w-[1100px] px-4 md:px-8 pb-10">
            <div className="mt-6 grid gap-6 md:gap-8">
              {/* Baby Profile Card */}
              {baby && (
                <div className="relative overflow-hidden rounded-[28px] border border-white/70 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl p-6 md:p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-papaya/20 via-white/40 to-sky/20 opacity-90" />
                  <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <BabyAvatar baby={baby} size="lg" />
                        <span className="absolute -bottom-1 -right-1 size-4 rounded-full bg-white shadow flex items-center justify-center">
                          <span className="size-2 rounded-full bg-emerald-400" />
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Profile</p>
                        <h3 className="text-2xl font-black text-foreground">{baby.name}</h3>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-foreground">
                          <span className="rounded-full bg-white/80 dark:bg-white/10 border border-white/70 dark:border-white/10 px-3 py-1">
                            อายุ {calculateAge(baby.birthDate)}
                          </span>
                          {baby.weight && (
                            <span className="rounded-full bg-white/80 dark:bg-white/10 border border-white/70 dark:border-white/10 px-3 py-1">
                              น้ำหนัก {baby.weight} กก.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={onEditBaby}
                      className="w-full md:w-auto px-5 py-3 rounded-full bg-primary text-primary-foreground font-bold shadow-glow-primary hover:brightness-95 active:scale-[0.98] transition"
                    >
                      แก้ไขข้อมูล
                    </button>
                  </div>
                </div>
              )}

              {/* Menu Cards */}
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-[28px] border border-white/70 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
                  <div className="px-6 pt-6">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Preferences</p>
                    <h3 className="text-lg font-black text-foreground">การตั้งค่า</h3>
                  </div>
                  <div className="p-2 md:p-3 flex flex-col gap-2">
                    <ThemeToggle />
                    <button
                      onClick={onOpenCaregivers}
                      className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-white/70 dark:hover:bg-white/10 transition-colors text-left"
                    >
                      <div className="p-2 rounded-2xl bg-emerald-100/80 dark:bg-emerald-900/30">
                        <Users size={20} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">ผู้ดูแลร่วม</p>
                        <p className="text-xs text-muted-foreground">จัดการสมาชิกครอบครัว</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="rounded-[28px] border border-rose-200/60 dark:border-rose-500/20 bg-rose-50/70 dark:bg-rose-500/10 backdrop-blur-xl shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
                  <div className="px-6 pt-6">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-rose-400">Danger Zone</p>
                    <h3 className="text-lg font-black text-rose-600">ลบข้อมูล</h3>
                    <p className="text-xs text-rose-400 mt-1">การลบข้อมูลจะไม่สามารถกู้คืนได้</p>
                  </div>
                  <div className="p-2 md:p-3">
                    <button
                      onClick={onDeleteBaby}
                      className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-rose-100/80 dark:hover:bg-rose-500/10 transition-colors text-left"
                    >
                      <div className="p-2 rounded-2xl bg-rose-200/70 dark:bg-rose-500/20">
                        <Trash2 size={20} className="text-rose-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-rose-600">ลบข้อมูลเด็กคนนี้</p>
                        <p className="text-xs text-rose-400">ข้อมูลจะถูกลบถาวรจากระบบ</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* App Info */}
              <div className="pt-2 text-center">
                <p className="text-sm text-muted-foreground">Baby Tracker v1.0</p>
                <p className="text-xs text-muted-foreground mt-1">ระบบบันทึกการดูแลทารก</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsModal;
