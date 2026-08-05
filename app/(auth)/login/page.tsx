"use client";

import { useState, useTransition } from "react";
import { loginAdmin } from "./actions";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }

    startTransition(async () => {
      const result = await loginAdmin({ username: username.trim(), password: password.trim() });
      if (result.success) {
        // Redirect to dashboard (handled client-side by window redirection to force middleware context refresh)
        window.location.href = "/dashboard";
      } else {
        setError(result.error || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-container-lowest via-surface-container-low to-primary/5 p-6">
      <div className="w-full max-w-[420px] bg-white border border-outline-variant rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
        
        {/* Decorative subtle background shapes */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none" />

        <div className="flex flex-col items-center mb-8 relative">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4 shadow-inner">
            <span className="material-symbols-outlined text-[36px] font-bold">
              admin_panel_settings
            </span>
          </div>
          <h1 className="font-headline-md text-headline-md text-on-surface">
            ผู้ดูแลระบบ
          </h1>
          <p className="text-body-md text-on-surface-variant text-center mt-1">
            ลงชื่อเข้าใช้งานแดชบอร์ดจัดการซอฟต์แวร์ PLC
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-2xl border border-error/20 flex gap-2 items-center animate-fade-in">
            <span className="material-symbols-outlined text-error text-[20px]">
              error
            </span>
            <span className="text-body-md font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 relative">
          <Input
            label="ชื่อผู้ใช้ (Username)"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="กรอกชื่อผู้ใช้..."
            disabled={isPending}
            className="w-full"
          />

          <Input
            type="password"
            label="รหัสผ่าน (Password)"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="กรอกรหัสผ่าน..."
            disabled={isPending}
            className="w-full"
          />

          <div className="pt-2 flex flex-col gap-2">
            <Button
              type="submit"
              variant="primary"
              loading={isPending}
              className="w-full py-3.5 rounded-xl shadow-md text-label-lg font-bold"
            >
              เข้าสู่ระบบ
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => window.location.href = "/dashboard"}
              className="w-full py-3.5 rounded-xl text-label-lg font-bold border-outline hover:bg-surface-container-low"
            >
              ยกเลิก
            </Button>
          </div>
        </form>

        <div className="mt-8 text-center text-label-md text-on-surface-variant/80 border-t border-outline-variant pt-6 relative">
          ระบบควบคุมความปลอดภัยแดชบอร์ดอัตโนมัติ
        </div>
      </div>
    </div>
  );
}
