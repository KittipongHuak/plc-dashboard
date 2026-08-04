import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { pool } from "@/lib/db";
import Link from "next/link";

export default async function CategoriesPage() {
  let machines: any[] = [];
  let dbError: string | null = null;

  try {
    const res = await pool.query("SELECT id, name, description FROM machines ORDER BY id;");
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
          <div className="mb-8">
            <Breadcrumb />
            <h1 className="font-headline-lg text-headline-lg text-on-surface mt-2">
              เลือกเครื่องจักร
            </h1>
            <p className="text-body-md text-on-surface-variant mt-1">
              กรุณาเลือกเครื่องจักรที่คุณต้องการจัดการหรือเข้าดูรายละเอียดชนิดไฟล์ซอฟต์แวร์และหมวดหมู่ย่อย
            </p>
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
          <div className="overflow-x-auto border border-outline-variant rounded-xl bg-white shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-left">
                    รหัสเครื่องจักร
                  </th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-left">
                    ชื่อเครื่องจักร
                  </th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-left">
                    รายละเอียดเครื่องจักร
                  </th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-center">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {machines.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-body-md text-on-surface-variant">
                      ไม่พบข้อมูลเครื่องจักรในระบบ
                    </td>
                  </tr>
                ) : (
                  machines.map((machine) => (
                    <tr key={machine.id} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="px-6 py-4 text-body-md font-bold text-primary text-left">
                        {machine.id}
                      </td>
                      <td className="px-6 py-4 text-body-md font-semibold text-left">
                        <Link 
                          href={`/categories/${machine.id}`} 
                          className="text-primary hover:underline font-semibold"
                        >
                          {machine.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-body-md text-left text-on-surface-variant max-w-md truncate" title={machine.description || ""}>
                        {machine.description || "-"}
                      </td>
                      <td className="px-6 py-4 text-body-md text-center">
                        <Link href={`/categories/${machine.id}`}>
                          <button className="px-4 py-2 border border-outline hover:bg-surface-container-low transition-colors rounded-lg text-label-lg font-semibold text-primary">
                            เลือกประเภทหลัก
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
