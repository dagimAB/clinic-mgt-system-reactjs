# SHMS Backend Documentation: Admin & Authentication Logic

This document explains how the centralized authentication and Admin management system is structured.

## 🧱 Architecture Overview

The backend uses a **Model-Route-Middleware** pattern rooted in a centralized `staff` table.

---

### 1. `Staff.model.js` (The Data Layer)

**Location:** `/models/Staff.model.js`

- **Purpose:** Handles all direct database interactions.
- **Key Functions:**
  - `initialize()`: Creates the `staff` table if it doesn't exist.
  - `addStaff()`: Hashes passwords using `bcrypt` and inserts new staff members (Nurse, Doctor, Lab Tech, or Admin) into the DB.
  - `findById()`: retrieves a user by their custom ID (e.g., `ADM-001`).
  - `updateStaff()`: Handles updating details and account activation/deactivation.

### 2. `Auth.Route.js` (The Front Door)

**Location:** `/routes/Auth.Route.js`

- **Purpose:** Handles the initial login process.
- **Workflow:**
  1. Accepts `id` and `password` from the user.
  2. Uses `Staff.model.findById` to fetch the user.
  3. Compares the provided password with the hashed password in the DB using `bcrypt.compare`.
  4. If valid, it generates a **JWT (JSON Web Token)** using `jsonwebtoken`.
  5. The token contains the user's `id`, `name`, and `role`, allowing the frontend to know who is logged in.

### 3. `authMiddleware.js` (The Security Guard)

**Location:** `/middlewares/authMiddleware.js`

- **Purpose:** Protects sensitive routes.
- **`authenticate` function:**
  - Placed before any protected route.
  - Extracts the token from the `Authorization` header.
  - Verifies the token using the secret key.
  - Attaches the user's info to the request object (`req.user`).
- **`authorize(['ADMIN'])` function:**
  - Checks the `role` attached by the authenticate middleware.
  - If the role isn't in the allowed list (e.g., 'ADMIN'), it returns a `403 Forbidden` error.

### 4. `Admin.Route.js` (The Command Center)

**Location:** `/routes/Admin.Route.js`

- **Purpose:** Contains all protected routes that only a **Clinic Admin** can access.
- **Features:**
  - Uses both middlewares (`authenticate` and `authorize(['ADMIN'])`) at the top level to protect all routes in the file.
  - Provides endpoints for **Staff Management**:
    - `POST /staff`: Create new staff members.
    - `GET /staff`: List all staff.
    - `PUT /staff/:id`: Update staff details or toggle `is_active` status.

---

## 🔑 Data Flow Example: Adding a Nurse

1. **Admin** sends a `POST` request to `/admin/staff`.
2. **`authMiddleware.authenticate`** catches it first, verifies the Admin's token.
3. **`authMiddleware.authorize`** checks if the token belongs to an `ADMIN`.
4. If approved, the request reaches the `POST` handler in **`Admin.Route.js`**.
5. It uses **`Staff.model.addStaff`** to save the new Nurse to the database.
6. A success message is returned.

---

## 🆔 Automated ID Generation (Smart IDs)

To maintain consistency, the system automatically generates unique staff codes:

- **Format**: `PREFIX-XXX` (e.g., `DOC-001`, `NRS-005`).
- **Logic**:
  - `Staff.model.js` checks the count of staff in that specific role.
  - It increments and pads with zeros (3 digits).
  - This ensures every profile has a professional identifier from day one.

---

## 👨‍💻 Data Impact on Other Roles

1. **Nurse (Queue & Registration)**:
   - When checking in a student, the `doctor_id` must match a valid `id` from the `staff` table.
2. **Doctor (Consultations)**:
   - Records are linked to the `doctor_id` (your own ID from the JWT).
3. **Lab Technologist (Results)**:
   - Results are linked to both the `doctor_id` (requestor) and `tech_id` (performer).
