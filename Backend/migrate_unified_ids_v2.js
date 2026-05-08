const pool = require('./configs/db');

async function migrate() {
    console.log("Starting improved unified ID standardization migration...");
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Identify and Drop Foreign Key Constraints
        const constraintsRes = await client.query(`
            SELECT conname, relname as table_name
            FROM pg_constraint c
            JOIN pg_class cl ON cl.oid = c.conrelid
            JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE contype = 'f' AND n.nspname = 'public'
        `);

        for (const row of constraintsRes.rows) {
            console.log(`Dropping constraint ${row.conname} on ${row.relname || row.table_name}...`);
            await client.query(`ALTER TABLE "${row.table_name}" DROP CONSTRAINT IF EXISTS "${row.conname}"`);
        }

        // 2. Function to check if column exists and alter it
        const alterColIfExists = async (tableName, colName) => {
            const checkRes = await client.query(`
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = $1 AND column_name = $2
            `, [tableName, colName]);

            if (checkRes.rows.length > 0) {
                console.log(`Converting ${tableName}.${colName} to VARCHAR(50)...`);
                await client.query(`ALTER TABLE "${tableName}" ALTER COLUMN "${colName}" TYPE VARCHAR(50) USING "${colName}"::character varying`);
            } else {
                console.log(`Skipping ${tableName}.${colName} (column does not exist)`);
            }
        };

        // 3. Process tables
        const tables = [
            'staff', 'admins', 'nurses', 'doctors', 'laboratory_technologists', 'patients',
            'ambulance', 'medication', 'audit_logs', 'system_config', 'queue', 'lab_records',
            'lab_test_requests', 'appointments', 'reports', 'certificates'
        ];

        for (const table of tables) {
            await alterColIfExists(table, 'id');
        }

        // 4. Process foreign keys
        const fkMapiings = [
            { table: 'patients', col: 'docid' },
            { table: 'appointments', col: 'patientid' },
            { table: 'appointments', col: 'doctorid' },
            { table: 'queue', col: 'student_id' },
            { table: 'queue', col: 'patient_id' },
            { table: 'queue', col: 'doctor_id' },
            { table: 'lab_test_requests', col: 'patient_id' },
            { table: 'lab_test_requests', col: 'doctor_id' },
            { table: 'lab_records', col: 'request_id' },
            { table: 'lab_records', col: 'technologist_id' },
            { table: 'reports', col: 'patient_id' },
            { table: 'reports', col: 'doctor_id' },
            { table: 'certificates', col: 'student_id' },
            { table: 'certificates', col: 'doctor_id' },
            { table: 'audit_logs', col: 'user_id' }
        ];

        for (const mapping of fkMapiings) {
            await alterColIfExists(mapping.table, mapping.col);
        }

        await client.query('COMMIT');
        console.log("✅ Unified ID standardization completed successfully!");
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("❌ Migration failed:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
