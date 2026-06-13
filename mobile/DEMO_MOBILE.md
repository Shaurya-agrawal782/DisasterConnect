# DisasterConnect Mobile App Demo Guide

This document outlines instructions for launching, running, and demonstrating the **DisasterConnect** Expo React Native mobile application.

---

## 🚀 How to Start the Expo App

1. **Navigate to the mobile directory**:
   ```bash
   cd mobile
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Expo Development Server**:
   ```bash
   npx expo start
   ```

4. **Connect to Expo Go**:
   * Install the **Expo Go** application from the Google Play Store (Android) or App Store (iOS).
   * **Android**: Open the Expo Go app and scan the QR code displayed in the terminal.
   * **iOS**: Open the iOS Camera app and scan the QR code to open the link in Expo Go.

---

## 🔑 Demo Accounts Reference

Use the following pre-configured credentials:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Citizen** | `citizen@disasterconnect.dev` | `Citizen@12345` |
| **Responder** | `responder@disasterconnect.dev` | `Responder@12345` |
| **Admin** | `admin@disasterconnect.dev` | `Admin@12345` |

---

## 📱 Mobile Demo Workflows

### 1. Citizen Workflow (Reporting & Tracking)
1. **Sign In**: Login as the Citizen account.
2. **Dashboard**: The dashboard card for **Alerts Feed** will show a red badge indicator overlay if there are unread safety alerts.
3. **Report Incident**:
   * Tap **🚨 REPORT INCIDENT**.
   * **AI Report Assistant (Pre-submit Helper)**:
     * In the **AI Report Assistant** box near the top, type a rough description of the incident in your own words (e.g., in Hindi/Hinglish: `"main gate ke pass bahut bheed hai log dhakka de rahe hain"`).
     * Tap **✨ Analyze with AI**.
     * Review the suggested title, category, severity, improved description, missing questions, safety tips, and disclaimer.
     * Tap **Apply Suggestions** to automatically populate the form fields.
   * Review, edit, or keep the suggested Title, Description, Type, and Severity manually.
   * **Location Verification**:
     * Manual coordinate inputs are disabled to ensure report authenticity.
     * Tap **📍 Use Current Location** (location permission is required to submit the report).
     * Once captured, a read-only location card displays your Latitude, Longitude, GPS accuracy, and reverse-geocoded address.
     * Enter a human-readable note in **Landmark / Nearby Place \*** (e.g. `"Near Main Gate"`) to help responders find you.
   * Tap **Submit Report**. You will see a **✅ Success banner** with your **Ticket Number** (e.g. `DC-20260613-48291`). Save this ticket — it lets you track your report publicly. After 4 seconds, you will be redirected to the **My Reports** history list.
4. **Track Report & Timeline**:
   * In **My Reports**, your ticket number appears on each report card in blue monospace text (🎫 DC-...).
   * Use the **Search bar** at the top of My Reports to filter by ticket number or title.
   * Tap your newly created incident in the list.
   * At the top of the detail screen, your ticket number is prominently displayed in blue.
   * Review the read-only dashboard detailing dispatched responders, resource counts, coordinates, and the chronological update timeline.
5. **Public Track Report** (Web):
   * On the Landing Page (`/`), click **Track Report** in the top nav.
   * Enter your ticket number (e.g. `DC-20260613-48291`) in the search box.
   * View the live response status progress bar, AI safety advisory (if available), and status history timeline.
6. **View Safety Updates**:
   * Return to the Home dashboard and tap **Alerts Feed**.
   * Review targeted safety notices and incident broadcasts.
   * Tap **Mark read** on an unread alert (with the blue border and indicator dot). Watch the unread badge decrement on the home screen.
   * Tap **Mark all read** to read all alerts at once.

### 2. Field Responder Workflow (Dispatches & Action Console)
1. **Sign In**: Login as the Responder account.
2. **Active Dispatches**: Tap **My Assigned Incidents** to review incidents currently scoped to your responder account.
3. **Action Console**:
   * Open an incident card to view details (descriptions, geographical coordinates, dispatched resources).
   * Scroll to the **Field Action Console**.
   * Select a valid next status (e.g. `in-progress` or `resolved`).
   * Enter an optional field log note.
   * Tap **Update Dispatch Status**. The timeline updates immediately, and any dispatched resources are automatically freed back into the global inventory pool.
4. **Emergency Alerts Feed**:
   * Tap **Emergency Alerts Feed** on the Home screen to view responder-targeted dispatches and safety bulletins.

### 3. Admin Redirect Notice
1. **Sign In**: Login as the Admin account.
2. **Warning Redirect**: View the prompt screen advising admins to access the control panel via desktop web browser.
3. **Sign Out**: Tap **Sign Out & Switch Accounts** to return to the login screen.

---

## ⚙️ Troubleshooting & Limitations

### ⚠️ Render Free-Tier Cold Start
* **Problem**: The first request (Login) times out or responds with an API error.
* **Explanation**: The backend is hosted on Render's free tier. If inactive, the container spins down.
* **Fix**: Wake up the backend by navigating to `https://disasterconnect-87so.onrender.com/api/health` on a browser. Wait for `{"success":true,"message":"DisasterConnect API is running"}` before attempting to sign in on mobile.

### 📍 Location Permission Denied
* **Problem**: Tapping "Use Current Location" prompts a warning or fails to obtain coordinates.
* **Fix**: Allow location permissions in Expo Go app settings or manually type latitude (e.g. `23.2599`) and longitude (e.g. `77.4126`) in the coordinate input fields.

### 📶 Expo Go Network / Bundler Issue
* **Problem**: Scanning the QR code displays "Network connection timeout" or "Could not connect to development server".
* **Fix**: Make sure your phone and development computer are connected to the exact same Wi-Fi network. If they are but it still fails, start the bundler with the tunnel option:
  ```bash
  npx expo start --tunnel
  ```

### 🛰️ Android Location Accuracy
* **Problem**: Caught coordinates are imprecise.
* **Explanation**: Android emulator location services or indoor GPS tracking can be imprecise.
* **Fix**: Look at the accuracy tag displayed next to the captured button (e.g., `±15m`). For precision, type coordinates manually if needed.
