# DisasterConnect Demo Workflow

Follow these step-by-step instructions to showcase the core functionality of the system to hackathon judges or reviewers. This workflow demonstrates reporting, assignment, real-time map grid rendering, socket alert broadcasts, and automatic resource reclamation.

---

## 🏗️ Phase 1: Environment Startup & Seeding

Ensure MongoDB is running locally on your workstation.

1. **Start the Express API Server:**
   ```bash
   cd backend
   npm install
   cp .env.example .env     # Set correct MONGODB_URI if necessary
   npm run seed:users       # Seeds default test profiles
   npm run seed:resources   # Seeds default supply stocks
   npm run dev              # Starts nodemon listener on http://localhost:5000
   ```

2. **Start the React Frontend Client:**
   ```bash
   cd frontend
   npm install
   cp .env.example .env     # Ensure VITE_API_URL=http://localhost:5000/api
   npm run dev              # Starts Vite developer server on http://localhost:5173
   ```

3. **Navigate to the Site:**
   - Open `http://localhost:5173` in a web browser.
   - Inspect the responsive Landing Page sections and ensure UI styles load correctly.

---

## 📝 Phase 2: Citizen Incident Report

1. **Access Login Panel:**
   - Click **Sign In** on the Landing Page.
   - Enter Citizen credentials:
     - **Email:** `citizen@disasterconnect.dev`
     - **Password:** `Citizen@12345`

2. **Submit a New Report:**
   - Click **Report Incident** in the navbar or Citizen Dashboard.
   - Fill in details:
     - **Title:** `Crowd Stampede Hazard - Gate 3`
     - **Description:** `Huge bottleneck at Gate 3. Crowd density has exceeded safe capacity. Three minor injuries reported.`
     - **Category:** `Crowd Control` (or general hazard category)
     - **Severity:** `Critical`
     - **Location Coordinate:** Select coordinate points on the interactive Leaflet map panel (or type mock lat/lng coordinates).
   - Click **Submit Incident**.
   - Note the confirmation popup. The incident is now added to the database under status `pending`.

---

## ⚡ Phase 3: Admin verification, Dispatch & Resource Assignment

1. **Logout & Sign In as Admin:**
   - Click **Logout** in the citizen panel.
   - Navigate to `/login` and authenticate with:
     - **Email:** `admin@disasterconnect.dev`
     - **Password:** `Admin@12345`

2. **Verify Incident:**
   - Open **Incidents** list on the Admin Dashboard.
   - Find the newly created report: `Crowd Stampede Hazard - Gate 3`.
   - Click **View Details**.
   - The status is currently `pending`.

3. **Assign Field Responder:**
   - Locate the **Assign Responder** panel.
   - Choose the active responder: `responder@disasterconnect.dev` (usually listed under available responder users).
   - Click **Assign**. The system triggers a status update change to `assigned` or `active`.

4. **Assign Emergency Resources:**
   - On the same Incident Details view, find the **Resource Assignment** section.
   - Choose resources to dispatch:
     - Select `Medical Kit` (Quantity: 2)
     - Select `Crowd Barrier` (Quantity: 10)
   - Click **Assign Resource**.
   - Observe that the resource quantity decreases from the active inventory list.

5. **Monitor Live Map Ops:**
   - Click **Interactive Map** in the admin sidebar.
   - Notice the marker reflecting the location of the `Crowd Stampede Hazard - Gate 3` incident with an indicator color based on its Critical severity.
   - Verify resource marker positions or dispatch flags are displayed.

---

## 🏃 Phase 4: Responder Intervention & Live Status Update

1. **Logout & Sign In as Responder:**
   - Click **Logout** in the Admin panel.
   - Sign in on `/login` using:
     - **Email:** `responder@disasterconnect.dev`
     - **Password:** `Responder@12345`

2. **Review Assigned Duties:**
   - The Responder Dashboard immediately displays assigned tasks.
   - Open the details for `Crowd Stampede Hazard - Gate 3`.
   - View list of assigned logistics resources (`Medical Kit` x2, `Crowd Barrier` x10) dispatched to aid operations.

3. **Perform Action / Update Progress:**
   - Change the incident status select option from `assigned`/`active` to `resolving` or similar active response indicator status.
   - Submit the update.
   - Verify that this status update is transmitted immediately to other screens.

---

## 🔔 Phase 5: Real-Time Alerts, Analytics & Reclamation

1. **Check Real-Time Alerts:**
   - While logged in, view the global **Alerts** drop-down feed or page.
   - Ensure a Socket.io broadcast notification alert like `Incident "Crowd Stampede Hazard - Gate 3" status updated to active/resolving` has been received.

2. **Analyze Operations Dashboard:**
   - Logout and sign back in as **Admin**.
   - Navigate to **Reports / Analytics**.
   - Inspect the Recharts graphs:
     - Confirm the active incident count chart is updated.
     - Observe the resource utilization allocation ratio update.

3. **Resolve the Incident (Reclaim Resources):**
   - Navigate back to the details page of `Crowd Stampede Hazard - Gate 3`.
   - Update the status dropdown to **Resolved** or **Closed**.
   - Click **Update Status**.
   - Once resolved:
     - Check the resource checklist on the incident detail view.
     - Dispatched resources (`Medical Kit` x2, `Crowd Barrier` x10) are automatically released and returned to the inventory pool database.
     - Go to **Resources** inventory panel to verify resource counts are restored.
