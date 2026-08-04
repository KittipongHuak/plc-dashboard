export interface ActivityRow {
  fileName: string;
  machine: string;
  version: string;
  category: string;
  subcategory: string;
  uploader: string;
}

interface RecentActivityProps {
  rows?: ActivityRow[];
}

const columns = [
  "รายละเอียดไฟล์",
  "เครื่องจักร",
  "เวอร์ชัน",
  "ประเภทไฟล์หลัก",
  "ประเภทไฟล์ย่อย",
  "ผู้อัปโหลด",
];

export default function RecentActivity({ rows = [] }: RecentActivityProps) {
  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
      <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center bg-white">
        <h2 className="font-title-lg text-title-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            dynamic_feed
          </span>
          ความเคลื่อนไหวล่าสุด
        </h2>
        <button className="text-primary font-label-md text-label-md flex items-center gap-1 hover:underline">
          ดูทั้งหมด
          <span className="material-symbols-outlined text-[16px]">
            chevron_right
          </span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-low/50 border-b border-outline-variant">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-10 text-center text-body-md text-on-surface-variant"
                >
                  ยังไม่มีความเคลื่อนไหว — อัปโหลดไฟล์ซอฟต์แวร์เพื่อเริ่มติดตามที่นี่
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={i} className="hover:bg-surface-container-low/40">
                  <td className="px-6 py-4 text-body-md">{row.fileName}</td>
                  <td className="px-6 py-4 text-body-md">{row.machine}</td>
                  <td className="px-6 py-4 text-body-md font-code-sm">
                    {row.version}
                  </td>
                  <td className="px-6 py-4 text-body-md">
                    {row.category}
                  </td>
                  <td className="px-6 py-4 text-body-md text-on-surface-variant font-semibold">
                    {row.subcategory || "-"}
                  </td>
                  <td className="px-6 py-4 text-body-md">{row.uploader}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
