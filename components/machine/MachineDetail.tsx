import Link from "next/link";
import Button from "../ui/Button";

interface MachineDetailProps {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  filesCount?: number;
}

export default function MachineDetail({
  id,
  name,
  description,
  created_at,
  filesCount = 0,
}: MachineDetailProps) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-4">
        <div>
          <span className="bg-primary-container text-on-primary-container text-label-md px-3 py-1 rounded-full font-bold">
            รหัสเครื่องจักร: {id}
          </span>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mt-3">
            {name}
          </h2>
        </div>
        <div className="flex gap-2">
          <Link href="/machines">
            <Button variant="outline" icon="arrow_back">
              กลับหน้าเครื่องจักรทั้งหมด
            </Button>
          </Link>
          <Link href={`/upload?machineId=${id}`}>
            <Button variant="primary" icon="upload">
              อัปโหลดไฟล์สำหรับเครื่องนี้
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-title-md text-title-md text-on-surface mb-2">รายละเอียดทางเทคนิค</h3>
          <p className="text-body-md text-on-surface-variant bg-surface-container-low rounded-xl p-4 min-h-[100px]">
            {description || "ไม่มีข้อมูลรายละเอียดเครื่องจักร"}
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="font-title-md text-title-md text-on-surface mb-1">จำนวนไฟล์ในประวัติ</h3>
            <p className="text-headline-md font-headline-md text-primary">{filesCount} ไฟล์</p>
          </div>
          {created_at && (
            <div>
              <h3 className="font-title-md text-title-md text-on-surface mb-1">วันที่ลงทะเบียนระบบ</h3>
              <p className="text-body-md text-on-surface-variant">{created_at}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
