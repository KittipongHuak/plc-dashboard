import { Dispatch, SetStateAction } from "react";

interface UploadDropzoneProps {
  dragActive: boolean;
  setDragActive: Dispatch<SetStateAction<boolean>>;
  setSelectedFile: Dispatch<SetStateAction<File | null>>;
  setError: Dispatch<SetStateAction<string | null>>;
  disabled: boolean;
  allowedExtensions: string;
  maxFileSizeMb: number;
}

export default function UploadDropzone({
  dragActive,
  setDragActive,
  setSelectedFile,
  setError,
  disabled,
  allowedExtensions,
  maxFileSizeMb,
}: UploadDropzoneProps) {
  // จัดการ Drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // จัดการ Drop event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const dotIndex = file.name.lastIndexOf(".");
      const ext = dotIndex !== -1 ? file.name.slice(dotIndex).toLowerCase() : "";
      
      const allowedList = allowedExtensions
        .split(",")
        .map((x) => x.trim().toLowerCase());
      
      const maxSizeBytes = maxFileSizeMb * 1024 * 1024;

      // ตรวจสอบนามสกุลไฟล์
      if (!allowedList.includes(ext)) {
        setError(`นามสกุลไฟล์ ${ext || "ไม่มีนามสกุล"} ไม่ได้รับอนุญาต (ประเภทที่อนุญาต: ${allowedExtensions})`);
        return;
      }

      // ตรวจสอบขนาดไฟล์
      if (file.size > maxSizeBytes) {
        setError(`ขนาดไฟล์เกินกว่าที่กำหนดสูงสุดที่ ${maxFileSizeMb} MB (ขนาดไฟล์จริง: ${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  };

  return (
    <label
      htmlFor="file-upload"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
        dragActive
          ? "border-primary bg-primary-container/20"
          : "border-outline-variant bg-surface-container-low hover:bg-surface-container-highest"
      } ${disabled ? "pointer-events-none opacity-50" : ""}`}
    >
      <span className="material-symbols-outlined text-[48px] text-primary/80">
        upload_file
      </span>
      <div className="text-center">
        <p className="text-body-md font-semibold text-on-surface">
          ลากไฟล์มาวางที่นี่ หรือคลิกเพื่ออัปโหลด
        </p>
        <p className="text-label-md text-on-surface-variant mt-1">
          รองรับเฉพาะไฟล์ประเภท: {allowedExtensions} (ขนาดสูงสุดไม่เกิน {maxFileSizeMb} MB)
        </p>
      </div>
    </label>
  );
}
