import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';

// Import Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import LoadingScreen from '../screens/common/LoadingScreen';
import AlertsScreen from '../screens/common/AlertsScreen';
import TrackReportScreen from '../screens/common/TrackReportScreen';
import CitizenHomeScreen from '../screens/citizen/CitizenHomeScreen';
import ReportIncidentScreen from '../screens/citizen/ReportIncidentScreen';
import MyReportsScreen from '../screens/citizen/MyReportsScreen';
import IncidentDetailScreen from '../screens/citizen/IncidentDetailScreen';
import ResponderHomeScreen from '../screens/responder/ResponderHomeScreen';
import AssignedIncidentsScreen from '../screens/responder/AssignedIncidentsScreen';
import ResponderIncidentDetailScreen from '../screens/responder/ResponderIncidentDetailScreen';
import ResponderProfileScreen from '../screens/responder/ResponderProfileScreen';
import AdminMobileNoticeScreen from '../screens/admin/AdminMobileNoticeScreen';

const Stack = createNativeStackNavigator();

const defaultHeaderOptions = {
  headerStyle: {
    backgroundColor: '#0F172A', // Dark Navy
  },
  headerTintColor: '#FFFFFF', // White text
  headerTitleStyle: {
    fontWeight: '700',
  },
};

export default function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={defaultHeaderOptions}>
      {!user ? (
        // Auth flow
        <>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ title: 'DisasterConnect Login', headerShown: false }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen} 
            options={{ title: 'Create Account', headerShown: false }}
          />
          <Stack.Screen 
            name="TrackReport" 
            component={TrackReportScreen} 
            options={{ title: 'Track Report' }}
          />
        </>
      ) : (
        // Authenticated flow based on roles
        <>
          {user.role === 'citizen' && (
            <>
              <Stack.Screen 
                name="CitizenHome" 
                component={CitizenHomeScreen} 
                options={{ title: 'Citizen Reporting' }}
              />
              <Stack.Screen 
                name="ReportIncident" 
                component={ReportIncidentScreen} 
                options={{ title: 'Report Incident' }}
              />
              <Stack.Screen 
                name="MyReports" 
                component={MyReportsScreen} 
                options={{ title: 'My Incident Reports' }}
              />
              <Stack.Screen 
                name="IncidentDetail" 
                component={IncidentDetailScreen} 
                options={{ title: 'Incident Detail' }}
              />
              <Stack.Screen 
                name="Alerts" 
                component={AlertsScreen} 
                options={{ title: 'Notifications & Alerts' }}
              />
              <Stack.Screen 
                name="TrackReport" 
                component={TrackReportScreen} 
                options={{ title: 'Track Report' }}
              />
            </>
          )}

          {user.role === 'responder' && (
            <>
              <Stack.Screen 
                name="ResponderHome" 
                component={ResponderHomeScreen} 
                options={{ title: 'Field Response' }}
              />
              <Stack.Screen 
                name="AssignedIncidents" 
                component={AssignedIncidentsScreen} 
                options={{ title: 'Assigned Incidents' }}
              />
              <Stack.Screen 
                name="ResponderIncidentDetail" 
                component={ResponderIncidentDetailScreen} 
                options={{ title: 'Incident Detail' }}
              />
              <Stack.Screen 
                name="Alerts" 
                component={AlertsScreen} 
                options={{ title: 'Notifications & Alerts' }}
              />
              <Stack.Screen 
                name="ResponderProfile" 
                component={ResponderProfileScreen} 
                options={{ title: 'My Profile' }}
              />
            </>
          )}

          {user.role === 'admin' && (
            <Stack.Screen 
              name="AdminMobileNotice" 
              component={AdminMobileNoticeScreen} 
              options={{ title: 'Admin Notice' }}
            />
          )}
        </>
      )}
    </Stack.Navigator>
  );
}

