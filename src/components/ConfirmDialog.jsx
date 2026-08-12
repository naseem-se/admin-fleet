import { AlertTriangle } from 'lucide-react';

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', danger = true, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 animate-fadeIn">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg animate-scaleIn">
        <div className={`flex h-11 w-11 items-center justify-center rounded-full mb-4 ${danger ? 'bg-red-50' : 'bg-amber-50'}`}>
          <AlertTriangle className={danger ? 'text-red-600' : 'text-amber-600'} size={20} />
        </div>
        <h2 className="text-base font-semibold text-gray-900 mb-1">{title}</h2>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`btn-press rounded-lg px-4 py-2 text-sm font-medium text-white ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-600 hover:bg-brand-700'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}