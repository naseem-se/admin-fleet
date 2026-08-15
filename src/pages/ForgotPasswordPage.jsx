import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { apiClient, extractErrorMessage } from '../lib/apiClient';
import { Loader } from '../components/Loader';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await apiClient.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm text-center animate-scaleIn">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 mx-auto mb-5">
            <Mail className="text-green-600" size={24} />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Check your email</h1>
          <p className="text-sm text-gray-500 mb-6">
            If an account exists for {email}, we've sent a password reset link. It expires in 60 minutes.
          </p>
          <Link to="/login" className="text-sm font-medium text-brand-600 hover:underline">Back to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <Link to="/login" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={14} /> Back to login
        </Link>

        <h1 className="text-xl font-semibold text-gray-900 mb-1">Forgot password?</h1>
        <p className="text-sm text-gray-500 mb-6">Enter your email and we'll send you a reset link.</p>

        {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          className="mb-6 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />

        <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
          {submitting && <Loader size="sm" className="border-white/40 border-t-white" />}
          {submitting ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </div>
  );
}