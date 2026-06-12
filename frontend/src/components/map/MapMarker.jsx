import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { geoJsonToLeafletPosition } from '../../utils/geo';

// Incident Marker: severity indicator
const getIncidentIcon = (severity) => {
  let colorClass = 'bg-emerald-500';
  let pulseClass = '';
  if (severity === 'medium') colorClass = 'bg-amber-500';
  else if (severity === 'high') colorClass = 'bg-orange-500';
  else if (severity === 'critical') {
    colorClass = 'bg-red-500';
    pulseClass = 'animate-ping';
  }

  return L.divIcon({
    className: 'custom-leaflet-icon-incident',
    html: `
      <div class="relative flex items-center justify-center w-6 h-6">
        <span class="absolute inline-flex h-full w-full rounded-full ${colorClass} opacity-75 ${pulseClass}"></span>
        <span class="relative inline-flex rounded-full h-3.5 w-3.5 ${colorClass} border-2 border-white shadow-lg"></span>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

// Resource Marker: status indicator
const getResourceIcon = (status) => {
  let colorClass = 'bg-emerald-500';
  let textColorClass = 'text-white';
  if (status === 'assigned') {
    colorClass = 'bg-violet-500';
  } else if (status === 'busy') {
    colorClass = 'bg-amber-500';
  } else if (status === 'maintenance') {
    colorClass = 'bg-orange-500';
  } else if (status === 'offline') {
    colorClass = 'bg-slate-500';
  }

  return L.divIcon({
    className: 'custom-leaflet-icon-resource',
    html: `
      <div class="relative flex items-center justify-center w-6 h-6">
        <div class="w-5 h-5 rounded ${colorClass} ${textColorClass} flex items-center justify-center border-2 border-white shadow-md">
          <span class="text-[8px] font-black">R</span>
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

export default function MapMarker({ type, data }) {
  // Determine location object depending on type
  const location = type === 'incident' ? data.location : data.currentLocation;
  const position = geoJsonToLeafletPosition(location);

  if (!position) return null;

  const icon = type === 'incident' ? getIncidentIcon(data.severity) : getResourceIcon(data.status);

  // Status/Severity Badge Colors
  const getSeverityColor = (sev) => {
    switch (sev) {
      case 'low': return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-700 border-amber-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-700 border-orange-500/20';
      case 'critical': return 'bg-red-500/10 text-red-700 border-red-500/20';
      default: return 'bg-surface-container text-on-surface-variant border-outline-variant/60';
    }
  };

  const getStatusColor = (stat) => {
    switch (stat) {
      case 'reported': return 'bg-sky-500/10 text-sky-700 border-sky-500/20';
      case 'verified': return 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20';
      case 'assigned': return 'bg-violet-500/10 text-violet-700 border-violet-500/20';
      case 'in-progress': return 'bg-amber-500/10 text-amber-700 border-amber-500/20';
      case 'resolved': return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
      case 'closed': return 'bg-slate-500/10 text-slate-700 border-slate-500/20';
      case 'available': return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
      case 'busy': return 'bg-amber-500/10 text-amber-700 border-amber-500/20';
      case 'maintenance': return 'bg-orange-500/10 text-orange-700 border-orange-500/20';
      case 'offline': return 'bg-slate-500/10 text-slate-700 border-slate-500/20';
      default: return 'bg-slate-500/10 text-slate-700 border-slate-500/20';
    }
  };

  return (
    <Marker position={position} icon={icon}>
      <Popup className="custom-leaflet-popup">
        <div className="p-3 text-on-surface bg-surface border border-outline-variant rounded-xl max-w-[240px] space-y-2.5 text-left">
          {type === 'incident' ? (
            <>
              {/* Incident Popup Details */}
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-rose-600 font-bold block">Incident Report</span>
                <h4 className="font-bold text-on-surface text-sm leading-normal m-0 p-0">{data.title}</h4>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[10px] leading-normal pt-1">
                <div>
                  <span className="text-on-surface-variant/70 block">Type:</span>
                  <span className="font-semibold text-on-surface capitalize">{data.type}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant/70 block">Severity:</span>
                  <span className={`px-1.5 py-0.5 rounded font-bold border capitalize ${getSeverityColor(data.severity)}`}>
                    {data.severity}
                  </span>
                </div>
                <div className="col-span-2 pt-0.5">
                  <span className="text-on-surface-variant/70 block">Status:</span>
                  <span className={`px-1.5 py-0.5 rounded font-bold border capitalize inline-block ${getStatusColor(data.status)}`}>
                    {data.status.replace('-', ' ')}
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-on-surface-variant pt-1 border-t border-outline-variant/60 leading-relaxed">
                <span className="font-semibold block text-on-surface-variant/70 text-[9px] uppercase">Address</span>
                {data.location?.address}
              </div>

              <div className="pt-2 border-t border-outline-variant/60 flex items-center justify-end">
                <Link
                  to={`/dashboard/incidents/${data._id}`}
                  className="text-[10px] font-bold text-primary hover:underline"
                >
                  View Incident Log &rarr;
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Resource Popup Details */}
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-primary font-bold block">Emergency Resource</span>
                <h4 className="font-bold text-on-surface text-sm leading-normal m-0 p-0">{data.name}</h4>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[10px] leading-normal pt-1">
                <div>
                  <span className="text-on-surface-variant/70 block">Type:</span>
                  <span className="font-semibold text-on-surface capitalize">{data.type.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant/70 block">Status:</span>
                  <span className={`px-1.5 py-0.5 rounded font-bold border capitalize inline-block ${getStatusColor(data.status)}`}>
                    {data.status}
                  </span>
                </div>
                <div>
                  <span className="text-on-surface-variant/70 block">Capacity:</span>
                  <span className="font-semibold text-on-surface">{data.capacity}</span>
                </div>
              </div>

              <div className="text-[10px] text-on-surface-variant pt-1 border-t border-outline-variant/60 leading-relaxed">
                <span className="font-semibold block text-on-surface-variant/70 text-[9px] uppercase">Station Address</span>
                {data.currentLocation?.address}
              </div>

              <div className="pt-2 border-t border-outline-variant/60 flex items-center justify-end">
                <Link
                  to={`/dashboard/resources/${data._id}`}
                  className="text-[10px] font-bold text-primary hover:underline"
                >
                  View Resource Sheet &rarr;
                </Link>
              </div>
            </>
          )}
        </div>
      </Popup>
    </Marker>
  );
}
