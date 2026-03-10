/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import ActivitiesModal from "@/components/baby/ActivitiesModal";
import NotificationsModal from "@/components/baby/NotificationsModal";
import BabyCareLogo from "@/components/baby/BabyCareLogo";
import BabySwitcher from "@/components/baby/BabySwitcher";
import { useAuth } from "@/hooks/useAuth";
import { API_BASE_URL } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";

// Lucide Icons (แทน Material Symbols)
import {
  Baby,
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Moon,
  Droplets,
  Coffee,
  Ruler,
  Milk,
  Utensils,
  Droplet,
  BedDouble,
  Pencil,
  Trash2,
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
  | "activities"
  | "delete-confirm"
  | "notifications"
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
  if (h < 6) return "สวัสดีตอนดึก";
  if (h < 12) return "สวัสดีตอนเช้า";
  if (h < 13) return "สวัสดีตอนเที่ยง";
  if (h < 18) return "สวัสดีตอนบ่าย";
  return "สวัสดีตอนดึก";
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

type RecentItem = {
  type: string;
  label: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "blue" | "purple" | "orange" | "pink" | "green";
  key: string;
};
type ActivityLogItem = RecentItem & {
  id: string;
  type: string;
  raw: any;
};

type MemberRole = "owner" | "caregiver";
type BabyStatus = { text: string; tone: "sleep" | "awake" };
type DailySummary = {
  diaperCount: number;
  totalMl: number;
  pumpCount: number;
  pumpMl: number;
  sleepH: number;
  sleepR: number;
  babyStatus: BabyStatus;
};

function normalizeRole(rawRole: unknown): MemberRole | null {
  const role = typeof rawRole === "string" ? rawRole.trim().toLowerCase() : "";
  if (role === "owner" || role === "parent") return "owner";
  if (role === "caregiver") return "caregiver";
  return null;
}

function getCurrentRoleLabel(hasBaby: boolean, role: MemberRole | null): string {
  if (!hasBaby) return "ยังไม่ได้เลือกเด็ก";
  if (role === "owner") return "เจ้าของ";
  if (role === "caregiver") return "ผู้ดูแลร่วม";
  return "กำลังตรวจสิทธิ์";
}

function getRoleFromMembers(members: any[], userId: string): MemberRole | null {
  const myRoles = new Set(
    members
      .filter((member: { id?: string }) => member?.id === userId)
      .map((member: { role?: string }) => (typeof member?.role === "string" ? member.role.trim().toLowerCase() : ""))
      .filter(Boolean)
  );

  if (myRoles.has("owner") || myRoles.has("parent")) return "owner";
  if (myRoles.has("caregiver")) return "caregiver";
  return null;
}

function getDateRange(selectedDate: Date) {
  const dayStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0, 0);
  const dayEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59, 999);
  return { dayStart, dayEnd };
}

function filterLogsBySelectedDate(logs: any[], selectedDate: Date) {
  const { dayStart, dayEnd } = getDateRange(selectedDate);
  return logs.filter((log: any) => {
    const d = safeDate(log?.timestamp ?? log?.createdAt ?? log?.time ?? log?.date);
    if (!d) return false;
    const time = d.getTime();
    return time >= dayStart.getTime() && time <= dayEnd.getTime();
  });
}

function computeBabyStatus(logs: any[]): BabyStatus {
  const now = new Date();
  const allSleepLogs = logs
    .filter((log: any) => String(log?.type ?? log?.logType ?? "").includes("sleep"))
    .map((log: any) => {
      const at = safeDate(log?.timestamp ?? log?.createdAt ?? log?.time ?? log?.date) ?? new Date();
      const details = log?.details ?? log ?? {};
      const duration = typeof details?.durationMinutes === "number" ? details.durationMinutes : 0;
      const endTime = details?.endTime ? safeDate(details.endTime) : null;
      return { at, duration, endTime };
    })
    .sort((a, b) => b.at.getTime() - a.at.getTime());

  const lastSleep = allSleepLogs[0];
  if (!lastSleep) return { text: "ตื่นอยู่", tone: "awake" };

  if (
    lastSleep.duration > 0 &&
    lastSleep.endTime &&
    lastSleep.endTime.getTime() > now.getTime() &&
    lastSleep.at.getTime() <= now.getTime()
  ) {
    return { text: "หลับอยู่", tone: "sleep" };
  }

  return { text: "ตื่นอยู่", tone: "awake" };
}

function buildRecentLogs(logs: any[], selectedDate: Date, limit = 10): ActivityLogItem[] {
  const filtered = filterLogsBySelectedDate(logs, selectedDate);

  filtered.sort((a: any, b: any) => {
    const da = safeDate(a?.timestamp ?? a?.createdAt ?? a?.time ?? a?.date) ?? new Date(0);
    const db = safeDate(b?.timestamp ?? b?.createdAt ?? b?.time ?? b?.date) ?? new Date(0);
    return db.getTime() - da.getTime();
  });

  return filtered.slice(0, Math.max(0, limit)).map((log: any) => ({
    ...buildRecentItem(log),
    id: String(log?.id ?? log?._id ?? log?.logId ?? ""),
    type: String(log?.type ?? log?.logType ?? log?.category ?? "unknown"),
    raw: log,
  }));
}

function toFiniteNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function getFeedAmountMl(feed: any): number {
  const details = feed?.details ?? feed ?? {};
  const amountMl = toFiniteNumber(details?.amountMl);
  if (amountMl > 0) return amountMl;

  const amountOz = toFiniteNumber(details?.amountOz);
  return amountOz > 0 ? Math.round(amountOz * 29.5735) : 0;
}

function getPumpAmountMl(pump: any): number {
  const details = pump?.details ?? pump ?? {};
  const totalMl = toFiniteNumber(details?.amountTotalMl);
  if (totalMl > 0) return totalMl;

  return toFiniteNumber(details?.amountLeftMl) + toFiniteNumber(details?.amountRightMl);
}

function computeSleepMinutes(dayLogs: any[]): number {
  const sleepLogs = dayLogs
    .filter((log: any) => String(log?.type ?? log?.logType ?? "").includes("sleep"))
    .map((log: any) => {
      const at = safeDate(log?.timestamp ?? log?.createdAt ?? log?.time ?? log?.date) ?? new Date();
      const details = log?.details ?? log ?? {};
      const action = details?.action ?? details?.event ?? details?.type ?? "start";
      const duration = typeof details?.durationMinutes === "number" ? details.durationMinutes : 0;
      return { at, action: String(action), duration };
    })
    .sort((a: any, b: any) => a.at.getTime() - b.at.getTime());

  let sleepMins = 0;
  let currentStart: Date | null = null;

  for (const sleep of sleepLogs) {
    if (sleep.duration > 0) {
      sleepMins += sleep.duration;
      continue;
    }

    const isEnd = sleep.action.includes("end") || sleep.action.includes("wake") || sleep.action.includes("woke");
    const isStart = sleep.action.includes("start") || sleep.action.includes("sleep") || !isEnd;

    if (isStart && !currentStart) {
      currentStart = sleep.at;
      continue;
    }

    if (isEnd && currentStart) {
      sleepMins += minutesBetween(currentStart, sleep.at);
      currentStart = null;
    }
  }

  if (currentStart) {
    sleepMins += minutesBetween(currentStart, new Date());
  }

  return sleepMins;
}

function buildDailySummary(logs: any[], selectedDate: Date): DailySummary {
  const dayLogs = filterLogsBySelectedDate(logs, selectedDate);
  const diaperCount = dayLogs.filter((log: any) => String(log?.type ?? log?.logType ?? "").includes("diaper")).length;
  const feedLogs = dayLogs.filter((log: any) => String(log?.type ?? log?.logType ?? "").includes("feeding"));
  const pumpLogs = dayLogs.filter((log: any) => String(log?.type ?? log?.logType ?? "").includes("pump"));
  const totalMl = feedLogs.reduce((sum: number, feed: any) => sum + getFeedAmountMl(feed), 0);
  const pumpMl = pumpLogs.reduce((sum: number, pump: any) => sum + getPumpAmountMl(pump), 0);
  const sleepMins = computeSleepMinutes(dayLogs);

  return {
    diaperCount,
    totalMl: Math.round(totalMl),
    pumpCount: pumpLogs.length,
    pumpMl: Math.round(pumpMl),
    sleepH: Math.floor(sleepMins / 60),
    sleepR: sleepMins % 60,
    babyStatus: computeBabyStatus(logs),
  };
}

function buildSleepLabel(details: any) {
  const duration = typeof details?.durationMinutes === "number" ? details.durationMinutes : 0;
  if (duration <= 0) {
    return details?.action === "end" ? "ตื่นนอน" : "เริ่มหลับ";
  }
  const h = Math.floor(duration / 60);
  const m = duration % 60;
  return `นอนหลับ (${h > 0 ? h + "ชม. " : ""}${m}น.)`;
}

function buildFeedingLabel(details: any) {
  const amountMl = getAmountMl(details);
  if (amountMl) return `ขวดนม (${amountMl} มล.)`;

  const leftSec = details?.leftDurationSeconds || 0;
  const rightSec = details?.rightDurationSeconds || 0;
  const totalMin = Math.round((leftSec + rightSec) / 60);

  if (totalMin > 0) return `เข้าเต้า (${totalMin} นาที)`;
  if (details?.method === "breast" || details?.method === "nursing" || details?.source === "breast") {
    return "เข้าเต้า";
  }
  return "การกินนม";
}

function buildRecentItem(log: any): RecentItem {
  const type = (log?.type ?? log?.logType ?? log?.category ?? "unknown") as string;
  const at = safeDate(log?.timestamp ?? log?.createdAt ?? log?.time ?? log?.date) ?? new Date();
  const details = log?.details ?? log ?? {};
  const key = String(log?.id ?? log?._id ?? log?.logId ?? `${type}-${at.getTime()}`);

  if (type.includes("diaper")) {
    const diaperType = formatDiaperType(details?.status ?? details?.diaperType ?? details?.kind ?? details?.type);
    const label = diaperType ? `ผ้าอ้อม (${diaperType})` : "ผ้าอ้อม";
    return {
      type: "diaper",
      label,
      sub: `${fmtTime(at)} โดย ${timeAgo(at)}`,
      icon: Droplets,
      tone: "blue",
      key,
    };
  }

  if (type.includes("sleep")) {
    return {
      type: "sleep",
      label: buildSleepLabel(details),
      sub: `${fmtTime(at)} โดย ${timeAgo(at)}`,
      icon: Moon,
      tone: "purple",
      key,
    };
  }

  if (type.includes("feeding")) {
    const method = formatFeedingMethod(details?.method ?? details?.feedingType ?? details?.source);
    return {
      type: "feeding",
      label: buildFeedingLabel(details),
      sub: `${fmtTime(at)} โดย ${method}`,
      icon: Coffee,
      tone: "orange",
      key,
    };
  }

  if (type.includes("pump")) {
    return {
      type: "pump",
      label: "ปั๊มนม",
      sub: `${fmtTime(at)} โดย ${timeAgo(at)}`,
      icon: Milk,
      tone: "pink",
      key,
    };
  }

  return {
    type: "unknown",
    label: "กิจกรรม",
    sub: `${fmtTime(at)} โดย ${timeAgo(at)}`,
    icon: Ruler,
    tone: "green",
    key,
  };
}

// --------------------------------------------

const Index = () => {
  const navigate = useNavigate();
  const { token, logout, user } = useAuth();
  const { babyId: routeBabyId } = useParams<{ babyId?: string }>();
  const {
    baby,
    babies,
    logs,
    loading,
    saveBabyProfile,
    switchBaby,
    deleteBaby,
    addLog,
    deleteLog,
    updateLog,
    clearData,
    refreshBabyData, // To refresh members count
  } = useBabyData();

  const normalizedMyRole = String(baby?.myRole ?? "").trim().toLowerCase();
  const [resolvedRole, setResolvedRole] = useState<"owner" | "caregiver" | null>(null);
  const fallbackRole = normalizeRole(normalizedMyRole);
  const effectiveRole = resolvedRole ?? fallbackRole;
  const isOwner = effectiveRole === "owner";
  const currentUserLabel = user?.name?.trim() || user?.email || "ผู้ใช้";
  const currentRoleLabel = getCurrentRoleLabel(Boolean(baby), effectiveRole);
  const [hasUnreadRequests, setHasUnreadRequests] = useState(false);

  useEffect(() => {
    if (!routeBabyId) return;
    if (!babies.some((b) => b.id === routeBabyId)) return;
    switchBaby(routeBabyId);
  }, [routeBabyId, babies, switchBaby]);

  useEffect(() => {
    if (!baby?.id) return;
    if (routeBabyId === baby.id) return;
    navigate(`/app/baby/${baby.id}`, { replace: true });
  }, [baby?.id, routeBabyId, navigate]);

  useEffect(() => {
    if (!baby?.id || !token || !user?.id) {
      setResolvedRole(null);
      return;
    }

    let cancelled = false;
    const resolveRole = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/babies/${baby.id}/caregivers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          if (!cancelled) setResolvedRole(null);
          return;
        }
        const json = await res.json();
        const members = Array.isArray(json?.data?.members) ? json.data.members : [];
        const role = getRoleFromMembers(members, user.id);
        if (!cancelled) setResolvedRole(role);
      } catch {
        if (!cancelled) setResolvedRole(null);
      }
    };

    resolveRole();
    return () => {
      cancelled = true;
    };
  }, [baby?.id, token, user?.id]);

  useEffect(() => {
    if (!baby?.id || !token || !isOwner) {
      setHasUnreadRequests(false);
      return;
    }
    const checkRequests = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/babies/${baby.id}/requests`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success && json.data?.length > 0) {
          setHasUnreadRequests(true);
        } else {
          setHasUnreadRequests(false);
        }
      } catch (error) {
        console.error("Failed to check pending requests:", error);
        setHasUnreadRequests(false);
      }
    };
    checkRequests();
    const interval = setInterval(checkRequests, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [baby?.id, token, isOwner]);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const isToday = useMemo(() => {
    const now = new Date();
    return (
      selectedDate.getFullYear() === now.getFullYear() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getDate() === now.getDate()
    );
  }, [selectedDate]);

  const navigateDay = useCallback((direction: 'prev' | 'next') => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + (direction === 'prev' ? -1 : 1));
      return d;
    });
  }, []);

  const goToToday = useCallback(() => setSelectedDate(new Date()), []);

  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Editing log state  
  const [editingLog, setEditingLog] = useState<{ id: string; type: string; raw: any } | null>(null);

  // Generic Confirm Modal State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    onCancelRedirect?: "settings" | null;
    action: () => void;
  } | null>(null);

  // Date picker ref
  const dateInputRef = React.useRef<HTMLInputElement>(null);


  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalBodyOverflow || "";
      document.documentElement.style.overflow = originalHtmlOverflow || "";
    };
  }, []);

  // Show onboarding if no baby profile
  const showOnboarding = !loading && !baby;
  const isModalOpen = Boolean(activeModal);
  const contentScrollClass = isModalOpen ? "overflow-hidden" : "overflow-y-auto";

  const handleAutoNavigation = (logData: any) => {
    const logTimestamp = logData.timestamp || logData.createdAt || logData.time || logData.date;
    if (logTimestamp) {
      const logDate = new Date(logTimestamp);
      if (
        logDate.getDate() !== selectedDate.getDate() ||
        logDate.getMonth() !== selectedDate.getMonth() ||
        logDate.getFullYear() !== selectedDate.getFullYear()
      ) {
        setSelectedDate(logDate);
        return true; // Navigated
      }
    }
    return false; // Did not navigate
  };

  const handleSaveLog = async (type: "feeding" | "diaper" | "pump" | "sleep", data: any) => {
    if (editingLog) {
      await updateLog(editingLog.id, type, data);
      setEditingLog(null);
      const navigated = handleAutoNavigation(data);
      toast({ title: "แก้ไขสำเร็จ ✓", description: navigated ? "สลับไปยังวันที่ของบันทึกอัตโนมัติ" : undefined });
      setActiveModal(null);
      return;
    }

    addLog(type, data);
    const navigated = handleAutoNavigation(data);
    toast({ title: "บันทึกสำเร็จ ✓", description: navigated ? "ระบบบันทึกไปยังเมื่อวานเนื่องจากเวลาที่เลือก" : undefined });
    setActiveModal(null);
  };

  const handleSaveFeeding = (data: any) => handleSaveLog("feeding", data);
  const handleSaveDiaper = (data: any) => handleSaveLog("diaper", data);
  const handleSavePumping = (data: any) => handleSaveLog("pump", data);
  const handleSaveSleep = (data: any) => handleSaveLog("sleep", data);
  const handleEditLogItem = useCallback((item: { id: string; type: string; raw?: any }) => {
    const logType = String(item?.type ?? "");
    if (!item?.id || !logType) return;

    setEditingLog({ id: item.id, type: logType, raw: item.raw ?? {} });
    if (logType.includes("feeding")) setActiveModal("feeding");
    else if (logType.includes("diaper")) setActiveModal("diaper");
    else if (logType.includes("sleep")) setActiveModal("sleep");
    else if (logType.includes("pump")) setActiveModal("pumping");
  }, []);

  const handleDeleteLogItem = useCallback((item: { id: string }) => {
    if (!item?.id) return;

    setConfirmConfig({
      isOpen: true,
      title: "Delete activity",
      description: "Do you want to delete this activity? This action cannot be undone.",
      confirmLabel: "Delete",
      action: () => {
        deleteLog(item.id);
        toast({
          title: "Deleted",
          description: "Activity deleted successfully",
          variant: "destructive",
        });
      },
    });
  }, [deleteLog]);

  const handleSaveBaby = async (data: any) => {
    if (activeModal === "edit-baby" && !isOwner) {
      toast({
        title: "ไม่มีสิทธิ์",
        description: "เฉพาะเจ้าของเด็กเท่านั้นที่แก้ไขข้อมูลได้",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = activeModal === "edit-baby" && baby ? { ...data, id: baby.id } : data;
      const result = await saveBabyProfile(payload);
      if (result.success) {
        if (result.babyId) {
          navigate(`/app/baby/${result.babyId}`, { replace: true });
        }
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

  const handleDeleteBaby = async () => {
    if (!isOwner) {
      toast({
        title: "ไม่มีสิทธิ์",
        description: "เฉพาะเจ้าของเด็กเท่านั้นที่ลบข้อมูลได้",
        variant: "destructive",
      });
      return;
    }

    setConfirmConfig({
      isOpen: true,
      title: "ยืนยันการลบข้อมูล",
      description: `คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลของ ${baby?.name || "เด็กคนนี้"}? การกระทำนี้ไม่สามารถย้อนกลับได้ ข้อมูลบันทึกและประวัติทั้งหมดจะถูกลบถาวร`,
      confirmLabel: "ลบข้อมูล",
      onCancelRedirect: "settings",
      action: () => {
        if (!baby) return;
        void (async () => {
          setActiveModal(null);
          const success = await deleteBaby(baby.id);
          if (success) {
            toast({ title: "ลบข้อมูลสำเร็จ", description: "ลบข้อมูลเรียบร้อยแล้ว", variant: "destructive" });
          } else {
            toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถลบข้อมูลได้", variant: "destructive" });
          }
        })();
      },
    });
  };

  const handleClearData = () => {
    setConfirmConfig({
      isOpen: true,
      title: "ยืนยันการลบข้อมูลทั้งหมด",
      description: "คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลทั้งหมด? ข้อมูลทุกอย่างจะถูกลบถาวรและไม่สามารถกู้คืนได้",
      confirmLabel: "ลบข้อมูลทั้งหมด",
      action: () => {
        clearData();
        setActiveModal(null);
        toast({ title: "ลบข้อมูลสำเร็จ", description: "ข้อมูลทั้งหมดถูกลบเรียบร้อยแล้ว", variant: "destructive" });
      }
    });
  };

  // ---------- derive dashboard data from logs ----------
  const normalizedLogs = useMemo(() => (Array.isArray(logs) ? logs : []), [logs]);
  const recent = useMemo(() => buildRecentLogs(normalizedLogs, selectedDate), [normalizedLogs, selectedDate]);
  const allActivities = useMemo(
    () => buildRecentLogs(normalizedLogs, selectedDate, Number.MAX_SAFE_INTEGER),
    [normalizedLogs, selectedDate]
  );
  const dailySummary = useMemo(() => buildDailySummary(normalizedLogs, selectedDate), [normalizedLogs, selectedDate]);

  // ---------------- loading ----------------
  if (loading) {
    return (
      <div className={`h-screen ${contentScrollClass} no-scrollbar bg-background`}>
        <div className="min-h-full flex items-center justify-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-3xl">👶</span>
            </div>
            <p className="text-muted-foreground font-medium">กำลังโหลด...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  // ---------------- onboarding ----------------
  if (showOnboarding) {
    return (
      <div className={`h-screen ${contentScrollClass} no-scrollbar bg-background relative`}>
        {/* Back Button for Logout */}
        <button
          onClick={logout}
          className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-white/70 dark:border-white/10 text-gray-700 dark:text-gray-200 shadow-sm backdrop-blur-xl transition-all z-20"
        >
          <ArrowLeft size={18} />
          <span className="font-semibold text-sm"></span>
        </button>
        <div className="min-h-full flex flex-col">
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
                <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl p-4 rounded-[28px] border border-white/70 dark:border-white/10 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
                  <div className="w-10 h-10 rounded-xl bg-feeding/20 dark:bg-feeding/30 flex items-center justify-center mb-2 mx-auto">
                    <span className="text-xl">🍼</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">บันทึกการกินนม</p>
                </div>
                <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl p-4 rounded-[28px] border border-white/70 dark:border-white/10 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
                  <div className="w-10 h-10 rounded-xl bg-diaper/20 dark:bg-diaper/30 flex items-center justify-center mb-2 mx-auto">
                    <span className="text-xl">👶</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">บันทึกผ้าอ้อม</p>
                </div>
                <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl p-4 rounded-[28px] border border-white/70 dark:border-white/10 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] col-span-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center mb-2 mx-auto">
                    <span className="text-xl">💤</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">บันทึกการนอน</p>
                  <p className="text-xs text-muted-foreground mt-1 text-center">ติดตามรูปแบบการนอนของลูกน้อย</p>
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

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                onClick={logout}
                className="w-full mt-4 py-3 text-muted-foreground hover:text-foreground font-bold text-sm transition-colors"
              >
                ออกจากระบบ
              </motion.button>
            </motion.div>
          </div>

          <AnimatePresence>
            {activeModal === "add-baby" && (
              <BabyProfileModal baby={null} onClose={() => setActiveModal(null)} onSave={handleSaveBaby} />
            )}
          </AnimatePresence>
        </div>
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
    <div className="h-screen relative overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="landing-blob-1 absolute -top-32 -right-24 h-[360px] w-[360px] rounded-full bg-papaya/25 blur-3xl" />
        <div className="landing-blob-2 absolute top-[20%] -left-32 h-[420px] w-[420px] rounded-full bg-sky/25 blur-3xl" />
        <div className="landing-blob-3 absolute bottom-0 right-[8%] h-[280px] w-[280px] rounded-full bg-saguaro/20 blur-3xl" />
      </div>

      {/* Decorative background icon */}
      <div className="fixed top-16 right-[-120px] -z-10 opacity-10 dark:opacity-5 pointer-events-none">
        <div className="animate-[spin_80s_linear_infinite]">
          <Baby className="w-[320px] h-[320px] text-primary" />
        </div>
      </div>

      <div
        className={`relative h-full overflow-x-hidden ${contentScrollClass} no-scrollbar`}
      >
        <div className="flex min-h-full flex-col max-w-[1440px] mx-auto">
          {/* Header / Nav */}
          <header className="relative z-10 flex items-center justify-between px-4 md:px-8 py-5 md:py-7 gap-3">
            <BabySwitcher
              babies={babies}
              currentBaby={baby}
              onSelectBaby={(selectedBaby) => {
                switchBaby(selectedBaby.id);
                navigate(`/app/baby/${selectedBaby.id}`, { replace: true });
              }}
              onAddBaby={() => setActiveModal("add-baby")}
              containerClassName="min-w-0"
              buttonClassName="w-auto max-w-[70vw] sm:max-w-none justify-start gap-3 px-4 py-3 rounded-[26px] bg-white/90 dark:bg-white/5 border border-white/70 dark:border-white/10 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.4)] backdrop-blur-xl transition-all hover:shadow-[0_24px_55px_-32px_rgba(15,23,42,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              nameClassName="text-[15px] md:text-base font-semibold tracking-tight text-[#3a2c2c] dark:text-white"
              chevronClassName="text-slate-400"
            />

            <div className="flex gap-3 items-center">
              <div className="hidden sm:flex items-center gap-2 rounded-2xl px-3 py-2 bg-white/85 dark:bg-white/10 border border-white/70 dark:border-white/10 backdrop-blur-xl shadow-[0_10px_25px_-18px_rgba(15,23,42,0.45)]">
                <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">ฉัน</span>
                <span className="max-w-[160px] truncate text-sm font-semibold text-foreground">{currentUserLabel}</span>
                <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                  {currentRoleLabel}
                </span>
              </div>
              <button
                onClick={() => {
                  if (!isOwner) {
                    toast({
                      title: "เฉพาะเจ้าของ",
                      description: "การแจ้งเตือนคำขอเข้าร่วมดูได้เฉพาะเจ้าของเด็ก",
                      variant: "destructive",
                    });
                    return;
                  }
                  setActiveModal("notifications");
                  setHasUnreadRequests(false); // Predictively clear badge
                }}
                className="relative flex items-center justify-center size-9 sm:size-10 rounded-full bg-white/90 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-white/70 dark:border-white/10 text-gray-600 dark:text-gray-200 shadow-[0_10px_25px_-18px_rgba(15,23,42,0.45)] transition-all backdrop-blur-xl"
              >
                <Bell className="w-5 h-5" />
                {isOwner && hasUnreadRequests && (
                  <span className="absolute top-0 right-0 size-2.5 rounded-full bg-rose-500 animate-pulse ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>

              {/* profile bubble */}
              <button
                onClick={() => setActiveModal("settings")}
                className="relative flex items-center justify-center size-9 sm:size-10 rounded-full bg-white dark:bg-white/10 border-2 border-slate-200 dark:border-white/10 shadow-[0_10px_25px_-18px_rgba(15,23,42,0.45)] text-lg hover:scale-105 transition-transform"
                aria-label="Open settings"
              >
                <Baby className="w-5 h-5" aria-hidden="true" />
                <span className="absolute inset-0 rounded-full ring-1 ring-black/5 dark:ring-white/10 pointer-events-none" />
              </button>
            </div>
          </header>

          <div className="sm:hidden px-4 md:px-8 -mt-1 mb-2">
            <div className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 bg-white/85 dark:bg-white/10 border border-white/70 dark:border-white/10 backdrop-blur-xl shadow-[0_10px_25px_-18px_rgba(15,23,42,0.45)]">
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">ฉัน</span>
              <span className="max-w-[145px] truncate text-sm font-semibold text-foreground">{currentUserLabel}</span>
              <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                {currentRoleLabel}
              </span>
            </div>
          </div>

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
                    {/* Date Selector */}
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-white/10 px-2 py-1 border border-white/70 dark:border-white/10">
                      <button
                        onClick={() => navigateDay('prev')}
                        className="size-8 rounded-full bg-white/90 dark:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-200 hover:bg-white transition"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <div className="flex items-center gap-2 px-2">
                        <span className={`size-2 rounded-full ${statusDot}`} />
                        <input
                          ref={dateInputRef}
                          type="date"
                          value={selectedDate.toISOString().split('T')[0]}
                          onChange={(e) => {
                            if (e.target.value) {
                              const [y, m, d] = e.target.value.split('-').map(Number);
                              setSelectedDate(new Date(y, m - 1, d));
                            }
                          }}
                          max={new Date().toISOString().split('T')[0]}
                          className="absolute opacity-0 w-0 h-0 pointer-events-none"
                        />
                        <button
                          type="button"
                          onClick={() => dateInputRef.current?.showPicker?.()}
                          className="text-sm font-bold text-foreground min-w-[100px] text-center hover:text-primary transition">
                          {isToday ? 'วันนี้' : selectedDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </button>
                      </div>
                      <button
                        onClick={() => navigateDay('next')}
                        disabled={isToday}
                        className="size-8 rounded-full bg-white/90 dark:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-200 hover:bg-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronRight size={16} />
                      </button>
                      {!isToday && (
                        <button
                          onClick={goToToday}
                          className="text-xs font-bold text-primary hover:underline px-2"
                        >
                          วันนี้
                        </button>
                      )}
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

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
                    <div className="rounded-3xl bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/20 p-4 shadow-soft">
                      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <span className="size-2 rounded-full bg-sleep" />
                        <span>นอน</span>
                      </div>
                      <p className="text-lg font-bold tracking-tight tabular-nums text-foreground mt-1">
                        {dailySummary.sleepH}ชม. {dailySummary.sleepR}น.
                      </p>
                    </div>
                    <div className="rounded-3xl bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/20 p-4 shadow-soft">
                      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <span className="size-2 rounded-full bg-diaper" />
                        <span>ผ้าอ้อม</span>
                      </div>
                      <p className="text-lg font-bold tracking-tight tabular-nums text-foreground mt-1">
                        {dailySummary.diaperCount} ครั้ง
                      </p>
                    </div>
                    <div className="rounded-3xl bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/20 p-4 shadow-soft">
                      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <span className="size-2 rounded-full bg-feeding" />
                        <span>กินนม</span>
                      </div>
                      <p className="text-lg font-bold tracking-tight tabular-nums text-foreground mt-1">
                        {dailySummary.totalMl} มล.
                      </p>
                    </div>
                    <div className="rounded-3xl bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/20 p-4 shadow-soft">
                      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <span className="size-2 rounded-full bg-pump" />
                        <span>ปั๊มนม</span>
                      </div>
                      <p className="text-lg font-bold tracking-tight tabular-nums text-foreground mt-1">
                        {dailySummary.pumpMl} มล.
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
                <div className="bg-white/80 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-soft border border-white/40 dark:border-white/20 h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-extrabold">กิจกรรมล่าสุด</h3>
                      <p className="text-sm text-muted-foreground mt-1">24 ชั่วโมงล่าสุด</p>
                    </div>
                    <button
                      className="text-primary text-sm font-extrabold hover:underline"
                      onClick={() => setActiveModal("activities")}
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
                      <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary/40 dark:from-white/10 to-transparent -z-10" />

                      {recent.slice(0, 5).map((item, idx) => {
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
                              {/* Solid backdrop to prevent the timeline line from showing through the transparent circle */}
                              <div className="absolute inset-1 rounded-full bg-white dark:bg-[#1a1c23]" />
                              <div
                                className={`relative size-10 rounded-full flex items-center justify-center z-10 border-4 border-white/90 dark:border-[#2a2d36] ${toneClass}`}
                              >
                                <Icon className="w-5 h-5 relative z-20" />
                              </div>
                            </div>

                            <div className="pt-1 flex-1 min-w-0">
                              <p className="font-semibold tracking-tight text-sm text-foreground">{item.label}</p>
                              <p className="text-muted-foreground text-sm mt-0.5">{item.sub}</p>
                            </div>

                            <div className={`flex gap-1 pt-1 flex-none ${isOwner ? "" : "hidden"}`}>
                              <button
                                onClick={() => handleEditLogItem(item)}
                                className="size-7 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground transition"
                                title="แก้ไข"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteLogItem(item)}
                                className="size-7 rounded-full bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center text-destructive transition"
                                title="ลบ"
                              >
                                <Trash2 size={13} />
                              </button>
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    className="group relative overflow-hidden rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center gap-4 min-h-[230px] bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/20 shadow-soft"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-feeding/30 via-white/5 to-transparent opacity-80" />
                    <div className="absolute -top-10 -right-10 size-24 rounded-full bg-feeding/20 blur-2xl" />
                    <div className="relative flex flex-col items-center gap-4 text-center">
                      <div className="size-16 md:size-20 rounded-2xl bg-rose-50 dark:bg-white/10 shadow-sm flex items-center justify-center text-rose-500 dark:text-feeding group-hover:scale-110 transition-transform duration-300">
                        <Utensils className="w-9 h-9" />
                      </div>
                      <div>
                        <span className="block text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">บันทึกการกินนม</span>
                        <span className="text-sm font-semibold text-rose-500/80 dark:text-feeding/80">
                          ขวดนมหรือเข้าเต้า
                        </span>
                      </div>
                    </div>
                  </motion.button>

                  {/* Diaper */}
                  <motion.button
                    onClick={() => setActiveModal("diaper")}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    className="group relative overflow-hidden rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center gap-4 min-h-[230px] bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/20 shadow-soft"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-diaper/30 via-white/5 to-transparent opacity-80" />
                    <div className="absolute -bottom-10 -left-10 size-24 rounded-full bg-diaper/20 blur-2xl" />
                    <div className="relative flex flex-col items-center gap-4 text-center">
                      <div className="size-16 md:size-20 rounded-2xl bg-amber-50 dark:bg-white/10 shadow-sm flex items-center justify-center text-amber-500 dark:text-diaper group-hover:scale-110 transition-transform duration-300">
                        <Droplet className="w-9 h-9" />
                      </div>
                      <div>
                        <span className="block text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">บันทึกผ้าอ้อม</span>
                        <span className="text-sm font-semibold text-amber-500/80 dark:text-diaper/80">ฉี่/อึ/ผสม</span>
                      </div>
                    </div>
                  </motion.button>

                  {/* Sleep */}
                  <motion.button
                    onClick={() => setActiveModal("sleep")}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    className="group relative overflow-hidden rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center gap-4 min-h-[230px] bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/20 shadow-soft"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-sleep/30 via-white/5 to-transparent opacity-80" />
                    <div className="absolute -top-10 -left-10 size-24 rounded-full bg-sleep/20 blur-2xl" />
                    <div className="relative flex flex-col items-center gap-4 text-center">
                      <div className="size-16 md:size-20 rounded-2xl bg-sky-50 dark:bg-white/10 shadow-sm flex items-center justify-center text-sky-500 dark:text-sleep group-hover:scale-110 transition-transform duration-300">
                        <BedDouble className="w-9 h-9" />
                      </div>
                      <div>
                        <span className="block text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">บันทึกการนอน</span>
                        <span className="text-sm font-semibold text-sky-500/80 dark:text-sleep/80">
                          เริ่มหรือตื่นนอน
                        </span>
                      </div>
                    </div>
                  </motion.button>

                  {/* Pumping */}
                  <motion.button
                    onClick={() => setActiveModal("pumping")}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.25 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    className="group relative overflow-hidden rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center gap-4 min-h-[230px] bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/20 shadow-soft"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-pump/30 via-white/5 to-transparent opacity-80" />
                    <div className="absolute -bottom-10 -right-10 size-24 rounded-full bg-pump/20 blur-2xl" />
                    <div className="relative flex flex-col items-center gap-4 text-center">
                      <div className="size-16 md:size-20 rounded-2xl bg-purple-50 dark:bg-white/10 shadow-sm flex items-center justify-center text-purple-500 dark:text-pump group-hover:scale-110 transition-transform duration-300">
                        <Milk className="w-9 h-9" />
                      </div>
                      <div>
                        <span className="block text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">ปั๊มนม</span>
                        <span className="text-sm font-semibold text-purple-500/80 dark:text-pump/80">รายละเอียดการปั๊ม</span>
                      </div>
                    </div>
                  </motion.button>
                </div>
              </div>

              {/* Right Column: Daily Summary */}
              <div className="lg:col-span-3 order-3">
                <div className="bg-white/80 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-soft border border-white/40 dark:border-white/20 h-full flex flex-col gap-6">
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
                  <div className="bg-white/90 dark:bg-white/10 p-5 rounded-2xl border border-white/70 dark:border-white/10 flex flex-col justify-center shadow-[0_16px_35px_-30px_rgba(15,23,42,0.35)]">
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

                  {/* Pumping */}
                  <div className="bg-white/90 dark:bg-white/10 p-5 rounded-2xl border border-white/70 dark:border-white/10 shadow-[0_16px_35px_-30px_rgba(15,23,42,0.35)]">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="size-8 rounded-full bg-purple-100/80 dark:bg-purple-900/30 text-purple-500 flex items-center justify-center">
                        <Milk className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-gray-500 dark:text-gray-300">ปั๊มนม</span>
                    </div>

                    <div className="flex items-end justify-between">
                      <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                        {dailySummary.pumpMl} <span className="text-lg text-gray-400 font-medium">มล.</span>
                      </span>
                      <span className="text-sm font-semibold text-gray-400">{dailySummary.pumpCount} ครั้ง</span>
                    </div>

                    <div className="w-full bg-slate-100/80 dark:bg-white/10 h-2 rounded-full mt-3 overflow-hidden">
                      <div
                        className="bg-purple-400 h-full rounded-full"
                        style={{ width: `${Math.min(100, Math.round((dailySummary.pumpMl / 400) * 100))}%` }}
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
            {activeModal === "feeding" && <FeedingModal
              onClose={() => { setActiveModal(null); setEditingLog(null); }}
              onSave={handleSaveFeeding}
              initialData={editingLog?.type?.includes('feeding') ? {
                timestamp: new Date(editingLog.raw?.timestamp ?? editingLog.raw?.createdAt ?? editingLog.raw?.time ?? Date.now()),
                details: editingLog.raw?.details ?? editingLog.raw ?? {},
              } : undefined}
            />}
            {activeModal === "diaper" && <DiaperModal
              onClose={() => { setActiveModal(null); setEditingLog(null); }}
              onSave={handleSaveDiaper}
              initialData={editingLog?.type?.includes('diaper') ? {
                timestamp: new Date(editingLog.raw?.timestamp ?? editingLog.raw?.createdAt ?? editingLog.raw?.time ?? Date.now()),
                details: editingLog.raw?.details ?? editingLog.raw ?? {},
              } : undefined}
            />}
            {activeModal === "sleep" && <SleepModal
              onClose={() => { setActiveModal(null); setEditingLog(null); }}
              onSave={handleSaveSleep}
              initialData={editingLog?.type?.includes('sleep') ? {
                timestamp: new Date(editingLog.raw?.timestamp ?? editingLog.raw?.createdAt ?? editingLog.raw?.time ?? Date.now()),
                details: editingLog.raw?.details ?? editingLog.raw ?? {},
              } : undefined}
            />}
            {activeModal === "pumping" && <PumpingModal
              onClose={() => { setActiveModal(null); setEditingLog(null); }}
              onSave={handleSavePumping}
              initialData={editingLog?.type?.includes('pump') ? {
                timestamp: new Date(editingLog.raw?.timestamp ?? editingLog.raw?.createdAt ?? editingLog.raw?.time ?? Date.now()),
                details: editingLog.raw?.details ?? editingLog.raw ?? {},
              } : undefined}
            />}

            {activeModal === "add-baby" && (
              <BabyProfileModal baby={null} onClose={() => setActiveModal(null)} onSave={handleSaveBaby} />
            )}
            {activeModal === "edit-baby" && (
              <BabyProfileModal baby={baby} onClose={() => setActiveModal("settings")} onSave={handleSaveBaby} />
            )}
            {activeModal === "settings" && (
              <SettingsModal
                baby={baby}
                canManageBaby={isOwner}
                onClose={() => setActiveModal(null)}
                onEditBaby={() => setActiveModal("edit-baby")}
                onClearData={handleClearData}
                onOpenCaregivers={() => setActiveModal("caregivers")}
                onDeleteBaby={handleDeleteBaby}
              />
            )}
            {activeModal === "caregivers" && (
              <CaregiversModal babyId={baby?.id || null} onClose={() => setActiveModal(null)} />
            )}
            {activeModal === "notifications" && isOwner && (
              <NotificationsModal
                baby={baby}
                onClose={() => setActiveModal(null)}
                onMembersUpdated={() => refreshBabyData()}
              />
            )}
            {activeModal === "activities" && (
              <ActivitiesModal
                selectedDate={selectedDate}
                activities={allActivities}
                canManageActions={isOwner}
                onEditActivity={handleEditLogItem}
                onDeleteActivity={handleDeleteLogItem}
                onClose={() => setActiveModal(null)}
              />
            )}
            {activeModal === "dashboard" && <DashboardModal logs={logs} onClose={() => setActiveModal(null)} />}
          </AnimatePresence>

          <ConfirmModal
            isOpen={!!confirmConfig?.isOpen}
            title={confirmConfig?.title || ""}
            description={confirmConfig?.description || ""}
            confirmLabel={confirmConfig?.confirmLabel || "ยืนยัน"}
            variant="destructive"
            onConfirm={() => {
              if (confirmConfig?.action) confirmConfig.action();
              setConfirmConfig(null);
            }}
            onCancel={() => {
              if (confirmConfig?.onCancelRedirect) setActiveModal(confirmConfig.onCancelRedirect);
              setConfirmConfig(null);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
