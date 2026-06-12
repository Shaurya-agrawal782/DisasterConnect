import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    
    switch (t) {
      case 'ambulance':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-error-container text-on-error-container border border-error/10 capitalize">Ambulance</span>;
      case 'fire_truck':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-primary-fixed text-on-primary-fixed-variant border border-outline-variant capitalize">Fire Truck</span>;
      case 'rescue_team':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-secondary-fixed text-on-secondary-fixed-variant border border-outline-variant capitalize">Rescue Team</span>;
      case 'medical':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-tertiary-fixed text-on-tertiary-fixed border border-outline-variant capitalize">Medical Staff</span>;
      case 'shelter':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 capitalize">Shelter</span>;
      case 'supply':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200 capitalize">Supply Relief</span>;
      case 'volunteer_group':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 capitalize">Volunteer Group</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-surface-container-high text-on-surface-variant border border-outline-variant capitalize">{labels[t] || t}</span>;
    }
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

  const isAdmin = user && user.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">inventory_2</span>
          </div>
          <div>
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-background tracking-tight">Resource Inventory</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Manage ambulances, rescue assets, shelters, and dispatch units</p>
          </div>
        </div>

        {/* Add resource button (Admin only) */}
        {isAdmin && (
          <Link
            to="/dashboard/resources/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 font-label-md text-label-md font-bold text-on-primary bg-primary hover:bg-primary/95 rounded-lg shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Add Resource</span>
          </Link>
        )}
      </div>

      {/* Search and Filters Panel */}
      <div className="bg-surface border border-outline-variant rounded-xl p-4 md:p-6 space-y-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input
              type="text"
              placeholder="Search by resource name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-10 pr-4 py-2.5 text-body-md text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 font-label-md text-label-md text-on-surface font-semibold bg-surface border border-outline-variant hover:bg-surface-container transition-colors rounded-lg"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-outline-variant">
          <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant/70 mr-2">
            <span className="material-symbols-outlined text-[16px]">filter_list</span>
            <span>Filters:</span>
          </div>

          {/* Type Filter */}
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="bg-surface border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
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
            className="bg-surface border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
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
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <span className="font-body-sm text-body-sm text-on-surface-variant">Loading resources...</span>
        </div>
      ) : error ? (
        <div className="bg-error-container border border-error rounded-xl p-6 text-center">
          <p className="font-label-lg text-label-lg text-on-error-container font-semibold">{error}</p>
          <button
            onClick={fetchResourcesData}
            className="mt-3 text-xs text-primary hover:underline inline-flex items-center gap-1.5 font-semibold"
          >
            <span className="material-symbols-outlined text-[14px]">refresh</span> Try Again
          </button>
        </div>
      ) : resources.length === 0 ? (
        <div className="p-8 bg-surface border border-outline-variant rounded-xl flex flex-col justify-center items-center text-center min-h-[300px] shadow-sm">
          <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant mb-4">
            <span className="material-symbols-outlined text-[28px]">inventory_2</span>
          </div>
          <h2 className="text-lg font-semibold text-on-surface mb-1">No Resources Found</h2>
          <p className="text-sm text-on-surface-variant max-w-sm">
            {search || type || status
              ? "No items match your filters. Try relaxing filters or search terms."
              : "No emergency resources have been registered yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Table Container */}
          <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-low">
                    <th className="p-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">Resource Name</th>
                    <th className="p-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">Type</th>
                    <th className="p-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">Status</th>
                    <th className="p-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">Capacity</th>
                    <th className="p-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">Address / Location</th>
                    <th className="p-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">Contact</th>
                    <th className="p-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">Created Date</th>
                    <th className="p-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/60 bg-surface-container-lowest">
                  {resources.map((resource) => (
                    <tr key={resource._id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-on-surface text-sm">{resource.name}</div>
                        <div className="text-xs text-on-surface-variant max-w-xs mt-0.5 truncate">{resource.description || 'No description provided'}</div>
                        {resource.assignedIncident && (
                          <div className="text-[10px] text-primary mt-1 font-semibold truncate max-w-xs flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px] font-bold">assignment</span>
                            <span>Assigned: {resource.assignedIncident.title} ({resource.assignedIncident.status})</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4">{getTypeBadge(resource.type)}</td>
                      <td className="p-4">{getStatusBadge(resource.status)}</td>
                      <td className="p-4 text-sm text-on-surface font-semibold">{resource.capacity}</td>
                      <td className="p-4 max-w-xs">
                        <div className="text-sm text-on-surface truncate">{resource.currentLocation?.address}</div>
                      </td>
                      <td className="p-4 text-xs">
                        <div className="text-on-surface font-semibold">{resource.contactPerson || 'None'}</div>
                        <div className="text-on-surface-variant mt-0.5">{resource.contactNumber || ''}</div>
                      </td>
                      <td className="p-4 text-xs text-on-surface-variant">
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
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-surface-container-high border border-outline-variant rounded-lg transition"
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                            <span>View</span>
                          </Link>

                          {isAdmin && (
                            <>
                              <Link
                                  to={`/dashboard/resources/${resource._id}/edit`}
                                  className="inline-flex items-center justify-center p-1.5 text-on-surface hover:bg-surface-container-high border border-outline-variant rounded-lg transition"
                                >
                                  <span className="material-symbols-outlined text-[16px]">edit</span>
                              </Link>
                              <button
                                onClick={() => handleDelete(resource._id, resource.name, !!resource.assignedIncident)}
                                className="inline-flex items-center justify-center p-1.5 text-error hover:bg-error-container border border-outline-variant rounded-lg transition"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
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
              <span className="text-xs text-on-surface-variant">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  className="px-3 py-1.5 text-xs font-semibold text-on-surface bg-surface border border-outline-variant disabled:opacity-40 disabled:cursor-not-allowed rounded-lg hover:bg-surface-container transition"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  className="px-3 py-1.5 text-xs font-semibold text-on-surface bg-surface border border-outline-variant disabled:opacity-40 disabled:cursor-not-allowed rounded-lg hover:bg-surface-container transition"
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

