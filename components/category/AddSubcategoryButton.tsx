"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import SubcategoryForm from "./SubcategoryForm";
import { createSubcategory } from "@/app/(dashboard)/categories/actions";

interface AddSubcategoryButtonProps {
  categoryId: string;
  categoryName: string;
  machineId: string;
}

export default function AddSubcategoryButton({
  categoryId,
  categoryName,
  machineId,
}: AddSubcategoryButtonProps) {
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
      const result = await createSubcategory(categoryId, machineId, data);
      if (result.success) {
        setSuccess(true);
        router.refresh();
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
      <Button
        variant="primary"
        icon="add"
        onClick={handleOpen}
        className="shadow-sm"
      >
        เพิ่มประเภทย่อย
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={`เพิ่มประเภทย่อยของ ${categoryName}`}
        footerActions={null}
      >
        <div className="space-y-4">
          {success && (
            <div className="p-4 bg-tertiary-container text-on-tertiary-container rounded-xl border border-tertiary/20 flex gap-2 items-center">
              <span className="material-symbols-outlined text-tertiary text-[20px]">
                check_circle
              </span>
              <span className="text-body-md font-semibold">บันทึกข้อมูลประเภทย่อยสำเร็จ!</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-error-container text-on-error-container rounded-xl border border-error/20 flex gap-2 items-center">
              <span className="material-symbols-outlined text-error text-[20px]">
                error
              </span>
              <span className="text-body-md font-semibold">{error}</span>
            </div>
          )}

          <SubcategoryForm
            onSubmit={handleSubmit}
            disabled={isPending || success}
          />
        </div>
      </Modal>
    </>
  );
}
