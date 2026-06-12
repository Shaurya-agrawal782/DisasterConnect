# Seeded Demo Accounts & Role Flow

To evaluate the system quickly, you can log in using the pre-seeded demo accounts. Run `npm run seed:users` and `npm run seed:resources` in the `backend/` directory to initialize the database with these profiles and logistical resources.

## Deployed Demo Profiles

| Role | Email Address | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@disasterconnect.dev` | `Admin@12345` |
| **Responder** | `responder@disasterconnect.dev` | `Responder@12345` |
| **Citizen** | `citizen@disasterconnect.dev` | `Citizen@12345` |

---

## Role Capabilities Overview

Each role has a custom UI layout and strict backend protections.

### 👤 1. Admin (Command Center Coordinator)
- **Dashboard:** Sees global counts of all active, critical, and resolved incidents, as well as live charts of all incidents and resource statuses.
- **Incident Scoping:** Full global visibility into every reported incident.
- **Incident Operations:** Can verify incidents, assign first-responders to incidents, and manually dispatch resource stock units (water, rations, medical kits).
- **Alerts:** Receives system alerts and can read/clear them.
- **Reports:** Only admins can access the Analytics & Reports page to view print-ready charts.

### 👷 2. Responder (Field Operations Personnel)
- **Dashboard:** Customized field dashboard displaying assigned incidents status log and alerts.
- **Incident Scoping:** Restricted to viewing and listing only incidents specifically assigned to them.
- **Incident Operations:** Cannot create incidents. Can view assigned incident details and update progress status (e.g. `in-progress` to `resolved`). Resolving an incident automatically releases dispatched supplies back to the resource pool.
- **Resource View:** Can view available logistics and inventory stock, but cannot dispatch or create resources.

### 🏠 3. Citizen (Emergency Reporter)
- **Dashboard:** Simple reporter view with quick access to report a new incident, and personal statistics.
- **Incident Scoping:** Scoped strictly to viewing and tracking only incidents reported by their own account.
- **Incident Operations:** Can submit new incidents with location coordinates. Cannot update incident status or assign resources.
- **Alerts:** Receives public safety alerts broadcast by administration.
- **Resources & Map:** Blocked from accessing the interactive map, resource details, or analytical reports.
