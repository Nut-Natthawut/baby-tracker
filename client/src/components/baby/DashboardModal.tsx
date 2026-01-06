import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Droplets, Baby } from 'lucide-react';
import { LogEntry, FeedingDetails, DiaperDetails } from '@/types/baby';
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, subMonths, addMonths } from 'date-fns';
import { th } from 'date-fns/locale';

interface DashboardModalProps {
  logs: LogEntry[];
  onClose: () => void;
}

const DashboardModal: React.FC<DashboardModalProps> = ({ logs, onClose }) => {
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Daily stats
  const dailyStats = useMemo(() => {
    const dayStart = startOfDay(selectedDate);
    const dayEnd = endOfDay(selectedDate);
    
    const dayLogs = logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= dayStart && logDate <= dayEnd;
    });

    const feedingLogs = dayLogs.filter(l => l.type === 'feeding');
    const diaperLogs = dayLogs.filter(l => l.type === 'diaper');

    // Feeding stats
    const totalBottleMl = feedingLogs.reduce((sum, log) => {
      const details = log.details as FeedingDetails;
      return sum + (details.amountMl || 0);
    }, 0);

    const totalBreastMinutes = feedingLogs.reduce((sum, log) => {
      const details = log.details as FeedingDetails;
      const leftSec = details.leftDurationSeconds || 0;
      const rightSec = details.rightDurationSeconds || 0;
      return sum + Math.round((leftSec + rightSec) / 60);
    }, 0);

    const bottleCount = feedingLogs.filter(l => (l.details as FeedingDetails).method === 'bottle').length;
    const breastCount = feedingLogs.filter(l => (l.details as FeedingDetails).method === 'breast').length;

    // Diaper stats
    const peeCount = diaperLogs.filter(l => {
      const d = l.details as DiaperDetails;
      return d.status === 'pee' || d.status === 'mixed';
    }).length;

    const pooCount = diaperLogs.filter(l => {
      const d = l.details as DiaperDetails;
      return d.status === 'poo' || d.status === 'mixed';
    }).length;

    return {
      totalBottleMl,
      totalBreastMinutes,
      bottleCount,
      breastCount,
      peeCount,
      pooCount,
      feedingCount: feedingLogs.length,
      diaperCount: diaperLogs.length,
    };
  }, [logs, selectedDate]);

  // Monthly stats
  const monthlyStats = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return days.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      
      const dayLogs = logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= dayStart && logDate <= dayEnd;
      });

      const feedingCount = dayLogs.filter(l => l.type === 'feeding').length;
      const diaperCount = dayLogs.filter(l => l.type === 'diaper').length;

      return {
        date: day,
        feedingCount,
        diaperCount,
        hasData: feedingCount > 0 || diaperCount > 0,
      };
    });
  }, [logs, currentMonth]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (direction === 'prev' ? -1 : 1));
      return newDate;
    });
  };

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
        <h2 className="text-lg font-bold text-foreground">📊 Dashboard</h2>
        <div className="w-10" />
      </div>

      {/* View Mode Toggle */}
      <div className="px-6 py-4">
        <div className="flex gap-2 bg-secondary rounded-xl p-1">
          <button
            onClick={() => setViewMode('daily')}
            className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all ${
              viewMode === 'daily'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground'
            }`}
          >
            รายวัน
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all ${
              viewMode === 'monthly'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground'
            }`}
          >
            รายเดือน
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-6">
        {viewMode === 'daily' ? (
          <>
            {/* Date Navigator */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigateDay('prev')}
                className="p-2 rounded-lg bg-secondary"
              >
                <ChevronLeft size={20} className="text-foreground" />
              </button>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">
                  {isToday(selectedDate) ? 'วันนี้' : format(selectedDate, 'd MMMM yyyy', { locale: th })}
                </p>
                {!isToday(selectedDate) && (
                  <button
                    onClick={() => setSelectedDate(new Date())}
                    className="text-xs text-primary mt-1"
                  >
                    กลับไปวันนี้
                  </button>
                )}
              </div>
              <button
                onClick={() => navigateDay('next')}
                className="p-2 rounded-lg bg-secondary"
                disabled={isToday(selectedDate)}
              >
                <ChevronRight size={20} className={isToday(selectedDate) ? 'text-muted-foreground' : 'text-foreground'} />
              </button>
            </div>

            {/* Daily Stats Cards */}
            <div className="space-y-4">
              {/* Feeding Summary */}
              <div className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-feeding/20 flex items-center justify-center">
                    <span className="text-xl">🍼</span>
                  </div>
                  <h3 className="font-bold text-foreground">การกินนม</h3>
                  <span className="ml-auto text-sm text-muted-foreground">{dailyStats.feedingCount} ครั้ง</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary/50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-feeding">{dailyStats.totalBottleMl}</p>
                    <p className="text-xs text-muted-foreground mt-1">มล. (ขวด)</p>
                    <p className="text-xs text-muted-foreground">{dailyStats.bottleCount} ครั้ง</p>
                  </div>
                  <div className="bg-secondary/50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-feeding">{dailyStats.totalBreastMinutes}</p>
                    <p className="text-xs text-muted-foreground mt-1">นาที (เข้าเต้า)</p>
                    <p className="text-xs text-muted-foreground">{dailyStats.breastCount} ครั้ง</p>
                  </div>
                </div>
              </div>

              {/* Diaper Summary */}
              <div className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-diaper/20 flex items-center justify-center">
                    <Baby size={20} className="text-diaper" />
                  </div>
                  <h3 className="font-bold text-foreground">ผ้าอ้อม</h3>
                  <span className="ml-auto text-sm text-muted-foreground">{dailyStats.diaperCount} ครั้ง</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary/50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-diaper">{dailyStats.peeCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">💧 ฉี่</p>
                  </div>
                  <div className="bg-secondary/50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-diaper">{dailyStats.pooCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">💩 อึ</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Month Navigator */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 rounded-lg bg-secondary"
              >
                <ChevronLeft size={20} className="text-foreground" />
              </button>
              <p className="text-lg font-bold text-foreground">
                {format(currentMonth, 'MMMM yyyy', { locale: th })}
              </p>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 rounded-lg bg-secondary"
              >
                <ChevronRight size={20} className="text-foreground" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for offset */}
              {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              
              {monthlyStats.map((day, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedDate(day.date);
                    setViewMode('daily');
                  }}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all ${
                    isToday(day.date)
                      ? 'bg-primary text-primary-foreground'
                      : isSameDay(day.date, selectedDate)
                      ? 'bg-primary/20 border border-primary'
                      : 'bg-card border border-border hover:bg-secondary'
                  }`}
                >
                  <span className="text-sm font-medium">{format(day.date, 'd')}</span>
                  {day.hasData && (
                    <div className="flex gap-0.5 mt-0.5">
                      {day.feedingCount > 0 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-feeding" />
                      )}
                      {day.diaperCount > 0 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-diaper" />
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Monthly Total */}
            <div className="mt-6 bg-card rounded-2xl border border-border p-5">
              <h3 className="font-bold text-foreground mb-4">สรุปเดือน {format(currentMonth, 'MMMM', { locale: th })}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-feeding/10 rounded-xl p-4 text-center">
                  <span className="text-2xl">🍼</span>
                  <p className="text-2xl font-bold text-feeding mt-2">
                    {monthlyStats.reduce((sum, d) => sum + d.feedingCount, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">ครั้งที่กินนม</p>
                </div>
                <div className="bg-diaper/10 rounded-xl p-4 text-center">
                  <span className="text-2xl">👶</span>
                  <p className="text-2xl font-bold text-diaper mt-2">
                    {monthlyStats.reduce((sum, d) => sum + d.diaperCount, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">ครั้งเปลี่ยนผ้าอ้อม</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default DashboardModal;
