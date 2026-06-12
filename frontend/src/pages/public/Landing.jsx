import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, MapPin, Users, BarChart } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-indigo-500" />
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              DisasterConnect
            </span>
          </div>
          <nav className="flex space-x-4">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition">
              Sign In
            </Link>
            <Link to="/login" className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-650/30 transition">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center items-center py-20 px-4 max-w-5xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-6">
          Real-time Disaster Response & Resource Coordination
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10">
          Connect critical emergency resources, track active incidents on interactive maps, and coordinate response teams instantly.
        </p>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 w-full max-w-4xl text-left mb-16">
          <div className="p-6 bg-slate-800/40 rounded-xl border border-slate-700/50 hover:border-slate-600 transition">
            <MapPin className="h-10 w-10 text-cyan-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Live Incident Tracking</h3>
            <p className="text-slate-400 text-sm">Visualize ongoing emergencies on dynamic map grids with immediate severity assessment.</p>
          </div>
          <div className="p-6 bg-slate-800/40 rounded-xl border border-slate-700/50 hover:border-slate-600 transition">
            <Users className="h-10 w-10 text-indigo-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Resource Allocation</h3>
            <p className="text-slate-400 text-sm">Deploy food, water, medical kits, and personnel precisely to where they are needed most.</p>
          </div>
          <div className="p-6 bg-slate-800/40 rounded-xl border border-slate-700/50 hover:border-slate-600 transition">
            <BarChart className="h-10 w-10 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Data Reporting</h3>
            <p className="text-slate-400 text-sm">Generate analytical logs and reports on responder productivity and incident status.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 text-center text-sm text-slate-500">
        <p>© 2026 DisasterConnect. All rights reserved.</p>
      </footer>
    </div>
  );
}
