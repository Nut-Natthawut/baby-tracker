import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'default' | 'destructive';
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    description,
    confirmLabel = 'ยืนยัน',
    cancelLabel = 'ยกเลิก',
    variant = 'default',
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    const isDestructive = variant === 'destructive';

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    onClick={onCancel}
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="relative w-full max-w-[340px] bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-3xl rounded-[32px] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.2)] border border-white/50 dark:border-white/10 flex flex-col items-center text-center"
                >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${isDestructive ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                        }`}>
                        {isDestructive ? <Trash2 size={28} /> : <AlertTriangle size={28} />}
                    </div>

                    <h3 className="text-[22px] font-bold tracking-tight text-foreground mb-2">{title}</h3>
                    <p className="text-[15px] text-muted-foreground mb-8 leading-relaxed px-2">
                        {description}
                    </p>

                    <div className="flex flex-col w-full gap-3">
                        <button
                            onClick={onConfirm}
                            className={`w-full py-3.5 rounded-2xl font-bold text-[17px] text-white transition-transform active:scale-[0.98] ${isDestructive
                                ? 'bg-destructive shadow-lg shadow-destructive/30'
                                : 'bg-primary shadow-lg shadow-primary/30'
                                }`}
                        >
                            {confirmLabel}
                        </button>
                        <button
                            onClick={onCancel}
                            className="w-full py-3.5 rounded-2xl bg-black/5 dark:bg-white/10 text-foreground font-semibold text-[17px] hover:bg-black/10 dark:hover:bg-white/20 transition-colors active:scale-[0.98]"
                        >
                            {cancelLabel}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConfirmModal;
