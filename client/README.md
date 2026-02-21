# 👶 Baby Tracker — บันทึกการดูแลลูกน้อย

> ระบบบันทึกการดูแลทารกแบบครบวงจร สำหรับพ่อแม่และผู้ดูแล พร้อมระบบเชิญผู้ดูแลร่วมและสรุปสถิติอัตโนมัติ

[![Deploy](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://baby-tracker-ten-sand.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Cloudflare%20Workers-F38020?logo=cloudflare)](https://workers.cloudflare.com)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)](https://github.com/Nut-Natthawut/baby-tracker/actions)
[![GitLab Mirror](https://img.shields.io/badge/Mirror-GitLab-FC6D26?logo=gitlab)](https://gitlab.com/baby_tracker/baby_tracker)

---

## ✨ Features

| ฟีเจอร์ | รายละเอียด |
|---------|-----------|
| 🍼 บันทึกการกินนม | รองรับทั้งนมแม่และนมผง พร้อมบันทึกปริมาณ |
| 🧷 บันทึกการเปลี่ยนผ้าอ้อม | บันทึกประเภทและเวลา |
| 😴 บันทึกเวลานอน | จับเวลาการนอนและสรุปชั่วโมงนอน |
| 📊 สถิติและสรุปข้อมูล | Dashboard แสดงข้อมูลแบบ Visual |
| 👨‍👩‍👧 ระบบผู้ดูแลร่วม | เชิญผู้ดูแลคนอื่นเข้ามาดูแลร่วมกัน |
| 🔐 ระบบยืนยันตัวตน | JWT Authentication พร้อม Refresh Token |

---

## 🛠️ Tech Stack

### Frontend
- ⚛️ **React** + **TypeScript** — UI Library
- ⚡ **Vite** — Build Tool
- 🎨 **Tailwind CSS** + **shadcn/ui** — Styling & Components

### Backend
- 🔥 **Hono** — Web Framework (Edge-first)
- ☁️ **Cloudflare Workers** — Serverless Runtime
- 🗃️ **Drizzle ORM** + **Cloudflare D1** — Database (SQLite)

### DevOps
- 🚀 **Vercel** — Frontend Deployment
- 🔄 **GitHub Actions** — CI/CD Pipeline
- 🦊 **GitLab CI/CD** — Mirror + Deploy Pipeline

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/Nut-Natthawut/baby-tracker.git
cd baby-tracker/client

# Install dependencies
npm install

# Run development server
npm run dev
```

### Environment Variables

สร้างไฟล์ `.env` ใน folder `client/`:

```env
VITE_API_URL=https://your-backend-api-url.workers.dev
```

---

## 📦 Build & Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📁 Project Structure

```
baby-tracker/
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # UI Components
│   │   ├── context/        # React Context (Auth, etc.)
│   │   ├── hooks/          # Custom Hooks
│   │   └── pages/          # Page Components
│   └── public/             # Static Assets
├── server/                 # Backend (Hono + Cloudflare Workers)
│   ├── src/
│   │   ├── db/             # Database Schema (Drizzle)
│   │   └── routes/         # API Routes
│   └── drizzle/            # DB Migrations
├── .github/workflows/      # GitHub Actions CI/CD
└── .gitlab-ci.yml          # GitLab CI/CD Pipeline
```

---

## 👥 Contributors

- **Nut-Natthawut** — Full Stack Developer

---

## 📄 License

This project is developed as part of a university coursework (DevOps).
