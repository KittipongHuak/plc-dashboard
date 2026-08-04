"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadPLCFile } from "@/app/(dashboard)/upload/actions";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import UploadDropzone from "./UploadDropzone";
import FilePreview from "./FilePreview";

interface Machine {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: number;
  machine_id: string;
  category_id: string;
  code: string;
  name: string;
}

interface UploadFormProps {
  machines: Machine[];
  categories: Category[];
  subcategories: Subcategory[];
  allowedExtensions: string;
  maxFileSizeMb: number;
}

export default function UploadForm({
  machines,
  categories,
  subcategories,
  allowedExtensions,
  maxFileSizeMb,
}: UploadFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [machineId, setMachineId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [uploadBy, setUploadBy] = useState("");
  const [remark, setRemark] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // กรองประเภทย่อยตามประเภทหลัก และเครื่องจักรที่เลือก
  const filteredSubcategories = subcategories.filter(
    (s) => s.category_id === categoryId && s.machine_id === machineId
  );

  // UI state
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  // จัดการเมื่อกดปุ่มเลือกไฟล์
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const dotIndex = file.name.lastIndexOf(".");
      const ext = dotIndex !== -1 ? file.name.slice(dotIndex).toLowerCase() : "";
      
      const allowedList = allowedExtensions
        .split(",")
        .map((x) => x.trim().toLowerCase());
        
      const maxSizeBytes = maxFileSizeMb * 1024 * 1024;

      // ตรวจสอบนามสกุลไฟล์
      if (!allowedList.includes(ext)) {
        setError(`นามสกุลไฟล์ ${ext || "ไม่มีนามสกุล"} ไม่ได้รับอนุญาต (ประเภทที่อนุญาต: ${allowedExtensions})`);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      // ตรวจสอบขนาดไฟล์
      if (file.size > maxSizeBytes) {
        setError(`ขนาดไฟล์เกินกว่าที่กำหนดสูงสุดที่ ${maxFileSizeMb} MB (ขนาดไฟล์จริง: ${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // จัดการ Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!machineId) return setError("กรุณาเลือกเครื่องจักร");
    if (!categoryId) return setError("กรุณาเลือกประเภทไฟล์หลัก");
    if (filteredSubcategories.length > 0 && !subcategoryId) {
      return setError("กรุณาเลือกประเภทย่อยชนิดไฟล์");
    }
    if (!uploadBy.trim()) return setError("กรุณากรอกชื่อผู้อัปโหลด");
    if (!selectedFile) return setError("กรุณาเลือกไฟล์ที่จะอัปโหลด");

    const formData = new FormData();
    formData.append("machineId", machineId);
    formData.append("categoryId", categoryId);
    if (subcategoryId) {
      formData.append("subcategoryId", subcategoryId);
    }
    formData.append("uploadBy", uploadBy.trim());
    formData.append("remark", remark.trim());
    formData.append("file", selectedFile);

    startTransition(async () => {
      const result = await uploadPLCFile(formData);
      if (result.success) {
        setSuccess(true);
        // เคลียร์ข้อมูลฟอร์ม
        setMachineId("");
        setCategoryId("");
        setSubcategoryId("");
        setUploadBy("");
        setRemark("");
        setSelectedFile(null);
        
        // พาผู้ใช้กลับหน้าแรกหลังจากอัปโหลดสำเร็จใน 2 วินาที
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 2000);
      } else {
        setError(result.error || "เกิดข้อผิดพลาดในการอัปโหลด");
      }
    });
  };

  const machineOptions = [
    { value: "", label: "-- เลือกเครื่องจักร --" },
    ...machines.map((m) => ({ value: m.id, label: `${m.id} - ${m.name}` })),
  ];

  const categoryOptions = [
    { value: "", label: "-- เลือกประเภทไฟล์ --" },
    ...categories.map((c) => ({ value: c.id, label: `${c.id} - ${c.name}` })),
  ];

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm max-w-3xl mx-auto">
      <div className="px-6 py-5 border-b border-outline-variant bg-white">
        <h2 className="font-title-lg text-title-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            cloud_upload
          </span>
          อัปโหลดไฟล์ซอฟต์แวร์ PLC
        </h2>
        <p className="text-body-sm text-on-surface-variant mt-1">
          เลือกเครื่องจักร ประเภทไฟล์ และอัปโหลดไฟล์เข้าระบบเพื่อรันเวอร์ชันให้อัตโนมัติ
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* ข้อความแจ้งเตือน (Success) */}
        {success && (
          <div className="p-4 bg-tertiary-container text-on-tertiary-container rounded-xl border border-tertiary/20 flex gap-3 items-center animate-fade-in">
            <span className="material-symbols-outlined text-tertiary text-[24px]">
              check_circle
            </span>
            <div>
              <h3 className="font-title-md text-title-md">อัปโหลดไฟล์สำเร็จ!</h3>
              <p className="font-body-md text-body-md opacity-90">ระบบกำลังนำทางคุณกลับสู่หน้าแดชบอร์ด...</p>
            </div>
          </div>
        )}

        {/* ข้อความแจ้งเตือน (Error) */}
        {error && (
          <div className="p-4 bg-error-container text-on-error-container rounded-xl border border-error/20 flex gap-3 items-center">
            <span className="material-symbols-outlined text-error text-[24px]">
              error
            </span>
            <div>
              <h3 className="font-title-md text-title-md">ข้อมูลไม่ถูกต้อง</h3>
              <p className="font-body-md text-body-md opacity-90">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* เลือกเครื่องจักร */}
          <Input
            as="select"
            label="เครื่องจักร"
            required
            value={machineId}
            onChange={(e) => {
              setMachineId(e.target.value);
              setSubcategoryId(""); // reset subcategory on machine change
            }}
            options={machineOptions}
            disabled={isPending || success}
          />

          {/* เลือกประเภทไฟล์ */}
          <Input
            as="select"
            label="ประเภทไฟล์หลัก"
            required
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setSubcategoryId(""); // reset subcategory on category change
            }}
            options={categoryOptions}
            disabled={isPending || success}
          />
        </div>

        {/* เลือกประเภทย่อย (แสดงเฉพาะเมื่อหมวดหมู่หลักมีประเภทย่อยรองรับ) */}
        {categoryId && filteredSubcategories.length > 0 && (
          <Input
            as="select"
            label="ประเภทไฟล์ย่อย (Subcategory)"
            required
            value={subcategoryId}
            onChange={(e) => setSubcategoryId(e.target.value)}
            options={[
              { value: "", label: "-- เลือกประเภทย่อย --" },
              ...filteredSubcategories.map((s) => ({ value: s.id.toString(), label: `${s.code} - ${s.name}` })),
            ]}
            disabled={isPending || success}
          />
        )}

        {/* ผู้อัปโหลด */}
        <Input
          label="ผู้อัปโหลด"
          required
          value={uploadBy}
          onChange={(e) => setUploadBy(e.target.value)}
          placeholder="ใส่ชื่อหรือรหัสพนักงานผู้ทำการอัปโหลด"
          disabled={isPending || success}
        />

        {/* หมายเหตุ */}
        <Input
          as="textarea"
          label="หมายเหตุ"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          placeholder="รายละเอียดการเปลี่ยนแปลง ประวัติการอัปเดต หรือหมายเหตุย่อ..."
          rows={3}
          disabled={isPending || success}
        />

        {/* Dropzone สำหรับไฟล์ */}
        <div className="flex flex-col gap-2">
          <label className="text-label-md font-semibold text-on-surface">
            ไฟล์ซอฟต์แวร์ <span className="text-error">*</span>
          </label>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            disabled={isPending || success}
          />

           {!selectedFile ? (
             <UploadDropzone
               dragActive={dragActive}
               setDragActive={setDragActive}
               setSelectedFile={setSelectedFile}
               setError={setError}
               disabled={isPending || success}
               allowedExtensions={allowedExtensions}
               maxFileSizeMb={maxFileSizeMb}
             />
          ) : (
            <FilePreview
              file={selectedFile}
              onRemove={handleRemoveFile}
              disabled={isPending || success}
            />
          )}
        </div>

        {/* ปุ่มควบคุม */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard")}
            disabled={isPending || success}
          >
            ยกเลิก
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            icon="publish"
            loading={isPending}
            disabled={success}
          >
            อัปโหลดไฟล์
          </Button>
        </div>
      </form>
    </div>
  );
}
