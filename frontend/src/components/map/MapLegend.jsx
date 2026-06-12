import React from 'react';

export default function MapLegend() {
  return (
    <div className="bg-surface border border-outline-variant rounded-xl p-4 space-y-4 shadow-sm text-xs text-left">
      
      {/* Incidents Severity section */}
      <div className="space-y-2">
        <h3 className="font-bold text-on-surface-variant uppercase tracking-wider text-[10px]">Incident Severity</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white inline-block shadow-sm"></span>
            <span className="text-on-surface-variant font-medium">Low</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 border border-white inline-block shadow-sm"></span>
            <span className="text-on-surface-variant font-medium">Medium</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-orange-500 border border-white inline-block shadow-sm"></span>
            <span className="text-on-surface-variant font-medium">High</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-red-500 border border-white inline-block shadow-sm animate-pulse"></span>
            <span className="text-on-surface-variant font-medium">Critical</span>
          </div>
        </div>
      </div>

      {/* Resources Status section */}
      <div className="space-y-2 pt-3 border-t border-outline-variant/60">
        <h3 className="font-bold text-on-surface-variant uppercase tracking-wider text-[10px]">Resource Status</h3>
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-emerald-500 flex items-center justify-center border border-white shadow-sm">
              <span className="text-[8px] font-bold text-white">R</span>
            </div>
            <span className="text-on-surface-variant font-medium">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-violet-500 flex items-center justify-center border border-white shadow-sm">
              <span className="text-[8px] font-bold text-white">R</span>
            </div>
            <span className="text-on-surface-variant font-medium">Assigned</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-amber-500 flex items-center justify-center border border-white shadow-sm">
              <span className="text-[8px] font-bold text-white">R</span>
            </div>
            <span className="text-on-surface-variant font-medium">Busy</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-orange-500 flex items-center justify-center border border-white shadow-sm">
              <span className="text-[8px] font-bold text-white">R</span>
            </div>
            <span className="text-on-surface-variant font-medium">Maintenance</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-slate-500 flex items-center justify-center border border-white shadow-sm">
              <span className="text-[8px] font-bold text-white">R</span>
            </div>
            <span className="text-on-surface-variant font-medium">Offline</span>
          </div>
        </div>
      </div>

    </div>
  );
}
