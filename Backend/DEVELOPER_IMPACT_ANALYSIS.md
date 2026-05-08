# Developer Impact Analysis: Centralized SHMS Architecture

This document is for developers working on the **Nurse**, **Doctor**, and **Lab Technologist** roles. Our new centralized backend foundation changes how you handle authentication and database access.

## 1. Centralized Authentication (Action Required)

You do **not** need to create separate login endpoints or tables for your roles.

- **Login Endpoint**: All staff use `POST /auth/login`.
- **Identity**: Users log in using their **System ID** (e.g., `DOC-001`, `NRS-005`, `LAB-012`).
  - _Note_: These IDs are now **automatically generated** by the Admin module when the account is created.
- **Token**: After login, they receive a JWT token. You must include this in the `Authorization` header for all protected requests.

## 2. Using Middlewares (Security)

We have implemented a unified security layer in `middlewares/authMiddleware.js`.

- **`authenticate`**: Verifies the token and attaches user info to `req.user`.
- **`authorize([ROLE])`**: Ensures only the correct role can access your routes.

**Example for a Doctor route:**

```javascript
router.get("/my-patients", authenticate, authorize(["DOCTOR"]), getPatients);
```

## 3. Database Impact

All staff information is now in the **`staff`** table.

- **Nurse Developers**: When you implement the "Check-In" feature, you will link the student to the `doctor_id` using the IDs found in the `staff` table.
- **Lab Developers**: When a test is complete, you will record the `tech_id` (your own ID) in the `LAB_TEST` table.

## 4. Role-Specific Functionalities & Tables

The следующим tables are designed to support your workflows (refer to the ER Diagram):

- **Nurse**: `STUDENT` (Registration), `QUEUE` (Check-In).
- **Doctor**: `CONSULTATION` (Medical records), `CERTIFICATE` (Sick leave, etc.), `LAB_TEST` (Requests).
- **Lab Tech**: `LAB_TEST` (Results entry).

## 5. Restrictions & Compliance

- **Lab Techs**: Your results become read-only after submission (enforced in the backend).
- **Doctors**: You can only edit medical fields (`diagnosis`, `prescription`), not student personal info.
- **Admins**: Only Admins can manage staff accounts (activate/deactivate).
- **Workload Tracking**: The Admin dashboard now tracks your activity (number of check-ins for Nurses, consultations for Doctors, and tests for Lab Techs). This is calculated automatically based on the records you create in your respective modules.

---

**Summary**: By using this centralized system, we ensure that a single login works for everyone and that medical data is securely linked across all roles.
