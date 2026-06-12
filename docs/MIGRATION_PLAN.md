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
- **Step 10A completed**: Socket.io real-time alerts added with persistent alert storage and dashboard alert UI.
- **Step 11A completed**: analytics APIs and real dashboard metrics/charts added with role-based data scoping.
- **Step 12A completed**: resource-to-incident assignment and release workflow added with automatic resource release on resolved/closed incidents.
- **Step 13A completed**: landing page, README, demo flow, and API overview documentation polished for presentation.
- **Step 14A completed**: deployment readiness added with production-safe environment examples, CORS/cookie review, and deployment guide.
- **UI redesign reference added from Stitch full-app design package.**
- **UI Step 1.5 completed: generated UI stabilized, invalid Tailwind classes fixed, shell cleanup completed, and public demo credential exposure removed.**
- **UI Step 2 completed: public landing, login, and register pages redesigned with premium DisasterConnect product experience.**
- **UI Step 2.1 completed: public and auth pages refined to reduce AI-generated feel and improve product realism.**
- **Role UX Step completed: Admin, Responder, and Citizen now receive distinct dashboards, navigation, page copy, and visible controls while preserving backend role protection.**
- **Role UX audit completed: route protection and role-specific controls verified/fixed across dashboards, incidents, and resources.**
- **QA Hardening Pass 1 completed: responder incident scoping, incident creation role restrictions, alert ObjectId checks, Tailwind cleanup, radius config, dashboard fake metrics, and reports visibility were fixed.**
- **QA Hardening Pass 2 completed: README, API docs, demo accounts, user guide, deployment notes, and product claims were cleaned for hackathon consistency.**

## Next Steps
- Deploy to Render (backend) and Vercel (frontend) with MongoDB Atlas.




