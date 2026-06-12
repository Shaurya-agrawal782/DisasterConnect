import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function Login() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-8 bg-slate-950/40 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col items-center">
          <Shield className="h-12 w-12 text-indigo-500 mb-4" />
          <h2 className="text-3xl font-bold tracking-tight text-white">Sign In</h2>
          <p className="mt-2 text-sm text-slate-400">
            Access DisasterConnect Coordination portal
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                Email Address / Username
              </label>
              <input
                id="email"
                name="email"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="admin"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <Link
              to="/dashboard"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-650/20 transition"
            >
              Sign In
            </Link>
          </div>
        </form>

        <div className="text-center mt-4 text-xs text-slate-500">
          <Link to="/" className="hover:text-indigo-400 transition">
            &larr; Back to Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
}
