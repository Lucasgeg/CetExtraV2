type ModalProps = {
  show: boolean;
  onClose: () => void;
  /** Contenu du modal */
  children: React.ReactNode;
};

export function Modal({ show, onClose, children }: ModalProps) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
      onClick={onClose}
    >
      <div
        className="min-w-[300px] max-w-[90vw] rounded-lg bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
