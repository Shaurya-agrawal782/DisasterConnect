import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fadeUp, staggerContainer, listItem, panelReveal } from '../../utils/motion';
import MetricCard from '../../components/dashboard/MetricCard';
import { 
  getResponders, 
  createResponder, 
  updateResponderStatus, 
  updateResponderProfile,
  deleteResponder 
} from '../../api/userApi';
import useAuth from '../../hooks/useAuth';

const SPECIALIZATION_OPTIONS = ['Medical', 'Fire', 'Police', 'Rescue', 'Logistics', 'Volunteer', 'Other'];
const VERIFICATION_OPTIONS = ['pending', 'verified', 'suspended'];

export default function Responders() {
  const { user } = useAuth();
  const [responders, setResponders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [warning, setWarning] = useState(null);

  // Creation form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [responderId, setResponderId] = useState('');
  const [department, setDepartment] = useState('');
  const [specialization, setSpecialization] = useState('Medical');
  const [serviceZone, setServiceZone] = useState('');
  const [shift, setShift] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [certifications, setCertifications] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Edit modal state
  const [editingResponder, setEditingResponder] = useState(null);
  const [editPhone, setEditPhone] = useState('');
  const [editResponderId, setEditResponderId] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editSpecialization, setEditSpecialization] = useState('Medical');
  const [editServiceZone, setEditServiceZone] = useState('');
  const [editShift, setEditShift] = useState('');
  const [editEmergencyContactName, setEditEmergencyContactName] = useState('');
  const [editEmergencyContactPhone, setEditEmergencyContactPhone] = useState('');
  const [editVerificationStatus, setEditVerificationStatus] = useState('verified');
  const [editCertifications, setEditCertifications] = useState('');
  const [editAdminNotes, setEditAdminNotes] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState(null);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');

  // Delete status state
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchRespondersData = async () => {
    setLoading(true);
    setError(null);
    try {
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
    
    // Validate required fields
    if (
      !name.trim() || 
      !email.trim() || 
      !password.trim() || 
      !phone.trim() || 
      !responderId.trim() || 
      !department.trim() || 
      !specialization || 
      !serviceZone.trim()
    ) {
      setFormError('Please fill out all required fields marked with *.');
      return;
    }

    setFormSubmitting(true);
    try {
      const payload = {
        name,
        email,
        password,
        phone,
        responderId,
        department,
        specialization,
        serviceZone,
        shift,
        emergencyContactName,
        emergencyContactPhone,
        certifications,
        adminNotes
      };

      const res = await createResponder(payload);
      if (res.success) {
        setSuccess(`Responder account for "${res.data.responder.name}" registered successfully.`);
        // Reset form
        setName('');
        setEmail('');
        setPassword('');
        setPhone('');
        setResponderId('');
        setDepartment('');
        setSpecialization('Medical');
        setServiceZone('');
        setShift('');
        setEmergencyContactName('');
        setEmergencyContactPhone('');
        setCertifications('');
        setAdminNotes('');
        
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
        setSuccess(`Account status updated successfully.`);
        if (res.data.warning) {
          setWarning(res.data.warning);
        }
        setResponders(prev => prev.map(r => r._id === targetId ? { ...r, isActive: newStatus } : r));
      } else {
        setError(res.message || 'Failed to update status.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error updating status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenEditModal = (responder) => {
    const profile = responder.responderProfile || {};
    setEditingResponder(responder);
    setEditPhone(responder.phone || profile.phone || '');
    setEditResponderId(profile.responderId || '');
    setEditDepartment(profile.department || '');
    setEditSpecialization(profile.specialization || 'Medical');
    setEditServiceZone(profile.serviceZone || '');
    setEditShift(profile.shift || '');
    setEditEmergencyContactName(profile.emergencyContactName || '');
    setEditEmergencyContactPhone(profile.emergencyContactPhone || '');
    setEditVerificationStatus(profile.verificationStatus || 'verified');
    setEditCertifications(profile.certifications?.join(', ') || '');
    setEditAdminNotes(profile.adminNotes || '');
    setEditError(null);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setEditError(null);
    setSuccess(null);
    setWarning(null);

    if (!editPhone.trim() || !editResponderId.trim() || !editDepartment.trim() || !editSpecialization || !editServiceZone.trim()) {
      setEditError('Please fill out all required fields.');
      return;
    }

    setEditSubmitting(true);
    try {
      const payload = {
        phone: editPhone,
        responderId: editResponderId,
        department: editDepartment,
        specialization: editSpecialization,
        serviceZone: editServiceZone,
        shift: editShift,
        emergencyContactName: editEmergencyContactName,
        emergencyContactPhone: editEmergencyContactPhone,
        verificationStatus: editVerificationStatus,
        certifications: editCertifications,
        adminNotes: editAdminNotes
      };

      const res = await updateResponderProfile(editingResponder._id, payload);
      if (res.success) {
        setSuccess(`Responder profile for "${editingResponder.name}" updated successfully.`);
        setEditingResponder(null);
        fetchRespondersData();
      } else {
        setEditError(res.message || 'Failed to update responder profile.');
      }
    } catch (err) {
      console.error(err);
      setEditError(err.response?.data?.message || 'Error updating responder profile.');
    } finally {
      setEditSubmitting(false);
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
        fetchRespondersData();
      } else {
        setError(res.message || 'Failed to delete responder.');
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 409) {
        setError(err.response?.data?.message || 'Responder cannot be deleted. Deactivate instead.');
      } else {
        setError(err.response?.data?.message || 'Error occurred while deleting responder.');
      }
      setConfirmDeleteId(null);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredResponders = responders.filter(responder => {
    const term = searchTerm.toLowerCase();
    const nameMatch = responder.name?.toLowerCase().includes(term);
    const emailMatch = responder.email?.toLowerCase().includes(term);
    const badgeMatch = responder.responderProfile?.responderId?.toLowerCase().includes(term);
    const deptMatch = responder.responderProfile?.department?.toLowerCase().includes(term);
    const specMatch = responder.responderProfile?.specialization?.toLowerCase().includes(term);
    return nameMatch || emailMatch || badgeMatch || deptMatch || specMatch;
  });

  const totalCount = responders.length;
  const activeCount = responders.filter(r => r.isActive).length;
  const inactiveCount = totalCount - activeCount;

  const getVerificationBadge = (status) => {
    // Missing status (legacy responder) should default safely to verified
    const s = status || 'verified';
    switch (s) {
      case 'verified':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px] font-bold">verified</span>
            <span>Verified</span>
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px] font-bold">pending</span>
            <span>Pending</span>
          </span>
        );
      case 'suspended':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-error-container/10 text-error border border-error/25 inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px] font-bold">cancel</span>
            <span>Suspended</span>
          </span>
        );
      default:
        return null;
    }
  };

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
              Create, verify, and monitor credentials and safety profiles for responders
            </p>
          </div>
        </div>
      </motion.div>

      {/* Global Alerts */}
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
            <span>Action Blocked</span>
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
            helperText="Ready for dispatch"
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

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Create Form */}
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
                Provision a verified responder safety profile
              </p>
            </div>

            {formError && (
              <div className="bg-error-container/20 border border-error/50 text-error px-3 py-2 rounded text-xs flex items-start gap-1.5 animate-pulse">
                <span className="material-symbols-outlined text-[16px] mt-0.5">error</span>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateResponder} className="space-y-3">
              {/* Account Credentials */}
              <div className="border-b border-outline-variant/60 pb-3 space-y-3">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Credentials</h3>
                <div>
                  <label className="block text-[10px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Officer John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Email Address *</label>
                  <input
                    type="email"
                    placeholder="e.g. j.doe@agency.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Password *</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary transition"
                    required
                  />
                </div>
              </div>

              {/* Safety & Operational Fields */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Safety Profile</h3>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Badge ID / Code *</label>
                    <input
                      type="text"
                      placeholder="e.g. DC-981"
                      value={responderId}
                      onChange={(e) => setResponderId(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Phone Number *</label>
                    <input
                      type="tel"
                      placeholder="e.g. +1 555-0109"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary transition"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Department *</label>
                    <input
                      type="text"
                      placeholder="e.g. Fire Dept"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Specialization *</label>
                    <select
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary transition"
                      required
                    >
                      {SPECIALIZATION_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Service Zone *</label>
                    <input
                      type="text"
                      placeholder="e.g. Sector-4"
                      value={serviceZone}
                      onChange={(e) => setServiceZone(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Shift Schedule</label>
                    <input
                      type="text"
                      placeholder="e.g. Day shift (08-16)"
                      value={shift}
                      onChange={(e) => setShift(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-outline-variant/60 pt-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Emergency Contact</label>
                    <input
                      type="text"
                      placeholder="Name"
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Emergency Phone</label>
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={emergencyContactPhone}
                      onChange={(e) => setEmergencyContactPhone(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Certifications (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. CPR, HAZMAT, FirstAid"
                    value={certifications}
                    onChange={(e) => setCertifications(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Admin Notes</label>
                  <textarea
                    rows="2"
                    placeholder="Operational notes, internal details..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary transition resize-none"
                  />
                </div>
              </div>

              {/* Security Warning Disclaimer */}
              <div className="bg-slate-50 border border-outline-variant rounded-lg p-2.5 flex items-start gap-2 text-[10px] text-on-surface-variant/80">
                <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">info</span>
                <span>
                  <strong>Safety Note</strong>: Responder accounts are created and verified by command admins. Do not store sensitive government IDs here.
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full bg-primary hover:bg-primary/95 text-on-primary font-bold py-2.5 px-4 rounded-lg shadow-sm transition flex items-center justify-center gap-2 text-xs"
                >
                  {formSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Profile...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                      <span>Create Safety Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Right Column: Responder List */}
        <motion.div 
          className="lg:col-span-8"
          variants={panelReveal}
          initial="hidden"
          animate="visible"
        >
          <div className="bg-surface border border-outline-variant rounded-xl p-5 md:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">groups</span>
                  Responder Registry
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Verify and configure field worker profiles and deployment states
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                <input
                  type="text"
                  placeholder="Filter by name, badge, dept..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-8 pr-3 py-1.5 text-xs text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary transition"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 min-h-[300px] space-y-3">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-on-surface-variant">Loading records...</span>
              </div>
            ) : filteredResponders.length === 0 ? (
              <div className="p-8 bg-surface-container-lowest border border-outline-variant/60 rounded-xl flex flex-col justify-center items-center text-center min-h-[250px]">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant mb-3">
                  <span className="material-symbols-outlined text-[24px]">support_agent</span>
                </div>
                <h3 className="text-sm font-semibold text-on-surface">No Responders Found</h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  Try relaxing search terms or create a responder safety profile.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden border border-outline-variant rounded-xl shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant bg-surface-container-low">
                        <th className="p-3 text-[10px] font-bold tracking-wider text-on-surface-variant uppercase">Responder</th>
                        <th className="p-3 text-[10px] font-bold tracking-wider text-on-surface-variant uppercase">Badge & Agency</th>
                        <th className="p-3 text-[10px] font-bold tracking-wider text-on-surface-variant uppercase">Role & Zone</th>
                        <th className="p-3 text-[10px] font-bold tracking-wider text-on-surface-variant uppercase">Verification</th>
                        <th className="p-3 text-[10px] font-bold tracking-wider text-on-surface-variant uppercase text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/60 bg-surface-container-lowest">
                      {filteredResponders.map((responder) => {
                        const isActionLoading = actionLoadingId === responder._id;
                        const isConfirmingDelete = confirmDeleteId === responder._id;
                        const profile = responder.responderProfile || {};

                        return (
                          <tr key={responder._id} className="hover:bg-surface-container-low/30 transition text-xs">
                            {/* Responder contact */}
                            <td className="p-3">
                              <div className="font-bold text-on-surface flex items-center gap-1.5">
                                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                  <span className="material-symbols-outlined text-[13px]">person</span>
                                </div>
                                <span>{responder.name}</span>
                              </div>
                              <div className="text-[10px] text-on-surface-variant mt-0.5 pl-7">{responder.email}</div>
                              {(responder.phone || profile.phone) && (
                                <div className="text-[9px] text-on-surface-variant mt-0.5 pl-7 flex items-center gap-0.5">
                                  <span className="material-symbols-outlined text-[10px]">call</span>
                                  <span>{responder.phone || profile.phone}</span>
                                </div>
                              )}
                            </td>

                            {/* Badge and agency */}
                            <td className="p-3">
                              {profile.responderId ? (
                                <>
                                  <div className="font-semibold text-on-surface">{profile.responderId}</div>
                                  <div className="text-[10px] text-on-surface-variant mt-0.5">{profile.department || 'N/A'}</div>
                                </>
                              ) : (
                                <span className="text-on-surface-variant/60 italic">No Profile Data</span>
                              )}
                            </td>

                            {/* Specialization and Zone */}
                            <td className="p-3">
                              {profile.specialization ? (
                                <>
                                  <div className="font-semibold text-primary inline-flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-primary"></span>
                                    <span>{profile.specialization}</span>
                                  </div>
                                  <div className="text-[10px] text-on-surface-variant mt-0.5">Zone: {profile.serviceZone || 'Global'}</div>
                                </>
                              ) : (
                                <span className="text-on-surface-variant/60 italic">N/A</span>
                              )}
                            </td>

                            {/* Verification Badges */}
                            <td className="p-3 space-y-1">
                              <div>
                                {responder.isActive ? (
                                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">Active</span>
                                ) : (
                                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-slate-50 text-slate-600 border border-slate-100">Inactive</span>
                                )}
                              </div>
                              <div>
                                {getVerificationBadge(profile.verificationStatus)}
                              </div>
                            </td>

                            {/* Table Action controls */}
                            <td className="p-3 text-right">
                              {isConfirmingDelete ? (
                                <div className="inline-flex flex-col items-end gap-1.5 p-2 bg-error-container/10 border border-error/25 rounded">
                                  <span className="text-[8px] text-error font-medium text-right leading-tight max-w-[150px]">
                                    Deletes responder only if they have no active incidents.
                                  </span>
                                  <div className="flex gap-1 shrink-0">
                                    <button
                                      onClick={() => handleDeleteResponder(responder._id)}
                                      disabled={isActionLoading}
                                      className="px-2 py-0.5 bg-error text-on-error text-[9px] font-bold rounded hover:opacity-90 transition"
                                    >
                                      {isActionLoading ? '...' : 'Delete'}
                                    </button>
                                    <button
                                      onClick={() => setConfirmDeleteId(null)}
                                      className="px-2 py-0.5 bg-surface border border-outline-variant text-on-surface text-[9px] font-bold rounded hover:bg-surface-container transition"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1">
                                  {/* Toggle Active status */}
                                  <button
                                    onClick={() => handleToggleStatus(responder._id, responder.isActive)}
                                    disabled={isActionLoading || responder._id === user?._id}
                                    className={`p-1 border rounded-lg transition shrink-0 ${
                                      responder.isActive 
                                        ? 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100/75' 
                                        : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100/75'
                                    } ${responder._id === user?._id ? 'opacity-40 cursor-not-allowed' : ''}`}
                                    title={responder._id === user?._id ? "Cannot deactivate self" : (responder.isActive ? 'Deactivate' : 'Activate')}
                                  >
                                    <span className="material-symbols-outlined text-[15px] block">
                                      {responder.isActive ? 'block' : 'check_circle'}
                                    </span>
                                  </button>

                                  {/* Edit Safety Profile */}
                                  <button
                                    onClick={() => handleOpenEditModal(responder)}
                                    disabled={isActionLoading}
                                    className="p-1 text-on-surface hover:bg-surface-container-high border border-outline-variant rounded-lg transition shrink-0"
                                    title="Edit Safety Profile"
                                  >
                                    <span className="material-symbols-outlined text-[15px] block">edit_note</span>
                                  </button>

                                  {/* Delete Trigger */}
                                  <button
                                    onClick={() => setConfirmDeleteId(responder._id)}
                                    disabled={isActionLoading || responder._id === user?._id}
                                    className="p-1 text-error hover:bg-error-container/20 border border-outline-variant/60 rounded-lg transition shrink-0"
                                    title="Delete Account"
                                  >
                                    <span className="material-symbols-outlined text-[15px] block">delete</span>
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

      {/* Edit Safety Profile Modal */}
      <AnimatePresence>
        {editingResponder && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div 
              className="bg-surface border border-outline-variant rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative flex flex-col gap-4 text-left"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b border-outline-variant/60 pb-3">
                <div>
                  <h2 className="text-base font-bold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary">edit_note</span>
                    Edit Safety Profile
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    Modify profile parameters for <strong>{editingResponder.name}</strong>
                  </p>
                </div>
                <button 
                  onClick={() => setEditingResponder(null)}
                  className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {editError && (
                <div className="bg-error-container/20 border border-error/50 text-error px-3 py-2 rounded text-xs flex items-start gap-1.5 animate-pulse">
                  <span className="material-symbols-outlined text-[16px] mt-0.5">error</span>
                  <span>{editError}</span>
                </div>
              )}

              {/* Modal Form */}
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {/* Meta details (Readonly) */}
                <div className="bg-surface-container-low border border-outline-variant/50 rounded-lg p-2.5 grid grid-cols-2 gap-2 text-[11px] text-on-surface-variant">
                  <div>
                    <span className="font-semibold">Name:</span> {editingResponder.name}
                  </div>
                  <div>
                    <span className="font-semibold">Email:</span> {editingResponder.email}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Badge ID / Code *</label>
                      <input
                        type="text"
                        value={editResponderId}
                        onChange={(e) => setEditResponderId(e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Phone Number *</label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary transition"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Department *</label>
                      <input
                        type="text"
                        value={editDepartment}
                        onChange={(e) => setEditDepartment(e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Specialization *</label>
                      <select
                        value={editSpecialization}
                        onChange={(e) => setEditSpecialization(e.target.value)}
                        className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary transition"
                        required
                      >
                        {SPECIALIZATION_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Service Zone *</label>
                      <input
                        type="text"
                        value={editServiceZone}
                        onChange={(e) => setEditServiceZone(e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Shift Schedule</label>
                      <input
                        type="text"
                        value={editShift}
                        onChange={(e) => setEditShift(e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 items-end">
                    <div className="col-span-2 grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Emergency Contact</label>
                        <input
                          type="text"
                          placeholder="Name"
                          value={editEmergencyContactName}
                          onChange={(e) => setEditEmergencyContactName(e.target.value)}
                          className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Emergency Phone</label>
                        <input
                          type="tel"
                          placeholder="Phone"
                          value={editEmergencyContactPhone}
                          onChange={(e) => setEditEmergencyContactPhone(e.target.value)}
                          className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary transition"
                        />
                      </div>
                    </div>
                    
                    {/* Verification Toggle */}
                    <div>
                      <label className="block text-[10px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Verification *</label>
                      <select
                        value={editVerificationStatus}
                        onChange={(e) => setEditVerificationStatus(e.target.value)}
                        className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary transition font-bold"
                        required
                      >
                        {VERIFICATION_OPTIONS.map(opt => (
                          <option key={opt} value={opt} className="capitalize">{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Certifications (comma-separated)</label>
                    <input
                      type="text"
                      value={editCertifications}
                      onChange={(e) => setEditCertifications(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Admin Notes</label>
                    <textarea
                      rows="2"
                      value={editAdminNotes}
                      onChange={(e) => setEditAdminNotes(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary transition resize-none"
                    />
                  </div>
                </div>

                {/* Safety Warning Disclaimer */}
                <div className="bg-slate-50 border border-outline-variant rounded-lg p-2.5 flex items-start gap-2 text-[10px] text-on-surface-variant/80">
                  <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">info</span>
                  <span>
                    <strong>Safety Note</strong>: Do not store sensitive government identity tokens (Aadhaar/PAN/SSN) in administrative profiles.
                  </span>
                </div>

                {/* Modal actions */}
                <div className="flex justify-end gap-2 border-t border-outline-variant/60 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingResponder(null)}
                    className="px-4 py-2 border border-outline-variant hover:bg-surface-container text-on-surface font-semibold text-xs rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSubmitting}
                    className="px-4 py-2 bg-primary hover:bg-primary/95 text-on-primary font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5"
                  >
                    {editSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[14px]">save</span>
                        <span>Save Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
