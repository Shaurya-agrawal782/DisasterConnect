import React from 'react';
import { Link } from 'react-router-dom';
import MetricCard from '../../components/dashboard/MetricCard';
import RecentIncidents from '../../components/dashboard/RecentIncidents';
import RecentAlerts from '../../components/dashboard/RecentAlerts';
import StatusBarChart from '../../components/charts/StatusBarChart';

export default function CitizenDashboard({ data, user, fetchDashboardData }) {
  const { summary, incidentStats, alertStats } = data || {};

  return (
    <div className="space-y-6 text-left">
      
      {/* Big Primary CTA for Citizens */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <h2 className="text-xl font-bold text-white">Need emergency assistance or report a hazard?</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Submit details, describe the hazard status, and pinpoint coordinates instantly. Submitted logs are routed to the central dispatcher map for review and team dispatch.
          </p>
        </div>
        <Link
          to="/dashboard/incidents/new"
          className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-lg text-xs tracking-wide shadow-lg shrink-0 transition flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">report</span>
          Report New Incident
        </Link>
      </div>

      {/* Citizen Personal Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="My Reported Incidents"
          value={summary?.incidents?.total}
          helperText="My submitted cases"
          icon="history"
          accentStyle="text-primary"
          iconBgStyle="bg-primary-container/15 text-primary"
        />

        <MetricCard
          label="Active Reports"
          value={summary?.incidents?.active}
          helperText="Awaiting dispatcher review"
          icon="pending_actions"
          accentStyle="text-amber-600"
          iconBgStyle="bg-amber-100 text-amber-800"
        />

        <MetricCard
          label="Unread Alerts"
          value={summary?.alerts?.unread}
          helperText="Updates from response teams"
          icon="notifications_active"
          accentStyle="text-error font-bold"
          iconBgStyle="bg-error-container/20 text-error animate-pulse"
        />
      </div>

      {/* Helpful Platform Information note */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 leading-relaxed space-y-1">
        <h4 className="font-bold">Verification & Dispatch Policy</h4>
        <p>
          Once submitted, your incident reports are reviewed by the agency command center. Trained emergency responders and materials (water, vehicles, rations) are dispatched to safety zones. You will receive real-time notifications here as responder status changes.
        </p>
      </div>

      {/* Recent Activity Table and Status Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Incidents Log */}
        <div className="lg:col-span-8">
          <RecentIncidents incidents={incidentStats?.recentIncidents} />
        </div>

        {/* Scoped Charts / Info panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <StatusBarChart data={incidentStats?.byStatus} title="My Report Status Log" />
          </div>
          
          <button 
            onClick={fetchDashboardData}
            className="w-full py-2 border border-slate-200 bg-white rounded text-slate-700 hover:bg-slate-50 transition text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">sync</span>
            Refresh My Feed
          </button>
        </div>

      </div>

      {/* Alerts feed */}
      <div className="w-full">
        <RecentAlerts alerts={alertStats?.recentAlerts} user={user} />
      </div>

    </div>
  );
}
