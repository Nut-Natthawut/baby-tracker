import React from 'react';
import { motion } from 'framer-motion';
import { Utensils, Baby, BarChart3, Heart } from 'lucide-react';
import { LogEntry } from '@/types/baby';
import { formatRelativeTime } from '@/lib/babyUtils';

interface StatsWidgetProps {
  icon: React.ElementType;
  title: string;
  time: string;
  subtext: string;
  type: 'feeding' | 'diaper' | 'sleep' | 'pump';
  onClick: () => void;
}

const typeStyles = {
  feeding: {
    iconBg: 'bg-feeding/20',
    iconColor: 'text-feeding',
    glow: 'shadow-glow-feeding',
  },
  diaper: {
    iconBg: 'bg-diaper/20',
    iconColor: 'text-diaper',
    glow: 'shadow-glow-diaper',
  },
  sleep: {
    iconBg: 'bg-sleep/20',
    iconColor: 'text-sleep',
    glow: 'shadow-glow-sleep',
  },
  pump: {
    iconBg: 'bg-pump/20',
    iconColor: 'text-pump',
    glow: 'shadow-glow-pump',
  },
};

const StatsWidget: React.FC<StatsWidgetProps> = ({ 
  icon: Icon, 
  title, 
  time, 
  subtext, 
  type,
  onClick 
}) => {
  const styles = typeStyles[type];
  
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`
        p-4 rounded-2xl bg-card border border-border
        flex flex-col items-start gap-2
        hover:border-border/80 transition-all
        ${styles.glow}
      `}
    >
      <div className={`p-2.5 rounded-xl ${styles.iconBg}`}>
        <Icon size={22} className={styles.iconColor} />
      </div>
      <div className="text-left">
        <p className="text-xs text-muted-foreground font-medium">{title}</p>
        <p className="text-2xl font-bold text-foreground">{time}</p>
        <p className="text-xs text-muted-foreground">{subtext}</p>
      </div>
    </motion.button>
  );
};

interface StatsOverviewProps {
  logs: LogEntry[];
  onOpenFeature: (type: 'feeding' | 'diaper' | 'pumping') => void;
  onOpenDashboard: () => void;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ logs, onOpenFeature, onOpenDashboard }) => {
  const recentFeed = logs.find(log => log.type === 'feeding');
  const recentDiaper = logs.find(log => log.type === 'diaper');
  const recentPump = logs.find(log => log.type === 'pump');

  const getFeedingTime = () => {
    if (!recentFeed) return { time: '--', subtext: 'ยังไม่มีข้อมูล' };
    const relative = formatRelativeTime(recentFeed.timestamp);
    const parts = relative.split('ที่แล้ว');
    return { 
      time: parts[0].trim(), 
      subtext: parts.length > 1 ? 'ที่แล้ว' : '' 
    };
  };

  const getDiaperTime = () => {
    if (!recentDiaper) return { time: '--', subtext: 'ยังไม่มีข้อมูล' };
    const relative = formatRelativeTime(recentDiaper.timestamp);
    const parts = relative.split('ที่แล้ว');
    return { 
      time: parts[0].trim(), 
      subtext: parts.length > 1 ? 'ที่แล้ว' : '' 
    };
  };

  const getPumpTime = () => {
    if (!recentPump) return { time: '--', subtext: 'ยังไม่มีข้อมูล' };
    const relative = formatRelativeTime(recentPump.timestamp);
    const parts = relative.split('ที่แล้ว');
    return { 
      time: parts[0].trim(), 
      subtext: parts.length > 1 ? 'ที่แล้ว' : '' 
    };
  };

  const feedingData = getFeedingTime();
  const diaperData = getDiaperTime();
  const pumpData = getPumpTime();

  return (
    <div className="px-6 py-4 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatsWidget
          icon={Utensils}
          title="กินนมล่าสุด"
          time={feedingData.time}
          subtext={feedingData.subtext}
          type="feeding"
          onClick={() => onOpenFeature('feeding')}
        />
        <StatsWidget
          icon={Baby}
          title="เปลี่ยนผ้าอ้อม"
          time={diaperData.time}
          subtext={diaperData.subtext}
          type="diaper"
          onClick={() => onOpenFeature('diaper')}
        />
        <StatsWidget
          icon={Heart}
          title="ปั๊มนมล่าสุด"
          time={pumpData.time}
          subtext={pumpData.subtext}
          type="pump"
          onClick={() => onOpenFeature('pumping')}
        />
      </div>

      {/* Dashboard Button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onOpenDashboard}
        className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center gap-2 hover:bg-primary/20 transition-all"
      >
        <BarChart3 size={18} className="text-primary" />
        <span className="font-semibold text-foreground">ดู Dashboard สรุป</span>
      </motion.button>
    </div>
  );
};

export default StatsOverview;
