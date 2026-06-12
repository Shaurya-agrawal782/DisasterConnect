import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createResource, getResourceById, updateResource } from '../../api/resourceApi';

export default function ResourceForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState('other');
  const [status, setStatus] = useState('available');
  const [capacity, setCapacity] = useState('1');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState(null);

  // Load existing details in edit mode
  useEffect(() => {
    if (isEditMode) {
      const loadResource = async () => {
        setFetching(true);
        setError(null);
        try {
          const res = await getResourceById(id);
          if (res.success) {
            const r = res.data.resource;
            setName(r.name);
            setType(r.type);
            setStatus(r.status);
            setCapacity(r.capacity?.toString() || '1');
            setAddress(r.currentLocation?.address || '');
            // coordinates[1] is Latitude, coordinates[0] is Longitude
            setLatitude(r.currentLocation?.coordinates?.[1]?.toString() || '');
            setLongitude(r.currentLocation?.coordinates?.[0]?.toString() || '');
            setContactPerson(r.contactPerson || '');
            setContactNumber(r.contactNumber || '');
            setDescription(r.description || '');
          } else {
            setError(res.message || 'Failed to retrieve resource details.');
          }
        } catch (err) {
          console.error(err);
          setError(err.response?.data?.message || 'Error fetching resource details.');
        } finally {
          setFetching(false);
        }
      };
      loadResource();
    }
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate fields
    if (!name.trim() || !type || !status || !capacity || !address.trim() || !latitude || !longitude) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);
    const capNum = parseInt(capacity, 10);

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

    if (isNaN(capNum) || capNum < 0) {
      setError('Capacity must be a positive integer.');
      setLoading(false);
      return;
    }

    try {
      // Coordinates payload: [longitude, latitude]
      const payload = {
        name: name.trim(),
        type,
        status,
        capacity: capNum,
        currentLocation: {
          coordinates: [lngNum, latNum], // [longitude, latitude]
          address: address.trim()
        },
        contactPerson: contactPerson.trim() || undefined,
        contactNumber: contactNumber.trim() || undefined,
        description: description.trim() || undefined
      };

      let res;
      if (isEditMode) {
        res = await updateResource(id, payload);
      } else {
        res = await createResource(payload);
      }

      if (res.success) {
        navigate('/dashboard/resources');
      } else {
        setError(res.message || 'Failed to submit resource.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while saving resource.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <span className="font-body-sm text-body-sm text-on-surface-variant">Fetching resource inventory data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header with Back button */}
      <div className="flex items-center gap-4">
        <Link
          to="/dashboard/resources"
          className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors flex items-center justify-center"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">
            {isEditMode ? 'Modify Resource' : 'Register Resource'}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            {isEditMode ? 'Update existing emergency resource details' : 'Add a new asset to coordination grid'}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {error && (
            <div className="bg-error-container border border-error text-error p-4 rounded-xl text-sm flex items-start space-x-2.5">
              <span className="material-symbols-outlined text-error shrink-0">warning</span>
              <span className="text-on-error-container font-medium">{error}</span>
            </div>
          )}

          {/* Name & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block font-label-lg text-label-lg text-on-surface font-semibold">Resource Name *</label>
              <input
                type="text"
                required
                maxLength={120}
                placeholder="e.g. Bhopal Central Ambulance 01"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-body-md text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-label-lg text-label-lg text-on-surface font-semibold">Resource Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="ambulance">Ambulance</option>
                <option value="fire_truck">Fire Truck</option>
                <option value="rescue_team">Rescue Team</option>
                <option value="medical">Medical Staff</option>
                <option value="shelter">Shelter</option>
                <option value="supply">Supply Relief</option>
                <option value="volunteer_group">Volunteer Group</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Status & Capacity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block font-label-lg text-label-lg text-on-surface font-semibold">Status *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="available">Available</option>
                <option value="assigned">Assigned</option>
                <option value="busy">Busy</option>
                <option value="maintenance">Maintenance</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block font-label-lg text-label-lg text-on-surface font-semibold">Capacity / Crew Size *</label>
              <input
                type="number"
                min="0"
                required
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-body-md text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
          </div>

          {/* Location details */}
          <div className="space-y-2">
            <label className="block font-label-lg text-label-lg text-on-surface font-semibold">Location Address *</label>
            <input
              type="text"
              required
              placeholder="e.g. MP Nagar Fire Station, Bhopal"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-body-md text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          {/* Lat / Lng Coordinates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block font-label-lg text-label-lg text-on-surface font-semibold">Latitude *</label>
              <input
                type="text"
                required
                placeholder="e.g. 23.2337"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-body-md text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-label-lg text-label-lg text-on-surface font-semibold">Longitude *</label>
              <input
                type="text"
                required
                placeholder="e.g. 77.4302"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-body-md text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-outline-variant">
            <div className="space-y-2">
              <label className="block font-label-lg text-label-lg text-on-surface font-semibold">Contact Person (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Officer In-Charge"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-body-md text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-label-lg text-label-lg text-on-surface font-semibold">Contact Number (Optional)</label>
              <input
                type="text"
                placeholder="e.g. +91 98765 XXXXX"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-body-md text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block font-label-lg text-label-lg text-on-surface font-semibold">Description (Optional)</label>
            <textarea
              rows={3}
              placeholder="e.g. Details regarding active equipment, emergency response capability..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-body-md text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          {/* Submit buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-outline-variant">
            <Link
              to="/dashboard/resources"
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
              <span>{isEditMode ? 'Save Changes' : 'Register Asset'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
