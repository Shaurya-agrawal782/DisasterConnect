import React from 'react';
import { Link } from 'react-router-dom';

export default function RecentAlerts({ alerts = [], user }) {
  const checkIsRead = (alert) => {
    if (!user) return true;
    return alert.readBy && alert.readBy.some(entry => entry.user === user._id || entry.user?._id === user._id);
  };

  const getAlertStyle = (priority, isRead) => {
    const opacityClass = isRead ? 'opacity-70' : 'opacity-100 shadow-sm';
    switch (priority) {
      case 'critical':
        return `p-3 border-l-4 border-error bg-error-container/20 rounded-r ${opacityClass}`;
      case 'high':
      case 'medium':
        return `p-3 border-l-4 border-amber-500 bg-amber-50 rounded-r ${opacityClass}`;
      case 'low':
      default:
        return `p-3 border-l-4 border-primary bg-primary-container/10 rounded-r ${opacityClass}`;
    }
  };

  const getAlertTitleColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'text-error font-bold';
      case 'high':
      case 'medium':
        return 'text-amber-805 font-bold';
      default:
        return 'text-primary font-bold';
    }
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded flex flex-col h-full shadow-sm text-left">
      <div className="px-4 py-3 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Live Alerts Feed</h3>
        <span className="px-2 py-0.5 bg-error text-on-error font-label-sm text-label-sm rounded animate-pulse">Live</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {alerts.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-on-surface-variant text-sm font-medium">
            No recent alerts.
          </div>
        ) : (
          alerts.slice(0, 10).map((alert) => {
            const isAlertRead = checkIsRead(alert);
            const formattedTime = new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <div 
                key={alert._id} 
                className={getAlertStyle(alert.priority, isAlertRead)}
              >
                <div className="flex justify-between items-start">
                  <span className={`font-label-md text-label-md uppercase tracking-wider ${getAlertTitleColor(alert.priority)}`}>
                    {alert.priority}: {alert.title}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">
                    {formattedTime}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface mt-1">{alert.message}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
