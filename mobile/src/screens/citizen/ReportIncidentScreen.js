import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as Location from 'expo-location';
import { createIncident } from '../../api/incidentApi';

const INCIDENT_TYPES = [
  { label: 'Fire', value: 'fire' },
  { label: 'Flood', value: 'flood' },
  { label: 'Medical Emergency', value: 'medical' },
  { label: 'Accident', value: 'accident' },
  { label: 'Crowd Hazard', value: 'crowd' },
  { label: 'Rescue Ops', value: 'rescue' },
  { label: 'Other', value: 'other' }
];

const SEVERITY_LEVELS = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Critical', value: 'critical' }
];

export default function ReportIncidentScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('other');
  const [severity, setSeverity] = useState('medium');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  // Dropdown UI expand/collapse states
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showSeverityDropdown, setShowSeverityDropdown] = useState(false);

  // Loading / Messages
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [locationSuccess, setLocationSuccess] = useState(null);
  const [accuracy, setAccuracy] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUseCurrentLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);
    setLocationSuccess(null);
    setAccuracy(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission denied. Please enter coordinates manually.');
        setLocationLoading(false);
        return;
      }

      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        setLocationError('Location services disabled. Please enter coordinates manually.');
        setLocationLoading(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (position && position.coords) {
        const { latitude: lat, longitude: lng, accuracy: acc } = position.coords;
        setLatitude(lat.toFixed(6));
        setLongitude(lng.toFixed(6));
        setAccuracy(acc);
        setLocationSuccess('Location coordinates captured.');

        // Reverse geocode via Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
            {
              headers: {
                'Accept-Language': 'en-US,en;q=0.9',
                'User-Agent': 'DisasterConnectMobile/1.0'
              }
            }
          );
          if (res.ok) {
            const data = await res.json();
            if (data.display_name) {
              setAddress(data.display_name);
            }
          }
        } catch (reverseErr) {
          console.warn('Nominatim reverse geocoding skipped/failed:', reverseErr);
        }
      } else {
        setLocationError('Failed to capture location coordinates. Enter manually.');
      }
    } catch (err) {
      console.warn('GPS Error:', err);
      setLocationError('Location services timed out. Enter coordinates manually.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!title.trim() || !description.trim() || !address.trim() || !latitude || !longitude) {
      setError('Please fill in all required fields.');
      return;
    }

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);

    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      setError('Please enter a valid Latitude between -90 and 90.');
      return;
    }

    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      setError('Please enter a valid Longitude between -180 and 180.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        type,
        severity,
        location: {
          coordinates: [lngNum, latNum], // [lng, lat] GeoJSON order
          address: address.trim()
        }
      };

      const res = await createIncident(payload);
      if (res.success) {
        setSuccess('Incident reported successfully!');
        setTitle('');
        setDescription('');
        setAddress('');
        setLatitude('');
        setLongitude('');
        setAccuracy(null);

        setTimeout(() => {
          navigation.navigate('MyReports');
        }, 1500);
      } else {
        setError(res.message || 'Failed to submit incident.');
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Submission failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Incident Information</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {success ? (
              <View style={styles.successBox}>
                <Text style={styles.successText}>{success}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Incident Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Chemical leak in warehouse"
                placeholderTextColor="#94A3B8"
                value={title}
                onChangeText={setTitle}
                maxLength={120}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Provide a detailed description of the emergency..."
                placeholderTextColor="#94A3B8"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                maxLength={2000}
                textAlignVertical="top"
              />
            </View>

            {/* Custom Accordion Dropdown for Incident Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Incident Type *</Text>
              <TouchableOpacity
                style={styles.dropdownToggle}
                onPress={() => {
                  setShowTypeDropdown(!showTypeDropdown);
                  setShowSeverityDropdown(false);
                }}
              >
                <Text style={styles.dropdownValue}>
                  {INCIDENT_TYPES.find((t) => t.value === type)?.label || 'Select Type'}
                </Text>
                <Text style={styles.dropdownArrow}>{showTypeDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {showTypeDropdown && (
                <View style={styles.dropdownMenu}>
                  {INCIDENT_TYPES.map((t) => (
                    <TouchableOpacity
                      key={t.value}
                      style={[styles.dropdownItem, type === t.value && styles.activeItem]}
                      onPress={() => {
                        setType(t.value);
                        setShowTypeDropdown(false);
                      }}
                    >
                      <Text style={[styles.dropdownItemText, type === t.value && styles.activeItemText]}>
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Custom Accordion Dropdown for Severity */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Severity Level *</Text>
              <TouchableOpacity
                style={styles.dropdownToggle}
                onPress={() => {
                  setShowSeverityDropdown(!showSeverityDropdown);
                  setShowTypeDropdown(false);
                }}
              >
                <Text style={styles.dropdownValue}>
                  {SEVERITY_LEVELS.find((s) => s.value === severity)?.label || 'Select Severity'}
                </Text>
                <Text style={styles.dropdownArrow}>{showSeverityDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {showSeverityDropdown && (
                <View style={styles.dropdownMenu}>
                  {SEVERITY_LEVELS.map((s) => (
                    <TouchableOpacity
                      key={s.value}
                      style={[styles.dropdownItem, severity === s.value && styles.activeItem]}
                      onPress={() => {
                        setSeverity(s.value);
                        setShowSeverityDropdown(false);
                      }}
                    >
                      <Text style={[styles.dropdownItemText, severity === s.value && styles.activeItemText]}>
                        {s.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Incident Location</Text>

            {/* Use current location trigger */}
            <View style={styles.locationTriggerRow}>
              <TouchableOpacity
                style={[styles.locationBtn, locationLoading && styles.disabledBtn]}
                onPress={handleUseCurrentLocation}
                disabled={locationLoading}
              >
                {locationLoading ? (
                  <ActivityIndicator color="#2563EB" size="small" />
                ) : (
                  <Text style={styles.locationBtnText}>📍 Use Current Location</Text>
                )}
              </TouchableOpacity>

              {accuracy !== null && (
                <View style={styles.accuracyTag}>
                  <Text style={styles.accuracyTagText}>±{Math.round(accuracy)}m</Text>
                </View>
              )}
            </View>

            {locationSuccess ? (
              <View style={styles.miniSuccessBox}>
                <Text style={styles.miniSuccessText}>✓ {locationSuccess}</Text>
              </View>
            ) : null}

            {locationError ? (
              <View style={styles.miniErrorBox}>
                <Text style={styles.miniErrorText}>⚠️ {locationError}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Street 40, Block B, Main Market"
                placeholderTextColor="#94A3B8"
                value={address}
                onChangeText={setAddress}
              />
            </View>

            {/* Editable Lat/Lng fields */}
            <View style={styles.coordinateRow}>
              <View style={[styles.inputGroup, styles.coordCol]}>
                <Text style={styles.label}>Latitude *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 23.2599"
                  placeholderTextColor="#94A3B8"
                  value={latitude}
                  onChangeText={setLatitude}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, styles.coordCol]}>
                <Text style={styles.label}>Longitude *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 77.4126"
                  placeholderTextColor="#94A3B8"
                  value={longitude}
                  onChangeText={setLongitude}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.noteText}>
              Privacy Note: Your location is used only for this incident report and command response.
            </Text>

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => navigation.navigate('CitizenHome')}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSubmit}
                disabled={loading || !!success}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Submit Report</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  flex: {
    flex: 1,
  },
  container: {
    padding: 16,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '500',
  },
  successBox: {
    backgroundColor: '#D1FAE5',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  successText: {
    color: '#065F46',
    fontSize: 14,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0F172A',
  },
  textArea: {
    height: 100,
  },
  dropdownToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownValue: {
    fontSize: 15,
    color: '#0F172A',
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#64748B',
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  activeItem: {
    backgroundColor: '#EFF6FF',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#475569',
  },
  activeItemText: {
    color: '#2563EB',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  locationTriggerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationBtn: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  locationBtnText: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 14,
  },
  accuracyTag: {
    backgroundColor: '#D1FAE5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginLeft: 12,
  },
  accuracyTagText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '600',
  },
  miniSuccessBox: {
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  miniSuccessText: {
    color: '#047857',
    fontSize: 12,
    fontWeight: '500',
  },
  miniErrorBox: {
    backgroundColor: '#FFFBEB',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  miniErrorText: {
    color: '#B45309',
    fontSize: 12,
    fontWeight: '500',
  },
  coordinateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  coordCol: {
    flex: 1,
  },
  noteText: {
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic',
    lineHeight: 16,
    marginBottom: 24,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  cancelBtn: {
    flex: 1,
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '600',
  },
  submitBtn: {
    flex: 2,
    backgroundColor: '#DC2626', // Red Emergency CTA
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
