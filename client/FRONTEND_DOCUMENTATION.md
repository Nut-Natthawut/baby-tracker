# 📘 เอกสารอธิบาย Frontend - Baby Care App

## 📁 โครงสร้างโปรเจค

```
src/
├── components/          # คอมโพเนนต์ทั้งหมด
│   ├── baby/           # คอมโพเนนต์เกี่ยวกับเบบี้
│   └── ui/             # คอมโพเนนต์ UI พื้นฐาน (Shadcn)
├── hooks/              # Custom hooks
├── lib/                # ฟังก์ชันช่วยเหลือ
├── pages/              # หน้าต่างๆ
├── types/              # TypeScript types
└── index.css           # Styles หลัก
```

---

## 📄 ไฟล์หลัก

### `src/main.tsx`

- จุดเริ่มต้นของแอป
- ตั้งค่า React Router และ Theme Provider

### `src/App.tsx`

- กำหนด Routes ทั้งหมด
- `/` → LandingPage (หน้าแรก)
- `/app` → Index (หน้าหลักจัดการเบบี้)

### `src/index.css`

- ธีมสีทั้งหมด (CSS Variables)
- สี primary, secondary, background, foreground
- รองรับ Dark mode และ Light mode

---

## 📱 หน้าต่างๆ (Pages)

### `src/pages/Index.tsx`

**หน้าหลักของแอป** - จัดการทุกอย่างเกี่ยวกับเบบี้

**ฟีเจอร์:**

- แสดง Header พร้อมโปรไฟล์เบบี้
- แสดงสถิติสรุป (StatsOverview)
- แสดง Timeline การบันทึก
- มี FAB Menu สำหรับเพิ่มบันทึก
- จัดการ Modal ต่างๆ (Feeding, Diaper, Pumping, Settings)

**State ที่จัดการ:**

- `showFeedingModal` - แสดง Modal ให้นม
- `showDiaperModal` - แสดง Modal เปลี่ยนผ้าอ้อม
- `showPumpingModal` - แสดง Modal ปั๊มนม
- `showSettingsModal` - แสดง Modal ตั้งค่า
- `showBabyProfileModal` - แสดง Modal โปรไฟล์เบบี้
- `showCaregiversModal` - แสดง Modal ผู้ดูแล
- `showDashboardModal` - แสดง Modal แดชบอร์ด
- `editingBabyId` - ID ของเบบี้ที่กำลังแก้ไข

### `src/pages/LandingPage.tsx`

**หน้าแนะนำแอป** - หน้าแรกก่อนเข้าใช้งาน

**ฟีเจอร์:**

- แสดง Logo และชื่อแอป
- ปุ่ม "เริ่มต้นใช้งาน" นำไปหน้า /app

### `src/pages/NotFound.tsx`

**หน้า 404** - แสดงเมื่อหาหน้าไม่เจอ

---

## 🧩 คอมโพเนนต์ Baby (`src/components/baby/`)

### `Header.tsx`

**ส่วนหัวของแอป**

**แสดง:**

- ปุ่มสลับธีม (ThemeToggle)
- BabySwitcher - เลือกเบบี้
- ปุ่มตั้งค่า
- CuteBabyAvatar - รูปเบบี้

**Props:**

- `baby` - ข้อมูลเบบี้ปัจจุบัน
- `babies` - รายการเบบี้ทั้งหมด
- `onSwitchBaby` - ฟังก์ชันสลับเบบี้
- `onAddBaby` - ฟังก์ชันเพิ่มเบบี้
- `onEditBaby` - ฟังก์ชันแก้ไขเบบี้
- `onOpenSettings` - ฟังก์ชันเปิดตั้งค่า

### `BabySwitcher.tsx`

**Dropdown เลือกเบบี้**

**ฟีเจอร์:**

- แสดงรายการเบบี้ทั้งหมด
- เลือกเบบี้เพื่อสลับ
- ปุ่มเพิ่มเบบี้ใหม่
- Animation แบบ Framer Motion

### `BabyAvatar.tsx` / `CuteBabyAvatar.tsx`

**แสดงรูป Avatar ของเบบี้**

**แสดง:**

- ไอคอนเบบี้น่ารักตามเพศ (ชาย/หญิง)
- สีพื้นหลังต่างกันตามเพศ

### `BabyCareLogo.tsx`

**โลโก้แอป**

### `BabyProfileModal.tsx`

**Modal แก้ไข/เพิ่มโปรไฟล์เบบี้**

**ฟอร์ม:**

- ชื่อเบบี้
- วันเกิด
- เพศ (ชาย/หญิง)

**ฟังก์ชัน:**

- บันทึกโปรไฟล์ใหม่
- อัปเดตโปรไฟล์เดิม

### `StatsOverview.tsx`

**แสดงสถิติสรุป**

**แสดงข้อมูล:**

- การให้นมครั้งล่าสุด + เวลาที่ผ่านมา
- การเปลี่ยนผ้าอ้อมครั้งล่าสุด
- การปั๊มนมครั้งล่าสุด + ปริมาณรวม
- คำนวณระยะเวลาที่ผ่านมาอัตโนมัติ

### `TimelineSection.tsx`

**แสดง Timeline การบันทึกทั้งหมด**

**ฟีเจอร์:**

- แสดงบันทึกเรียงตามเวลา (ล่าสุดก่อน)
- ไอคอนและสีต่างกันตามประเภท
- รองรับ 3 ประเภท: feeding, diaper, pumping
- แสดงรายละเอียดตามประเภท
- คลิกเพื่อดูรายละเอียด

### `FabMenu.tsx`

**Floating Action Button Menu**

**ฟีเจอร์:**

- ปุ่มลอย + ที่มุมขวาล่าง
- กดแล้วแสดงเมนู 3 อย่าง:
  - 🍼 ให้นม (Feeding)
  - 🧷 เปลี่ยนผ้าอ้อม (Diaper)
  - 🥛 ปั๊มนม (Pumping)
- Animation เปิด/ปิดสวยงาม

### `FeedingModal.tsx`

**Modal บันทึกการให้นม**

**ฟอร์ม:**

- ประเภท: นมแม่ / นมผสม / อาหาร
- ปริมาณ (ml) - ใช้ numpad
- เวลา (ปรับได้)
- หมายเหตุ

**ฟีเจอร์:**

- Numpad สำหรับกรอกปริมาณ
- ปุ่ม C ล้างค่า, ปุ่ม ⌫ ลบทีละตัว

### `DiaperModal.tsx`

**Modal บันทึกการเปลี่ยนผ้าอ้อม**

**ฟอร์ม:**

- สถานะ: สะอาด / ฉี่ / อึ / ทั้งสอง
- เวลา (ปรับได้)
- หมายเหตุ

**ฟีเจอร์:**

- เลือกสถานะด้วยปุ่มภาพ
- สีต่างกันตามสถานะ

### `PumpingModal.tsx`

**Modal บันทึกการปั๊มนม**

**ฟอร์ม:**

- ปริมาณซ้าย (ml) - พิมพ์ได้
- ปริมาณขวา (ml) - พิมพ์ได้
- เวลา (ปรับได้)
- หมายเหตุ

**ฟีเจอร์:**

- แสดงยอดรวมอัตโนมัติ
- Input แยกซ้าย-ขวา

### `LogDetailModal.tsx`

**Modal แสดงรายละเอียดบันทึก**

**แสดง:**

- ประเภทบันทึก
- เวลา
- รายละเอียดตามประเภท
- ปุ่มลบบันทึก

### `SettingsModal.tsx`

**Modal ตั้งค่า**

**ฟีเจอร์:**

- จัดการโปรไฟล์เบบี้
- จัดการผู้ดูแล
- ดูแดชบอร์ดสถิติ
- ล้างข้อมูลทั้งหมด

### `CaregiversModal.tsx`

**Modal จัดการผู้ดูแล**

**ฟีเจอร์:**

- เพิ่มผู้ดูแลใหม่
- แสดงรายการผู้ดูแล
- ลบผู้ดูแล

### `DashboardModal.tsx`

**Modal แดชบอร์ดสถิติ**

**แสดง:**

- สรุปสถิติการดูแลเบบี้
- กราฟหรือตัวเลขสรุป

### `ThemeToggle.tsx`

**ปุ่มสลับธีม**

**ฟีเจอร์:**

- สลับระหว่าง Light/Dark mode
- ไอคอน Sun/Moon

---

## 🔧 Hooks (`src/hooks/`)

### `useBabyData.ts`

**Hook หลักจัดการข้อมูลเบบี้**

**State:**

- `babies` - รายการเบบี้ทั้งหมด
- `currentBabyId` - ID เบบี้ที่เลือก
- `logs` - บันทึกทั้งหมด
- `loading` - สถานะโหลด

**ฟังก์ชัน:**

- `saveBabyProfile()` - บันทึก/แก้ไขโปรไฟล์เบบี้
- `switchBaby()` - สลับเบบี้
- `deleteBaby()` - ลบเบบี้
- `addLog()` - เพิ่มบันทึก
- `deleteLog()` - ลบบันทึก
- `getLogsByType()` - ดึงบันทึกตามประเภท
- `getRecentLog()` - ดึงบันทึกล่าสุด
- `clearData()` - ล้างข้อมูลทั้งหมด

**เก็บข้อมูล:**

- ใช้ localStorage
- Key: `babies`, `currentBabyId`, `baby_logs`

### `use-mobile.tsx`

**ตรวจสอบขนาดหน้าจอ**

- `isMobile` - true ถ้าหน้าจอเล็กกว่า 768px

### `use-toast.ts`

**จัดการ Toast notifications**

---

## 🛠 Utilities (`src/lib/`)

### `babyUtils.ts`

**ฟังก์ชันช่วยเหลือเกี่ยวกับเบบี้**

**ฟังก์ชัน:**

- `calculateAge()` - คำนวณอายุจากวันเกิด
- `formatTimeAgo()` - แปลงเป็น "X นาทีที่แล้ว"
- `formatDate()` - จัดรูปแบบวันที่

### `utils.ts`

**ฟังก์ชันทั่วไป**

- `cn()` - รวม className (ใช้ tailwind-merge)

---

## 📝 Types (`src/types/`)

### `baby.ts`

**TypeScript Types**

```typescript
// ข้อมูลเบบี้
interface Baby {
  id: string
  name: string
  birthDate: Date
  gender: 'male' | 'female'
}

// ประเภทบันทึก
type LogType = 'feeding' | 'diaper' | 'pumping'

// สถานะผ้าอ้อม
type DiaperStatus = 'clean' | 'pee' | 'poo' | 'mixed'

// บันทึก
interface LogEntry {
  id: string
  babyId: string
  type: LogType
  timestamp: Date
  details: FeedingDetails | DiaperDetails | PumpingDetails
}
```

---

## 🎨 UI Components (`src/components/ui/`)

คอมโพเนนต์จาก **Shadcn/ui** ที่ใช้:

| Component         | ใช้ทำอะไร             |
| ----------------- | --------------------- |
| `button.tsx`      | ปุ่มทุกที่            |
| `dialog.tsx`      | Modal popup           |
| `drawer.tsx`      | Drawer จากล่าง        |
| `input.tsx`       | ช่องกรอกข้อมูล        |
| `label.tsx`       | ป้ายกำกับ             |
| `textarea.tsx`    | ช่องข้อความหลายบรรทัด |
| `toast.tsx`       | แจ้งเตือน             |
| `card.tsx`        | กล่องข้อมูล           |
| `avatar.tsx`      | รูปโปรไฟล์            |
| `badge.tsx`       | ป้ายสถานะ             |
| `scroll-area.tsx` | พื้นที่เลื่อน         |
| `separator.tsx`   | เส้นแบ่ง              |

---

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Index.tsx (หน้าหลัก)                  │
│                           │                              │
│                    useBabyData()                        │
│                    ↓                                     │
│    ┌──────────────────────────────────────────┐         │
│    │           localStorage                    │         │
│    │  - babies (รายการเบบี้)                   │         │
│    │  - currentBabyId (เบบี้ที่เลือก)           │         │
│    │  - baby_logs (บันทึกทั้งหมด)              │         │
│    └──────────────────────────────────────────┘         │
│                           │                              │
│    ┌─────────┬─────────┬─────────┬─────────┐           │
│    │ Header  │ Stats   │Timeline │ FAB     │           │
│    │         │ Overview│ Section │ Menu    │           │
│    └─────────┴─────────┴─────────┴─────────┘           │
│                           │                              │
│    ┌─────────────────────────────────────────┐          │
│    │              Modals                      │          │
│    │  - FeedingModal   - DiaperModal         │          │
│    │  - PumpingModal   - SettingsModal       │          │
│    │  - BabyProfileModal                      │          │
│    └─────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 การใช้งานหลัก

1. **เพิ่มเบบี้** → Header → BabySwitcher → "+ เพิ่มเบบี้" → BabyProfileModal
2. **บันทึกการให้นม** → FAB Menu → 🍼 → FeedingModal
3. **บันทึกผ้าอ้อม** → FAB Menu → 🧷 → DiaperModal
4. **บันทึกปั๊มนม** → FAB Menu → 🥛 → PumpingModal
5. **ดูประวัติ** → TimelineSection → คลิกบันทึก → LogDetailModal
6. **สลับเบบี้** → Header → BabySwitcher → เลือกเบบี้
7. **ตั้งค่า** → Header → ⚙️ → SettingsModal

---

## 📦 Dependencies หลัก

- **React** - UI Framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **date-fns** - จัดการวันที่
- **Shadcn/ui** - UI Components
- **React Router** - Routing

---
