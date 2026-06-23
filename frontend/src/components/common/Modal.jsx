import { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  actionLabel,
  onAction,
  actionVariant = 'primary',
  isActionLoading = false,
  isDisabled = false
}) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className={`w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] ${sizes[size]} animate-scale-up`}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>

        {/* Footer */}
        {(actionLabel || onClose) && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
            {onClose && (
              <Button variant="outline" onClick={onClose} disabled={isActionLoading}>
                Batal
              </Button>
            )}
            {actionLabel && (
              <Button
                variant={actionVariant}
                onClick={onAction}
                isLoading={isActionLoading}
                disabled={isDisabled}
              >
                {actionLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
