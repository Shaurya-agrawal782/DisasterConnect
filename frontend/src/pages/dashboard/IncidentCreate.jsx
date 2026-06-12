import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createIncident } from '../../api/incidentApi';

export default function IncidentCreate() {
  const navigate = useNavigate();

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('other');
  const [severity, setSeverity] = useState('medium');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate fields
    if (!title.trim() || !description.trim() || !address.trim() || !latitude || !longitude) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);

    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      setError('Please enter a valid Latitude between -90 and 90.');
      setLoading(false);
      return;
    }

    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      setError('Please enter a valid Longitude between -180 and 180.');
      setLoading(false);
      return;
    }

    try {
      // Assemble payload with coordinate order [longitude, latitude]
      const payload = {
        title: title.trim(),
        description: description.trim(),
        type,
        severity,
        location: {
          coordinates: [lngNum, latNum], // [lng, lat]
          address: address.trim()
        }
      };

      const res = await createIncident(payload);
      if (res.success) {
        navigate('/dashboard/incidents');
      } else {
        setError(res.message || 'Failed to report incident.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'An error occurred while creating the incident report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back button and title */}
      <div className="flex items-center gap-4">
        <Link
          to="/dashboard/incidents"
          className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors flex items-center justify-center"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Report an Incident</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Please provide accurate details to ensure rapid response.</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Error Message */}
          {error && (
            <div className="bg-error-container border border-error text-error p-4 rounded-xl text-sm flex items-start space-x-2.5">
              <span className="material-symbols-outlined text-error shrink-0">warning</span>
              <span className="text-on-error-container font-medium">{error}</span>
            </div>
          )}

          {/* Title field */}
          <div className="space-y-2">
            <label className="block font-label-lg text-label-lg text-on-surface font-semibold">Incident Title *</label>
            <input
              type="text"
              required
              maxLength={120}
              placeholder="e.g. Chemical leak in warehouse, Road blockage"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-body-md text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          {/* Description field */}
          <div className="space-y-2">
            <label className="block font-label-lg text-label-lg text-on-surface font-semibold">Description *</label>
            <textarea
              required
              rows={4}
              maxLength={2000}
              placeholder="Provide a detailed description of the emergency status, hazards, or immediate resources required..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-body-md text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          {/* Type & Severity Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block font-label-lg text-label-lg text-on-surface font-semibold">Incident Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="fire">Fire</option>
                <option value="flood">Flood</option>
                <option value="medical">Medical</option>
                <option value="accident">Accident</option>
                <option value="crowd">Crowd</option>
                <option value="rescue">Rescue</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block font-label-lg text-label-lg text-on-surface font-semibold">Severity Level *</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Address field */}
          <div className="space-y-2">
            <label className="block font-label-lg text-label-lg text-on-surface font-semibold">Location Address *</label>
            <input
              type="text"
              required
              placeholder="e.g. Street 40, Block B, Main Market Area"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-body-md text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          {/* Coordinates (Latitude & Longitude) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block font-label-lg text-label-lg text-on-surface font-semibold">Latitude *</label>
              <input
                type="text"
                required
                placeholder="e.g. 23.2599"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-body-md text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
              <span className="text-[11px] font-label-sm text-on-surface-variant/60 block">Values between -90 and 90</span>
            </div>

            <div className="space-y-2">
              <label className="block font-label-lg text-label-lg text-on-surface font-semibold">Longitude *</label>
              <input
                type="text"
                required
                placeholder="e.g. 77.4126"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-body-md text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
              <span className="text-[11px] font-label-sm text-on-surface-variant/60 block">Values between -180 and 180</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-outline-variant">
            <Link
              to="/dashboard/incidents"
              className="px-6 py-2 border border-outline-variant rounded font-label-md text-label-md text-on-surface font-semibold hover:bg-surface-container transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-on-primary rounded font-label-md text-label-md font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading && <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>}
              <span>Submit Incident</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
