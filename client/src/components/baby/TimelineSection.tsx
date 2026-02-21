import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, Baby, Droplets, Moon, Droplet } from 'lucide-react';
import { LogEntry, FeedingDetails, DiaperDetails, POO_COLORS } from '@/types/baby';
import { formatTime, formatDate } from '@/lib/babyUtils';
import LogDetailModal from './LogDetailModal';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyData = any;

interface TimelineItemProps {
  entry: LogEntry;
  onViewDetail: (entry: LogEntry) => void;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ entry, onViewDetail }) => {
  let icon = <Droplets size={16} />;
  let color = 'text-feeding';
  let bgColor = 'bg-feeding';
  let title = 'กิจกรรม';
  let details = '';
  let subDetails = '';

  if (entry.type === 'feeding') {
    icon = <Utensils size={16} />;
    color = 'text-feeding';
    bgColor = 'bg-feeding';
    title = 'กินนม';
    const d = entry.details as FeedingDetails;

    if (d.method === 'bottle') {
      const content = d.bottleContent === 'breastmilk' ? 'นมแม่' : 'นมผง';
      details = `ขวด • ${content} • ${d.amountMl || 0} ml`;
    } else {
      const leftMins = Math.floor((d.leftDurationSeconds || 0) / 60);
      const rightMins = Math.floor((d.rightDurationSeconds || 0) / 60);
      details = `เข้าเต้า • ซ้าย ${leftMins}น. ขวา ${rightMins}น.`;
    }

    if (d.hasSpitUp) {
      subDetails = '⚠️ แหวะนม';
    }
  } else if (entry.type === 'diaper') {
    icon = <Baby size={16} />;
    color = 'text-diaper';
    bgColor = 'bg-diaper';
    title = 'เปลี่ยนผ้าอ้อม';
    const d = entry.details as DiaperDetails;

    const statusMap: Record<string, string> = {
      clean: 'สะอาด',
      pee: 'ฉี่',
      poo: 'อึ',
      mixed: 'ฉี่ + อึ',
    };
    details = statusMap[d.status] || d.status;

    if (d.pooColor) {
      const colorInfo = POO_COLORS.find(c => c.id === d.pooColor);
      if (colorInfo) {
        subDetails = `สี${colorInfo.label}`;
      }
    }
  } else if (entry.type === 'pump') {
    icon = <Droplet size={16} />;
    color = 'text-pump';
    bgColor = 'bg-pump';
    title = 'ปั๊มนม';
    const d = entry.details as AnyData;
    details = `${d.amountTotalMl} ml • ${d.durationMinutes} นาที`;
  } else if (entry.type === 'sleep') {
    icon = <Moon size={16} />;
    color = 'text-sleep';
    bgColor = 'bg-sleep';
    title = 'การนอน';
    const d = entry.details as AnyData;
    const hrs = Math.floor(d.durationMinutes / 60);
    const mins = d.durationMinutes % 60;
    details = `${hrs > 0 ? `${hrs}ชม. ` : ''}${mins}นาที`;
  }

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={() => onViewDetail(entry)}
      className="w-full flex gap-4 py-4 border-b border-border last:border-0 text-left hover:bg-secondary/30 transition-colors rounded-lg px-2 -mx-2"
    >
      {/* Icon */}
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full ${bgColor}/20 flex items-center justify-center`}>
          <span className={color}>{icon}</span>
        </div>
        <div className="w-0.5 flex-1 bg-border mt-2" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold text-foreground">{title}</h4>
            <p className="text-sm text-muted-foreground">{details}</p>
            {subDetails && (
              <p className="text-sm text-feeding mt-1">{subDetails}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">
              {formatTime(entry.timestamp)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(entry.timestamp)}
            </p>
          </div>
        </div>
      </div>
    </motion.button>
  );
};

interface TimelineSectionProps {
  logs: LogEntry[];
}

const TimelineSection: React.FC<TimelineSectionProps> = ({ logs }) => {
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  if (logs.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
          <Utensils size={28} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          ยังไม่มีบันทึก
        </h3>
        <p className="text-muted-foreground text-sm">
          กดปุ่ม + เพื่อเริ่มบันทึกกิจกรรม
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="px-6 py-4">
        <h3 className="text-lg font-bold text-foreground mb-4">ประวัติกิจกรรม</h3>
        <div>
          {logs.slice(0, 20).map((entry) => (
            <TimelineItem
              key={entry.id}
              entry={entry}
              onViewDetail={setSelectedLog}
            />
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedLog && (
          <LogDetailModal
            entry={selectedLog}
            onClose={() => setSelectedLog(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default TimelineSection;
