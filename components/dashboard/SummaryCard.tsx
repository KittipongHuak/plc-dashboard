interface SummaryCardProps {
  icon: string;
  label: string;
  value: string | number;
  unit?: string;
  badge?: string;
}

export default function SummaryCard({
  icon,
  label,
  value,
  unit,
  badge,
}: SummaryCardProps) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl summary-card flex flex-col justify-between min-h-[140px]">
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 bg-primary-container/10 rounded-lg">
            <span className="material-symbols-outlined text-primary text-[24px]">
              {icon}
            </span>
          </div>
          {badge && (
            <span className="bg-tertiary-container text-on-tertiary-container text-[11px] font-bold px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">
          {label}
        </p>
      </div>
      {unit ? (
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-headline-md font-headline-md">{value}</span>
          <span className="text-body-sm text-on-surface-variant">{unit}</span>
        </div>
      ) : (
        <p className="text-title-md font-bold mt-2 truncate">{value}</p>
      )}
    </div>
  );
}
