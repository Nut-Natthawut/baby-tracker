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
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

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
          setInvites(result.data.invites || []);
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

  const handleInvite = async () => {
    if (!inviteEmail || !babyId) return;
    if (!isOwner) {
      toast({
        title: "เฉพาะเจ้าของเท่านั้น",
        description: "คุณไม่มีสิทธิ์ส่งคำเชิญ",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await authFetch(`${API_BASE_URL}/babies/${babyId}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        toast({
          title: "ส่งคำเชิญไม่สำเร็จ",
          description: result.message || "กรุณาลองใหม่",
          variant: "destructive",
        });
        return;
      }

      setInvites((prev) => [result.data, ...prev]);
      setInviteEmail('');
      setShowInvite(false);
      if (result.data?.inviteLink) {
        try {
          await navigator.clipboard.writeText(result.data.inviteLink);
          toast({
            title: "สร้างลิงก์เชิญแล้ว",
            description: "คัดลอกลิงก์เชิญไว้ในคลิปบอร์ดแล้ว",
          });
        } catch {
          toast({
            title: "สร้างลิงก์เชิญแล้ว",
            description: result.data.inviteLink,
          });
        }
      } else {
        toast({
          title: "ส่งคำเชิญสำเร็จ",
          description: `ส่งคำเชิญไปที่ ${inviteEmail}`,
        });
      }
    } catch (error) {
      console.error("Invite error:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งคำเชิญได้",
        variant: "destructive",
      });
    }
  };

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

  const handleRevoke = async (inviteId: string) => {
    if (!babyId) return;
    try {
      const response = await authFetch(
        `${API_BASE_URL}/babies/${babyId}/invitations/${inviteId}/revoke`,
        { method: "POST" }
      );
      if (!response.ok) {
        const result = await response.json();
        toast({
          title: "ยกเลิกไม่สำเร็จ",
          description: result.message || "กรุณาลองใหม่",
          variant: "destructive",
        });
        return;
      }
      setInvites((prev) => prev.filter((invite) => invite.id !== inviteId));
    } catch (error) {
      console.error("Revoke invite error:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถยกเลิกคำเชิญได้",
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
                  <p>• ถ้าตั้งค่าอีเมลไว้ ระบบจะส่งลิงก์เชิญให้โดยอัตโนมัติ</p>
                  <p>• ถ้ายังไม่ตั้งค่าอีเมล ระบบจะให้ลิงก์เชิญสำหรับคัดลอก</p>
                  <p>• ลิงก์เชิญมีอายุ 24 ชั่วโมง</p>
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
                    className={`flex items-center gap-4 px-4 py-5 ${
                      isLast ? '' : 'border-b border-border'
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

        {/* Pending Invites */}
        <div className="px-6 pb-6">
          <h3 className="text-base font-semibold text-muted-foreground mb-3">
            คำเชิญที่ส่งแล้ว ({invites.length})
          </h3>
          {!loading && invites.length > 0 && (
            <p className="text-xs text-muted-foreground mb-3">
              หากไม่มีอีเมล ระบบจะแสดงลิงก์คัดลอกได้เฉพาะตอนเชิญครั้งล่าสุด
            </p>
          )}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {invites.length === 0 ? (
              <div className="px-4 py-6 text-sm text-muted-foreground">ยังไม่มีคำเชิญค้างอยู่</div>
            ) : (
              invites.map((invite, index) => {
                const isLast = index === invites.length - 1;
                return (
                  <div
                    key={invite.id}
                    className={`flex items-center gap-4 px-4 py-5 ${
                      isLast ? '' : 'border-b border-border'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-feeding/10 flex items-center justify-center text-feeding">
                      <Mail size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-foreground truncate">{invite.email}</p>
                      <p className="text-sm text-muted-foreground">รอการตอบรับ</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {invite.inviteLink && (
                        <button
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(invite.inviteLink || "");
                              toast({
                                title: "คัดลอกลิงก์เชิญแล้ว",
                                description: "ส่งลิงก์ให้ผู้ดูแลได้เลย",
                              });
                            } catch {
                              toast({
                                title: "คัดลอกไม่สำเร็จ",
                                description: invite.inviteLink || "",
                                variant: "destructive",
                              });
                            }
                          }}
                          className="px-3 py-2 rounded-lg text-sm font-semibold text-foreground hover:bg-secondary"
                        >
                          คัดลอกลิงก์
                        </button>
                      )}
                      {isOwner && (
                        <button
                          onClick={() => handleRevoke(invite.id)}
                          className="px-3 py-2 rounded-lg text-sm font-semibold text-destructive hover:bg-destructive/10"
                        >
                          ยกเลิก
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Invite Form */}
        <AnimatePresence>
          {showInvite && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-6 pb-6"
            >
              <div className="bg-card rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-foreground">เชิญผู้ดูแล</h3>
                  <button
                    onClick={() => setShowInvite(false)}
                    className="p-1 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <X size={18} className="text-muted-foreground" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label htmlFor="caregiver-email" className="text-base text-muted-foreground mb-1 block">
                      อีเมล
                    </label>
                    <input
                      id="caregiver-email"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <button
                    onClick={handleInvite}
                    disabled={!inviteEmail || !isOwner}
                    className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  >
                    ส่งคำเชิญ
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Button */}
      {!showInvite && isOwner && (
        <div className="p-6 border-t border-border bg-card">
          <button
            onClick={() => setShowInvite(true)}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-xl shadow-glow-primary active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <UserPlus size={22} />
            เชิญผู้ดูแลใหม่
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default CaregiversModal;
