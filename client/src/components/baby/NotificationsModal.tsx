import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, X, Bell } from 'lucide-react';
import { Baby } from '@/types/baby';
import { API_BASE_URL } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Request {
    id: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
    requesterName: string | null;
}

interface NotificationsModalProps {
    baby: Baby | null;
    onClose: () => void;
    onMembersUpdated: () => void;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({
    baby,
    onClose,
    onMembersUpdated,
}) => {
    const { token } = useAuth();
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchRequests = async () => {
        if (!baby || !token) return;
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/babies/${baby.id}/requests`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            if (json.success) {
                setRequests(json.data);
            }
        } catch (err) {
            console.error("Failed to fetch requests", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [baby?.id]);

    const handleAction = async (requestId: string, action: 'approve' | 'reject') => {
        if (!baby || !token) return;
        try {
            setProcessingId(requestId);
            const res = await fetch(`${API_BASE_URL}/babies/${baby.id}/requests/${requestId}/${action}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            if (json.success) {
                toast({
                    title: action === 'approve' ? "อนุมัติสำเร็จ" : "ปฏิเสธคำขอแล้ว",
                    description: action === 'approve' ? "เพิ่มผู้ดูแลเรียบร้อยแล้ว" : "ปฏิเสธคำขอการเข้าร่วมแล้ว",
                });
                setRequests(requests.filter(req => req.id !== requestId));
                if (action === 'approve') {
                    onMembersUpdated();
                }
            } else {
                toast({ title: "เกิดข้อผิดพลาด", description: json.message, variant: "destructive" });
            }
        } catch (err) {
            toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-background text-foreground overflow-hidden"
        >
            <div className="pointer-events-none absolute inset-0 -z-10">
                <motion.div
                    className="absolute -top-20 -right-20 h-[320px] w-[320px] rounded-full bg-saguaro/20 blur-3xl"
                    animate={{ y: [0, 16, 0], x: [0, -10, 0] }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute top-[30%] -left-28 h-[360px] w-[360px] rounded-full bg-sky/20 blur-3xl"
                    animate={{ y: [0, -12, 0], x: [0, 10, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                />
            </div>

            <div className="relative z-10 flex h-full flex-col">
                {/* Header */}
                <div className="sticky top-0 z-20 border-b border-white/70 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl">
                    <div className="mx-auto flex items-center gap-3 px-4 md:px-8 py-4 max-w-[1100px]">
                        <button
                            onClick={onClose}
                            className="flex items-center justify-center size-10 rounded-full bg-white/80 dark:bg-white/10 border border-white/70 dark:border-white/10 text-gray-700 dark:text-gray-200 shadow-[0_10px_25px_-18px_rgba(15,23,42,0.45)] transition-all"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="leading-tight">
                            <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-muted-foreground">Notifications</p>
                            <h2 className="text-xl md:text-2xl font-black tracking-[-0.02em] text-foreground">การแจ้งเตือน</h2>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar">
                    <div className="mx-auto w-full max-w-[1100px] px-4 md:px-8 pb-10">
                        <div className="mt-6 flex flex-col gap-4">
                            {loading ? (
                                <div className="text-center text-muted-foreground py-10 animate-pulse">
                                    กำลังโหลดข้อมูล...
                                </div>
                            ) : requests.length === 0 ? (
                                <div className="text-center py-16 flex flex-col items-center">
                                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                        <Bell className="w-8 h-8 text-muted-foreground opacity-50" />
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground">ไม่มีการแจ้งเตือน</h3>
                                    <p className="text-muted-foreground mt-1">ยังไม่มีคำขอเข้าร่วมครอบครัวใหม่</p>
                                </div>
                            ) : (
                                <AnimatePresence>
                                    {requests.map(req => (
                                        <motion.div
                                            key={req.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="rounded-[24px] border border-white/70 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl p-5 shadow-[0_12px_30px_-15px_rgba(15,23,42,0.2)]"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div>
                                                    <p className="text-sm uppercase tracking-wider text-primary font-bold mb-1">คำขอร่วมครอบครัว</p>
                                                    <h4 className="text-lg font-black text-foreground">{req.requesterName || "ผู้ใช้ใหม่"}</h4>
                                                    <p className="text-sm text-muted-foreground">{req.email}</p>
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        ขอสิทธิ์เป็น: <span className="font-semibold">{req.role === 'parent' ? 'พ่อ/แม่' : 'ผู้ช่วยเลี้ยง'}</span>
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleAction(req.id, 'reject')}
                                                        disabled={processingId === req.id}
                                                        className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 text-rose-600 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 font-bold transition-all disabled:opacity-50"
                                                    >
                                                        <X size={18} />
                                                        ปฏิเสธ
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(req.id, 'approve')}
                                                        disabled={processingId === req.id}
                                                        className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-bold shadow-glow-primary hover:brightness-95 active:scale-[0.98] transition-all disabled:opacity-50"
                                                    >
                                                        <Check size={18} />
                                                        ยอมรับ
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default NotificationsModal;
