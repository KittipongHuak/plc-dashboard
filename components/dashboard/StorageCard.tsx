interface StorageCardProps {
  icon?: string;
  label?: string;
  value: string;
  unit: string;
  progress: number;
}

export default function StorageCard({
  icon = "database",
  label = "พื้นที่จัดเก็บ",
  value,
  unit,
  progress,
}: StorageCardProps) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl storage-card flex flex-col justify-between min-h-[140px]">
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 bg-primary-container/10 rounded-lg">
            <span className="material-symbols-outlined text-primary text-[24px]">
              {icon}
            </span>
          </div>
          <span className="bg-primary-container text-on-primary-container text-[11px] font-bold px-2 py-0.5 rounded-full">
            {progress}% ใช้ไป
          </span>
        </div>
        <p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">
          {label}
        </p>
      </div>
      <div className="mt-2">
        <div className="flex items-baseline gap-1">
          <span className="text-headline-md font-headline-md">{value}</span>
          <span className="text-body-sm text-on-surface-variant">{unit}</span>
        </div>
        <div className="w-full h-1.5 bg-surface-container-highest rounded-full mt-2 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
