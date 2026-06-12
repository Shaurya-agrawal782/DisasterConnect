import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { Map as MapIcon, AlertOctagon, Wrench, RefreshCw, Layers } from 'lucide-react';
import { getIncidents } from '../../api/incidentApi';
import { getResources } from '../../api/resourceApi';
import MapFilters from '../../components/map/MapFilters';
import MapLegend from '../../components/map/MapLegend';
import MapMarker from '../../components/map/MapMarker';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

export default function MapView() {
  const [incidents, setIncidents] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [filters, setFilters] = useState({
    showIncidents: true,
    showResources: true,
    incidentStatus: '',
    incidentSeverity: '',
    incidentType: '',
    resourceStatus: '',
    resourceType: ''
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch up to 100 incidents and resources to display on the local map
      const [incidentRes, resourceRes] = await Promise.all([
        getIncidents({ limit: 100, sort: '-createdAt' }),
        getResources({ limit: 100, sort: '-createdAt' })
      ]);

      if (incidentRes.success) {
        setIncidents(incidentRes.data.incidents);
      } else {
        setError(incidentRes.message || 'Failed to fetch incidents data');
      }

      if (resourceRes.success) {
        setResources(resourceRes.data.resources);
      } else {
        setError(resourceRes.message || 'Failed to fetch resources data');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while loading map records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResetFilters = () => {
    setFilters({
      showIncidents: true,
      showResources: true,
      incidentStatus: '',
      incidentSeverity: '',
      incidentType: '',
      resourceStatus: '',
      resourceType: ''
    });
  };

  // Client-side filtering logic
  const filteredIncidents = incidents.filter(inc => {
    if (!filters.showIncidents) return false;
    if (filters.incidentStatus && inc.status !== filters.incidentStatus) return false;
    if (filters.incidentSeverity && inc.severity !== filters.incidentSeverity) return false;
    if (filters.incidentType && inc.type !== filters.incidentType) return false;
    return true;
  });

  const filteredResources = resources.filter(res => {
    if (!filters.showResources) return false;
    if (filters.resourceStatus && res.status !== filters.resourceStatus) return false;
    if (filters.resourceType && res.type !== filters.resourceType) return false;
    return true;
  });

  // Calculation statistics for panels
  const totalIncidentsCount = filteredIncidents.length;
  const totalResourcesCount = filteredResources.length;
  
  const criticalIncidentsCount = filteredIncidents.filter(i => i.severity === 'critical').length;
  const availableResourcesCount = filteredResources.filter(r => r.status === 'available').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Interactive Map</h1>
            <p className="text-sm text-slate-400">Geospatial overview of active incidents and emergency response dispatches</p>
          </div>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-850 border border-slate-800 disabled:opacity-40 rounded-lg shadow-lg transition"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Map</span>
        </button>
      </div>

      {/* Statistics Panels (Top widgets) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total incidents widget */}
        <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">Incidents Shown</span>
            <span className="text-2xl font-extrabold text-white">{totalIncidentsCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400">
            <AlertOctagon className="h-5 w-5" />
          </div>
        </div>

        {/* Critical incidents widget */}
        <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">Critical Severity</span>
            <span className="text-2xl font-extrabold text-rose-500">{criticalIncidentsCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-red-500/10 text-red-500 animate-pulse">
            <AlertOctagon className="h-5 w-5" />
          </div>
        </div>

        {/* Total resources widget */}
        <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">Resources Shown</span>
            <span className="text-2xl font-extrabold text-white">{totalResourcesCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Wrench className="h-5 w-5" />
          </div>
        </div>

        {/* Available resources widget */}
        <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">Available Assets</span>
            <span className="text-2xl font-extrabold text-emerald-400">{availableResourcesCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Wrench className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* Map Control Filters */}
      <MapFilters
        filters={filters}
        setFilters={setFilters}
        onReset={handleResetFilters}
        onRefresh={fetchData}
      />

      {/* Primary Map Window */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* React Leaflet Map container (occupies 3/4 width on desktop) */}
        <div className="lg:col-span-3 h-[60vh] md:h-[65vh] relative rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl z-0">
          
          {loading ? (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <span className="text-sm text-slate-400 font-medium">Rendering Leaflet map grid...</span>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-50 bg-slate-950">
              <AlertOctagon className="h-10 w-10 text-red-500 mb-3" />
              <p className="text-sm text-red-400 font-semibold">{error}</p>
              <button
                onClick={fetchData}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-650 hover:bg-indigo-550 rounded-lg transition"
              >
                Reload Map Data
              </button>
            </div>
          ) : (
            <MapContainer
              center={[23.2599, 77.4126]} // Bhopal defaults
              zoom={12}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Render Incidents */}
              {filteredIncidents.map(incident => (
                <MapMarker key={incident._id} type="incident" data={incident} />
              ))}

              {/* Render Resources */}
              {filteredResources.map(resource => (
                <MapMarker key={resource._id} type="resource" data={resource} />
              ))}
            </MapContainer>
          )}

        </div>

        {/* Legend & Info panel (occupies 1/4 width on desktop) */}
        <div className="space-y-4">
          
          {/* Map Legend */}
          <MapLegend />

          {/* Phase 2 heatmaps warning */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
            <h4 className="font-bold text-slate-300 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-indigo-400" />
              <span>Map Layer Info</span>
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Markers show real-time coordinates of active response dispatches and incident reports.
            </p>
            <div className="pt-2 border-t border-slate-900/60 text-[10px] text-slate-500 italic">
              Note: Heatmap layer will be added in a later phase.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
