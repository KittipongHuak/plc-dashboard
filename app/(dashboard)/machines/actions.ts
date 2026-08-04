"use server";

import { pool } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface ActionResponse {
  success: boolean;
  error?: string;
}

export async function createMachine(data: {
  id: string;
  name: string;
  description: string;
}): Promise<ActionResponse> {
  try {
    const { id, name, description } = data;

    // 1. ตรวจสอบข้อมูลเบื้องต้น
    if (!id.trim() || !name.trim()) {
      return { success: false, error: "กรุณากรอกรหัสเครื่องจักรและชื่อเครื่องจักร" };
    }

    // 2. ตรวจสอบว่ารหัสเครื่องจักรซ้ำหรือไม่
    const checkRes = await pool.query("SELECT id FROM machines WHERE id = $1;", [id.trim()]);
    if (checkRes.rows.length > 0) {
      return { success: false, error: "มีรหัสเครื่องจักรนี้อยู่ในระบบแล้ว" };
    }

    // 3. บันทึกข้อมูล
    await pool.query(
      `INSERT INTO machines (id, name, description) 
       VALUES ($1, $2, $3);`,
      [id.trim(), name.trim(), description.trim() || null]
    );

    // 4. รีเฟรชแคชหน้าเครื่องจักรและหน้าแดชบอร์ดหลัก
    revalidatePath("/machines");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: any) {
    console.error("Error creating machine in server action:", err.message);
    return {
      success: false,
      error: err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูลเครื่องจักร",
    };
  }
}

export async function updateMachine(
  originalId: string,
  data: { id: string; name: string; description: string }
): Promise<ActionResponse> {
  try {
    const { id, name, description } = data;

    if (!id.trim() || !name.trim()) {
      return { success: false, error: "กรุณากรอกรหัสเครื่องจักรและชื่อเครื่องจักร" };
    }

    // หากรหัสเครื่องเปลี่ยน ให้เช็กความซ้ำซ้อนกับเครื่องอื่นก่อน
    if (id.trim() !== originalId) {
      const checkRes = await pool.query("SELECT id FROM machines WHERE id = $1;", [id.trim()]);
      if (checkRes.rows.length > 0) {
        return { success: false, error: "มีรหัสเครื่องจักรนี้อยู่ในระบบแล้ว" };
      }
    }

    await pool.query(
      `UPDATE machines 
       SET id = $1, name = $2, description = $3 
       WHERE id = $4;`,
      [id.trim(), name.trim(), description.trim() || null, originalId]
    );

    revalidatePath("/machines");
    revalidatePath(`/machines/${id.trim()}`);
    revalidatePath(`/machines/${originalId}`);
    revalidatePath("/dashboard");
    revalidatePath("/files");

    return { success: true };
  } catch (err: any) {
    console.error("Error updating machine in server action:", err.message);
    return {
      success: false,
      error: err.message || "เกิดข้อผิดพลาดในการแก้ไขข้อมูลเครื่องจักร",
    };
  }
}

export async function deleteMachine(id: string): Promise<ActionResponse> {
  try {
    await pool.query("DELETE FROM machines WHERE id = $1;", [id]);

    revalidatePath("/machines");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: any) {
    console.error("Error deleting machine in server action:", err.message);
    return {
      success: false,
      error: err.message || "เกิดข้อผิดพลาดในการลบเครื่องจักร",
    };
  }
}
