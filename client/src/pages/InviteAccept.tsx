import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Lock, User, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { API_BASE_URL } from "@/lib/api";
import BabyCareLogo from "@/components/baby/BabyCareLogo";

const InviteAccept = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, token: authToken, setToken, refreshMe } = useAuth();
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleAccept = async () => {
    if (!token) {
      setError("ลิงก์เชิญไม่ถูกต้อง");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const headers: Record<string, string> = {};
      let body: any = undefined;

      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      } else {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify({ password, name: name.trim() || undefined });
      }

      const response = await fetch(`${API_BASE_URL}/invitations/${token}/accept`, {
        method: "POST",
        headers,
        body,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result?.error === "LOGIN_REQUIRED") {
          setError("อีเมลนี้มีบัญชีแล้ว กรุณาเข้าสู่ระบบก่อน");
        } else {
          setError(result?.message || "ไม่สามารถยอมรับคำเชิญได้");
        }
        return;
      }

      const issuedToken = result?.data?.token as string | undefined;
      if (issuedToken) {
        setToken(issuedToken);
        await refreshMe(issuedToken);
      }

      setSuccess(true);
      setTimeout(() => navigate("/app", { replace: true }), 800);
    } catch (err) {
      console.error("Accept invite error:", err);
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} />
          กลับหน้าแรก
        </button>

        <div className="mt-8 rounded-[32px] border border-white/70 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)]">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-papaya/70 shadow-glow-primary flex items-center justify-center overflow-hidden">
              <BabyCareLogo size="sm" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Invite</p>
              <h1 className="text-2xl font-black text-foreground">ยอมรับคำเชิญ</h1>
            </div>
          </div>

          {success ? (
            <p className="text-emerald-500 font-semibold">ยอมรับคำเชิญสำเร็จ กำลังพาไปยังแอป...</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                {user
                  ? "ยืนยันการเข้าร่วมเพื่อแชร์ข้อมูลกับครอบครัว"
                  : "ตั้งรหัสผ่านเพื่อเข้าร่วมและเริ่มใช้งานร่วมกัน"}
              </p>

              {!user && (
                <div className="space-y-5 mb-6">
                  <div>
                    <label htmlFor="invite-name" className="text-sm font-semibold text-muted-foreground mb-2 block">
                      ชื่อ (ไม่บังคับ)
                    </label>
                    <div className="relative">
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="invite-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="เช่น คุณพ่อ"
                        className="w-full bg-card border border-border rounded-2xl py-3.5 pl-11 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="invite-password" className="text-sm font-semibold text-muted-foreground mb-2 block">
                      ตั้งรหัสผ่าน
                    </label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="invite-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="ตั้งรหัสผ่าน"
                        className="w-full bg-card border border-border rounded-2xl py-3.5 pl-11 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <p className="text-sm text-rose-500 font-semibold mb-4">{error}</p>
              )}

              <button
                onClick={handleAccept}
                disabled={submitting || (!user && !password)}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground text-base font-bold shadow-glow-primary disabled:opacity-60"
              >
                {submitting ? "กำลังยอมรับคำเชิญ..." : "ยอมรับคำเชิญ"}
              </button>

              {error.includes("เข้าสู่ระบบ") && (
                <button
                  onClick={() => navigate("/login")}
                  className="mt-4 w-full py-3 rounded-2xl border border-white/70 dark:border-white/10 bg-white/80 dark:bg-white/5 text-foreground font-semibold"
                >
                  ไปหน้าเข้าสู่ระบบ
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteAccept;
