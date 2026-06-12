# DisasterConnect REST API Overview

This document provides a reviewer-friendly reference of all active endpoints configured in the MERN backend application.

## Base URL
All API requests are prefixed with:
`/api` (e.g. `http://localhost:5000/api`)

---

## 🔒 Authentication & Session Routes

Base endpoint: `/api/auth`

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/register` | Public (Citizen only) | Creates a new citizen user account. Admin & Responder registration is blocked publicly to secure access. |
| **POST** | `/login` | Public | Authenticates credentials and sets an HTTP-only Cookie containing the JWT session payload. |
| **GET** | `/me` | Protected (Any Role) | Retrieves the current session user context (id, name, email, role). |
| **POST** | `/logout` | Protected (Any Role) | Clears the HTTP-only cookie to terminate the active session. |

---

## 👥 User Lookup Routes

Base endpoint: `/api/users`

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/responders` | Admin Only | Retrieves list of all users registered with the `responder` role to facilitate administrative assignments. |

---

## 🚨 Incident Management Routes

Base endpoint: `/api/incidents`

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/` | Admin, Citizen | Submits a new incident. Requires title, description, type, severity, and location coordinates. |
| **GET** | `/` | Admin, Responder, Citizen | Lists incidents. Supports filtering via URL queries (status, severity, search, etc.). |
| **GET** | `/:id` | Admin, Responder, Citizen | Retrieves detailed info for a single incident, including assigned responder and dispatched resources list. |
| **PATCH**| `/:id` | Admin Only | Performs general metadata field edits. |
| **DELETE**| `/:id` | Admin Only | Permanently removes an incident record from the database. |
| **PATCH**| `/:id/assign` | Admin Only | Assigns a field responder user ID to start resolving the incident. |
| **PATCH**| `/:id/resources/assign` | Admin Only | Dispatches quantities of a specific resource. Automatically decreases resource inventory level. |
| **PATCH**| `/:id/resources/:resourceId/release` | Admin Only | Releases resources. Restores items to the resource inventory count. |
| **PATCH**| `/:id/status` | Admin, Responder | Updates the progress state (e.g. `investigating`, `active`, `resolved`). Resolving/closing triggers automatic resource release. |

---

## 📦 Resource Inventory Routes

Base endpoint: `/api/resources`

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/` | Admin Only | Creates a new logistical resource item (e.g. Food Packets, Medical Kits, Sandbags). |
| **GET** | `/` | Admin, Responder | Retrieves current resource items with stock metrics and status. |
| **GET** | `/:id` | Admin, Responder | Retrieves details of a specific resource item. |
| **PATCH**| `/:id` | Admin Only | Modifies resource details (name, type, quantity, status). |
| **DELETE**| `/:id` | Admin Only | Removes a resource item from the database. |
| **PATCH**| `/:id/status` | Admin Only | Updates resource operational status (e.g. `available`, `out-of-stock`, `maintenance`). |

---

## 🔔 Safety Alerts Routes

Base endpoint: `/api/alerts`

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Protected (Any Role) | Fetches the notification alerts feed generated for the logged-in user. |
| **PATCH**| `/read-all` | Protected (Any Role) | Marks all active alerts for the current session user as read. |
| **PATCH**| `/:id/read` | Protected (Any Role) | Marks a single notification alert as read. |

---

## 📊 Analytics & Reports Routes

Base endpoint: `/api/analytics`

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/summary` | Protected (Any Role) | Returns overall counters (active incidents, total alerts, etc.). |
| **GET** | `/incidents` | Protected (Any Role) | Returns data aggregated by incident severity and category. |
| **GET** | `/resources` | Protected (Any Role) | Returns current resource dispatch ratios for Recharts displays. |
| **GET** | `/alerts` | Protected (Any Role) | Returns metrics on read vs unread notifications. |
| **GET** | `/dashboard` | Protected (Any Role) | Unified dashboard analytics snapshot for quick front-end widgets feed. |

---

## 🩺 System Health Route

Base endpoint: `/api`

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/health` | Public | Returns status JSON indicating server runtime state, active environment (`production`/`development`), and MongoDB database connection health. |
