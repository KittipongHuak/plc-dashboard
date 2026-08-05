"use server";

import { pool } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkAdminSession } from "@/app/(auth)/login/actions";

export interface CategoryActionResponse {
  success: boolean;
  error?: string;
}

export async function createCategory(data: {
  id: string;
  name: string;
  description: string;
}): Promise<CategoryActionResponse> {
  try {
    if (!(await checkAdminSession())) {
      return { success: false, error: "กรุณาเข้าสู่ระบบก่อนทำรายการนี้" };
    }
    const { id, name, description } = data;

    if (!id.trim() || !name.trim()) {
      return { success: false, error: "กรุณากรอกรหัสประเภทและชื่อประเภทไฟล์" };
    }

    // ตรวจสอบว่ารหัสซ้ำหรือไม่
    const checkRes = await pool.query("SELECT id FROM categories WHERE id = $1;", [id.trim()]);
    if (checkRes.rows.length > 0) {
      return { success: false, error: "มีรหัสประเภทไฟล์นี้ในระบบแล้ว" };
    }

    await pool.query(
      `INSERT INTO categories (id, name, description) 
       VALUES ($1, $2, $3);`,
      [id.trim(), name.trim(), description.trim() || null]
    );

    revalidatePath("/categories");
    revalidatePath("/upload");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: any) {
    console.error("Error creating category in server action:", err.message);
    return {
      success: false,
      error: err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูลประเภทไฟล์",
    };
  }
}

export async function updateCategory(
  originalId: string,
  data: { id: string; name: string; description: string }
): Promise<CategoryActionResponse> {
  try {
    if (!(await checkAdminSession())) {
      return { success: false, error: "กรุณาเข้าสู่ระบบก่อนทำรายการนี้" };
    }
    const { id, name, description } = data;

    if (!id.trim() || !name.trim()) {
      return { success: false, error: "กรุณากรอกรหัสประเภทและชื่อประเภทไฟล์" };
    }

    // หากรหัสเปลี่ยน ให้เช็กก่อนว่าไปซ้ำกับประเภทไฟล์อื่นที่มีอยู่แล้วหรือไม่
    if (id.trim() !== originalId) {
      const checkRes = await pool.query("SELECT id FROM categories WHERE id = $1;", [id.trim()]);
      if (checkRes.rows.length > 0) {
        return { success: false, error: "มีรหัสประเภทไฟล์นี้ในระบบแล้ว" };
      }
    }

    await pool.query(
      `UPDATE categories 
       SET id = $1, name = $2, description = $3 
       WHERE id = $4;`,
      [id.trim(), name.trim(), description.trim() || null, originalId]
    );

    revalidatePath("/categories");
    revalidatePath("/upload");
    revalidatePath("/dashboard");
    revalidatePath("/files");

    return { success: true };
  } catch (err: any) {
    console.error("Error updating category in server action:", err.message);
    return {
      success: false,
      error: err.message || "เกิดข้อผิดพลาดในการแก้ไขประเภทไฟล์",
    };
  }
}

export async function deleteCategory(id: string): Promise<CategoryActionResponse> {
  try {
    if (!(await checkAdminSession())) {
      return { success: false, error: "กรุณาเข้าสู่ระบบก่อนทำรายการนี้" };
    }
    await pool.query("DELETE FROM categories WHERE id = $1;", [id]);

    revalidatePath("/categories");
    revalidatePath("/upload");
    revalidatePath("/dashboard");
    revalidatePath("/files");

    return { success: true };
  } catch (err: any) {
    console.error("Error deleting category in server action:", err.message);
    return {
      success: false,
      error: err.message || "เกิดข้อผิดพลาดในการลบประเภทไฟล์",
    };
  }
}

// ==========================================
// Subcategory Server Actions
// ==========================================

export async function createSubcategory(
  categoryId: string,
  machineId: string,
  data: {
    code: string;
    name: string;
    description: string;
    ipAddress?: string;
  }
): Promise<CategoryActionResponse> {
  try {
    if (!(await checkAdminSession())) {
      return { success: false, error: "กรุณาเข้าสู่ระบบก่อนทำรายการนี้" };
    }
    const { code, name, description, ipAddress } = data;

    if (!code.trim() || !name.trim()) {
      return { success: false, error: "กรุณากรอกรหัสประเภทย่อยและรุ่นอุปกรณ์" };
    }

    // ตรวจสอบความซ้ำซ้อนของรหัสประเภทย่อย ภายใต้เครื่องจักรและชนิดหลักเดียวกัน
    const checkRes = await pool.query(
      "SELECT id FROM subcategories WHERE machine_id = $1 AND category_id = $2 AND code = $3;",
      [machineId, categoryId, code.trim()]
    );
    if (checkRes.rows.length > 0) {
      return { success: false, error: "มีรหัสประเภทย่อยนี้ของเครื่องจักรและหมวดหมู่นี้แล้ว" };
    }

    await pool.query(
      `INSERT INTO subcategories (machine_id, category_id, code, name, description, ip_address) 
       VALUES ($1, $2, $3, $4, $5, $6);`,
      [machineId, categoryId, code.trim(), name.trim(), description.trim() || null, ipAddress?.trim() || null]
    );

    revalidatePath(`/categories/${machineId}/${categoryId}`);
    revalidatePath("/upload");
    revalidatePath("/files");

    return { success: true };
  } catch (err: any) {
    console.error("Error creating subcategory in server action:", err.message);
    return {
      success: false,
      error: err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูลประเภทย่อย",
    };
  }
}

export async function updateSubcategory(
  id: number,
  categoryId: string,
  machineId: string,
  data: {
    code: string;
    name: string;
    description: string;
    ipAddress?: string;
  }
): Promise<CategoryActionResponse> {
  try {
    if (!(await checkAdminSession())) {
      return { success: false, error: "กรุณาเข้าสู่ระบบก่อนทำรายการนี้" };
    }
    const { code, name, description, ipAddress } = data;

    if (!code.trim() || !name.trim()) {
      return { success: false, error: "กรุณากรอกรหัสประเภทย่อยและรุ่นอุปกรณ์" };
    }

    // หากมีการเปลี่ยนรหัสย่อย ต้องเช็กไม่ให้ซ้ำกับตัวอื่นในเครื่องและหมวดหมู่เดียวกัน
    const checkRes = await pool.query(
      "SELECT id FROM subcategories WHERE machine_id = $1 AND category_id = $2 AND code = $3 AND id <> $4;",
      [machineId, categoryId, code.trim(), id]
    );
    if (checkRes.rows.length > 0) {
      return { success: false, error: "มีรหัสประเภทย่อยนี้ของเครื่องจักรและหมวดหมู่นี้แล้ว" };
    }

    await pool.query(
      `UPDATE subcategories 
       SET code = $1, name = $2, description = $3, ip_address = $4 
       WHERE id = $5;`,
      [code.trim(), name.trim(), description.trim() || null, ipAddress?.trim() || null, id]
    );

    revalidatePath(`/categories/${machineId}/${categoryId}`);
    revalidatePath("/upload");
    revalidatePath("/files");

    return { success: true };
  } catch (err: any) {
    console.error("Error updating subcategory in server action:", err.message);
    return {
      success: false,
      error: err.message || "เกิดข้อผิดพลาดในการแก้ไขข้อมูลประเภทย่อย",
    };
  }
}

export async function deleteSubcategory(
  id: number,
  categoryId: string,
  machineId: string
): Promise<CategoryActionResponse> {
  try {
    if (!(await checkAdminSession())) {
      return { success: false, error: "กรุณาเข้าสู่ระบบก่อนทำรายการนี้" };
    }
    await pool.query("DELETE FROM subcategories WHERE id = $1;", [id]);

    revalidatePath(`/categories/${machineId}/${categoryId}`);
    revalidatePath("/upload");
    revalidatePath("/files");

    return { success: true };
  } catch (err: any) {
    console.error("Error deleting subcategory in server action:", err.message);
    return {
      success: false,
      error: err.message || "เกิดข้อผิดพลาดในการลบประเภทย่อย",
    };
  }
}
