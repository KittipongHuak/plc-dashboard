interface FilePreviewProps {
  file: File;
  onRemove: () => void;
  disabled: boolean;
}

export default function FilePreview({ file, onRemove, disabled }: FilePreviewProps) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="border border-outline-variant bg-surface-container-low rounded-xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-[36px] text-primary">
          description
        </span>
        <div>
          <p className="text-body-md font-semibold text-on-surface truncate max-w-md">
            {file.name}
          </p>
          <p className="text-label-md text-on-surface-variant">
            ขนาด: {formatBytes(file.size)}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-full transition-all"
        disabled={disabled}
      >
        <span className="material-symbols-outlined text-[20px]">
          close
        </span>
      </button>
    </div>
  );
}
