import React, { useContext } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';

export default function CitizenHomeScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* User Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Text style={styles.welcomeText}>Welcome,</Text>
            <Text style={styles.userName}>{user?.name || 'Citizen'}</Text>
          </View>
          <View style={styles.roleTag}>
            <Text style={styles.roleText}>CITIZEN ACCOUNT</Text>
          </View>
        </View>

        {/* Short info note */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoText}>
            Submit reports and track updates from the response team.
          </Text>
        </View>

        {/* Primary CTA - Report Incident */}
        <TouchableOpacity
          style={styles.emergencyBtn}
          onPress={() => navigation.navigate('ReportIncident')}
        >
          <Text style={styles.emergencyBtnTitle}>🚨 REPORT INCIDENT</Text>
          <Text style={styles.emergencyBtnSubtitle}>File a new emergency report</Text>
        </TouchableOpacity>

        {/* Action Cards Grid */}
        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('MyReports')}
          >
            <Text style={styles.cardIcon}>📁</Text>
            <Text style={styles.cardTitle}>My Reports</Text>
            <Text style={styles.cardDesc}>View your submitted incident reports</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Alerts')}
          >
            <Text style={styles.cardIcon}>🔔</Text>
            <Text style={styles.cardTitle}>Alerts Feed</Text>
            <Text style={styles.cardDesc}>Safety warnings & alerts</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
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
    backgroundColor: '#F8FAFC', // light gray background
  },
  container: {
    padding: 20,
  },
  profileCard: {
    backgroundColor: '#0F172A', // Navy
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
    color: '#38BDF8', // Cyan role color
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
  emergencyBtn: {
    backgroundColor: '#DC2626', // Red Emergency CTA
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  emergencyBtnTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  emergencyBtnSubtitle: {
    color: '#FCA5A5',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIcon: {
    fontSize: 24,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
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
