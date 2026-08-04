"use server";

import { pool } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface SettingsResponse {
  success: boolean;
  error?: string;
}

export interface SystemSettings {
  allowed_extensions: string;
  max_file_size_mb: string;
}

export async function getSettings(): Promise<SystemSettings> {
  try {
    const res = await pool.query("SELECT key, value FROM settings;");
    const settingsMap: Record<string, string> = {};
    
    res.rows.forEach((row) => {
      settingsMap[row.key] = row.value;
    });

    return {
      allowed_extensions: settingsMap["allowed_extensions"] || ".hex,.bin,.sys,.txt,.zip,.rar,.config,.param",
      max_file_size_mb: settingsMap["max_file_size_mb"] || "50",
    };
  } catch (err) {
    console.error("Error fetching settings:", err);
    return {
      allowed_extensions: ".hex,.bin,.sys,.txt,.zip,.rar,.config,.param",
      max_file_size_mb: "50",
    };
  }
}

export async function saveSettings(data: {
  allowed_extensions: string;
  max_file_size_mb: string;
}): Promise<SettingsResponse> {
  try {
    const { allowed_extensions, max_file_size_mb } = data;

    // 1. ตรวจสอบข้อมูลเบื้องต้น
    if (!allowed_extensions.trim()) {
      return { success: false, error: "กรุณากรอกประเภทนามสกุลไฟล์ที่อนุญาต" };
    }

    const maxMB = parseFloat(max_file_size_mb);
    if (isNaN(maxMB) || maxMB <= 0) {
      return { success: false, error: "กรุณากรอกขนาดไฟล์สูงสุดเป็นตัวเลขที่มากกว่า 0" };
    }

    // ทำความสะอาดนามสกุลไฟล์ (เอาช่องว่างออก และแปลงเป็นตัวพิมพ์เล็ก)
    const cleanedExtensions = allowed_extensions
      .split(",")
      .map((ext) => {
        let trimmed = ext.trim().toLowerCase();
        if (trimmed && !trimmed.startsWith(".")) {
          trimmed = "." + trimmed;
        }
        return trimmed;
      })
      .filter((ext) => ext.length > 1)
      .join(",");

    // 2. บันทึกลงตาราง settings
    await pool.query(
      `INSERT INTO settings (key, value) 
       VALUES ('allowed_extensions', $1) 
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;`,
      [cleanedExtensions]
    );

    await pool.query(
      `INSERT INTO settings (key, value) 
       VALUES ('max_file_size_mb', $1) 
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;`,
      [maxMB.toString()]
    );

    // 3. รีเฟรชแคชหน้าที่อ้างอิงการตั้งค่า
    revalidatePath("/settings");
    revalidatePath("/upload");

    return { success: true };
  } catch (err: any) {
    console.error("Error saving settings in server action:", err.message);
    return {
      success: false,
      error: err.message || "เกิดข้อผิดพลาดในการบันทึกค่าตั้งค่า",
    };
  }
}
