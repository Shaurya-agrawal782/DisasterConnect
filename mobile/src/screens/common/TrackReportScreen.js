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
import { trackIncidentByTicket } from '../../api/trackingApi';
import { formatDateTime, getStatusColor, getSeverityColor, getIncidentTypeLabel } from '../../utils/format';

export default function TrackReportScreen({ navigation }) {
  const [ticketNumber, setTicketNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [incidentData, setIncidentData] = useState(null);

  const handleTrack = async () => {
    if (!ticketNumber.trim()) {
      setError('Please enter a ticket number.');
      setIncidentData(null);
      return;
    }
    
    setLoading(true);
    setError('');
    setIncidentData(null);

    try {
      const res = await trackIncidentByTicket(ticketNumber.trim());
      if (res && res.success && res.data) {
        setIncidentData(res.data);
      } else {
        setError(res.message || 'No report found for this ticket number.');
      }
    } catch (err) {
      console.warn('Track report error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to retrieve report status.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const statusStyle = incidentData ? getStatusColor(incidentData.status) : null;
  const severityStyle = incidentData ? getSeverityColor(incidentData.severity) : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          
          {/* Tracking Form */}
          <View style={styles.searchCard}>
            <Text style={styles.cardTitle}>Public Report Tracker</Text>
            <Text style={styles.cardSubtitle}>
              Enter a valid ticket number (e.g., DC-20260613-XXXXX) to check status updates.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="DC-YYYYMMDD-XXXXX"
              placeholderTextColor="#94A3B8"
              value={ticketNumber}
              onChangeText={setTicketNumber}
              autoCapitalize="characters"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.disabledButton]}
              onPress={handleTrack}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Search Status</Text>
              )}
            </TouchableOpacity>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            ) : null}
          </View>

          {/* Results Panel */}
          {incidentData && (
            <View style={styles.resultsCard}>
              <View style={styles.headerRow}>
                <Text style={styles.ticketTitle} selectable>🎫 Ticket: {incidentData.ticketNumber}</Text>
              </View>

              <Text style={styles.reportTitle}>{incidentData.title}</Text>
              
              <View style={styles.badgeRow}>
                {severityStyle && (
                  <View style={[styles.badge, { backgroundColor: severityStyle.bg, borderColor: severityStyle.border }]}>
                    <Text style={[styles.badgeText, { color: severityStyle.text }]}>
                      {incidentData.severity?.toUpperCase()} SEVERITY
                    </Text>
                  </View>
                )}

                {statusStyle && (
                  <View style={[styles.badge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
                    <Text style={[styles.badgeText, { color: statusStyle.text }]}>
                      STATUS: {incidentData.status?.toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.infoGroup}>
                <Text style={styles.infoLabel}>Incident Type</Text>
                <Text style={styles.infoValue}>{getIncidentTypeLabel(incidentData.type)}</Text>
              </View>

              <View style={styles.infoGroup}>
                <Text style={styles.infoLabel}>Location / Landmark</Text>
                <Text style={styles.infoValue}>📍 {incidentData.address}</Text>
              </View>

              <View style={styles.infoGroup}>
                <Text style={styles.infoLabel}>Reported At</Text>
                <Text style={styles.infoValue}>{formatDateTime(incidentData.createdAt)}</Text>
              </View>

              <View style={styles.infoGroup}>
                <Text style={styles.infoLabel}>Last Updated</Text>
                <Text style={styles.infoValue}>{formatDateTime(incidentData.updatedAt)}</Text>
              </View>

              {/* Group Case Details */}
              {incidentData.groupInfo && (
                <View style={styles.groupPanel}>
                  <View style={styles.groupHeader}>
                    <Text style={styles.groupHeaderTitle}>📁 Linked Group Case</Text>
                    <View style={styles.miniBadge}>
                      <Text style={styles.miniBadgeText}>{incidentData.groupInfo.groupNumber}</Text>
                    </View>
                  </View>
                  <Text style={styles.groupMessage}>{incidentData.groupInfo.message}</Text>
                  <Text style={styles.groupStatus}>
                    Consolidated Status: <Text style={{ fontWeight: 'bold' }}>{incidentData.groupInfo.status.toUpperCase()}</Text>
                  </Text>
                </View>
              )}

              {/* AI Safety Advice */}
              {incidentData.aiSafetyNote ? (
                <View style={styles.aiPanel}>
                  <Text style={styles.aiHeaderTitle}>🤖 Safety Instructions (AI Advisory)</Text>
                  <Text style={styles.aiSafetyText}>{incidentData.aiSafetyNote}</Text>
                </View>
              ) : null}

              {/* Public Timeline */}
              {incidentData.publicTimeline && incidentData.publicTimeline.length > 0 && (
                <View style={styles.timelineContainer}>
                  <Text style={styles.timelineHeader}>Tracking Timeline</Text>
                  {incidentData.publicTimeline.slice().reverse().map((h, i) => {
                    const hStyle = getStatusColor(h.status);
                    return (
                      <View key={i} style={styles.timelineItem}>
                        <View style={styles.timelineBullet} />
                        <View style={styles.timelineContent}>
                          <View style={[styles.miniStatusBadge, { backgroundColor: hStyle.bg, borderColor: hStyle.border }]}>
                            <Text style={{ color: hStyle.text, fontSize: 10, fontWeight: '700' }}>
                              {h.status.toUpperCase()}
                            </Text>
                          </View>
                          <Text style={styles.timelineTime}>{formatDateTime(h.changedAt)}</Text>
                          {h.note ? <Text style={styles.timelineNote}>{h.note}</Text> : null}
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {/* Go Back / Home navigation helper */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Return to Login</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A', // Navy theme
  },
  flex: {
    flex: 1,
  },
  container: {
    padding: 20,
    flexGrow: 1,
  },
  searchCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 16,
    lineHeight: 18,
  },
  input: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: '#7F1D1D',
    borderLeftWidth: 4,
    borderLeftColor: '#F87171',
    padding: 12,
    borderRadius: 6,
    marginTop: 16,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 14,
    fontWeight: '500',
  },
  resultsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  headerRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 10,
    marginBottom: 12,
  },
  ticketTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  infoGroup: {
    marginBottom: 14,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  groupPanel: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    marginBottom: 16,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  groupHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E40AF',
  },
  miniBadge: {
    backgroundColor: '#3B82F6',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  miniBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  groupMessage: {
    fontSize: 12,
    color: '#1E3A8A',
    lineHeight: 16,
    marginBottom: 8,
  },
  groupStatus: {
    fontSize: 11,
    color: '#1E40AF',
  },
  aiPanel: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  aiHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 6,
  },
  aiSafetyText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  timelineContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 16,
  },
  timelineHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    marginTop: 6,
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  miniStatusBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 4,
  },
  timelineTime: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 4,
  },
  timelineNote: {
    fontSize: 12,
    color: '#334155',
  },
  backButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  backButtonText: {
    color: '#60A5FA',
    fontSize: 15,
    fontWeight: '600',
  },
});
