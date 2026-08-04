"use client";

import { useState, useTransition } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { saveSettings } from "@/app/(dashboard)/settings/actions";

interface SettingsFormProps {
  initialSettings: {
    allowed_extensions: string;
    max_file_size_mb: string;
  };
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [allowedExtensions, setAllowedExtensions] = useState(initialSettings.allowed_extensions);
  const [maxFileSizeMb, setMaxFileSizeMb] = useState(initialSettings.max_file_size_mb);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await saveSettings({
        allowed_extensions: allowedExtensions,
        max_file_size_mb: maxFileSizeMb,
      });

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    });
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm max-w-2xl">
      <h2 className="font-title-lg text-title-lg text-on-surface mb-2 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-[24px]">
          settings_suggest
        </span>
        ตั้งค่าพารามิเตอร์การอัปโหลดไฟล์
      </h2>
      <p className="text-body-md text-on-surface-variant mb-6 border-b border-outline-variant pb-4">
        กำหนดประเภทชนิดไฟล์ (นามสกุลไฟล์) และขนาดไฟล์สูงสุดที่ระบบยินยอมให้อัปโหลดเข้าฐานข้อมูล
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ข้อความแจ้งเตือนสำเร็จ */}
        {success && (
          <div className="p-4 bg-tertiary-container text-on-tertiary-container rounded-xl border border-tertiary/20 flex gap-3 items-center">
            <span className="material-symbols-outlined text-tertiary text-[20px]">
              check_circle
            </span>
            <span className="text-body-md font-semibold">บันทึกการตั้งค่าอัปโหลดสำเร็จเรียบร้อย!</span>
          </div>
        )}

        {/* ข้อความแจ้งเตือนความผิดพลาด */}
        {error && (
          <div className="p-4 bg-error-container text-on-error-container rounded-xl border border-error/20 flex gap-3 items-center">
            <span className="material-symbols-outlined text-error text-[20px]">
              error
            </span>
            <span className="text-body-md font-semibold">{error}</span>
          </div>
        )}

        {/* ฟิลด์กรอกนามสกุลไฟล์ */}
        <Input
          label="ประเภทนามสกุลไฟล์ที่อนุญาตให้อัปโหลด"
          required
          value={allowedExtensions}
          onChange={(e) => setAllowedExtensions(e.target.value)}
          placeholder="เช่น .hex, .bin, .sys, .txt (คั่นแต่ละนามสกุลด้วยเครื่องหมายลูกน้ำ)"
          helperText="ป้อนค่านามสกุลไฟล์แต่ละประเภทคั่นด้วยสัญลักษณ์คอมมา (,) เช่น: .hex,.bin,.sys"
          disabled={isPending}
        />

        {/* ฟิลด์กรอกขนาดสูงสุด */}
        <Input
          label="ขนาดไฟล์สูงสุดที่ระบบอนุญาต (MB)"
          required
          type="number"
          min="1"
          value={maxFileSizeMb}
          onChange={(e) => setMaxFileSizeMb(e.target.value)}
          placeholder="เช่น 50"
          helperText="กำหนดขนาดขนาดไฟล์สูงสุดในหน่วยเมกะไบต์ (Megabytes)"
          disabled={isPending}
        />

        {/* ปุ่มบันทึกการตั้งค่า */}
        <div className="flex justify-end pt-2 border-t border-outline-variant">
          <Button
            type="submit"
            variant="primary"
            icon="save"
            loading={isPending}
          >
            บันทึกการตั้งค่า
          </Button>
        </div>
      </form>
    </div>
  );
}
