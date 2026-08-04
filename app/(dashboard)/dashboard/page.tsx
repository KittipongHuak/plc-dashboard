import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Breadcrumb from "@/components/layout/Breadcrumb";
import SummaryCard from "@/components/dashboard/SummaryCard";
import StorageCard from "@/components/dashboard/StorageCard";
import RecentActivity, { ActivityRow } from "@/components/dashboard/RecentActivity";
import SystemHealth from "@/components/dashboard/SystemHealth";
import { pool } from "@/lib/db";

// ฟังก์ชันแปลงขนาดไฟล์เป็นหน่วยที่อ่านง่าย
function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return { value: "0", unit: "Bytes" };
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
  return {
    value: value.toLocaleString("en-US"),
    unit: sizes[i],
  };
}

// ฟังก์ชันหาเวลาสัมพัทธ์ (เช่น 5 นาทีที่แล้ว)
function getRelativeTimeString(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 1) return "เมื่อครู่นี้";
  if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "เมื่อวานนี้";
  return `${diffDays} วันที่แล้ว`;
}

export default async function DashboardPage() {
  const updatedDate = new Date().toLocaleDateString("th-TH-u-ca-buddhist", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ข้อมูลตั้งต้นสำหรับกรณีเกิดข้อผิดพลาด
  let dbError: string | null = null;
  let metrics = {
    totalMachines: "0",
    totalFiles: "0",
    totalVersions: "0",
    storageValue: "0",
    storageUnit: "GB",
    storageProgress: 0,
    lastUploadText: "ไม่มีข้อมูล",
  };
  let recentActivities: ActivityRow[] = [];

  try {
    // 1. ดึงจำนวนเครื่องจักรทั้งหมด
    const machinesRes = await pool.query("SELECT COUNT(*) AS count FROM machines;");
    metrics.totalMachines = machinesRes.rows[0].count;

    // 2. ดึงจำนวนไฟล์ซอฟต์แวร์ทั้งหมด (นับเฉพาะชื่อไฟล์ที่ไม่ซ้ำกันในแต่ละเครื่องและประเภท)
    const filesRes = await pool.query(
      "SELECT COUNT(DISTINCT (machine_id, category_id, file_name)) AS count FROM plc_files;"
    );
    metrics.totalFiles = filesRes.rows[0].count;

    // 3. ดึงจำนวนเวอร์ชันทั้งหมด (ประวัติการอัปโหลดทั้งหมด)
    const versionsRes = await pool.query("SELECT COUNT(*) AS count FROM plc_files;");
    metrics.totalVersions = versionsRes.rows[0].count;

    // 4. คำนวณพื้นที่จัดเก็บ (รวมขนาดไฟล์ทั้งหมด)
    const storageRes = await pool.query("SELECT SUM(file_size) AS total_size FROM plc_files;");
    const totalBytes = parseInt(storageRes.rows[0].total_size || "0", 10);
    const formattedStorage = formatBytes(totalBytes);
    metrics.storageValue = formattedStorage.value;
    metrics.storageUnit = formattedStorage.unit;
    
    // คำนวณความคืบหน้าการใช้พื้นที่ (สมมติความจุเต็ม 10 GB)
    const maxCapacity = 10 * 1024 * 1024 * 1024; // 10 GB
    metrics.storageProgress = Math.min(Math.round((totalBytes / maxCapacity) * 100), 100);

    // 5. ดึงข้อมูลไฟล์ล่าสุดที่เพิ่งอัปโหลด
    const lastUploadRes = await pool.query(
      "SELECT upload_date FROM plc_files ORDER BY upload_date DESC LIMIT 1;"
    );
    if (lastUploadRes.rows.length > 0) {
      const lastUploadDate = new Date(lastUploadRes.rows[0].upload_date);
      metrics.lastUploadText = getRelativeTimeString(lastUploadDate);
    }

    // 6. ดึงข้อมูล 5 รายการล่าสุดมาแสดงใน RecentActivity (ร่วมกับดึงประเภทไฟล์ย่อยและหมายเหตุ)
    const recentRes = await pool.query(`
      SELECT 
        f.file_name, 
        f.file_extension,
        m.name AS machine_name, 
        f.version, 
        c.name AS category_name, 
        s.name AS subcategory_name,
        f.remark,
        f.upload_by,
        f.upload_date
      FROM plc_files f
      JOIN machines m ON f.machine_id = m.id
      JOIN categories c ON f.category_id = c.id
      LEFT JOIN subcategories s ON f.subcategory_id = s.id
      ORDER BY f.upload_date DESC
      LIMIT 5;
    `);

    recentActivities = recentRes.rows.map((row): ActivityRow => ({
      fileName: `${row.file_name}${row.file_extension}`,
      machine: row.machine_name,
      version: `v${row.version}`,
      category: row.subcategory_name 
        ? `${row.category_name} (${row.subcategory_name})`
        : row.category_name,
      uploadDate: new Date(row.upload_date).toLocaleString("th-TH"),
      remark: row.remark || "",
      uploader: row.upload_by,
    }));

  } catch (error: any) {
    console.error("Database connection error in Dashboard:", error.message);
    dbError = error.message;
  }

  return (
    <>
      <Header />
      <Sidebar />
      <main className="ml-[280px] mt-16 p-8 min-h-screen bg-surface-container-lowest">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <Breadcrumb />
              <h1 className="font-headline-lg text-headline-lg text-on-surface">
                สรุปภาพรวมระบบ
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                ข้อมูลอัปเดตเรียลไทม์ ณ วันที่ {updatedDate}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-label-md font-label-md hover:opacity-90 shadow-sm">
                <span className="material-symbols-outlined text-[20px]">
                  sync
                </span>
                ซิงค์ข้อมูล
              </button>
            </div>
          </div>

          {/* Database Connection Alert */}
          {dbError && (
            <div className="mb-8 p-4 bg-error-container text-on-error-container rounded-xl border border-error/20 flex gap-3 items-center">
              <span className="material-symbols-outlined text-error text-[24px]">
                warning
              </span>
              <div>
                <h3 className="font-title-md text-title-md">เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล</h3>
                <p className="font-body-md text-body-md opacity-90">{dbError}</p>
              </div>
            </div>
          )}

          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
            <SummaryCard
              icon="precision_manufacturing"
              label="เครื่องจักรทั้งหมด"
              value={metrics.totalMachines}
              unit="หน่วย"
            />
            <SummaryCard
              icon="description"
              label="ไฟล์ซอฟต์แวร์"
              value={metrics.totalFiles}
              unit="ไฟล์"
            />
            <SummaryCard
              icon="history_edu"
              label="เวอร์ชันประวัติ"
              value={metrics.totalVersions}
              unit="รายการ"
            />
            <StorageCard
              value={metrics.storageValue}
              unit={metrics.storageUnit}
              progress={metrics.storageProgress}
            />
            <SummaryCard
              icon="upload_file"
              label="อัปโหลดล่าสุด"
              value={metrics.lastUploadText}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-4">
              <RecentActivity rows={recentActivities} />
            </div>
            <div className="lg:col-span-4 mt-8">
              <SystemHealth />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
