"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import MachineForm from "./MachineForm";
import { createMachine } from "@/app/(dashboard)/machines/actions";

export default function AddMachineButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleOpen = () => {
    setError(null);
    setSuccess(false);
    setIsOpen(true);
  };

  const handleClose = () => {
    if (isPending) return;
    setIsOpen(false);
  };

  const handleSubmit = (data: { id: string; name: string; description: string }) => {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await createMachine(data);
      if (result.success) {
        setSuccess(true);
        // รีเฟรชหน้าเพื่ออัปเดตตารางเครื่องจักร
        router.refresh();
        // ปิดหน้าต่างหลังจากสำเร็จใน 1 วินาที
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
        }, 1200);
      } else {
        setError(result.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    });
  };

  return (
    <>
      {/* ปุ่มเพิ่มเครื่องจักรหลัก */}
      <Button
        variant="primary"
        icon="add"
        onClick={handleOpen}
        className="shadow-sm"
      >
        เพิ่มเครื่องจักร
      </Button>

      {/* หน้าต่างป๊อปอัปกรอกฟอร์ม */}
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="ลงทะเบียนเครื่องจักรใหม่"
        footerActions={null} // ซ่อน footer ดั้งเดิมของ Modal เพราะฟอร์มมีปุ่ม submit ของตัวเองอยู่แล้ว
      >
        <div className="space-y-4">
          {/* แจ้งเตือนสำเร็จ */}
          {success && (
            <div className="p-4 bg-tertiary-container text-on-tertiary-container rounded-xl border border-tertiary/20 flex gap-2 items-center">
              <span className="material-symbols-outlined text-tertiary text-[20px]">
                check_circle
              </span>
              <span className="text-body-md font-semibold">ลงทะเบียนเครื่องจักรสำเร็จ!</span>
            </div>
          )}

          {/* แจ้งเตือนเกิดข้อผิดพลาด */}
          {error && (
            <div className="p-4 bg-error-container text-on-error-container rounded-xl border border-error/20 flex gap-2 items-center">
              <span className="material-symbols-outlined text-error text-[20px]">
                error
              </span>
              <span className="text-body-md font-semibold">{error}</span>
            </div>
          )}

          {/* ฟอร์มกรอกข้อมูล */}
          <MachineForm
            onSubmit={handleSubmit}
            disabled={isPending || success}
          />
        </div>
      </Modal>
    </>
  );
}
