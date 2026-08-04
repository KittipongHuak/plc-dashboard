"use server";

import { pool } from "@/lib/db";
import { revalidatePath } from "next/cache";
import path from "path";

export interface UploadResult {
  success: boolean;
  error?: string;
}

export async function uploadPLCFile(formData: FormData): Promise<UploadResult> {
  try {
    const machineId = formData.get("machineId") as string;
    const categoryId = formData.get("categoryId") as string;
    const uploadBy = formData.get("uploadBy") as string;
    const remark = formData.get("remark") as string;
    const file = formData.get("file") as File | null;

    if (!machineId || !categoryId || !uploadBy || !file) {
      return { success: false, error: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" };
    }

    if (file.size === 0) {
      return { success: false, error: "ไม่พบข้อมูลไฟล์ หรือไฟล์มีขนาดเป็น 0" };
    }

    // 1. ดึงข้อจำกัดจากตาราง settings ในฐานข้อมูล
    const settingsRes = await pool.query("SELECT key, value FROM settings;");
    const settingsMap: Record<string, string> = {};
    settingsRes.rows.forEach((row) => {
      settingsMap[row.key] = row.value;
    });

    const allowedExtensionsStr = settingsMap["allowed_extensions"] || ".hex,.bin,.sys,.txt,.zip,.rar,.config,.param";
    const maxFileSizeMbStr = settingsMap["max_file_size_mb"] || "50";

    const allowedExtensions = allowedExtensionsStr.split(",").map((e) => e.trim().toLowerCase());
    const maxFileSizeMb = parseFloat(maxFileSizeMbStr) || 50;
    const maxFileSizeBytes = maxFileSizeMb * 1024 * 1024;

    const originalName = file.name;
    const ext = path.extname(originalName).toLowerCase();
    const nameWithoutExt = path.basename(originalName, path.extname(originalName));

    // 2. ตรวจสอบชนิดไฟล์ (นามสกุล)
    if (!allowedExtensions.includes(ext)) {
      return {
        success: false,
        error: `นามสกุลไฟล์ ${ext} ไม่ได้รับอนุญาตให้อัปโหลด (ประเภทที่อนุญาต: ${allowedExtensionsStr})`,
      };
    }

    // 3. ตรวจสอบขนาดไฟล์
    if (file.size > maxFileSizeBytes) {
      return {
        success: false,
        error: `ขนาดไฟล์ของคุณใหญ่เกินกำหนดสูงสุดที่ ${maxFileSizeMb} MB (ขนาดไฟล์จริง: ${(file.size / (1024 * 1024)).toFixed(2)} MB)`,
      };
    }

    const subcategoryId = formData.get("subcategoryId") as string | null;

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    await pool.query(
      `INSERT INTO plc_files (
        machine_id, 
        category_id, 
        subcategory_id,
        file_name, 
        file_extension, 
        file_size, 
        file_data, 
        remark, 
        upload_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
      [
        machineId,
        categoryId,
        subcategoryId || null,
        nameWithoutExt,
        ext,
        file.size,
        fileBuffer,
        remark || null,
        uploadBy,
      ]
    );

    revalidatePath("/dashboard");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    console.error("Error uploading file in Server Action:", err.message);
    return { success: false, error: err.message || "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" };
  }
}
