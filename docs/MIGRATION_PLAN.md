# Migration Plan

## Overview
- **Source Project**: Python/PyQt5 desktop prototype.
- **Status**: The existing Python/PyQt5 desktop application code will be preserved safely as a legacy reference.
- **Target Architecture**: A new MERN (MongoDB, Express.js, React, Node.js) web application.
- **Structure**: The new web application will reside in `backend/` and `frontend/` directories.

## Scope of Code Reuse
- **Conceptual Logic to Reuse**:
  - Authentication flow and logic (auth)
  - Incidents tracking and management (incidents)
  - Resource allocation and tracking (resources)
  - Interactive map integration (maps)
  - Reporting and data visualization features (reports)
- **UI Logic / Direct Code Reuse**:
  - Existing Python PyQt5 UI code will not be directly reused in the new MERN web application.

## Migration Progress
- **Step 2 completed**: original Python prototype moved to legacy-python/.
- **Step 3 completed**: MERN foundation created with backend/ and frontend/ folders.
- **Step 4 completed**: backend database connection and core server architecture added.
- **Step 5 completed**: backend JWT authentication and role-based access added for the MERN app. Legacy SHA-256 users are not reused.
- **Step 6 completed**: frontend auth and dashboard shell setup finished.
- **Step 6.1 completed**: public registration hardened to prevent open admin/responder signup.
- **Step 7A completed**: backend incident management API added with role-based access and geospatial-ready schema.
- **Step 7B completed**: frontend incident management UI added with create, list, details, assignment, and status update flows.
- **Step 8A completed**: resource management module added with backend APIs, seed resources, and frontend CRUD UI.
- **Step 9A completed**: interactive map added with incident and resource markers, filters, legends, and GeoJSON coordinate conversion.

## Next Steps
- Implement and set up the Express.js backend.
- Implement and set up the React frontend.

