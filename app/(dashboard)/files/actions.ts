"use server";

import { pool } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkAdminSession } from "@/app/(auth)/login/actions";

export interface FileActionResponse {
  success: boolean;
  error?: string;
}

export async function deleteFile(id: number): Promise<FileActionResponse> {
  try {
    if (!(await checkAdminSession())) {
      return { success: false, error: "กรุณาเข้าสู่ระบบก่อนทำรายการนี้" };
    }
    await pool.query("DELETE FROM plc_files WHERE id = $1;", [id]);

    // รีเฟรชแคชหน้าจัดเก็บไฟล์และหน้าแดชบอร์ดหลัก
    revalidatePath("/files");
    revalidatePath("/dashboard");
    revalidatePath("/machines");

    return { success: true };
  } catch (err: any) {
    console.error("Error deleting file in server action:", err.message);
    return {
      success: false,
      error: err.message || "เกิดข้อผิดพลาดในการลบไฟล์",
    };
  }
}

export async function updateFileMetadata(
  id: number,
  data: { 
    fileName: string; 
    remark: string;
    machineId: string;
    categoryId: string;
    subcategoryId: string;
    uploadBy: string;
  }
): Promise<FileActionResponse> {
  try {
    if (!(await checkAdminSession())) {
      return { success: false, error: "กรุณาเข้าสู่ระบบก่อนทำรายการนี้" };
    }
    const { fileName, remark, machineId, categoryId, subcategoryId, uploadBy } = data;
    if (!fileName.trim()) {
      return { success: false, error: "กรุณากรอกชื่อไฟล์" };
    }
    if (!machineId) {
      return { success: false, error: "กรุณาเลือกเครื่องจักร" };
    }
    if (!categoryId) {
      return { success: false, error: "กรุณาเลือกประเภทไฟล์" };
    }
    if (!uploadBy.trim()) {
      return { success: false, error: "กรุณากรอกชื่อผู้อัปโหลด" };
    }

    const subId = subcategoryId && subcategoryId !== "" ? parseInt(subcategoryId, 10) : null;

    await pool.query(
      `UPDATE plc_files 
       SET file_name = $1, remark = $2, machine_id = $3, category_id = $4, subcategory_id = $5, upload_by = $6
       WHERE id = $7;`,
      [fileName.trim(), remark.trim() || null, machineId, categoryId, subId, uploadBy.trim(), id]
    );

    revalidatePath("/files");
    revalidatePath("/dashboard");
    revalidatePath("/machines");

    return { success: true };
  } catch (err: any) {
    console.error("Error updating file metadata in server action:", err.message);
    return {
      success: false,
      error: err.message || "เกิดข้อผิดพลาดในการแก้ไขข้อมูลไฟล์",
    };
  }
}
