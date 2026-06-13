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
    reported: 'bg-slate-100 text-slate-700 border-slate-200',
    verified: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    assigned: 'bg-amber-50 text-amber-700 border-amber-200',
    'in-progress': 'bg-blue-50 text-[#2563EB] border-blue-200',
    resolved: 'bg-emerald-50 text-[#16A34A] border-emerald-200',
    closed: 'bg-slate-100 text-slate-500 border-slate-200'
  };
  const current = styles[status?.toLowerCase()] || 'bg-slate-100 text-slate-700 border-slate-200';
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider shrink-0 ${current}`}>
      {status}
    </span>
  );
};

// Consistent Severity Badge
const SeverityBadge = ({ severity }) => {
  const styles = {
    critical: 'bg-red-50 text-[#DC2626] border-red-200 font-bold',
    high: 'bg-amber-50 text-[#F59E0B] border-amber-200 font-semibold',
    medium: 'bg-amber-50/50 text-[#D97706] border-amber-100',
    low: 'bg-blue-50 text-[#2563EB] border-blue-100'
  };
  const current = styles[severity?.toLowerCase()] || 'bg-slate-50 text-slate-700 border-slate-200';
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider shrink-0 ${current}`}>
      {severity}
    </span>
  );
};

export default function AdminDashboard({ data, user, fetchDashboardData }) {
  const { summary, incidentStats, resourceStats, alertStats } = data || {};

  // Clock & Sync state
  const [time, setTime] = useState(new Date());
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

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
      setLastRefreshed(new Date());
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
  
  // Sort Incident Queue by severity rank (Critical first) and newest
  const severityRanks = { critical: 4, high: 3, medium: 2, low: 1 };
  const queueIncidents = [...activeIncidents]
    .sort((a, b) => {
      const aRank = severityRanks[a.severity?.toLowerCase()] || 0;
      const bRank = severityRanks[b.severity?.toLowerCase()] || 0;
      if (bRank !== aRank) return bRank - aRank;
      return new Date(b.createdAt) - new Date(a.createdAt);
    })
    .slice(0, 6);

  // AI Watchlist
  const aiTriageWatchlist = incidents
    .filter(i => i.aiTriage && ['reported', 'verified', 'assigned', 'in-progress'].includes(i.status))
    .sort((a, b) => (b.aiTriage.riskScore || 0) - (a.aiTriage.riskScore || 0))
    .slice(0, 3);
  
  const activeGroups = groups.filter(g => g.status === 'active');
  const topActiveGroups = activeGroups.slice(0, 3);
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

  const handleRefreshClick = () => {
    fetchDashboardData();
    loadTelemetry();
  };

  return (
    <div className="bg-[#F4F6FA] min-h-screen -m-6 p-6 space-y-6 text-left text-[#0F172A]">
      {/* 1. Compact Command Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#DDE3EA]">
        <div>
          <h1 className="text-xl font-bold text-[#07111F] tracking-tight">Emergency Operations Command</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Live incident monitoring, responder dispatch, grouped cases and AI triage</p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-emerald-200 bg-emerald-50 text-[#16A34A] text-[11px] font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A] animate-pulse"></span>
            <span>LIVE SYSTEM</span>
          </div>

          <span className="text-xs text-[#64748B]">
            Sync: <strong className="text-[#0F172A] font-mono">{lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</strong>
          </span>

          <button 
            onClick={handleRefreshClick}
            className="p-1.5 border border-[#DDE3EA] bg-white text-[#64748B] hover:bg-slate-50 transition rounded-md text-xs font-bold flex items-center justify-center shadow-sm"
            title="Refresh logs"
          >
            <span className="material-symbols-outlined text-sm">sync</span>
          </button>
        </div>
      </div>

      {/* 2. Top KPI Summary Strip */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Critical Open */}
        <motion.div 
          className="bg-white border border-[#DDE3EA] rounded-[16px] p-4 shadow-sm border-l-4 border-l-[#DC2626]"
          variants={listItem}
        >
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Critical Open</span>
          <span className="text-2xl font-bold text-[#0F172A] mt-1 block">{summary?.incidents?.critical ?? 0}</span>
          <span className="text-[10px] text-[#DC2626] font-medium block mt-1">Immediate dispatch needed</span>
        </motion.div>

        {/* Active Incidents */}
        <motion.div 
          className="bg-white border border-[#DDE3EA] rounded-[16px] p-4 shadow-sm border-l-4 border-l-[#2563EB]"
          variants={listItem}
        >
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Active Incidents</span>
          <span className="text-2xl font-bold text-[#0F172A] mt-1 block">{summary?.incidents?.active ?? 0}</span>
          <span className="text-[10px] text-[#2563EB] font-medium block mt-1">Ongoing rescue ops</span>
        </motion.div>

        {/* Grouped Cases */}
        <motion.div 
          className="bg-white border border-[#DDE3EA] rounded-[16px] p-4 shadow-sm border-l-4 border-l-indigo-600"
          variants={listItem}
        >
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Grouped Cases</span>
          <span className="text-2xl font-bold text-[#0F172A] mt-1 block">{activeGroups.length}</span>
          <span className="text-[10px] text-indigo-600 font-medium block mt-1">Clusters detected</span>
        </motion.div>

        {/* Available Resources */}
        <motion.div 
          className="bg-white border border-[#DDE3EA] rounded-[16px] p-4 shadow-sm border-l-4 border-l-[#16A34A]"
          variants={listItem}
        >
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Available Assets</span>
          <span className="text-2xl font-bold text-[#0F172A] mt-1 block">{summary?.resources?.available ?? 0}</span>
          <span className="text-[10px] text-[#16A34A] font-medium block mt-1">Ready to deploy</span>
        </motion.div>

        {/* Unread Alerts */}
        <motion.div 
          className="bg-white border border-[#DDE3EA] rounded-[16px] p-4 shadow-sm border-l-4 border-l-[#F59E0B]"
          variants={listItem}
        >
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Unread Alerts</span>
          <span className="text-2xl font-bold text-[#0F172A] mt-1 block">{summary?.alerts?.unread ?? 0}</span>
          <span className="text-[10px] text-[#F59E0B] font-medium block mt-1">Requires supervisor review</span>
        </motion.div>
      </motion.div>

      {/* 3. Main Command Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 columns: Live Incident Map Overview */}
        <motion.div 
          className="lg:col-span-8 bg-white border border-[#DDE3EA] rounded-[16px] p-5 shadow-sm flex flex-col justify-between"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#DDE3EA]">
              <h3 className="font-semibold text-[#07111F] text-sm uppercase tracking-wide flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#2563EB] text-lg">map</span>
                Live Incident Map
              </h3>
              <span className="text-[10px] font-bold text-[#64748B] uppercase font-mono">GPS Coordinates</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* GIS Cartesian Coordinate Plotting Board */}
              <div className="md:col-span-8 bg-slate-900 rounded-lg relative overflow-hidden aspect-[1.6]">
                {loadingLocal ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined text-lg text-[#2563EB] animate-spin mb-1">sync</span>
                    <span className="text-[10px] font-mono">Syncing GPS...</span>
                  </div>
                ) : activeCoords.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined text-[36px] text-slate-700 mb-1">pin_drop</span>
                    <span className="text-[10px] font-mono">GRID OFFLINE • NO ACTIVE COORDINATES</span>
                  </div>
                ) : (
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

                    {/* Active incident coordinates */}
                    {activeCoords.map((incident) => {
                      const x = getSvgX(incident.location.coordinates[0]);
                      const y = getSvgY(incident.location.coordinates[1]);
                      const isSelected = selectedIncident?._id === incident._id;

                      return (
                        <g 
                          key={incident._id} 
                          onClick={() => setSelectedIncident(incident)}
                          className="cursor-pointer"
                        >
                          {isSelected && (
                            <circle cx={x} cy={y} r="9" fill="none" stroke="#2563EB" strokeWidth="1.2" />
                          )}
                          <circle 
                            cx={x} 
                            cy={y} 
                            r={isSelected ? "5" : "4"} 
                            fill={
                              incident.severity === 'critical' ? '#DC2626' :
                              incident.severity === 'high' ? '#F59E0B' :
                              incident.severity === 'medium' ? '#F59E0B' : '#2563EB'
                            }
                            stroke="#FFFFFF" 
                            strokeWidth="1"
                          />
                        </g>
                      );
                    })}
                  </svg>
                )}
              </div>

              {/* Coordinate Telemetry Side Reader */}
              <div className="md:col-span-4 flex flex-col justify-between border border-[#DDE3EA] rounded-lg p-4 bg-slate-50">
                <div className="space-y-3">
                  <h4 className="text-[11px] font-bold text-[#64748B] uppercase tracking-wide border-b pb-1 border-[#DDE3EA]">
                    Telemetry Data Link
                  </h4>
                  {selectedIncident ? (
                    <div className="space-y-2.5 text-xs text-[#0F172A]">
                      <div>
                        <span className="text-[9px] text-[#64748B] uppercase tracking-wider block">Incident ID</span>
                        <span className="font-mono font-bold">{selectedIncident.ticketNumber || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#64748B] uppercase tracking-wider block">Title</span>
                        <span className="font-semibold block truncate" title={selectedIncident.title}>
                          {selectedIncident.title}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <div>
                          <span className="text-[9px] text-[#64748B] uppercase tracking-wider block">Severity</span>
                          <SeverityBadge severity={selectedIncident.severity} />
                        </div>
                        <div>
                          <span className="text-[9px] text-[#64748B] uppercase tracking-wider block">Status</span>
                          <StatusBadge status={selectedIncident.status} />
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#64748B] uppercase tracking-wider block">GPS Grid</span>
                        <span className="font-mono text-[11px] text-slate-700 block">
                          Lat: {selectedIncident.location?.coordinates[1]?.toFixed(5)}°<br/>
                          Lng: {selectedIncident.location?.coordinates[0]?.toFixed(5)}°
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#64748B] uppercase tracking-wider block">Address</span>
                        <span className="text-slate-600 block text-[11px] line-clamp-2" title={selectedIncident.location?.address}>
                          {selectedIncident.location?.address || 'No details'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-[#64748B] text-[11px] italic">
                      Click any coordinate plot on the grid to display live dispatcher data.
                    </div>
                  )}
                </div>

                {selectedIncident && (
                  <div className="mt-4 pt-3 border-t border-[#DDE3EA] flex gap-2">
                    <Link
                      to={`/dashboard/incidents/${selectedIncident._id}`}
                      className="flex-grow py-1 bg-[#2563EB] text-white text-center text-[11px] font-bold rounded hover:opacity-90 transition"
                    >
                      Dossier
                    </Link>
                    <button
                      onClick={() => setSelectedIncident(null)}
                      className="px-2 py-1 border border-[#DDE3EA] text-[#64748B] bg-white rounded hover:bg-slate-100 text-[11px] font-bold"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#64748B]">
            <div className="flex gap-4">
              <span>Active coordinate units: <strong className="text-[#0F172A]">{activeCoords.length}</strong></span>
              <span>High-priority incidents: <strong className="text-[#DC2626]">{activeIncidents.filter(i => ['critical', 'high'].includes(i.severity)).length}</strong></span>
              <span>Grouped incident cases: <strong className="text-indigo-600">{activeIncidents.filter(i => i.incidentGroup).length}</strong></span>
            </div>
            
            <Link
              to="/dashboard/map"
              className="text-[#2563EB] font-bold inline-flex items-center gap-0.5 hover:underline"
            >
              <span>Open Interactive Map for full GIS view</span>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </Link>
          </div>
        </motion.div>

        {/* Right 4 columns: Priority Incident Queue */}
        <motion.div 
          className="lg:col-span-4 bg-white border border-[#DDE3EA] rounded-[16px] p-5 shadow-sm flex flex-col justify-between"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#DDE3EA]">
              <h3 className="font-semibold text-[#07111F] text-sm uppercase tracking-wide flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#2563EB] text-lg">list_alt</span>
                Priority Incident Queue
              </h3>
              <span className="px-1.5 py-0.5 text-[9px] font-bold text-rose-700 border border-rose-200 bg-rose-50 rounded uppercase">
                Alerts
              </span>
            </div>

            <div className="space-y-2">
              {queueIncidents.length === 0 ? (
                <div className="py-12 text-center text-[#64748B] text-xs italic">
                  No active incidents recorded.
                </div>
              ) : (
                queueIncidents.map((inc) => (
                  <Link 
                    key={inc._id}
                    to={`/dashboard/incidents/${inc._id}`}
                    className="block p-2.5 border border-slate-100 rounded-lg bg-slate-50 hover:bg-slate-100/70 hover:border-slate-200 transition text-left"
                  >
                    <div className="flex justify-between items-start gap-2 text-[10px]">
                      <span className="font-mono font-bold text-[#64748B] tracking-wide">
                        {inc.ticketNumber || 'NO TICKET'}
                      </span>
                      <span className="text-[#64748B]">
                        {new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[#0F172A] mt-1 truncate" title={inc.title}>
                      {inc.title}
                    </h4>

                    <p className="text-[10px] text-[#64748B] mt-0.5 truncate">
                      📍 {inc.location?.address || 'No address details'}
                    </p>

                    <div className="flex gap-2 mt-2 pt-2 border-t border-slate-200/40">
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
              className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 text-[#0F172A] text-center text-xs font-bold rounded-lg border border-[#DDE3EA] block transition"
            >
              View all incidents
            </Link>
          )}
        </motion.div>
      </div>

      {/* 4. Second Row: AI Watchlist & Grouped Incident Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: AI Triage Watchlist */}
        <motion.div 
          className="bg-white border border-[#DDE3EA] rounded-[16px] p-5 shadow-sm flex flex-col justify-between"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#DDE3EA]">
              <h3 className="font-semibold text-[#07111F] text-sm uppercase tracking-wide flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#2563EB] text-lg">psychology</span>
                AI Triage Watchlist
              </h3>
              <span className="text-[9px] font-mono font-bold text-indigo-600 uppercase">
                Gemini Advisory
              </span>
            </div>

            {aiTriageWatchlist.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center bg-slate-50 rounded-lg border border-dashed border-[#DDE3EA]">
                <span className="material-symbols-outlined text-slate-300 text-[32px] mb-1">psychology</span>
                <p className="text-xs font-medium text-slate-700">AI triage appears here after incident reports are analyzed.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {aiTriageWatchlist.map((inc) => {
                  const score = inc.aiTriage.riskScore || 0;
                  const scoreColor = score >= 80 ? 'text-[#DC2626] bg-red-50 border-red-200' :
                                     score >= 50 ? 'text-[#F59E0B] bg-amber-50 border-amber-200' :
                                     'text-[#16A34A] bg-emerald-50 border-emerald-200';

                  return (
                    <div 
                      key={inc._id}
                      className="border border-[#DDE3EA] rounded-lg p-3 bg-slate-50/50 flex flex-col md:flex-row justify-between md:items-center gap-3 text-left"
                    >
                      <div className="space-y-1 max-w-[80%]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold border ${scoreColor}`}>
                            {score}% RISK
                          </span>
                          <span className="font-mono text-[10px] text-[#64748B]">
                            {inc.ticketNumber}
                          </span>
                          <SeverityBadge severity={inc.aiTriage.recommendedPriority || inc.severity} />
                        </div>
                        <h4 className="text-xs font-bold text-[#0F172A] truncate">
                          {inc.title}
                        </h4>
                        <p className="text-[11px] text-[#64748B] line-clamp-1 italic">
                          "{inc.aiTriage.shortSummary}"
                        </p>
                      </div>

                      <Link
                        to={`/dashboard/incidents/${inc._id}`}
                        className="py-1 px-3 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-center text-[10px] font-bold rounded transition shrink-0 block"
                      >
                        AI Dossier
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* Right: Grouped Incident Cases */}
        <motion.div 
          className="bg-white border border-[#DDE3EA] rounded-[16px] p-5 shadow-sm flex flex-col justify-between"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#DDE3EA]">
              <h3 className="font-semibold text-[#07111F] text-sm uppercase tracking-wide flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#2563EB] text-lg">folder_shared</span>
                Grouped Incident Cases
              </h3>
              <span className="px-1.5 py-0.5 text-[9px] font-bold text-indigo-700 border border-indigo-200 bg-indigo-50 rounded uppercase">
                {activeGroups.length} Active Groups
              </span>
            </div>

            <div className="space-y-2.5">
              {activeGroups.length === 0 ? (
                <div className="py-12 text-center text-[#64748B] text-xs italic">
                  No incident clusters grouped currently.
                </div>
              ) : (
                topActiveGroups.map((group) => (
                  <div 
                    key={group._id}
                    className="p-3 border border-slate-100 rounded-lg bg-slate-50/50 flex items-center justify-between text-left text-xs"
                  >
                    <div className="space-y-1 max-w-[70%]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-700">{group.groupNumber}</span>
                        <span className="text-[9px] px-1 bg-slate-100 border rounded text-slate-500 uppercase font-bold">
                          {group.type}
                        </span>
                      </div>
                      <p className="font-bold text-[#0F172A] truncate">
                        {group.primaryIncident?.title || 'Cluster incident'}
                      </p>
                      <p className="text-[10px] text-[#64748B] truncate">
                        📍 {group.locationSummary || 'Incident area'}
                      </p>
                    </div>

                    <div className="text-right flex flex-col items-end shrink-0">
                      <span className="px-1.5 py-0.5 bg-blue-50 text-[#2563EB] border border-blue-200 rounded text-[10px] font-bold block">
                        {group.incidentCount} Reports
                      </span>
                      <Link
                        to="/dashboard/groups"
                        className="text-[#2563EB] hover:underline text-[10px] font-bold block mt-1.5"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link 
              to="/dashboard/groups"
              className="text-xs text-[#2563EB] font-bold hover:underline inline-flex items-center gap-0.5"
            >
              <span>Analyze smart groupings in Incident Groups Center</span>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* 5. Third Row: Resource Readiness & Recent Command Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Resource Readiness */}
        <motion.div 
          className="bg-white border border-[#DDE3EA] rounded-[16px] p-5 shadow-sm"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <h3 className="font-semibold text-[#07111F] text-sm uppercase tracking-wide flex items-center gap-1.5 pb-2 border-b border-[#DDE3EA] mb-4">
            <span className="material-symbols-outlined text-[#2563EB] text-lg">inventory_2</span>
            Resource Readiness
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#64748B]">Available Units</span>
                <span className="text-[#16A34A] font-bold">
                  {summary?.resources?.available ?? 0} / {summary?.resources?.total ?? 1}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#16A34A] h-full" 
                  style={{ width: `${Math.min(Math.round(((summary?.resources?.available ?? 0) / (summary?.resources?.total || 1)) * 100), 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#64748B]">Active Deployments</span>
                <span className="text-[#2563EB] font-bold">
                  {summary?.resources?.busy ?? 0} / {summary?.resources?.total ?? 1}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#2563EB] h-full" 
                  style={{ width: `${Math.min(Math.round(((summary?.resources?.busy ?? 0) / (summary?.resources?.total || 1)) * 100), 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#64748B]">In Maintenance</span>
                <span className="text-[#DC2626] font-bold">
                  {summary?.resources?.maintenance ?? 0} / {summary?.resources?.total ?? 1}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#DC2626] h-full" 
                  style={{ width: `${Math.min(Math.round(((summary?.resources?.maintenance ?? 0) / (summary?.resources?.total || 1)) * 100), 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100">
            <Link 
              to="/dashboard/resources"
              className="text-xs text-[#2563EB] font-bold hover:underline inline-flex items-center gap-0.5"
            >
              <span>Manage all units in Resource Center</span>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </Link>
          </div>
        </motion.div>

        {/* Right: Recent Command Alerts */}
        <motion.div 
          className="bg-white border border-[#DDE3EA] rounded-[16px] p-5 shadow-sm flex flex-col justify-between"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#DDE3EA]">
              <h3 className="font-semibold text-[#07111F] text-sm uppercase tracking-wide flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#2563EB] text-lg">notifications</span>
                Recent Command Alerts
              </h3>
              <Link to="/dashboard/alerts" className="text-[#2563EB] hover:underline text-xs font-bold">
                Alerts Center
              </Link>
            </div>

            <div className="space-y-2">
              {recentAlerts.length === 0 ? (
                <div className="py-12 text-center text-[#64748B] text-xs italic">
                  No alerts in system logs.
                </div>
              ) : (
                recentAlerts.slice(0, 3).map((alert) => {
                  const isRead = checkIsRead(alert);
                  const pBorder = alert.priority === 'critical' ? 'border-l-[#DC2626] bg-red-50/20' :
                                  alert.priority === 'high' || alert.priority === 'medium' ? 'border-l-[#F59E0B] bg-amber-50/20' :
                                  'border-l-[#2563EB] bg-blue-50/20';

                  return (
                    <div 
                      key={alert._id}
                      className={`p-2 border border-slate-100 border-l-4 rounded-r-lg flex items-start justify-between text-left text-xs gap-3 ${pBorder} ${isRead ? 'opacity-70 font-normal' : 'font-semibold'}`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {!isRead && (
                            <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB] inline-block shrink-0"></span>
                          )}
                          <span className="text-[10px] font-bold text-[#0F172A] uppercase tracking-wide">
                            {alert.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#64748B] line-clamp-1 leading-normal">
                          {alert.message}
                        </p>
                      </div>

                      <span className="font-mono text-[9px] text-[#64748B] shrink-0">
                        {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Operational Trends Analytics Section */}
      <motion.div 
        className="bg-white border border-[#DDE3EA] rounded-[16px] p-5 shadow-sm space-y-6"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        <h2 className="text-sm font-bold text-[#07111F] uppercase tracking-wider border-b border-[#DDE3EA] pb-3 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#2563EB] text-lg">timeline</span>
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
