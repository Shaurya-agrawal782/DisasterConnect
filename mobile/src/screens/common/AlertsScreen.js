import React, { useState, useContext, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { getMyAlerts, markAlertRead, markAllAlertsRead } from '../../api/alertApi';
import { formatDateTime, getSeverityColor } from '../../utils/format';

export default function AlertsScreen() {
  const { user } = useContext(AuthContext);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Helper to check if the current user has read the alert
  const isAlertRead = useCallback((alert) => {
    if (!alert.readBy || !user?._id) return false;
    return alert.readBy.some(
      (entry) => (entry.user?._id || entry.user || entry) === user._id
    );
  }, [user?._id]);

  const fetchAlerts = useCallback(async (showIndicator = true) => {
    if (showIndicator) setLoading(true);
    setError('');
    try {
      const res = await getMyAlerts();
      if (res && res.success && res.data && res.data.alerts) {
        setAlerts(res.data.alerts);
      } else {
        setError('Failed to fetch alerts.');
      }
    } catch (err) {
      console.error('Fetch alerts error:', err);
      const msg = err.response?.data?.message || err.message || 'Error loading alerts feed.';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAlerts(true);
    }, [fetchAlerts])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAlerts(false);
  };

  const handleMarkRead = async (id) => {
    setActionLoading(true);
    try {
      const res = await markAlertRead(id);
      if (res.success && res.data && res.data.alert) {
        // Update local state directly to be fast and smooth
        setAlerts((prev) =>
          prev.map((a) => (a._id === id ? res.data.alert : a))
        );
      }
    } catch (err) {
      console.error('Mark read error:', err);
      // Soft error
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    setActionLoading(true);
    try {
      const res = await markAllAlertsRead();
      if (res.success) {
        // Refetch feed to reflect updates
        await fetchAlerts(false);
      }
    } catch (err) {
      console.error('Mark all read error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const renderFormattedMessage = (text) => {
    if (!text) return null;
    const regex = /(DC-\d{8}-\d{5}|GRP-\d{8}-[A-Za-f0-9]+)/g;
    const parts = text.split(regex);
    return (
      <Text>
        {parts.map((part, index) => {
          if (part.match(/^DC-\d{8}-\d{5}$/) || part.match(/^GRP-\d{8}-[A-Za-f0-9]+$/)) {
            return (
              <Text key={index} style={{ fontWeight: '800', color: '#1D4ED8' }}>
                {part}
              </Text>
            );
          }
          return <Text key={index}>{part}</Text>;
        })}
      </Text>
    );
  };

  const renderAlertItem = ({ item }) => {
    const read = isAlertRead(item);
    const priorityStyle = getSeverityColor(item.priority || 'medium');

    return (
      <View style={[styles.card, read ? styles.readCard : styles.unreadCard]}>
        {/* Unread blue dot indicator */}
        {!read && <View style={styles.unreadDot} />}

        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, read ? styles.readText : styles.unreadText]}>
            {item.title}
          </Text>
          <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.bg, borderColor: priorityStyle.border }]}>
            <Text style={[styles.priorityBadgeText, { color: priorityStyle.text }]}>
              {item.priority?.toUpperCase() || 'MEDIUM'}
            </Text>
          </View>
        </View>

        <Text style={[styles.messageText, read ? styles.readMutedText : styles.unreadMutedText]}>
          {renderFormattedMessage(item.message)}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>{formatDateTime(item.createdAt)}</Text>
          
          {!read && (
            <TouchableOpacity
              style={styles.markReadBtn}
              onPress={() => handleMarkRead(item._id)}
              disabled={actionLoading}
            >
              <Text style={styles.markReadBtnText}>Mark read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Role scoped header strings
  const isCitizen = user?.role === 'citizen';
  const screenTitle = isCitizen ? 'Safety Updates' : 'Field Alerts';
  const screenSubtitle = isCitizen
    ? 'Updates about your submitted reports and public safety notices.'
    : 'Assignment, status, and command updates for response work.';

  const hasUnread = alerts.some((a) => !isAlertRead(a));

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Fetching alerts feed...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={alerts}
        keyExtractor={(item) => item._id}
        renderItem={renderAlertItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#2563EB']} />
        }
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <View style={styles.titleRow}>
              <View style={styles.titleCol}>
                <Text style={styles.screenTitle}>{screenTitle}</Text>
                <Text style={styles.screenSubtitle}>{screenSubtitle}</Text>
              </View>
              {hasUnread && (
                <TouchableOpacity
                  style={styles.markAllBtn}
                  onPress={handleMarkAllRead}
                  disabled={actionLoading}
                >
                  <Text style={styles.markAllBtnText}>Mark all read</Text>
                </TouchableOpacity>
              )}
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No alerts yet</Text>
            <Text style={styles.emptyDesc}>Safety updates and emergency broadcasts will appear here.</Text>
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
  headerContainer: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  titleCol: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  markAllBtn: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  markAllBtnText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
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
    position: 'relative',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1.5,
  },
  unreadCard: {
    borderColor: '#BFDBFE', // Soft Blue border for unread alerts
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  readCard: {
    borderColor: '#E2E8F0',
    opacity: 0.8,
  },
  unreadDot: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingRight: 12, // Leave room for unread dot
  },
  cardTitle: {
    fontSize: 15,
    flex: 1,
    marginRight: 12,
  },
  unreadText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  readText: {
    fontWeight: '600',
    color: '#475569',
  },
  priorityBadge: {
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  priorityBadgeText: {
    fontSize: 8,
    fontWeight: '700',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  unreadMutedText: {
    color: '#334155',
  },
  readMutedText: {
    color: '#64748B',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  markReadBtn: {
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  markReadBtnText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 120,
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
  },
});
