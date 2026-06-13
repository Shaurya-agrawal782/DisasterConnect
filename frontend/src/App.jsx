import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import DashboardLayout from './components/layout/DashboardLayout';

import Landing from './pages/public/Landing';
import TrackReport from './pages/TrackReport';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import Dashboard from './pages/dashboard/Dashboard';
import Incidents from './pages/dashboard/Incidents';
import IncidentCreate from './pages/dashboard/IncidentCreate';
import IncidentDetails from './pages/dashboard/IncidentDetails';
import Resources from './pages/dashboard/Resources';
import ResourceForm from './pages/dashboard/ResourceForm';
import ResourceDetails from './pages/dashboard/ResourceDetails';
import MapView from './pages/dashboard/MapView';
import Alerts from './pages/dashboard/Alerts';
import Reports from './pages/dashboard/Reports';
import Responders from './pages/dashboard/Responders';

import './App.css';

// 404 Not Found Page Component
function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-5 p-8 bg-slate-950/40 border border-slate-800 rounded-2xl shadow-xl">
        <h1 className="text-6xl font-extrabold text-indigo-500 tracking-tight">404</h1>
        <h2 className="text-2xl font-bold text-white">Page Not Found</h2>
        <p className="text-slate-400 text-sm">
          The page you are looking for does not exist or has been relocated.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex justify-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-600/20 transition"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/track-report" element={<TrackReport />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* All authenticated users */}
            <Route index element={<Dashboard />} />
            
            <Route 
              path="incidents" 
              element={
                <RoleRoute allowedRoles={['admin', 'responder', 'citizen']}>
                  <Incidents />
                </RoleRoute>
              } 
            />

            <Route 
              path="incidents/new" 
              element={
                <RoleRoute allowedRoles={['admin', 'citizen']}>
                  <IncidentCreate />
                </RoleRoute>
              } 
            />

            <Route 
              path="incidents/:id" 
              element={
                <RoleRoute allowedRoles={['admin', 'responder', 'citizen']}>
                  <IncidentDetails />
                </RoleRoute>
              } 
            />

            <Route 
              path="alerts" 
              element={
                <RoleRoute allowedRoles={['admin', 'responder', 'citizen']}>
                  <Alerts />
                </RoleRoute>
              } 
            />

            {/* Admin & Responder only - Resources view */}
            <Route 
              path="resources" 
              element={
                <RoleRoute allowedRoles={['admin', 'responder']}>
                  <Resources />
                </RoleRoute>
              } 
            />

            {/* Admin only - Resource new and edit */}
            <Route 
              path="resources/new" 
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <ResourceForm />
                </RoleRoute>
              } 
            />

            <Route 
              path="resources/:id" 
              element={
                <RoleRoute allowedRoles={['admin', 'responder']}>
                  <ResourceDetails />
                </RoleRoute>
              } 
            />

            <Route 
              path="resources/:id/edit" 
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <ResourceForm />
                </RoleRoute>
              } 
            />

            {/* Admin & Responder only */}
            <Route 
              path="map" 
              element={
                <RoleRoute allowedRoles={['admin', 'responder']}>
                  <MapView />
                </RoleRoute>
              } 
            />

            {/* Admin only */}
            <Route 
              path="reports" 
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <Reports />
                </RoleRoute>
              } 
            />

            {/* Admin only */}
            <Route 
              path="responders" 
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <Responders />
                </RoleRoute>
              } 
            />
          </Route>

          {/* Fallback 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
    </Router>
  </SocketProvider>
</AuthProvider>
  );
}

export default App;
