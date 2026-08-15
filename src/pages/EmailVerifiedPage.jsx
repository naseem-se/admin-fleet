import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export function EmailVerifiedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 text-center">
      <div className="animate-scaleIn">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 mx-auto mb-5">
          <CheckCircle2 className="text-green-600" size={24} />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Email verified</h1>
        <p className="text-sm text-gray-500 mb-6">Your email address has been confirmed.</p>
        <Link to="/login" className="text-sm font-medium text-brand-600 hover:underline">Continue to login</Link>
      </div>
    </div>
  );
}