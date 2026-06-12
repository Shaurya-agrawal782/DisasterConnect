import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import AuthShell from '../../components/auth/AuthShell';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { ShieldAlert } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const { register, login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Register with default 'citizen' role
      await register(name, email, password, undefined, phone);
      // Auto login to set context/cookie session
      await login(email, password);
      // Route to operational dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 
        err.message || 
        'Registration failed. Please try again.'
      );
    }
  };

  return (
    <AuthShell>
      <div className="space-y-6">
        {/* Title block */}
        <div className="space-y-1.5 text-center lg:text-left">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Citizen Registration
          </h1>
          <p className="text-slate-500 text-sm">
            Create an account to log public safety reports and receive safety alerts.
          </p>
        </div>

        {/* Warning / Account separation notice */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 leading-relaxed">
          <strong>Registration Notice:</strong> Public accounts are created as Citizen users. Admin and responder accounts are managed separately.
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-800">
            <ShieldAlert className="w-4.5 h-4.5 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form fields */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block" htmlFor="name">
              Full Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Alex Johnson"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon="person"
              autoComplete="name"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block" htmlFor="email">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="alex@domain.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon="mail"
              autoComplete="email"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block" htmlFor="phone">
              Phone Number <span className="text-slate-400 text-[10px] font-normal lowercase">(optional)</span>
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 019-2834"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              icon="call"
              autoComplete="tel"
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
              autoComplete="new-password"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full justify-center h-11 text-xs font-bold transition-all mt-2"
            variant="primary"
          >
            {loading ? 'Creating Account...' : 'Register Citizen Account'}
          </Button>
        </form>

        {/* Footer navigation */}
        <div className="pt-5 border-t border-slate-200 space-y-2 text-center lg:text-left text-xs">
          <div className="text-slate-500">
            Already hold active credentials?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Access Command Center
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
