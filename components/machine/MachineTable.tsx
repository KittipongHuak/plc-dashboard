"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import ConfirmDialog from "../common/ConfirmDialog";
import MachineForm from "./MachineForm";
import { updateMachine, deleteMachine } from "@/app/(dashboard)/machines/actions";

interface MachineRow {
  id: string;
  name: string;
  description: string;
  filesCount: number;
}

interface MachineTableProps {
  rows: MachineRow[];
  isLoggedIn?: boolean;
  mode?: "view" | "manage";
}

export default function MachineTable({ rows, isLoggedIn = false, mode = "view" }: MachineTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // สถานะสำหรับการแก้ไข (Edit)
  const [editingMachine, setEditingMachine] = useState<MachineRow | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);

  // สถานะสำหรับการลบ (Delete)
  const [deletingMachineId, setDeletingMachineId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const columns = [
    { label: "รหัสเครื่องจักร", align: "text-left" },
    { label: "ชื่อเครื่องจักร", align: "text-left" },
    { label: "รายละเอียด", align: "text-left" },
    { label: "จำนวนไฟล์", align: "text-center" },
    { label: "การจัดการ", align: "text-center" },
  ];

  // จัดการบันทึกการแก้ไข
  const handleEditSubmit = (data: { id: string; name: string; description: string }) => {
    if (!editingMachine) return;
    setEditError(null);
    setEditSuccess(false);

    startTransition(async () => {
      const result = await updateMachine(editingMachine.id, data);
      if (result.success) {
        setEditSuccess(true);
        router.refresh();
        setTimeout(() => {
          setEditingMachine(null);
          setEditSuccess(false);
        }, 1000);
      } else {
        setEditError(result.error || "เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
      }
    });
  };

  // จัดการยืนยันการลบ
  const handleDeleteConfirm = () => {
    if (!deletingMachineId) return;
    setDeleteError(null);

    startTransition(async () => {
      const result = await deleteMachine(deletingMachineId);
      if (result.success) {
        router.refresh();
        setDeletingMachineId(null);
      } else {
        setDeleteError(result.error || "เกิดข้อผิดพลาดในการลบเครื่องจักร");
      }
    });
  };

  return (
    <div className="overflow-x-auto border border-outline-variant rounded-xl bg-surface-container-lowest shadow-sm">
      <table className="w-full border-collapse">
        <thead className="bg-surface-container-low/50 border-b border-outline-variant">
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
                ไม่พบข้อมูลเครื่องจักรในระบบ
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="hover:bg-surface-container-low/40">
                <td className="px-6 py-4 text-body-md font-bold text-primary text-left">{row.id}</td>
                <td className="px-6 py-4 text-body-md font-semibold text-left">{row.name}</td>
                <td className="px-6 py-4 text-body-md max-w-sm truncate text-left" title={row.description}>
                  {row.description || "-"}
                </td>
                <td className="px-6 py-4 text-body-md font-semibold text-center">{row.filesCount}</td>
                <td className="px-6 py-4 text-body-md text-center">
                  <div className="flex items-center justify-center gap-2">
                    {mode === "view" ? (
                      <Link href={`/machines/${row.id}`}>
                        <Button variant="outline" size="sm" icon="arrow_forward">
                          เปิดรายละเอียด
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/categories/${row.id}`}>
                        <Button variant="outline" size="sm" icon="subdirectory_arrow_right" className="text-primary hover:bg-surface-container-low">
                          เลือกประเภทหลัก
                        </Button>
                      </Link>
                    )}
                    
                    {mode === "manage" && isLoggedIn && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon="edit"
                          onClick={() => setEditingMachine(row)}
                          title="แก้ไขเครื่องจักร"
                          disabled={isPending}
                        />

                        <Button
                          variant="error"
                          size="sm"
                          icon="delete"
                          onClick={() => setDeletingMachineId(row.id)}
                          title="ลบเครื่องจักร"
                          disabled={isPending}
                        />
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* 1. Modal ฟอร์มแก้ไขเครื่องจักร */}
      <Modal
        isOpen={!!editingMachine}
        onClose={() => !isPending && setEditingMachine(null)}
        title={`แก้ไขข้อมูลเครื่องจักร: ${editingMachine?.id}`}
        footerActions={null}
      >
        <div className="space-y-4">
          {editSuccess && (
            <div className="p-4 bg-tertiary-container text-on-tertiary-container rounded-xl border border-tertiary/20 flex gap-2 items-center">
              <span className="material-symbols-outlined text-tertiary text-[20px]">
                check_circle
              </span>
              <span className="text-body-md font-semibold">บันทึกข้อมูลเรียบร้อย!</span>
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

          {editingMachine && (
            <MachineForm
              onSubmit={handleEditSubmit}
              initialData={{
                id: editingMachine.id,
                name: editingMachine.name,
                description: editingMachine.description,
              }}
              disabled={isPending || editSuccess}
            />
          )}
        </div>
      </Modal>

      {/* 2. Dialog ยืนยันการลบเครื่องจักร */}
      <ConfirmDialog
        isOpen={!!deletingMachineId}
        onClose={() => !isPending && setDeletingMachineId(null)}
        onConfirm={handleDeleteConfirm}
        title="ยืนยันการลบเครื่องจักร"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบเครื่องจักร ${deletingMachineId}? คำเตือน: ข้อมูลไฟล์ซอฟต์แวร์ประวัติทั้งหมดของเครื่องจักรนี้จะถูกลบออกจากฐานข้อมูลอย่างถาวร`}
        confirmText="ลบข้อมูล"
        cancelText="ยกเลิก"
        loading={isPending}
      />
    </div>
  );
}
