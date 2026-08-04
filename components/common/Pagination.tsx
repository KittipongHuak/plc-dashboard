import Button from "../ui/Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant bg-white">
      <div className="text-body-sm text-on-surface-variant">
        หน้า <span className="font-semibold text-on-surface">{currentPage}</span> จาก{" "}
        <span className="font-semibold text-on-surface">{totalPages}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1 || disabled}
          onClick={() => onPageChange(currentPage - 1)}
          icon="chevron_left"
        >
          ก่อนหน้า
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages || disabled}
          onClick={() => onPageChange(currentPage + 1)}
          className="flex-row-reverse"
          icon="chevron_right"
        >
          ถัดไป
        </Button>
      </div>
    </div>
  );
}
