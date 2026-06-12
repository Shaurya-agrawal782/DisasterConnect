import React, { useState, useEffect } from 'react';
import { getMyAlerts, markAlertRead, markAllAlertsRead } from '../../api/alertApi';
import useSocket from '../../hooks/useSocket';
import useAuth from '../../hooks/useAuth';

export default function Alerts() {
  const { user } = useAuth();
  const { liveAlerts, clearLiveAlerts } = useSocket();

  const [dbAlerts, setDbAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadOnly, setUnreadOnly] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAlertsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyAlerts({
        page,
        limit: 10,
        unreadOnly
      });
      if (res.success) {
        setDbAlerts(res.data.alerts);
        setTotalPages(res.data.pagination.totalPages);
      } else {
        setError(res.message || 'Failed to retrieve alerts.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while loading alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertsData();
  }, [page, unreadOnly]);

  const handleMarkSingleRead = async (id) => {
    try {
      const res = await markAlertRead(id);
      if (res.success) {
        // Update both live state and db state
        setDbAlerts(prev => prev.map(a => a._id === id ? res.data.alert : a));
      }
    } catch (err) {
      console.error('Failed to mark alert read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await markAllAlertsRead();
      if (res.success) {
        clearLiveAlerts();
        fetchAlertsData();
      }
    } catch (err) {
      console.error('Failed to mark all alerts read:', err);
    }
  };

  // Helper styles for priority badges
  const getPriorityBadge = (prio) => {
    switch (prio) {
      case 'low':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800 border border-emerald-200 capitalize">Low</span>;
      case 'medium':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-secondary-fixed text-on-secondary-fixed border border-outline-variant capitalize">Medium</span>;
      case 'high':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-tertiary-fixed text-on-tertiary-fixed border border-outline-variant capitalize">High</span>;
      case 'critical':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-error-container text-on-error-container border border-error/20 capitalize animate-pulse">Critical</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-surface-container-high text-on-surface-variant border border-outline-variant capitalize">{prio}</span>;
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      incident_created: 'New Incident',
      incident_assigned: 'Dispatch Assignment',
      status_updated: 'Incident Status Shift',
      resource_updated: 'Resource Modified',
      system: 'System Alert'
    };
    return labels[type] || type.replace('_', ' ');
  };

  const isRead = (alert) => {
    if (!user) return true;
    return alert.readBy && alert.readBy.some(entry => entry.user === user._id || entry.user?._id === user._id);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">notifications_active</span>
          </div>
          <div>
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-background tracking-tight">Notification Center</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">View safety dispatches and coordinate task logs in real-time</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            disabled={dbAlerts.length === 0 && liveAlerts.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 font-label-md text-label-md font-bold text-on-primary bg-primary hover:bg-primary/95 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-sm transition"
          >
            <span className="material-symbols-outlined text-[18px]">check_box</span>
            <span>Mark All Read</span>
          </button>
          
          <button
            onClick={fetchAlertsData}
            disabled={loading}
            className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container transition flex items-center justify-center border border-outline-variant bg-surface"
          >
            <span className={`material-symbols-outlined ${loading ? 'animate-spin' : ''}`}>refresh</span>
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs text-on-surface-variant/70 font-bold uppercase tracking-wider mr-2">Filters:</span>
        <button
          onClick={() => { setUnreadOnly(false); setPage(1); }}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${!unreadOnly ? 'bg-primary-container text-on-primary-container border border-primary/20' : 'bg-surface text-on-surface-variant border border-outline-variant hover:bg-surface-container'}`}
        >
          All Notifications
        </button>
        <button
          onClick={() => { setUnreadOnly(true); setPage(1); }}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${unreadOnly ? 'bg-primary-container text-on-primary-container border border-primary/20' : 'bg-surface text-on-surface-variant border border-outline-variant hover:bg-surface-container'}`}
        >
          Unread Only
        </button>
      </div>

      {/* Live Alerts overlay section */}
      {liveAlerts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-primary animate-ping"></span>
              <span>Incoming Live Notifications ({liveAlerts.length})</span>
            </h2>
            <button
              onClick={clearLiveAlerts}
              className="text-[10px] font-semibold text-on-surface-variant hover:text-on-surface"
            >
              Clear Live Overlay
            </button>
          </div>

          <div className="space-y-2">
            {liveAlerts.map((alert) => (
              <div
                key={`live-${alert._id}`}
                className="bg-surface rounded-xl border border-primary/30 p-4 md:p-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4 shadow-sm relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                <div className="space-y-1.5 pl-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {getPriorityBadge(alert.priority)}
                    <span className="text-xs font-bold text-primary">{getTypeLabel(alert.type)}</span>
                    <span className="text-[10px] text-on-surface-variant/60 font-semibold">Just Now</span>
                  </div>
                  <h3 className="text-sm font-bold text-on-surface leading-snug">{alert.title}</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{alert.message}</p>
                </div>
                <div className="shrink-0 flex md:flex-col items-end gap-2 pl-2">
                  <button
                    onClick={() => handleMarkSingleRead(alert._id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-surface-container border border-outline-variant rounded-lg transition"
                  >
                    <span className="material-symbols-outlined text-[16px]">drafts</span>
                    <span>Mark Read</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical DB Alerts list */}
      {loading && dbAlerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 min-h-[200px]">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
          <span className="font-body-sm text-body-sm text-on-surface-variant">Retrieving alert logs...</span>
        </div>
      ) : error ? (
        <div className="bg-error-container border border-error rounded-xl p-6 text-center">
          <p className="font-label-lg text-label-lg text-on-error-container font-semibold">{error}</p>
        </div>
      ) : dbAlerts.length === 0 ? (
        <div className="p-8 bg-surface border border-outline-variant rounded-xl flex flex-col justify-center items-center text-center min-h-[250px] shadow-sm">
          <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant mb-3">
            <span className="material-symbols-outlined text-[24px]">inbox</span>
          </div>
          <h2 className="text-base font-semibold text-on-surface mb-1">Logs Clear</h2>
          <p className="text-xs text-on-surface-variant/70 max-w-sm">
            {unreadOnly ? "You do not have any unread notifications." : "Your emergency notification inbox is empty."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-surface border border-outline-variant rounded-xl divide-y divide-outline-variant/60 overflow-hidden shadow-sm">
            {dbAlerts.map((alert) => {
              const read = isRead(alert);
              // Determine card colors based on read state
              return (
                <div
                  key={alert._id}
                  className={`p-4 md:p-5 flex flex-col md:flex-row md:items-start md:justify-between gap-4 transition-colors relative overflow-hidden ${read ? 'bg-surface-container-lowest' : 'bg-primary/5 border-l-4 border-primary'}`}
                >
                  <div className="space-y-1.5 pl-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getPriorityBadge(alert.priority)}
                      <span className="text-xs font-semibold text-on-surface-variant">{getTypeLabel(alert.type)}</span>
                      <span className="text-[10px] text-on-surface-variant/60 font-semibold">
                        {new Date(alert.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-on-surface leading-snug">{alert.title}</h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{alert.message}</p>
                  </div>
                  
                  <div className="shrink-0 flex items-center gap-2 pl-1">
                    {!read && (
                      <button
                        onClick={() => handleMarkSingleRead(alert._id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-surface-container border border-outline-variant rounded-lg transition"
                      >
                        <span className="material-symbols-outlined text-[16px]">drafts</span>
                        <span>Mark Read</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-on-surface-variant">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  className="px-3 py-1.5 text-xs font-semibold text-on-surface bg-surface border border-outline-variant disabled:opacity-40 disabled:cursor-not-allowed rounded-lg hover:bg-surface-container transition"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  className="px-3 py-1.5 text-xs font-semibold text-on-surface bg-surface border border-outline-variant disabled:opacity-40 disabled:cursor-not-allowed rounded-lg hover:bg-surface-container transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

