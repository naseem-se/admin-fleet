import { useState } from 'react';
import toast from 'react-hot-toast';
import { downloadFile } from '../lib/downloadFile';
import { Loader } from './Loader';

export function DownloadButton({ icon: Icon, label, path, params, filename, disabled }) {
  const [downloading, setDownloading] = useState(false);

  async function handleClick() {
    setDownloading(true);
    try {
      await downloadFile(path, params, filename);
    } catch (err) {
      toast.error(err.message ?? 'Could not download the file. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || downloading}
      className="btn-press flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
    >
      {downloading ? <Loader size="sm" /> : <Icon size={16} />}
      {downloading ? 'Preparing...' : label}
    </button>
  );
}