# DisasterConnect User Guide

Welcome to DisasterConnect! This guide explains how to navigate the platform, test role-scoped features, and explore key system integrations during evaluation.

---

## 🗺️ System Sections

### 1. Landing & Authentication
- **Landing Page:** Serves as the operational portal introducing the system’s modules (Incident Scoping, Resource Dispatch, Alert Broadcasting).
- **Registration:** Public registration is permitted only for the **Citizen** role to maintain administrative and responder integrity.
- **Login:** Performs credential verification and sets secure, HTTP-only session cookies.

### 2. Role-Scoped Dashboards
- **Admin Command Center:** Offers dynamic metric cards (active/critical counts, unread notifications) alongside live Recharts visual charts, resource inventory levels, and command actions.
- **Responder Dashboard:** Shows current task queue status charts and direct links to active dispatches.
- **Citizen Portal:** Focused on quick hazard reporting, displaying personal report status charts and safety updates.

### 3. Incident Lifecycle Management
- **Reporting Incidents (Citizen/Admin):** Users can report incidents by entering a title, description, category type, severity level, and pinpointing coordinates.
- **Verification & Scoping:** Admins view all logged incidents. Citizens view only their own logs. Responders view only incidents assigned to them.
- **Assignment (Admin):** Admins can click on an incident to assign a designated responder and dispatch logistical resources.
- **Status Updates (Admin/Responder):** Responders or admins can transition incident states (e.g. from `assigned` to `in-progress` to `resolved`). Resolving or closing an incident automatically triggers a resource release, restoring supply counts back to the warehouse inventory.

### 4. Logistics & Resources
- **Resource Logs (Admin/Responder):** Displays stock levels of medical kits, food, water, and first-responder personnel.
- **CRUD Operations (Admin):** Admins can create new resource records, update inventory quantities, or mark items for maintenance.

### 5. Interactive Operational Map (Admin/Responder)
- **Leaflet Integration:** Loads map layers with dynamic coordinate markers for active incidents (color-coded by severity) and resource locations.
- **Filters & Legend:** Allows toggling map markers by category type or status.

### 6. Real-Time Alert Broadcasts
- **Socket.io Stream:** Instantly pushes urgent notifications to active dashboards when incidents are created, responders are assigned, or status updates occur.
- **Alert Feed:** Users can view unread notifications and click to mark individual alerts as read, or use "Mark All as Read."

### 7. Analytical Reports (Admin Only)
- **Printable Reports Summary:** Contains status analytics, category breakdowns, and dispatch ratios. Admins can click "Print Summary" to print or export the reports.

---

## 💡 Practical Demo Walkthrough

To experience the platform's full capabilities, we recommend running this interactive flow:

1. **Submit a Report:** Log in as **Citizen** (`citizen@disasterconnect.dev` / `Citizen@12345`). Click **Report Incident**, enter location details (e.g. coordinates `[80.2, 23.2]`), and submit.
2. **Review & Dispatch:** Log out and log in as **Admin** (`admin@disasterconnect.dev` / `Admin@12345`). You will notice a real-time warning alert popup. Go to the **Incidents** log, select the reported incident, assign the **Responder User**, and dispatch a resource (e.g. Food Packets).
3. **Resolve Incident:** Log out and log in as **Responder** (`responder@disasterconnect.dev` / `Responder@12345`). You will see the incident in your list. Open it and transition the status to **Resolved**.
4. **Logistics Auto-Release:** Log back in as **Admin** and verify the dispatched resource has been released and inventory counts have reverted to normal.
