import React from 'react';

export default function MapLegend() {
  return (
    <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-4 shadow-lg text-xs">
      
      {/* Incidents Severity section */}
      <div className="space-y-2">
        <h3 className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Incident Severity</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white/20 inline-block"></span>
            <span className="text-slate-400">Low</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 border border-white/20 inline-block"></span>
            <span className="text-slate-400">Medium</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-orange-500 border border-white/20 inline-block"></span>
            <span className="text-slate-400">High</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-red-500 border border-white/20 inline-block animate-pulse"></span>
            <span className="text-slate-400">Critical</span>
          </div>
        </div>
      </div>

      {/* Resources Status section */}
      <div className="space-y-2 pt-3 border-t border-slate-900/60">
        <h3 className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Resource Status</h3>
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-emerald-500 flex items-center justify-center border border-white/20">
              <span className="text-[8px] font-bold text-slate-950">R</span>
            </div>
            <span className="text-slate-400">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-violet-500 flex items-center justify-center border border-white/20">
              <span className="text-[8px] font-bold text-white">R</span>
            </div>
            <span className="text-slate-400">Assigned</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-amber-500 flex items-center justify-center border border-white/20">
              <span className="text-[8px] font-bold text-slate-950">R</span>
            </div>
            <span className="text-slate-400">Busy</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-orange-500 flex items-center justify-center border border-white/20">
              <span className="text-[8px] font-bold text-white">R</span>
            </div>
            <span className="text-slate-400">Maintenance</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-slate-500 flex items-center justify-center border border-white/20">
              <span className="text-[8px] font-bold text-white">R</span>
            </div>
            <span className="text-slate-400">Offline</span>
          </div>
        </div>
      </div>

    </div>
  );
}
