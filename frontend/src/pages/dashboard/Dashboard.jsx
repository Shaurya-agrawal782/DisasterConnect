import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, ShieldAlert, CheckCircle, LogOut } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between p-4">
        <div className="space-y-6">
          <div className="flex items-center space-x-2 px-2 py-3">
            <Shield className="h-7 w-7 text-indigo-500" />
            <span className="text-lg font-bold tracking-tight text-white">DisasterConnect</span>
          </div>
          <nav className="space-y-1">
            <span className="block px-3 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg cursor-pointer">
              Dashboard Overview
            </span>
          </nav>
        </div>
        <div>
          <Link
            to="/login"
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Dashboard Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-800 bg-slate-950/20 px-8 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Dashboard Overview</h1>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-slate-400">Live Sync Connected</span>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-7xl">
          {/* Info cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-950/40 border border-slate-800 rounded-xl flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-yellow-500/10 text-yellow-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-sm text-slate-400 font-medium">Pending Incidents</span>
                <span className="text-2xl font-bold text-white">0</span>
              </div>
            </div>
            <div className="p-6 bg-slate-950/40 border border-slate-800 rounded-xl flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-sm text-slate-400 font-medium">Active Deployments</span>
                <span className="text-2xl font-bold text-white">0</span>
              </div>
            </div>
            <div className="p-6 bg-slate-950/40 border border-slate-800 rounded-xl flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-sm text-slate-400 font-medium">Resolved Alerts</span>
                <span className="text-2xl font-bold text-white">0</span>
              </div>
            </div>
          </div>

          {/* Map/Data Placeholder panel */}
          <div className="p-8 bg-slate-950/20 border border-slate-800 rounded-xl min-h-[300px] flex flex-col justify-center items-center text-center">
            <span className="text-slate-500 text-sm font-medium">Visualization and Grid mapping will appear here.</span>
          </div>
        </div>
      </main>
    </div>
  );
}
