import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { fadeUp, staggerContainer, listItem } from '../../utils/motion';
import { getIncidents } from '../../api/incidentApi';
import { getIncidentGroups } from '../../api/incidentGroupApi';
import StatusBarChart from '../../components/charts/StatusBarChart';
import TypePieChart from '../../components/charts/TypePieChart';

// Consistent Status Badge
const StatusBadge = ({ status }) => {
  const styles = {
    reported: 'bg-slate-50 text-slate-700 border-slate-200',
    verified: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    assigned: 'bg-amber-50 text-amber-700 border-amber-200',
    'in-progress': 'bg-blue-50 text-blue-700 border-blue-200',
    resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    closed: 'bg-slate-100 text-slate-500 border-slate-200'
  };
  const current = styles[status?.toLowerCase()] || 'bg-slate-50 text-slate-700 border-slate-200';
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide shrink-0 ${current}`}>
      {status}
    </span>
  );
};

// Consistent Severity Badge
const SeverityBadge = ({ severity }) => {
  const styles = {
    critical: 'bg-rose-50 text-rose-700 border-rose-200 font-extrabold animate-pulse',
    high: 'bg-amber-50 text-amber-800 border-amber-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200/60',
    low: 'bg-blue-50 text-blue-700 border-blue-200'
  };
  const current = styles[severity?.toLowerCase()] || 'bg-slate-50 text-slate-700 border-slate-200';
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide shrink-0 ${current}`}>
      {severity}
    </span>
  );
};

export default function AdminDashboard({ data, user, fetchDashboardData }) {
  const { summary, incidentStats, resourceStats, alertStats } = data || {};

  // Clock state
  const [time, setTime] = useState(new Date());

  // Local Data State
  const [incidents, setIncidents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loadingLocal, setLoadingLocal] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);

  // Update Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch local telemetry data on load/refresh
  const loadTelemetry = async () => {
    setLoadingLocal(true);
    try {
      const [incRes, grpRes] = await Promise.all([
        getIncidents({ limit: 100, sort: '-createdAt' }),
        getIncidentGroups()
      ]);
      if (incRes.success) {
        setIncidents(incRes.data.incidents || []);
      }
      if (grpRes.success) {
        setGroups(grpRes.data.groups || []);
      }
    } catch (err) {
      console.error('[Telemetry Load Error]', err);
    } finally {
      setLoadingLocal(false);
    }
  };

  useEffect(() => {
    loadTelemetry();
  }, [data]);

  // Derived telemetry metrics
  const activeIncidents = incidents.filter(i => ['reported', 'verified', 'assigned', 'in-progress'].includes(i.status));
  const activeCoords = activeIncidents.filter(inc => inc.location?.coordinates && inc.location.coordinates.length === 2);
  const aiPriorityIncidents = incidents
    .filter(i => i.aiTriage && ['reported', 'verified', 'assigned', 'in-progress'].includes(i.status))
    .sort((a, b) => (b.aiTriage.riskScore || 0) - (a.aiTriage.riskScore || 0))
    .slice(0, 3);
  
  const activeGroups = groups.filter(g => g.status === 'active');
  const recentAlerts = alertStats?.recentAlerts || [];

  // Calculate dynamic bounding box for SVG plotting
  let minLat = 23.23, maxLat = 23.32, minLng = 77.37, maxLng = 77.47; // Default bounds
  if (activeCoords.length > 0) {
    const lats = activeCoords.map(c => c.location.coordinates[1]);
    const lngs = activeCoords.map(c => c.location.coordinates[0]);
    const latMin = Math.min(...lats);
    const latMax = Math.max(...lats);
    const lngMin = Math.min(...lngs);
    const lngMax = Math.max(...lngs);

    const latRange = latMax - latMin;
    const lngRange = lngMax - lngMin;
    const latPadding = latRange > 0 ? latRange * 0.15 : 0.01;
    const lngPadding = lngRange > 0 ? lngRange * 0.15 : 0.01;

    minLat = latMin - latPadding;
    maxLat = latMax + latPadding;
    minLng = lngMin - lngPadding;
    maxLng = lngMax + lngPadding;
  }

  // Projection math
  const width = 500;
  const height = 300;
  const padding = 40;

  const getSvgX = (lng) => {
    const range = maxLng - minLng || 0.01;
    return padding + ((lng - minLng) / range) * (width - 2 * padding);
  };

  const getSvgY = (lat) => {
    const range = maxLat - minLat || 0.01;
    return height - padding - ((lat - minLat) / range) * (height - 2 * padding);
  };

  // Grid tick numbers calculation
  const gridX = Array.from({ length: 5 }, (_, i) => padding + (i / 4) * (width - 2 * padding));
  const gridY = Array.from({ length: 4 }, (_, i) => padding + (i / 3) * (height - 2 * padding));

  const checkIsRead = (alert) => {
    if (!user) return true;
    return alert.readBy && alert.readBy.some(entry => entry.user === user._id || entry.user?._id === user._id);
  };

  return (
    <div className="space-y-6 text-left">
      {/* 1. Header Section */}
      <motion.div 
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-outline-variant"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">DisasterConnect Command Center</h1>
          <p className="text-sm text-slate-500 mt-1">Live incident coordination, responder dispatch, and risk monitoring</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-bold shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>LIVE SYSTEM</span>
          </div>

          {/* Clock */}
          <div className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-mono text-xs font-bold text-slate-700 shadow-sm">
            {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} • {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
          </div>

          {/* Sync control */}
          <button 
            onClick={() => {
              fetchDashboardData();
              loadTelemetry();
            }}
            className="p-2 border border-slate-200 text-slate-700 hover:bg-slate-50 transition rounded-lg text-xs font-bold inline-flex items-center justify-center shadow-sm"
            title="Reload database telemetry"
          >
            <span className="material-symbols-outlined text-sm">sync</span>
          </button>
        </div>
      </motion.div>

      {/* 2. Metric Strip */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Critical Card */}
        <motion.div 
          className="bg-white border border-outline-variant rounded-xl p-5 shadow-sm flex items-center justify-between border-l-4 border-l-rose-500"
          variants={listItem}
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Critical Incidents</span>
            <span className="text-3xl font-extrabold text-slate-900">{summary?.incidents?.critical ?? 0}</span>
            <span className="text-xs text-rose-600 font-semibold block">Requires immediate dispatch</span>
          </div>
          <div className="p-3 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-[24px]">campaign</span>
          </div>
        </motion.div>

        {/* Active Tickets Card */}
        <motion.div 
          className="bg-white border border-outline-variant rounded-xl p-5 shadow-sm flex items-center justify-between border-l-4 border-l-blue-500"
          variants={listItem}
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Tickets</span>
            <span className="text-3xl font-extrabold text-slate-900">{summary?.incidents?.active ?? 0}</span>
            <span className="text-xs text-blue-600 font-semibold block">Under triage or response</span>
          </div>
          <div className="p-3 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-[24px]">emergency</span>
          </div>
        </motion.div>

        {/* Available Resources Card */}
        <motion.div 
          className="bg-white border border-outline-variant rounded-xl p-5 shadow-sm flex items-center justify-between border-l-4 border-l-emerald-500"
          variants={listItem}
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Available Resources</span>
            <span className="text-3xl font-extrabold text-slate-900">{summary?.resources?.available ?? 0}</span>
            <span className="text-xs text-emerald-600 font-semibold block">Ready to deploy</span>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-[24px]">support</span>
          </div>
        </motion.div>

        {/* Unread Alerts Card */}
        <motion.div 
          className="bg-white border border-outline-variant rounded-xl p-5 shadow-sm flex items-center justify-between border-l-4 border-l-amber-500"
          variants={listItem}
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Unread Alerts</span>
            <span className="text-3xl font-extrabold text-slate-900">{summary?.alerts?.unread ?? 0}</span>
            <span className="text-xs text-amber-600 font-semibold block">Broadcast feed backlog</span>
          </div>
          <div className="p-3 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-[24px]">notifications_active</span>
          </div>
        </motion.div>
      </motion.div>

      {/* 3. Main Command Layout: Map & Incident Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 65%: Operational Map Overview */}
        <motion.div 
          className="lg:col-span-8 bg-white border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col justify-between"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">radar</span>
                Operational Radar Console
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                Telemetry Grid
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* SVG Map grid wrapper */}
              <div className="md:col-span-8 bg-slate-950 rounded-xl relative border border-slate-800 shadow-inner overflow-hidden aspect-[5/3]">
                {loadingLocal ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-950/80">
                    <span className="material-symbols-outlined text-[32px] text-primary animate-spin mb-2">sync</span>
                    <span className="text-xs font-mono">Acquiring coordinates...</span>
                  </div>
                ) : activeCoords.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined text-[40px] text-slate-700 animate-pulse">radar</span>
                    <span className="text-xs font-mono mt-2">NO ACTIVE COORDINATES REPORTED</span>
                  </div>
                ) : (
                  <>
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                      {/* Grid lines */}
                      {gridX.map((x, i) => (
                        <g key={`x-${i}`}>
                          <line x1={x} y1={padding} x2={x} y2={height - padding} stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" />
                          <text x={x} y={height - padding + 15} fill="#64748B" fontSize="8" textAnchor="middle" fontFamily="monospace">
                            {(minLng + (i / 4) * (maxLng - minLng)).toFixed(3)}
                          </text>
                        </g>
                      ))}
                      {gridY.map((y, i) => (
                        <g key={`y-${i}`}>
                          <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" />
                          <text x={padding - 5} y={y + 3} fill="#64748B" fontSize="8" textAnchor="end" fontFamily="monospace">
                            {(maxLat - (i / 3) * (maxLat - minLat)).toFixed(3)}
                          </text>
                        </g>
                      ))}

                      {/* Compass widget */}
                      <g transform="translate(445, 50)" opacity="0.15">
                        <circle r="16" fill="none" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 2" />
                        <line x1="0" y1="-20" x2="0" y2="20" stroke="#94A3B8" strokeWidth="1" />
                        <line x1="-20" y1="0" x2="20" y2="0" stroke="#94A3B8" strokeWidth="1" />
                        <polygon points="0,-20 -3,-4 0,-6" fill="#94A3B8" />
                        <polygon points="0,-20 3,-4 0,-6" fill="#64748B" />
                        <text x="0" y="-23" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#94A3B8">N</text>
                      </g>

                      {/* Active coordinates markers */}
                      {activeCoords.map((incident) => {
                        const x = getSvgX(incident.location.coordinates[0]);
                        const y = getSvgY(incident.location.coordinates[1]);
                        const isSelected = selectedIncident?._id === incident._id;
                        const isCritical = incident.severity === 'critical';

                        return (
                          <g 
                            key={incident._id} 
                            onClick={() => setSelectedIncident(incident)}
                            className="cursor-pointer group"
                          >
                            {isCritical && (
                              <circle 
                                cx={x} 
                                cy={y} 
                                r="9" 
                                fill="none" 
                                stroke="#EF4444" 
                                strokeWidth="1.5" 
                                className="animate-ping" 
                                style={{ transformOrigin: `${x}px ${y}px`, animationDuration: '3s' }}
                              />
                            )}
                            {isSelected && (
                              <>
                                <circle cx={x} cy={y} r="11" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="2 2" />
                                <line x1={x - 15} y1={y} x2={x + 15} y2={y} stroke="#3B82F6" strokeWidth="0.8" />
                                <line x1={x} y1={y - 15} x2={x} y2={y + 15} stroke="#3B82F6" strokeWidth="0.8" />
                              </>
                            )}
                            <circle 
                              cx={x} 
                              cy={y} 
                              r={isSelected ? "5.5" : "4.5"} 
                              fill={
                                incident.severity === 'critical' ? '#EF4444' :
                                incident.severity === 'high' ? '#F59E0B' :
                                incident.severity === 'medium' ? '#F59E0B' : '#3B82F6'
                              }
                              stroke="#FFFFFF" 
                              strokeWidth="1.2"
                              className="transition-all duration-200 group-hover:scale-125"
                            />
                          </g>
                        );
                      })}
                    </svg>

                    {/* Full map note */}
                    <div className="absolute top-2.5 right-2.5 bg-slate-900/80 border border-slate-700 rounded px-2 py-1 text-[9px] font-bold text-slate-400 font-mono">
                      GPS GRID ACTIVE
                    </div>
                  </>
                )}
              </div>

              {/* Coordinates details panel */}
              <div className="md:col-span-4 flex flex-col justify-between border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide border-b pb-1.5 border-slate-200">
                    Live Telemetry Detail
                  </h4>
                  {selectedIncident ? (
                    <div className="space-y-2.5 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Ticket Code</span>
                        <span className="font-mono font-bold text-slate-800">{selectedIncident.ticketNumber || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Incident Title</span>
                        <span className="font-semibold text-slate-900 block truncate" title={selectedIncident.title}>
                          {selectedIncident.title}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Severity</span>
                          <SeverityBadge severity={selectedIncident.severity} />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Status</span>
                          <StatusBadge status={selectedIncident.status} />
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">GPS Coordinates</span>
                        <span className="font-mono text-[11px] text-slate-700 block">
                          Lat: {selectedIncident.location?.coordinates[1]?.toFixed(5)}°<br/>
                          Lng: {selectedIncident.location?.coordinates[0]?.toFixed(5)}°
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Dispatch Site</span>
                        <span className="text-slate-600 block text-[11px] line-clamp-2" title={selectedIncident.location?.address}>
                          📍 {selectedIncident.location?.address || 'No location address available'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-slate-400 text-[11px] italic">
                      Select any active coordinate node on the grid scanner to view live dispatcher details.
                    </div>
                  )}
                </div>

                {selectedIncident && (
                  <div className="mt-4 pt-3 border-t border-slate-200 flex gap-2">
                    <Link
                      to={`/dashboard/incidents/${selectedIncident._id}`}
                      className="flex-1 py-1.5 bg-primary text-white text-center text-xs font-bold rounded-lg hover:opacity-95 transition"
                    >
                      Open Dossier
                    </Link>
                    <button
                      onClick={() => setSelectedIncident(null)}
                      className="px-2 py-1.5 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-100 text-xs font-bold"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex gap-4">
              <span>Active GPS Markers: <strong className="text-slate-800">{activeCoords.length}</strong></span>
              <span>High Severity cases: <strong className="text-rose-600">{activeIncidents.filter(i => ['critical', 'high'].includes(i.severity)).length}</strong></span>
            </div>
            
            <Link
              to="/dashboard/map"
              className="text-primary font-bold inline-flex items-center gap-1 hover:underline"
            >
              <span>Open Map Command Center for full live map</span>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </Link>
          </div>
        </motion.div>

        {/* Right 35%: Live Incident Queue */}
        <motion.div 
          className="lg:col-span-4 bg-white border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col justify-between"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">list_alt</span>
                Live Incident Queue
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold text-blue-600 border border-blue-200 bg-blue-50 rounded uppercase">
                Active
              </span>
            </div>

            <div className="space-y-3">
              {activeIncidents.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs italic">
                  No active incidents requiring dispatcher triage.
                </div>
              ) : (
                activeIncidents.slice(0, 5).map((inc) => (
                  <Link 
                    key={inc._id}
                    to={`/dashboard/incidents/${inc._id}`}
                    className="block p-3 border border-slate-100 rounded-lg bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition text-left"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400 block tracking-wide">
                        {inc.ticketNumber || 'NO TICKET'}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">
                        {new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 mt-1 truncate" title={inc.title}>
                      {inc.title}
                    </h4>

                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                      📍 {inc.location?.address || 'No address details'}
                    </p>

                    <div className="flex gap-2 mt-2 pt-2 border-t border-slate-100">
                      <SeverityBadge severity={inc.severity} />
                      <StatusBadge status={inc.status} />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {activeIncidents.length > 0 && (
            <Link 
              to="/dashboard/incidents"
              className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-center text-xs font-bold rounded-lg border border-slate-200 block transition"
            >
              View all incidents
            </Link>
          )}
        </motion.div>
      </div>

      {/* 4. AI Priority Section */}
      <motion.div 
        className="bg-white border border-outline-variant rounded-xl p-5 shadow-sm space-y-4"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">psychology</span>
            AI Triage Priority Queue
          </h3>
          <span className="text-[10px] font-mono font-bold text-indigo-500 uppercase">
            Gemini Advisory Systems
          </span>
        </div>

        {aiPriorityIncidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <span className="material-symbols-outlined text-slate-300 text-[40px] mb-2">psychology</span>
            <p className="text-sm font-medium text-slate-700">AI triage database empty</p>
            <p className="text-xs text-slate-400 max-w-sm mt-1">AI triage appears here after incident reports are analyzed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {aiPriorityIncidents.map((inc) => {
              const score = inc.aiTriage.riskScore || 0;
              const scoreColor = score >= 80 ? 'text-rose-600 bg-rose-50 border-rose-200' :
                                 score >= 50 ? 'text-amber-600 bg-amber-50 border-amber-200' :
                                 'text-emerald-600 bg-emerald-50 border-emerald-200';

              return (
                <div 
                  key={inc._id}
                  className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/30 text-left flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-0.5 rounded font-mono text-xs font-black border ${scoreColor}`}>
                        {score}% RISK
                      </span>
                      <SeverityBadge severity={inc.aiTriage.recommendedPriority || inc.severity} />
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">
                        {inc.ticketNumber || 'NO TICKET'}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5" title={inc.title}>
                        {inc.title}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-3 bg-white p-2.5 rounded border border-slate-100/60 leading-relaxed italic">
                      "{inc.aiTriage.shortSummary}"
                    </p>

                    {inc.aiTriage.likelyRisks && inc.aiTriage.likelyRisks.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1.5">
                        {inc.aiTriage.likelyRisks.slice(0, 3).map((risk, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 bg-slate-100 text-[9px] text-slate-600 rounded font-medium border border-slate-200/40">
                            ⚠️ {risk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <Link
                    to={`/dashboard/incidents/${inc._id}`}
                    className="mt-4 w-full py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-center text-xs font-bold rounded-lg border border-indigo-200 block transition"
                  >
                    Open AI Dossier
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* 5. Grouped Reports & 6. Recent Alerts (Grid of 2 items) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Grouped Incident Cases */}
        <motion.div 
          className="bg-white border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col justify-between"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">folder_shared</span>
                Smart Grouped Cases
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold text-indigo-600 border border-indigo-200 bg-indigo-50 rounded uppercase">
                {activeGroups.length} ACTIVE GROUPS
              </span>
            </div>

            <div className="space-y-3">
              {activeGroups.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs italic">
                  No overlapping cases grouped at this time.
                </div>
              ) : (
                activeGroups.slice(0, 3).map((group) => (
                  <div 
                    key={group._id}
                    className="p-3 border border-slate-100 rounded-lg bg-slate-50/50 flex items-center justify-between text-left"
                  >
                    <div className="space-y-1 max-w-[75%]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs text-indigo-600 block">
                          {group.groupNumber}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 border rounded text-slate-500 uppercase font-bold tracking-wide">
                          {group.type}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {group.primaryIncident?.title || 'Group Case'}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        📍 {group.locationSummary || 'Incident location cluster'}
                      </p>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-bold">
                        {group.incidentCount} Reports
                      </span>
                      <Link
                        to="/dashboard/groups"
                        className="text-primary hover:underline text-[10px] font-bold block mt-1"
                      >
                        Manage Group
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <Link 
              to="/dashboard/groups"
              className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>Analyze smart groupings in the Incident Groups Center</span>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </Link>
          </div>
        </motion.div>

        {/* Right Column: Recent Command Alerts */}
        <motion.div 
          className="bg-white border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col justify-between"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">notifications</span>
                Recent Command Alerts
              </h3>
              <Link to="/dashboard/alerts" className="text-primary hover:underline text-xs font-bold">
                Alerts Center
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentAlerts.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs italic">
                  No command alerts registered.
                </div>
              ) : (
                recentAlerts.slice(0, 4).map((alert) => {
                  const isRead = checkIsRead(alert);
                  const pColors = alert.priority === 'critical' ? 'border-l-rose-500 bg-rose-50/30' :
                                  alert.priority === 'high' || alert.priority === 'medium' ? 'border-l-amber-500 bg-amber-50/30' :
                                  'border-l-blue-500 bg-blue-50/30';
                  
                  return (
                    <div 
                      key={alert._id}
                      className={`p-2.5 border border-slate-100 border-l-4 rounded-r-lg flex gap-2.5 items-start justify-between text-left ${pColors} ${isRead ? 'opacity-70' : ''}`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {!isRead && (
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 inline-block animate-pulse shrink-0"></span>
                          )}
                          <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wide">
                            {alert.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-1 leading-relaxed">
                          {alert.message}
                        </p>
                      </div>

                      <span className="font-mono text-[9px] text-slate-400 shrink-0">
                        {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-right">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Secure Communications Link Active
            </span>
          </div>
        </motion.div>
      </div>

      {/* Operational Trends Section */}
      <motion.div 
        className="bg-white border border-outline-variant rounded-xl p-5 shadow-sm space-y-6"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        <h2 className="text-base font-bold text-slate-900 border-b border-outline-variant pb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">timeline</span>
          Operational Trends
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <StatusBarChart data={incidentStats?.byStatus} title="Global Incidents Status Log" />
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <TypePieChart data={incidentStats?.byType} title="Global Incidents Type Distribution" />
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <StatusBarChart data={resourceStats?.byStatus} title="Global Resources Deployment Status" />
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <TypePieChart data={alertStats?.byPriority} title="Alert Broadcast Priority Scope" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
