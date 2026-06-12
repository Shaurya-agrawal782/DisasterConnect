import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function AuthShell({ children }) {
  return (
    <div className="min-h-screen grid grid-cols-12 bg-slate-50 font-body-md text-body-md antialiased text-slate-900">
      {/* Left Column: Platform Branding & Core Operations Info (Desktop only) */}
      <div className="hidden lg:flex lg:col-span-5 xl:col-span-6 bg-slate-950 text-white flex-col justify-between p-12 relative border-r border-slate-900">
        
        {/* Subtle background mesh line */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <div 
            className="absolute inset-0" 
            style={{ 
              backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', 
              backgroundSize: '40px 40px' 
            }}
          />
        </div>

        {/* Branding header */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-white hover:opacity-90 transition-opacity">
            <Shield className="w-5 h-5 text-blue-500" />
            <span className="font-semibold text-base tracking-tight">
              DisasterConnect
            </span>
          </Link>
        </div>

        {/* Platform Overview */}
        <div className="relative z-10 my-auto max-w-md space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] tracking-wider uppercase font-bold text-slate-500">
              Operations Portal
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Emergency coordination, built for the first 10 minutes.
            </h2>
          </div>
          
          <p className="text-slate-400 text-sm leading-relaxed">
            Authorized portal for agency personnel, field responders, and public operators. Access active coordinates, broadcast emergency statuses, and manage local distribution inventory.
          </p>

          <div className="border-t border-slate-900 pt-6 space-y-3">
            <div className="text-xs text-slate-400 flex items-start gap-2">
              <span className="text-blue-500 font-bold shrink-0">•</span>
              <span>Incident logs record GPS coordinates and citizen reports directly to the command panel.</span>
            </div>
            <div className="text-xs text-slate-400 flex items-start gap-2">
              <span className="text-blue-500 font-bold shrink-0">•</span>
              <span>Operator console enables structured dispatching of field personnel and vehicles.</span>
            </div>
            <div className="text-xs text-slate-400 flex items-start gap-2">
              <span className="text-blue-500 font-bold shrink-0">•</span>
              <span>Live broadcasts are pushed dynamically to citizen alerts databases.</span>
            </div>
          </div>
        </div>

        {/* Footer Security/Session Note */}
        <div className="relative z-10 text-xs text-slate-500 flex items-center justify-between">
          <span>Session protected with HttpOnly cookies.</span>
          <span className="text-[9px] tracking-widest text-slate-600 uppercase">System DC-01</span>
        </div>
      </div>

      {/* Right Column: Form (Desktop & Mobile Viewports) */}
      <div className="col-span-12 lg:col-span-7 xl:col-span-6 flex items-center justify-center p-6 md:p-12 bg-slate-50 min-h-screen relative">
        <div className="absolute top-6 left-6 lg:hidden">
          <Link to="/" className="inline-flex items-center gap-1.5 text-slate-950 font-bold text-sm">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>DisasterConnect</span>
          </Link>
        </div>
        <div className="w-full max-w-[400px]">
          {children}
        </div>
      </div>
    </div>
  );
}
