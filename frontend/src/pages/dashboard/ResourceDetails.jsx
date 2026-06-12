import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Wrench, ArrowLeft, AlertTriangle, MapPin, User, Activity, Edit, Trash2 } from 'lucide-react';
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
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Available</span>;
      case 'assigned':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">Assigned</span>;
      case 'busy':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Busy</span>;
      case 'maintenance':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">Maintenance</span>;
      case 'offline':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">Offline</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">{s}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <span className="text-sm text-slate-400">Loading resource details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Link to="/dashboard/resources" className="flex items-center space-x-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Resources</span>
        </Link>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
          <p className="text-sm text-red-400 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (!resource) return null;

  const isAdmin = user && user.role === 'admin';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard/resources"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">{resource.name}</h1>
              {getStatusBadge(resource.status)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Resource ID: {resource._id}</p>
          </div>
        </div>

        {/* Admin actions (Edit / Delete) */}
        {isAdmin && (
          <div className="flex gap-2">
            <Link
              to={`/dashboard/resources/${resource._id}/edit`}
              className="inline-flex items-center justify-center space-x-1 px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg transition"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Details</span>
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleteSubmitting}
              className="inline-flex items-center justify-center space-x-1 px-4 py-2 text-sm font-semibold text-white bg-rose-700 hover:bg-rose-600 disabled:opacity-50 rounded-lg shadow transition"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Info & Location (Left/Center Column) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card: Main Info */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Resource Information</h2>
            
            <div className="text-slate-100 text-sm whitespace-pre-wrap leading-relaxed bg-slate-900/20 p-4 border border-slate-900 rounded-xl">
              {resource.description || <span className="text-slate-500 italic">No description provided for this emergency resource.</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-sm">
              <div className="space-y-1">
                <span className="text-slate-500 block text-xs">Asset Type</span>
                <span className="font-semibold text-slate-200">{getTypeLabel(resource.type)}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 block text-xs">Capacity / Crew Size</span>
                <span className="font-semibold text-slate-200">{resource.capacity}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 block text-xs">Date Registered</span>
                <span className="font-semibold text-slate-200">
                  {new Date(resource.createdAt).toLocaleDateString(undefined, {
                    dateStyle: 'medium'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Card: Location Geodata */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-indigo-400" />
              <span>Current Geolocation</span>
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-slate-500 text-xs block">Address</span>
                <span className="text-sm text-slate-200">{resource.currentLocation?.address}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <span className="text-slate-500 text-xs block">Latitude</span>
                  <code className="text-xs text-indigo-400 font-mono font-semibold">{resource.currentLocation?.coordinates?.[1] ?? 'N/A'}</code>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">Longitude</span>
                  <code className="text-xs text-indigo-400 font-mono font-semibold">{resource.currentLocation?.coordinates?.[0] ?? 'N/A'}</code>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Contact Details */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="h-4 w-4 text-indigo-400" />
              <span>Contact Person Details</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-slate-500 text-xs block">Name</span>
                <span className="text-sm font-semibold text-slate-200">{resource.contactPerson || 'No contact person assigned'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Phone Number</span>
                <span className="text-sm font-semibold text-slate-200">{resource.contactNumber || 'No phone number listed'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Status Form & Assigned Incident (Right Column) */}
        <div className="space-y-6">
          
          {/* Card: Status Controls (Admin only) */}
          {isAdmin && (
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-indigo-400" />
                <span>Status Modifier</span>
              </h2>

              {statusError && (
                <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded border border-red-500/10">
                  {statusError}
                </div>
              )}

              <form onSubmit={handleStatusSubmit} className="space-y-3">
                <div>
                  <select
                    value={statusVal}
                    onChange={(e) => setStatusVal(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
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
                  className="w-full px-4 py-2 text-xs font-semibold text-white bg-indigo-650 hover:bg-indigo-550 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow transition"
                >
                  {statusSubmitting ? 'Updating...' : 'Update Status'}
                </button>
              </form>
            </div>
          )}

          {/* Card: Active Assignment */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Dispatched Incident</h2>
            {resource.assignedIncident ? (
              <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl space-y-2">
                <div className="text-xs text-indigo-400 uppercase font-semibold">Assigned Incident Details</div>
                <div className="text-sm font-semibold text-white">{resource.assignedIncident.title}</div>
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] text-slate-450 uppercase">Status:</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-900 border border-slate-800 capitalize text-slate-300">
                      {resource.assignedIncident.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] text-slate-455 uppercase">Severity:</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-900 border border-slate-800 capitalize text-slate-300 font-mono">
                      {resource.assignedIncident.severity || 'medium'}
                    </span>
                  </div>
                </div>
                <div className="pt-2">
                  <Link
                    to={`/dashboard/incidents/${resource.assignedIncident._id}`}
                    className="text-xs text-indigo-400 hover:underline hover:text-indigo-300"
                  >
                    View Dispatch Ticket &rarr;
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic py-2">
                This emergency resource is currently unassigned to any active incident reports.
              </div>
            )}
          </div>

          {/* Seeding metadata */}
          <div className="bg-slate-950/20 border border-slate-900 rounded-2xl p-4 space-y-2 text-xs text-slate-500">
            <div>
              <span className="block font-semibold">Registered By:</span>
              <span>{resource.createdBy?.name || 'System'} ({resource.createdBy?.email || 'N/A'})</span>
            </div>
            {resource.updatedBy && (
              <div className="pt-1 border-t border-slate-900/60">
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
