interface HealthItem {
  label: string;
  detail: string;
  status: string;
  pulse?: boolean;
}

const items: HealthItem[] = [
  { label: "เซิร์ฟเวอร์หลัก", detail: "อัปไทม์ 99.9%", status: "ปกติ", pulse: true },
  { label: "ฐานข้อมูล", detail: "Latency 24ms", status: "ปกติ" },
];

export default function SystemHealth() {
  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 border-b border-outline-variant pb-3 gap-4">
        <h2 className="font-title-lg text-title-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            health_metrics
          </span>
          สถานะระบบ
        </h2>
        <button className="px-4 py-2 border border-outline text-on-surface-variant rounded-lg text-label-md font-semibold hover:bg-surface-container-low hover:text-primary transition-all flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[18px]">
            security
          </span>
          รายละเอียดความปลอดภัย
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-body-md font-semibold text-on-surface">
                {item.label}
              </span>
              <span className="flex h-2.5 w-2.5 rounded-full bg-tertiary relative">
                {item.pulse && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75" />
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-on-surface-variant">
                {item.detail}
              </span>
              <span className="text-label-md font-bold text-tertiary">
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
