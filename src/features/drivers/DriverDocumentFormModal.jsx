import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiClient, extractValidationErrors, extractErrorMessage } from '../../lib/apiClient';
import { Loader } from '../../components/Loader';

export function DriverDocumentFormModal({ driverId, document, onClose }) {
  const isEdit = !!document;
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, setError, formState: { errors } } = useForm({
    defaultValues: {
      document_type: document?.document_type ?? 'license',
      document_number: document?.document_number ?? '',
      issue_date: document?.issue_date?.slice(0, 10) ?? '',
      expiry_date: document?.expiry_date?.slice(0, 10) ?? '',
    },
  });

  async function onSubmit(values) {
    setSubmitting(true);
    setFileError(null);
    try {
      const form = new FormData();
      Object.entries(values).forEach(([k, v]) => v && form.append(k, v));
      if (file) form.append('file', file);

      if (isEdit) {
        form.append('_method', 'PUT');
        await apiClient.post(`/driver-documents/${document.id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Document updated');
      } else {
        await apiClient.post(`/drivers/${driverId}/documents`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Document added');
      }

      queryClient.invalidateQueries({ queryKey: ['drivers', String(driverId)] });
      onClose();
    } catch (err) {
      const fieldErrors = extractValidationErrors(err);
      const message = extractErrorMessage(err);

      if (fieldErrors.file) {
        setFileError(fieldErrors.file);
      }

      const otherFieldErrors = Object.fromEntries(
        Object.entries(fieldErrors).filter(([field]) => field !== 'file')
      );

      if (Object.keys(otherFieldErrors).length) {
        Object.entries(otherFieldErrors).forEach(([field, msg]) => setError(field, { message: msg }));
      }

      toast.error(fieldErrors.file ?? message);
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg animate-scaleIn">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{isEdit ? 'Edit' : 'Add'} Driver Document</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select {...register('document_type')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none">
              <option value="license">Driving License</option>
              <option value="cnic">CNIC / National ID</option>
              <option value="medical_certificate">Medical Certificate</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Document Number</label>
            <input {...register('document_number')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
              <input type="date" {...register('issue_date')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input type="date" {...register('expiry_date')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
              {errors.expiry_date && <p className="mt-1 text-xs text-red-600">{errors.expiry_date.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File (optional)</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => { setFile(e.target.files?.[0] ?? null); setFileError(null); }}
              className="w-full text-sm"
            />
            {fileError && <p className="mt-1 text-xs text-red-600">{fileError}</p>}
            <p className="mt-1 text-xs text-gray-400">JPEG, PNG, or PDF — max 5MB.</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-press flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
              {submitting && <Loader size="sm" className="border-white/40 border-t-white" />}
              {isEdit ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}