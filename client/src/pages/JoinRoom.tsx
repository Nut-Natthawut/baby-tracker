import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Lock, Mail, Baby, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import BabyCareLogo from "@/components/baby/BabyCareLogo";

const JoinRoom = () => {
    const navigate = useNavigate();
    const { login } = useAuth(); // We might need a way to just set token without full login flow if we do manual handling
    // actually useAuth 'login' usually takes email/pass.
    // Here we get a token back directly.
    // We might need to manually set the token. 
    // Let's check useAuth hook later. For now assume we save token to localStorage and reload/redirect.

    const [step, setStep] = useState<1 | 2>(1);
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "caregiver", // Default
    });
    const [loading, setLoading] = useState(false);

    const handleCodeChange = (index: number, value: string) => {
        if (value.length > 1) return; // Only 1 char
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto focus next
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

    const verifyCode = async () => {
        const fullCode = code.join("");
        if (fullCode.length !== 6) {
            toast({ title: "กรุณากรอกรหัส 6 หลัก", variant: "destructive" });
            return;
        }
        // Setup for step 2 (Role & Info)
        setStep(2);
    };

    const handleJoin = async () => {
        if (!formData.name || !formData.email || !formData.password) {
            toast({ title: "กรุณากรอกข้อมูลให้ครบ", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            const fullCode = code.join("");
            const response = await fetch(`${API_BASE_URL}/invitations/join`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code: fullCode,
                    ...formData, // email, name, password, role
                }),
            });

            const result = await response.json();

            if (result.success) {
                toast({ title: "เข้าร่วมสำเร็จ!", description: "กำลังพาไปที่หน้าหลัก..." });

                // Manually set token
                localStorage.setItem("token", result.data.token);

                // Redirect to baby dashboard
                if (result.data.babyId) {
                    window.location.href = `/app/baby/${result.data.babyId}`;
                } else {
                    window.location.href = "/app";
                }
            } else {
                toast({
                    title: "เข้าร่วมไม่สำเร็จ",
                    description: result.message || "รหัสไม่ถูกต้องหรือหมดอายุ",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Join error:", error);
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถเชื่อมต่อระบบได้",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col relative overflow-hidden text-foreground">
            {/* Background Decor */}
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
                    onClick={() => step === 1 ? navigate("/") : setStep(1)}
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
                            {step === 1 ? "กรอกรหัส 6 หลักที่ได้รับจากเจ้าของห้อง" : "ตั้งค่าโปรไฟล์ของคุณสำหรับห้องนี้"}
                        </p>
                    </motion.div>

                    {step === 1 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-8"
                        >
                            <div className="flex justify-between gap-2">
                                {code.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        id={`code-${idx}`}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
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
                            {/* Role Selection */}
                            <div className="grid grid-cols-2 gap-3 mb-2">
                                <button
                                    onClick={() => setFormData({ ...formData, role: 'caregiver' })}
                                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.role === 'caregiver'
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-border bg-card text-muted-foreground'
                                        }`}
                                >
                                    <User size={24} />
                                    <span className="font-semibold">ผู้ช่วยเลี้ยง</span>
                                </button>
                                <button
                                    onClick={() => setFormData({ ...formData, role: 'parent' })}
                                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.role === 'parent'
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-border bg-card text-muted-foreground'
                                        }`}
                                >
                                    <Baby size={24} />
                                    <span className="font-semibold">พ่อ/แม่</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="ชื่อของคุณ (เช่น แม่, พ่อ, น้า)"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                                    <input
                                        type="email"
                                        placeholder="อีเมล"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                                    <input
                                        type="password"
                                        placeholder="รหัสผ่านมาตรฐาน (สำหรับเข้าสู่ระบบ)"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleJoin}
                                disabled={loading}
                                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-glow-primary active:scale-[0.98] transition-transform disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? "กำลังเข้าร่วม..." : "ยืนยันการเข้าร่วม"}
                            </button>
                        </motion.div>
                    )}

                </div>
            </main >
        </div >
    );
};

export default JoinRoom;
