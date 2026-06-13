import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { getIncidentById } from '../../api/incidentApi';
import { formatDateTime, getStatusColor, getSeverityColor, getIncidentTypeLabel } from '../../utils/format';

export default function IncidentDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchIncidentDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getIncidentById(id);
      if (res && res.success && res.data && res.data.incident) {
        setIncident(res.data.incident);
      } else {
        setError('Failed to load incident details.');
      }
    } catch (err) {
      console.error('Fetch incident details error:', err);
      const msg = err.response?.data?.message || err.message || 'Error fetching incident details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidentDetails();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading incident profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !incident) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error || 'Incident not found'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchIncidentDetails}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusStyle = getStatusColor(incident.status);
  const severityStyle = getSeverityColor(incident.severity);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Header Section */}
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

          <Text style={styles.typeText}>Type: {getIncidentTypeLabel(incident.type)}</Text>
          <Text style={styles.dateText}>Reported: {formatDateTime(incident.createdAt)}</Text>
        </View>

        {/* Description Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Description</Text>
          <Text style={styles.descText}>{incident.description}</Text>
        </View>

        {/* Location Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Location Geotag</Text>
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

        {/* Assigned Responder Panel */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Emergency Responder</Text>
          {incident.assignedResponder ? (
            <View style={styles.responderInfo}>
              <Text style={styles.infoName}>👤 {incident.assignedResponder.name}</Text>
              <Text style={styles.infoEmail}>✉ {incident.assignedResponder.email}</Text>
            </View>
          ) : (
            <Text style={styles.placeholderText}>
              Waiting for dispatcher assignment. Field responder will be designated shortly.
            </Text>
          )}
        </View>

        {/* Assigned Resources Panel */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dispatched Supplies & Logistical Units</Text>
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
            <Text style={styles.placeholderText}>
              No resources dispatched yet. Supplying dispatch metrics will register here.
            </Text>
          )}
        </View>

        {/* Status History / Timeline Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Incident Updates Timeline</Text>
          {incident.statusHistory && incident.statusHistory.length > 0 ? (
            <View style={styles.timeline}>
              {incident.statusHistory.slice().reverse().map((history, index) => {
                const historyStatusStyle = getStatusColor(history.status);
                const isLatest = index === 0;

                return (
                  <View key={index} style={styles.timelineItem}>
                    {/* Node Circle */}
                    <View style={styles.timelineLeft}>
                      <View style={[styles.timelineNode, isLatest && styles.latestNode]} />
                      {index < incident.statusHistory.length - 1 && <View style={styles.timelineLine} />}
                    </View>

                    {/* Node Content */}
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
            <Text style={styles.placeholderText}>No history updates recorded.</Text>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  responderInfo: {
    gap: 6,
  },
  infoName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  infoEmail: {
    fontSize: 13,
    color: '#64748B',
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
});
