import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Breadcrumb from "@/components/layout/Breadcrumb";
import AddMachineButton from "@/components/machine/AddMachineButton";
import MachineTable from "@/components/machine/MachineTable";
import { pool } from "@/lib/db";
import { cookies } from "next/headers";

export default async function CategoriesPage() {
  const isLoggedIn = cookies().get("session_token")?.value === "AdminToken";
  let machines: any[] = [];
  let dbError: string | null = null;

  try {
    const res = await pool.query(`
      SELECT 
        m.id, 
        m.name, 
        m.description, 
        COUNT(f.id)::int AS "filesCount"
      FROM machines m
      LEFT JOIN plc_files f ON m.id = f.machine_id
      GROUP BY m.id, m.name, m.description
      ORDER BY m.id;
    `);
    machines = res.rows;
  } catch (err: any) {
    console.error("Database connection error in Categories page:", err.message);
    dbError = err.message;
  }

  return (
    <>
      <Header />
      <Sidebar />
      <main className="ml-[280px] mt-16 p-8 min-h-screen bg-surface-container-lowest">
        <div className="max-w-[1400px] mx-auto">
          {/* ส่วนหัวของหน้าจอ */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <Breadcrumb />
              <h1 className="font-headline-lg text-headline-lg text-on-surface mt-2">
                เลือกเครื่องจักร
              </h1>
              <p className="text-body-md text-on-surface-variant mt-1">
                กรุณาเลือกเครื่องจักรที่คุณต้องการจัดการหรือเข้าดูรายละเอียดชนิดไฟล์ซอฟต์แวร์และหมวดหมู่ย่อย
              </p>
            </div>
            {isLoggedIn && (
              <div>
                <AddMachineButton />
              </div>
            )}
          </div>

          {/* แจ้งเตือนข้อผิดพลาดฐานข้อมูล */}
          {dbError && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl border border-error/20 flex gap-3 items-center">
              <span className="material-symbols-outlined text-error text-[24px]">
                warning
              </span>
              <div>
                <h3 className="font-title-md text-title-md">เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล</h3>
                <p className="font-body-md text-body-md opacity-90">{dbError}</p>
              </div>
            </div>
          )}

          {/* ตารางแสดงรายการเครื่องจักรสำหรับนำทาง */}
          <MachineTable rows={machines} isLoggedIn={isLoggedIn} mode="manage" />
        </div>
      </main>
    </>
  );
}
