import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';
import Badge from '../../components/ui/Badge';

export default function Landing() {
  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-body-lg antialiased">
      
      {/* Platform Navigation */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-margin-desktop h-16 bg-[#0B1628] border-b border-slate-800 transition-colors">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-500" />
          <span className="font-semibold text-sm tracking-tight text-white">
            DisasterConnect
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-slate-300 hover:text-white text-xs font-semibold transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="bg-blue-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-500 transition-colors shadow-sm"
          >
            Report as Citizen
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow pt-16">
        
        {/* Hero Section - Solid dark tactical layout with clean asymmetric structure */}
        <section className="w-full bg-[#0B1628] text-white py-16 md:py-24 border-b border-slate-900 relative">
          {/* Subtle tactical line background */}
          <div className="absolute inset-0 pointer-events-none opacity-5">
            <div 
              className="absolute inset-0" 
              style={{ 
                backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', 
                backgroundSize: '40px 40px' 
              }}
            />
          </div>

          <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            
            {/* Left Column: Heading & Pitches */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <span className="text-[10px] tracking-wider uppercase font-bold text-slate-500 block">
                Event Crowd Heatmap & Safety Alert System powered by DisasterConnect
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Emergency coordination, <br />
                built for the first 10 minutes.
              </h1>
              <p className="text-slate-300 text-sm md:text-base max-w-xl leading-relaxed">
                DisasterConnect helps teams report incidents, dispatch resources, track live alerts, and monitor response activity from one command dashboard.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/login"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-bold text-xs transition-colors inline-flex items-center gap-1.5 shadow-md"
                >
                  Open Command Center
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/register"
                  className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-lg font-bold text-xs transition-colors border border-slate-700"
                >
                  Report as Citizen
                </Link>
              </div>
            </div>

            {/* Right Column: Clean Operations Snapshot (No fake glow details) */}
            <div className="lg:col-span-5 w-full">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 text-left space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] tracking-wider font-bold text-slate-400 uppercase">Live Sync Active</span>
                  </div>
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Panel ST-09</span>
                </div>

                {/* 3 Metrics Max */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-[9px] text-slate-400 font-semibold uppercase block">Incidents</span>
                    <span className="text-base font-bold text-slate-100">4</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-[9px] text-slate-400 font-semibold uppercase block">Staffed</span>
                    <span className="text-base font-bold text-slate-100">8 Units</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-[9px] text-slate-400 font-semibold uppercase block">Supplies</span>
                    <span className="text-base font-bold text-emerald-400">88%</span>
                  </div>
                </div>

                {/* 1 Active Incident Row & 1 Resource Row */}
                <div className="space-y-2 text-xs">
                  <div className="bg-slate-950 p-3 rounded border border-slate-800">
                    <div className="flex justify-between text-slate-300 font-semibold">
                      <span>• Incident: Sector 4 Flooding</span>
                      <span className="text-amber-500 font-mono text-[10px]">Assigned</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Water gate levels logged by field responder. Staff deployed at Sector 4.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3 rounded border border-slate-800">
                    <div className="flex justify-between text-slate-300 font-semibold">
                      <span>• Staging: Water Distribution A</span>
                      <span className="text-blue-400 font-mono text-[10px]">1,200 gal</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Water pallet levels updated at Central High. Inventory normal.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Section 1: Problem - Solid clean layout, clear messaging, no icons */}
        <section className="w-full bg-white text-slate-900 py-16 md:py-20 border-b border-slate-200">
          <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop">
            <div className="max-w-xl text-left mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1">
                Operational Challenges
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Disorganized communication costs time when responding to hazards.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900">Delayed Reporting</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Citizens lack direct pathways to submit coordinates, meaning hazards are cataloged hours after detection.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900">Disconnected Dispatch</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Field units operate without shared task logs, causing duplicate crew assignments and unstaffed locations.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900">Static Alert Logs</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Warning broadcasts require complex configuration, slowing down notification delivery to affected zones.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900">Blind Staging Sites</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Supply levels and vehicle logs are recorded locally, making regional inventory tracking near impossible.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: How It Works - Horizontal Timeline */}
        <section className="w-full bg-slate-100 text-slate-900 py-16 md:py-20 border-b border-slate-200">
          <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop text-center">
            <div className="max-w-xl mx-auto mb-12 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1">
                Response Workflow
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                How DisasterConnect Coordinates Response
              </h2>
            </div>

            {/* Horizontal Timeline (collapses to stacked on mobile) */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-left relative">
              <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-[1px] bg-slate-200 z-0" />
              
              <div className="bg-white p-5 rounded-lg border border-slate-200 space-y-2 relative z-10">
                <span className="text-xs font-bold text-blue-600 block">01 / Report</span>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Reports are logged with location, hazard description, and initial severity levels.
                </p>
              </div>

              <div className="bg-white p-5 rounded-lg border border-slate-200 space-y-2 relative z-10">
                <span className="text-xs font-bold text-blue-600 block">02 / Verify</span>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Admins check reports against nearby coordinates to confirm validity and prevent false alerts.
                </p>
              </div>

              <div className="bg-white p-5 rounded-lg border border-slate-200 space-y-2 relative z-10">
                <span className="text-xs font-bold text-blue-600 block">03 / Dispatch</span>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Admins assign responders and resources to verified incident locations.
                </p>
              </div>

              <div className="bg-white p-5 rounded-lg border border-slate-200 space-y-2 relative z-10">
                <span className="text-xs font-bold text-blue-600 block">04 / Respond</span>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Responders update status from the field, notifying the command center of changes.
                </p>
              </div>

              <div className="bg-white p-5 rounded-lg border border-slate-200 space-y-2 relative z-10">
                <span className="text-xs font-bold text-blue-600 block">05 / Analyze</span>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Completed incidents are logged. Recharts plots timeline metrics for post-incident reviews.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Product Modules - Split asymmetrical layout */}
        <section className="w-full bg-white text-slate-900 py-16 md:py-20 border-b border-slate-200">
          <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            <div className="lg:col-span-4 space-y-4 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
                Platform Architecture
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                Modules designed for speed and coordination.
              </h2>
              <p className="text-slate-500 text-xs leading-relaxed">
                DisasterConnect integrates incident logging, inventory records, and alert broadcasting into a single system.
              </p>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
              <div className="p-5 border border-slate-200 rounded-lg space-y-1">
                <h4 className="font-bold text-sm text-slate-900">Interactive Map Interface</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Maps show active incidents and available resources in real time, loaded dynamically through Leaflet.
                </p>
              </div>

              <div className="p-5 border border-slate-200 rounded-lg space-y-1">
                <h4 className="font-bold text-sm text-slate-900">Supplies & Equipment Database</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Logs water supply, medical equipment, and response vehicle counts at designated distribution nodes.
                </p>
              </div>

              <div className="p-5 border border-slate-200 rounded-lg space-y-1">
                <h4 className="font-bold text-sm text-slate-900">Safety Alerts Broadcaster</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Alerts are saved and broadcast live to citizen portals, enabling quick warning updates.
                </p>
              </div>

              <div className="p-5 border border-slate-200 rounded-lg space-y-1">
                <h4 className="font-bold text-sm text-slate-900">Operational Analytics</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Generates charts tracking response performance, incident counts, and logistics supply trends.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Section 4: Roles - Row breakdown layout */}
        <section className="w-full bg-slate-100 text-slate-900 py-16 md:py-20 border-b border-slate-200">
          <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop text-left space-y-10">
            <div className="max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1">
                Access Protocol
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                User Role Capabilities
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg border border-slate-200 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 block uppercase">Role 01</span>
                  <h4 className="font-bold text-base text-slate-900">System Administrator</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Accesses full command panel. Verifies citizen reports, assigns responders, allocates inventory stocks, and broadcasts alerts.
                  </p>
                </div>
                <Link to="/login" className="text-blue-600 text-xs font-semibold hover:underline inline-flex items-center gap-1.5 pt-4">
                  Open Portal <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="bg-white p-6 rounded-lg border border-slate-200 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 block uppercase">Role 02</span>
                  <h4 className="font-bold text-base text-slate-900">Field Responder</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Accesses dispatched tasks. Views maps of active locations, updates dispatch status tags, and checks inventory reserves.
                  </p>
                </div>
                <span className="text-slate-400 text-xs font-semibold pt-4">Assigned by Admin</span>
              </div>

              <div className="bg-white p-6 rounded-lg border border-slate-200 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 block uppercase">Role 03</span>
                  <h4 className="font-bold text-base text-slate-900">Citizen User</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Submits local safety reports. Views active safety alerts in their region and checks supply counts at local staging centers.
                  </p>
                </div>
                <Link to="/register" className="text-blue-600 text-xs font-semibold hover:underline inline-flex items-center gap-1.5 pt-4">
                  Register Citizen Profile <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Tech Stack & Architecture Note */}
        <section className="w-full bg-[#0B1628] text-white py-16 border-b border-slate-950">
          <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop text-center space-y-6">
            <span className="text-[10px] tracking-wider uppercase font-bold text-slate-500 block">
              Core Technologies
            </span>
            <p className="text-slate-300 text-xs max-w-xl mx-auto leading-relaxed">
              DisasterConnect is built using React, Node.js, Express, MongoDB, Socket.io, Leaflet, Recharts, and JWT.
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
              <span className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300">React</span>
              <span className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300">Node.js</span>
              <span className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300">Express</span>
              <span className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300">MongoDB</span>
              <span className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300">Socket.io</span>
              <span className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300">Leaflet</span>
              <span className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300">Recharts</span>
            </div>
          </div>
        </section>

        {/* Section 6: Demo Note */}
        <section className="w-full bg-white text-slate-900 py-12 border-b border-slate-200">
          <div className="max-w-md mx-auto px-6 text-center space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Local Evaluation
            </h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Evaluation accounts are listed in <code className="text-blue-600 font-mono text-xs px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">docs/DEMO_ACCOUNTS.md</code>.
            </p>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full bg-slate-950 text-slate-500 py-12 px-6 md:px-margin-desktop">
        <div className="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-4.5 h-4.5 text-slate-500" />
            <span className="text-xs font-bold tracking-tight text-slate-400">DisasterConnect Command Center</span>
          </div>
          <span className="text-[10px] text-slate-600">
            Hackathon Project • Platform coordination model
          </span>
          <div className="flex gap-4 text-xs font-semibold">
            <a className="hover:text-slate-300 transition-colors" href="#">System Status</a>
            <a className="hover:text-slate-300 transition-colors" href="#">API Rules</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
