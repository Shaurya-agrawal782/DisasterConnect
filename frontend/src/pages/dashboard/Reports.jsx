import React, { useState, useEffect } from 'react';
import { getDashboardOverview } from '../../api/analyticsApi';
import StatusBarChart from '../../components/charts/StatusBarChart';
import TypePieChart from '../../components/charts/TypePieChart';
import Button from '../../components/ui/Button';

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDashboardOverview();
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.message || 'Failed to retrieve analytics data.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while loading reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <span className="font-body-sm text-body-sm text-on-surface-variant">Generating analytics report...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-container/20 border border-error/20 rounded-xl p-6 text-center max-w-2xl mx-auto space-y-4">
        <p className="font-semibold text-error text-sm">{error}</p>
        <Button onClick={fetchAnalytics} variant="primary" size="sm">
          Try Again
        </Button>
      </div>
    );
  }

  const { incidentStats, resourceStats, alertStats } = data || {};

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">bar_chart</span>
          </div>
          <div>
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-background tracking-tight">Analytics & Reports</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">System metrics, dispatch summaries, and incident rates</p>
          </div>
        </div>

        <Button
          onClick={() => window.print()}
          variant="secondary"
          size="sm"
          className="inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">print</span>
          <span>Print Summary</span>
        </Button>
      </div>

      {/* Analytics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface border border-outline-variant rounded-xl p-5 shadow-sm">
          <StatusBarChart data={incidentStats?.byStatus} title="Incidents by Status" />
        </div>
        
        <div className="bg-surface border border-outline-variant rounded-xl p-5 shadow-sm">
          <TypePieChart data={incidentStats?.byType} title="Incidents by Category" />
        </div>

        <div className="bg-surface border border-outline-variant rounded-xl p-5 shadow-sm">
          <StatusBarChart data={resourceStats?.byStatus} title="Resource Allocation Rates" />
        </div>

        <div className="bg-surface border border-outline-variant rounded-xl p-5 shadow-sm">
          <TypePieChart data={alertStats?.byPriority} title="Alert Broadcast Priorities" />
        </div>
      </div>
    </div>
  );
}
