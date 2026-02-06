import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Baby, Droplets, Moon, Heart, BarChart3, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BabyCareLogo from '@/components/baby/BabyCareLogo';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Baby className="w-8 h-8" />,
      title: "บันทึกการกินนม",
      description: "ติดตามปริมาณนมและเวลาให้นมอย่างละเอียด",
      tone: "from-sky/35 via-white/80 to-white/60",
      iconWrap: "bg-feeding/20 text-feeding",
    },
    {
      icon: <Droplets className="w-8 h-8" />,
      title: "บันทึกผ้าอ้อม",
      description: "บันทึกลักษณะและสีเพื่อติดตามสุขภาพ",
      tone: "from-saguaro/25 via-white/80 to-white/60",
      iconWrap: "bg-diaper/20 text-diaper",
    },
    {
      icon: <Moon className="w-8 h-8" />,
      title: "บันทึกการนอน",
      description: "ติดตามรูปแบบการนอนของลูกน้อย",
      tone: "from-sleep/25 via-white/80 to-white/60",
      iconWrap: "bg-sleep/20 text-sleep",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "สถิติและรายงาน",
      description: "ดูสรุปรายวันและรายเดือนอย่างง่าย",
      tone: "from-papaya/25 via-white/80 to-white/60",
      iconWrap: "bg-mint/20 text-mint",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="landing-blob-1 absolute -top-32 -right-24 h-[360px] w-[360px] rounded-full bg-papaya/25 blur-3xl" />
          <div className="landing-blob-2 absolute top-[20%] -left-32 h-[420px] w-[420px] rounded-full bg-sky/25 blur-3xl" />
          <div className="landing-blob-3 absolute bottom-0 right-[8%] h-[280px] w-[280px] rounded-full bg-saguaro/20 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-6 left-6 right-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-papaya/70 shadow-glow-primary flex items-center justify-center overflow-hidden">
              <BabyCareLogo size="sm" />
            </div>
            <div className="leading-tight">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Baby Tracker</p>
              <span className="font-black text-lg text-foreground">ดูแลลูกน้อย</span>
            </div>
          </div>
          <Button
            onClick={() => navigate('/app')}
            size="sm"
            variant="ghost"
            className="rounded-full bg-white/80 dark:bg-white/10 text-foreground border border-white/70 dark:border-white/10 px-5 py-2 font-bold shadow-[0_12px_30px_-20px_rgba(15,23,42,0.35)] hover:bg-white hover:text-foreground"
          >
            เข้าแอป
          </Button>
        </motion.div>

        <div className="max-w-5xl mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 -z-10 rounded-[40px] bg-gradient-to-br from-white/70 via-white/40 to-sky/20 blur-3xl" />
            <div className="relative rounded-[32px] border border-white/70 dark:border-white/10 bg-white/75 dark:bg-white/5 backdrop-blur-xl p-8 md:p-12 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.55)]">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
              >
                <div className="w-28 h-28 md:w-32 md:h-32 mx-auto relative">
                  <div className="absolute inset-0 bg-papaya/20 rounded-full animate-soft-pulse" />
                  <div className="relative w-full h-full rounded-full bg-gradient-to-br from-papaya to-papaya/70 flex items-center justify-center shadow-glow-primary overflow-hidden">
                    <BabyCareLogo size="xl" />
                  </div>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-6xl font-black tracking-[-0.03em] text-foreground mb-4"
              >
                <span className="text-gradient-papaya">Baby</span> Tracker
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg md:text-2xl text-muted-foreground font-semibold"
              >
                บันทึกทุกช่วงเวลา ดูสรุปได้ทันที และเข้าใจลูกน้อยมากขึ้น
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-muted-foreground"
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-white/10 border border-white/70 dark:border-white/10 px-4 py-2">
                  🍼 บันทึกการกินนม
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-white/10 border border-white/70 dark:border-white/10 px-4 py-2">
                  👶 ผ้าอ้อม
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-white/10 border border-white/70 dark:border-white/10 px-4 py-2">
                  😴 การนอน
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-white/10 border border-white/70 dark:border-white/10 px-4 py-2">
                  📈 รายงาน
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button
                  onClick={() => navigate('/app')}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-8 py-6 rounded-2xl shadow-glow-primary transition-all"
                >
                  เริ่มใช้งานเลย
                </Button>
                <Button
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  size="lg"
                  variant="outline"
                  className="rounded-2xl border border-white/70 dark:border-white/10 bg-white/80 dark:bg-white/5 text-foreground font-bold text-lg px-8 py-6 hover:bg-white/90 dark:hover:bg-white/10 hover:text-foreground"
                >
                  ดูฟีเจอร์
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-7 h-11 rounded-full border-2 border-white/60 dark:border-white/10 flex items-start justify-center p-2 bg-white/40 dark:bg-white/5"
          >
            <div className="w-1.5 h-3 bg-primary rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
              ฟีเจอร์หลัก
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              เครื่องมือครบครันสำหรับคุณพ่อคุณแม่ที่อยากดูแลลูกน้อยแบบมีระบบ
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative overflow-hidden rounded-[28px] border border-white/70 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl p-6 shadow-[0_20px_45px_-32px_rgba(15,23,42,0.35)] transition-transform hover:-translate-y-1"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.tone} opacity-90`} />
                <div className="relative">
                  <div className={`w-16 h-16 rounded-2xl ${feature.iconWrap} flex items-center justify-center mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-black text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* App Preview Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 h-72 w-72 bg-sky/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 h-80 w-80 bg-papaya/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Experience</p>
              <h2 className="text-3xl md:text-4xl font-black text-foreground mb-6">
                บันทึกง่าย ดูสรุปได้ทันที
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                แอปที่ออกแบบมาเพื่อคุณพ่อคุณแม่โดยเฉพาะ ใช้งานง่าย บันทึกเร็ว และดูสถิติย้อนหลังได้ทันที
              </p>

              <div className="grid gap-4">
                <div className="flex items-center gap-4 rounded-2xl bg-white/80 dark:bg-white/5 border border-white/70 dark:border-white/10 p-4 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)]">
                  <div className="w-12 h-12 rounded-xl bg-papaya/20 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-papaya" />
                  </div>
                  <div>
                    <h4 className="font-black text-foreground">บันทึกรวดเร็ว</h4>
                    <p className="text-sm text-muted-foreground">แตะครั้งเดียวเพื่อบันทึกข้อมูล</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-2xl bg-white/80 dark:bg-white/5 border border-white/70 dark:border-white/10 p-4 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)]">
                  <div className="w-12 h-12 rounded-xl bg-saguaro/20 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-saguaro" />
                  </div>
                  <div>
                    <h4 className="font-black text-foreground">เห็นภาพรวมทันที</h4>
                    <p className="text-sm text-muted-foreground">สรุปรายวันและรายเดือนแบบเข้าใจง่าย</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-2xl bg-white/80 dark:bg-white/5 border border-white/70 dark:border-white/10 p-4 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)]">
                  <div className="w-12 h-12 rounded-xl bg-sleep/20 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-sleep" />
                  </div>
                  <div>
                    <h4 className="font-black text-foreground">ข้อมูลปลอดภัย</h4>
                    <p className="text-sm text-muted-foreground">จัดการข้อมูลอย่างเป็นส่วนตัว</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative mx-auto w-64 md:w-80">
                <div className="absolute inset-0 bg-papaya/20 rounded-[3rem] blur-2xl transform rotate-6" />
                <div className="relative bg-[#111418] rounded-[2.5rem] p-3 shadow-2xl">
                  <div className="bg-[#f7f7f5] rounded-[2rem] overflow-hidden aspect-[9/19]">
                    <div className="p-4 h-full flex flex-col">
                      <div className="text-center mb-4">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-papaya/20 flex items-center justify-center mb-2 overflow-hidden">
                          <BabyCareLogo size="lg" />
                        </div>
                        <p className="font-black text-foreground">น้องมีนา</p>
                        <p className="text-xs text-muted-foreground">อายุ 3 เดือน</p>
                      </div>

                      <div className="space-y-2 flex-1">
                        <div className="bg-white/80 p-3 rounded-xl border border-white/70 flex items-center gap-3">
                          <div className="w-10 h-10 bg-feeding/20 rounded-lg flex items-center justify-center text-xl">🍼</div>
                          <div>
                            <p className="font-semibold text-sm text-foreground">ให้นม</p>
                            <p className="text-xs text-muted-foreground">150ml • 10:30</p>
                          </div>
                        </div>
                        <div className="bg-white/80 p-3 rounded-xl border border-white/70 flex items-center gap-3">
                          <div className="w-10 h-10 bg-diaper/20 rounded-lg flex items-center justify-center text-xl">👶</div>
                          <div>
                            <p className="font-semibold text-sm text-foreground">เปลี่ยนผ้าอ้อม</p>
                            <p className="text-xs text-muted-foreground">ฉี่ + อึ • 09:15</p>
                          </div>
                        </div>
                        <div className="bg-white/80 p-3 rounded-xl border border-white/70 flex items-center gap-3">
                          <div className="w-10 h-10 bg-sleep/20 rounded-lg flex items-center justify-center text-xl">😴</div>
                          <div>
                            <p className="font-semibold text-sm text-foreground">นอนหลับ</p>
                            <p className="text-xs text-muted-foreground">2 ชม. • 07:00</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[32px] border border-white/70 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl p-8 md:p-12 text-center shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-papaya/20 via-white/60 to-sky/15 opacity-90" />
            <div className="relative">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-papaya/20 flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-papaya" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
                ทำไมต้องใช้ Baby Tracker?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed max-w-2xl mx-auto">
                การดูแลลูกน้อยต้องใส่ใจทุกรายละเอียด Baby Tracker ช่วยให้คุณจดบันทึกเป็นระบบ
                ดูพัฒนาการย้อนหลังง่าย และพร้อมใช้งานเมื่อต้องพบแพทย์
              </p>

              <Button
                onClick={() => navigate('/app')}
                size="lg"
                className="bg-saguaro hover:bg-saguaro/90 text-white font-bold text-lg px-8 py-6 rounded-2xl shadow-glow-saguaro transition-all"
              >
                เริ่มใช้งานฟรี
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/70 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-papaya/70 flex items-center justify-center overflow-hidden shadow-glow-primary">
              <BabyCareLogo size="sm" />
            </div>
            <span className="font-bold text-foreground">Baby Tracker</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Baby Tracker. ออกแบบด้วยความรักสำหรับคุณพ่อคุณแม่ทุกคน 💕
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
