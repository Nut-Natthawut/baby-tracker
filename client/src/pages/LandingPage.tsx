import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Baby, Droplets, Moon, Heart, BarChart3, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Baby className="w-8 h-8" />,
      title: "บันทึกการกินนม",
      description: "ติดตามปริมาณนมและเวลาให้นมอย่างละเอียด",
      color: "bg-feeding/20 text-feeding",
    },
    {
      icon: <Droplets className="w-8 h-8" />,
      title: "บันทึกผ้าอ้อม",
      description: "บันทึกลักษณะและสีเพื่อติดตามสุขภาพ",
      color: "bg-diaper/20 text-diaper",
    },
    {
      icon: <Moon className="w-8 h-8" />,
      title: "บันทึกการนอน",
      description: "ติดตามรูปแบบการนอนของลูกน้อย",
      color: "bg-sleep/20 text-sleep",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "สถิติและรายงาน",
      description: "ดูสรุปรายวันและรายเดือนอย่างง่าย",
      color: "bg-mint/20 text-mint",
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-gradient-to-b from-peach-light to-background overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-peach/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-mint/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        {/* Wave decoration */}
        <div className="absolute top-0 left-0 right-0 h-32 overflow-hidden">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full opacity-30">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" className="fill-peach/40" />
          </svg>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-6 left-6 flex items-center gap-2"
        >
          <div className="w-10 h-10 rounded-xl bg-peach flex items-center justify-center overflow-hidden">
            <BabyCareLogo size="sm" />
          </div>
          <span className="font-bold text-xl text-foreground">Baby Care</span>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="w-32 h-32 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-peach/30 rounded-full animate-pulse" />
              <div className="relative w-full h-full rounded-full bg-gradient-to-br from-peach to-peach/70 flex items-center justify-center shadow-lg overflow-hidden">
                <BabyCareLogo size="xl" />
              </div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-extrabold text-foreground mb-4"
          >
            <span className="text-peach">Baby</span> Care
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-muted-foreground mb-3 font-medium"
          >
            ช่วยดูแล ประเมิน และติดตามพัฒนาการ
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl md:text-3xl font-bold text-mint mb-8"
          >
            ลูกน้อยของคุณ
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={() => navigate('/app')}
              size="lg"
              className="bg-peach hover:bg-peach/90 text-white font-bold text-lg px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              เริ่มใช้งานเลย
            </Button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-6 h-10 rounded-full border-2 border-peach/50 flex items-start justify-center p-2"
          >
            <div className="w-1.5 h-3 bg-peach rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              ฟีเจอร์หลัก
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              เครื่องมือครบครันสำหรับคุณพ่อคุณแม่ในการดูแลลูกน้อย
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
                className="bg-card border border-border rounded-3xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* App Preview Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-mint-light/50 to-background overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                บันทึกง่าย ดูสรุปได้ทันที
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                แอปพลิเคชันที่ออกแบบมาเพื่อคุณพ่อคุณแม่โดยเฉพาะ 
                ใช้งานง่าย บันทึกข้อมูลได้รวดเร็ว ดูสถิติและประวัติย้อนหลังได้ทันที
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-peach/20 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-peach" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">บันทึกรวดเร็ว</h4>
                    <p className="text-sm text-muted-foreground">แตะครั้งเดียวเพื่อบันทึก</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-mint/20 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-mint" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">ดูสถิติได้ทันที</h4>
                    <p className="text-sm text-muted-foreground">สรุปรายวันและรายเดือน</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-sleep/20 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-sleep" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">ข้อมูลปลอดภัย</h4>
                    <p className="text-sm text-muted-foreground">เก็บข้อมูลในเครื่องของคุณ</p>
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
              {/* Phone mockup */}
              <div className="relative mx-auto w-64 md:w-80">
                <div className="absolute inset-0 bg-peach/20 rounded-[3rem] blur-2xl transform rotate-6" />
                <div className="relative bg-foreground rounded-[2.5rem] p-3 shadow-2xl">
                  <div className="bg-background rounded-[2rem] overflow-hidden aspect-[9/19]">
                    <div className="p-4 h-full flex flex-col">
                      <div className="text-center mb-4">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-peach-light flex items-center justify-center mb-2 overflow-hidden">
                          <BabyCareLogo size="lg" />
                        </div>
                        <p className="font-bold text-foreground">น้องมีนา</p>
                        <p className="text-xs text-muted-foreground">อายุ 3 เดือน</p>
                      </div>
                      
                      <div className="space-y-2 flex-1">
                        <div className="bg-feeding/10 p-3 rounded-xl flex items-center gap-3">
                          <div className="w-10 h-10 bg-feeding/20 rounded-lg flex items-center justify-center text-xl">🍼</div>
                          <div>
                            <p className="font-medium text-sm text-foreground">ให้นม</p>
                            <p className="text-xs text-muted-foreground">150ml • 10:30</p>
                          </div>
                        </div>
                        <div className="bg-diaper/10 p-3 rounded-xl flex items-center gap-3">
                          <div className="w-10 h-10 bg-diaper/20 rounded-lg flex items-center justify-center text-xl">👶</div>
                          <div>
                            <p className="font-medium text-sm text-foreground">เปลี่ยนผ้าอ้อม</p>
                            <p className="text-xs text-muted-foreground">ฉี่ + อึ • 09:15</p>
                          </div>
                        </div>
                        <div className="bg-sleep/10 p-3 rounded-xl flex items-center gap-3">
                          <div className="w-10 h-10 bg-sleep/20 rounded-lg flex items-center justify-center text-xl">😴</div>
                          <div>
                            <p className="font-medium text-sm text-foreground">นอนหลับ</p>
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
      <section className="py-20 px-6 bg-peach-light/30">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Heart className="w-16 h-16 mx-auto text-peach mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              ทำไมต้องใช้ Baby Care?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed max-w-2xl mx-auto">
              การดูแลลูกน้อยต้องใส่ใจทุกรายละเอียด Baby Care ช่วยให้คุณจดบันทึกได้อย่างเป็นระบบ 
              ติดตามพัฒนาการได้ง่าย และมีข้อมูลพร้อมเมื่อต้องพบแพทย์
            </p>
            
            <Button
              onClick={() => navigate('/app')}
              size="lg"
              className="bg-mint hover:bg-mint/90 text-white font-bold text-lg px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              เริ่มใช้งานฟรี
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-background border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-peach flex items-center justify-center overflow-hidden">
              <BabyCareLogo size="sm" />
            </div>
            <span className="font-bold text-foreground">Baby Care</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Baby Care. ออกแบบด้วยความรักสำหรับคุณพ่อคุณแม่ทุกคน 💕
          </p>
        </div>
      </footer>
    </div>
  );
};

// Import the new logo component
import BabyCareLogo from '@/components/baby/BabyCareLogo';

export default LandingPage;
