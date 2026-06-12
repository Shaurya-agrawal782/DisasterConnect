import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getResourceById, updateResourceStatus, deleteResource } from '../../api/resourceApi';
import useAuth from '../../hooks/useAuth';

export default function ResourceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status form states
  const [statusVal, setStatusVal] = useState('');
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [statusError, setStatusError] = useState(null);

  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const fetchDetailsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getResourceById(id);
      if (res.success) {
        setResource(res.data.resource);
        setStatusVal(res.data.resource.status);
      } else {
        setError(res.message || 'Failed to retrieve resource details.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while loading resource details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetailsData();
  }, [id]);

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusVal) return;
    setStatusSubmitting(true);
    setStatusError(null);
    try {
      const res = await updateResourceStatus(id, { status: statusVal });
      if (res.success) {
        setResource(res.data.resource);
        alert('Resource status updated successfully!');
      } else {
        setStatusError(res.message || 'Failed to update status.');
      }
    } catch (err) {
      console.error(err);
      setStatusError(err.response?.data?.message || 'Error updating resource status.');
    } finally {
      setStatusSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (resource.assignedIncident) {
      alert('Cannot delete this resource because it is currently assigned to an active incident.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete "${resource.name}" permanently?`)) {
      return;
    }
    setDeleteSubmitting(true);
    try {
      const res = await deleteResource(id);
      if (res.success) {
        navigate('/dashboard/resources');
      } else {
        alert(res.message || 'Failed to delete resource.');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error deleting resource.');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const getTypeLabel = (t) => {
    const labels = {
      ambulance: 'Ambulance',
      fire_truck: 'Fire Truck',
      rescue_team: 'Rescue Team',
      medical: 'Medical Staff',
      shelter: 'Shelter',
      supply: 'Supply Relief',
      volunteer_group: 'Volunteer Group',
      other: 'Other'
    };
    return labels[t] || t;
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case 'available':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 capitalize">Available</span>;
      case 'assigned':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-primary-fixed text-on-primary-fixed border border-outline-variant capitalize">Assigned</span>;
      case 'busy':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-secondary-fixed text-on-secondary-fixed border border-outline-variant capitalize">Busy</span>;
      case 'maintenance':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-tertiary-fixed text-on-tertiary-fixed border border-outline-variant capitalize">Maintenance</span>;
      case 'offline':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-surface-dim text-on-surface-variant border border-outline-variant capitalize">Offline</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-surface-container-low text-on-surface-variant border border-outline-variant capitalize">{s}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <span className="font-body-sm text-body-sm text-on-surface-variant">Loading resource details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Link to="/dashboard/resources" className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant hover:text-on-surface">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to Resources</span>
        </Link>
        <div className="bg-error-container border border-error rounded-xl p-6 text-center">
          <p className="font-label-lg text-label-lg text-on-error-container font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (!resource) return null;

  const isAdmin = user && user.role === 'admin';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-outline-variant">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard/resources"
            className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">{resource.name}</h1>
              {getStatusBadge(resource.status)}
            </div>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Resource ID: {resource._id}</p>
          </div>
        </div>

        {/* Admin actions (Edit / Delete) */}
        {isAdmin && (
          <div className="flex gap-2">
            <Link
              to={`/dashboard/resources/${resource._id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 font-label-md text-label-md font-bold text-on-surface hover:bg-surface-container border border-outline rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              <span>Edit Details</span>
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleteSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 font-label-md text-label-md font-bold text-on-error bg-error hover:bg-opacity-90 disabled:opacity-50 rounded-lg transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Info & Location (Left/Center Column) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card: Main Info */}
          <div className="bg-surface rounded-xl border border-outline-variant p-6 space-y-4">
            <h2 className="font-label-md text-label-md font-semibold text-on-surface-variant uppercase tracking-wider">Resource Information</h2>
            
            <div className="text-on-surface font-body-md text-body-md whitespace-pre-wrap leading-relaxed bg-surface-container-low p-4 border border-outline-variant rounded-xl">
              {resource.description || <span className="text-on-surface-variant/60 italic">No description provided for this emergency resource.</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 font-body-md text-body-md">
              <div className="space-y-1">
                <span className="text-on-surface-variant/60 block font-label-sm text-label-sm">Asset Type</span>
                <span className="font-semibold text-on-surface">{getTypeLabel(resource.type)}</span>
              </div>
              <div className="space-y-1">
                <span className="text-on-surface-variant/60 block font-label-sm text-label-sm">Capacity / Crew Size</span>
                <span className="font-semibold text-on-surface">{resource.capacity}</span>
              </div>
              <div className="space-y-1">
                <span className="text-on-surface-variant/60 block font-label-sm text-label-sm">Date Registered</span>
                <span className="font-semibold text-on-surface">
                  {new Date(resource.createdAt).toLocaleDateString(undefined, {
                    dateStyle: 'medium'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Card: Location Geodata */}
          <div className="bg-surface rounded-xl border border-outline-variant p-6 space-y-4">
            <h2 className="font-label-md text-label-md font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
              <span>Current Geolocation</span>
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-on-surface-variant/60 text-xs block">Address</span>
                <span className="font-body-md text-body-md text-on-surface font-semibold">{resource.currentLocation?.address}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <span className="text-on-surface-variant/60 text-xs block">Latitude</span>
                  <code className="text-xs text-primary font-mono font-semibold">{resource.currentLocation?.coordinates?.[1] ?? 'N/A'}</code>
                </div>
                <div>
                  <span className="text-on-surface-variant/60 text-xs block">Longitude</span>
                  <code className="text-xs text-primary font-mono font-semibold">{resource.currentLocation?.coordinates?.[0] ?? 'N/A'}</code>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Contact Details */}
          <div className="bg-surface rounded-xl border border-outline-variant p-6 space-y-4">
            <h2 className="font-label-md text-label-md font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">person</span>
              <span>Contact Person Details</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-on-surface-variant/60 text-xs block">Name</span>
                <span className="font-body-md text-body-md font-semibold text-on-surface">{resource.contactPerson || 'No contact person assigned'}</span>
              </div>
              <div>
                <span className="text-on-surface-variant/60 text-xs block">Phone Number</span>
                <span className="font-body-md text-body-md font-semibold text-on-surface">{resource.contactNumber || 'No phone number listed'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Status Form & Assigned Incident (Right Column) */}
        <div className="space-y-6">
          
          {/* Card: Status Controls (Admin only) */}
          {isAdmin && (
            <div className="bg-surface rounded-xl border border-outline-variant p-6 space-y-4">
              <h2 className="font-label-md text-label-md font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">monitoring</span>
                <span>Status Modifier</span>
              </h2>

              {statusError && (
                <div className="text-xs text-error bg-error-container p-2 rounded border border-error/20">
                  {statusError}
                </div>
              )}

              <form onSubmit={handleStatusSubmit} className="space-y-3">
                <div>
                  <select
                    value={statusVal}
                    onChange={(e) => setStatusVal(e.target.value)}
                    required
                    className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="available">Available</option>
                    <option value="assigned">Assigned</option>
                    <option value="busy">Busy</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={statusSubmitting || statusVal === resource.status}
                  className="w-full px-4 py-2 text-xs font-semibold text-on-primary bg-primary hover:bg-primary/95 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-sm transition"
                >
                  {statusSubmitting ? 'Updating...' : 'Update Status'}
                </button>
              </form>
            </div>
          )}

          {/* Card: Active Assignment */}
          <div className="bg-surface rounded-xl border border-outline-variant p-6 space-y-4">
            <h2 className="font-label-md text-label-md font-semibold text-on-surface-variant uppercase tracking-wider">Dispatched Incident</h2>
            {resource.assignedIncident ? (
              <div className="p-4 bg-surface-container-low border border-outline-variant rounded-xl space-y-2">
                <div className="text-xs text-primary uppercase font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">assignment</span>
                  <span>Assigned Incident Details</span>
                </div>
                <div className="font-body-md text-body-md font-semibold text-on-surface">{resource.assignedIncident.title}</div>
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] text-on-surface-variant/60 font-bold uppercase">Status:</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-surface border border-outline-variant capitalize text-on-surface-variant">
                      {resource.assignedIncident.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] text-on-surface-variant/60 font-bold uppercase">Severity:</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-surface border border-outline-variant capitalize text-on-surface-variant font-mono">
                      {resource.assignedIncident.severity || 'medium'}
                    </span>
                  </div>
                </div>
                <div className="pt-2">
                  <Link
                    to={`/dashboard/incidents/${resource.assignedIncident._id}`}
                    className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>View Dispatch Ticket</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-xs text-on-surface-variant/60 italic py-2">
                This emergency resource is currently unassigned to any active incident reports.
              </div>
            )}
          </div>

          {/* Seeding metadata */}
          <div className="bg-surface border border-outline-variant rounded-xl p-4 space-y-2 text-xs text-on-surface-variant shadow-sm">
            <div>
              <span className="block font-semibold">Registered By:</span>
              <span>{resource.createdBy?.name || 'System'} ({resource.createdBy?.email || 'N/A'})</span>
            </div>
            {resource.updatedBy && (
              <div className="pt-2 border-t border-outline-variant">
                <span className="block font-semibold">Last Modified By:</span>
                <span>{resource.updatedBy?.name}</span>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
