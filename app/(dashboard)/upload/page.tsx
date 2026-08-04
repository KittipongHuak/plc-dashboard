import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Breadcrumb from "@/components/layout/Breadcrumb";
import UploadForm from "@/components/upload/UploadForm";
import { pool } from "@/lib/db";

export default async function UploadPage() {
  let machines: { id: string; name: string }[] = [];
  let categories: { id: string; name: string }[] = [];
  let subcategories: { id: string; category_id: string; name: string }[] = [];
  let uploadSettings = {
    allowed_extensions: ".hex,.bin,.sys,.txt,.zip,.rar,.config,.param",
    max_file_size_mb: "50",
  };
  let dbError: string | null = null;

  try {
    const machinesRes = await pool.query("SELECT id, name FROM machines ORDER BY id;");
    machines = machinesRes.rows;

    const categoriesRes = await pool.query("SELECT id, name FROM categories ORDER BY id;");
    categories = categoriesRes.rows;

    const subcategoriesRes = await pool.query("SELECT id, machine_id, category_id, code, name FROM subcategories ORDER BY name;");
    subcategories = subcategoriesRes.rows;

    const settingsRes = await pool.query("SELECT key, value FROM settings;");
    settingsRes.rows.forEach((row) => {
      if (row.key === "allowed_extensions") uploadSettings.allowed_extensions = row.value;
      if (row.key === "max_file_size_mb") uploadSettings.max_file_size_mb = row.value;
    });
  } catch (err: any) {
    console.error("Database connection error in Upload page:", err.message);
    dbError = err.message;
  }

  return (
    <>
      <Header />
      <Sidebar />
      <main className="ml-[280px] mt-16 p-8 min-h-screen bg-surface-container-lowest">
        <div className="max-w-[1400px] mx-auto">
          {/* Breadcrumbs / Header */}
          <div className="mb-8">
            <Breadcrumb />
            <h1 className="font-headline-lg text-headline-lg text-on-surface mt-2">
              จัดการซอฟต์แวร์
            </h1>
          </div>

          {/* Database connection alert in case of failure */}
          {dbError && (
            <div className="max-w-3xl mx-auto mb-6 p-4 bg-error-container text-on-error-container rounded-xl border border-error/20 flex gap-3 items-center">
              <span className="material-symbols-outlined text-error text-[24px]">
                warning
              </span>
              <div>
                <h3 className="font-title-md text-title-md">เกิดข้อผิดพลาดในการโหลดตัวเลือกฐานข้อมูล</h3>
                <p className="font-body-md text-body-md opacity-90">{dbError}</p>
              </div>
            </div>
          )}

          {/* ฟอร์มอัปโหลดข้อมูล */}
          <UploadForm 
            machines={machines} 
            categories={categories} 
            subcategories={subcategories}
            allowedExtensions={uploadSettings.allowed_extensions}
            maxFileSizeMb={parseFloat(uploadSettings.max_file_size_mb) || 50}
          />
        </div>
      </main>
    </>
  );
}
