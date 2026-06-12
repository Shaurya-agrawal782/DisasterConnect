import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import useSocket from '../../hooks/useSocket';
import { getDashboardOverview } from '../../api/analyticsApi';

import MetricCard from '../../components/dashboard/MetricCard';
import RecentIncidents from '../../components/dashboard/RecentIncidents';
import RecentAlerts from '../../components/dashboard/RecentAlerts';
import StatusBarChart from '../../components/charts/StatusBarChart';
import TypePieChart from '../../components/charts/TypePieChart';

export default function Dashboard() {
  const { user } = useAuth();
  const { connected } = useSocket();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDashboardOverview();
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.message || 'Failed to load dashboard analytics');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'An error occurred while fetching dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <span className="material-symbols-outlined text-[36px] text-primary animate-spin">sync</span>
        <span className="text-on-surface-variant text-sm font-medium">Loading dashboard overview...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-error-container/20 border border-error/30 rounded-2xl flex flex-col items-center justify-center min-h-[250px] space-y-4 text-center">
        <span className="material-symbols-outlined text-[48px] text-error">warning</span>
        <h3 className="text-lg font-bold text-on-surface">Failed to Load Dashboard Data</h3>
        <p className="text-error text-sm max-w-md">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-error hover:bg-error-container text-on-error rounded text-xs font-semibold flex items-center space-x-2 transition"
        >
          <span className="material-symbols-outlined text-sm">sync</span>
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  const { summary, incidentStats, resourceStats, alertStats } = data || {};

  // Welcome message based on role
  const getWelcomeMessage = () => {
    switch (user.role) {
      case 'admin':
        return 'System coordination and global operational command dashboard.';
      case 'responder':
        return 'Active field checklist, responder assignments, and alerts feed.';
      case 'citizen':
        return 'Incident report tracking and public safety warning broadcast center.';
      default:
        return 'Operational status overview and incident coordinates.';
    }
  };

  // Safe defaults for resources metrics
  const totalRes = summary?.resources?.total || 1;
  const availRes = summary?.resources?.available || 0;
  const availPercent = Math.min(Math.round((availRes / totalRes) * 100), 100);

  return (
    <div className="space-y-6 text-left">
      {/* Welcome banner */}
      <div className="bg-surface border border-outline-variant rounded-xl p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface">
            Welcome back, {user.name}
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            {getWelcomeMessage()}{' '}
            <span className="font-bold text-primary uppercase tracking-wide">
              [{user.role}]
            </span>
          </p>
        </div>

        {/* Socket connection indicator */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded bg-surface-container border border-outline-variant text-xs shrink-0">
          <span className={`h-2.5 w-2.5 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
          <span className="text-on-surface-variant font-bold uppercase tracking-wider">{connected ? 'Live Sync' : 'Offline'}</span>
        </div>
      </div>

      {/* Grid of status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          label="Total Incidents"
          value={summary?.incidents?.total}
          helperText={user.role === 'admin' ? 'Global incidents log' : 'Personal log'}
          icon="layers"
          accentStyle="text-primary"
          iconBgStyle="bg-primary-container/15 text-primary"
        />

        <MetricCard
          label="Active Incidents"
          value={summary?.incidents?.active}
          helperText="Requiring response"
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
          value={user.role !== 'citizen' ? summary?.resources?.available : 'N/A'}
          helperText={user.role !== 'citizen' ? 'Ready for dispatch' : 'Restricted access'}
          icon="home_repair_service"
          accentStyle={user.role !== 'citizen' ? 'text-emerald-600' : 'text-on-surface-variant/40'}
          iconBgStyle={user.role !== 'citizen' ? 'bg-emerald-100 text-emerald-800' : 'bg-surface-container-high text-on-surface-variant/40'}
        />

        <MetricCard
          label="Unread Alerts"
          value={summary?.alerts?.unread}
          helperText="Require attention"
          icon="notifications_active"
          accentStyle="text-error font-bold"
          iconBgStyle="bg-error-container/20 text-error"
        />

        <MetricCard
          label="Resolved Incidents"
          value={summary?.incidents?.resolved}
          helperText="Closed operations"
          icon="check_circle"
          accentStyle="text-emerald-600"
          iconBgStyle="bg-emerald-100 text-emerald-800"
        />
      </div>

      {/* Analytical Charts Bento Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-on-surface mb-6 flex items-center space-x-2 border-b border-outline-variant pb-3">
          <span className="material-symbols-outlined text-primary">bar_chart</span>
          <span>Analytical Operations Reports</span>
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface-container-low border border-outline-variant rounded p-4">
            <StatusBarChart data={incidentStats?.byStatus} title={user.role === 'admin' ? 'Global Incidents Status log' : 'Personal Incident status'} />
          </div>
          <div className="bg-surface-container-low border border-outline-variant rounded p-4">
            <TypePieChart data={incidentStats?.byType} title={user.role === 'admin' ? 'Global Incidents Type mapping' : 'Personal Incident type mapping'} />
          </div>
          {user.role !== 'citizen' && (
            <div className="bg-surface-container-low border border-outline-variant rounded p-4">
              <StatusBarChart data={resourceStats?.byStatus} title="Global Resources Deployment Status" />
            </div>
          )}
          <div className="bg-surface-container-low border border-outline-variant rounded p-4">
            <TypePieChart data={alertStats?.byPriority} title="Alert Broadcast Priority Scope" />
          </div>
        </div>
      </div>

      {/* Bottom Section: Resource Status Levels & Recent Activity Table */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Resource Levels Mini Widget */}
        <div className="lg:col-span-1 bg-surface-container-lowest border border-outline-variant rounded shadow-sm p-4 text-left flex flex-col justify-between">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4 font-semibold flex items-center gap-2 border-b pb-2 border-outline-variant">
              <span className="material-symbols-outlined text-primary">inventory_2</span>
              Resource Stocks
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between font-label-sm text-label-sm mb-1">
                  <span className="text-on-surface-variant">Global Availability</span>
                  <span className="text-emerald-600 font-bold">{availPercent}%</span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${availPercent}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-label-sm text-label-sm mb-1">
                  <span className="text-on-surface-variant">Staging Capacity</span>
                  <span className="text-amber-600 font-bold">60%</span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full" style={{ width: '60%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-label-sm text-label-sm mb-1">
                  <span className="text-on-surface-variant">Rations Dispatch Rate</span>
                  <span className="text-error font-bold">25%</span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-error h-full" style={{ width: '25%' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            onClick={fetchDashboardData}
            className="mt-6 w-full px-3 py-2 border border-outline-variant rounded text-primary font-label-md text-label-md hover:bg-surface-container-low transition-colors font-semibold flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">sync</span>
            Refresh Database
          </button>
        </div>

        {/* Recent Incidents Activity List */}
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
