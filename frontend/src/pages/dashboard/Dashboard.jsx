import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import useSocket from '../../hooks/useSocket';
import { getDashboardOverview } from '../../api/analyticsApi';

import AdminDashboard from './AdminDashboard';
import ResponderDashboard from './ResponderDashboard';
import CitizenDashboard from './CitizenDashboard';

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
      if (err.response?.status === 401) {
        setError('Session expired or cookie not available. Please sign in again.');
      } else {
        setError(err.response?.data?.message || 'An error occurred while fetching dashboard data.');
      }
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

  const getRoleDisplayName = () => {
    switch (user.role) {
      case 'admin':
        return 'Command Admin';
      case 'responder':
        return 'Field Responder';
      case 'citizen':
        return 'Citizen Reporter';
      default:
        return user.role;
    }
  };

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
              [{getRoleDisplayName()}]
            </span>
          </p>
        </div>

        {/* Socket connection indicator */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded bg-surface-container border border-outline-variant text-xs shrink-0">
          <span className={`h-2.5 w-2.5 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
          <span className="text-on-surface-variant font-bold uppercase tracking-wider">{connected ? 'Live Sync' : 'Offline'}</span>
        </div>
      </div>

      {/* Render sub-dashboard by role */}
      {user.role === 'admin' && (
        <AdminDashboard data={data} user={user} fetchDashboardData={fetchDashboardData} />
      )}
      {user.role === 'responder' && (
        <ResponderDashboard data={data} user={user} fetchDashboardData={fetchDashboardData} />
      )}
      {user.role === 'citizen' && (
        <CitizenDashboard data={data} user={user} fetchDashboardData={fetchDashboardData} />
      )}
    </div>
  );
}
