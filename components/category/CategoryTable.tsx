"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import ConfirmDialog from "../common/ConfirmDialog";
import CategoryForm from "./CategoryForm";
import { updateCategory, deleteCategory } from "@/app/(dashboard)/categories/actions";

interface CategoryRow {
  id: string;
  name: string;
  description: string;
}

interface CategoryTableProps {
  rows: CategoryRow[];
  machineId?: string;
}

export default function CategoryTable({ rows, machineId }: CategoryTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // สถานะการแก้ไข (Edit)
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);

  // สถานะการลบ (Delete)
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const columns = [
    { label: "รหัสประเภทไฟล์หลัก", align: "text-left" },
    { label: "ชื่อประเภทไฟล์หลัก", align: "text-left" },
    { label: "รายละเอียดการใช้งาน", align: "text-left" },
    { label: "การจัดการ", align: "text-center" },
  ];

  // จัดการบันทึกการแก้ไข
  const handleEditSubmit = (data: { id: string; name: string; description: string }) => {
    if (!editingCategory) return;
    setEditError(null);
    setEditSuccess(false);

    startTransition(async () => {
      const result = await updateCategory(editingCategory.id, data);
      if (result.success) {
        setEditSuccess(true);
        router.refresh();
        setTimeout(() => {
          setEditingCategory(null);
          setEditSuccess(false);
        }, 1000);
      } else {
        setEditError(result.error || "เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
      }
    });
  };

  // จัดการยืนยันการลบ
  const handleDeleteConfirm = () => {
    if (!deletingId) return;
    setDeleteError(null);

    startTransition(async () => {
      const result = await deleteCategory(deletingId);
      if (result.success) {
        router.refresh();
        setDeletingId(null);
      } else {
        setDeleteError(result.error || "เกิดข้อผิดพลาดในการลบประเภทไฟล์");
      }
    });
  };

  return (
    <div className="overflow-x-auto border border-outline-variant rounded-xl bg-white shadow-sm">
      {deleteError && (
        <div className="p-4 bg-error-container text-on-error-container border-b border-outline-variant flex gap-2 items-center">
          <span className="material-symbols-outlined text-error text-[20px]">
            error
          </span>
          <span className="text-body-md font-semibold">{deleteError}</span>
        </div>
      )}

      <table className="w-full border-collapse">
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
              <td colSpan={columns.length} className="px-6 py-10 text-center text-body-md text-on-surface-variant">
                ไม่พบข้อมูลประเภทไฟล์ซอฟต์แวร์ในระบบ
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const targetHref = machineId ? `/categories/${machineId}/${row.id}` : `/categories/${row.id}`;
              return (
                <tr key={row.id} className="hover:bg-surface-container-low/40">
                  <td className="px-6 py-4 text-body-md font-bold text-primary text-left">
                    {row.id}
                  </td>
                  <td className="px-6 py-4 text-body-md font-semibold text-left">
                    <Link
                      href={targetHref}
                      className="text-primary hover:underline hover:text-primary-dark transition-colors font-semibold"
                    >
                      {row.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-body-md text-left text-on-surface-variant max-w-md truncate" title={row.description}>
                    {row.description || "-"}
                  </td>
                  <td className="px-6 py-4 text-body-md text-center">
                    <div className="flex items-center justify-center gap-3">
                      {machineId && (
                        <Link href={`/categories/${machineId}/${row.id}`}>
                          <button className="px-3 py-1.5 border border-outline hover:bg-surface-container-low transition-colors rounded-lg text-label-md font-semibold text-primary">
                            เลือกประเภทย่อย
                          </button>
                        </Link>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        icon="edit"
                        onClick={() => setEditingCategory(row)}
                        title="แก้ไขข้อมูลประเภทไฟล์"
                        disabled={isPending}
                      />

                      <Button
                        variant="error"
                        size="sm"
                        icon="delete"
                        onClick={() => setDeletingId(row.id)}
                        title="ลบประเภทไฟล์"
                        disabled={isPending}
                      />
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* 1. Modal ฟอร์มแก้ไขข้อมูลประเภทไฟล์ */}
      <Modal
        isOpen={!!editingCategory}
        onClose={() => !isPending && setEditingCategory(null)}
        title={`แก้ไขชนิดซอฟต์แวร์: ${editingCategory?.id}`}
        footerActions={null}
      >
        <div className="space-y-4">
          {editSuccess && (
            <div className="p-4 bg-tertiary-container text-on-tertiary-container rounded-xl border border-tertiary/20 flex gap-2 items-center">
              <span className="material-symbols-outlined text-tertiary text-[20px]">
                check_circle
              </span>
              <span className="text-body-md font-semibold">บันทึกการแก้ไขประเภทไฟล์เรียบร้อย!</span>
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

          {editingCategory && (
            <CategoryForm
              onSubmit={handleEditSubmit}
              initialData={{
                id: editingCategory.id,
                name: editingCategory.name,
                description: editingCategory.description || "",
              }}
              disabled={isPending || editSuccess}
            />
          )}
        </div>
      </Modal>

      {/* 2. Dialog ยืนยันการลบประเภทไฟล์ */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => !isPending && setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="ยืนยันการลบประเภทไฟล์"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบประเภทไฟล์ ${deletingId}? คำเตือน: ไฟล์ซอฟต์แวร์ประวัติทั้งหมดของระบบที่อ้างอิงถึงชนิดนี้ จะถูกลบออกถาวรทันที`}
        confirmText="ลบประเภทไฟล์"
        cancelText="ยกเลิก"
        loading={isPending}
      />
    </div>
  );
}
