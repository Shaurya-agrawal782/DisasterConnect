import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

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
    <div className="bg-surface text-on-surface font-body-md text-body-md antialiased min-h-screen flex items-center justify-center relative overflow-hidden w-full">
      {/* Decorative Background Element */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-surface to-surface-container opacity-50"></div>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#c4c5d7 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.15 }}></div>
      </div>

      {/* Main Content Canvas */}
      <main className="relative z-10 w-full max-w-md px-margin-mobile md:px-0">
        {/* Login Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 md:p-10 shadow-sm flex flex-col gap-6">
          {/* Branding Header */}
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[28px] text-white">security</span>
            </div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">DisasterConnect</h1>
            <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-1.5 justify-center">
              <span className="material-symbols-outlined text-[16px]">lock</span>
              Secure Operational Login
            </p>
          </div>

          {error && (
            <div className="p-4 bg-error-container text-on-error-container text-sm rounded-lg flex items-start space-x-2.5 border border-error/20">
              <span className="material-symbols-outlined text-error shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="email">Operational ID / Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">badge</span>
                <input 
                  autocomplete="email" 
                  className="w-full pl-10 pr-3 py-2.5 bg-surface-container-lowest border border-outline rounded font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all placeholder:text-outline" 
                  id="email" 
                  name="email" 
                  placeholder="Enter your operational ID" 
                  required 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5 text-left">
              <div className="flex justify-between items-center">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="password">Access Code</label>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">key</span>
                <input 
                  autocomplete="current-password" 
                  className="w-full pl-10 pr-3 py-2.5 bg-surface-container-lowest border border-outline rounded font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all placeholder:text-outline" 
                  id="password" 
                  name="password" 
                  placeholder="Enter secure access code" 
                  required 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              className="mt-2 w-full bg-primary hover:bg-primary-container text-on-primary py-3 rounded font-label-lg text-label-lg transition-colors flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed" 
              type="submit"
              disabled={loading}
            >
              <span>{loading ? 'Authenticating...' : 'Authenticate'}</span>
              <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </form>

          {/* Extra Links */}
          <div className="pt-6 border-t border-surface-container-highest text-center flex flex-col gap-2.5 text-xs text-on-surface-variant">
            <div>
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                Register here
              </Link>
            </div>
            <div>
              <Link to="/" className="hover:underline flex items-center gap-1 justify-center">
                <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Landing Page
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Legal/Info */}
        <div className="mt-8 text-center flex flex-col gap-2">
          <p className="font-body-sm text-body-sm text-secondary">
            Authorized Personnel Only. Actions are logged.
          </p>
        </div>
      </main>
    </div>
  );
}
