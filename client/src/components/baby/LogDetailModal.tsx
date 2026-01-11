import React from 'react';
import { motion } from 'framer-motion';
import { X, Utensils, Baby, Clock, Calendar, AlertTriangle, Heart, Moon } from 'lucide-react';
import { LogEntry, FeedingDetails, DiaperDetails, PumpingDetails, SleepDetails, POO_COLORS } from '@/types/baby';
import { formatTime, formatDate } from '@/lib/babyUtils';

interface LogDetailModalProps {
  entry: LogEntry;
  onClose: () => void;
}

const LogDetailModal: React.FC<LogDetailModalProps> = ({ entry, onClose }) => {
  const isFeeding = entry.type === 'feeding';
  const isDiaper = entry.type === 'diaper';
  const isPump = entry.type === 'pump';
  const isSleep = entry.type === 'sleep';

  const details = entry.details as any;

  let bgClass = 'bg-secondary/20';
  let iconBgClass = 'bg-secondary/30';
  let iconColor = 'text-foreground';
  let title = 'รายละเอียด';
  let Icon = Clock;

  if (isFeeding) {
    bgClass = 'bg-feeding/20';
    iconBgClass = 'bg-feeding/30';
    iconColor = 'text-feeding';
    title = 'กินนม';
    Icon = Utensils;
  } else if (isDiaper) {
    bgClass = 'bg-diaper/20';
    iconBgClass = 'bg-diaper/30';
    iconColor = 'text-diaper';
    title = 'เปลี่ยนผ้าอ้อม';
    Icon = Baby;
  } else if (isPump) {
    bgClass = 'bg-pump/20';
    iconBgClass = 'bg-pump/30';
    iconColor = 'text-pump';
    title = 'ปั๊มนม';
    Icon = Heart;
  } else if (isSleep) {
    bgClass = 'bg-sleep/20';
    iconBgClass = 'bg-sleep/30';
    iconColor = 'text-sleep';
    title = 'การนอน';
    Icon = Moon;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-md bg-card rounded-3xl border border-border shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-5 ${bgClass}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${iconBgClass}`}>
                <Icon size={24} className={iconColor} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground">รายละเอียดบันทึก</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-background/50 hover:bg-background transition-colors"
            >
              <X size={20} className="text-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Time & Date */}
          <div className="flex gap-4">
            <div className="flex-1 bg-secondary/50 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock size={16} />
                <span className="text-xs font-medium">เวลา</span>
              </div>
              <p className="text-xl font-bold text-foreground">{formatTime(entry.timestamp)}</p>
            </div>
            <div className="flex-1 bg-secondary/50 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar size={16} />
                <span className="text-xs font-medium">วันที่</span>
              </div>
              <p className="text-xl font-bold text-foreground">{formatDate(entry.timestamp)}</p>
            </div>
          </div>

          {/* Feeding Details */}
          {isFeeding && (
            <div className="space-y-4">
              <div className="bg-feeding/10 rounded-2xl p-4 border border-feeding/20">
                <p className="text-sm text-muted-foreground mb-2">วิธีการให้นม</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">
                    {(details as FeedingDetails).method === 'bottle' ? '🍼' : '🤱'}
                  </span>
                  <div>
                    <p className="font-bold text-foreground">
                      {(details as FeedingDetails).method === 'bottle' ? 'ขวดนม' : 'เข้าเต้า'}
                    </p>
                    {(details as FeedingDetails).bottleContent && (
                      <p className="text-sm text-muted-foreground">
                        {(details as FeedingDetails).bottleContent === 'breastmilk' ? 'นมแม่' : 'นมผง'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {(details as FeedingDetails).method === 'bottle' && (details as FeedingDetails).amountMl && (
                <div className="bg-secondary/50 rounded-2xl p-4">
                  <p className="text-sm text-muted-foreground mb-2">ปริมาณนม</p>
                  <p className="text-4xl font-bold text-feeding">
                    {(details as FeedingDetails).amountMl} <span className="text-xl">ml</span>
                  </p>
                </div>
              )}

              {(details as FeedingDetails).method === 'breast' && (
                <div className="space-y-3">
                  <div className="bg-secondary/50 rounded-2xl p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">เวลารวม</p>
                    <p className="text-3xl font-bold text-foreground">
                      {(() => {
                        const totalSeconds = ((details as FeedingDetails).leftDurationSeconds || 0) + ((details as FeedingDetails).rightDurationSeconds || 0);
                        const m = Math.floor(totalSeconds / 60);
                        const s = totalSeconds % 60;
                        if (m === 0) return <>{s} <span className="text-sm">วินาที</span></>;
                        return <>{m} <span className="text-sm">นาที</span> {s > 0 && <>{s} <span className="text-sm">วิ</span></>}</>;
                      })()}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-secondary/50 rounded-2xl p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">เต้าซ้าย</p>
                      <p className="text-2xl font-bold text-foreground">
                        {(() => {
                          const seconds = (details as FeedingDetails).leftDurationSeconds || 0;
                          const m = Math.floor(seconds / 60);
                          const s = seconds % 60;
                          if (m === 0) return <>{s} <span className="text-sm">วินาที</span></>;
                          return <>{m} <span className="text-sm">นาที</span> {s > 0 && <>{s} <span className="text-sm">วิ</span></>}</>;
                        })()}
                      </p>
                    </div>
                    <div className="bg-secondary/50 rounded-2xl p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">เต้าขวา</p>
                      <p className="text-2xl font-bold text-foreground">
                        {(() => {
                          const seconds = (details as FeedingDetails).rightDurationSeconds || 0;
                          const m = Math.floor(seconds / 60);
                          const s = seconds % 60;
                          if (m === 0) return <>{s} <span className="text-sm">วินาที</span></>;
                          return <>{m} <span className="text-sm">นาที</span> {s > 0 && <>{s} <span className="text-sm">วิ</span></>}</>;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {(details as FeedingDetails).hasSpitUp && (
                <div className="flex items-center gap-3 bg-orange-500/10 rounded-2xl p-4 border border-orange-500/20">
                  <AlertTriangle size={20} className="text-orange-500" />
                  <p className="font-medium text-orange-500">แหวะนม</p>
                </div>
              )}
            </div>
          )}

          {/* Diaper Details */}
          {isDiaper && (
            <div className="space-y-4">
              <div className="bg-diaper/10 rounded-2xl p-4 border border-diaper/20">
                <p className="text-sm text-muted-foreground mb-3">สถานะผ้าอ้อม</p>
                <div className="flex items-center gap-4">
                  {((details as DiaperDetails).status === 'pee' || (details as DiaperDetails).status === 'mixed') && (
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">💧</span>
                      <span className="font-bold text-diaper">ฉี่</span>
                    </div>
                  )}
                  {((details as DiaperDetails).status === 'poo' || (details as DiaperDetails).status === 'mixed') && (
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">💩</span>
                      <span className="font-bold text-diaper">อึ</span>
                    </div>
                  )}
                  {(details as DiaperDetails).status === 'clean' && (
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">✨</span>
                      <span className="font-bold text-diaper">สะอาด</span>
                    </div>
                  )}
                </div>
              </div>

              {(details as DiaperDetails).pooColor && (
                <div className="bg-secondary/50 rounded-2xl p-4">
                  <p className="text-sm text-muted-foreground mb-3">สีอึ</p>
                  <div className="flex items-center gap-3">
                    {(() => {
                      const colorInfo = POO_COLORS.find(c => c.id === (details as DiaperDetails).pooColor);
                      return colorInfo ? (
                        <>
                          <div
                            className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                            style={{ backgroundColor: colorInfo.color }}
                          />
                          <span className="font-bold text-foreground">สี{colorInfo.label}</span>
                        </>
                      ) : null;
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pump Details */}
          {isPump && (
            <div className="space-y-4">
              <div className="bg-pump/10 rounded-2xl p-4 border border-pump/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">ปริมาณรวม</span>
                  <span className="text-sm text-muted-foreground">{details.durationMinutes} นาที</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-pump">{details.amountTotalMl}</span>
                  <span className="text-xl text-muted-foreground">ml</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary/50 rounded-2xl p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">ซ้าย</p>
                  <p className="text-2xl font-bold text-foreground">
                    {details.amountLeftMl || 0} <span className="text-sm">ml</span>
                  </p>
                </div>
                <div className="bg-secondary/50 rounded-2xl p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">ขวา</p>
                  <p className="text-2xl font-bold text-foreground">
                    {details.amountRightMl || 0} <span className="text-sm">ml</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Sleep Details */}
          {isSleep && (
            <div className="space-y-4">
              <div className="bg-sleep/10 rounded-2xl p-4 border border-sleep/20">
                <p className="text-sm text-muted-foreground mb-2">ระยะเวลาการนอน</p>
                <div className="flex items-baseline gap-2">
                  {Math.floor(details.durationMinutes / 60) > 0 && (
                    <span className="text-4xl font-bold text-sleep">{Math.floor(details.durationMinutes / 60)} <span className="text-xl text-muted-foreground">ชม.</span></span>
                  )}
                  <span className="text-4xl font-bold text-sleep">{details.durationMinutes % 60}</span>
                  <span className="text-xl text-muted-foreground">นาที</span>
                </div>
              </div>

              {details.endTime && (
                <div className="bg-secondary/50 rounded-2xl p-4">
                  <p className="text-sm text-muted-foreground mb-2">ตื่นเวลา</p>
                  <p className="text-xl font-bold text-foreground">
                    {formatTime(new Date(details.endTime))}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {(details as any).notes && (
            <div className="bg-secondary/50 rounded-2xl p-4">
              <p className="text-sm text-muted-foreground mb-2">หมายเหตุ</p>
              <p className="text-foreground">{(details as any).notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-secondary text-foreground font-semibold hover:bg-secondary/80 transition-colors"
          >
            ปิด
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LogDetailModal;
