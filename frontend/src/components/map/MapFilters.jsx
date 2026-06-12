import React from 'react';

export default function MapFilters({ filters, setFilters, onReset, onRefresh }) {
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-surface border border-outline-variant rounded-xl p-4 md:p-6 space-y-4 shadow-sm text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/60">
        <div className="flex items-center space-x-2 text-sm font-semibold text-on-surface">
          <span className="material-symbols-outlined text-[18px] text-primary">filter_list</span>
          <span>Map Controls</span>
        </div>
        <div className="flex items-center gap-3">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-on-surface hover:bg-surface-container bg-surface border border-outline-variant rounded transition"
            >
              <span className="material-symbols-outlined text-[14px]">refresh</span>
              <span>Refresh</span>
            </button>
          )}
          <button
            onClick={onReset}
            className="text-xs text-primary font-bold hover:underline transition"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Layer Toggles (Show/Hide entire sets) */}
      <div className="flex flex-wrap gap-4 text-sm font-medium">
        <label className="flex items-center space-x-2.5 cursor-pointer text-on-surface-variant hover:text-on-surface transition">
          <input
            type="checkbox"
            checked={filters.showIncidents}
            onChange={(e) => updateFilter('showIncidents', e.target.checked)}
            className="rounded border-outline-variant bg-surface text-primary focus:ring-primary focus:ring-offset-surface"
          />
          <span className="flex items-center space-x-1">
            {filters.showIncidents ? (
              <span className="material-symbols-outlined text-[16px] text-primary">visibility</span>
            ) : (
              <span className="material-symbols-outlined text-[16px] text-outline">visibility_off</span>
            )}
            <span>Show Incidents</span>
          </span>
        </label>

        <label className="flex items-center space-x-2.5 cursor-pointer text-on-surface-variant hover:text-on-surface transition">
          <input
            type="checkbox"
            checked={filters.showResources}
            onChange={(e) => updateFilter('showResources', e.target.checked)}
            className="rounded border-outline-variant bg-surface text-primary focus:ring-primary focus:ring-offset-surface"
          />
          <span className="flex items-center space-x-1">
            {filters.showResources ? (
              <span className="material-symbols-outlined text-[16px] text-primary">visibility</span>
            ) : (
              <span className="material-symbols-outlined text-[16px] text-outline">visibility_off</span>
            )}
            <span>Show Resources</span>
          </span>
        </label>
      </div>

      {/* Sub-Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
        
        {/* Incident Severity */}
        {filters.showIncidents && (
          <>
            <div>
              <label className="block text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">Incident Severity</label>
              <select
                value={filters.incidentSeverity}
                onChange={(e) => updateFilter('incidentSeverity', e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/15 transition-all"
              >
                <option value="">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* Incident Type */}
            <div>
              <label className="block text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">Incident Type</label>
              <select
                value={filters.incidentType}
                onChange={(e) => updateFilter('incidentType', e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/15 transition-all"
              >
                <option value="">All Incident Types</option>
                <option value="fire">Fire</option>
                <option value="flood">Flood</option>
                <option value="medical">Medical</option>
                <option value="accident">Accident</option>
                <option value="crowd">Crowd</option>
                <option value="rescue">Rescue</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Incident Status */}
            <div>
              <label className="block text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">Incident Status</label>
              <select
                value={filters.incidentStatus}
                onChange={(e) => updateFilter('incidentStatus', e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/15 transition-all"
              >
                <option value="">All Incident Statuses</option>
                <option value="reported">Reported</option>
                <option value="verified">Verified</option>
                <option value="assigned">Assigned</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </>
        )}

        {/* Resource Status */}
        {filters.showResources && (
          <>
            <div>
              <label className="block text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">Resource Status</label>
              <select
                value={filters.resourceStatus}
                onChange={(e) => updateFilter('resourceStatus', e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/15 transition-all"
              >
                <option value="">All Resource Statuses</option>
                <option value="available">Available</option>
                <option value="assigned">Assigned</option>
                <option value="busy">Busy</option>
                <option value="maintenance">Maintenance</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            {/* Resource Type */}
            <div>
              <label className="block text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">Resource Type</label>
              <select
                value={filters.resourceType}
                onChange={(e) => updateFilter('resourceType', e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/15 transition-all"
              >
                <option value="">All Resource Types</option>
                <option value="ambulance">Ambulance</option>
                <option value="fire_truck">Fire Truck</option>
                <option value="rescue_team">Rescue Team</option>
                <option value="medical">Medical Staff</option>
                <option value="shelter">Shelter</option>
                <option value="supply">Supply Relief</option>
                <option value="volunteer_group">Volunteer Group</option>
                <option value="other">Other</option>
              </select>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
