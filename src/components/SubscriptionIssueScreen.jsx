import { AlertCircle, Mail, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function SubscriptionIssueScreen({ issue }) {
  const { logout } = useAuth();

  const isSuspended = issue?.code === 'account_suspended';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm animate-scaleIn">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 mx-auto mb-5">
          <AlertCircle className="text-amber-600" size={30} />
        </div>

        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          {isSuspended ? 'Account Suspended' : 'Subscription Expired'}
        </h1>

        <p className="text-sm text-gray-500 mb-1">{issue?.message}</p>
        <p className="text-sm text-gray-500 mb-6">
          {issue?.detail ?? 'Please contact your administrator or our support team for assistance.'}
        </p>

        {issue?.expired_at && (
          <p className="text-xs text-gray-400 mb-6">
            Expired on {new Date(issue.expired_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}

        <div className="flex flex-col gap-2">
        <a
            href="mailto:support@yourfleet.com"
            className="btn-press flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Mail size={16} /> Contact Support
          </a>
          <button
            onClick={() => logout()}
            className="btn-press flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}