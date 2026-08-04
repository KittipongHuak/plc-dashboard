import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Breadcrumb from "@/components/layout/Breadcrumb";

export default function ReportPage() {
  return (
    <>
      <Header />
      <Sidebar />
      <main className="ml-[280px] mt-16 p-8 min-h-screen bg-surface-container-lowest">
        <div className="max-w-[1400px] mx-auto">
          <Breadcrumb />
          <h1 className="font-headline-lg text-headline-lg text-on-surface mt-2">
            รายงานสรุปข้อมูล
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1 mb-8">
            สรุปการเคลื่อนไหว เวอร์ชัน และสถิติต่างๆ ของไฟล์ในระบบ
          </p>

          <div className="bg-white border border-outline-variant rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4">
            <span className="material-symbols-outlined text-[64px] text-primary bg-primary-container/10 p-4 rounded-full">
              assessment
            </span>
            <h2 className="font-title-lg text-title-lg text-on-surface">
              โมดูลรายงานสรุป (อยู่ระหว่างการพัฒนา)
            </h2>
            <p className="text-body-md text-on-surface-variant max-w-md">
              คุณสามารถสร้างรายงาน สถิติการเปลี่ยนแปลง ซอฟต์แวร์ และข้อมูลขนาดพื้นที่จัดเก็บแบบรายปี/รายเดือนได้ที่นี่เร็วๆ นี้
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
