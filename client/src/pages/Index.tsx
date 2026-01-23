import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBabyData } from "@/hooks/useBabyData";
import FeedingModal from "@/components/baby/FeedingModal";
import DiaperModal from "@/components/baby/DiaperModal";
import PumpingModal from "@/components/baby/PumpingModal";
import SleepModal from "@/components/baby/SleepModal";
import BabyProfileModal from "@/components/baby/BabyProfileModal";
import SettingsModal from "@/components/baby/SettingsModal";
import ConfirmModal from "@/components/common/ConfirmModal";
import CaregiversModal from "@/components/baby/CaregiversModal";
import DashboardModal from "@/components/baby/DashboardModal";
import BabyCareLogo from "@/components/baby/BabyCareLogo";
import BabySwitcher from "@/components/baby/BabySwitcher";
import { toast } from "@/hooks/use-toast";

// Lucide Icons (แทน Material Symbols)
import {
  Baby,
  Bell,
  CalendarDays,
  Moon,
  Droplets,
  Coffee,
  Ruler,
  Milk,
  Utensils,
  Droplet,
  BedDouble,
} from "lucide-react";

type ModalType =
  | "feeding"
  | "diaper"
  | "pumping"
  | "sleep"
  | "add-baby"
  | "edit-baby"
  | "settings"
  | "caregivers"
  | "dashboard"
  | "delete-confirm"
  | null;

// ---------- helpers (safe/defensive) ----------
function safeDate(input: any): Date | null {
  const d = input ? new Date(input) : null;
  return d && !Number.isNaN(d.getTime()) ? d : null;
}

function minutesBetween(a: Date, b: Date) {
  const diff = Math.max(0, b.getTime() - a.getTime());
  return Math.round(diff / 60000);
}

function timeAgo(d: Date) {
  const diff = Math.max(0, Date.now() - d.getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "เมื่อสักครู่";
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ชั่วโมงที่แล้ว`;
  const days = Math.floor(hrs / 24);
  return `${days} วันที่แล้ว`;
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "สวัสดีตอนเช้า";
  if (h < 18) return "สวัสดีตอนบ่าย";
  return "สวัสดีตอนเย็น";
}


function mlToOz(ml: number) {
  // Removed as we are using ML now
  return ml;
}

const DIAPER_BAR_KEYS = ["bar-1", "bar-2", "bar-3", "bar-4", "bar-5"];

function getAmountMl(details: any) {
  if (typeof details?.amountMl === "number") return details.amountMl;
  if (typeof details?.amountOz === "number") return Math.round(details.amountOz * 29.5735);
  return null;
}

function getRecentToneClass(tone: string) {
  const map: Record<string, string> = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-primary",
    purple: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
    orange: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
    pink: "bg-rose-100 dark:bg-rose-900/30 text-rose-500",
  };

  return map[tone] ?? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600";
}

function formatDiaperType(input: any) {
  const raw = String(input ?? "").trim();
  if (!raw) return "";
  const key = raw.toLowerCase();
  if (key === "diaper") return "";
  const map: Record<string, string> = {
    pee: "ฉี่",
    wet: "ฉี่",
    urine: "ฉี่",
    poo: "อึ",
    poop: "อึ",
    dirty: "อึ",
    stool: "อึ",
    mixed: "ฉี่+อึ",
    clean: "สะอาด",
  };
  return map[key] ?? raw;
}

function formatFeedingMethod(input: any) {
  const raw = String(input ?? "").trim();
  if (!raw) return "ขวดนมหรือเข้าเต้า";
  const key = raw.toLowerCase();
  const map: Record<string, string> = {
    bottle: "ขวดนม",
    breast: "เข้าเต้า",
    nursing: "เข้าเต้า",
    formula: "นมผง",
    breastmilk: "นมแม่",
  };
  return map[key] ?? raw;
}

// --------------------------------------------

const Index = () => {
  const {
    baby,
    babies,
    logs,
    loading,
    saveBabyProfile,
    switchBaby,
    deleteBaby,
    addLog,
    clearData,
  } = useBabyData();

  const [activeModal, setActiveModal] = useState<ModalType>(null);

  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    if (activeModal) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = originalBodyOverflow || "";
      document.documentElement.style.overflow = originalHtmlOverflow || "";
    }

    return () => {
      document.body.style.overflow = originalBodyOverflow || "";
      document.documentElement.style.overflow = originalHtmlOverflow || "";
    };
  }, [activeModal]);

  useEffect(() => {
    document.body.classList.add("no-scrollbar");
    document.documentElement.classList.add("no-scrollbar");

    return () => {
      document.body.classList.remove("no-scrollbar");
      document.documentElement.classList.remove("no-scrollbar");
    };
  }, []);

  // Show onboarding if no baby profile
  const showOnboarding = !loading && !baby;

  const handleSaveFeeding = (data: any) => {
    addLog("feeding", data);
    setActiveModal(null);
    toast({
      title: "บันทึกสำเร็จ ✓",
      description: "บันทึกการกินนมเรียบร้อยแล้ว",
    });
  };

  const handleSaveDiaper = (data: any) => {
    addLog("diaper", data);
    setActiveModal(null);
    toast({
      title: "บันทึกสำเร็จ ✓",
      description: "บันทึกการเปลี่ยนผ้าอ้อมเรียบร้อยแล้ว",
    });
  };

  const handleSavePumping = (data: any) => {
    addLog("pump", data);
    setActiveModal(null);
    toast({
      title: "บันทึกสำเร็จ ✓",
      description: "บันทึกการปั๊มนมเรียบร้อยแล้ว",
    });
  };

  const handleSaveSleep = (data: any) => {
    addLog("sleep", data);
    setActiveModal(null);
    toast({
      title: "บันทึกสำเร็จ ✓",
      description: "บันทึกการนอนเรียบร้อยแล้ว",
    });
  };

  const handleSaveBaby = async (data: any) => {
    try {
      const payload = activeModal === "edit-baby" && baby ? { ...data, id: baby.id } : data;
      const success = await saveBabyProfile(payload);
      if (success) {
        if (activeModal === "edit-baby") setActiveModal("settings");
        else setActiveModal(null);

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
      console.error("Error saving baby profile:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ระบบขัดข้อง กรุณาลองใหม่ภายหลัง",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBaby = async () => setActiveModal("delete-confirm");

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
    if (globalThis.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลทั้งหมด?")) {
      clearData();
      setActiveModal(null);
      toast({
        title: "ลบข้อมูลสำเร็จ",
        description: "ข้อมูลทั้งหมดถูกลบเรียบร้อยแล้ว",
        variant: "destructive",
      });
    }
  };

  // ---------- derive dashboard data from logs ----------
  const recent = useMemo(() => {
    const arr = Array.isArray(logs) ? [...logs] : [];
    // try sorting by createdAt / time / date
    arr.sort((a: any, b: any) => {
      const da = safeDate(a?.timestamp ?? a?.createdAt ?? a?.time ?? a?.date) ?? new Date(0);
      const db = safeDate(b?.timestamp ?? b?.createdAt ?? b?.time ?? b?.date) ?? new Date(0);
      return db.getTime() - da.getTime();
    });

    return arr.slice(0, 4).map((l: any) => {
      const type = (l?.type ?? l?.logType ?? l?.category ?? "unknown") as string;
      const at = safeDate(l?.timestamp ?? l?.createdAt ?? l?.time ?? l?.date) ?? new Date();
      const details = l?.details ?? l ?? {};
      const key = String(l?.id ?? l?._id ?? l?.logId ?? `${type}-${at.getTime()}`);

      // label + icon
      if (type.includes("diaper")) {
        const diaperType = formatDiaperType(details?.status ?? details?.diaperType ?? details?.kind ?? details?.type);
        const label = diaperType ? `ผ้าอ้อม (${diaperType})` : "ผ้าอ้อม";
        return {
          type: "diaper",
          label,
          sub: `${fmtTime(at)} • ${timeAgo(at)}`,
          icon: Droplets,
          tone: "blue" as const,
          key,
        };
      }
      if (type.includes("sleep")) {
        const duration = typeof details?.durationMinutes === "number" ? details.durationMinutes : 0;
        let label = details?.action === "end" ? "ตื่นนอน" : "เริ่มหลับ";

        if (duration > 0) {
          const h = Math.floor(duration / 60);
          const m = duration % 60;
          label = `นอนหลับ (${h > 0 ? h + "ชม. " : ""}${m}น.)`;
        }

        return {
          type: "sleep",
          label,
          sub: `${fmtTime(at)} • ${timeAgo(at)}`,
          icon: Moon,
          tone: "purple" as const,
          key,
        };
      }
      if (type.includes("feeding")) {
        const amountMl = getAmountMl(details);
        let label = "การกินนม";

        if (amountMl) {
          label = `ขวดนม (${amountMl} มล.)`;
        } else {
          // Breastfeeding logic
          const leftSec = details?.leftDurationSeconds || 0;
          const rightSec = details?.rightDurationSeconds || 0;
          const totalMin = Math.round((leftSec + rightSec) / 60);

          if (totalMin > 0) {
            label = `เข้าเต้า (${totalMin} นาที)`;
          } else if (details?.method === 'breast' || details?.method === 'nursing' || details?.source === 'breast') {
            label = "เข้าเต้า";
          }
        }
        const method = formatFeedingMethod(details?.method ?? details?.feedingType ?? details?.source);
        return {
          type: "feeding",
          label,
          sub: `${fmtTime(at)} • ${method}`,
          icon: Coffee,
          tone: "orange" as const,
          key,
        };
      }
      if (type.includes("pump")) {
        const label = "ปั๊มนม";
        return {
          type: "pump",
          label,
          sub: `${fmtTime(at)} • ${timeAgo(at)}`,
          icon: Milk,
          tone: "pink" as const,
          key,
        };
      }

      return {
        type: "unknown",
        label: "กิจกรรม",
        sub: `${fmtTime(at)} • ${timeAgo(at)}`,
        icon: Ruler,
        tone: "green" as const,
        key,
      };
    });
  }, [logs]);

  const dailySummary = useMemo(() => {
    const arr = Array.isArray(logs) ? logs : [];

    // “วันนี้” (ตาม local)
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    const today = arr.filter((l: any) => {
      const d = safeDate(l?.timestamp ?? l?.createdAt ?? l?.time ?? l?.date);
      return d ? d.getTime() >= start.getTime() : false;
    });

    // diapers count
    const diaperCount = today.filter((l: any) => String(l?.type ?? l?.logType ?? "").includes("diaper")).length;

    // feeding volume ml
    const feeds = today.filter((l: any) => String(l?.type ?? l?.logType ?? "").includes("feeding"));
    let totalMl = 0;
    for (const f of feeds as any[]) {
      const details = f?.details ?? f ?? {};
      if (typeof details?.amountMl === "number") totalMl += details.amountMl;
      else if (typeof details?.amountOz === "number") totalMl += Math.round(details.amountOz * 29.5735);
    }

    // sleep minutes: best-effort pairing start/end
    const sleepLogs = today
      .filter((l: any) => String(l?.type ?? l?.logType ?? "").includes("sleep"))
      .map((l: any) => {
        const at = safeDate(l?.timestamp ?? l?.createdAt ?? l?.time ?? l?.date) ?? new Date();
        const details = l?.details ?? l ?? {};
        const action = details?.action ?? details?.event ?? details?.type ?? "start"; // start/end if exists
        const duration = typeof details?.durationMinutes === "number" ? details.durationMinutes : 0;
        return { at, action: String(action), duration };
      })
      .sort((a: any, b: any) => a.at.getTime() - b.at.getTime());

    let sleepMins = 0;
    let currentStart: Date | null = null;

    for (const s of sleepLogs) {
      if (s.duration > 0) {
        sleepMins += s.duration;
        continue;
      }

      const isEnd = s.action.includes("end") || s.action.includes("wake") || s.action.includes("woke");
      const isStart = s.action.includes("start") || s.action.includes("sleep") || !isEnd;

      if (isStart && !currentStart) currentStart = s.at;
      else if (isEnd && currentStart) {
        sleepMins += minutesBetween(currentStart, s.at);
        currentStart = null;
      }
    }

    // If still sleeping, count until now (optional)
    if (currentStart) sleepMins += minutesBetween(currentStart, now);

    const sleepH = Math.floor(sleepMins / 60);
    const sleepR = sleepMins % 60;

    return {
      diaperCount,
      totalMl,
      sleepH,
      sleepR,
      babyStatus: (() => {
        // show “Sleeping” if latest sleep start not ended (best-effort)
        const lastSleep = [...sleepLogs].reverse()[0];
        if (!lastSleep) return { text: "ตื่นอยู่", tone: "awake" as const };

        // If last sleep has duration, it means it's a completed sleep record -> Awake
        if (lastSleep.duration > 0) return { text: "ตื่นอยู่", tone: "awake" as const };

        const isEnd = lastSleep.action.includes("end") || lastSleep.action.includes("wake") || lastSleep.action.includes("woke");
        return isEnd ? { text: "ตื่นอยู่", tone: "awake" as const } : { text: "กำลังนอน", tone: "sleep" as const };
      })(),
    };
  }, [logs]);

  // ---------------- loading ----------------
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-3xl">👶</span>
          </div>
          <p className="text-muted-foreground font-medium">กำลังโหลด...</p>
        </motion.div>
      </div>
    );
  }

  // ---------------- onboarding ----------------
  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
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
              onClick={() => setActiveModal("add-baby")}
              className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-glow-primary active:scale-[0.98] transition-transform"
            >
              เริ่มต้นใช้งาน
            </motion.button>
          </motion.div>
        </div>

        <AnimatePresence>
          {activeModal === "add-baby" && (
            <BabyProfileModal baby={null} onClose={() => setActiveModal(null)} onSave={handleSaveBaby} />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ---------------- dashboard (NEW UI) ----------------
  const babyName = baby?.name ?? "Sarah"; // fallback
  const statusText = dailySummary.babyStatus.text; // "Sleeping" | "Awake"
  const statusTone = dailySummary.babyStatus.tone;
  const statusDot = statusTone === "sleep" ? "bg-indigo-400" : "bg-emerald-400";
  const lastActivity = recent[0];

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#f7f7f5] dark:bg-[#0f172a] text-[#111418] dark:text-gray-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          className="absolute -top-32 -right-24 h-[360px] w-[360px] rounded-full bg-papaya/25 blur-3xl"
          animate={{ y: [0, 18, 0], x: [0, -12, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[20%] -left-32 h-[420px] w-[420px] rounded-full bg-sky/25 blur-3xl"
          animate={{ y: [0, -14, 0], x: [0, 10, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-[8%] h-[280px] w-[280px] rounded-full bg-saguaro/20 blur-3xl"
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Decorative background icon */}
      <div className="fixed top-16 right-[-120px] -z-10 opacity-10 dark:opacity-5 pointer-events-none">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }}>
          <Baby className="w-[320px] h-[320px] text-primary" />
        </motion.div>
      </div>

      <div className="flex h-full grow flex-col max-w-[1440px] mx-auto">
        {/* Header / Nav */}
        <header className="relative z-10 flex items-center justify-between px-4 md:px-8 py-5 md:py-7 gap-3">
          <BabySwitcher
            babies={babies}
            currentBaby={baby}
            onSelectBaby={(selectedBaby) => switchBaby(selectedBaby.id)}
            onAddBaby={() => setActiveModal("add-baby")}
            containerClassName="min-w-0"
            buttonClassName="w-auto max-w-[70vw] sm:max-w-none justify-start gap-3 px-4 py-3 rounded-[26px] bg-white/90 dark:bg-white/5 border border-white/70 dark:border-white/10 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.4)] backdrop-blur-xl transition-all hover:shadow-[0_24px_55px_-32px_rgba(15,23,42,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            nameClassName="text-[15px] md:text-base font-semibold tracking-tight text-[#3a2c2c] dark:text-white"
            chevronClassName="text-slate-400"
          />

          <div className="flex gap-3 items-center">
            <button
              onClick={() => setActiveModal("dashboard")}
              className="flex items-center justify-center size-9 sm:size-10 rounded-full bg-white/90 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-white/70 dark:border-white/10 text-gray-600 dark:text-gray-200 shadow-[0_10px_25px_-18px_rgba(15,23,42,0.45)] transition-all backdrop-blur-xl"
            >
              <Bell className="w-5 h-5" />
            </button>

            {/* profile bubble */}
            <button
              onClick={() => setActiveModal("settings")}
              className="relative size-9 sm:size-10 rounded-full bg-gradient-to-br from-papaya/30 via-white/80 to-sky/20 border-2 border-white/80 dark:border-white/10 shadow-[0_10px_25px_-18px_rgba(15,23,42,0.45)]"
              aria-label="Open settings"
            >
              <span className="absolute inset-0 rounded-full ring-1 ring-white/60 dark:ring-white/10" />
            </button>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 px-4 md:px-8 pb-10">
          {/* Welcome / Hero */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-10 mt-6"
          >
            <div className="absolute inset-0 -z-10 rounded-[36px] bg-gradient-to-br from-white/70 via-white/40 to-sky/20 blur-3xl" />
            <div className="relative rounded-[32px] border border-white/70 dark:border-white/10 bg-white/75 dark:bg-white/5 backdrop-blur-xl p-6 md:p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.55)]">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-3 text-center lg:text-left">
                  <div className="inline-flex items-center justify-center lg:justify-start gap-2 rounded-full bg-white/80 dark:bg-white/10 px-3 py-1 text-sm font-bold uppercase tracking-[0.25em] text-muted-foreground border border-white/70 dark:border-white/10">
                    <span className={`size-2 rounded-full ${statusDot}`} />
                    <span>วันนี้</span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-[-0.035em]">
                    {greeting()}, {babyName}
                  </h1>
                  <p className="text-[#5a6b7f] dark:text-gray-300 text-lg font-semibold flex flex-wrap items-center justify-center lg:justify-start gap-2">
                    <span className={`inline-flex size-2.5 rounded-full ${statusDot} animate-pulse`} />
                    <span>
                      ตอนนี้ {babyName} <span className="text-primary font-extrabold">{statusText}</span>
                    </span>
                  </p>
                  {lastActivity ? (
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-white/10 px-3 py-1 text-sm font-semibold text-muted-foreground border border-white/70 dark:border-white/10">
                      <span className="size-2 rounded-full bg-sky-400" />
                      <span>ล่าสุด: {lastActivity.label}</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-white/10 px-3 py-1 text-sm font-semibold text-muted-foreground border border-white/70 dark:border-white/10">
                      <span className="size-2 rounded-full bg-sky-200" />
                      <span>ยังไม่มีบันทึก</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto">
                  <div className="rounded-2xl bg-white/85 dark:bg-white/10 border border-white/70 dark:border-white/10 p-3 shadow-[0_12px_25px_-20px_rgba(15,23,42,0.35)]">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <span className="size-2 rounded-full bg-indigo-400" />
                      <span>นอน</span>
                    </div>
                    <p className="text-lg font-black text-foreground mt-1">
                      {dailySummary.sleepH}ชม. {dailySummary.sleepR}น.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/85 dark:bg-white/10 border border-white/70 dark:border-white/10 p-3 shadow-[0_12px_25px_-20px_rgba(15,23,42,0.35)]">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <span className="size-2 rounded-full bg-emerald-400" />
                      <span>ผ้าอ้อม</span>
                    </div>
                    <p className="text-lg font-black text-foreground mt-1">
                      {dailySummary.diaperCount} ครั้ง
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/85 dark:bg-white/10 border border-white/70 dark:border-white/10 p-3 shadow-[0_12px_25px_-20px_rgba(15,23,42,0.35)]">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <span className="size-2 rounded-full bg-rose-400" />
                      <span>นม</span>
                    </div>
                    <p className="text-lg font-black text-foreground mt-1">
                      {dailySummary.totalMl} มล.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 max-w-[1240px] mx-auto items-start">
            {/* Left Column: Timeline */}
            <div className="lg:col-span-3 order-2 lg:order-1">
              <div className="bg-white/75 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] border border-white/70 dark:border-white/10 h-full">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-extrabold">กิจกรรมล่าสุด</h3>
                    <p className="text-sm text-muted-foreground mt-1">24 ชั่วโมงล่าสุด</p>
                  </div>
                  <button
                    className="text-primary text-sm font-extrabold hover:underline"
                    onClick={() => setActiveModal("dashboard")}
                  >
                    ดูทั้งหมด
                  </button>
                </div>

                {recent.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/70 dark:border-white/10 bg-white/60 dark:bg-white/5 text-center text-sm text-muted-foreground py-10">
                    ยังไม่มีบันทึกล่าสุด
                  </div>
                ) : (
                  <div className="flex flex-col gap-6 relative">
                    <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary/40 to-transparent -z-10" />

                    {recent.map((item, idx) => {
                      const Icon = item.icon;
                      const toneClass = getRecentToneClass(item.tone);

                      return (
                        <motion.div
                          key={item.key}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.08 * idx }}
                          className="flex gap-4"
                        >
                          <div className="relative flex-none">
                            <div
                              className={`size-10 rounded-full flex items-center justify-center z-10 border-4 border-white/90 dark:border-white/10 ${toneClass}`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                          </div>

                          <div className="pt-1">
                            <p className="font-extrabold text-sm text-gray-900 dark:text-white">{item.label}</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{item.sub}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Center Column: Action Grid */}
            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="grid grid-cols-2 gap-5 md:gap-6 h-full">
                {/* Feeding */}
                <motion.button
                  onClick={() => setActiveModal("feeding")}
                  whileHover={{ y: -6 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative overflow-hidden rounded-[28px] p-6 md:p-8 flex flex-col items-center justify-center gap-4 min-h-[230px] bg-white/80 dark:bg-white/5 border border-white/70 dark:border-white/10 shadow-[0_20px_45px_-32px_rgba(15,23,42,0.35)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-sky/35 via-white/80 to-white/60 opacity-90" />
                  <div className="absolute -top-10 -right-10 size-24 rounded-full bg-sky/30 blur-2xl" />
                  <div className="relative flex flex-col items-center gap-4 text-center">
                    <div className="size-16 md:size-20 rounded-2xl bg-white/90 dark:bg-white/10 shadow-sm flex items-center justify-center text-sky-600 group-hover:scale-110 transition-transform duration-300">
                      <Utensils className="w-9 h-9" />
                    </div>
                    <div>
                      <span className="block text-xl font-black text-gray-900 dark:text-white mb-1">บันทึกการกินนม</span>
                      <span className="text-sm font-semibold text-sky-600/80 dark:text-sky-200">
                        ขวดนมหรือเข้าเต้า
                      </span>
                    </div>
                  </div>
                </motion.button>

                {/* Diaper */}
                <motion.button
                  onClick={() => setActiveModal("diaper")}
                  whileHover={{ y: -6 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative overflow-hidden rounded-[28px] p-6 md:p-8 flex flex-col items-center justify-center gap-4 min-h-[230px] bg-white/80 dark:bg-white/5 border border-white/70 dark:border-white/10 shadow-[0_20px_45px_-32px_rgba(15,23,42,0.35)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-100/70 via-white/80 to-white/60 opacity-90" />
                  <div className="absolute -bottom-10 -left-10 size-24 rounded-full bg-amber-200/40 blur-2xl" />
                  <div className="relative flex flex-col items-center gap-4 text-center">
                    <div className="size-16 md:size-20 rounded-2xl bg-white/90 dark:bg-white/10 shadow-sm flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform duration-300">
                      <Droplet className="w-9 h-9" />
                    </div>
                    <div>
                      <span className="block text-xl font-black text-gray-900 dark:text-white mb-1">บันทึกผ้าอ้อม</span>
                      <span className="text-sm font-semibold text-amber-600/80">ฉี่/อึ/ผสม</span>
                    </div>
                  </div>
                </motion.button>

                {/* Sleep */}
                <motion.button
                  onClick={() => setActiveModal("sleep")}
                  whileHover={{ y: -6 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative overflow-hidden rounded-[28px] p-6 md:p-8 flex flex-col items-center justify-center gap-4 min-h-[230px] bg-white/80 dark:bg-white/5 border border-white/70 dark:border-white/10 shadow-[0_20px_45px_-32px_rgba(15,23,42,0.35)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/60 via-white/80 to-white/60 opacity-90" />
                  <div className="absolute -top-10 -left-10 size-24 rounded-full bg-emerald-200/40 blur-2xl" />
                  <div className="relative flex flex-col items-center gap-4 text-center">
                    <div className="size-16 md:size-20 rounded-2xl bg-white/90 dark:bg-white/10 shadow-sm flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-300">
                      <BedDouble className="w-9 h-9" />
                    </div>
                    <div>
                      <span className="block text-xl font-black text-gray-900 dark:text-white mb-1">บันทึกการนอน</span>
                      <span className="text-sm font-semibold text-emerald-600/80 dark:text-emerald-300">
                        เริ่มหรือตื่นนอน
                      </span>
                    </div>
                  </div>
                </motion.button>

                {/* Pumping */}
                <motion.button
                  onClick={() => setActiveModal("pumping")}
                  whileHover={{ y: -6 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative overflow-hidden rounded-[28px] p-6 md:p-8 flex flex-col items-center justify-center gap-4 min-h-[230px] bg-white/80 dark:bg-white/5 border border-white/70 dark:border-white/10 shadow-[0_20px_45px_-32px_rgba(15,23,42,0.35)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-100/70 via-white/80 to-white/60 opacity-90" />
                  <div className="absolute -bottom-10 -right-10 size-24 rounded-full bg-rose-200/40 blur-2xl" />
                  <div className="relative flex flex-col items-center gap-4 text-center">
                    <div className="size-16 md:size-20 rounded-2xl bg-white/90 dark:bg-white/10 shadow-sm flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform duration-300">
                      <Milk className="w-9 h-9" />
                    </div>
                    <div>
                      <span className="block text-xl font-black text-gray-900 dark:text-white mb-1">ปั๊มนม</span>
                      <span className="text-sm font-semibold text-rose-500/80 dark:text-rose-200">รายละเอียดการปั๊ม</span>
                    </div>
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Right Column: Daily Summary */}
            <div className="lg:col-span-3 order-3">
              <div className="bg-white/75 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] border border-white/70 dark:border-white/10 h-full flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-extrabold">สรุปประจำวัน</h3>
                    <p className="text-sm text-muted-foreground mt-1">วันนี้</p>
                  </div>
                  <button
                    className="size-8 rounded-full bg-white/80 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:bg-white transition"
                    onClick={() => setActiveModal("dashboard")}
                  >
                    <CalendarDays className="w-4 h-4" />
                  </button>
                </div>

                {/* Sleep */}
                <div className="bg-white/90 dark:bg-white/10 p-5 rounded-2xl border border-white/70 dark:border-white/10 shadow-[0_16px_35px_-30px_rgba(15,23,42,0.35)]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="size-8 rounded-full bg-indigo-100/80 dark:bg-indigo-900/30 text-indigo-500 flex items-center justify-center">
                      <Moon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-300">เวลานอนรวม</span>
                  </div>

                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                      {dailySummary.sleepH}
                      <span className="text-lg text-gray-400 font-medium">ชม.</span>{" "}
                      {dailySummary.sleepR}
                      <span className="text-lg text-gray-400 font-medium">น.</span>
                    </span>
                  </div>

                  <div className="w-full bg-slate-100/80 dark:bg-white/10 h-2 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-indigo-400 h-full rounded-full"
                      style={{ width: `${Math.min(100, Math.round(((dailySummary.sleepH * 60 + dailySummary.sleepR) / (12 * 60)) * 100))}%` }}
                    />
                  </div>
                </div>

                {/* Diapers */}
                <div className="bg-white/90 dark:bg-white/10 p-5 rounded-2xl border border-white/70 dark:border-white/10 shadow-[0_16px_35px_-30px_rgba(15,23,42,0.35)]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="size-8 rounded-full bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                      <Droplets className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-300">ผ้าอ้อม</span>
                  </div>

                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                      {dailySummary.diaperCount} <span className="text-lg text-gray-400 font-medium">ครั้ง</span>
                    </span>
                  </div>

                  <div className="flex gap-1 mt-3">
                    {DIAPER_BAR_KEYS.map((key, i) => (
                      <div
                        key={key}
                        className={`h-2 flex-1 rounded-full ${i < Math.min(5, dailySummary.diaperCount) ? "bg-emerald-400" : "bg-slate-100/80 dark:bg-white/10"
                          }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Volume */}
                <div className="bg-white/90 dark:bg-white/10 p-5 rounded-2xl border border-white/70 dark:border-white/10 grow flex flex-col justify-center shadow-[0_16px_35px_-30px_rgba(15,23,42,0.35)]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="size-8 rounded-full bg-rose-100/80 dark:bg-rose-900/30 text-rose-500 flex items-center justify-center">
                      <Coffee className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-300">ปริมาณการกินนม</span>
                  </div>

                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                      {dailySummary.totalMl} <span className="text-lg text-gray-400 font-medium">มล.</span>
                    </span>
                  </div>

                  <div className="w-full bg-slate-100/80 dark:bg-white/10 h-2 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-rose-400 h-full rounded-full"
                      style={{ width: `${Math.min(100, Math.round((dailySummary.totalMl / 600) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile quick nav (optional) */}
          <div className="md:hidden mt-8 flex gap-2 justify-center">
            <button
              className="px-5 py-3 rounded-full bg-white/80 dark:bg-white/10 border border-white/70 dark:border-white/10 text-base font-semibold"
              onClick={() => setActiveModal("settings")}
            >
              ตั้งค่า
            </button>
            <button
              className="px-5 py-3 rounded-full bg-white/80 dark:bg-white/10 border border-white/70 dark:border-white/10 text-base font-semibold"
              onClick={() => setActiveModal("dashboard")}
            >
              ประวัติ
            </button>
          </div>
        </main>

        {/* Modals */}
        <AnimatePresence>
          {activeModal === "feeding" && <FeedingModal onClose={() => setActiveModal(null)} onSave={handleSaveFeeding} />}
          {activeModal === "diaper" && <DiaperModal onClose={() => setActiveModal(null)} onSave={handleSaveDiaper} />}
          {activeModal === "sleep" && <SleepModal onClose={() => setActiveModal(null)} onSave={handleSaveSleep} />}
          {activeModal === "pumping" && <PumpingModal onClose={() => setActiveModal(null)} onSave={handleSavePumping} />}

          {activeModal === "add-baby" && (
            <BabyProfileModal baby={null} onClose={() => setActiveModal(null)} onSave={handleSaveBaby} />
          )}
          {activeModal === "edit-baby" && (
            <BabyProfileModal baby={baby} onClose={() => setActiveModal("settings")} onSave={handleSaveBaby} />
          )}
          {activeModal === "settings" && (
            <SettingsModal
              baby={baby}
              onClose={() => setActiveModal(null)}
              onEditBaby={() => setActiveModal("edit-baby")}
              onClearData={handleClearData}
              onOpenCaregivers={() => setActiveModal("caregivers")}
              onDeleteBaby={handleDeleteBaby}
            />
          )}
          {activeModal === "caregivers" && <CaregiversModal onClose={() => setActiveModal(null)} />}
          {activeModal === "dashboard" && <DashboardModal logs={logs} onClose={() => setActiveModal(null)} />}
        </AnimatePresence>

        <ConfirmModal
          isOpen={activeModal === "delete-confirm"}
          title="ยืนยันการลบข้อมูล"
          description={`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลของ ${baby?.name || "เด็กคนนี้"}? การกระทำนี้ไม่สามารถย้อนกลับได้ ข้อมูลบันทึกและประวัติทั้งหมดจะถูกลบถาวร`}
          confirmLabel="ลบข้อมูล"
          variant="destructive"
          onConfirm={confirmDeleteBaby}
          onCancel={() => setActiveModal("settings")}
        />
      </div>
    </div>
  );
};

export default Index;
