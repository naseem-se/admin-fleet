import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Printer, X } from 'lucide-react';

export function VehicleQrModal({ vehicle, onClose }) {
  const wrapperRef = useRef(null);

  function handleDownload() {
    const canvas = wrapperRef.current?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${vehicle.registration_number}-qr.png`;
    link.click();
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 animate-fadeIn print:bg-white">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg animate-scaleIn print:shadow-none">
        <div className="flex items-center justify-between mb-4 print:hidden">
          <h2 className="text-lg font-semibold text-gray-900">Vehicle QR Code</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div ref={wrapperRef} className="flex flex-col items-center gap-3 py-4">
          <QRCodeCanvas value={vehicle.qr_code_value} size={220} level="M" includeMargin />
          <p className="text-lg font-semibold text-gray-900">{vehicle.registration_number}</p>
          <p className="text-sm text-gray-500">{[vehicle.make, vehicle.model].filter(Boolean).join(' ')}</p>
        </div>

        <div className="flex gap-3 mt-4 print:hidden">
          <button onClick={handleDownload} className="btn-press flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700">
            <Download size={16} /> Download
          </button>
          <button onClick={handlePrint} className="btn-press flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white">
            <Printer size={16} /> Print
          </button>
        </div>
      </div>
    </div>
  );
}