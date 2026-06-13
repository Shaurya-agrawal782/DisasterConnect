import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { getIncidentById, updateIncidentStatus } from '../../api/incidentApi';
import { formatDateTime, getStatusColor, getSeverityColor, getIncidentTypeLabel } from '../../utils/format';

const getAllowedTransitions = (currentStatus) => {
  const transitions = {
    reported: ['verified', 'assigned'],
    verified: ['assigned', 'in-progress'],
    assigned: ['in-progress', 'resolved'],
    'in-progress': ['resolved'],
    resolved: [],
    closed: []
  };
  return transitions[currentStatus?.toLowerCase()] || [];
};

const getStatusLabel = (status) => {
  const labels = {
    reported: 'Reported',
    verified: 'Verified',
    assigned: 'Assigned',
    'in-progress': 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed'
  };
  return labels[status?.toLowerCase()] || status || 'Unknown';
};

export default function ResponderIncidentDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Status update states
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const fetchIncidentDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getIncidentById(id);
      if (res && res.success && res.data && res.data.incident) {
        setIncident(res.data.incident);
        // Pre-select first eligible status
        const eligible = getAllowedTransitions(res.data.incident.status);
        setSelectedStatus(eligible.length > 0 ? eligible[0] : '');
      } else {
        setError('Failed to load incident details.');
      }
    } catch (err) {
      console.error('Fetch responder details error:', err);
      const msg = err.response?.data?.message || err.message || 'Error fetching incident details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidentDetails();
  }, [id]);

  const handleStatusUpdate = async () => {
    setUpdateError('');
    setUpdateSuccess('');

    if (!selectedStatus) {
      setUpdateError('Please select a target status.');
      return;
    }

    setUpdating(true);
    try {
      const payload = {
        status: selectedStatus,
        note: statusNote.trim() || undefined
      };

      const res = await updateIncidentStatus(id, payload);
      if (res.success) {
        setUpdateSuccess('Status updated successfully!');
        setStatusNote('');
        
        // Wait and refetch details
        setTimeout(async () => {
          setUpdateSuccess('');
          await fetchIncidentDetails();
        }, 1500);
      } else {
        setUpdateError(res.message || 'Failed to update status.');
      }
    } catch (err) {
      console.error('Update status error:', err);
      const msg = err.response?.data?.message || err.message || 'Status transition rejected.';
      setUpdateError(msg);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading dispatch parameters...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !incident) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error || 'Incident details unavailable'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchIncidentDetails}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusStyle = getStatusColor(incident.status);
  const severityStyle = getSeverityColor(incident.severity);
  const eligibleStatuses = getAllowedTransitions(incident.status);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          
          {/* Header Dashboard */}
          <View style={styles.headerCard}>
            <Text style={styles.title}>{incident.title}</Text>
            
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: severityStyle.bg, borderColor: severityStyle.border }]}>
                <Text style={[styles.badgeText, { color: severityStyle.text }]}>
                  {incident.severity?.toUpperCase()} SEVERITY
                </Text>
              </View>

              <View style={[styles.badge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
                <Text style={[styles.badgeText, { color: statusStyle.text }]}>
                  STATUS: {incident.status?.toUpperCase()}
                </Text>
              </View>
            </View>

            {incident.ticketNumber && (
              <Text style={styles.ticketText} selectable>
                🎫 Ticket: {incident.ticketNumber}
              </Text>
            )}

            <Text style={styles.typeText}>Type: {getIncidentTypeLabel(incident.type)}</Text>
            <Text style={styles.dateText}>Last Update: {formatDateTime(incident.updatedAt)}</Text>
          </View>

          {/* Incident Description */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Case Description</Text>
            <Text style={styles.descText}>{incident.description}</Text>
          </View>

          {/* AI Triage Card */}
          {incident.aiTriage ? (
            <View style={[styles.card, styles.aiCard]}>
              <View style={styles.aiHeader}>
                <Text style={styles.aiHeaderTitle}>🤖 Gemini AI Triage Advisory</Text>
              </View>
              
              <View style={styles.aiMetricsRow}>
                <Text style={styles.aiLabel}>Advisory Priority: <Text style={styles.aiPriorityVal}>{incident.aiTriage.recommendedPriority?.toUpperCase()}</Text></Text>
                <Text style={styles.aiLabel}>Risk Score: <Text style={styles.aiRiskVal}>{incident.aiTriage.riskScore}%</Text></Text>
              </View>

              <View style={styles.aiSection}>
                <Text style={styles.aiSectionTitle}>Situation Analysis</Text>
                <Text style={styles.aiSectionText}>{incident.aiTriage.shortSummary}</Text>
              </View>

              {incident.aiTriage.immediateActions && incident.aiTriage.immediateActions.length > 0 && (
                <View style={styles.aiSection}>
                  <Text style={styles.aiSectionTitle}>Immediate Dispatch Actions</Text>
                  {incident.aiTriage.immediateActions.map((action, idx) => (
                    <Text key={idx} style={styles.aiListItem}>⚡ {action}</Text>
                  ))}
                </View>
              )}

              {incident.aiTriage.responderChecklist && incident.aiTriage.responderChecklist.length > 0 && (
                <View style={styles.aiSection}>
                  <Text style={styles.aiSectionTitle}>Field Responder Checklist</Text>
                  {incident.aiTriage.responderChecklist.map((task, idx) => (
                    <Text key={idx} style={styles.aiListItem}>☐ {task}</Text>
                  ))}
                </View>
              )}

              <Text style={styles.aiDisclaimerText}>⚠️ {incident.aiTriage.disclaimer}</Text>
            </View>
          ) : null}

          {/* Geolocation Info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Field Coordinates</Text>
            <Text style={styles.addressText}>📍 {incident.location?.address}</Text>
            
            {incident.location?.coordinates && (
              <View style={styles.coordinatesContainer}>
                <Text style={styles.coordinateText}>
                  Latitude: <Text style={styles.coordVal}>{incident.location.coordinates[1]}</Text>
                </Text>
                <Text style={styles.coordinateText}>
                  Longitude: <Text style={styles.coordVal}>{incident.location.coordinates[0]}</Text>
                </Text>
              </View>
            )}
          </View>

          {/* Assigned Supplies */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Logistics Dispatched</Text>
            {incident.assignedResources && incident.assignedResources.length > 0 ? (
              <View style={styles.resourceList}>
                {incident.assignedResources.map((res) => (
                  <View key={res._id} style={styles.resourceItem}>
                    <Text style={styles.resourceName}>📦 {res.name}</Text>
                    <Text style={styles.resourceMeta}>Type: {res.type} • Status: {res.status}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.placeholderText}>No logistics resources bound to this incident case.</Text>
            )}
          </View>

          {/* Status Update Console */}
          {eligibleStatuses.length > 0 ? (
            <View style={[styles.card, styles.updateConsole]}>
              <Text style={styles.cardTitle}>Field Action Console</Text>

              {updateError ? (
                <View style={styles.consoleErrorBox}>
                  <Text style={styles.consoleErrorText}>⚠️ {updateError}</Text>
                </View>
              ) : null}

              {updateSuccess ? (
                <View style={styles.consoleSuccessBox}>
                  <Text style={styles.consoleSuccessText}>✓ {updateSuccess}</Text>
                </View>
              ) : null}

              {/* Status Picker dropdown */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Transition Status to *</Text>
                <TouchableOpacity
                  style={styles.dropdownToggle}
                  onPress={() => setShowStatusDropdown(!showStatusDropdown)}
                >
                  <Text style={styles.dropdownValue}>
                    {getStatusLabel(selectedStatus) || 'Select status'}
                  </Text>
                  <Text style={styles.dropdownArrow}>{showStatusDropdown ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {showStatusDropdown && (
                  <View style={styles.dropdownMenu}>
                    {eligibleStatuses.map((st) => (
                      <TouchableOpacity
                        key={st}
                        style={[styles.dropdownItem, selectedStatus === st && styles.activeItem]}
                        onPress={() => {
                          setSelectedStatus(st);
                          setShowStatusDropdown(false);
                        }}
                      >
                        <Text style={[styles.dropdownItemText, selectedStatus === st && styles.activeItemText]}>
                          {getStatusLabel(st)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Status Note input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Field Log Note (Optional)</Text>
                <TextInput
                  style={styles.consoleInput}
                  placeholder="e.g. Arrived on scene, cleared blockages..."
                  placeholderTextColor="#94A3B8"
                  value={statusNote}
                  onChangeText={setStatusNote}
                />
              </View>

              <TouchableOpacity
                style={styles.updateBtn}
                onPress={handleStatusUpdate}
                disabled={updating || !selectedStatus || !!updateSuccess}
              >
                {updating ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.updateBtnText}>Update Dispatch Status</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.card, styles.infoConsole]}>
              <Text style={styles.cardTitle}>Field Action Console</Text>
              <Text style={styles.infoConsoleText}>
                Incident is currently in a resolved/closed state. No further updates are permitted.
              </Text>
            </View>
          )}

          {/* Timeline Section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Dispatches Updates Timeline</Text>
            {incident.statusHistory && incident.statusHistory.length > 0 ? (
              <View style={styles.timeline}>
                {incident.statusHistory.slice().reverse().map((history, index) => {
                  const historyStatusStyle = getStatusColor(history.status);
                  const isLatest = index === 0;

                  return (
                    <View key={index} style={styles.timelineItem}>
                      <View style={styles.timelineLeft}>
                        <View style={[styles.timelineNode, isLatest && styles.latestNode]} />
                        {index < incident.statusHistory.length - 1 && <View style={styles.timelineLine} />}
                      </View>

                      <View style={styles.timelineContent}>
                        <View style={styles.timelineHeader}>
                          <View
                            style={[
                              styles.miniBadge,
                              { backgroundColor: historyStatusStyle.bg, borderColor: historyStatusStyle.border }
                            ]}
                          >
                            <Text style={[styles.miniBadgeText, { color: historyStatusStyle.text }]}>
                              {history.status.toUpperCase()}
                            </Text>
                          </View>
                          <Text style={styles.timelineTime}>{formatDateTime(history.changedAt)}</Text>
                        </View>
                        {history.note ? (
                          <Text style={styles.timelineNote}>"{history.note}"</Text>
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.placeholderText}>No timeline history recorded.</Text>
            )}
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
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  headerCard: {
    backgroundColor: '#0F172A', // Dark Navy theme header
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 28,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  badge: {
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  typeText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
  },
  ticketText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#60A5FA',
    fontFamily: 'monospace',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1.5,
  },
  updateConsole: {
    backgroundColor: '#F8FAFC',
    borderColor: '#2563EB',
    borderWidth: 1.5,
  },
  infoConsole: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  infoConsoleText: {
    fontSize: 14,
    color: '#475569',
    fontStyle: 'italic',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  descText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },
  addressText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 12,
  },
  coordinatesContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    gap: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  coordinateText: {
    fontSize: 13,
    color: '#64748B',
  },
  coordVal: {
    color: '#0F172A',
    fontWeight: '600',
  },
  placeholderText: {
    fontSize: 14,
    color: '#94A3B8',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  resourceList: {
    gap: 12,
  },
  resourceItem: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  resourceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  resourceMeta: {
    fontSize: 12,
    color: '#64748B',
  },
  consoleErrorBox: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#EF4444',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  consoleErrorText: {
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '500',
  },
  consoleSuccessBox: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#10B981',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  consoleSuccessText: {
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
  dropdownToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
  consoleInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0F172A',
  },
  updateBtn: {
    backgroundColor: '#2563EB', // Command Blue
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  updateBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  timeline: {
    marginTop: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 64,
  },
  timelineLeft: {
    width: 24,
    alignItems: 'center',
  },
  timelineNode: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#CBD5E1',
    zIndex: 2,
    marginTop: 4,
  },
  latestNode: {
    backgroundColor: '#2563EB',
    transform: [{ scale: 1.2 }],
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 20,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  miniBadge: {
    borderWidth: 1,
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  miniBadgeText: {
    fontSize: 8,
    fontWeight: '800',
  },
  timelineTime: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  timelineNote: {
    fontSize: 13,
    color: '#475569',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  aiCard: {
    borderColor: '#3B82F6',
    borderLeftWidth: 4,
    backgroundColor: '#EFF6FF',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  aiHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  aiMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
    marginBottom: 10,
  },
  aiLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  aiPriorityVal: {
    color: '#1E40AF',
    fontWeight: '700',
  },
  aiRiskVal: {
    color: '#EF4444',
    fontWeight: '700',
  },
  aiSection: {
    marginBottom: 12,
  },
  aiSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  aiSectionText: {
    fontSize: 13,
    color: '#1E3A8A',
    lineHeight: 18,
  },
  aiListItem: {
    fontSize: 12,
    color: '#1E3A8A',
    lineHeight: 18,
    marginBottom: 2,
    paddingLeft: 4,
  },
  aiDisclaimerText: {
    fontSize: 11,
    color: '#475569',
    fontStyle: 'italic',
    lineHeight: 16,
    borderTopWidth: 1,
    borderTopColor: '#DBEAFE',
    paddingTop: 8,
    marginTop: 4,
  },
});
