import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Scale, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Tooltip from '../components/ui/Tooltip';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    login();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 bg-gold-500 rounded-xl items-center justify-center mb-4">
            <Scale size={26} className="text-navy-900" />
          </div>
          <h1 className="text-2xl font-bold text-white">LexDesk</h1>
          <p className="text-navy-300 text-sm mt-1">Sign in to your advocate workspace</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Work email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  autoComplete="username"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Optional — not validated"
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Optional — not validated"
                  className="input pl-10"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                Dummy login: Sign in goes straight to the app.
              </p>
            </div>

            <Tooltip content="Continue to the dashboard (dummy login)" side="bottom" className="w-full">
              <button type="submit" className="btn-primary w-full justify-center gap-2 py-2.5">
                Sign in
                <ArrowRight size={16} />
              </button>
            </Tooltip>
          </form>
        </div>

        <p className="text-center text-navy-400 text-xs mt-6">
          Protected routes require sign-in.
        </p>
      </div>
    </div>
  );
}
