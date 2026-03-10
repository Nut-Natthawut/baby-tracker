import React from "react";
import { motion } from "framer-motion";
import { CalendarDays, Pencil, Trash2, X } from "lucide-react";

type ActivityTone = "blue" | "purple" | "orange" | "pink" | "green";

export type ActivityItem = {
  id: string;
  key: string;
  type: string;
  label: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: ActivityTone;
  raw?: unknown;
};

interface ActivitiesModalProps {
  selectedDate: Date;
  activities: ActivityItem[];
  canManageActions?: boolean;
  onEditActivity?: (activity: ActivityItem) => void;
  onDeleteActivity?: (activity: ActivityItem) => void;
  onClose: () => void;
}

const toneClassMap: Record<ActivityTone, string> = {
  blue: "bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300",
  purple: "bg-purple-100 text-purple-500 dark:bg-purple-900/30 dark:text-purple-300",
  orange: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300",
  pink: "bg-rose-100 text-rose-500 dark:bg-rose-900/30 dark:text-rose-300",
  green: "bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-300",
};

const ActivitiesModal: React.FC<ActivitiesModalProps> = ({
  selectedDate,
  activities,
  canManageActions = false,
  onEditActivity,
  onDeleteActivity,
  onClose,
}) => {
  const formattedDate = selectedDate.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-end sm:justify-center bg-black/40 backdrop-blur-sm px-0 sm:px-4 pb-0 sm:pb-8">
      <motion.div
        initial={{ y: "100%", opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: "100%", opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", damping: 24, stiffness: 280 }}
        className="relative w-full max-w-3xl bg-background/95 backdrop-blur-2xl sm:rounded-[32px] rounded-t-[32px] shadow-2xl border border-white/20 h-[92vh] sm:h-[85vh] overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-16 -right-12 h-[220px] w-[220px] rounded-full bg-papaya/20 blur-3xl" />
          <div className="absolute top-[25%] -left-20 h-[260px] w-[260px] rounded-full bg-sky/20 blur-3xl" />
        </div>

        <header className="sticky top-0 z-20 border-b border-white/70 dark:border-white/10 bg-white/75 dark:bg-white/5 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <button
              onClick={onClose}
              className="flex items-center justify-center size-10 rounded-full bg-white/80 dark:bg-white/10 border border-white/70 dark:border-white/10 text-gray-700 dark:text-gray-200 shadow-sm"
              aria-label="ปิดหน้ากิจกรรม"
            >
              <X size={18} />
            </button>
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-foreground">กิจกรรมทั้งหมด</h2>
              <p className="text-xs sm:text-sm text-muted-foreground inline-flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" />
                {formattedDate}
              </p>
            </div>
            <div className="min-w-[40px] text-right text-xs sm:text-sm font-semibold text-muted-foreground">
              {activities.length} รายการ
            </div>
          </div>
        </header>

        <div className="h-full overflow-y-auto no-scrollbar px-4 sm:px-6 pt-5 pb-20">
          {activities.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/70 dark:border-white/10 bg-white/60 dark:bg-white/5 text-center text-sm text-muted-foreground py-12">
              ยังไม่มีกิจกรรมในวันนี้
            </div>
          ) : (
            <div className="relative flex flex-col gap-4">
              <div className="absolute left-[18px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary/40 to-transparent -z-10" />
              {activities.map((activity, idx) => {
                const Icon = activity.icon;
                const toneClass = toneClassMap[activity.tone] ?? toneClassMap.green;

                return (
                  <motion.div
                    key={activity.key}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="rounded-2xl border border-white/70 dark:border-white/10 bg-white/75 dark:bg-white/5 backdrop-blur-xl px-4 py-3 flex items-start gap-3"
                  >
                    <div className={`size-9 rounded-full flex items-center justify-center border-2 border-white/90 dark:border-[#2a2d36] ${toneClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm sm:text-base font-semibold text-foreground leading-tight">{activity.label}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">{activity.sub}</p>
                    </div>
                    {canManageActions ? (
                      <div className="flex gap-1 pt-0.5 flex-none">
                        <button
                          type="button"
                          onClick={() => onEditActivity?.(activity)}
                          className="size-8 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground transition"
                          title="Edit"
                          aria-label="Edit activity"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteActivity?.(activity)}
                          className="size-8 rounded-full bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center text-destructive transition"
                          title="Delete"
                          aria-label="Delete activity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : null}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ActivitiesModal;
