"use client";

import { useEffect, useState } from "react";
import { checkAdminSession } from "@/app/(auth)/login/actions";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAdminSession().then(setIsLoggedIn);
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 bg-surface border-b border-outline-variant flex justify-between items-center h-16 px-6 bg-white shadow-sm">
      <div className="flex items-center gap-4">
        <span className="font-headline-sm text-headline-sm font-bold text-primary">
          PLC Software Management
        </span>
      </div>
      <div className="flex items-center gap-3">
        {isLoggedIn ? (
          <div className="flex items-center gap-2 bg-primary/10 text-primary px-3.5 py-1.5 rounded-full text-label-md font-bold shadow-sm">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            <span>สิทธิ์ผู้ดูแลระบบ (Admin)</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-surface-container-high text-on-surface-variant px-3.5 py-1.5 rounded-full text-label-md font-bold">
            <span className="material-symbols-outlined text-[18px]">account_circle</span>
            <span>ผู้ใช้งานทั่วไป (Guest)</span>
          </div>
        )}
      </div>
    </header>
  );
}
