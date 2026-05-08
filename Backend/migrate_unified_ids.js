const pool = require('./configs/db');

async function migrate() {
    console.log("🚀 Starting Unified ID Synchronization...");
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Sync Patients: Set id = studentID
        console.log("👨‍🎓 Syncing Patient IDs (id = studentID)...");
        await client.query(`
            UPDATE patients SET id = studentID WHERE id != studentID;
        `);

        // 2. Sync Staff/Doctors: Match doctors.id to staff.id based on email
        console.log("👨‍⚕️ Syncing Doctors/Staff IDs...");
        await client.query(`
            UPDATE doctors d
            SET id = s.id
            FROM staff s
            WHERE d.email = s.email AND d.id != s.id;
        `);

        // 3. Sync Nurses
        await client.query(`
            UPDATE nurses n
            SET id = s.id
            FROM staff s
            WHERE n.email = s.email AND n.id != s.id;
        `);

        // 4. Sync Lab Techs
        await client.query(`
            UPDATE laboratory_technologists l
            SET id = s.id
            FROM staff s
            WHERE l.email = s.email AND l.id != s.id;
        `);

        // 5. Cleanup related tables using numeric lookups if needed
        // (Usually, if patients.id changed from 1 to ETS..., all FKs must follow)
        // This is tricky if we don't know the old ID. 
        // But since we just changed 'patients.id' where it was 1, 2, 3...
        // We need a mapping.
        
        console.log("🔗 Updating Foreign Keys in related tables...");

        // Update Queue: link student_id to alphanumeric ID
        await client.query(`
            UPDATE queue q
            SET student_id = p.id
            FROM patients p
            WHERE q.student_id = p.id::text OR (q.student_id ~ '^[0-9]+$' AND q.student_id = p.id::text);
        `);

        // Wait, the above logic is for when id was numeric. 
        // If id is now 'ETS0036/15', we need to match the OLD numeric ID.
        // I should have done this BEFORE setting id = studentID.
        
        // RE-WRITING SCRIPT LOGIC TO BE SAFER
        await client.query('ROLLBACK');
        console.log("🔄 Re-aligning script logic for safer migration...");
        return migrateSafer();
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("❌ Synchronization failed:", err);
    } finally {
        client.release();
    }
}

async function migrateSafer() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // A. Update FKs while id is still potentially numeric string
        console.log("🔗 Updating Related Records (Queue, Reports, etc.) before Sync...");
        
        const tablesToUpdate = [
            { table: 'queue', col: 'student_id', ref: 'patients', refCol: 'id', newVal: 'studentID' },
            { table: 'queue', col: 'doctor_id', ref: 'staff', refCol: 'id', newVal: 'id' },
            { table: 'reports', col: 'patient_id', ref: 'patients', refCol: 'id', newVal: 'studentID' },
            { table: 'reports', col: 'doctor_id', ref: 'staff', refCol: 'id', newVal: 'id' },
            { table: 'appointments', col: 'patientid', ref: 'patients', refCol: 'id', newVal: 'studentID' },
            { table: 'appointments', col: 'doctorid', ref: 'staff', refCol: 'id', newVal: 'id' },
            { table: 'certificates', col: 'student_id', ref: 'patients', refCol: 'id', newVal: 'studentID' },
            { table: 'certificates', col: 'doctor_id', ref: 'staff', refCol: 'id', newVal: 'id' },
            { table: 'lab_test_requests', col: 'patient_id', ref: 'patients', refCol: 'id', newVal: 'studentID' },
            { table: 'lab_test_requests', col: 'doctor_id', ref: 'staff', refCol: 'id', newVal: 'id' },
            { table: 'lab_records', col: 'technologist_id', ref: 'staff', refCol: 'id', newVal: 'id' },
        ];

        for (const item of tablesToUpdate) {
            console.log(`  - Updating ${item.table}.${item.col}...`);
            await client.query(`
                UPDATE ${item.table} t
                SET ${item.col} = r.${item.newVal}
                FROM ${item.ref} r
                WHERE t.${item.col} = r.${item.refCol};
            `);
        }

        // B. Now Sync PKs
        console.log("👨‍🎓 Syncing Primary Keys...");
        await client.query(`UPDATE patients SET id = studentID WHERE id != studentID;`);
        await client.query(`UPDATE doctors d SET id = s.id FROM staff s WHERE d.email = s.email AND d.id != s.id;`);
        await client.query(`UPDATE nurses n SET id = s.id FROM staff s WHERE n.email = s.email AND n.id != s.id;`);
        await client.query(`UPDATE laboratory_technologists l SET id = s.id FROM staff s WHERE l.email = s.email AND l.id != s.id;`);

        await client.query('COMMIT');
        console.log("✅ Unified ID Synchronization complete! Please restart your server.");
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("❌ Synchronization failed:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
