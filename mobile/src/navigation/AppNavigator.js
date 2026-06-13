import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';

// Import Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import LoadingScreen from '../screens/common/LoadingScreen';
import AlertsPlaceholderScreen from '../screens/common/AlertsPlaceholderScreen';
import CitizenHomeScreen from '../screens/citizen/CitizenHomeScreen';
import ReportIncidentScreen from '../screens/citizen/ReportIncidentScreen';
import MyReportsPlaceholderScreen from '../screens/citizen/MyReportsPlaceholderScreen';
import ResponderHomeScreen from '../screens/responder/ResponderHomeScreen';
import AssignedIncidentsPlaceholderScreen from '../screens/responder/AssignedIncidentsPlaceholderScreen';
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
                component={MyReportsPlaceholderScreen} 
                options={{ title: 'My Incident Reports' }}
              />
              <Stack.Screen 
                name="Alerts" 
                component={AlertsPlaceholderScreen} 
                options={{ title: 'Notifications & Alerts' }}
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
                name="AssignedIncidentsPlaceholder" 
                component={AssignedIncidentsPlaceholderScreen} 
                options={{ title: 'Assigned Incidents' }}
              />
              <Stack.Screen 
                name="Alerts" 
                component={AlertsPlaceholderScreen} 
                options={{ title: 'Notifications & Alerts' }}
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
