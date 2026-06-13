import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  // Filter items matching user role
  const getNavItems = () => {
    switch (user.role) {
      case 'admin':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
          { name: 'Incidents', path: '/dashboard/incidents', icon: 'emergency' },
          { name: 'Resources', path: '/dashboard/resources', icon: 'inventory_2' },
          { name: 'Interactive Map', path: '/dashboard/map', icon: 'map' },
          { name: 'Alerts', path: '/dashboard/alerts', icon: 'notifications_active' },
          { name: 'Reports', path: '/dashboard/reports', icon: 'bar_chart' },
          { name: 'Responders', path: '/dashboard/responders', icon: 'badge' }
        ];
      case 'responder':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
          { name: 'My Incidents', path: '/dashboard/incidents', icon: 'emergency' },
          { name: 'Resources', path: '/dashboard/resources', icon: 'inventory_2' },
          { name: 'Interactive Map', path: '/dashboard/map', icon: 'map' },
          { name: 'Alerts', path: '/dashboard/alerts', icon: 'notifications_active' }
        ];
      case 'citizen':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
          { name: 'Report Incident', path: '/dashboard/incidents/new', icon: 'report' },
          { name: 'My Reports', path: '/dashboard/incidents', icon: 'emergency' },
          { name: 'Alerts', path: '/dashboard/alerts', icon: 'notifications_active' }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

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
        className={`flex flex-col bg-inverse-surface text-inverse-on-surface h-full w-[280px] fixed left-0 top-0 pt-6 pb-8 border-r border-on-surface-variant z-50 transition-transform duration-300 ${
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
              <h2 className="font-headline-sm text-headline-sm font-bold text-white">Command Center</h2>
              <p className="font-label-sm text-label-sm text-slate-400 uppercase tracking-wider">
                {user.role === 'admin' ? 'Command Admin' : user.role === 'responder' ? 'Field Responder' : 'Citizen Reporter'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white flex items-center justify-center p-1"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* CTA Section */}
        <div className="px-6 mb-6">
          {user.role === 'citizen' && (
            <Link
              to="/dashboard/incidents/new"
              onClick={onClose}
              className="w-full bg-error hover:opacity-90 text-on-error py-2.5 px-4 rounded-lg font-label-md text-label-md transition flex items-center justify-center space-x-2 shadow-sm"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>report</span>
              <span>Report Incident</span>
            </Link>
          )}
          {user.role === 'admin' && (
            <Link
              to="/dashboard/incidents"
              onClick={onClose}
              className="w-full bg-primary hover:opacity-90 text-on-primary py-2.5 px-4 rounded-lg font-label-md text-label-md transition flex items-center justify-center space-x-2 shadow-sm"
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
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-150 ${
                  isActive
                    ? 'text-white font-bold border-l-4 border-primary bg-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-label-lg text-label-lg">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Footer Tabs */}
        <div className="px-4 pt-4 border-t border-slate-800 mt-auto space-y-1">
          <button
            onClick={() => {
              onClose?.();
              logout();
            }}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-150 text-left"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
            <span className="font-label-md text-label-md">Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
