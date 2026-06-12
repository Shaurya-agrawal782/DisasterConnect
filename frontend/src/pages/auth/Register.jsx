import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

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
      // 1. Call registration API (excluding role, which defaults to citizen)
      await register(name, email, password, undefined, phone);
      // 2. Perform automatic login to fetch session cookie
      await login(email, password);
      // 3. Transition to dashboard
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
    <div className="bg-surface-container-low min-h-screen flex items-center justify-center p-margin-mobile md:p-margin-desktop font-body-md text-body-md antialiased text-on-surface w-full">
      <main className="w-full max-w-[520px] bg-surface-container-lowest rounded-xl border border-outline-variant p-6 md:p-8 flex flex-col gap-8 shadow-sm">
        {/* Header / Brand */}
        <header className="flex flex-col items-center text-center gap-2">
          <div className="flex items-center gap-2 text-primary justify-center">
            <span className="material-symbols-outlined text-[28px]">shield</span>
            <span className="font-headline-sm text-headline-sm font-bold tracking-tight">DisasterConnect</span>
          </div>
          <h1 className="font-headline-md text-headline-md mt-4 font-bold text-on-surface">Create Operational Profile</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-[85%]">
            Register to receive safety alerts, report active incidents, or access the coordination network.
          </p>
        </header>

        {error && (
          <div className="p-4 bg-error-container text-on-error-container text-sm rounded-lg flex items-start space-x-2.5 border border-error/20">
            <span className="material-symbols-outlined text-error shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form Canvas */}
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          {/* Step Indicator / Info Card */}
          <div className="p-3 bg-surface-container-low border border-outline-variant rounded text-center">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">
              Public Account Registration
            </span>
            <span className="text-xs text-on-surface-variant">
              Public accounts are registered under the <strong>Citizen</strong> role. Command and Field Responder roles are assigned by system operators.
            </span>
          </div>

          {/* Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="col-span-1 md:col-span-2 space-y-1.5">
              <label className="block font-label-md text-label-md text-on-surface" htmlFor="name">Full Name</label>
              <input 
                className="w-full h-10 px-3 bg-transparent border border-outline-variant rounded font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary-fixed-dim transition-all placeholder:text-outline" 
                id="name" 
                placeholder="Enter your legal name" 
                required 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="col-span-1 space-y-1.5">
              <label className="block font-label-md text-label-md text-on-surface" htmlFor="email">Email Address</label>
              <input 
                className="w-full h-10 px-3 bg-transparent border border-outline-variant rounded font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary-fixed-dim transition-all placeholder:text-outline" 
                id="email" 
                placeholder="name@domain.com" 
                required 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="col-span-1 space-y-1.5">
              <label className="block font-label-md text-label-md text-on-surface" htmlFor="phone">Phone Number</label>
              <input 
                className="w-full h-10 px-3 bg-transparent border border-outline-variant rounded font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary-fixed-dim transition-all placeholder:text-outline" 
                id="phone" 
                placeholder="e.g. 10 digit number" 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="col-span-1 md:col-span-2 space-y-1.5 pt-2">
              <label className="block font-label-md text-label-md text-on-surface" htmlFor="password">Secure Password</label>
              <input 
                className="w-full h-10 px-3 bg-transparent border border-outline-variant rounded font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary-fixed-dim transition-all placeholder:text-outline" 
                id="password" 
                placeholder="Minimum 8 characters" 
                required 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex flex-col gap-4">
            <button 
              className="w-full h-12 bg-primary text-on-primary font-label-lg text-label-lg rounded hover:bg-primary/95 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" 
              type="submit"
              disabled={loading}
            >
              <span>{loading ? 'Registering Profile...' : 'Create Citizen Profile'}</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
            <p className="text-center font-body-sm text-body-sm text-on-surface-variant">
              By registering, you agree to the <a className="text-primary hover:underline font-semibold" href="#">Operational Terms of Service</a> and Privacy Policy.
            </p>
          </div>
        </form>

        {/* Footer Link */}
        <div className="mt-2 text-center border-t border-outline-variant pt-6">
          <p className="font-body-md text-body-md text-on-surface-variant">
            Already hold credentials? <Link to="/login" className="text-primary font-label-md text-label-md hover:underline font-semibold">Access Command Center</Link>
          </p>
          <p className="text-center mt-3 text-xs">
            <Link to="/" className="text-on-surface-variant hover:underline flex items-center gap-1 justify-center">
              <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Landing Page
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
