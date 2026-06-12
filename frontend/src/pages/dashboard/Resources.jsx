import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Plus, Search, Filter, RefreshCw, Eye, Edit, Trash2 } from 'lucide-react';
import { getResources, deleteResource } from '../../api/resourceApi';
import useAuth from '../../hooks/useAuth';

export default function Resources() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchResourcesData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 10,
        sort: '-createdAt'
      };
      if (search.trim()) params.search = search;
      if (status) params.status = status;
      if (type) params.type = type;

      const res = await getResources(params);
      if (res.success) {
        setResources(res.data.resources);
        setTotalPages(res.data.pagination.totalPages);
      } else {
        setError(res.message || 'Failed to retrieve resources');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while fetching resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResourcesData();
  }, [page, status, type]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchResourcesData();
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setType('');
    setPage(1);
  };

  const handleDelete = async (id, name, hasIncident) => {
    if (hasIncident) {
      alert('Cannot delete this resource because it is currently assigned to an active incident.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete "${name}" permanently?`)) {
      return;
    }
    try {
      const res = await deleteResource(id);
      if (res.success) {
        fetchResourcesData();
      } else {
        alert(res.message || 'Failed to delete resource.');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error deleting resource.');
    }
  };

  const getTypeBadge = (t) => {
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
    return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{labels[t] || t}</span>;
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

  const isAdmin = user && user.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Wrench className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Resource Inventory</h1>
            <p className="text-sm text-slate-400">Manage ambulances, rescue assets, shelters, and dispatch units</p>
          </div>
        </div>

        {/* Add resource button (Admin only) */}
        {isAdmin && (
          <Link
            to="/dashboard/resources/new"
            className="inline-flex items-center justify-center space-x-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-660 hover:bg-indigo-560 rounded-lg shadow-lg shadow-indigo-660/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Resource</span>
          </Link>
        )}
      </div>

      {/* Search and Filters Panel */}
      <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4 md:p-6 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by resource name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-900/60">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 mr-2">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters:</span>
          </div>

          {/* Type Filter */}
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Types</option>
            <option value="ambulance">Ambulance</option>
            <option value="fire_truck">Fire Truck</option>
            <option value="rescue_team">Rescue Team</option>
            <option value="medical">Medical Staff</option>
            <option value="shelter">Shelter</option>
            <option value="supply">Supply Relief</option>
            <option value="volunteer_group">Volunteer Group</option>
            <option value="other">Other</option>
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="assigned">Assigned</option>
            <option value="busy">Busy</option>
            <option value="maintenance">Maintenance</option>
            <option value="offline">Offline</option>
          </select>

          {/* Reset button */}
          {(search || type || status) && (
            <button
              onClick={handleResetFilters}
              className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <span className="text-sm text-slate-400">Loading resources...</span>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
          <p className="text-sm text-red-400 font-semibold">{error}</p>
          <button
            onClick={fetchResourcesData}
            className="mt-3 text-xs text-indigo-400 hover:underline inline-flex items-center gap-1.5"
          >
            <RefreshCw className="h-3 w-3" /> Try Again
          </button>
        </div>
      ) : resources.length === 0 ? (
        <div className="p-8 bg-slate-950/40 border border-slate-800 rounded-2xl flex flex-col justify-center items-center text-center min-h-[300px]">
          <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center text-slate-650 mb-4">
            <Wrench className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold text-slate-200 mb-1">No Resources Found</h2>
          <p className="text-sm text-slate-400 max-w-sm">
            {search || type || status
              ? "No items match your filters. Try relaxing filters or search terms."
              : "No emergency resources have been registered yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Table Container */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/40">
                    <th className="p-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Resource Name</th>
                    <th className="p-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Type</th>
                    <th className="p-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Status</th>
                    <th className="p-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Capacity</th>
                    <th className="p-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Address / Location</th>
                    <th className="p-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Contact</th>
                    <th className="p-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Created Date</th>
                    <th className="p-4 text-xs font-semibold tracking-wider text-slate-400 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {resources.map((resource) => (
                    <tr key={resource._id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-white text-sm">{resource.name}</div>
                        <div className="text-xs text-slate-500 truncate max-w-xs mt-0.5">{resource.description || 'No description provided'}</div>
                        {resource.assignedIncident && (
                          <div className="text-[10px] text-indigo-450 mt-1 font-medium truncate max-w-xs">
                            Assigned: {resource.assignedIncident.title} ({resource.assignedIncident.status})
                          </div>
                        )}
                      </td>
                      <td className="p-4">{getTypeBadge(resource.type)}</td>
                      <td className="p-4">{getStatusBadge(resource.status)}</td>
                      <td className="p-4 text-sm text-slate-300 font-semibold">{resource.capacity}</td>
                      <td className="p-4 max-w-xs">
                        <div className="text-sm text-slate-300 truncate">{resource.currentLocation?.address}</div>
                      </td>
                      <td className="p-4 text-xs">
                        <div className="text-slate-300 font-medium">{resource.contactPerson || 'None'}</div>
                        <div className="text-slate-500 mt-0.5">{resource.contactNumber || ''}</div>
                      </td>
                      <td className="p-4 text-xs text-slate-400">
                        {new Date(resource.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex gap-2">
                          <Link
                            to={`/dashboard/resources/${resource._id}`}
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/15 rounded-lg transition"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>View</span>
                          </Link>

                          {isAdmin && (
                            <>
                              <Link
                                to={`/dashboard/resources/${resource._id}/edit`}
                                className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Link>
                              <button
                                onClick={() => handleDelete(resource._id, resource.name, !!resource.assignedIncident)}
                                className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/15 rounded-lg transition"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Simple Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
