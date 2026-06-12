import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getIncidents } from '../../api/incidentApi';
import useAuth from '../../hooks/useAuth';

export default function Incidents() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [severity, setSeverity] = useState('');
  const [type, setType] = useState('');
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchIncidentsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 10,
        sort: '-createdAt'
      };
      if (search.trim()) params.search = search;
      if (status) params.status = status;
      if (severity) params.severity = severity;
      if (type) params.type = type;

      const res = await getIncidents(params);
      if (res.success) {
        setIncidents(res.data.incidents);
        setTotalPages(res.data.pagination.totalPages);
      } else {
        setError(res.message || 'Failed to retrieve incidents');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'An error occurred while fetching incidents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidentsData();
  }, [page, status, severity, type]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchIncidentsData();
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setSeverity('');
    setType('');
    setPage(1);
  };

  // Helper styles for severity badges
  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'low':
        return <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-sm bg-primary-container/10 text-primary font-label-sm text-label-sm uppercase font-bold">Low</span>;
      case 'medium':
        return <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-sm bg-secondary-container text-on-secondary-container font-label-sm text-label-sm uppercase font-bold">Medium</span>;
      case 'high':
        return <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-sm bg-amber-100 text-amber-800 font-label-sm text-label-sm uppercase font-bold">High</span>;
      case 'critical':
        return <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-sm bg-error-container text-on-error-container font-label-sm text-label-sm uppercase font-bold animate-pulse">Critical</span>;
      default:
        return <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-sm bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm uppercase font-bold">{sev}</span>;
    }
  };

  // Helper styles for status dots
  const getStatusDot = (stat) => {
    switch (stat) {
      case 'reported':
        return 'bg-sky-500';
      case 'verified':
        return 'bg-indigo-500';
      case 'assigned':
        return 'bg-violet-500';
      case 'in-progress':
        return 'bg-amber-500';
      case 'resolved':
        return 'bg-emerald-500';
      case 'closed':
        return 'bg-slate-500';
      default:
        return 'bg-slate-400';
    }
  };

  const getTypeIcon = (t) => {
    switch (t) {
      case 'fire':
        return <span className="material-symbols-outlined text-error text-[18px]">local_fire_department</span>;
      case 'flood':
        return <span className="material-symbols-outlined text-primary text-[18px]">water_damage</span>;
      case 'medical':
        return <span className="material-symbols-outlined text-error text-[18px]">medical_services</span>;
      case 'accident':
        return <span className="material-symbols-outlined text-amber-500 text-[18px]">car_crash</span>;
      case 'crowd':
        return <span className="material-symbols-outlined text-indigo-500 text-[18px]">groups</span>;
      case 'rescue':
        return <span className="material-symbols-outlined text-emerald-600 text-[18px]">health_and_safety</span>;
      default:
        return <span className="material-symbols-outlined text-on-surface-variant text-[18px]">emergency</span>;
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-semibold">Active Incidents</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Manage and track all operational events across sectors.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/incidents/new"
            className="bg-primary text-on-primary font-label-md text-label-md px-4 py-2 rounded flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Report Incident</span>
          </Link>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-grow max-w-md min-w-[240px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input 
            className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all placeholder:text-outline" 
            placeholder="Search by Keyword..." 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="font-label-sm text-label-sm text-on-surface-variant">Priority:</label>
            <select 
              value={severity}
              onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
              className="bg-surface border border-outline-variant text-on-surface font-body-sm text-body-sm rounded py-1.5 pl-3 pr-8 focus:outline-none focus:border-primary appearance-none cursor-pointer"
            >
              <option value="">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="font-label-sm text-label-sm text-on-surface-variant">Status:</label>
            <select 
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="bg-surface border border-outline-variant text-on-surface font-body-sm text-body-sm rounded py-1.5 pl-3 pr-8 focus:outline-none focus:border-primary appearance-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="reported">Reported</option>
              <option value="verified">Verified</option>
              <option value="assigned">Assigned</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="font-label-sm text-label-sm text-on-surface-variant">Category:</label>
            <select 
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1); }}
              className="bg-surface border border-outline-variant text-on-surface font-body-sm text-body-sm rounded py-1.5 pl-3 pr-8 focus:outline-none focus:border-primary appearance-none cursor-pointer"
            >
              <option value="">All Categories</option>
              <option value="fire">Fire</option>
              <option value="flood">Flood</option>
              <option value="medical">Medical</option>
              <option value="accident">Accident</option>
              <option value="crowd">Crowd</option>
              <option value="rescue">Rescue</option>
              <option value="other">Other</option>
            </select>
          </div>

          {(search || type || severity || status) && (
            <button 
              onClick={handleResetFilters}
              className="text-primary hover:bg-primary-container/20 p-1.5 rounded transition-colors" 
              title="Clear Filters"
            >
              <span className="material-symbols-outlined text-[20px]">filter_alt_off</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 min-h-[300px] bg-surface-container-lowest border border-outline-variant rounded-lg">
          <span className="material-symbols-outlined text-[36px] text-primary animate-spin">sync</span>
          <span className="text-sm text-on-surface-variant mt-2">Loading incidents...</span>
        </div>
      ) : error ? (
        <div className="bg-error-container/20 border border-error/20 rounded-xl p-6 text-center">
          <p className="text-sm text-error font-semibold">{error}</p>
          <button
            onClick={fetchIncidentsData}
            className="mt-3 text-xs text-primary hover:underline inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">sync</span> Try Again
          </button>
        </div>
      ) : incidents.length === 0 ? (
        <div className="p-8 bg-surface-container-lowest border border-outline-variant rounded-lg flex flex-col justify-center items-center text-center min-h-[300px]">
          <div className="w-14 h-14 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant/40 mb-4">
            <span className="material-symbols-outlined text-[28px]">warning</span>
          </div>
          <h2 className="text-lg font-semibold text-on-surface mb-1">No Incidents Found</h2>
          <p className="text-sm text-on-surface-variant max-w-sm">
            {search || type || severity || status
              ? "No reports match your current filters. Try relaxing filters or search terms."
              : "No emergency incidents have been reported yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Operational Data Table */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Title</th>
                    <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant whitespace-nowrap w-24">PRIORITY</th>
                    <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant whitespace-nowrap w-36">CATEGORY</th>
                    <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">LOCATION</th>
                    <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant whitespace-nowrap w-32">STATUS</th>
                    <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant whitespace-nowrap w-40">TIME REPORTED</th>
                    <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant whitespace-nowrap text-right w-24">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-outline-variant/50">
                  {incidents.map((incident, idx) => (
                    <tr 
                      key={incident._id} 
                      className={`hover:bg-surface-container-high transition-colors group h-14 ${idx % 2 === 0 ? 'bg-surface' : 'bg-surface-container-lowest'}`}
                    >
                      <td className="px-4 py-2 font-semibold">
                        <div className="font-semibold text-on-surface truncate text-sm max-w-xs">{incident.title}</div>
                        <div className="text-xs text-on-surface-variant truncate max-w-xs mt-0.5 font-normal">{incident.description}</div>
                      </td>
                      <td className="px-4 py-2">
                        {getSeverityBadge(incident.severity)}
                      </td>
                      <td className="px-4 py-2">
                        <span className="flex items-center gap-2">
                          {getTypeIcon(incident.type)}
                          <span className="capitalize">{incident.type}</span>
                        </span>
                      </td>
                      <td className="px-4 py-2 text-on-surface-variant truncate max-w-[150px]">{incident.location?.address || 'N/A'}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1.5 capitalize">
                          <div className={`w-2 h-2 rounded-full ${getStatusDot(incident.status)}`}></div>
                          {incident.status === 'in-progress' ? 'Active' : incident.status}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-on-surface-variant">
                        {new Date(incident.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Link 
                          to={`/dashboard/incidents/${incident._id}`}
                          className="text-on-surface-variant hover:text-primary transition-colors p-1"
                        >
                          <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-outline-variant bg-surface-container-low flex items-center justify-between">
                <span className="font-body-sm text-body-sm text-on-surface-variant">Page {page} of {totalPages}</span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    disabled={page <= 1}
                    className="p-1 rounded text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                  </button>
                  <span className="w-8 h-8 rounded bg-primary text-on-primary font-label-sm text-label-sm flex items-center justify-center">{page}</span>
                  <button 
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    disabled={page >= totalPages}
                    className="p-1 rounded text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
