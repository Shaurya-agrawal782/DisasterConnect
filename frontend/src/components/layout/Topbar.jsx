import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useSocket from '../../hooks/useSocket';

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { connected, liveAlerts } = useSocket();

  if (!user) return null;

  // Role tag styling mapping
  const roleBadges = {
    admin: 'bg-error-container/20 text-error border-error/20',
    responder: 'bg-primary-container/20 text-primary border-primary-container/20',
    citizen: 'bg-emerald-100 text-emerald-800 border-emerald-250'
  };

  const badgeClass = roleBadges[user.role] || 'bg-surface-container-high text-on-surface-variant border-outline-variant';

  return (
    <header className="bg-surface border-b border-outline-variant fixed top-0 w-full md:w-[calc(100%-280px)] z-50 flex justify-between items-center px-6 md:px-margin-desktop h-16">
      <div className="flex items-center space-x-3">
        {/* Hamburger menu button for mobile */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-1.5 text-on-surface hover:bg-surface-container rounded-lg transition-colors flex items-center justify-center border border-outline-variant"
          title="Open Menu"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>
        <h1 className="font-headline-md text-headline-md font-bold text-primary">DisasterConnect</h1>
      </div>

      <div className="flex items-center space-x-2">
        {/* Sync Status Badge */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-surface-container-low rounded border border-outline-variant">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
            {connected ? 'Real-time Linked' : 'Off-line Sync'}
          </span>
        </div>

        <div className="h-6 w-px bg-outline-variant mx-2 hidden sm:block"></div>

        {/* Trailing Icon Actions */}
        <Link
          to="/dashboard/alerts"
          className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded transition-colors relative"
          title="Notification Center"
        >
          <span className="material-symbols-outlined">notifications</span>
          {liveAlerts.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
          )}
        </Link>

        {/* User Badge / Role Profile */}
        <div className="flex items-center space-x-3 ml-2">
          <div className="hidden sm:flex flex-col text-right">
            <span className="block text-sm font-semibold text-on-surface leading-none mb-1">
              {user.name}
            </span>
            <span className="block text-xs text-on-surface-variant leading-none">
              {user.email}
            </span>
          </div>
          <span className={`px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded border ${badgeClass}`}>
            {user.role}
          </span>
        </div>

        {/* Report Incident Quick Link */}
        <Link
          to="/dashboard/incidents/new"
          className="hidden sm:flex items-center space-x-1 bg-error hover:bg-error-container text-on-error hover:text-on-error-container py-1.5 px-4 rounded font-label-md text-label-md transition-colors border border-transparent hover:border-error ml-3"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>report</span>
          <span>Report Incident</span>
        </Link>
      </div>
    </header>
  );
}
