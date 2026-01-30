import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Droplets, Milk, Moon, Utensils, X } from 'lucide-react';
import { LogEntry } from '@/types/baby';
import {
  addMonths,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  format,
  isSameDay,
  isToday,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from 'date-fns';
import { th } from 'date-fns/locale';

interface DashboardModalProps {
  logs: LogEntry[];
  onClose: () => void;
}

type NormalizedLog = {
  type: 'feeding' | 'diaper' | 'sleep' | 'pump' | 'unknown';
  at: Date;
  details: Record<string, any>;
};

const toNumber = (value: unknown, fallback = 0) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const isValidDate = (value: Date) => !Number.isNaN(value.getTime());

const toDateFromNumber = (value: number): Date | null => {
  const ms = value < 1e12 ? value * 1000 : value;
  const d = new Date(ms);
  return isValidDate(d) ? d : null;
};

const toDateFromString = (value: string): Date | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  if (!Number.isNaN(parsed)) return toDateFromNumber(parsed);
  const d = new Date(trimmed);
  return isValidDate(d) ? d : null;
};

const toDate = (value: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return isValidDate(value) ? value : null;
  if (typeof value === 'number') return toDateFromNumber(value);
  if (typeof value === 'string') return toDateFromString(value);
  return null;
};

const normalizeType = (value: unknown): NormalizedLog['type'] => {
  const raw =
    typeof value === 'string' || typeof value === 'number'
      ? String(value).toLowerCase()
      : '';
  if (raw.includes('feed')) return 'feeding';
  if (raw.includes('diaper')) return 'diaper';
  if (raw.includes('sleep')) return 'sleep';
  if (raw.includes('pump')) return 'pump';
  return 'unknown';
};

const getDetails = (log: any): Record<string, any> => {
  if (!log) return {};
  const raw = log.details ?? log.detail ?? log.data ?? log;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return raw ?? {};
};

const isDefined = <T,>(value: T | null | undefined): value is T => value !== null && value !== undefined;

const normalizeLog = (log: any): NormalizedLog | null => {
  const at = toDate(log?.timestamp ?? log?.time ?? log?.date ?? log?.createdAt ?? log?.created_at);
  if (!at) return null;
  const type = normalizeType(log?.type ?? log?.logType ?? log?.category ?? log?.kind ?? log?.event);
  if (type === 'unknown') return null;
  return {
    type,
    at,
    details: getDetails(log),
  };
};

const computeStats = (entries: NormalizedLog[]) => {
  const feedingLogs = entries.filter((log) => log.type === 'feeding');
  const diaperLogs = entries.filter((log) => log.type === 'diaper');
  const sleepLogs = entries.filter((log) => log.type === 'sleep');
  const pumpLogs = entries.filter((log) => log.type === 'pump');

  let totalBottleMl = 0;
  let totalBreastMinutes = 0;
  let bottleCount = 0;
  let breastCount = 0;

  feedingLogs.forEach((log) => {
    const details = log.details ?? {};
    const method = String(details.method ?? details.feedingType ?? details.source ?? '').toLowerCase();
    const amountMl = toNumber(details.amountMl ?? details.amount_ml ?? details.amount);
    const leftSec = toNumber(details.leftDurationSeconds ?? details.left_duration_seconds ?? details.leftSeconds);
    const rightSec = toNumber(details.rightDurationSeconds ?? details.right_duration_seconds ?? details.rightSeconds);
    const hasBreastDuration = leftSec > 0 || rightSec > 0;

    const isBreast = method.includes('breast') || hasBreastDuration;
    const isBottle = method.includes('bottle') || method.includes('formula') || (!isBreast && amountMl > 0);

    if (isBottle) {
      totalBottleMl += amountMl;
      bottleCount += 1;
    }
    if (isBreast) {
      totalBreastMinutes += Math.round((leftSec + rightSec) / 60);
      breastCount += 1;
    }
  });

  const peeCount = diaperLogs.filter((log) => {
    const status = String(log.details?.status ?? log.details?.diaperType ?? log.details?.type ?? '').toLowerCase();
    return status.includes('pee') || status.includes('wet') || status.includes('mixed');
  }).length;

  const pooCount = diaperLogs.filter((log) => {
    const status = String(log.details?.status ?? log.details?.diaperType ?? log.details?.type ?? '').toLowerCase();
    return status.includes('poo') || status.includes('dirty') || status.includes('mixed');
  }).length;

  const sleepMinutes = sleepLogs.reduce((sum, log) => {
    return sum + toNumber(log.details?.durationMinutes ?? log.details?.duration_minutes ?? log.details?.duration);
  }, 0);

  const pumpMinutes = pumpLogs.reduce((sum, log) => {
    return sum + toNumber(log.details?.durationMinutes ?? log.details?.duration_minutes ?? log.details?.duration);
  }, 0);

  const pumpMl = pumpLogs.reduce((sum, log) => {
    const details = log.details ?? {};
    const total = toNumber(details.amountTotalMl ?? details.amount_total_ml);
    if (total > 0) return sum + total;
    return (
      sum +
      toNumber(details.amountLeftMl ?? details.amount_left_ml) +
      toNumber(details.amountRightMl ?? details.amount_right_ml)
    );
  }, 0);

  return {
    feedingCount: feedingLogs.length,
    diaperCount: diaperLogs.length,
    sleepCount: sleepLogs.length,
    pumpCount: pumpLogs.length,
    totalBottleMl: Math.round(totalBottleMl),
    totalBreastMinutes,
    bottleCount,
    breastCount,
    peeCount,
    pooCount,
    sleepMinutes,
    pumpMinutes,
    pumpMl: Math.round(pumpMl),
  };
};

const getDayStateClass = (day: Date, isSelected: boolean) => {
  if (isToday(day)) return 'bg-primary text-primary-foreground border-primary/60 shadow-lg';
  if (isSelected) return 'bg-primary/15 border-primary/40 text-primary';
  return 'bg-white/80 dark:bg-white/5 border-white/70 dark:border-white/10 text-foreground hover:bg-white/90 dark:hover:bg-white/10';
};

const DashboardModal: React.FC<DashboardModalProps> = ({ logs, onClose }) => {
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const normalizedLogs = useMemo(() => {
    if (!Array.isArray(logs)) return [];
    return logs
      .map((log) => normalizeLog(log))
      .filter(isDefined);
  }, [logs]);

  const dailyStats = useMemo(() => {
    const dayStart = startOfDay(selectedDate);
    const dayEnd = endOfDay(selectedDate);

    const dayLogs = normalizedLogs.filter((log) => log.at >= dayStart && log.at <= dayEnd);
    return {
      totalEntries: dayLogs.length,
      ...computeStats(dayLogs),
    };
  }, [normalizedLogs, selectedDate]);

  const monthlyStats = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const dayMap = new Map<string, { feedingCount: number; diaperCount: number; sleepCount: number; pumpCount: number }>();

    normalizedLogs.forEach((log) => {
      if (log.at < monthStart || log.at > monthEnd) return;
      const key = format(log.at, 'yyyy-MM-dd');
      const current = dayMap.get(key) ?? { feedingCount: 0, diaperCount: 0, sleepCount: 0, pumpCount: 0 };

      if (log.type === 'feeding') current.feedingCount += 1;
      if (log.type === 'diaper') current.diaperCount += 1;
      if (log.type === 'sleep') current.sleepCount += 1;
      if (log.type === 'pump') current.pumpCount += 1;

      dayMap.set(key, current);
    });

    return days.map((day) => {
      const key = format(day, 'yyyy-MM-dd');
      const stats = dayMap.get(key) ?? { feedingCount: 0, diaperCount: 0, sleepCount: 0, pumpCount: 0 };
      return {
        date: day,
        ...stats,
        hasData: stats.feedingCount + stats.diaperCount + stats.sleepCount + stats.pumpCount > 0,
      };
    });
  }, [normalizedLogs, currentMonth]);

  const monthlyTotals = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const monthLogs = normalizedLogs.filter((log) => log.at >= monthStart && log.at <= monthEnd);
    return {
      totalEntries: monthLogs.length,
      ...computeStats(monthLogs),
    };
  }, [normalizedLogs, currentMonth]);

  const leadingDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const count = monthStart.getDay();
    return Array.from({ length: count }, (_, index) => subDays(monthStart, count - index));
  }, [currentMonth]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => (direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)));
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (direction === 'prev' ? -1 : 1));
      return newDate;
    });
  };

  const handleViewModeChange = (mode: 'daily' | 'monthly') => {
    setViewMode(mode);
    if (mode === 'monthly') {
      setCurrentMonth(selectedDate);
    }
  };

  const sleepHours = Math.floor(dailyStats.sleepMinutes / 60);
  const sleepMins = dailyStats.sleepMinutes % 60;
  const pumpHours = Math.floor(dailyStats.pumpMinutes / 60);
  const pumpMins = dailyStats.pumpMinutes % 60;

  const monthSleepHours = Math.floor(monthlyTotals.sleepMinutes / 60);
  const monthSleepMins = monthlyTotals.sleepMinutes % 60;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#f7f7f5] dark:bg-[#0f172a] text-[#111418] dark:text-gray-100 overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          className="absolute -top-24 -right-24 h-[320px] w-[320px] rounded-full bg-papaya/25 blur-3xl"
          animate={{ y: [0, 16, 0], x: [0, -10, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-[22%] -left-28 h-[360px] w-[360px] rounded-full bg-sky/25 blur-3xl"
          animate={{ y: [0, -12, 0], x: [0, 10, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 right-[8%] h-[240px] w-[240px] rounded-full bg-saguaro/20 blur-3xl"
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 flex h-full flex-col">
        <header className="sticky top-0 z-20 border-b border-white/70 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl">
          <div className="mx-auto flex items-center justify-between gap-4 px-4 md:px-8 py-5 max-w-[1200px]">
            <button
              onClick={onClose}
              className="flex items-center justify-center size-11 rounded-full bg-white/80 dark:bg-white/10 border border-white/70 dark:border-white/10 text-gray-700 dark:text-gray-200 shadow-[0_10px_25px_-18px_rgba(15,23,42,0.45)] transition-all"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-white/80 dark:bg-white/10 border border-white/70 dark:border-white/10 flex items-center justify-center shadow-sm">
                <span className="text-lg">📊</span>
              </div>
              <div className="leading-tight">
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Dashboard</p>
                <h2 className="text-xl md:text-2xl font-black tracking-[-0.02em] text-foreground">สรุปการดูแล</h2>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <span className="size-2 rounded-full bg-emerald-400" />
              {viewMode === 'daily'
                ? `${dailyStats.totalEntries} บันทึก`
                : `${monthlyTotals.totalEntries} บันทึก`}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="mx-auto w-full max-w-[1200px] px-4 md:px-8 pb-10">
            <div className="mt-6 flex flex-col gap-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="inline-flex items-center gap-2 rounded-full px-2 py-2 bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-white/70 dark:border-white/10 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.35)]">
                  <button
                    onClick={() => handleViewModeChange('daily')}
                    className={`px-5 py-3 rounded-full font-bold text-base transition-colors ${
                      viewMode === 'daily'
                        ? 'bg-primary/15 text-primary'
                        : 'text-gray-600 dark:text-gray-200 hover:bg-white/80 dark:hover:bg-white/10'
                    }`}
                  >
                    รายวัน
                  </button>
                  <button
                    onClick={() => handleViewModeChange('monthly')}
                    className={`px-5 py-3 rounded-full font-bold text-base transition-colors ${
                      viewMode === 'monthly'
                        ? 'bg-primary/15 text-primary'
                        : 'text-gray-600 dark:text-gray-200 hover:bg-white/80 dark:hover:bg-white/10'
                    }`}
                  >
                    รายเดือน
                  </button>
                </div>

                {viewMode === 'daily' ? (
                  <div className="flex items-center gap-3 rounded-full bg-white/80 dark:bg-white/10 border border-white/70 dark:border-white/10 px-3 py-2 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.35)]">
                    <button
                      onClick={() => navigateDay('prev')}
                      className="size-11 rounded-full bg-white/90 dark:bg-white/10 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-white transition"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <div className="text-center">
                      <p className="text-base font-black text-foreground">
                        {isToday(selectedDate) ? 'วันนี้' : format(selectedDate, 'd MMMM yyyy', { locale: th })}
                      </p>
                      {!isToday(selectedDate) && (
                        <button
                          onClick={() => setSelectedDate(new Date())}
                          className="text-sm text-primary font-semibold"
                        >
                          กลับไปวันนี้
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => navigateDay('next')}
                      className="size-11 rounded-full bg-white/90 dark:bg-white/10 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                      disabled={isToday(selectedDate)}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-full bg-white/80 dark:bg-white/10 border border-white/70 dark:border-white/10 px-3 py-2 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.35)]">
                    <button
                      onClick={() => navigateMonth('prev')}
                      className="size-11 rounded-full bg-white/90 dark:bg-white/10 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-white transition"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <p className="text-base font-black text-foreground">
                      {format(currentMonth, 'MMMM yyyy', { locale: th })}
                    </p>
                    <button
                      onClick={() => navigateMonth('next')}
                      className="size-11 rounded-full bg-white/90 dark:bg-white/10 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-white transition"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </div>

              {viewMode === 'daily' ? (
                <div className="flex flex-col gap-6">
                  {dailyStats.totalEntries === 0 && (
                    <div className="rounded-[28px] border border-dashed border-white/70 dark:border-white/10 bg-white/60 dark:bg-white/5 text-center text-sm text-muted-foreground py-10">
                      ยังไม่มีบันทึกในวันนี้
                    </div>
                  )}

                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="relative overflow-hidden rounded-[28px] border border-white/70 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-100/70 via-white/80 to-white/60 opacity-90" />
                      <div className="relative p-6">
                        <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="size-11 rounded-2xl bg-amber-100/80 dark:bg-amber-900/20 flex items-center justify-center">
                            <Utensils className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Feeding</p>
                            <h3 className="text-lg font-black text-foreground">การกินนม</h3>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-muted-foreground">{dailyStats.feedingCount} ครั้ง</span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-white/85 dark:bg-white/10 border border-white/70 dark:border-white/10 p-3">
                          <p className="text-sm font-semibold text-muted-foreground">ขวดนม</p>
                          <p className="text-2xl font-black text-amber-600">{dailyStats.totalBottleMl}</p>
                          <p className="text-sm text-muted-foreground">มล. • {dailyStats.bottleCount} ครั้ง</p>
                        </div>
                        <div className="rounded-2xl bg-white/85 dark:bg-white/10 border border-white/70 dark:border-white/10 p-3">
                          <p className="text-sm font-semibold text-muted-foreground">เข้าเต้า</p>
                          <p className="text-2xl font-black text-amber-600">{dailyStats.totalBreastMinutes}</p>
                          <p className="text-sm text-muted-foreground">นาที • {dailyStats.breastCount} ครั้ง</p>
                        </div>
                      </div>
                    </div>
                  </div>

                    <div className="relative overflow-hidden rounded-[28px] border border-white/70 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/70 via-white/80 to-white/60 opacity-90" />
                      <div className="relative p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                          <div className="size-11 rounded-2xl bg-emerald-100/80 dark:bg-emerald-900/30 flex items-center justify-center">
                            <Droplets className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Diaper</p>
                            <h3 className="text-lg font-black text-foreground">ผ้าอ้อม</h3>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-muted-foreground">{dailyStats.diaperCount} ครั้ง</span>
                      </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="rounded-2xl bg-white/85 dark:bg-white/10 border border-white/70 dark:border-white/10 p-3 text-center">
                            <p className="text-2xl font-black text-emerald-600">{dailyStats.peeCount}</p>
                          <p className="text-sm text-muted-foreground mt-1">💧 ฉี่</p>
                        </div>
                        <div className="rounded-2xl bg-white/85 dark:bg-white/10 border border-white/70 dark:border-white/10 p-3 text-center">
                          <p className="text-2xl font-black text-emerald-600">{dailyStats.pooCount}</p>
                          <p className="text-sm text-muted-foreground mt-1">💩 อึ</p>
                        </div>
                      </div>
                    </div>
                  </div>

                    <div className="relative overflow-hidden rounded-[28px] border border-white/70 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/70 via-white/80 to-white/60 opacity-90" />
                      <div className="relative p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                          <div className="size-11 rounded-2xl bg-indigo-100/80 dark:bg-indigo-900/30 flex items-center justify-center">
                            <Moon className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Sleep</p>
                            <h3 className="text-lg font-black text-foreground">การนอน</h3>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-muted-foreground">{dailyStats.sleepCount} ครั้ง</span>
                      </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="rounded-2xl bg-white/85 dark:bg-white/10 border border-white/70 dark:border-white/10 p-3">
                          <p className="text-sm font-semibold text-muted-foreground">เวลารวม</p>
                          <p className="text-2xl font-black text-indigo-600">
                            {sleepHours}h {sleepMins}m
                          </p>
                          <p className="text-sm text-muted-foreground">วันนี้</p>
                        </div>
                        <div className="rounded-2xl bg-white/85 dark:bg-white/10 border border-white/70 dark:border-white/10 p-3">
                          <p className="text-sm font-semibold text-muted-foreground">เฉลี่ย/ครั้ง</p>
                          <p className="text-2xl font-black text-indigo-600">
                            {dailyStats.sleepCount > 0
                              ? Math.round(dailyStats.sleepMinutes / dailyStats.sleepCount)
                              : 0}
                          </p>
                          <p className="text-sm text-muted-foreground">นาที</p>
                        </div>
                      </div>
                    </div>
                  </div>

                    <div className="relative overflow-hidden rounded-[28px] border border-white/70 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
                      <div className="absolute inset-0 bg-gradient-to-br from-rose-100/70 via-white/80 to-white/60 opacity-90" />
                      <div className="relative p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                          <div className="size-11 rounded-2xl bg-rose-100/80 dark:bg-rose-900/30 flex items-center justify-center">
                            <Milk className="w-5 h-5 text-rose-500" />
                          </div>
                          <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Pumping</p>
                            <h3 className="text-lg font-black text-foreground">ปั๊มนม</h3>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-muted-foreground">{dailyStats.pumpCount} ครั้ง</span>
                      </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="rounded-2xl bg-white/85 dark:bg-white/10 border border-white/70 dark:border-white/10 p-3">
                          <p className="text-sm font-semibold text-muted-foreground">ปริมาณรวม</p>
                          <p className="text-2xl font-black text-rose-500">{dailyStats.pumpMl}</p>
                          <p className="text-sm text-muted-foreground">มล.</p>
                        </div>
                        <div className="rounded-2xl bg-white/85 dark:bg-white/10 border border-white/70 dark:border-white/10 p-3">
                          <p className="text-sm font-semibold text-muted-foreground">เวลาปั๊ม</p>
                          <p className="text-2xl font-black text-rose-500">
                            {pumpHours > 0 ? `${pumpHours}h ${pumpMins}m` : `${pumpMins}m`}
                          </p>
                          <p className="text-sm text-muted-foreground">รวมทั้งหมด</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2 rounded-[28px] border border-white/70 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] p-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Calendar</p>
                        <h3 className="text-lg font-black text-foreground">ปฏิทินกิจกรรม</h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <span className="size-2 rounded-full bg-amber-400" />
                          <span>กินนม</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="size-2 rounded-full bg-emerald-400" />
                          <span>ผ้าอ้อม</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="size-2 rounded-full bg-indigo-400" />
                          <span>นอน</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="size-2 rounded-full bg-rose-400" />
                          <span>ปั๊มนม</span>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-3">
                      {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day) => (
                        <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {leadingDays.map((day) => (
                        <div key={format(day, 'yyyy-MM-dd')} className="aspect-square" />
                      ))}

                      {monthlyStats.map((day) => {
                        const isSelected = isSameDay(day.date, selectedDate);
                        const baseClass =
                          'aspect-square rounded-2xl flex flex-col items-center justify-center border text-sm font-semibold transition-all';
                        const stateClass = getDayStateClass(day.date, isSelected);

                        return (
                          <button
                            key={format(day.date, 'yyyy-MM-dd')}
                            onClick={() => {
                              setSelectedDate(day.date);
                              setViewMode('daily');
                            }}
                            className={`${baseClass} ${stateClass}`}
                          >
                            <span className="text-sm font-bold">{format(day.date, 'd')}</span>
                            {day.hasData && (
                              <div className="flex gap-0.5 mt-1">
                                {day.feedingCount > 0 && <span className="size-1.5 rounded-full bg-amber-400" />}
                                {day.diaperCount > 0 && <span className="size-1.5 rounded-full bg-emerald-400" />}
                                {day.sleepCount > 0 && <span className="size-1.5 rounded-full bg-indigo-400" />}
                                {day.pumpCount > 0 && <span className="size-1.5 rounded-full bg-rose-400" />}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-white/70 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] p-6">
                    <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Summary</p>
                    <h3 className="text-xl font-black text-foreground">
                      สรุปเดือน {format(currentMonth, 'MMMM', { locale: th })}
                    </h3>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-amber-50/70 dark:bg-amber-900/20 p-3">
                        <p className="text-sm text-muted-foreground">กินนม</p>
                        <p className="text-2xl font-black text-amber-600">{monthlyTotals.feedingCount}</p>
                        <p className="text-sm text-muted-foreground">ครั้ง</p>
                      </div>
                      <div className="rounded-2xl bg-emerald-50/70 dark:bg-emerald-900/20 p-3">
                        <p className="text-sm text-muted-foreground">ผ้าอ้อม</p>
                        <p className="text-2xl font-black text-emerald-600">{monthlyTotals.diaperCount}</p>
                        <p className="text-sm text-muted-foreground">ครั้ง</p>
                      </div>
                      <div className="rounded-2xl bg-indigo-50/70 dark:bg-indigo-900/20 p-3">
                        <p className="text-sm text-muted-foreground">การนอน</p>
                        <p className="text-2xl font-black text-indigo-600">
                          {monthSleepHours}h {monthSleepMins}m
                        </p>
                        <p className="text-sm text-muted-foreground">รวม</p>
                      </div>
                      <div className="rounded-2xl bg-rose-50/70 dark:bg-rose-900/20 p-3">
                        <p className="text-sm text-muted-foreground">ปั๊มนม</p>
                        <p className="text-2xl font-black text-rose-500">{monthlyTotals.pumpMl}</p>
                        <p className="text-sm text-muted-foreground">มล.</p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl bg-white/80 dark:bg-white/10 border border-white/70 dark:border-white/10 p-4 text-sm text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>นมขวดรวม</span>
                        <span className="font-semibold text-foreground">{monthlyTotals.totalBottleMl} มล.</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span>เข้าเต้ารวม</span>
                        <span className="font-semibold text-foreground">{monthlyTotals.totalBreastMinutes} นาที</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span>จำนวนบันทึก</span>
                        <span className="font-semibold text-foreground">{monthlyTotals.totalEntries} รายการ</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardModal;
