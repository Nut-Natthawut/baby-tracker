import React, { useEffect, useRef, useState } from 'react';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimePickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (date: Date) => void;
    initialDate: Date;
    title: string;
}

const TimePicker: React.FC<TimePickerProps> = ({ isOpen, onClose, onSave, initialDate, title }) => {
    const [selectedHour, setSelectedHour] = useState(initialDate.getHours());
    const [selectedMinute, setSelectedMinute] = useState(initialDate.getMinutes());

    // Fixed lists for hours and minutes
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    useEffect(() => {
        if (isOpen) {
            setSelectedHour(initialDate.getHours());
            setSelectedMinute(initialDate.getMinutes());
        }
    }, [isOpen, initialDate]);

    const handleSave = () => {
        const newDate = new Date(initialDate);
        newDate.setHours(selectedHour);
        newDate.setMinutes(selectedMinute);
        onSave(newDate);
        onClose();
    };

    const Wheel = ({ items, selected, onSelect, type }: { items: number[], selected: number, onSelect: (val: number) => void, type: 'hour' | 'minute' }) => {
        const containerRef = useRef<HTMLDivElement>(null);
        const itemHeight = 48; // h-12

        // Scroll to selected on open
        useEffect(() => {
            if (isOpen && containerRef.current) {
                const index = items.indexOf(selected);
                if (index !== -1) {
                    containerRef.current.scrollTop = index * itemHeight;
                }
            }
        }, [isOpen]);

        const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
            const scrollTop = e.currentTarget.scrollTop;
            const index = Math.round(scrollTop / itemHeight);
            if (items[index] !== undefined && items[index] !== selected) {
                // Optional: Snap logic could go here or use CSS scroll-snap
                // For now, let's just listen to scroll end or stick to selection on click
                // To keep it simple and performant, we might just highlight the center one?
                // Actually, standard IOS picker snaps.
            }
        };

        // Simplified implementation: Click to select or simple list for now. 
        // A true scroll wheel is complex. Let's make a nice scrollable list where you click to select.
        // Integrating full scroll snap logic is better.

        return (
            <div className="h-64 overflow-y-auto no-scrollbar snap-y snap-mandatory py-24"
                ref={containerRef}
                onScroll={(e) => {
                    // Simple debounce or check center could be added here
                    // For this version, let's rely on click to sure-select, 
                    // but visually show the "wheel" effect.
                    // Actually, let's just do click-to-select for reliability first.
                }}
            >
                {items.map((item) => (
                    <div
                        key={item}
                        onClick={() => {
                            onSelect(item);
                            // smooth scroll to it
                            if (containerRef.current) {
                                const index = items.indexOf(item);
                                containerRef.current.scrollTo({ top: index * itemHeight, behavior: 'smooth' });
                            }
                        }}
                        className={`h-12 flex items-center justify-center snap-center cursor-pointer transition-all duration-200 ${selected === item
                                ? 'text-4xl font-black text-slate-800 scale-110'
                                : 'text-xl text-slate-400 font-medium'
                            }`}
                    >
                        {item.toString().padStart(2, '0')}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
                    />

                    {/* Picker Card */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 pointer-events-auto shadow-2xl safe-area-bottom"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition"
                            >
                                <X size={24} />
                            </button>
                            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                            <button
                                onClick={handleSave}
                                className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition"
                            >
                                <Check size={24} />
                            </button>
                        </div>

                        <div className="relative h-64 flex justify-center gap-8 items-center bg-slate-50 rounded-2xl overflow-hidden">
                            {/* Selection Highlight Bar */}
                            <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 h-12 bg-white rounded-xl shadow-sm border border-slate-200 pointer-events-none" />

                            <div className="relative z-10 w-20 text-center">
                                <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">ชั่วโมง</div>
                                <Wheel items={hours} selected={selectedHour} onSelect={setSelectedHour} type="hour" />
                            </div>

                            <div className="text-2xl font-black text-slate-300 pb-6">:</div>

                            <div className="relative z-10 w-20 text-center">
                                <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">นาที</div>
                                <Wheel items={minutes} selected={selectedMinute} onSelect={setSelectedMinute} type="minute" />
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={handleSave}
                                className="w-full py-4 rounded-xl bg-primary text-white font-bold text-lg shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform"
                            >
                                ตกลง
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default TimePicker;
