import { ReactNode } from "react";
import Button from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footerActions?: ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footerActions,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xl max-w-lg w-full z-10 overflow-hidden flex flex-col animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-white">
          <h3 className="font-title-lg text-title-lg text-on-surface flex items-center gap-2">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto max-h-[70vh] text-body-md text-on-surface-variant">
          {children}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-low flex items-center justify-end gap-3">
          {footerActions ? (
            footerActions
          ) : (
            <Button variant="outline" onClick={onClose}>
              ปิด
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
