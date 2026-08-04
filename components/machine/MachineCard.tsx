import Link from "next/link";
import Button from "../ui/Button";

interface MachineCardProps {
  id: string;
  name: string;
  description?: string;
  filesCount?: number;
}

export default function MachineCard({
  id,
  name,
  description,
  filesCount = 0,
}: MachineCardProps) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4">
      <div>
        <div className="flex items-start justify-between mb-3">
          <span className="bg-primary-container text-on-primary-container text-label-sm px-2.5 py-0.5 rounded-full font-bold">
            {id}
          </span>
          <span className="text-body-sm text-on-surface-variant font-semibold">
            {filesCount} ไฟล์ซอฟต์แวร์
          </span>
        </div>
        <h3 className="font-title-lg text-title-lg text-on-surface mb-2">
          {name}
        </h3>
        {description && (
          <p className="text-body-md text-on-surface-variant line-clamp-2">
            {description}
          </p>
        )}
      </div>
      <div className="pt-2 border-t border-outline-variant">
        <Link href={`/machines/${id}`} className="w-full">
          <Button variant="outline" size="sm" className="w-full" icon="arrow_forward">
            ดูรายละเอียด
          </Button>
        </Link>
      </div>
    </div>
  );
}
