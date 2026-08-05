"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import ConfirmDialog from "../common/ConfirmDialog";
import { deleteFile, updateFileMetadata } from "@/app/(dashboard)/files/actions";

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
  subcategory_id: number | null;
  is_latest: boolean;
}

interface FileTableProps {
  rows: FileRow[];
  isLoggedIn?: boolean;
  machines?: { id: string; name: string }[];
  categories?: { id: string; name: string }[];
  subcategories?: { id: number; machine_id: string; category_id: string; code: string; name: string }[];
}

// แปลงรูปแบบขนาดไฟล์
function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i];
}

export default function FileTable({ 
  rows, 
  isLoggedIn = false,
  machines = [],
  categories = [],
  subcategories = [],
}: FileTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // สถานะสำหรับการแก้ไข (Edit)
  const [editingFile, setEditingFile] = useState<FileRow | null>(null);
  const [editingFileName, setEditingFileName] = useState("");
  const [editingRemark, setEditingRemark] = useState("");
  const [editingMachineId, setEditingMachineId] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState("");
  const [editingSubcategoryId, setEditingSubcategoryId] = useState("");
  const [editingUploadBy, setEditingUploadBy] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);

  // กรองประเภทย่อยตามประเภทหลัก และเครื่องจักรที่เลือกในฟอร์มแก้ไข
  const filteredSubcategories = subcategories.filter(
    (s) => s.category_id === editingCategoryId && s.machine_id === editingMachineId
  );

  // ดึงข้อมูลเดิมมาใส่ในฟอร์มเมื่อกดแก้ไข
  useEffect(() => {
    if (editingFile) {
      setEditingFileName(editingFile.file_name);
      setEditingRemark(editingFile.remark || "");
      setEditingMachineId(editingFile.machine_id);
      setEditingCategoryId(editingFile.category_id);
      setEditingSubcategoryId(editingFile.subcategory_id ? editingFile.subcategory_id.toString() : "");
      setEditingUploadBy(editingFile.upload_by);
      setEditError(null);
      setEditSuccess(false);
    }
  }, [editingFile]);

  const columns = [
    { label: "ชื่อไฟล์", align: "text-left" },
    { label: "เครื่องจักร", align: "text-left" },
    { label: "ประเภทไฟล์", align: "text-left" },
    { label: "เวอร์ชัน", align: "text-center" },
    { label: "สถานะ", align: "text-center" },
    { label: "ขนาดไฟล์", align: "text-center" },
    { label: "ผู้อัปโหลด", align: "text-left" },
    { label: "วันที่อัปโหลด", align: "text-left" },
    { label: "บันทึกการเปลี่ยนแปลง", align: "text-left" },
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
        machineId: editingMachineId,
        categoryId: editingCategoryId,
        subcategoryId: editingSubcategoryId,
        uploadBy: editingUploadBy,
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
                {/* สถานะ */}
                <td className="px-6 py-4 text-body-md text-center">
                  {row.is_latest ? (
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
                {/* บันทึกการเปลี่ยนแปลง */}
                <td className="px-6 py-4 text-body-md text-left max-w-xs truncate" title={row.remark}>
                  {row.remark || "-"}
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
                          title="ลบไฟล์"
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

      {/* Dialog ยืนยันการลบไฟล์ */}
      <ConfirmDialog
        isOpen={deletingId !== null}
        onClose={() => !isPending && setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="ยืนยันการลบไฟล์ซอฟต์แวร์"
        message={
          deleteError ? (
            <span className="text-error font-medium">{deleteError}</span>
          ) : (
            "คุณแน่ใจหรือไม่ว่าต้องการลบไฟล์ซอฟต์แวร์นี้ออกจากฐานข้อมูล? การลบไม่สามารถกู้คืนกลับมาได้"
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
        title={`แก้ไขข้อมูลไฟล์เวอร์ชัน: v${editingFile?.version}`}
        footerActions={null}
      >
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
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
              {/* 1. เลือกเครื่องจักร */}
              <div>
                <label htmlFor="editMachine" className="block font-label-md text-label-md text-on-surface-variant mb-2">
                  เครื่องจักร
                </label>
                <select
                  id="editMachine"
                  className="w-full px-4 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:border-primary"
                  value={editingMachineId}
                  onChange={(e) => {
                    setEditingMachineId(e.target.value);
                    setEditingSubcategoryId("");
                  }}
                  disabled={isPending || editSuccess}
                  required
                >
                  <option value="" disabled>เลือกเครื่องจักร...</option>
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. เลือกประเภทไฟล์หลัก */}
              <div>
                <label htmlFor="editCategory" className="block font-label-md text-label-md text-on-surface-variant mb-2">
                  ประเภทไฟล์หลัก
                </label>
                <select
                  id="editCategory"
                  className="w-full px-4 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:border-primary"
                  value={editingCategoryId}
                  onChange={(e) => {
                    setEditingCategoryId(e.target.value);
                    setEditingSubcategoryId("");
                  }}
                  disabled={isPending || editSuccess}
                  required
                >
                  <option value="" disabled>เลือกประเภทหลัก...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. เลือกประเภทย่อย */}
              <div>
                <label htmlFor="editSubcategory" className="block font-label-md text-label-md text-on-surface-variant mb-2 font-medium">
                  ประเภทไฟล์ย่อย (ถ้ามี)
                </label>
                <select
                  id="editSubcategory"
                  className="w-full px-4 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:border-primary disabled:opacity-50"
                  value={editingSubcategoryId}
                  onChange={(e) => setEditingSubcategoryId(e.target.value)}
                  disabled={isPending || editSuccess || filteredSubcategories.length === 0}
                >
                  <option value="">ไม่มีประเภทย่อย</option>
                  {filteredSubcategories.map((s) => (
                    <option key={s.id} value={s.id.toString()}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. ชื่อผู้อัปโหลด */}
              <div>
                <label htmlFor="editUploadBy" className="block font-label-md text-label-md text-on-surface-variant mb-2">
                  ชื่อผู้อัปโหลด
                </label>
                <input
                  type="text"
                  id="editUploadBy"
                  className="w-full px-4 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:border-primary"
                  value={editingUploadBy}
                  onChange={(e) => setEditingUploadBy(e.target.value)}
                  disabled={isPending || editSuccess}
                  required
                />
              </div>

              {/* 5. ชื่อไฟล์ (ไม่รวมนามสกุล) */}
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
                    {editingFile.file_extension}
                  </span>
                </div>
              </div>

              {/* 6. บันทึกการเปลี่ยนแปลง (หมายเหตุ) */}
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
