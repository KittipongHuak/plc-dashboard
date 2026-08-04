import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Breadcrumb from "@/components/layout/Breadcrumb";
import SubcategoryTable from "@/components/category/SubcategoryTable";
import AddSubcategoryButton from "@/components/category/AddSubcategoryButton";
import { pool } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";

interface SubcategoriesDetailPageProps {
  params: {
    machineId: string;
    categoryId: string;
  };
}

export default async function SubcategoriesDetailPage({ params }: SubcategoriesDetailPageProps) {
  const { machineId, categoryId } = params;

  let machine: any = null;
  let category: any = null;
  let subcategories: any[] = [];
  let dbError: string | null = null;

  try {
    // 1. ดึงรายละเอียดเครื่องจักร
    const machineRes = await pool.query("SELECT * FROM machines WHERE id = $1;", [machineId]);
    if (machineRes.rows.length === 0) {
      notFound();
    }
    machine = machineRes.rows[0];

    // 2. ดึงรายละเอียดประเภทไฟล์หลัก
    const categoryRes = await pool.query("SELECT * FROM categories WHERE id = $1;", [categoryId]);
    if (categoryRes.rows.length === 0) {
      notFound();
    }
    category = categoryRes.rows[0];

    // 3. ดึงรายการประเภทย่อยทั้งหมดของหลักนี้ (ระบุตามเครื่องจักรหลัก)
    const subRes = await pool.query(
      "SELECT id, code, name, description FROM subcategories WHERE machine_id = $1 AND category_id = $2 ORDER BY code;",
      [machineId, categoryId]
    );
    subcategories = subRes.rows;
  } catch (err: any) {
    console.error("Database connection error in Subcategories Detail page:", err.message);
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
                  ชนิดหลัก: {category?.name}
                </span>
                รหัสย่อยชนิดไฟล์ (Subcategories)
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href={`/categories/${machineId}`}>
                <button className="flex items-center gap-2 px-4 py-2 border border-outline text-on-surface hover:bg-surface-container-low transition-colors rounded-lg font-label-lg font-semibold">
                  <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                  กลับหน้าเลือกประเภทหลัก
                </button>
              </Link>
              
              {category && (
                <AddSubcategoryButton
                  categoryId={category.id}
                  categoryName={category.name}
                  machineId={machineId}
                />
              )}
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

          {/* การ์ดข้อมูลเครื่องจักรและหมวดหมู่หลัก */}
          {machine && category && (
            <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl shadow-sm">
              <h3 className="font-title-lg text-title-lg text-on-surface mb-4">ข้อมูลเชื่อมโยงหลัก</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-label-md text-on-surface-variant">เครื่องจักรที่เลือก</p>
                  <p className="text-body-lg font-semibold text-primary mt-1">{machine.name} ({machine.id})</p>
                </div>
                <div>
                  <p className="text-label-md text-on-surface-variant">ประเภทหลักของไฟล์</p>
                  <p className="text-body-lg font-semibold text-on-surface mt-1">{category.name} ({category.id})</p>
                </div>
              </div>
            </div>
          )}

          {/* รายการหมวดหมู่ย่อย */}
          {category && (
            <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-outline-variant pb-3">
                <h3 className="font-title-lg text-title-lg text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">schema</span>
                  หมวดหมู่ย่อยทั้งหมด
                </h3>
              </div>

              <SubcategoryTable
                categoryId={category.id}
                machineId={machineId}
                rows={subcategories.map((sub) => ({
                  id: sub.id,
                  code: sub.code,
                  name: sub.name,
                  description: sub.description || "",
                }))}
              />
            </div>
          )}

        </div>
      </main>
    </>
  );
}
