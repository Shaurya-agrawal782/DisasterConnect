import React from 'react';
import { Link } from 'react-router-dom';

export default function RecentIncidents({ incidents = [] }) {
  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'low':
        return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold rounded">Low</span>;
      case 'medium':
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] uppercase font-bold rounded">Medium</span>;
      case 'high':
        return <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-[10px] uppercase font-bold rounded">High</span>;
      case 'critical':
        return <span className="px-2 py-0.5 bg-error-container text-on-error-container text-[10px] uppercase font-bold rounded animate-pulse">Critical</span>;
      default:
        return <span className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant text-[10px] uppercase font-bold rounded">{sev}</span>;
    }
  };

  const getStatusBadge = (stat) => {
    switch (stat) {
      case 'reported':
        return <span className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant text-[10px] uppercase font-bold rounded">Reported</span>;
      case 'verified':
        return <span className="px-2 py-0.5 bg-primary-container/20 text-primary text-[10px] uppercase font-bold rounded">Verified</span>;
      case 'assigned':
        return <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-[10px] uppercase font-bold rounded">Assigned</span>;
      case 'in-progress':
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] uppercase font-bold rounded">Active</span>;
      case 'resolved':
        return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold rounded">Resolved</span>;
      case 'closed':
        return <span className="px-2 py-0.5 bg-surface-dim text-on-surface-variant text-[10px] uppercase font-bold rounded">Closed</span>;
      default:
        return <span className="px-2 py-0.5 bg-surface-container-high text-on-surface text-[10px] uppercase font-bold rounded">{stat}</span>;
    }
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded shadow-sm overflow-hidden flex flex-col h-full text-left">
      <div className="px-4 py-3 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">emergency</span>
          Recent Incident Activity
        </h3>
        <Link to="/dashboard/incidents" className="text-primary font-label-md text-label-md hover:underline">
          View All
        </Link>
      </div>

      <div className="overflow-x-auto flex-grow">
        {incidents.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-on-surface-variant text-sm font-medium">
            No recent incidents reported.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container font-label-sm text-label-sm text-on-surface-variant border-b border-outline-variant">
                <th className="px-4 py-2 font-semibold">Title</th>
                <th className="px-4 py-2 font-semibold">Type</th>
                <th className="px-4 py-2 font-semibold">Severity</th>
                <th className="px-4 py-2 font-semibold">Status</th>
                <th className="px-4 py-2 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm text-on-surface">
              {incidents.map((incident) => (
                <tr key={incident._id} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors h-10">
                  <td className="px-4 py-2 font-semibold truncate max-w-[150px]">{incident.title}</td>
                  <td className="px-4 py-2 uppercase font-mono text-[11px] text-on-surface-variant">{incident.type}</td>
                  <td className="px-4 py-2">{getSeverityBadge(incident.severity)}</td>
                  <td className="px-4 py-2">{getStatusBadge(incident.status)}</td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      to={`/dashboard/incidents/${incident._id}`}
                      className="text-primary hover:underline font-semibold text-xs inline-flex items-center gap-0.5"
                    >
                      View <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
