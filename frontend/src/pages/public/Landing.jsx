import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { fadeUp, staggerContainer, listItem } from '../../utils/motion';

export default function Landing() {
  return (
    <div className="bg-[#0B1628] text-white min-h-screen flex flex-col font-body-lg antialiased relative">
      
      {/* 1. Fixed Cinematic Background Video & Overlay */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none select-none">
        <video
          src="/videos/disasterconnect-bg.mp4"
          poster="/videos/disasterconnect-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
        />
        {/* Left-to-right readability dark mask */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        {/* Top/bottom vertical vignettes */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-transparent to-slate-950/90" />
      </div>

      {/* 2. Platform Navigation (Translucent overlay) */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-margin-desktop h-16 bg-slate-950/70 border-b border-slate-800/80 backdrop-blur-md transition-colors">
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

      {/* 3. Main Scrollable Container (Sits above fixed video background) */}
      <main className="flex-grow pt-16 relative z-10">
        
        {/* Hero Section */}
        <section className="w-full py-16 md:py-24 flex items-center min-h-[80vh]">
          <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop w-full relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Heading & Pitches */}
              <motion.div 
                className="lg:col-span-8 space-y-6 text-left"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                <motion.span variants={fadeUp} className="text-xs tracking-wider uppercase font-bold text-blue-400 block">
                  Event Crowd Heatmap & Safety Alert System powered by DisasterConnect
                </motion.span>
                <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                  Emergency coordination, <br />
                  built for the first 10 minutes.
                </motion.h1>
                <motion.p variants={fadeUp} className="text-slate-300 text-sm md:text-base max-w-xl leading-relaxed">
                  DisasterConnect helps teams report incidents, dispatch resources, track live alerts, and monitor risk-density zones from one command dashboard.
                </motion.p>
                
                <motion.div variants={fadeUp} className="flex flex-wrap gap-4 pt-2">
                  <Link
                    to="/login"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-bold text-xs transition-colors inline-flex items-center gap-1.5 shadow-md btn-gradient-highlight"
                  >
                    Open Command Center
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/register"
                    className="bg-slate-800/80 hover:bg-slate-700/90 text-white px-5 py-2.5 rounded-lg font-bold text-xs transition-colors border border-slate-700/80 backdrop-blur-sm btn-gradient-highlight"
                  >
                    Report as Citizen
                  </Link>
                </motion.div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* Section 1: Problem */}
        <section className="w-full py-16 md:py-20">
          <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop">
            <div className="max-w-xl text-left mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block mb-1">
                Operational Challenges
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Disorganized communication costs time when responding to hazards.
              </h2>
            </div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              <motion.div className="bg-slate-950/65 backdrop-blur-md border border-slate-800/80 p-6 rounded-xl space-y-2" variants={listItem}>
                <h4 className="font-bold text-sm text-white">Delayed Reporting</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Without rapid geotagged submittals, incident details arrive hours after hazard detection.
                </p>
              </motion.div>
              <motion.div className="bg-slate-950/65 backdrop-blur-md border border-slate-800/80 p-6 rounded-xl space-y-2" variants={listItem}>
                <h4 className="font-bold text-sm text-white">Disconnected Dispatch</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Response operations run on fragmented checklists, leading to crew assignment overlaps.
                </p>
              </motion.div>
              <motion.div className="bg-slate-950/65 backdrop-blur-md border border-slate-800/80 p-6 rounded-xl space-y-2" variants={listItem}>
                <h4 className="font-bold text-sm text-white">Static Alerts</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Warning broadcasts require complex manual routing, delaying zone updates for nearby citizens.
                </p>
              </motion.div>
              <motion.div className="bg-slate-950/65 backdrop-blur-md border border-slate-800/80 p-6 rounded-xl space-y-2" variants={listItem}>
                <h4 className="font-bold text-sm text-white">Blind Staging</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Logistics inventory levels are updated locally, limiting clear command visibility on assets.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Section 2: How It Works */}
        <section className="w-full py-16 md:py-20">
          <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop text-left">
            <div className="max-w-xl mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block mb-1">
                Response Workflow
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                How DisasterConnect Coordinates Response
              </h2>
            </div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-5 gap-4"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              <motion.div className="bg-slate-950/65 backdrop-blur-md border border-slate-800/80 p-5 rounded-xl space-y-2" variants={listItem}>
                <span className="text-xs font-bold text-blue-400 block">01 / Report</span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Citizen reports are logged instantly with coordinates and initial severity.
                </p>
              </motion.div>

              <motion.div className="bg-slate-950/65 backdrop-blur-md border border-slate-800/80 p-5 rounded-xl space-y-2" variants={listItem}>
                <span className="text-xs font-bold text-blue-400 block">02 / Verify</span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Admins validate locations and merge duplicates directly from the coordinate picker.
                </p>
              </motion.div>

              <motion.div className="bg-slate-950/65 backdrop-blur-md border border-slate-800/80 p-5 rounded-xl space-y-2" variants={listItem}>
                <span className="text-xs font-bold text-blue-400 block">03 / Dispatch</span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Commanders assign field personnel and track resources in real-time.
                </p>
              </motion.div>

              <motion.div className="bg-slate-950/65 backdrop-blur-md border border-slate-800/80 p-5 rounded-xl space-y-2" variants={listItem}>
                <span className="text-xs font-bold text-blue-400 block">04 / Respond</span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Responders log status changes from their mobile task checklists.
                </p>
              </motion.div>

              <motion.div className="bg-slate-950/65 backdrop-blur-md border border-slate-800/80 p-5 rounded-xl space-y-2" variants={listItem}>
                <span className="text-xs font-bold text-blue-400 block">05 / Analyze</span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Metrics are fed automatically into status charts for post-event analysis.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Section 3: Tech Modules & Density Layer */}
        <section className="w-full py-16 md:py-20">
          <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            <div className="lg:col-span-4 space-y-4 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block">
                Command Capabilities
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-white leading-tight">
                Privacy-First Crowd Density & Integrated Mapping
              </h2>
              <p className="text-slate-300 text-xs leading-relaxed">
                DisasterConnect aggregates logs into localized density zones. Individual coordinates are fully masked to respect citizen privacy.
              </p>
            </div>

            <motion.div 
              className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              <motion.div className="p-5 bg-slate-950/65 backdrop-blur-md border border-slate-800/80 rounded-xl space-y-1" variants={listItem}>
                <h4 className="font-bold text-sm text-white">Command Map Center</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Interactive GIS tracking for field items, vehicles, and active incidents.
                </p>
              </motion.div>

              <motion.div className="p-5 bg-slate-950/65 backdrop-blur-md border border-slate-800/80 rounded-xl space-y-1" variants={listItem}>
                <h4 className="font-bold text-sm text-white">Live Broadcast Alerting</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Real-time notification socket push alert feed for verified zones.
                </p>
              </motion.div>
            </motion.div>

          </div>
        </section>

        {/* Section 4: Roles */}
        <section className="w-full py-16 md:py-20">
          <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop text-left space-y-10">
            <div className="max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block mb-1">
                Access Protocol
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Role Permissions
              </h2>
            </div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              <motion.div className="bg-slate-950/65 backdrop-blur-md border border-slate-800/80 p-6 rounded-xl flex flex-col justify-between space-y-4" variants={listItem}>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">Role 01</span>
                  <h4 className="font-bold text-base text-white">Command Administrator</h4>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Full console access to verify reports, coordinate resource units, dispatch tasks, and broadcast emergency alerts.
                  </p>
                </div>
                <Link to="/login" className="text-blue-400 text-xs font-semibold hover:underline inline-flex items-center gap-1.5 pt-4">
                  Open Portal <ArrowRight className="w-3 h-3" />
                </Link>
              </motion.div>

              <motion.div className="bg-slate-950/65 backdrop-blur-md border border-slate-800/80 p-6 rounded-xl flex flex-col justify-between space-y-4" variants={listItem}>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">Role 02</span>
                  <h4 className="font-bold text-base text-white">Field Responder</h4>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Personalized task checklist, incident route maps, status tag triggers, and centralized inventory reference logs.
                  </p>
                </div>
                <span className="text-slate-500 text-xs font-semibold pt-4">Assigned by Command</span>
              </motion.div>

              <motion.div className="bg-slate-950/65 backdrop-blur-md border border-slate-800/80 p-6 rounded-xl flex flex-col justify-between space-y-4" variants={listItem}>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">Role 03</span>
                  <h4 className="font-bold text-base text-white">Citizen Reporter</h4>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Instant geolocation picker form submittals, live sync updates, and regional public safety warning feed tracking.
                  </p>
                </div>
                <Link to="/register" className="text-blue-400 text-xs font-semibold hover:underline inline-flex items-center gap-1.5 pt-4">
                  Register Profile <ArrowRight className="w-3 h-3" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Section 5: Tech Stack & Architecture Note */}
        <section className="w-full py-16">
          <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop text-center space-y-6">
            <span className="text-[10px] tracking-wider uppercase font-bold text-slate-400 block">
              Core Technologies
            </span>
            <p className="text-slate-300 text-xs max-w-xl mx-auto leading-relaxed">
              DisasterConnect is built using React, Node.js, Express, MongoDB, Socket.io, Leaflet, Recharts, and JWT.
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
              <span className="px-3 py-1 rounded bg-slate-950/80 border border-slate-800/60 text-[10px] font-mono text-slate-300">React</span>
              <span className="px-3 py-1 rounded bg-slate-950/80 border border-slate-800/60 text-[10px] font-mono text-slate-300">Node.js</span>
              <span className="px-3 py-1 rounded bg-slate-950/80 border border-slate-800/60 text-[10px] font-mono text-slate-300">Express</span>
              <span className="px-3 py-1 rounded bg-slate-950/80 border border-slate-800/60 text-[10px] font-mono text-slate-300">MongoDB</span>
              <span className="px-3 py-1 rounded bg-slate-950/80 border border-slate-800/60 text-[10px] font-mono text-slate-300">Socket.io</span>
              <span className="px-3 py-1 rounded bg-slate-950/80 border border-slate-800/60 text-[10px] font-mono text-slate-300">Leaflet</span>
              <span className="px-3 py-1 rounded bg-slate-950/80 border border-slate-800/60 text-[10px] font-mono text-slate-300">Recharts</span>
            </div>
          </div>
        </section>

        {/* Section 6: Demo Note */}
        <section className="w-full py-12">
          <div className="max-w-md mx-auto px-6 text-center space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Local Evaluation
            </h4>
            <p className="text-slate-300 text-xs leading-relaxed">
              Evaluation accounts are listed in <code className="text-blue-400 font-mono text-xs px-1.5 py-0.5 bg-slate-950/80 rounded border border-slate-800/60">docs/DEMO_ACCOUNTS.md</code>.
            </p>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full bg-slate-950/80 backdrop-blur-md text-slate-500 py-12 px-6 md:px-margin-desktop border-t border-slate-900/60 relative z-10">
        <div className="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-4.5 h-4.5 text-slate-400" />
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
