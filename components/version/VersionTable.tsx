"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "../ui/Button";
import ConfirmDialog from "../common/ConfirmDialog";
import { deleteFile } from "@/app/(dashboard)/files/actions";

interface VersionRow {
  id: number;
  version: string;
  uploadBy: string;
  uploadDate: string;
  fileSize: string;
  remark: string;
  fileName: string;
}

interface VersionTableProps {
  categoryName: string;
  rows: VersionRow[];
}

export default function VersionTable({ categoryName, rows }: VersionTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const columns = [
    { label: "เวอร์ชัน", align: "text-center" },
    { label: "ชื่อไฟล์", align: "text-left" },
    { label: "ผู้อัปโหลด", align: "text-left" },
    { label: "วันที่อัปโหลด", align: "text-left" },
    { label: "ขนาดไฟล์", align: "text-center" },
    { label: "บันทึกการเปลี่ยนแปลง", align: "text-left" },
    { label: "การจัดการ", align: "text-center" },
  ];

  // จัดการการยืนยันการลบไฟล์รุ่นย่อย
  const handleDeleteConfirm = () => {
    if (deletingId === null) return;
    setDeleteError(null);

    startTransition(async () => {
      const result = await deleteFile(deletingId);
      if (result.success) {
        router.refresh();
        setDeletingId(null);
      } else {
        setDeleteError(result.error || "เกิดข้อผิดพลาดในการลบไฟล์");
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ส่วนหัวของหมวดหมู่ซอฟต์แวร์ */}
      <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
        <h4 className="font-title-lg text-title-lg text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[24px]">
            folder_open
          </span>
          ชนิดซอฟต์แวร์: <span className="text-primary font-bold">{categoryName}</span>
        </h4>
        <span className="text-label-md font-semibold text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full">
          พบ {rows.length} รุ่น (Versions)
        </span>
      </div>

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
                  className={`px-4 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider ${col.align}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-body-md text-on-surface-variant">
                  ไม่พบข้อมูลประวัติเวอร์ชันสำหรับหมวดหมู่นี้
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="hover:bg-surface-container-low/30">
                  {/* เวอร์ชัน */}
                  <td className="px-4 py-3 text-body-md font-bold text-center text-primary">
                    {row.version}
                  </td>
                  {/* ชื่อไฟล์อัปโหลดจริง */}
                  <td className="px-4 py-3 text-body-md text-left font-semibold text-on-surface">
                    {row.fileName}
                  </td>
                  {/* ผู้อัปโหลด */}
                  <td className="px-4 py-3 text-body-md text-left">{row.uploadBy}</td>
                  {/* วันที่อัปโหลด */}
                  <td className="px-4 py-3 text-body-md text-left text-on-surface-variant">
                    {row.uploadDate}
                  </td>
                  {/* ขนาดไฟล์ */}
                  <td className="px-4 py-3 text-body-md text-center text-on-surface-variant font-medium">
                    {row.fileSize}
                  </td>
                  {/* บันทึกการเปลี่ยนแปลง */}
                  <td className="px-4 py-3 text-body-md text-left max-w-xs truncate" title={row.remark}>
                    {row.remark || "-"}
                  </td>
                  {/* ปุ่มจัดการ */}
                  <td className="px-4 py-3 text-body-md text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <a
                        href={`/api/files/download/${row.id}`}
                        download
                        title="ดาวน์โหลดไฟล์รุ่นนี้"
                      >
                        <Button variant="outline" size="sm" icon="download" />
                      </a>
                      
                      <Button
                        variant="error"
                        size="sm"
                        icon="delete"
                        onClick={() => setDeletingId(row.id)}
                        title="ลบไฟล์รุ่นนี้"
                        disabled={isPending}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Dialog ยืนยันการลบไฟล์ */}
      <ConfirmDialog
        isOpen={deletingId !== null}
        onClose={() => !isPending && setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="ยืนยันการลบรุ่นย่อยไฟล์ซอฟต์แวร์"
        message="คุณแน่ใจหรือไม่ว่าต้องการลบไฟล์รุ่นนี้ออกจากระบบประวัติ? การกระทำนี้ไม่สามารถย้อนคืนได้"
        confirmText="ลบรุ่นนี้"
        cancelText="ยกเลิก"
        loading={isPending}
      />
    </div>
  );
}
