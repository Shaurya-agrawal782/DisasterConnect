import React, { useContext, useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { getMyAlerts } from '../../api/alertApi';

export default function ResponderHomeScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await getMyAlerts({ unreadOnly: 'true', limit: 1 });
      if (res && res.success && res.data && res.data.pagination) {
        setUnreadCount(res.data.pagination.totalItems || 0);
      }
    } catch (err) {
      console.warn('Unread count fetch warning:', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
    }, [fetchUnreadCount])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Info */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Text style={styles.welcomeText}>Active Responder,</Text>
            <Text style={styles.userName}>{user?.name || 'Field Operator'}</Text>
          </View>
          <View style={styles.roleTag}>
            <Text style={styles.roleText}>FIELD RESPONDER</Text>
          </View>
        </View>

        {/* Short info note */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoText}>
            Update assigned incidents from the field and log dispatch updates.
          </Text>
        </View>

        {/* Navigation Action Buttons / Cards */}
        <View style={styles.menuList}>
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => navigation.navigate('AssignedIncidents')}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Text style={styles.cardIcon}>📋</Text>
                <Text style={styles.cardTitle}>My Assigned Incidents</Text>
              </View>
            </View>
            <Text style={styles.cardDesc}>
              View details, map routing, and update status of your assigned incident cases.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => navigation.navigate('Alerts')}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Text style={styles.cardIcon}>🔔</Text>
                <Text style={styles.cardTitle}>Emergency Alerts Feed</Text>
              </View>
              {unreadCount > 0 && (
                <View style={styles.badgeOverlay}>
                  <Text style={styles.badgeOverlayText}>{unreadCount}</Text>
                </View>
              )}
            </View>
            <Text style={styles.cardDesc}>
              Read real-time disaster alerts, area warnings, and admin updates.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => navigation.navigate('ResponderProfile')}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Text style={styles.cardIcon}>👤</Text>
                <Text style={styles.cardTitle}>My Responder Profile</Text>
              </View>
            </View>
            <Text style={styles.cardDesc}>
              View your shift parameters, badges, zone limits, and safety verification details.
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>
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
    padding: 20,
  },
  profileCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  profileHeader: {
    flex: 1,
  },
  welcomeText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 2,
  },
  roleTag: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  roleText: {
    color: '#10B981', // Emerald green color for responder role
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  infoBanner: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoText: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  menuList: {
    gap: 16,
    marginBottom: 32,
  },
  menuCard: {
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
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  badgeOverlay: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeOverlayText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  logoutBtn: {
    borderColor: '#64748B',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
});

