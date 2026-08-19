import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Camera, X } from 'lucide-react';
import { apiClient, extractErrorMessage } from '../../lib/apiClient';
import { Avatar } from '../../components/Avatar';
import { Loader } from '../../components/Loader';

export function DriverPhotoUpload({ driver }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const form = new FormData();
      form.append('photo', file);
      const res = await apiClient.post(`/drivers/${driver.id}/photo`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('Photo updated');
      queryClient.invalidateQueries({ queryKey: ['drivers', String(driver.id)] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
    onSettled: () => setUploading(false),
  });

  const removeMutation = useMutation({
    mutationFn: async () => (await apiClient.delete(`/drivers/${driver.id}/photo`)).data.data,
    onSuccess: () => {
      toast.success('Photo removed');
      queryClient.invalidateQueries({ queryKey: ['drivers', String(driver.id)] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    uploadMutation.mutate(file);
    e.target.value = ''; // allow re-selecting the same file later
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar name={driver.name} photoUrl={driver.profile_photo_url} size="lg" />
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
            <Loader size="sm" className="border-white/40 border-t-white" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="btn-press flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          <Camera size={14} /> {driver.profile_photo_url ? 'Change Photo' : 'Add Photo'}
        </button>
        {driver.profile_photo_url && (
          <button
            onClick={() => removeMutation.mutate()}
            disabled={removeMutation.isPending}
            className="btn-press flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-600"
          >
            <X size={14} /> Remove
          </button>
        )}
        <p className="text-xs text-gray-400">Optional — JPEG or PNG, max 3MB.</p>
      </div>
    </div>
  );
}