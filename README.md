# PLC Software Management Dashboard (Next.js)

แดชบอร์ดสำหรับจัดการซอฟต์แวร์ PLC — แปลงจากดีไซน์ HTML/Tailwind เดิม มาเป็นโปรเจกต์ Next.js (App Router + TypeScript)

## โครงสร้างโปรเจกต์

```
plc-dashboard/
├── app/
│   ├── layout.tsx      # Root layout, โหลดฟอนต์ + global styles
│   ├── page.tsx        # หน้าแดชบอร์ดหลัก
│   └── globals.css      # Tailwind + สไตล์ทั่วไป
├── components/
│   ├── TopNavBar.tsx
│   ├── SideNavBar.tsx
│   ├── MetricCard.tsx
│   ├── RecentActivity.tsx
│   └── SystemHealth.tsx
├── tailwind.config.js   # โทเค็นสี/สเปซซิ่ง/ฟอนต์ ตามดีไซน์เดิม
└── package.json
```

## วิธีติดตั้งและรัน

ต้องมี Node.js 18.17 ขึ้นไป

```bash
npm install
npm run dev
```

แล้วเปิด http://localhost:3000

## หมายเหตุ

- ทุก component เป็น server component ยกเว้น `SideNavBar` ซึ่งใช้ `"use client"` เพราะมี event handler
- ข้อมูลตัวเลขในการ์ด (จำนวนเครื่องจักร, ไฟล์, พื้นที่จัดเก็บ ฯลฯ) เป็น mock data ที่ hardcode ไว้ใน `app/page.tsx` — เชื่อมต่อกับ API จริงได้โดยแก้ตรงนี้เป็น fetch จากฐานข้อมูล/backend ของคุณ
- ตาราง "ความเคลื่อนไหวล่าสุด" (`RecentActivity`) รับ prop `rows` เป็น array — ตอนนี้ปล่อยว่างไว้ (แสดง empty state) ส่งข้อมูลจริงเข้าไปได้ตามรูปแบบ `ActivityRow`
- ไอคอนใช้ Material Symbols Outlined (โหลดผ่าน Google Fonts ใน `globals.css`)
