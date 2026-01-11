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
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={onCancel}
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-sm bg-card rounded-3xl p-6 shadow-2xl border border-border"
                >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${isDestructive ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'
                        }`}>
                        {isDestructive ? <Trash2 size={24} /> : <AlertTriangle size={24} />}
                    </div>

                    <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                        {description}
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={onCancel}
                            className="py-3 px-4 rounded-xl bg-secondary text-foreground font-semibold hover:bg-secondary/80 transition-colors"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`py-3 px-4 rounded-xl font-semibold text-white transition-colors shadow-lg ${isDestructive
                                    ? 'bg-destructive hover:bg-destructive/90 shadow-destructive/30'
                                    : 'bg-primary hover:bg-primary/90 shadow-primary/30'
                                }`}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConfirmModal;
