import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import * as authApi from '../../api/authApi';

export default function ResponderProfileScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [profileUser, setProfileUser] = useState(user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFreshProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.me();
      if (res && res.success && res.data && res.data.user) {
        setProfileUser(res.data.user);
      } else {
        setError('Failed to refresh profile information.');
      }
    } catch (err) {
      console.warn('Refresh profile error:', err);
      setError('Could not retrieve latest profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFreshProfile();
  }, []);

  const getVerificationBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'verified':
        return { bg: '#D1FAE5', text: '#059669', border: '#A7F3D0' };
      case 'pending':
        return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' };
      case 'rejected':
        return { bg: '#FEE2E2', text: '#DC2626', border: '#FCA5A5' };
      default:
        return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
    }
  };

  const badgeStyle = getVerificationBadgeColor(profileUser?.responderProfile?.verificationStatus);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Profile Card Header */}
        <View style={styles.headerCard}>
          <Text style={styles.avatar}>👤</Text>
          <Text style={styles.name}>{profileUser?.name || 'Responder'}</Text>
          <Text style={styles.email}>{profileUser?.email}</Text>

          <View style={styles.badgeRow}>
            <View style={[styles.badge, profileUser?.isActive ? styles.activeBadge : styles.inactiveBadge]}>
              <Text style={profileUser?.isActive ? styles.activeBadgeText : styles.inactiveBadgeText}>
                {profileUser?.isActive ? 'ACTIVE ACCOUNT' : 'INACTIVE ACCOUNT'}
              </Text>
            </View>

            {badgeStyle && (
              <View style={[styles.badge, { backgroundColor: badgeStyle.bg, borderColor: badgeStyle.border, borderWidth: 1 }]}>
                <Text style={[styles.badgeText, { color: badgeStyle.text }]}>
                  {profileUser?.responderProfile?.verificationStatus?.toUpperCase() || 'UNVERIFIED'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Fetching profile details...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchFreshProfile}>
              <Text style={styles.retryBtnText}>Retry Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Operational Info Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Operational Details</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Badge / Responder ID</Text>
                <Text style={styles.infoValue} selectable>
                  {profileUser?.responderProfile?.responderId || 'Not Set'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Department</Text>
                <Text style={styles.infoValue}>
                  {profileUser?.responderProfile?.department || 'Not Assigned'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Specialization</Text>
                <Text style={styles.infoValue}>
                  {profileUser?.responderProfile?.specialization || 'General Responder'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Service Zone</Text>
                <Text style={styles.infoValue}>
                  {profileUser?.responderProfile?.serviceZone || 'Default / All Zones'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Active Shift</Text>
                <Text style={styles.infoValue}>
                  {profileUser?.responderProfile?.shift || 'On-Call / Variable'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Primary Phone</Text>
                <Text style={styles.infoValue} selectable>
                  {profileUser?.phone || 'No Phone Registered'}
                </Text>
              </View>
            </View>

            {/* Emergency Contacts Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Emergency Contact Information</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Contact Name</Text>
                <Text style={styles.infoValue}>
                  {profileUser?.responderProfile?.emergencyContactName || 'None Designated'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Contact Phone</Text>
                <Text style={styles.infoValue} selectable>
                  {profileUser?.responderProfile?.emergencyContactPhone || 'N/A'}
                </Text>
              </View>
            </View>

            {/* Managed Account Notice */}
            <View style={styles.noticeCard}>
              <Text style={styles.noticeText}>
                🔒 Responder profiles are managed by command admins. If your specialization, badge ID, zone, or shift parameters require updates, please notify your dispatcher team.
              </Text>
            </View>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC', // light gray
  },
  container: {
    padding: 20,
    flexGrow: 1,
  },
  headerCard: {
    backgroundColor: '#0F172A', // Dark Navy
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  avatar: {
    fontSize: 50,
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  activeBadge: {
    backgroundColor: '#065F46',
  },
  activeBadgeText: {
    color: '#34D399',
    fontSize: 9,
    fontWeight: '800',
  },
  inactiveBadge: {
    backgroundColor: '#7F1D1D',
  },
  inactiveBadgeText: {
    color: '#F87171',
    fontSize: 9,
    fontWeight: '800',
  },
  centered: {
    paddingVertical: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#64748B',
    fontSize: 14,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  noticeCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  noticeText: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 18,
    textAlign: 'center',
  },
});
