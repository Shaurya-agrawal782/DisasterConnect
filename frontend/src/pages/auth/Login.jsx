import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import AuthShell from '../../components/auth/AuthShell';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { ShieldAlert } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 
        err.message || 
        'Login failed. Please check your credentials.'
      );
    }
  };

  return (
    <AuthShell>
      <div className="space-y-6">
        {/* Title */}
        <div className="space-y-1.5 text-center lg:text-left">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sign In
          </h1>
          <p className="text-slate-500 text-sm">
            Enter your credentials to access the command center dashboard.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-800">
            <ShieldAlert className="w-4.5 h-4.5 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block" htmlFor="email">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="operator@disasterconnect.dev"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon="mail"
              autoComplete="email"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon="lock"
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full justify-center h-11 text-xs font-bold transition-all mt-2"
            variant="primary"
          >
            {loading ? 'Authenticating...' : 'Sign In to Platform'}
          </Button>
        </form>

        {/* Account Swap Links */}
        <div className="pt-5 border-t border-slate-200 space-y-2 text-center lg:text-left text-xs">
          <div className="text-slate-500">
            Need public dashboard access?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">
              Create Citizen Profile
            </Link>
          </div>
          <div>
            <Link to="/" className="text-slate-500 hover:text-slate-800 transition-colors inline-block">
              ← Return to landing page
            </Link>
          </div>
        </div>
      </div>
    </AuthShell>
  );
}
