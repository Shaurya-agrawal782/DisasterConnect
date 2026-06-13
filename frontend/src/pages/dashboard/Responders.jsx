import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { fadeUp, staggerContainer, listItem, panelReveal } from '../../utils/motion';
import MetricCard from '../../components/dashboard/MetricCard';
import { 
  getResponders, 
  createResponder, 
  updateResponderStatus, 
  deleteResponder 
} from '../../api/userApi';
import useAuth from '../../hooks/useAuth';

export default function Responders() {
  const { user } = useAuth();
  const [responders, setResponders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [warning, setWarning] = useState(null);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');

  // Delete safety check state
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchRespondersData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all responders, active and inactive
      const res = await getResponders({ all: true });
      if (res.success) {
        setResponders(res.data.responders || []);
      } else {
        setError(res.message || 'Failed to retrieve responder accounts.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while loading responders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRespondersData();
  }, []);

  const handleCreateResponder = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccess(null);
    setWarning(null);
    
    if (!name.trim() || !email.trim() || !password.trim()) {
      setFormError('Please enter all required fields (Name, Email, and Password).');
      return;
    }

    setFormSubmitting(true);
    try {
      const payload = { name, email, password };
      if (phone.trim()) payload.phone = phone;

      const res = await createResponder(payload);
      if (res.success) {
        setSuccess(`Responder account for "${res.data.responder.name}" created successfully.`);
        // Reset form fields
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
        // Reload list
        fetchRespondersData();
      } else {
        setFormError(res.message || 'Failed to register responder.');
      }
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Error registering new responder.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleStatus = async (targetId, currentStatus) => {
    setSuccess(null);
    setWarning(null);
    setError(null);
    setActionLoadingId(targetId);

    const newStatus = !currentStatus;
    try {
      const res = await updateResponderStatus(targetId, newStatus);
      if (res.success) {
        setSuccess(`Account status updated for ${res.data.responder.name}.`);
        if (res.data.warning) {
          setWarning(res.data.warning);
        }
        // Update list locally
        setResponders(prev => prev.map(r => r._id === targetId ? { ...r, isActive: newStatus } : r));
      } else {
        setError(res.message || 'Failed to update responder status.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error updating status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteResponder = async (targetId) => {
    setSuccess(null);
    setWarning(null);
    setError(null);
    setActionLoadingId(targetId);

    try {
      const res = await deleteResponder(targetId);
      if (res.success) {
        setSuccess('Responder account deleted successfully.');
        setConfirmDeleteId(null);
        // Reload list
        fetchRespondersData();
      } else {
        setError(res.message || 'Failed to delete responder.');
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 409) {
        // Suggested deactivate warning response
        setError(err.response?.data?.message || 'Responder cannot be deleted. Deactivate instead.');
      } else {
        setError(err.response?.data?.message || 'Error occurred while deleting responder.');
      }
      setConfirmDeleteId(null);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter responders list locally based on search input
  const filteredResponders = responders.filter(responder => {
    const nameMatch = responder.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = responder.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const phoneMatch = responder.phone?.includes(searchTerm);
    return nameMatch || emailMatch || phoneMatch;
  });

  const totalCount = responders.length;
  const activeCount = responders.filter(r => r.isActive).length;
  const inactiveCount = totalCount - activeCount;

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-outline-variant"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">badge</span>
          </div>
          <div>
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-background tracking-tight">
              Responder Management
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Create, view, deactivate, and safely remove field responder accounts
            </p>
          </div>
        </div>
      </motion.div>

      {/* Global Alert Messages */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg flex items-center gap-2 text-sm shadow-sm">
          <span className="material-symbols-outlined text-emerald-600">check_circle</span>
          <span>{success}</span>
        </div>
      )}
      {warning && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg flex items-center gap-2 text-sm shadow-sm">
          <span className="material-symbols-outlined text-amber-600">warning</span>
          <span>{warning}</span>
        </div>
      )}
      {error && (
        <div className="bg-error-container/20 border border-error text-error px-4 py-3 rounded-lg flex flex-col gap-1 text-sm shadow-sm">
          <div className="flex items-center gap-2 font-semibold">
            <span className="material-symbols-outlined">error</span>
            <span>Action Required</span>
          </div>
          <p className="pl-7">{error}</p>
        </div>
      )}

      {/* Stats Cards Section */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={listItem}>
          <MetricCard
            label="Total Responders"
            value={totalCount}
            helperText="Registered field staff"
            icon="group"
            accentStyle="text-primary"
            iconBgStyle="bg-primary/10 text-primary"
          />
        </motion.div>
        <motion.div variants={listItem}>
          <MetricCard
            label="Active Responders"
            value={activeCount}
            helperText="Available for incident dispatch"
            icon="check_circle"
            accentStyle="text-emerald-600"
            iconBgStyle="bg-emerald-50 text-emerald-600 border border-emerald-100"
          />
        </motion.div>
        <motion.div variants={listItem}>
          <MetricCard
            label="Inactive Responders"
            value={inactiveCount}
            helperText="Deactivated responder accounts"
            icon="block"
            accentStyle="text-slate-500"
            iconBgStyle="bg-slate-100 text-slate-500"
          />
        </motion.div>
      </motion.div>

      {/* Main Panel Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Create Responder Form */}
        <motion.div 
          className="lg:col-span-4"
          variants={panelReveal}
          initial="hidden"
          animate="visible"
        >
          <div className="bg-surface border border-outline-variant rounded-xl p-5 md:p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">person_add</span>
                Register Responder
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                Provision a new field worker login credential
              </p>
            </div>

            {formError && (
              <div className="bg-error-container/20 border border-error/50 text-error px-3 py-2 rounded text-xs flex items-start gap-1.5">
                <span className="material-symbols-outlined text-[16px] mt-0.5">error</span>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateResponder} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Inspector John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3.5 py-2 text-body-md text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="e.g. john.doe@disasterconnect.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3.5 py-2 text-body-md text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +1 (555) 019-2834"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3.5 py-2 text-body-md text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">
                  Password *
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3.5 py-2 text-body-md text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full bg-primary hover:bg-primary/95 text-on-primary font-bold py-2.5 px-4 rounded-lg shadow-sm transition flex items-center justify-center gap-2 text-sm"
                >
                  {formSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                      <span>Create Responder Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Right Column: Responders List/Table */}
        <motion.div 
          className="lg:col-span-8"
          variants={panelReveal}
          initial="hidden"
          animate="visible"
        >
          <div className="bg-surface border border-outline-variant rounded-xl p-5 md:p-6 shadow-sm space-y-4">
            {/* List Search & Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">groups</span>
                  Field Responder Directory
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Authorized personnel lists and active login credentials
                </p>
              </div>

              {/* Local Search Input */}
              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                <input
                  type="text"
                  placeholder="Filter by name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-8 pr-3 py-1.5 text-xs text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* List Content */}
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 min-h-[300px] space-y-3">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-on-surface-variant">Loading responder records...</span>
              </div>
            ) : filteredResponders.length === 0 ? (
              <div className="p-8 bg-surface-container-lowest border border-outline-variant/60 rounded-xl flex flex-col justify-center items-center text-center min-h-[250px]">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant mb-3">
                  <span className="material-symbols-outlined text-[24px]">support_agent</span>
                </div>
                <h3 className="text-sm font-semibold text-on-surface">No Responders Listed</h3>
                <p className="text-xs text-on-surface-variant max-w-xs mt-1">
                  {searchTerm 
                    ? "No directories match your filters. Relax your queries." 
                    : "No responder users are registered in the command system yet."}
                </p>
              </div>
            ) : (
              <div className="overflow-hidden border border-outline-variant rounded-xl shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant bg-surface-container-low">
                        <th className="p-3 text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">Responder Name</th>
                        <th className="p-3 text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">Contact</th>
                        <th className="p-3 text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">Status</th>
                        <th className="p-3 text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">Date Added</th>
                        <th className="p-3 text-[11px] font-bold tracking-wider text-on-surface-variant uppercase text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/60 bg-surface-container-lowest">
                      {filteredResponders.map((responder) => {
                        const isActionLoading = actionLoadingId === responder._id;
                        const isConfirmingDelete = confirmDeleteId === responder._id;

                        return (
                          <tr key={responder._id} className="hover:bg-surface-container-low/30 transition-colors text-xs">
                            {/* Name info */}
                            <td className="p-3">
                              <div className="font-bold text-on-surface text-sm flex items-center gap-1.5">
                                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                  <span className="material-symbols-outlined text-[14px]">person</span>
                                </div>
                                <span>{responder.name}</span>
                              </div>
                            </td>

                            {/* Contact Info */}
                            <td className="p-3">
                              <div className="text-on-surface font-medium">{responder.email}</div>
                              {responder.phone && (
                                <div className="text-[10px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                                  <span className="material-symbols-outlined text-[12px]">call</span>
                                  <span>{responder.phone}</span>
                                </div>
                              )}
                            </td>

                            {/* Status badge */}
                            <td className="p-3">
                              {responder.isActive ? (
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 inline-flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  <span>Active</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-50 text-slate-600 border border-slate-200 inline-flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                  <span>Inactive</span>
                                </span>
                              )}
                            </td>

                            {/* Date added */}
                            <td className="p-3 text-[11px] text-on-surface-variant">
                              {new Date(responder.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </td>

                            {/* Operations */}
                            <td className="p-3 text-right">
                              {isConfirmingDelete ? (
                                <div className="inline-flex flex-col items-end gap-1.5 p-2 bg-error-container/10 border border-error/20 rounded">
                                  <span className="text-[9px] text-error font-medium text-right leading-tight max-w-[170px]">
                                    Deletes responder only if they have no active incidents.
                                  </span>
                                  <div className="flex gap-1 shrink-0">
                                    <button
                                      onClick={() => handleDeleteResponder(responder._id)}
                                      disabled={isActionLoading}
                                      className="px-2 py-0.5 bg-error text-on-error text-[10px] font-semibold rounded hover:opacity-90 transition shrink-0"
                                    >
                                      {isActionLoading ? 'Deleting...' : 'Delete'}
                                    </button>
                                    <button
                                      onClick={() => setConfirmDeleteId(null)}
                                      className="px-2 py-0.5 bg-surface border border-outline-variant text-on-surface text-[10px] font-semibold rounded hover:bg-surface-container transition shrink-0"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1.5">
                                  {/* Toggle Active Status */}
                                  <button
                                    onClick={() => handleToggleStatus(responder._id, responder.isActive)}
                                    disabled={isActionLoading || responder._id === user?._id}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold border rounded-lg transition shrink-0 ${
                                      responder.isActive 
                                        ? 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100/75' 
                                        : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100/75'
                                    } ${responder._id === user?._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    title={responder._id === user?._id ? "You cannot deactivate yourself" : ""}
                                  >
                                    <span className="material-symbols-outlined text-[14px]">
                                      {responder.isActive ? 'block' : 'check_circle'}
                                    </span>
                                    <span>{responder.isActive ? 'Deactivate' : 'Activate'}</span>
                                  </button>

                                  {/* Delete Action Trigger */}
                                  <button
                                    onClick={() => setConfirmDeleteId(responder._id)}
                                    disabled={isActionLoading || responder._id === user?._id}
                                    className="p-1 text-error hover:bg-error-container/20 border border-outline-variant/60 rounded-lg transition shrink-0"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
