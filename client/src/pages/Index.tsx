import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useBabyData } from '@/hooks/useBabyData';
import Header from '@/components/baby/Header';
import StatsOverview from '@/components/baby/StatsOverview';
import TimelineSection from '@/components/baby/TimelineSection';
import FabMenu from '@/components/baby/FabMenu';
import FeedingModal from '@/components/baby/FeedingModal';
import DiaperModal from '@/components/baby/DiaperModal';
import PumpingModal from '@/components/baby/PumpingModal';
import SleepModal from '@/components/baby/SleepModal';
import BabyProfileModal from '@/components/baby/BabyProfileModal';
import SettingsModal from '@/components/baby/SettingsModal';
import ConfirmModal from '@/components/common/ConfirmModal';
import CaregiversModal from '@/components/baby/CaregiversModal';
import DashboardModal from '@/components/baby/DashboardModal';
import BabyCareLogo from '@/components/baby/BabyCareLogo';
import { toast } from '@/hooks/use-toast';

type ModalType = 'feeding' | 'diaper' | 'pumping' | 'sleep' | 'add-baby' | 'edit-baby' | 'settings' | 'caregivers' | 'dashboard' | 'delete-confirm' | null;

const Index = () => {
  const { baby, babies, logs, loading, saveBabyProfile,
    switchBaby,
    deleteBaby,
    addLog, clearData } = useBabyData();
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Show onboarding if no baby profile
  const showOnboarding = !loading && !baby;

  const handleSaveFeeding = (data: any) => {
    addLog('feeding', data);
    setActiveModal(null);
    toast({
      title: "บันทึกสำเร็จ ✓",
      description: "บันทึกการกินนมเรียบร้อยแล้ว",
    });
  };

  const handleSaveDiaper = (data: any) => {
    addLog('diaper', data);
    setActiveModal(null);
    toast({
      title: "บันทึกสำเร็จ ✓",
      description: "บันทึกการเปลี่ยนผ้าอ้อมเรียบร้อยแล้ว",
    });
  };

  const handleSavePumping = (data: any) => {
    addLog('pump', data);
    setActiveModal(null);
    toast({
      title: "บันทึกสำเร็จ ✓",
      description: "บันทึกการปั๊มนมเรียบร้อยแล้ว",
    });
  };

  const handleSaveSleep = (data: any) => {
    addLog('sleep', data);
    setActiveModal(null);
    toast({
      title: "บันทึกสำเร็จ ✓",
      description: "บันทึกการนอนเรียบร้อยแล้ว",
    });
  };

  const handleSaveBaby = async (data: any) => {
    try {
      // If editing, merge id. If adding, data is fresh.
      const payload = activeModal === 'edit-baby' && baby ? { ...data, id: baby.id } : data;
      const success = await saveBabyProfile(payload);
      if (success) {
        // Return to settings if editing, or close if adding
        if (activeModal === 'edit-baby') {
          setActiveModal('settings');
        } else {
          setActiveModal(null);
        }

        toast({
          title: "บันทึกสำเร็จ ✓",
          description: `บันทึกข้อมูล ${data.name} เรียบร้อยแล้ว`,
        });
      } else {
        toast({
          title: "บันทึกไม่สำเร็จ",
          description: "ไม่สามารถเชื่อมต่อกับ Server ได้ กรุณาลองใหม่อีกครั้ง",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ระบบขัดข้อง กรุณาลองใหม่ภายหลัง",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBaby = async () => {
    setActiveModal('delete-confirm');
  };

  const confirmDeleteBaby = async () => {
    if (!baby) return;

    setActiveModal(null);

    const success = await deleteBaby(baby.id);
    if (success) {
      toast({
        title: "ลบข้อมูลสำเร็จ",
        description: "ลบข้อมูลเรียบร้อยแล้ว",
        variant: "destructive",
      });
    } else {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบข้อมูลได้",
        variant: "destructive",
      });
    }
  };

  const handleClearData = () => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลทั้งหมด?')) {
      clearData();
      setActiveModal(null);
      toast({
        title: "ลบข้อมูลสำเร็จ",
        description: "ข้อมูลทั้งหมดถูกลบเรียบร้อยแล้ว",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-3xl">👶</span>
          </div>
          <p className="text-muted-foreground font-medium">กำลังโหลด...</p>
        </motion.div>
      </div>
    );
  }

  // Onboarding screen
  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              className="w-24 h-24 rounded-3xl bg-gradient-to-br from-peach to-peach/70 flex items-center justify-center mx-auto mb-8 shadow-glow-primary overflow-hidden"
            >
              <BabyCareLogo size="xl" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-foreground mb-3"
            >
              Baby Tracker
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground mb-8 leading-relaxed"
            >
              บันทึกการกินนม การเปลี่ยนผ้าอ้อม และพัฒนาการของลูกน้อยอย่างง่ายดาย
            </motion.p>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 gap-3 mb-8"
            >
              <div className="bg-card p-4 rounded-2xl border border-border">
                <div className="w-10 h-10 rounded-xl bg-feeding/20 flex items-center justify-center mb-2 mx-auto">
                  <span className="text-xl">🍼</span>
                </div>
                <p className="text-sm font-medium text-foreground">บันทึกการกินนม</p>
              </div>
              <div className="bg-card p-4 rounded-2xl border border-border">
                <div className="w-10 h-10 rounded-xl bg-diaper/20 flex items-center justify-center mb-2 mx-auto">
                  <span className="text-xl">👶</span>
                </div>
                <p className="text-sm font-medium text-foreground">บันทึกผ้าอ้อม</p>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={() => setActiveModal('add-baby')}
              className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-glow-primary active:scale-[0.98] transition-transform"
            >
              เริ่มต้นใช้งาน
            </motion.button>
          </motion.div>
        </div>

        {/* Profile Modal */}
        <AnimatePresence>
          {activeModal === 'add-baby' && (
            <BabyProfileModal
              baby={null}
              onClose={() => setActiveModal(null)}
              onSave={handleSaveBaby}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <Header
        baby={baby}
        babies={babies}
        onOpenSettings={() => setActiveModal('settings')}
        onSelectBaby={(b) => switchBaby(b.id)}
        onAddBaby={() => setActiveModal('add-baby')}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {/* Stats Overview */}
        <StatsOverview
          logs={logs}
          onOpenFeature={(type) => setActiveModal(type)}
          onOpenDashboard={() => setActiveModal('dashboard')}
        />

        {/* Timeline */}
        <TimelineSection logs={logs} />
      </main>

      {/* FAB Menu */}
      <FabMenu
        onOpenFeeding={() => setActiveModal('feeding')}
        onOpenDiaper={() => setActiveModal('diaper')}
        onOpenSleep={() => setActiveModal('sleep')}
        onOpenPumping={() => setActiveModal('pumping')}
      />

      {/* Modals */}
      <AnimatePresence>
        {activeModal === 'feeding' && (
          <FeedingModal
            onClose={() => setActiveModal(null)}
            onSave={handleSaveFeeding}
          />
        )}
        {activeModal === 'diaper' && (
          <DiaperModal
            onClose={() => setActiveModal(null)}
            onSave={handleSaveDiaper}
          />
        )}
        {activeModal === 'sleep' && (
          <SleepModal
            onClose={() => setActiveModal(null)}
            onSave={handleSaveSleep}
          />
        )}
        {activeModal === 'pumping' && (
          <PumpingModal
            onClose={() => setActiveModal(null)}
            onSave={handleSavePumping}
          />
        )}
        {activeModal === 'add-baby' && (
          <BabyProfileModal
            baby={null}
            onClose={() => setActiveModal(null)}
            onSave={handleSaveBaby}
          />
        )}
        {activeModal === 'edit-baby' && (
          <BabyProfileModal
            baby={baby}
            onClose={() => setActiveModal('settings')}
            onSave={handleSaveBaby}
          />
        )}
        {activeModal === 'settings' && (
          <SettingsModal
            baby={baby}
            onClose={() => setActiveModal(null)}
            onEditBaby={() => setActiveModal('edit-baby')}
            onClearData={handleClearData}
            onOpenCaregivers={() => setActiveModal('caregivers')}
            onDeleteBaby={handleDeleteBaby}
          />
        )}
        {activeModal === 'caregivers' && (
          <CaregiversModal
            onClose={() => setActiveModal(null)}
          />
        )}
        {activeModal === 'dashboard' && (
          <DashboardModal
            logs={logs}
            onClose={() => setActiveModal(null)}
          />
        )}

        <ConfirmModal
          isOpen={activeModal === 'delete-confirm'}
          title="ยืนยันการลบข้อมูล"
          description={`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลของ ${baby?.name || 'เด็กคนนี้'}? การกระทำนี้ไม่สามารถย้อนกลับได้ ข้อมูลบันทึกและประวัติทั้งหมดจะถูกลบถาวร`}
          confirmLabel="ลบข้อมูล"
          variant="destructive"
          onConfirm={confirmDeleteBaby}
          onCancel={() => setActiveModal('settings')}
        />
      </AnimatePresence>
    </div>
  );
};

export default Index;
