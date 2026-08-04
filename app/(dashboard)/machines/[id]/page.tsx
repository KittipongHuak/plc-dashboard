import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Breadcrumb from "@/components/layout/Breadcrumb";
import MachineDetail from "@/components/machine/MachineDetail";
import VersionTable from "@/components/version/VersionTable";
import { pool } from "@/lib/db";
import { notFound } from "next/navigation";

// ฟังก์ชันจัดรูปแบบขนาดไฟล์
const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

interface MachineDetailPageProps {
  params: {
    id: string;
  };
}

export default async function MachineDetailPage({ params }: MachineDetailPageProps) {
  const { id } = params;

  let machine: any = null;
  let files: any[] = [];
  let dbError: string | null = null;

  try {
    // 1. ดึงรายละเอียดเครื่องจักร
    const machineRes = await pool.query("SELECT * FROM machines WHERE id = $1;", [id]);
    if (machineRes.rows.length === 0) {
      notFound(); // จะแสดงหน้า 404 ของ Next.js หากไม่พบรหัสเครื่องนี้
    }
    machine = machineRes.rows[0];

    // 2. ดึงประวัติไฟล์โปรแกรมที่เคยอัปโหลดของเครื่องจักรนี้ (พร้อมข้อมูลประเภทย่อย)
    const filesRes = await pool.query(
      `SELECT 
        f.id,
        f.file_name,
        f.file_extension,
        f.version,
        f.file_size,
        f.remark,
        f.upload_by,
        f.upload_date,
        c.name AS category_name,
        s.code AS subcategory_code,
        s.name AS subcategory_name,
        s.ip_address AS subcategory_ip
       FROM plc_files f
       JOIN categories c ON f.category_id = c.id
       LEFT JOIN subcategories s ON f.subcategory_id = s.id
       WHERE f.machine_id = $1
       ORDER BY f.upload_date DESC;`,
      [id]
    );
    files = filesRes.rows;
  } catch (err: any) {
    console.error("Database connection error in Machine Detail page:", err.message);
    dbError = err.message;
  }

  // จัดกลุ่มไฟล์ประวัติตามชื่อประเภทไฟล์ย่อย (Subcategory) และประเภทหลัก
  const groupedFiles: Record<string, any[]> = {};
  files.forEach((file) => {
    let groupKey = "";
    if (file.subcategory_code) {
      groupKey = `${file.category_name} - ${file.subcategory_code}`;
      if (file.subcategory_name) {
        groupKey += ` (${file.subcategory_name})`;
      }
      if (file.subcategory_ip) {
        groupKey += ` [IP: ${file.subcategory_ip}]`;
      }
    } else {
      groupKey = `${file.category_name} - ทั่วไป`;
    }

    if (!groupedFiles[groupKey]) {
      groupedFiles[groupKey] = [];
    }
    groupedFiles[groupKey].push(file);
  });

  const createdDateStr = machine?.created_at
    ? new Date(machine.created_at).toLocaleDateString("th-TH")
    : null;

  return (
    <>
      <Header />
      <Sidebar />
      <main className="ml-[280px] mt-16 p-8 min-h-screen bg-surface-container-lowest">
        <div className="max-w-[1400px] mx-auto space-y-8">
          <div>
            <Breadcrumb />
          </div>

          {/* Alert แสดงข้อผิดพลาดฐานข้อมูล */}
          {dbError && (
            <div className="p-4 bg-error-container text-on-error-container rounded-xl border border-error/20 flex gap-3 items-center">
              <span className="material-symbols-outlined text-error text-[24px]">
                warning
              </span>
              <div>
                <h3 className="font-title-md text-title-md">เกิดข้อผิดพลาดในการโหลดข้อมูล</h3>
                <p className="font-body-md text-body-md opacity-90">{dbError}</p>
              </div>
            </div>
          )}

          {/* รายละเอียดเครื่องจักร */}
          {machine && (
            <MachineDetail
              id={machine.id}
              name={machine.name}
              description={machine.description}
              created_at={createdDateStr || undefined}
              filesCount={files.length}
            />
          )}

          {/* ตารางประวัติเวอร์ชันไฟล์ซอฟต์แวร์ แยกตามประเภทไฟล์ */}
          {machine && (
            <div className="space-y-6">
              {Object.keys(groupedFiles).length === 0 ? (
                <div className="bg-surface-container-lowest border border-outline-variant p-8 rounded-2xl shadow-sm text-center text-body-md text-on-surface-variant">
                  ยังไม่มีการอัปโหลดไฟล์ประวัติใดๆ สำหรับเครื่องจักรนี้
                </div>
              ) : (
                Object.entries(groupedFiles).map(([categoryName, catFiles]) => {
                  const versionRows = catFiles.map((file) => ({
                    id: file.id,
                    version: `v${file.version}`,
                    uploadBy: file.upload_by,
                    uploadDate: new Date(file.upload_date).toLocaleString("th-TH"),
                    fileSize: formatBytes(parseInt(file.file_size, 10)),
                    remark: file.remark || "",
                    fileName: `${file.file_name}${file.file_extension}`,
                  }));

                  return (
                    <div key={categoryName} className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl shadow-sm">
                      <VersionTable
                        categoryName={categoryName}
                        rows={versionRows}
                      />
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
