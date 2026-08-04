import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Breadcrumb from "@/components/layout/Breadcrumb";
import SettingsForm from "@/components/settings/SettingsForm";
import { getSettings } from "./actions";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <>
      <Header />
      <Sidebar />
      <main className="ml-[280px] mt-16 p-8 min-h-screen bg-surface-container-lowest">
        <div className="max-w-[1400px] mx-auto">
          {/* แถบนำทางด้านบน */}
          <div className="mb-8">
            <Breadcrumb />
            <h1 className="font-headline-lg text-headline-lg text-on-surface mt-2">
              ตั้งค่าระบบ
            </h1>
            <p className="text-body-md text-on-surface-variant mt-1">
              ปรับเปลี่ยนและตั้งค่าพารามิเตอร์การจัดเก็บไฟล์ซอฟต์แวร์ของโปรเจกต์
            </p>
          </div>

          {/* ฟอร์มสำหรับการกรอกประเภทไฟล์และขนาดไฟล์อัปโหลด */}
          <SettingsForm initialSettings={settings} />
        </div>
      </main>
    </>
  );
}
