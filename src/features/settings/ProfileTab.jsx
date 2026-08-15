import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import { settingsApi } from './api';
import { useAuth } from '../../context/AuthContext';
import { extractValidationErrors, extractErrorMessage } from '../../lib/apiClient';
import { Loader } from '../../components/Loader';

export function ProfileTab() {
  const { user, refreshUser } = useAuth();

  const profileForm = useForm({ defaultValues: { name: user?.name ?? '', phone: user?.phone ?? '' } });
  const passwordForm = useForm({ defaultValues: { current_password: '', password: '', password_confirmation: '' } });

  const profileMutation = useMutation({
    mutationFn: (payload) => settingsApi.updateProfile(payload),
    onSuccess: () => {
      toast.success('Profile updated');
      refreshUser();
    },
    onError: (err) => { /* unchanged */ },
  });

  const passwordMutation = useMutation({
    mutationFn: (payload) => settingsApi.changePassword(payload),
    onSuccess: () => {
      toast.success('Password updated — other sessions signed out');
      passwordForm.reset();
    },
    onError: (err) => {
      const fieldErrors = extractValidationErrors(err);
      if (Object.keys(fieldErrors).length) {
        Object.entries(fieldErrors).forEach(([field, message]) => passwordForm.setError(field, { message }));
      } else {
        toast.error(extractErrorMessage(err));
      }
    },
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 card-hover">
        <h2 className="font-medium text-gray-900 mb-4">Your Profile</h2>
        <form onSubmit={profileForm.handleSubmit((v) => profileMutation.mutate(v))} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input {...profileForm.register('name', { required: true })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input {...profileForm.register('phone')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input value={user?.email ?? ''} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400" />
            <p className="mt-1 text-xs text-gray-400">Email changes aren't supported yet — contact support.</p>
          </div>
          <button type="submit" disabled={profileMutation.isPending} className="btn-press flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
            {profileMutation.isPending && <Loader size="sm" className="border-white/40 border-t-white" />}
            Save Profile
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 card-hover">
        <h2 className="font-medium text-gray-900 mb-4">Change Password</h2>
        <form onSubmit={passwordForm.handleSubmit((v) => passwordMutation.mutate(v))} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input type="password" {...passwordForm.register('current_password', { required: true })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            {passwordForm.formState.errors.current_password && <p className="mt-1 text-xs text-red-600">{passwordForm.formState.errors.current_password.message || 'Required'}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input type="password" {...passwordForm.register('password', { required: true, minLength: 8 })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input type="password" {...passwordForm.register('password_confirmation', { required: true })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
          </div>
          <button type="submit" disabled={passwordMutation.isPending} className="btn-press flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-60">
            {passwordMutation.isPending && <Loader size="sm" className="border-white/40 border-t-white" />}
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}