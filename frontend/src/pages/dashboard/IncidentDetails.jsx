import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-surface-container-high text-on-secondary-container border border-outline-variant capitalize">Low</span>;
      case 'medium':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-secondary-container text-on-secondary-container border border-outline-variant capitalize">Medium</span>;
      case 'high':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-tertiary-fixed text-on-tertiary-fixed border border-outline-variant capitalize">High</span>;
      case 'critical':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-error-container text-on-error-container border border-error/20 font-bold capitalize animate-pulse">Critical</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-surface-container-low text-on-surface-variant border border-outline-variant capitalize">{sev}</span>;
    }
  };

  const getStatusBadge = (stat) => {
    switch (stat) {
      case 'reported':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-surface-container text-on-surface-variant border border-outline-variant capitalize">Reported</span>;
      case 'verified':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-primary-fixed text-on-primary-fixed border border-outline-variant capitalize">Verified</span>;
      case 'assigned':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-secondary-fixed text-on-secondary-fixed border border-outline-variant capitalize">Assigned</span>;
      case 'in-progress':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-tertiary-fixed text-on-tertiary-fixed border border-outline-variant capitalize">In Progress</span>;
      case 'resolved':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 capitalize">Resolved</span>;
      case 'closed':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-surface-dim text-on-surface-variant border border-outline-variant capitalize">Closed</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-surface-container-low text-on-surface-variant border border-outline-variant capitalize">{stat}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <span className="font-body-sm text-body-sm text-on-surface-variant">Loading incident details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Link to="/dashboard/incidents" className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant hover:text-on-surface">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to Incidents</span>
        </Link>
        <div className="bg-error-container border border-error rounded-xl p-6 text-center">
          <p className="font-label-lg text-label-lg text-on-error-container font-semibold">{error}</p>
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-outline-variant">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard/incidents"
            className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">{incident.title}</h1>
              {getSeverityBadge(incident.severity)}
              {getStatusBadge(incident.status)}
            </div>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Incident ID: {incident._id}</p>
          </div>
        </div>

        {/* Delete Incident button (Admin only) */}
        {isUserAdmin && (
          <button
            onClick={handleDelete}
            disabled={deleteSubmitting}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 font-label-md text-label-md font-bold text-on-error bg-error hover:bg-opacity-90 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
            <span>Delete Incident</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Details Panel (Left/Center Column - 2/3 wide) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card: Core Description */}
          <div className="bg-surface rounded-xl border border-outline-variant p-6 space-y-4">
            <h2 className="font-label-md text-label-md font-semibold text-on-surface-variant uppercase tracking-wider">Incident Overview</h2>
            <div className="text-on-surface font-body-lg text-body-lg whitespace-pre-wrap leading-relaxed">
              {incident.description}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-outline-variant font-body-md text-body-md">
              <div className="space-y-1">
                <span className="text-on-surface-variant/60 block font-label-sm text-label-sm">Emergency Type</span>
                <span className="font-semibold text-on-surface capitalize">{incident.type}</span>
              </div>
              <div className="space-y-1">
                <span className="text-on-surface-variant/60 block font-label-sm text-label-sm">Date Reported</span>
                <span className="font-semibold text-on-surface">
                  {new Date(incident.createdAt).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Card: Geolocation info */}
          <div className="bg-surface rounded-xl border border-outline-variant p-6 space-y-4">
            <h2 className="font-label-md text-label-md font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
              <span>Location Details</span>
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-on-surface-variant/60 text-xs block">Address</span>
                <span className="font-body-md text-body-md text-on-surface font-semibold">{incident.location?.address}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-on-surface-variant/60 text-xs block">Latitude</span>
                  <code className="text-xs text-primary font-mono font-semibold">{incident.location?.coordinates?.[1] ?? 'N/A'}</code>
                </div>
                <div>
                  <span className="text-on-surface-variant/60 text-xs block">Longitude</span>
                  <code className="text-xs text-primary font-mono font-semibold">{incident.location?.coordinates?.[0] ?? 'N/A'}</code>
                </div>
              </div>
            </div>
          </div>

          {/* Card: People Associated */}
          <div className="bg-surface rounded-xl border border-outline-variant p-6 space-y-4">
            <h2 className="font-label-md text-label-md font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">person</span>
              <span>Involved Persons</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Reporter Info */}
              <div className="p-4 bg-surface-container-low border border-outline-variant rounded-xl space-y-2">
                <span className="text-on-surface-variant/60 font-label-sm text-label-sm block font-semibold uppercase">Reported By (Citizen)</span>
                {incident.reportedBy ? (
                  <div className="font-body-md text-body-md">
                    <div className="font-semibold text-on-surface">{incident.reportedBy.name}</div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{incident.reportedBy.email}</div>
                  </div>
                ) : (
                  <span className="text-on-surface-variant/60 text-xs italic">System / Unknown</span>
                )}
              </div>

              {/* Responder Info */}
              <div className="p-4 bg-surface-container-low border border-outline-variant rounded-xl space-y-2">
                <span className="text-on-surface-variant/60 font-label-sm text-label-sm block font-semibold uppercase">Assigned Responder</span>
                {incident.assignedResponder ? (
                  <div className="font-body-md text-body-md">
                    <div className="font-semibold text-primary">{incident.assignedResponder.name}</div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{incident.assignedResponder.email}</div>
                  </div>
                ) : (
                  <div className="text-xs text-on-surface-variant/60 italic py-2">
                    No emergency responder has been assigned yet.
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Card: Assigned Resources */}
          <div className="bg-surface rounded-xl border border-outline-variant p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="font-label-md text-label-md font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">build</span>
                <span>Assigned Resources</span>
              </h2>
              {isUserAdmin && (
                <form onSubmit={handleAssignResource} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <select
                    value={selectedResource}
                    onChange={(e) => setSelectedResource(e.target.value)}
                    required
                    className="bg-surface border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary min-w-[180px]"
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
                    className="px-3 py-1.5 text-xs font-semibold text-on-primary bg-primary hover:bg-primary/95 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-sm transition"
                  >
                    Assign
                  </button>
                </form>
              )}
            </div>

            {resourceError && (
              <div className="text-xs text-error bg-error-container p-2 rounded border border-error/20">
                {resourceError}
              </div>
            )}

            {incident.assignedResources && incident.assignedResources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {incident.assignedResources.map((resrc) => (
                  <div key={resrc._id} className="p-4 bg-surface-container-low border border-outline-variant rounded-xl flex flex-col justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Link
                          to={`/dashboard/resources/${resrc._id}`}
                          className="font-semibold text-primary hover:underline text-sm"
                        >
                          {resrc.name}
                        </Link>
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-surface border border-outline-variant text-on-surface-variant capitalize">
                          {resrc.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-on-surface-variant">
                        <span className="text-on-surface-variant/60">Status:</span>{' '}
                        <span className="capitalize text-on-surface font-medium">{resrc.status}</span>
                      </div>
                      <div className="text-xs text-on-surface-variant">
                        <span className="text-on-surface-variant/60">Capacity:</span>{' '}
                        <span className="text-on-surface font-medium">{resrc.capacity}</span>
                      </div>
                      <div className="text-xs text-on-surface-variant truncate">
                        <span className="text-on-surface-variant/60">Address:</span>{' '}
                        <span className="text-on-surface font-medium" title={resrc.currentLocation?.address}>
                          {resrc.currentLocation?.address || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {isUserAdmin && (
                      <div className="pt-2 border-t border-outline-variant flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleReleaseResource(resrc._id)}
                          className="px-2 py-1 text-[10px] font-semibold text-error hover:text-error/80 bg-error-container hover:bg-red-200 border border-error/15 rounded transition"
                        >
                          Release Resource
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-on-surface-variant/60 italic py-2">
                No emergency resources have been assigned to this incident.
              </div>
            )}
          </div>

        </div>

        {/* Sidebar Panel (Right Column - 1/3 wide) */}
        <div className="space-y-6">
          
          {/* Form: Actions Form (Assign & Status Updates) */}
          {(canUpdateStatus || isUserAdmin) && (
            <div className="bg-surface rounded-xl border border-outline-variant p-6 space-y-6">
              <h2 className="font-label-md text-label-md font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">monitoring</span>
                <span>Incident Controls</span>
              </h2>

              {/* Admin: Responder Assignment Form */}
              {isUserAdmin && (
                <div className="space-y-4">
                  <h3 className="font-label-sm text-label-sm font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">person_check</span>
                    <span>Assign Responder</span>
                  </h3>
                  
                  {assignError && (
                    <div className="text-xs text-error bg-error-container p-2 rounded border border-error/20">
                      {assignError}
                    </div>
                  )}

                  <form onSubmit={handleAssignSubmit} className="space-y-3">
                    <select
                      value={selectedResponder}
                      onChange={(e) => setSelectedResponder(e.target.value)}
                      required
                      className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
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
                      className="w-full px-4 py-2 text-xs font-semibold text-on-primary bg-primary hover:bg-primary/95 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-sm transition"
                    >
                      {assignSubmitting ? 'Assigning...' : 'Assign Responder'}
                    </button>
                  </form>
                </div>
              )}

              {/* Admin / Assigned Responder: Status Transition Form */}
              {canUpdateStatus && (
                <div className="space-y-4 pt-4 border-t border-outline-variant">
                  <h3 className="font-label-sm text-label-sm font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Update Incident Status</span>
                  </h3>
                  
                  {statusError && (
                    <div className="text-xs text-error bg-error-container p-2 rounded border border-error/20">
                      {statusError}
                    </div>
                  )}

                  {nextStatuses.length === 0 ? (
                    <div className="text-xs text-on-surface-variant/60 italic bg-surface-container-low p-3 rounded-xl border border-outline-variant">
                      No further status transitions are available from '{incident.status}'.
                    </div>
                  ) : (
                    <form onSubmit={handleStatusSubmit} className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Target Status *</label>
                        <select
                          value={statusVal}
                          onChange={(e) => setStatusVal(e.target.value)}
                          required
                          className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
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
                        <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Status Note (Optional)</label>
                        <textarea
                          placeholder="e.g. Unit dispatched, Site clear..."
                          value={statusNote}
                          onChange={(e) => setStatusNote(e.target.value)}
                          rows={2}
                          className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={statusSubmitting || !statusVal}
                        className="w-full px-4 py-2 text-xs font-semibold text-on-primary bg-primary hover:bg-primary/95 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-sm transition"
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
            <div className="bg-surface rounded-xl border border-outline-variant p-4 text-center">
              <span className="text-xs text-on-surface-variant/60 italic">
                Read-only citizen access. You cannot modify reported incidents.
              </span>
            </div>
          )}

          {/* Card: Status Timeline */}
          <div className="bg-surface rounded-xl border border-outline-variant p-6 space-y-4">
            <h2 className="font-label-md text-label-md font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">schedule</span>
              <span>Status History</span>
            </h2>

            {/* Timeline element */}
            <div className="relative border-l border-outline-variant ml-2.5 pl-4 space-y-5">
              {incident.statusHistory && incident.statusHistory.length > 0 ? (
                incident.statusHistory.map((history, idx) => (
                  <div key={idx} className="relative">
                    {/* Circle marker */}
                    <div className="absolute w-3 h-3 bg-primary rounded-full -left-[22px] top-1 ring-4 ring-surface"></div>
                    
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-on-surface capitalize">{history.status}</span>
                        <span className="text-[10px] text-on-surface-variant/60 font-semibold">
                          {new Date(history.changedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant leading-normal">{history.note || 'No description note provided.'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-on-surface-variant/60 italic">
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
