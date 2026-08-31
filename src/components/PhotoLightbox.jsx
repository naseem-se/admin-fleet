import { X, Download } from 'lucide-react';

export function PhotoLightbox({ src, label, onClose }) {
  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col bg-black/90 animate-fadeIn"
      onClick={onClose}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between p-4">
        <span className="text-sm font-medium text-white">
          {label}
        </span>

        <div className="flex items-center gap-3">
          <a
            href={src}
            download
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-white/80 hover:text-white"
          >
            <Download size={20} />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Image */}
      <div
        className="flex flex-1 items-center justify-center overflow-auto p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={label}
          className="block h-auto w-auto max-h-none max-w-none rounded-lg"
        />
      </div>
    </div>
  );
}