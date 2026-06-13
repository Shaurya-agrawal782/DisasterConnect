# DisasterConnect Mobile App

This is the Expo React Native mobile client for **DisasterConnect**, designed to coordinate emergency response workflows for Citizens and Field Responders.

## Current Scope (Phase 3)
- **Expo React Native Foundation**: Bootstrapped with JavaScript and React Navigation.
- **Backend Authentication Integration**: Implemented JWT Bearer token authorization using the existing backend endpoints.
- **Secure Session Persistence**: Local token storage using `@react-native-async-storage/async-storage`.
- **Role-Based Routing**: Auto-routes to dedicated layouts based on credentials (`citizen`, `responder`, `admin`).
- **GPS Incident Reporting**: Captures coordinates using `expo-location`, supports Nominatim reverse geocoding for automated address filling, and integrates manual fallback overrides.
- **Incident List & Detail Tracking**: Citizens can list their reported incidents (with RefreshControl) and view read-only detail dashboards mapping coordinates, assigned responders, dispatched resource units, and chronological status timelines.

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
- **Phase 4**: Responder assigned incidents mapping & status updates (auto-release resources).
- **Phase 5**: Real-time Socket.io safety alerts & notifications.
