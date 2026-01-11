import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Minus, Moon } from 'lucide-react';
import { SleepDetails } from '@/types/baby';
import { roundToNearest30, formatTime } from '@/lib/babyUtils';

interface SleepModalProps {
    onClose: () => void;
    onSave: (data: { timestamp: Date; details: SleepDetails }) => void;
}

const SleepModal: React.FC<SleepModalProps> = ({ onClose, onSave }) => {
    const [durationMinutes, setDurationMinutes] = useState(60);
    const [endTime, setEndTime] = useState<Date>(roundToNearest30(new Date()));
    const [notes, setNotes] = useState('');

    const handleSave = () => {
        // Calculate start time based on end time and duration
        // Or we can just use endTime as the "timestamp" depending on how we want to log it.
        // Usually log timestamp is "when it happened".
        // For sleep, we might want saving timestamp to be the start time or end time?
        // Let's assume 'timestamp' is the Start Time (standard for most logs).
        const startTime = new Date(endTime.getTime() - durationMinutes * 60000);

        const details: SleepDetails = {
            durationMinutes,
            endTime,
            notes: notes || undefined,
        };

        onSave({
            timestamp: startTime,
            details,
        });
    };

    const adjustTime = (minutes: number) => {
        const newTime = new Date(endTime.getTime() + minutes * 60000);
        setEndTime(newTime);
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
                <h2 className="text-lg font-bold text-foreground">บันทึกการนอน</h2>
                <div className="w-10" />
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-6">

                {/* Icon Header */}
                <div className="flex justify-center mb-8">
                    <div className="w-20 h-20 rounded-full bg-sleep/20 flex items-center justify-center">
                        <Moon size={40} className="text-sleep" />
                    </div>
                </div>

                {/* Duration */}
                <div className="mb-6">
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        ระยะเวลาการนอน
                    </label>
                    <div className="flex items-center gap-4 bg-card rounded-2xl border border-border p-4">
                        <button
                            onClick={() => setDurationMinutes(Math.max(15, durationMinutes - 15))}
                            className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
                        >
                            <Minus size={20} className="text-foreground" />
                        </button>
                        <div className="flex-1 text-center">
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-4xl font-bold text-foreground">{Math.floor(durationMinutes / 60)}</span>
                                <span className="text-sm text-muted-foreground mr-2">ชม.</span>
                                <span className="text-4xl font-bold text-foreground">{durationMinutes % 60}</span>
                                <span className="text-sm text-muted-foreground">นาที</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setDurationMinutes(Math.min(720, durationMinutes + 15))}
                            className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
                        >
                            <Plus size={20} className="text-foreground" />
                        </button>
                    </div>
                </div>

                {/* End Time Adjuster */}
                <div className="mb-6">
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        เวลาตื่น (สิ้นสุด)
                    </label>
                    <div className="flex items-center gap-3 bg-card rounded-2xl border border-border p-3">
                        <button
                            onClick={() => adjustTime(-30)}
                            className="px-3 py-1.5 rounded-lg bg-secondary text-sm font-medium text-muted-foreground"
                        >
                            -30น.
                        </button>
                        <div className="flex-1 text-center">
                            <span className="text-xl font-bold text-foreground">
                                {formatTime(endTime)}
                            </span>
                        </div>
                        <button
                            onClick={() => adjustTime(30)}
                            className="px-3 py-1.5 rounded-lg bg-secondary text-sm font-medium text-muted-foreground"
                        >
                            +30น.
                        </button>
                    </div>
                    <button
                        onClick={() => setEndTime(new Date())}
                        className="w-full mt-3 py-2.5 rounded-xl bg-sleep/20 text-sleep font-medium text-sm hover:bg-sleep/30 transition-all"
                    >
                        ⏱️ เพิ่งตื่นตอนนี้
                    </button>
                </div>

                {/* Notes */}
                <div className="mb-6">
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        หมายเหตุ (ไม่บังคับ)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="เช่น หลับปุ๋ย, ตื่นมาร้อง..."
                        className="w-full bg-card border border-border rounded-2xl p-4 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-sleep/50"
                        rows={3}
                    />
                </div>
            </div>

            {/* Save Button */}
            <div className="p-6 border-t border-border bg-card">
                <button
                    onClick={handleSave}
                    className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-glow-primary active:scale-[0.98] transition-transform"
                >
                    บันทึก
                </button>
            </div>
        </motion.div>
    );
};

export default SleepModal;
