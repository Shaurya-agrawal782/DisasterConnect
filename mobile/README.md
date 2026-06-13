# DisasterConnect Mobile App

This is the Expo React Native mobile client for **DisasterConnect**, designed to coordinate emergency response workflows for Citizens and Field Responders.

> [!TIP]
> **Demo Walkthrough Guide**: Check out the comprehensive [DEMO_MOBILE.md](file:///d:/projects/lnct%20hack/mobile/DEMO_MOBILE.md) for step-by-step reporting, dispatch management, alert checking instructions, demo credentials, and mobile troubleshooting.


## Current Scope (Parity Release)
- **Expo React Native Foundation**: Bootstrapped with JavaScript and React Navigation.
- **Backend Authentication Integration**: Implemented JWT Bearer token authorization using the existing backend endpoints.
- **Secure Session Persistence**: Local token storage using `@react-native-async-storage/async-storage`.
- **Role-Based Routing**: Auto-routes to dedicated layouts based on credentials (`citizen`, `responder`, `admin`).
- **AI Report Assistant**: Translates natural language drafts (English/Hinglish/Hindi) to structured incident metadata (title, category, severity, description recommendations) without altering GPS constraints.
- **Ticket Tracking**: Allows unauthenticated public status tracking by unique ticket number (e.g. `DC-YYYYMMDD-XXXXX`) without leaking reporter identity or precise GPS coordinates.
- **Smart Incident Grouping display**: Groups similar nearby reports within a 3-hour window. Displays group status, linked count warnings, location summaries, and cascaded resolution details.
- **Responder safety profile display**: Read-only profile parameters managed by command admins (department, shift, specialization, badge ID, emergency contacts).
- **GPS Incident Reporting**: Captures coordinates using `expo-location`, supports Nominatim reverse geocoding for automated address filling, and integrates manual fallback overrides.
- **Incident List & Detail Tracking**: Citizens can list their reported incidents (with RefreshControl) and view read-only detail dashboards mapping coordinates, assigned responders, dispatched resource units, and chronological status timelines.
- **Field Responder Incident Updates**: Responders can list assigned dispatches and perform field status updates (e.g. to `in-progress` or `resolved` with custom notes) adhering to backend status transition logic.
- **Role-Aware Safety Alerts Feed**: Real-time status and priority alerts feed for Citizens ("Safety Updates") and Field Responders ("Field Alerts") with pull-to-refresh, individual "Mark read" controls, and "Mark all read" header actions.
- **Unread Alerts Badge Counter**: Synchronized count badges overlaid on Citizens and Responders dashboard cards, fetching unread counts on screen focus.

## Tech Stack
- Expo React Native
- React Navigation (Native Stack)
- Axios
- AsyncStorage

---

## API Configuration
- **Backend Base URL**: `https://disasterconnect-87so.onrender.com/api`
- Handled via an Axios request interceptor that injects the JWT in the header format `Authorization: Bearer <token>`.

---

## Getting Started

### Prerequisites
Make sure you have Node.js installed. For physical device testing, install the **Expo Go** app on your iOS or Android device.

### Setup Instructions
1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npx expo start
   ```
4. Scan the QR code shown in the terminal using your phone camera (iOS) or the Expo Go app (Android).

---

## Demo Accounts
Use these pre-configured accounts to verify authentication and role-based views:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Citizen** | `citizen@disasterconnect.dev` | `Citizen@12345` |
| **Responder** | `responder@disasterconnect.dev` | `Responder@12345` |
| **Admin** | `admin@disasterconnect.dev` | `Admin@12345` |

---

## Development Roadmap
- **Phase 1 (Completed)**: Mobile foundation, authentication, and role-based home screens.
- **Phase 2 (Completed)**: Citizen incident reporting with GPS/location coordinates.
- **Phase 3 (Completed)**: My Incident Reports list & detail views.
- **Phase 4 (Completed)**: Responder assigned incidents mapping & status updates (auto-release resources).
- **Phase 5 (Completed)**: Safety alerts & notifications feed with mark-as-read.
