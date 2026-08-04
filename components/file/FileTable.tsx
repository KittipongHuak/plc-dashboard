"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "../ui/Button";
import ConfirmDialog from "../common/ConfirmDialog";
import { deleteFile } from "@/app/(dashboard)/files/actions";

interface FileRow {
  id: number;
  file_name: string;
  file_extension: string;
  version: number;
  file_size: number;
  upload_by: string;
  upload_date: string;
  remark: string;
  machine_id: string;
  machine_name: string;
  category_id: string;
  category_name: string;
}

interface FileTableProps {
  rows: FileRow[];
}

// แปลงรูปแบบขนาดไฟล์
function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i];
}

export default function FileTable({ rows }: FileTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const columns = [
    { label: "ชื่อไฟล์", align: "text-left" },
    { label: "เครื่องจักร", align: "text-left" },
    { label: "ประเภทไฟล์", align: "text-left" },
    { label: "เวอร์ชัน", align: "text-center" },
    { label: "ขนาดไฟล์", align: "text-center" },
    { label: "ผู้อัปโหลด", align: "text-left" },
    { label: "วันที่อัปโหลด", align: "text-left" },
    { label: "การจัดการ", align: "text-center" },
  ];

  // จัดการยืนยันการลบไฟล์
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
                ไม่พบไฟล์ซอฟต์แวร์ที่ตรงตามเงื่อนไขการค้นหา
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="hover:bg-surface-container-low/40">
                {/* ชื่อไฟล์ */}
                <td className="px-6 py-4 text-body-md text-left">
                  <div className="flex flex-col">
                    <span className="font-semibold text-on-surface">
                      {row.file_name}
                      <span className="text-on-surface-variant font-normal">{row.file_extension}</span>
                    </span>
                    {row.remark && (
                      <span className="text-body-sm text-on-surface-variant line-clamp-1 max-w-xs" title={row.remark}>
                        หมายเหตุ: {row.remark}
                      </span>
                    )}
                  </div>
                </td>
                {/* เครื่องจักร */}
                <td className="px-6 py-4 text-body-md text-left">
                  <span className="font-medium">{row.machine_name}</span>
                  <div className="text-body-sm text-on-surface-variant">รหัส: {row.machine_id}</div>
                </td>
                {/* ประเภทไฟล์ */}
                <td className="px-6 py-4 text-body-md text-left">
                  <div className="flex flex-col gap-1 items-start">
                    <span className="bg-secondary-container text-on-secondary-container text-body-sm px-2.5 py-1 rounded-full font-semibold">
                      {row.category_name}
                    </span>
                    {row.subcategory_name && (
                      <span className="bg-tertiary-container text-on-tertiary-container text-[11px] px-2 py-0.5 rounded font-medium">
                        ย่อย: {row.subcategory_name}
                      </span>
                    )}
                  </div>
                </td>
                {/* เวอร์ชัน */}
                <td className="px-6 py-4 text-body-md font-semibold text-center text-primary">
                  v{row.version}
                </td>
                {/* ขนาดไฟล์ */}
                <td className="px-6 py-4 text-body-md font-medium text-center text-on-surface-variant">
                  {formatBytes(row.file_size)}
                </td>
                {/* ผู้อัปโหลด */}
                <td className="px-6 py-4 text-body-md text-left text-on-surface">
                  {row.upload_by}
                </td>
                {/* วันที่อัปโหลด */}
                <td className="px-6 py-4 text-body-md text-left text-on-surface-variant">
                  {new Date(row.upload_date).toLocaleString("th-TH")}
                </td>
                {/* การจัดการ */}
                <td className="px-6 py-4 text-body-md text-center">
                  <div className="flex items-center justify-center gap-2">
                    <a
                      href={`/api/files/download/${row.id}`}
                      download
                      title="ดาวน์โหลดไฟล์"
                    >
                      <Button variant="outline" size="sm" icon="download" />
                    </a>

                    <Button
                      variant="error"
                      size="sm"
                      icon="delete"
                      onClick={() => setDeletingId(row.id)}
                      title="ลบไฟล์"
                      disabled={isPending}
                    />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Dialog ยืนยันการลบไฟล์ */}
      <ConfirmDialog
        isOpen={deletingId !== null}
        onClose={() => !isPending && setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="ยืนยันการลบไฟล์ซอฟต์แวร์"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบไฟล์ซอฟต์แวร์นี้ออกจากฐานข้อมูล? การลบไม่สามารถกู้คืนกลับมาได้`}
        confirmText="ลบไฟล์"
        cancelText="ยกเลิก"
        loading={isPending}
      />
    </div>
  );
}
