import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Breadcrumb from "@/components/layout/Breadcrumb";
import FileFilters from "@/components/file/FileFilters";
import FileTable from "@/components/file/FileTable";
import { pool } from "@/lib/db";
import { cookies } from "next/headers";

interface FilesPageProps {
  searchParams: {
    search?: string;
    machineId?: string;
    categoryId?: string;
  };
}

export default async function FilesPage({ searchParams }: FilesPageProps) {
  const { search, machineId, categoryId } = searchParams;
  const isLoggedIn = cookies().get("session_token")?.value === "AdminToken";

  let files: any[] = [];
  let machines: any[] = [];
  let categories: any[] = [];
  let subcategories: any[] = [];
  let dbError: string | null = null;

  try {
    // 1. ดึงรายการเครื่องจักรและประเภทไฟล์ทั้งหมดสำหรับตัวเลือกฟิลเตอร์
    const machinesRes = await pool.query("SELECT id, name FROM machines ORDER BY id;");
    machines = machinesRes.rows;

    const categoriesRes = await pool.query("SELECT id, name FROM categories ORDER BY id;");
    categories = categoriesRes.rows;

    const subcategoriesRes = await pool.query("SELECT id, machine_id, category_id, code, name FROM subcategories ORDER BY name;");
    subcategories = subcategoriesRes.rows;

    // 2. ดึงรายการไฟล์พร้อมการประยุกต์ใช้ตัวกรอง
    const searchPattern = search ? `%${search}%` : null;
    const machineIdFilter = machineId || null;
    const categoryIdFilter = categoryId || null;

    const query = `
      SELECT 
        f.id,
        f.file_name,
        f.file_extension,
        f.version,
        f.file_size,
        f.upload_by,
        f.upload_date,
        f.remark,
        f.subcategory_id,
        m.id AS machine_id,
        m.name AS machine_name,
        c.id AS category_id,
        c.name AS category_name,
        s.name AS subcategory_name,
        (f.version = (
          SELECT MAX(f2.version) 
          FROM plc_files f2 
          WHERE f2.machine_id = f.machine_id 
            AND f2.category_id = f.category_id 
            AND (f2.subcategory_id IS NOT DISTINCT FROM f.subcategory_id)
        )) AS is_latest
      FROM plc_files f
      JOIN machines m ON f.machine_id = m.id
      JOIN categories c ON f.category_id = c.id
      LEFT JOIN subcategories s ON f.subcategory_id = s.id
      WHERE 
        ($1::text IS NULL OR f.file_name ILIKE $1) AND
        ($2::text IS NULL OR f.machine_id = $2) AND
        ($3::text IS NULL OR f.category_id = $3)
      ORDER BY f.upload_date DESC;
    `;

    const filesRes = await pool.query(query, [searchPattern, machineIdFilter, categoryIdFilter]);
    files = filesRes.rows;
  } catch (err: any) {
    console.error("Database connection error in Files page:", err.message);
    dbError = err.message;
  }

  return (
    <>
      <Header />
      <Sidebar />
      <main className="ml-[280px] mt-16 p-8 min-h-screen bg-surface-container-lowest">
        <div className="max-w-[1400px] mx-auto">
          {/* ส่วนหัวหน้าเว็บ */}
          <div className="mb-8">
            <Breadcrumb />
            <h1 className="font-headline-lg text-headline-lg text-on-surface mt-2">
              จัดการไฟล์ซอฟต์แวร์ทั้งหมด
            </h1>
            <p className="text-body-md text-on-surface-variant mt-1">
              สืบค้น ค้นหา ดาวน์โหลด หรือจัดการรายการไฟล์โปรแกรม PLC/HMI และ Parameter ทั้งหมดที่มีในระบบ
            </p>
          </div>

          {/* แจ้งเตือนกรณีเกิดข้อผิดพลาดฐานข้อมูล */}
          {dbError && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl border border-error/20 flex gap-3 items-center">
              <span className="material-symbols-outlined text-error text-[24px]">
                warning
              </span>
              <div>
                <h3 className="font-title-md text-title-md">เกิดข้อผิดพลาดในการดึงข้อมูลไฟล์</h3>
                <p className="font-body-md text-body-md opacity-90">{dbError}</p>
              </div>
            </div>
          )}

          {/* ส่วนตัวกรองการค้นหา */}
          <FileFilters machines={machines} categories={categories} />

          {/* ตารางการจัดการไฟล์ */}
          <FileTable 
            rows={files} 
            isLoggedIn={isLoggedIn} 
            machines={machines}
            categories={categories}
            subcategories={subcategories}
          />
        </div>
      </main>
    </>
  );
}
