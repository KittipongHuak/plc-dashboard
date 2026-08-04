import Modal from "../ui/Modal";
import Button from "../ui/Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
  loading = false,
}: ConfirmDialogProps) {
  const footerActions = (
    <>
      <Button variant="outline" onClick={onClose} disabled={loading}>
        {cancelText}
      </Button>
      <Button variant="error" onClick={onConfirm} loading={loading}>
        {confirmText}
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footerActions={footerActions}>
      <p className="text-body-md text-on-surface-variant">{message}</p>
    </Modal>
  );
}
