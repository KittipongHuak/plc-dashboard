"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumb() {
  const pathname = usePathname();
  
  // ไม่แสดงในหน้า Dashboard หลัก
  if (pathname === "/" || pathname === "/dashboard") return null;

  const paths = pathname.split("/").filter(Boolean);

  const routeNames: Record<string, string> = {
    dashboard: "แดชบอร์ดหลัก",
    upload: "อัปโหลดไฟล์ซอฟต์แวร์",
    machines: "รายการเครื่องจักร",
    report: "รายงานสรุป",
    settings: "ตั้งค่าระบบ",
    versions: "เวอร์ชันย้อนหลัง",
    history: "ประวัติการทำงาน"
  };

  return (
    <div className="flex items-center gap-2 text-label-md text-on-surface-variant font-label-md mb-4 select-none">
      <Link href="/dashboard" className="hover:text-primary transition-all">
        แดชบอร์ดหลัก
      </Link>
      {paths.map((p, idx) => {
        // ข้ามคำว่า dashboard ใน breadcrumbs เพราะแสดง แดชบอร์ดหลัก ไว้ด้านหน้าสุดแล้ว
        if (p === "dashboard") return null;
        
        const url = `/${paths.slice(0, idx + 1).join("/")}`;
        const label = routeNames[p] || p;
        const isLast = idx === paths.length - 1;

        return (
          <div key={p} className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">
              chevron_right
            </span>
            {isLast ? (
              <span className="text-primary font-semibold">{label}</span>
            ) : (
              <Link href={url} className="hover:text-primary transition-all">
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
