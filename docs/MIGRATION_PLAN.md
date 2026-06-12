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

## Next Steps
- Implement and set up the Express.js backend.
- Implement and set up the React frontend.

