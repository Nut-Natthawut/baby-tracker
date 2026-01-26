import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import BabyCareLogo from "@/components/baby/BabyCareLogo";

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const success = await signup(email.trim(), password, name.trim() || undefined);
    if (success) {
      navigate("/app", { replace: true });
    } else {
      setError("ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่");
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] dark:bg-[#0f172a] text-[#111418] dark:text-gray-100">
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
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Baby Tracker</p>
              <h1 className="text-2xl font-black text-foreground">สมัครสมาชิก</h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="signup-name" className="text-sm font-semibold text-muted-foreground mb-2 block">
                ชื่อ (ไม่บังคับ)
              </label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="signup-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น คุณแม่"
                  className="w-full bg-card border border-border rounded-2xl py-3.5 pl-11 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="signup-email" className="text-sm font-semibold text-muted-foreground mb-2 block">
                อีเมล
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-card border border-border rounded-2xl py-3.5 pl-11 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="signup-password" className="text-sm font-semibold text-muted-foreground mb-2 block">
                รหัสผ่าน
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ตั้งรหัสผ่าน"
                  className="w-full bg-card border border-border rounded-2xl py-3.5 pl-11 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
            </div>

            {error && <p className="text-sm text-rose-500 font-semibold">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-primary text-primary-foreground text-base font-bold shadow-glow-primary disabled:opacity-60"
            >
              {submitting ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            มีบัญชีแล้ว?
            {" "}
            <button
              onClick={() => navigate("/login")}
              className="ml-2 font-semibold text-primary hover:underline"
            >
              เข้าสู่ระบบ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
