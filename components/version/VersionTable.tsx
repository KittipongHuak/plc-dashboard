"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import ConfirmDialog from "../common/ConfirmDialog";
import { deleteFile, updateFileMetadata } from "@/app/(dashboard)/files/actions";

interface VersionRow {
  id: number;
  version: string;
  isLatest: boolean;
  uploadBy: string;
  uploadDate: string;
  fileSize: string;
  remark: string;
  fileName: string;
}

interface VersionTableProps {
  categoryName: string;
  rows: VersionRow[];
  isLoggedIn?: boolean;
}

export default function VersionTable({ categoryName, rows, isLoggedIn = false }: VersionTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // สถานะสำหรับการแก้ไข (Edit)
  const [editingFile, setEditingFile] = useState<VersionRow | null>(null);
  const [editingFileName, setEditingFileName] = useState("");
  const [editingRemark, setEditingRemark] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);

  // ดึงข้อมูลเดิมมาใส่ในฟอร์มเมื่อกดแก้ไข
  useEffect(() => {
    if (editingFile) {
      const lastDotIndex = editingFile.fileName.lastIndexOf(".");
      const cleanName = lastDotIndex !== -1 ? editingFile.fileName.substring(0, lastDotIndex) : editingFile.fileName;
      setEditingFileName(cleanName);
      setEditingRemark(editingFile.remark);
      setEditError(null);
      setEditSuccess(false);
    }
  }, [editingFile]);

  const columns = [
    { label: "เวอร์ชัน", align: "text-center" },
    { label: "สถานะ", align: "text-center" },
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

  // จัดการบันทึกการแก้ไขข้อมูลไฟล์
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFile) return;
    setEditError(null);
    setEditSuccess(false);

    startTransition(async () => {
      const result = await updateFileMetadata(editingFile.id, {
        fileName: editingFileName,
        remark: editingRemark,
      });

      if (result.success) {
        setEditSuccess(true);
        router.refresh();
        setTimeout(() => {
          setEditingFile(null);
          setEditSuccess(false);
        }, 1000);
      } else {
        setEditError(result.error || "เกิดข้อผิดพลาดในการแก้ไขข้อมูลไฟล์");
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
                  {/* สถานะ */}
                  <td className="px-4 py-3 text-body-md text-center">
                    {row.isLatest ? (
                      <span className="bg-green-50 text-green-700 border border-green-200 text-[11px] px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1.5 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        เวอร์ชันล่าสุด
                      </span>
                    ) : (
                      <span className="bg-slate-50 text-slate-500 border border-slate-200 text-[11px] px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        เวอร์ชันเก่า
                      </span>
                    )}
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
                      
                      {isLoggedIn && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon="edit"
                            onClick={() => setEditingFile(row)}
                            title="แก้ไขข้อมูลไฟล์"
                            disabled={isPending}
                          />
                          <Button
                            variant="error"
                            size="sm"
                            icon="delete"
                            onClick={() => setDeletingId(row.id)}
                            title="ลบไฟล์รุ่นนี้"
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
      </div>

      {/* Dialog ยืนยันการลบไฟล์ */}
      <ConfirmDialog
        isOpen={deletingId !== null}
        onClose={() => !isPending && setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="ยืนยันการลบไฟล์"
        message={
          deleteError ? (
            <span className="text-error font-medium">{deleteError}</span>
          ) : (
            "คุณแน่ใจหรือไม่ว่าต้องการลบไฟล์ประวัติรุ่นนี้? การกระทำนี้ไม่สามารถย้อนกลับได้"
          )
        }
        confirmText="ลบไฟล์"
        cancelText="ยกเลิก"
        loading={isPending}
      />

      {/* Modal แก้ไขข้อมูลไฟล์ */}
      <Modal
        isOpen={!!editingFile}
        onClose={() => !isPending && setEditingFile(null)}
        title={`แก้ไขข้อมูลไฟล์เวอร์ชัน: ${editingFile?.version}`}
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

          {editingFile && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label htmlFor="fileName" className="block font-label-md text-label-md text-on-surface-variant mb-2">
                  ชื่อไฟล์ (ไม่รวมนามสกุล)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="fileName"
                    className="flex-1 px-4 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:border-primary"
                    value={editingFileName}
                    onChange={(e) => setEditingFileName(e.target.value)}
                    disabled={isPending || editSuccess}
                    required
                  />
                  <span className="self-center font-bold text-on-surface-variant">
                    {editingFile.fileName.substring(editingFile.fileName.lastIndexOf("."))}
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="remark" className="block font-label-md text-label-md text-on-surface-variant mb-2">
                  บันทึกการเปลี่ยนแปลง (หมายเหตุ)
                </label>
                <textarea
                  id="remark"
                  rows={3}
                  className="w-full px-4 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:border-primary"
                  placeholder="ตัวอย่างเช่น: ปรับปรุงประสิทธิภาพ, แก้ไขบั๊กการคำนวณ"
                  value={editingRemark}
                  onChange={(e) => setEditingRemark(e.target.value)}
                  disabled={isPending || editSuccess}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingFile(null)}
                  disabled={isPending || editSuccess}
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isPending || editSuccess}
                >
                  {isPending ? "กำลังบันทึก..." : "บันทึก"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
}
