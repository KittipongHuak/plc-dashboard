"use server";

import { pool } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface FileActionResponse {
  success: boolean;
  error?: string;
}

export async function deleteFile(id: number): Promise<FileActionResponse> {
  try {
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
