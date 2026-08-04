"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import ConfirmDialog from "../common/ConfirmDialog";
import SubcategoryForm from "./SubcategoryForm";
import { updateSubcategory, deleteSubcategory } from "@/app/(dashboard)/categories/actions";

interface SubcategoryRow {
  id: number;
  code: string;
  name: string;
  description: string;
}

interface SubcategoryTableProps {
  categoryId: string;
  machineId: string;
  rows: SubcategoryRow[];
}

export default function SubcategoryTable({ categoryId, machineId, rows }: SubcategoryTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Status variables
  const [editingSubcategory, setEditingSubcategory] = useState<SubcategoryRow | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);

  // Status variables for delete
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const columns = [
    { label: "รหัสประเภทย่อย", align: "text-left" },
    { label: "ชื่อประเภทย่อย", align: "text-left" },
    { label: "รายละเอียด", align: "text-left" },
    { label: "การจัดการ", align: "text-center" },
  ];

  // Submit edit changes
  const handleEditSubmit = (data: { code: string; name: string; description: string }) => {
    if (!editingSubcategory) return;
    setEditError(null);
    setEditSuccess(false);

    startTransition(async () => {
      const result = await updateSubcategory(editingSubcategory.id, categoryId, machineId, data);
      if (result.success) {
        setEditSuccess(true);
        router.refresh();
        setTimeout(() => {
          setEditingSubcategory(null);
          setEditSuccess(false);
        }, 1000);
      } else {
        setEditError(result.error || "เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
      }
    });
  };

  // Confirm and execute deletion
  const handleDeleteConfirm = () => {
    if (deletingId === null) return;
    setDeleteError(null);

    startTransition(async () => {
      const result = await deleteSubcategory(deletingId, categoryId, machineId);
      if (result.success) {
        router.refresh();
        setDeletingId(null);
      } else {
        setDeleteError(result.error || "เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {deleteError && (
        <div className="p-4 bg-error-container text-on-error-container rounded-xl border border-error/20 flex gap-2 items-center">
          <span className="material-symbols-outlined text-error text-[20px]">
            error
          </span>
          <span className="text-body-md font-semibold">{deleteError}</span>
        </div>
      )}

      <div className="overflow-x-auto border border-outline-variant rounded-xl bg-white">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-low border-b border-outline-variant">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.label}
                  className={`px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider ${col.align}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-body-md text-on-surface-variant">
                  ไม่พบข้อมูลประเภทย่อยของชนิดไฟล์นี้
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="hover:bg-surface-container-low/30 transition-colors">
                  {/* รหัสประเภทย่อย */}
                  <td className="px-6 py-4 text-body-md font-code-sm font-bold text-on-surface">
                    {row.code}
                  </td>
                  {/* ชื่อประเภทย่อย */}
                  <td className="px-6 py-4 text-body-md font-semibold text-primary">
                    {row.name}
                  </td>
                  {/* รายละเอียด */}
                  <td className="px-6 py-4 text-body-md text-on-surface-variant max-w-sm truncate" title={row.description || ""}>
                    {row.description || "-"}
                  </td>
                  {/* ปุ่มควบคุมการจัดการ */}
                  <td className="px-6 py-4 text-body-md text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon="edit"
                        onClick={() => setEditingSubcategory(row)}
                        title="แก้ไขประเภทย่อย"
                      />
                      <Button
                        variant="error"
                        size="sm"
                        icon="delete"
                        onClick={() => setDeletingId(row.id)}
                        title="ลบประเภทย่อย"
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal แก้ไขประเภทย่อย */}
      <Modal
        isOpen={editingSubcategory !== null}
        onClose={() => !isPending && setEditingSubcategory(null)}
        title="แก้ไขประเภทย่อยชนิดไฟล์"
      >
        <div className="space-y-4">
          {editSuccess && (
            <div className="p-4 bg-tertiary-container text-on-tertiary-container rounded-xl border border-tertiary/20 flex gap-2 items-center">
              <span className="material-symbols-outlined text-tertiary text-[20px]">
                check_circle
              </span>
              <span className="text-body-md font-semibold">แก้ไขประเภทย่อยชนิดไฟล์สำเร็จ!</span>
            </div>
          )}

          {editError && (
            <div className="p-4 bg-error-container text-on-error-container rounded-xl border border-error/20 flex gap-2 items-center">
              <span className="material-symbols-outlined text-error text-[20px]">
                error
              </span>
              <span className="text-body-md font-semibold">{editError}</span>
            </div>
          )}

          {editingSubcategory && (
            <SubcategoryForm
              initialData={{
                code: editingSubcategory.code,
                name: editingSubcategory.name,
                description: editingSubcategory.description || "",
              }}
              onSubmit={handleEditSubmit}
              disabled={isPending}
            />
          )}
        </div>
      </Modal>

      {/* Dialog ยืนยันการลบประเภทย่อย */}
      <ConfirmDialog
        isOpen={deletingId !== null}
        onClose={() => !isPending && setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="ยืนยันการลบประเภทย่อยชนิดไฟล์"
        message="คุณแน่ใจหรือไม่ว่าต้องการลบประเภทย่อยชนิดไฟล์นี้? ไฟล์ทั้งหมดที่อยู่ในประเภทย่อยนี้จะถูกลบไปด้วย และการทำรายการนี้ไม่สามารถย้อนคืนได้"
        confirmText="ลบข้อมูล"
        cancelText="ยกเลิก"
        loading={isPending}
      />
    </div>
  );
}
