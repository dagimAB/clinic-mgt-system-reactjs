# Change Log - Hybrid ID Migration & UI Enhancements

This file documents every line of code changed during the system-wide transition to support alphanumeric Identity IDs while retaining efficient Integer IDs for internal records.

---

## 1. Identity Tables (Converted to VARCHAR(50))

_These tables use alphanumeric IDs like DOC-001, NRS-001, ETS..._

### Backend/configs/queries/patient.js

- Line: 2
  - Before: `id SERIAL PRIMARY KEY,`
  - After: `id VARCHAR(50) PRIMARY KEY,`
- Line: 18
  - Before: `docID INT,`
  - After: `docID VARCHAR(50),`

### Backend/configs/queries/doctors.js

- Line: 3
  - Before: `id SERIAL PRIMARY KEY,`
  - After: `id VARCHAR(50) PRIMARY KEY,`

### Backend/configs/queries/labTechnologist.js

- Line: 2
  - Before: `id SERIAL PRIMARY KEY,`
  - After: `id VARCHAR(50) PRIMARY KEY,`

### Backend/configs/queries/nurses.js

- Line: 3
  - Before: `id SERIAL PRIMARY KEY,`
  - After: `id VARCHAR(50) PRIMARY KEY,`

---

## 2. Record/Transaction Tables (Retained SERIAL IDs, Updated FKs)

_Internal tracking IDs remain Integers; reference columns updated to VARCHAR(50)._

### Backend/configs/queries/queue.js

- Line: 3 (student_id), 4 (patient_id), 7 (doctor_id)
  - Updated type from `INT` to `VARCHAR(50)` to support alphanumeric lookups.
  - Primary `id` remains `SERIAL`.

### Backend/configs/queries/lab.js

- `lab_test_requests` & `lab_records`
  - Column types for `patient_id`, `doctor_id`, `request_id`, and `technologist_id` updated to `VARCHAR(50)`.
  - Primary `id` columns remain `SERIAL`.

### Backend/configs/queries/reports.js

- Line: 4 (patient_id), 5 (doctor_id), 6 (appointment_id)
  - Updated type to `VARCHAR(50)`.
  - Primary `id` remains `SERIAL`.

### Backend/configs/queries/certificate.js

- Line: 4 (student_id), 5 (doctor_id)
  - Updated type to `VARCHAR(50)`.
  - Primary `id` remains `SERIAL`.

### Backend/configs/queries/appointment.js

- Foreign keys `patientid` and `doctorid` updated to `VARCHAR(50)`.
- Primary `id` remains `SERIAL`.

### Backend/configs/queries/audit.js

- Line: 4 (user_id) updated to `VARCHAR(50)`.
- Primary `id` remains `SERIAL`.

---

## 3. Database Migration Script

### Backend/migrate_to_varchar.js [NEW]

- A hybrid script that:
  1. Identifies and clears foreign key constraints.
  2. Migrates Identity PKs (`staff`, `doctors`, etc.) to `VARCHAR(50)`.
  3. Migrates Foreign Key columns across all tables to `VARCHAR(50)`.
  4. Keeps Record PKs (transactional tables) in their original format.
- **Fix**: Removed invalid escaping of backticks and dollar signs in template literals that caused SyntaxErrors.
- **Robustness**: Added checks to verify if a table exists (`information_schema.tables`) before attempting to alter its primary key, preventing failures if a table (like `admins`) is missing.

## 5. Critical Fixes (Type Mismatches)

### Backend/configs/queries/lab.js

- Column `lab_records.request_id` reverted to `INTEGER` (matches `lab_test_requests.id`).

### Backend/configs/queries/reports.js

- Column `reports.appointment_id` reverted to `INTEGER` (matches `appointments.id`).

### Backend/fix_type_mismatch.js [NEW]

- Script to revert the above database columns from `VARCHAR` back to `INTEGER`.

## 6. Miscellaneous Fixes

### Backend/routes/Nurses.Route.js

- Removed redundant `JSON.parse()` on the certificate config (the `pg` driver already parses `JSONB` columns).

## 7. Unified ID Synchronization (Alphanumeric IDs)

### Backend/configs/queries/

- Updated `patient.js`, `doctors.js`, `nurses.js`, and `labTechnologist.js` to include the `id` column in `INSERT` statements, allowing alphanumeric IDs to be set as primary keys on creation.

### Backend/models/

- Updated `Patient.model.js`, `Doctor.model.js`, `Nurses.model.js`, `LabTechnologist.model.js`, and `Staff.model.js` to pass explicit alphanumeric IDs (e.g., `studentID` or generated `DOC-XXX`) during record creation.

### Backend/migrate_unified_ids.js [NEW]

- Script to synchronize all existing records, setting primary keys to match alphanumeric identifiers and updating all related foreign keys in `queue`, `reports`, `appointments`, etc.

## 4. UI Enhancements

### FrontEnd/src/Pages/Dashboard/Main-Dashboard/AllPages/Doctor/ConsultationView.jsx

- **Added**: `ReloadOutlined` icon import from `@ant-design/icons`.
- **Added**: A "Refresh" button in the Laboratory Results header that triggers `getConsultationData` to fetch the latest results on demand.
