import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getIncidents } from '../../api/incidentApi';
import { formatDateTime, getStatusColor, getSeverityColor, getIncidentTypeLabel } from '../../utils/format';

export default function MyReportsScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [ticketSearch, setTicketSearch] = useState('');

  const fetchReports = useCallback(async (showIndicator = true) => {
    if (showIndicator) setLoading(true);
    setError('');
    try {
      // getIncidents without params fetches all incidents.
      // Under Citizen RBAC role on backend, it automatically scopes to reportedBy = req.user._id.
      const res = await getIncidents();
      if (res && res.success && res.data && res.data.incidents) {
        setReports(res.data.incidents);
      } else {
        setError('Failed to load incident reports.');
      }
    } catch (err) {
      console.error('Fetch reports error:', err);
      const msg = err.response?.data?.message || err.message || 'Error loading incident history.';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch data every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchReports(true);
    }, [fetchReports])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReports(false);
  };

  const renderReportItem = ({ item }) => {
    const statusStyle = getStatusColor(item.status);
    const severityStyle = getSeverityColor(item.severity);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('IncidentDetail', { id: item._id })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={[styles.badge, { backgroundColor: severityStyle.bg, borderColor: severityStyle.border }]}>
            <Text style={[styles.badgeText, { color: severityStyle.text }]}>
              {item.severity?.toUpperCase()}
            </Text>
          </View>
        </View>

        {item.ticketNumber && (
          <Text style={styles.ticketText} selectable>🎫 {item.ticketNumber}</Text>
        )}

        <View style={styles.cardMetaRow}>
          <Text style={styles.typeText}>{getIncidentTypeLabel(item.type)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
            <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
              {item.status?.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.descText} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.addressText} numberOfLines={1}>
            📍 {item.location?.address || 'No Address'}
          </Text>
          <Text style={styles.dateText}>{formatDateTime(item.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Fetching your reports...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const searchLower = ticketSearch.trim().toLowerCase();
  const filteredReports = searchLower
    ? reports.filter(r =>
        (r.ticketNumber && r.ticketNumber.toLowerCase().includes(searchLower)) ||
        (r.title && r.title.toLowerCase().includes(searchLower))
      )
    : reports;

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item._id}
        renderItem={renderReportItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#2563EB']} />
        }
        ListHeaderComponent={
          <>
            {/* Ticket Search Bar */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by ticket number or title..."
                placeholderTextColor="#94A3B8"
                value={ticketSearch}
                onChangeText={setTicketSearch}
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📁</Text>
            <Text style={styles.emptyTitle}>
              {ticketSearch ? 'No matching reports' : 'No reports yet'}
            </Text>
            <Text style={styles.emptyDesc}>
              {ticketSearch
                ? 'Try a different ticket number or title search.'
                : 'Submit an incident to notify the command and emergency response team.'}
            </Text>
            {!ticketSearch && (
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => navigation.navigate('ReportIncident')}
              >
                <Text style={styles.emptyBtnText}>Report Incident Now</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
    flexGrow: 1,
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
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 12,
  },
  badge: {
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  cardMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  statusBadge: {
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  descText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  addressText: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
    marginRight: 16,
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  ticketText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    fontFamily: 'monospace',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: '#0F172A',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
