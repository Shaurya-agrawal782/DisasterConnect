import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  // Base navigation menu options mapped with Material Symbols
  const allNavItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: 'dashboard',
      roles: ['admin', 'responder', 'citizen']
    },
    {
      name: 'Incidents',
      path: '/dashboard/incidents',
      icon: 'emergency',
      roles: ['admin', 'responder']
    },
    {
      name: 'Report Incident',
      path: '/dashboard/incidents/new',
      icon: 'report',
      roles: ['citizen']
    },
    {
      name: 'Resources',
      path: '/dashboard/resources',
      icon: 'inventory_2',
      roles: ['admin', 'responder']
    },
    {
      name: 'Interactive Map',
      path: '/dashboard/map',
      icon: 'map',
      roles: ['admin', 'responder']
    },
    {
      name: 'Alerts',
      path: '/dashboard/alerts',
      icon: 'notifications_active',
      roles: ['admin', 'responder', 'citizen']
    },
    {
      name: 'Reports',
      path: '/dashboard/reports',
      icon: 'bar_chart',
      roles: ['admin']
    }
  ];

  // Filter items matching user role
  const navItems = allNavItems.filter(item => item.roles.includes(user.role));

  const isDarkSidebarRole = ['admin', 'responder'].includes(user.role);

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/45 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`flex flex-col bg-inverse-surface text-inverse-on-surface h-full w-[280px] fixed left-0 top-0 pt-16 pb-8 border-r border-on-surface-variant z-50 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* Header */}
        <div className="px-6 mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-primary">shield</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm font-bold text-inverse-on-surface">Command Center</h2>
              <p className="font-label-sm text-label-sm text-surface-variant opacity-80">
                {user.role === 'admin' ? 'System Operator' : user.role === 'responder' ? 'Field Controller' : 'Citizen Access'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-surface-variant hover:text-white flex items-center justify-center p-1"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* CTA (Only show Dispatch for Admin / Responder, otherwise Show Report Incident for Citizens) */}
        <div className="px-6 mb-6">
          {user.role === 'citizen' ? (
            <Link
              to="/dashboard/incidents/new"
              onClick={onClose}
              className="w-full bg-error hover:bg-error-container text-on-error py-2.5 px-4 rounded font-label-md text-label-md transition-colors flex items-center justify-center space-x-2"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>report</span>
              <span>Report Incident</span>
            </Link>
          ) : (
            <Link
              to="/dashboard/incidents"
              onClick={onClose}
              className="w-full bg-primary hover:bg-primary-container text-on-primary py-2.5 px-4 rounded font-label-md text-label-md transition-colors flex items-center justify-center space-x-2"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>flight_takeoff</span>
              <span>Dispatch Resources</span>
            </Link>
          )}
        </div>

        {/* Main Tabs */}
        <div className="flex-1 overflow-y-auto px-4 space-y-1">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={index}
                to={item.path}
                onClick={onClose}
                className={`flex items-center space-x-3 px-4 py-3 rounded scale-95 duration-75 ease-in-out ${
                  isActive
                    ? 'text-primary-fixed-dim font-bold border-r-4 border-primary-fixed-dim bg-tertiary-container'
                    : 'text-surface-variant hover:text-inverse-on-surface hover:bg-on-tertiary-fixed-variant transition-all'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-label-lg text-label-lg">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Footer Tabs */}
        <div className="px-4 pt-4 border-t border-on-surface-variant mt-auto space-y-1">
          <button
            onClick={() => {
              onClose?.();
              logout();
            }}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded text-surface-variant hover:text-inverse-on-surface hover:bg-on-tertiary-fixed-variant transition-all scale-95 duration-75 ease-in-out text-left"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
            <span className="font-label-md text-label-md">Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
