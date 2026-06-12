import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  ArrowLeft, 
  User, 
  MapPin, 
  Clock, 
  UserCheck, 
  Activity, 
  Trash2, 
  CheckCircle2,
  Wrench
} from 'lucide-react';
import { 
  getIncidentById, 
  updateIncidentStatus, 
  assignResponder, 
  deleteIncident,
  assignResourceToIncident,
  releaseResourceFromIncident
} from '../../api/incidentApi';
import { getResponders } from '../../api/userApi';
import { getResources } from '../../api/resourceApi';
import useAuth from '../../hooks/useAuth';

export default function IncidentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status form states
  const [statusVal, setStatusVal] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [statusError, setStatusError] = useState(null);

  // Assignment states
  const [responders, setResponders] = useState([]);
  const [selectedResponder, setSelectedResponder] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [assignError, setAssignError] = useState(null);

  // Deletion state
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Resource Assignment states
  const [availableResources, setAvailableResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState('');
  const [resourceSubmitting, setResourceSubmitting] = useState(false);
  const [resourceError, setResourceError] = useState(null);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getIncidentById(id);
      if (res.success) {
        setIncident(res.data.incident);
        setStatusVal(''); // reset status field
        setStatusNote('');
      } else {
        setError(res.message || 'Failed to fetch incident details.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error retrieving incident details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRespondersList = async () => {
    if (user && user.role === 'admin') {
      try {
        const res = await getResponders();
        if (res.success) {
          setResponders(res.data.responders);
        }
      } catch (err) {
        console.error('Failed to load responders:', err);
      }
    }
  };

  const fetchAvailableResources = async () => {
    if (user && user.role === 'admin') {
      try {
        const res = await getResources({ status: 'available', limit: 100 });
        if (res.success) {
          setAvailableResources(res.data.resources);
        }
      } catch (err) {
        console.error('Failed to load available resources:', err);
      }
    }
  };

  useEffect(() => {
    fetchDetails();
    fetchRespondersList();
    fetchAvailableResources();
  }, [id, user]);

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusVal) return;
    setStatusSubmitting(true);
    setStatusError(null);
    try {
      const res = await updateIncidentStatus(id, {
        status: statusVal,
        note: statusNote.trim() || undefined
      });
      if (res.success) {
        setIncident(res.data.incident);
        setStatusVal('');
        setStatusNote('');
      } else {
        setStatusError(res.message || 'Failed to update status.');
      }
    } catch (err) {
      console.error(err);
      setStatusError(err.response?.data?.message || 'Error updating status.');
    } finally {
      setStatusSubmitting(false);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedResponder) return;
    setAssignSubmitting(true);
    setAssignError(null);
    try {
      const res = await assignResponder(id, selectedResponder);
      if (res.success) {
        setIncident(res.data.incident);
        setSelectedResponder('');
      } else {
        setAssignError(res.message || 'Failed to assign responder.');
      }
    } catch (err) {
      console.error(err);
      setAssignError(err.response?.data?.message || 'Error assigning responder.');
    } finally {
      setAssignSubmitting(false);
    }
  };

  const handleAssignResource = async (e) => {
    e.preventDefault();
    if (!selectedResource) return;
    setResourceSubmitting(true);
    setResourceError(null);
    try {
      const res = await assignResourceToIncident(id, selectedResource);
      if (res.success) {
        setIncident(res.data.incident);
        setSelectedResource('');
        fetchAvailableResources();
      } else {
        setResourceError(res.message || 'Failed to assign resource.');
      }
    } catch (err) {
      console.error(err);
      setResourceError(err.response?.data?.message || 'Error assigning resource.');
    } finally {
      setResourceSubmitting(false);
    }
  };

  const handleReleaseResource = async (resourceId) => {
    if (!window.confirm('Are you sure you want to release this resource from the incident?')) {
      return;
    }
    setResourceSubmitting(true);
    setResourceError(null);
    try {
      const res = await releaseResourceFromIncident(id, resourceId);
      if (res.success) {
        setIncident(res.data.incident);
        fetchAvailableResources();
      } else {
        setResourceError(res.message || 'Failed to release resource.');
      }
    } catch (err) {
      console.error(err);
      setResourceError(err.response?.data?.message || 'Error releasing resource.');
    } finally {
      setResourceSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this incident report permanently? This action cannot be undone.')) {
      return;
    }
    setDeleteSubmitting(true);
    try {
      const res = await deleteIncident(id);
      if (res.success) {
        navigate('/dashboard/incidents');
      } else {
        alert(res.message || 'Failed to delete incident.');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error deleting incident.');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Helper styles for badges
  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'low':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Low</span>;
      case 'medium':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Medium</span>;
      case 'high':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">High</span>;
      case 'critical':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse">Critical</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">{sev}</span>;
    }
  };

  const getStatusBadge = (stat) => {
    switch (stat) {
      case 'reported':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">Reported</span>;
      case 'verified':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Verified</span>;
      case 'assigned':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">Assigned</span>;
      case 'in-progress':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">In Progress</span>;
      case 'resolved':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Resolved</span>;
      case 'closed':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">Closed</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">{stat}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <span className="text-sm text-slate-400">Loading incident details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Link to="/dashboard/incidents" className="flex items-center space-x-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Incidents</span>
        </Link>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
          <p className="text-sm text-red-400 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (!incident) return null;

  // Determine allowed statuses for dropdown based on allowed status transition rules
  const allowedTransitions = {
    'reported': ['verified', 'assigned', 'closed'],
    'verified': ['assigned', 'in-progress', 'closed'],
    'assigned': ['in-progress', 'resolved', 'closed'],
    'in-progress': ['resolved', 'closed'],
    'resolved': ['closed'],
    'closed': []
  };

  const nextStatuses = allowedTransitions[incident.status] || [];

  // Check roles permissions
  const isUserAdmin = user && user.role === 'admin';
  const isUserAssignedResponder = user && user.role === 'responder' && incident.assignedResponder && incident.assignedResponder._id === user._id;
  const canUpdateStatus = isUserAdmin || isUserAssignedResponder;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back button and title header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard/incidents"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">{incident.title}</h1>
              {getSeverityBadge(incident.severity)}
              {getStatusBadge(incident.status)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Incident ID: {incident._id}</p>
          </div>
        </div>

        {/* Delete Incident button (Admin only) */}
        {isUserAdmin && (
          <button
            onClick={handleDelete}
            disabled={deleteSubmitting}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2 text-sm font-semibold text-white bg-rose-700 hover:bg-rose-600 disabled:opacity-50 rounded-lg shadow-lg shadow-rose-700/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Incident</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Details Panel (Left/Center Column - 2/3 wide) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card: Core Description */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Incident Overview</h2>
            <div className="text-slate-100 text-sm whitespace-pre-wrap leading-relaxed">
              {incident.description}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-900/60 text-sm">
              <div className="space-y-1">
                <span className="text-slate-500 block text-xs">Emergency Type</span>
                <span className="font-semibold text-slate-200 capitalize">{incident.type}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 block text-xs">Date Reported</span>
                <span className="font-semibold text-slate-200">
                  {new Date(incident.createdAt).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Card: Geolocation info */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-indigo-400" />
              <span>Location Details</span>
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-slate-500 text-xs block">Address</span>
                <span className="text-sm text-slate-200">{incident.location?.address}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 text-xs block">Latitude</span>
                  {/* coordinates[1] is Latitude */}
                  <code className="text-xs text-indigo-400 font-mono font-semibold">{incident.location?.coordinates?.[1] ?? 'N/A'}</code>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">Longitude</span>
                  {/* coordinates[0] is Longitude */}
                  <code className="text-xs text-indigo-400 font-mono font-semibold">{incident.location?.coordinates?.[0] ?? 'N/A'}</code>
                </div>
              </div>
            </div>
          </div>

          {/* Card: People Associated */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="h-4 w-4 text-indigo-400" />
              <span>Involved Persons</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Reporter Info */}
              <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl space-y-2">
                <span className="text-slate-500 text-xs block font-semibold uppercase">Reported By (Citizen)</span>
                {incident.reportedBy ? (
                  <div className="text-sm">
                    <div className="font-semibold text-white">{incident.reportedBy.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{incident.reportedBy.email}</div>
                  </div>
                ) : (
                  <span className="text-slate-500 text-xs italic">System / Unknown</span>
                )}
              </div>

              {/* Responder Info */}
              <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl space-y-2">
                <span className="text-slate-500 text-xs block font-semibold uppercase">Assigned Responder</span>
                {incident.assignedResponder ? (
                  <div className="text-sm">
                    <div className="font-semibold text-indigo-400">{incident.assignedResponder.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{incident.assignedResponder.email}</div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic py-2">
                    No emergency responder has been assigned yet.
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Card: Assigned Resources */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="h-4 w-4 text-indigo-400" />
                <span>Assigned Resources</span>
              </h2>
              {isUserAdmin && (
                <form onSubmit={handleAssignResource} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <select
                    value={selectedResource}
                    onChange={(e) => setSelectedResource(e.target.value)}
                    required
                    className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 min-w-[180px]"
                  >
                    <option value="">Select Resource...</option>
                    {availableResources.map(r => (
                      <option key={r._id} value={r._id}>
                        {r.name} ({r.type.replace('_', ' ')})
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={resourceSubmitting || !selectedResource}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-650 hover:bg-indigo-550 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow transition"
                  >
                    Assign
                  </button>
                </form>
              )}
            </div>

            {resourceError && (
              <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded border border-red-500/10">
                {resourceError}
              </div>
            )}

            {incident.assignedResources && incident.assignedResources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {incident.assignedResources.map((resrc) => (
                  <div key={resrc._id} className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl flex flex-col justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Link
                          to={`/dashboard/resources/${resrc._id}`}
                          className="font-semibold text-indigo-400 hover:underline text-sm"
                        >
                          {resrc.name}
                        </Link>
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-950 text-slate-400 border border-slate-800 capitalize">
                          {resrc.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        <span className="text-slate-500">Status:</span>{' '}
                        <span className="capitalize text-slate-300">{resrc.status}</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        <span className="text-slate-500">Capacity:</span>{' '}
                        <span className="text-slate-300">{resrc.capacity}</span>
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        <span className="text-slate-500">Address:</span>{' '}
                        <span className="text-slate-300" title={resrc.currentLocation?.address}>
                          {resrc.currentLocation?.address || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {isUserAdmin && (
                      <div className="pt-2 border-t border-slate-900/60 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleReleaseResource(resrc._id)}
                          className="px-2 py-1 text-[10px] font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/15 rounded transition"
                        >
                          Release Resource
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic py-2">
                No emergency resources have been assigned to this incident.
              </div>
            )}
          </div>

        </div>

        {/* Sidebar Panel (Right Column - 1/3 wide) */}
        <div className="space-y-6">
          
          {/* Form: Actions Form (Assign & Status Updates) */}
          {(canUpdateStatus || isUserAdmin) && (
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 space-y-6">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-indigo-400" />
                <span>Incident Controls</span>
              </h2>

              {/* Admin: Responder Assignment Form */}
              {isUserAdmin && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>Assign Responder</span>
                  </h3>
                  
                  {assignError && (
                    <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded border border-red-500/10">
                      {assignError}
                    </div>
                  )}

                  <form onSubmit={handleAssignSubmit} className="space-y-3">
                    <select
                      value={selectedResponder}
                      onChange={(e) => setSelectedResponder(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Select a Responder...</option>
                      {responders.map(r => (
                        <option key={r._id} value={r._id}>
                          {r.name} ({r.email})
                        </option>
                      ))}
                    </select>
                    
                    <button
                      type="submit"
                      disabled={assignSubmitting || !selectedResponder}
                      className="w-full px-4 py-2 text-xs font-semibold text-white bg-indigo-650 hover:bg-indigo-550 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow transition"
                    >
                      {assignSubmitting ? 'Assigning...' : 'Assign Responder'}
                    </button>
                  </form>
                </div>
              )}

              {/* Admin / Assigned Responder: Status Transition Form */}
              {canUpdateStatus && (
                <div className="space-y-4 pt-4 border-t border-slate-900/60">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Update Incident Status</span>
                  </h3>
                  
                  {statusError && (
                    <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded border border-red-500/10">
                      {statusError}
                    </div>
                  )}

                  {nextStatuses.length === 0 ? (
                    <div className="text-xs text-slate-500 italic bg-slate-900/40 p-3 rounded-xl border border-slate-900">
                      No further status transitions are available from '{incident.status}'.
                    </div>
                  ) : (
                    <form onSubmit={handleStatusSubmit} className="space-y-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Target Status *</label>
                        <select
                          value={statusVal}
                          onChange={(e) => setStatusVal(e.target.value)}
                          required
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="">Select next status...</option>
                          {nextStatuses.map(s => (
                            <option key={s} value={s} className="capitalize">
                              {s.replace('-', ' ')}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Status Note (Optional)</label>
                        <textarea
                          placeholder="e.g. Unit dispatched, Site clear..."
                          value={statusNote}
                          onChange={(e) => setStatusNote(e.target.value)}
                          rows={2}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={statusSubmitting || !statusVal}
                        className="w-full px-4 py-2 text-xs font-semibold text-white bg-indigo-650 hover:bg-indigo-550 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow transition"
                      >
                        {statusSubmitting ? 'Updating...' : 'Update Status'}
                      </button>
                    </form>
                  )}
                </div>
              )}

            </div>
          )}

          {/* Citizen Read-Only Warning */}
          {user && user.role === 'citizen' && (
            <div className="bg-slate-950/20 border border-slate-900 rounded-2xl p-4 text-center">
              <span className="text-xs text-slate-500 italic">
                Read-only citizen access. You cannot modify reported incidents.
              </span>
            </div>
          )}

          {/* Card: Status Timeline */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-indigo-400" />
              <span>Status History</span>
            </h2>

            {/* Timeline element */}
            <div className="space-y-4 pl-1">
              {incident.statusHistory && incident.statusHistory.length > 0 ? (
                incident.statusHistory.map((history, idx) => (
                  <div key={idx} className="relative pl-5 border-l border-indigo-500/20 last:border-0 pb-1">
                    {/* Circle marker */}
                    <div className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-indigo-500 border-2 border-slate-950"></div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white capitalize">{history.status}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(history.changedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-normal">{history.note}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 italic">
                  No status transition log recorded.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
