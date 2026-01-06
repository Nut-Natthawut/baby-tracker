import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, Plus, UserPlus, Mail, Check, X, Crown, Trash2 } from 'lucide-react';

interface Caregiver {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'caregiver';
  status: 'active' | 'pending';
  avatar?: string;
}

interface CaregiversModalProps {
  onClose: () => void;
}

// Mock data - จะเชื่อมต่อ backend ภายหลัง
const mockCaregivers: Caregiver[] = [
  { 
    id: '1', 
    name: 'คุณแม่', 
    email: 'mom@example.com', 
    role: 'owner', 
    status: 'active' 
  },
];

const CaregiversModal: React.FC<CaregiversModalProps> = ({ onClose }) => {
  const [caregivers, setCaregivers] = useState<Caregiver[]>(mockCaregivers);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');

  const handleInvite = () => {
    if (!inviteEmail || !inviteName) return;

    const newCaregiver: Caregiver = {
      id: Date.now().toString(),
      name: inviteName,
      email: inviteEmail,
      role: 'caregiver',
      status: 'pending',
    };

    setCaregivers([...caregivers, newCaregiver]);
    setInviteEmail('');
    setInviteName('');
    setShowInvite(false);
  };

  const handleRemove = (id: string) => {
    setCaregivers(caregivers.filter(c => c.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-border">
        <button onClick={onClose} className="p-2 -ml-2">
          <ArrowLeft size={24} className="text-foreground" />
        </button>
        <h2 className="text-lg font-bold text-foreground">ผู้ดูแลร่วม</h2>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Info Section */}
        <div className="px-6 py-6">
          <div className="bg-accent/10 rounded-2xl p-4 border border-accent/20">
            <div className="flex items-start gap-3">
              <Users size={24} className="text-accent mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  แชร์กับครอบครัว
                </h3>
                <p className="text-sm text-muted-foreground">
                  เชิญพ่อแม่หรือพี่เลี้ยงเพื่อบันทึกข้อมูลร่วมกัน ทุกคนจะเห็นข้อมูลเดียวกัน
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Caregivers List */}
        <div className="px-6 pb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            สมาชิก ({caregivers.length})
          </h3>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {caregivers.map((caregiver, index) => (
              <div 
                key={caregiver.id}
                className={`flex items-center gap-4 px-4 py-4 ${
                  index !== caregivers.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-peach to-mint flex items-center justify-center text-lg font-bold text-primary-foreground">
                  {caregiver.name.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground truncate">
                      {caregiver.name}
                    </p>
                    {caregiver.role === 'owner' && (
                      <Crown size={14} className="text-feeding flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {caregiver.email}
                  </p>
                  {caregiver.status === 'pending' && (
                    <span className="inline-flex items-center gap-1 text-xs text-feeding bg-feeding/10 px-2 py-0.5 rounded-full mt-1">
                      <Mail size={10} />
                      รอการตอบรับ
                    </span>
                  )}
                </div>

                {/* Actions */}
                {caregiver.role !== 'owner' && (
                  <button
                    onClick={() => handleRemove(caregiver.id)}
                    className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 size={18} className="text-destructive" />
                  </button>
                )}
              </div>
            ))}
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
                  <h3 className="font-semibold text-foreground">เชิญผู้ดูแล</h3>
                  <button
                    onClick={() => setShowInvite(false)}
                    className="p-1 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <X size={18} className="text-muted-foreground" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">
                      ชื่อ
                    </label>
                    <input
                      type="text"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      placeholder="ชื่อเล่น"
                      className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">
                      อีเมล
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <button
                    onClick={handleInvite}
                    disabled={!inviteEmail || !inviteName}
                    className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
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
      {!showInvite && (
        <div className="p-6 border-t border-border bg-card">
          <button
            onClick={() => setShowInvite(true)}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-glow-primary active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
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
