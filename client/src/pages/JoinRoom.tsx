import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Baby, User, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

const CODE_INPUT_SLOTS = ["slot-0", "slot-1", "slot-2", "slot-3", "slot-4", "slot-5"] as const;

const JoinRoom = () => {
  const navigate = useNavigate();
  const { token: authToken, loading: authLoading, user } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [joinRole, setJoinRole] = useState<"caregiver" | "parent">("caregiver");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!authToken) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, authToken, navigate]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const verifyCode = () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      toast({ title: "กรุณากรอกรหัส 6 หลัก", variant: "destructive" });
      return;
    }
    setStep(2);
  };

  const handleJoin = async () => {
    if (!authToken) {
      navigate("/login", { replace: true });
      return;
    }

    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      toast({ title: "กรุณากรอกรหัส 6 หลัก", variant: "destructive" });
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/invitations/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          code: fullCode,
          role: joinRole,
        }),
      });

      const result = await response.json();

      if (response.status === 401) {
        navigate("/login", { replace: true });
        return;
      }

      if (result.success) {
        toast({ title: "ส่งคำขอเข้าร่วมแล้ว", description: "กำลังพาไปหน้าถัดไป..." });
        if (result.data?.babyId) {
          navigate(`/app/baby/${result.data.babyId}`, { replace: true });
        } else {
          navigate("/app", { replace: true });
        }
      } else {
        toast({
          title: "เข้าร่วมไม่สำเร็จ",
          description: result.message || "รหัสไม่ถูกต้องหรือหมดอายุแล้ว",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Join error:", error);
      toast({
        title: "เกิดข้อผิดพลาดเครือข่าย",
        description: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!authLoading && !authToken) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <p className="text-muted-foreground text-center">กำลังพาไปหน้าเข้าสู่ระบบ...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          className="absolute -top-20 -right-20 h-[320px] w-[320px] rounded-full bg-papaya/20 blur-3xl"
          animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[30%] -left-28 h-[360px] w-[360px] rounded-full bg-sky/20 blur-3xl"
          animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <header className="px-6 py-6 flex items-center">
        <button
          onClick={() => (step === 1 ? navigate("/") : setStep(1))}
          className="p-2 -ml-2 rounded-full hover:bg-secondary/50 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
      </header>

      <main className="flex-1 px-6 pb-12 flex flex-col max-w-md mx-auto w-full">
        <div className="flex-1 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-peach to-peach/70 rounded-2xl flex items-center justify-center shadow-lg mb-6">
              <Users className="text-white w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold mb-2">เข้าร่วมครอบครัว</h1>
            <p className="text-muted-foreground">
              {step === 1 ? "กรอกรหัสเข้าร่วมห้อง 6 หลัก" : "เลือกบทบาทของคุณในห้องนี้"}
            </p>
          </motion.div>

          <div className="mb-4 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            เข้าสู่ระบบแล้วในชื่อ{" "}
            <span className="font-semibold text-foreground">{user?.name || user?.email || "ผู้ใช้"}</span>
          </div>

          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="flex justify-between gap-2">
                {CODE_INPUT_SLOTS.map((slot, idx) => (
                  <input
                    key={slot}
                    id={`code-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={code[idx] ?? ""}
                    onChange={(e) => handleCodeChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-12 h-16 rounded-xl border-2 border-border bg-card text-center text-2xl font-bold focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all"
                  />
                ))}
              </div>

              <button
                onClick={verifyCode}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-glow-primary active:scale-[0.98] transition-transform"
              >
                ถัดไป
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <div className="grid grid-cols-2 gap-3 mb-2">
                <button
                  onClick={() => setJoinRole("caregiver")}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    joinRole === "caregiver"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  <User size={24} />
                  <span className="font-semibold">ผู้ช่วยเลี้ยง</span>
                </button>
                <button
                  onClick={() => setJoinRole("parent")}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    joinRole === "parent"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  <Baby size={24} />
                  <span className="font-semibold">พ่อ/แม่</span>
                </button>
              </div>

              <button
                onClick={handleJoin}
                disabled={loading}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-glow-primary active:scale-[0.98] transition-transform disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "กำลังดำเนินการ..." : "ยืนยันการเข้าร่วม"}
              </button>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default JoinRoom;
