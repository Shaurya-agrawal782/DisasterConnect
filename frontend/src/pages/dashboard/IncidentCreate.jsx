import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createIncident } from '../../api/incidentApi';
import { analyzeReportDraft } from '../../api/aiApi';
import IncidentLocationPicker from '../../components/map/IncidentLocationPicker';
import useAuth from '../../hooks/useAuth';

export default function IncidentCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('other');
  const [severity, setSeverity] = useState('medium');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [landmark, setLandmark] = useState('');

  // AI assistant states
  const [aiDraft, setAiDraft] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [aiUnavailableMessage, setAiUnavailableMessage] = useState(null);

  const handleAnalyze = async () => {
    if (!aiDraft.trim()) {
      setAiError('Please enter some description or rough draft of what happened.');
      return;
    }
    if (aiDraft.trim().length < 10) {
      setAiError('Please describe the situation in at least 10 characters.');
      return;
    }

    setAiLoading(true);
    setAiError(null);
    setAiUnavailableMessage(null);
    setAiSuggestions(null);

    try {
      const payload = {
        text: aiDraft.trim(),
        location: address || undefined,
        coordinates: (latitude && longitude) ? {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude)
        } : undefined
      };

      const res = await analyzeReportDraft(payload);
      if (res.success) {
        setAiSuggestions(res.data);
      } else {
        setAiUnavailableMessage(res.message || 'AI Report Assistant is currently unavailable.');
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Failed to analyze the report draft.';
      setAiError(errMsg);
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplySuggestions = () => {
    if (!aiSuggestions) return;
    setTitle(aiSuggestions.suggestedTitle || '');
    setDescription(aiSuggestions.improvedDescription || '');
    setType(aiSuggestions.suggestedType || 'other');
    setSeverity(aiSuggestions.suggestedSeverity || 'medium');
    setAiSuggestions(null);
    setAiDraft('');
  };

  // Location/Geotagging states
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [locationSuccess, setLocationSuccess] = useState(null);
  const [accuracy, setAccuracy] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successTicket, setSuccessTicket] = useState(null);

  // Reverse Geocoding helper using OpenStreetMap Nominatim
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9',
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.display_name) {
          setAddress(data.display_name);
        }
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err);
    }
  };

  const handlePositionChange = (lat, lng) => {
    setLatitude(lat.toFixed(6));
    setLongitude(lng.toFixed(6));
    setLocationSuccess('Location updated from map picker.');
    setLocationError(null);
    reverseGeocode(lat, lng);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setLocationLoading(true);
    setLocationError(null);
    setLocationSuccess(null);
    setAccuracy(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng, accuracy: acc } = position.coords;
        setLatitude(lat.toFixed(6));
        setLongitude(lng.toFixed(6));
        setAccuracy(acc);
        setLocationLoading(false);
        setLocationSuccess('Location captured. You can adjust the marker if needed.');
        reverseGeocode(lat, lng);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setLocationLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setLocationError('Location permission is required to submit an incident report. Please allow location access and try again.');
            break;
          default:
            setLocationError('Unable to fetch current location. Please try again in an open area or enable location services.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate fields
    if (!title.trim() || !description.trim()) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    if (!latitude || !longitude) {
      setError('Current location is required to report an incident.');
      setLoading(false);
      return;
    }

    if (!isAdmin && !landmark.trim()) {
      setError('Please enter a landmark or nearby place to help responders locate the incident.');
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
      const finalAddress = !isAdmin && landmark.trim()
        ? `${landmark.trim()} — Detected: ${address.trim()}`
        : address.trim();

      // Assemble payload with coordinate order [longitude, latitude]
      const payload = {
        title: title.trim(),
        description: description.trim(),
        type,
        severity,
        location: {
          coordinates: [lngNum, latNum], // [lng, lat]
          address: finalAddress
        }
      };

      const res = await createIncident(payload);
      if (res.success) {
        const ticket = res.data?.incident?.ticketNumber || null;
        setSuccessTicket(ticket);
        // Scroll to top so user sees the success banner
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

          {/* Success Banner with Ticket */}
          {successTicket && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-3 text-left">
              <div className="flex items-center gap-2 text-emerald-800">
                <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                <span className="font-bold text-base">Incident Reported Successfully!</span>
              </div>
              <p className="text-sm text-emerald-700">
                Your incident has been submitted and is now in the command queue. Save your ticket number to track its status publicly.
              </p>
              <div className="bg-white border border-emerald-200 rounded-lg px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-0.5">Your Ticket Number</div>
                  <div className="font-mono text-xl font-extrabold text-emerald-800 select-all">{successTicket}</div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(successTicket)}
                    className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded text-xs font-bold transition flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">content_copy</span> Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/incidents')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition"
                  >
                    Go to My Reports
                  </button>
                </div>
              </div>
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

          {/* AI Report Assistant Helper Card */}
          <div className="bg-surface-container border border-outline-variant/60 rounded-xl p-5 space-y-4 text-left">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">psychology</span>
              <h3 className="font-title-medium text-on-surface font-bold">AI Report Assistant</h3>
            </div>
            <p className="text-body-sm text-on-surface-variant">
              Type what happened in your own words (e.g. Hindi, English, Hinglish). AI will suggest title, category, severity, and safety tips.
            </p>

            <div className="space-y-2">
              <textarea
                rows={2}
                placeholder="e.g. main gate ke pass bahut bheed hai log dhakka de rahe hain kuch log gir gaye hain"
                value={aiDraft}
                onChange={(e) => setAiDraft(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-body-md text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={aiLoading}
                className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-label-md text-label-md font-bold transition flex items-center gap-2 disabled:opacity-50"
              >
                {aiLoading ? (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                )}
                <span>Analyze with AI</span>
              </button>
              
              {aiSuggestions && (
                <button
                  type="button"
                  onClick={() => {
                    setAiSuggestions(null);
                    setAiDraft('');
                  }}
                  className="text-body-sm text-primary hover:underline font-semibold"
                >
                  Clear suggestions
                </button>
              )}
            </div>

            {/* AI Error message */}
            {aiError && (
              <div className="text-xs text-error font-medium bg-error-container/40 border border-error/20 p-2.5 rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{aiError}</span>
              </div>
            )}

            {/* AI Unavailable message */}
            {aiUnavailableMessage && (
              <div className="text-xs text-on-surface-variant font-medium bg-surface-container-high border border-outline-variant/60 p-2.5 rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary">info</span>
                <span>{aiUnavailableMessage}</span>
              </div>
            )}

            {/* AI Suggestions Preview */}
            {aiSuggestions && (
              <div className="bg-surface border border-primary/20 rounded-lg p-4 space-y-4 shadow-sm animate-fade-in">
                <div className="border-b border-outline-variant/60 pb-2 flex justify-between items-center">
                  <span className="text-xs font-bold text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">auto_awesome</span> AI Suggestion ({aiSuggestions.confidence} confidence)
                  </span>
                  <span className="text-[10px] text-on-surface-variant italic">Advisory suggestions</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-on-surface-variant block mb-0.5">Suggested Title:</span>
                    <span className="text-on-surface font-bold text-body-sm">{aiSuggestions.suggestedTitle}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-on-surface-variant block mb-0.5">Suggested Type:</span>
                    <span className="text-on-surface font-bold text-body-sm capitalize">{aiSuggestions.suggestedType}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-on-surface-variant block mb-0.5">Suggested Severity:</span>
                    <span className="text-on-surface font-bold text-body-sm capitalize">{aiSuggestions.suggestedSeverity}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-on-surface-variant text-xs block">Improved Description:</span>
                  <p className="text-body-sm text-on-surface bg-surface-container-low p-2.5 rounded border border-outline-variant/40 leading-relaxed">
                    {aiSuggestions.improvedDescription}
                  </p>
                </div>

                {aiSuggestions.missingQuestions && aiSuggestions.missingQuestions.length > 0 && (
                  <div className="space-y-1">
                    <span className="font-semibold text-on-surface-variant text-xs block">Please provide detail on:</span>
                    <ul className="list-disc list-inside text-body-sm text-on-surface space-y-0.5 ml-1">
                      {aiSuggestions.missingQuestions.map((q, idx) => (
                        <li key={idx} className="leading-normal">{q}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiSuggestions.citizenSafetyTips && aiSuggestions.citizenSafetyTips.length > 0 && (
                  <div className="bg-primary/5 border border-primary/10 p-3 rounded-lg space-y-1">
                    <span className="font-semibold text-primary text-xs flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">security</span> Citizen Safety Tips:
                    </span>
                    <ul className="list-disc list-inside text-body-sm text-on-surface-variant space-y-0.5 ml-1">
                      {aiSuggestions.citizenSafetyTips.map((tip, idx) => (
                        <li key={idx} className="leading-normal">{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="text-[10px] text-on-surface-variant/80 italic flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">info</span>
                  <span>{aiSuggestions.disclaimer}</span>
                </div>

                <div className="flex gap-2 pt-2 border-t border-outline-variant/60">
                  <button
                    type="button"
                    onClick={handleApplySuggestions}
                    className="px-4 py-2 bg-primary text-on-primary rounded font-label-md text-label-md font-bold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    Apply Suggestions
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiSuggestions(null)}
                    className="px-4 py-2 border border-outline-variant rounded font-label-md text-label-md text-on-surface font-semibold hover:bg-surface-container transition-colors"
                  >
                    Keep Manual Entry
                  </button>
                </div>
              </div>
            )}
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

          {/* Incident Location Section */}
          <div className="space-y-4 pt-4 border-t border-outline-variant/60 text-left">
            <div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Incident Location</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Use your current location or select the incident point on the map. Coordinates can still be edited manually.
              </p>
            </div>

            {/* Geolocation Button and Messages */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={locationLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/15 text-primary rounded-lg font-label-md text-label-md font-bold transition disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">my_location</span>
                <span>{locationLoading ? 'Detecting location...' : 'Use Current Location'}</span>
              </button>

              {accuracy !== null && (
                <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100">
                  Accuracy: ±{Math.round(accuracy)}m
                </span>
              )}
            </div>

            {locationSuccess && (
              <div className="text-xs text-emerald-600 font-medium bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>{locationSuccess}</span>
              </div>
            )}

            {locationError && (
              <div className="text-xs text-error font-medium bg-error-container/40 border border-error/20 p-2.5 rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{locationError}</span>
              </div>
            )}

            {/* Map Picker */}
            {isAdmin ? (
              <IncidentLocationPicker
                latitude={latitude}
                longitude={longitude}
                onPositionChange={handlePositionChange}
              />
            ) : (
              <div className="bg-surface-container border border-outline-variant/60 rounded-xl p-4 text-xs text-on-surface-variant italic">
                Interactive map picker is restricted to dispatch administrators. Citizens must use live GPS location.
              </div>
            )}

            {/* Landmark / Nearby Place */}
            <div className="space-y-2">
              <label className="block font-label-lg text-label-lg text-on-surface font-semibold">
                Landmark / Nearby Place {!isAdmin && '*'}
              </label>
              <input
                type="text"
                required={!isAdmin}
                placeholder="Example: Main gate, near parking area, Block A entrance"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-body-md text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
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
                readOnly={!isAdmin}
                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-body-md text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors read-only:opacity-75 read-only:bg-surface-container-low"
              />
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block font-label-lg text-label-lg text-on-surface font-semibold">Latitude *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 23.2599"
                  value={latitude}
                  onChange={(e) => isAdmin && setLatitude(e.target.value)}
                  readOnly={!isAdmin}
                  onBlur={(e) => {
                    if (!isAdmin) return;
                    const latNum = parseFloat(e.target.value);
                    const lngNum = parseFloat(longitude);
                    if (!isNaN(latNum) && latNum >= -90 && latNum <= 90 && !isNaN(lngNum) && lngNum >= -180 && lngNum <= 180) {
                      reverseGeocode(latNum, lngNum);
                    }
                  }}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-body-md text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors read-only:opacity-75 read-only:bg-surface-container-low"
                />
                <span className="text-[11px] font-label-sm text-on-surface-variant/60 block">
                  {isAdmin ? "Values between -90 and 90. Auto-filled from your location or map selection." : "Auto-filled from GPS sensor location."}
                </span>
              </div>

              <div className="space-y-2">
                <label className="block font-label-lg text-label-lg text-on-surface font-semibold">Longitude *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 77.4126"
                  value={longitude}
                  onChange={(e) => isAdmin && setLongitude(e.target.value)}
                  readOnly={!isAdmin}
                  onBlur={(e) => {
                    if (!isAdmin) return;
                    const latNum = parseFloat(latitude);
                    const lngNum = parseFloat(e.target.value);
                    if (!isNaN(latNum) && latNum >= -90 && latNum <= 90 && !isNaN(lngNum) && lngNum >= -180 && lngNum <= 180) {
                      reverseGeocode(latNum, lngNum);
                    }
                  }}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-body-md text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors read-only:opacity-75 read-only:bg-surface-container-low"
                />
                <span className="text-[11px] font-label-sm text-on-surface-variant/60 block">
                  {isAdmin ? "Values between -180 and 180. Auto-filled from your location or map selection." : "Auto-filled from GPS sensor location."}
                </span>
              </div>
            </div>

            {/* Privacy/Product Note */}
            <div className="pt-2 text-[11px] text-on-surface-variant/60 italic flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">info</span>
              <span>Your exact location is used only for this incident report and command response.</span>
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
