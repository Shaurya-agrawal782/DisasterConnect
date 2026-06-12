import React from 'react';
import { Link } from 'react-router-dom';
import MetricCard from '../../components/dashboard/MetricCard';
import RecentIncidents from '../../components/dashboard/RecentIncidents';
import RecentAlerts from '../../components/dashboard/RecentAlerts';
import StatusBarChart from '../../components/charts/StatusBarChart';
import TypePieChart from '../../components/charts/TypePieChart';

export default function AdminDashboard({ data, user, fetchDashboardData }) {
  const { summary, incidentStats, resourceStats, alertStats } = data || {};

  const totalRes = summary?.resources?.total || 1;
  const availRes = summary?.resources?.available || 0;
  const availPercent = Math.min(Math.round((availRes / totalRes) * 100), 100);

  const busyRes = summary?.resources?.busy || 0;
  const busyPercent = Math.min(Math.round((busyRes / totalRes) * 100), 100);

  const maintRes = summary?.resources?.maintenance || 0;
  const maintPercent = Math.min(Math.round((maintRes / totalRes) * 100), 100);

  return (
    <div className="space-y-6 text-left">
      {/* Overview stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          label="Total Incidents"
          value={summary?.incidents?.total}
          helperText="Global database log"
          icon="layers"
          accentStyle="text-primary"
          iconBgStyle="bg-primary-container/15 text-primary"
        />

        <MetricCard
          label="Active Incidents"
          value={summary?.incidents?.active}
          helperText="Requiring dispatch"
          icon="warning"
          accentStyle="text-amber-600"
          iconBgStyle="bg-amber-100 text-amber-800"
        />

        <MetricCard
          label="Critical Incidents"
          value={summary?.incidents?.critical}
          helperText="High priority alerts"
          icon="campaign"
          accentStyle="text-error"
          iconBgStyle="bg-error-container/20 text-error animate-pulse"
        />

        <MetricCard
          label="Available Resources"
          value={summary?.resources?.available}
          helperText="Ready for assignment"
          icon="home_repair_service"
          accentStyle="text-emerald-600"
          iconBgStyle="bg-emerald-100 text-emerald-800"
        />

        <MetricCard
          label="Unread Alerts"
          value={summary?.alerts?.unread}
          helperText="Require broadcast review"
          icon="notifications_active"
          accentStyle="text-error font-bold"
          iconBgStyle="bg-error-container/20 text-error"
        />

        <MetricCard
          label="Resolved Incidents"
          value={summary?.incidents?.resolved}
          helperText="Completed files"
          icon="check_circle"
          accentStyle="text-emerald-600"
          iconBgStyle="bg-emerald-100 text-emerald-800"
        />
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-surface border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Command Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            to="/dashboard/incidents"
            className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 hover:border-slate-300 transition text-center space-y-2 group"
          >
            <span className="material-symbols-outlined text-blue-600 text-[24px]">emergency</span>
            <span className="text-xs font-bold text-slate-800">View Incidents</span>
          </Link>
          
          <Link
            to="/dashboard/resources/new"
            className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 hover:border-slate-300 transition text-center space-y-2 group"
          >
            <span className="material-symbols-outlined text-blue-600 text-[24px]">add_circle</span>
            <span className="text-xs font-bold text-slate-800">Add Resource</span>
          </Link>

          <Link
            to="/dashboard/map"
            className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 hover:border-slate-300 transition text-center space-y-2 group"
          >
            <span className="material-symbols-outlined text-blue-600 text-[24px]">map</span>
            <span className="text-xs font-bold text-slate-800">Open Map</span>
          </Link>

          <Link
            to="/dashboard/alerts"
            className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 hover:border-slate-300 transition text-center space-y-2 group"
          >
            <span className="material-symbols-outlined text-blue-600 text-[24px]">notifications_active</span>
            <span className="text-xs font-bold text-slate-800">View Alerts</span>
          </Link>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="bg-surface border border-outline-variant rounded-xl p-5 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 border-b border-outline-variant pb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600">bar_chart</span>
          Global Operational Analytics
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
      </div>

      {/* Stocks & Recent Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Stocks widget */}
        <div className="lg:col-span-1 bg-surface border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 border-b border-outline-variant pb-2 text-sm">
              <span className="material-symbols-outlined text-blue-600 text-lg">inventory_2</span>
              Resource Stocks
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Global Availability</span>
                  <span className="text-emerald-600 font-bold">{availPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${availPercent}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Active Deployments</span>
                  <span className="text-amber-600 font-bold">{busyPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full" style={{ width: `${busyPercent}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">In Maintenance</span>
                  <span className="text-error font-bold">{maintPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-error h-full" style={{ width: `${maintPercent}%` }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            onClick={fetchDashboardData}
            className="mt-6 w-full py-2 border border-slate-200 rounded text-slate-700 hover:bg-slate-100 transition text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">sync</span>
            Refresh Database
          </button>
        </div>

        {/* Recent Incidents */}
        <div className="lg:col-span-3">
          <RecentIncidents incidents={incidentStats?.recentIncidents} />
        </div>
      </div>

      {/* Alerts feed */}
      <div className="w-full">
        <RecentAlerts alerts={alertStats?.recentAlerts} user={user} />
      </div>
    </div>
  );
}
