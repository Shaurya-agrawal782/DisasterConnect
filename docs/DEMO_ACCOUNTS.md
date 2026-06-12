# Demo Accounts & Roles Management

This document explains the strategy for managing administrative and responder accounts for testing and coordination.

## Public Registration Limits
To prevent unauthorized access to higher privileges (such as admin or responder panels), public registration via the web application is restricted to the **Citizen** role.

## Creating Admin/Responder Accounts
Administrative and emergency responder accounts are provisioned via:
1. **Database Seed Scripts**: During initial database setup or environment seed migrations, standard system admin and emergency responder users are created with secure defaults.
2. **Admin Console Management**: Once authenticated as an admin, users can elevate or create responder/administrative profiles directly from the administrative portal (to be implemented).

## Developer/Test Accounts
To test administrative features in development:
- Run the legacy PyQt5 backend launcher or database setup script (`setup_mongodb.py`) which provisions the default `admin` username.
- In MERN, seed data scripts will be created in the database setup phase.
- Alternatively, for local testing, the `ALLOW_PUBLIC_ROLE_REGISTRATION=true` flag can be set in the `.env` file when running in `development` mode to temporarily allow registering administrative users from the signup form.

## Seeded Demo Accounts (Local Test Only)
The user seeding script (`npm run seed:users` inside the `backend` folder) creates the following local-only demo accounts:
- **Admin**: `admin@disasterconnect.dev` / `Admin@12345`
- **Responder**: `responder@disasterconnect.dev` / `Responder@12345`
- **Citizen**: `citizen@disasterconnect.dev` / `Citizen@12345`

