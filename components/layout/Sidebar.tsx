"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", icon: "dashboard", href: "/dashboard" },
  { label: "Machine List", icon: "precision_manufacturing", href: "/machines" },
  { label: "Upload", icon: "cloud_upload", href: "/upload" },
  { label: "Manage Files", icon: "folder_open", href: "/files" },
  { label: "Category List", icon: "category", href: "/categories" },
  { label: "Report", icon: "assessment", href: "/report" },
  { label: "Settings", icon: "settings", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (itemHref: string) => {
    if (itemHref === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/";
    }
    return pathname.startsWith(itemHref);
  };

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-[280px] bg-surface-container-low border-r border-outline-variant flex flex-col py-4 gap-1">
      <div className="px-6 mb-6">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[32px]">
            settings_input_component
          </span>
          <div>
            <h2 className="font-headline-md text-[18px] font-bold text-on-surface">
              PLC Manager
            </h2>
            <p className="text-label-md font-label-md text-on-surface-variant">
              v1.0.0-stable
            </p>
          </div>
        </div>
      </div>
      <nav className="flex-grow overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          
          const linkClass = active
            ? "bg-primary-container text-on-primary-container rounded-full mx-2 px-4 py-3 flex items-center gap-3 transition-all cursor-pointer"
            : "text-on-surface-variant mx-2 px-4 py-3 flex items-center gap-3 hover:bg-surface-container-highest rounded-full transition-all cursor-pointer";

          const iconClass = active
            ? "material-symbols-outlined filled"
            : "material-symbols-outlined";

          return (
            <Link key={item.label} href={item.href} className={linkClass}>
              <span className={iconClass}>{item.icon}</span>
              <span className="font-label-md text-label-md">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-4 mt-auto border-t border-outline-variant">
        <Link href="/upload" className="w-full bg-primary text-on-primary rounded-full py-3 flex items-center justify-center gap-2 font-label-md text-label-md shadow-sm hover:bg-primary/90 transition-all">
          <span className="material-symbols-outlined">add</span>
          <span>สร้างโปรเจกต์ใหม่</span>
        </Link>
      </div>
    </aside>
  );
}
