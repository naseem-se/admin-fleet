import { useState } from 'react';
import toast from 'react-hot-toast';
import { MailWarning, X } from 'lucide-react';
import { apiClient, extractErrorMessage } from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';

export function VerifyEmailBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);

  if (!user || user.email_verified || dismissed) return null;

  async function handleResend() {
    setSending(true);
    try {
      await apiClient.post('/auth/resend-verification');
      toast.success('Verification email sent — check your inbox.');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-2 bg-amber-500 px-4 py-2 text-sm font-medium text-white animate-fadeIn">
      <span className="flex items-center gap-2"><MailWarning size={16} /> Please verify your email address.</span>
      <div className="flex items-center gap-3">
        <button onClick={handleResend} disabled={sending} className="underline underline-offset-2">
          {sending ? 'Sending...' : 'Resend email'}
        </button>
        <button onClick={() => setDismissed(true)} className="text-white/80"><X size={14} /></button>
      </div>
    </div>
  );
}