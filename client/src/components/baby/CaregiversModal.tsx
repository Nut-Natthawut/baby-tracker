import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, UserPlus, Mail, X, Crown, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface CaregiverMember {
  id: string;
  name?: string | null;
  email: string;
  role: 'owner' | 'caregiver';
  createdAt?: number;
}

interface PendingInvite {
  id: string;
  email: string;
  role: 'caregiver';
  status: 'pending';
  expiresAt: number;
  createdAt: number;
  inviteLink?: string | null;
}

interface CaregiversModalProps {
  babyId: string | null;
  onClose: () => void;
}

const CaregiversModal: React.FC<CaregiversModalProps> = ({ babyId, onClose }) => {
  const { authFetch, user } = useAuth();
  const [members, setMembers] = useState<CaregiverMember[]>([]);
  const [loading, setLoading] = useState(true);

  const isOwner = useMemo(() => {
    if (!user) return false;
    return members.some((member) => member.id === user.id && member.role === 'owner');
  }, [members, user]);

  useEffect(() => {
    const fetchCaregivers = async () => {
      if (!babyId) return;
      setLoading(true);
      try {
        const response = await authFetch(`${API_BASE_URL}/babies/${babyId}/caregivers`);
        const result = await response.json();
        if (result.success) {
          setMembers(result.data.members || []);
        } else {
          toast({
            title: "โหลดข้อมูลไม่สำเร็จ",
            description: result.message || "กรุณาลองใหม่",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Load caregivers error:", error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลได้",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCaregivers();
  }, [authFetch, babyId]);

  const handleRemove = async (id: string) => {
    if (!babyId) return;
    try {
      const response = await authFetch(`${API_BASE_URL}/babies/${babyId}/caregivers/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const result = await response.json();
        toast({
          title: "ลบสมาชิกไม่สำเร็จ",
          description: result.message || "กรุณาลองใหม่",
          variant: "destructive",
        });
        return;
      }
      setMembers((prev) => prev.filter((member) => member.id !== id));
    } catch (error) {
      console.error("Remove caregiver error:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบสมาชิกได้",
        variant: "destructive",
      });
    }
  };

  if (!babyId) {
    return (
      <motion.div
        initial={{ opacity: 0, x: '100%' }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-50 bg-background flex flex-col"
      >
        <div className="flex items-center gap-4 px-6 py-5 border-b border-border">
          <button onClick={onClose} className="p-2 -ml-2">
            <ArrowLeft size={24} className="text-foreground" />
          </button>
          <h2 className="text-xl font-bold text-foreground">ผู้ดูแลร่วม</h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          ยังไม่มีข้อมูลเด็ก
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-5 border-b border-border">
        <button onClick={onClose} className="p-2 -ml-2">
          <ArrowLeft size={24} className="text-foreground" />
        </button>
        <h2 className="text-xl font-bold text-foreground">ผู้ดูแลร่วม</h2>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Info Section */}
        <div className="px-6 py-6">
          <div className="bg-accent/10 rounded-2xl p-4 border border-accent/20">
            <div className="flex items-start gap-3">
              <Users size={24} className="text-accent mt-0.5" />
              <div>
                <h3 className="text-base font-semibold text-foreground mb-1">
                  แชร์กับครอบครัว
                </h3>
                <p className="text-base text-muted-foreground">
                  เชิญคนในครอบครัวมาช่วยบันทึกข้อมูลร่วมกัน ทุกคนจะเห็นข้อมูลเดียวกัน
                </p>
                <div className="mt-3 text-sm text-muted-foreground space-y-1">
                  <p>• ใช้รหัส 6 หลักในการเข้าร่วมห้อง</p>
                  <p>• รหัสมีอายุการใช้งาน 5 นาที</p>
                  <p>• สร้างรหัสใหม่ได้ตลอดเวลา</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Members */}
        <div className="px-6 pb-6">
          <h3 className="text-base font-semibold text-muted-foreground mb-3">
            สมาชิก ({members.length})
          </h3>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {loading && (
              <div className="px-4 py-6 text-sm text-muted-foreground">กำลังโหลดข้อมูล...</div>
            )}
            {!loading && members.length === 0 && (
              <div className="px-4 py-6 text-sm text-muted-foreground">ยังไม่มีสมาชิก</div>
            )}
            {!loading && members.length > 0 && (
              members.map((caregiver, index) => {
                const isLast = index === members.length - 1;
                const displayName = caregiver.name || caregiver.email.split("@")[0];

                return (
                  <div
                    key={caregiver.id}
                    className={`flex items-center gap-4 px-4 py-5 ${isLast ? '' : 'border-b border-border'
                      }`}
                  >
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-peach to-mint flex items-center justify-center text-lg font-bold text-primary-foreground">
                      {displayName.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-base font-semibold text-foreground truncate">{displayName}</p>
                        {caregiver.role === 'owner' && (
                          <Crown size={16} className="text-feeding flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{caregiver.email}</p>
                    </div>

                    {caregiver.role !== 'owner' && isOwner && (
                      <button
                        onClick={() => handleRemove(caregiver.id)}
                        className="p-3 rounded-lg hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 size={20} className="text-destructive" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add Button */}
      {isOwner && (
        <div className="p-6 border-t border-border bg-card space-y-4">
          <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
            <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
              <UserPlus size={18} />
              วิธีเชิญผู้ดูแล
            </h4>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 ml-1">
              <li>กดปุ่ม <b>"สร้างรหัส 6 หลัก"</b> ด้านล่าง</li>
              <li>ส่งรหัสให้คนในครอบครัว</li>
              <li>ให้เขาไปที่หน้า <b>"เข้าร่วมห้อง"</b> (หรือกดที่หน้า Login)</li>
              <li>กรอกรหัสเพื่อเข้าร่วมทันที</li>
            </ol>
          </div>

          <GenerateCodeButton babyId={babyId} authFetch={authFetch} />
        </div>
      )}
    </motion.div>
  );
};

const GenerateCodeButton = ({ babyId, authFetch }: { babyId: string, authFetch: typeof fetch }) => {
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const diff = expiresAt - now;
      if (diff <= 0) {
        setTimeLeft("หมดอายุ");
        setCode(null);
        setExpiresAt(null);
        clearInterval(interval);
      } else {
        const m = Math.floor(diff / 60);
        const s = diff % 60;
        setTimeLeft(`${m}:${s.toString().padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/babies/${babyId}/invite-code`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setCode(data.data.code);
        setExpiresAt(data.data.expiresAt);
      } else {
        toast({ title: "ไม่สามารถสร้างรหัสได้", variant: "destructive" });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      toast({ title: "คัดลอกรหัสแล้ว" });
    }
  };

  if (code) {
    return (
      <div className="bg-secondary/50 rounded-2xl p-4 border border-border flex flex-col items-center">
        <p className="text-sm text-muted-foreground mb-1">รหัสเข้าร่วมห้อง (หมดอายุใน {timeLeft})</p>
        <div className="flex items-center gap-4 mb-2">
          <span className="text-4xl font-mono font-bold tracking-widest text-primary">{code}</span>
        </div>
        <button onClick={copyCode} className="text-sm font-semibold text-primary hover:underline">
          คัดลอกรหัส
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={loading}
      className="w-full py-4 rounded-2xl bg-secondary text-secondary-foreground font-bold text-xl border-2 border-border hover:bg-secondary/80 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
    >
      {loading ? "กำลังสร้าง..." : "สร้างรหัส 6 หลัก"}
    </button>
  );
};

export default CaregiversModal;
