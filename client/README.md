# Baby Tracker - บันทึกการดูแลลูกน้อย

ระบบบันทึกการดูแลทารก การกินนม การเปลี่ยนผ้าอ้อม และการนอน สำหรับพ่อแม่และผู้ดูแล

## Features

- 📝 บันทึกการกินนม (นมแม่ / นมผง)
- 🧷 บันทึกการเปลี่ยนผ้าอ้อม
- 😴 บันทึกเวลานอน
- 📊 ดูสถิติและสรุปข้อมูล
- 👨‍👩‍👧 ระบบเชิญผู้ดูแลร่วม

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Hono + Cloudflare Workers + Drizzle ORM
- **Database**: Cloudflare D1 (SQLite)
- **Deployment**: Vercel (Frontend) + Cloudflare Workers (Backend)
- **CI/CD**: GitHub Actions + GitLab CI/CD

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Environment Variables

สร้างไฟล์ `.env` โดยกำหนดค่าต่อไปนี้:

```env
VITE_API_URL=<backend_api_url>
```

## Build

```bash
npm run build
```
