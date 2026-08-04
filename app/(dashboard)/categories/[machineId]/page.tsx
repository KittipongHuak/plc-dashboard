import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Breadcrumb from "@/components/layout/Breadcrumb";
import CategoryTable from "@/components/category/CategoryTable";
import AddCategoryButton from "@/components/category/AddCategoryButton";
import { pool } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";

interface CategoriesByMachinePageProps {
  params: {
    machineId: string;
  };
}

export default async function CategoriesByMachinePage({ params }: CategoriesByMachinePageProps) {
  const { machineId } = params;

  let machine: any = null;
  let categories: any[] = [];
  let dbError: string | null = null;

  try {
    // 1. ดึงรายละเอียดเครื่องจักร
    const machineRes = await pool.query("SELECT * FROM machines WHERE id = $1;", [machineId]);
    if (machineRes.rows.length === 0) {
      notFound();
    }
    machine = machineRes.rows[0];

    // 2. ดึงประเภทไฟล์หลักทั้งหมดในระบบ
    const categoriesRes = await pool.query("SELECT * FROM categories ORDER BY id;");
    categories = categoriesRes.rows;
  } catch (err: any) {
    console.error("Database connection error in categories list by machine page:", err.message);
    dbError = err.message;
  }

  return (
    <>
      <Header />
      <Sidebar />
      <main className="ml-[280px] mt-16 p-8 min-h-screen bg-surface-container-lowest">
        <div className="max-w-[1400px] mx-auto space-y-8">
          
          {/* ส่วนนำทาง */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Breadcrumb />
              <h1 className="font-headline-lg text-headline-lg text-on-surface mt-2 flex items-center gap-2">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-body-md font-bold">
                  เครื่องจักร: {machine?.id}
                </span>
                {machine?.name}
              </h1>
              <p className="text-body-md text-on-surface-variant mt-1">
                จัดการประเภทหลัก เพิ่ม/แก้ไข/ลบ หรือเลือกประเภทซอฟต์แวร์เพื่อตั้งค่าหมวดหมู่ย่อย
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/categories">
                <button className="flex items-center gap-2 px-4 py-2 border border-outline text-on-surface hover:bg-surface-container-low transition-colors rounded-lg font-label-lg font-semibold">
                  <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                  กลับหน้าเลือกเครื่องจักร
                </button>
              </Link>
              <AddCategoryButton />
            </div>
          </div>

          {/* แจ้งเตือนข้อผิดพลาดฐานข้อมูล */}
          {dbError && (
            <div className="p-4 bg-error-container text-on-error-container rounded-xl border border-error/20 flex gap-3 items-center">
              <span className="material-symbols-outlined text-error text-[24px]">
                warning
              </span>
              <div>
                <h3 className="font-title-md text-title-md">เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล</h3>
                <p className="font-body-md text-body-md opacity-90">{dbError}</p>
              </div>
            </div>
          )}

          {/* ตารางแสดงรายการประเภทไฟล์หลัก (สามารถ แอด แก้ไข ลบ และนำทางได้) */}
          {machine && (
            <CategoryTable rows={categories} machineId={machineId} />
          )}

        </div>
      </main>
    </>
  );
}
