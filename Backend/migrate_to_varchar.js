const pool = require('./configs/db');

async function migrate() {
    console.log("🚀 Starting Hybrid Alphanumeric ID Migration...");
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Identify and Drop ALL Foreign Key Constraints
        console.log("🔍 Identifying foreign key constraints...");
        const constraintsRes = await client.query(`
            SELECT conname, relname as table_name
            FROM pg_constraint c
            JOIN pg_class cl ON cl.oid = c.conrelid
            JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE contype = 'f' AND n.nspname = 'public'
        `);

        for (const row of constraintsRes.rows) {
            console.log(`🗑️ Dropping constraint ${row.conname} on ${row.table_name}...`);
            await client.query(`ALTER TABLE "${row.table_name}" DROP CONSTRAINT IF EXISTS "${row.conname}"`);
        }

        // 2. Identify tables and columns to convert
        // IDENTITY TABLES: Convert primary 'id' to VARCHAR(50)
        const identityTables = [
            'staff', 'admins', 'nurses', 'doctors', 
            'laboratory_technologists', 'patients'
        ];

        // FOREIGN KEY COLUMNS: Convert to VARCHAR(50)
        const foreignKeys = [
            { table: 'patients', col: 'docid' },
            { table: 'appointments', col: 'patientid' },
            { table: 'appointments', col: 'doctorid' },
            { table: 'queue', col: 'student_id' },
            { table: 'queue', col: 'patient_id' },
            { table: 'queue', col: 'doctor_id' },
            { table: 'lab_test_requests', col: 'patient_id' },
            { table: 'lab_test_requests', col: 'doctor_id' },
            { table: 'lab_records', col: 'technologist_id' },
            { table: 'reports', col: 'patient_id' },
            { table: 'reports', col: 'doctor_id' },
            { table: 'certificates', col: 'student_id' },
            { table: 'certificates', col: 'doctor_id' },
            { table: 'audit_logs', col: 'user_id' }
        ];

        // Convert Identity PKs
        for (const table of identityTables) {
            console.log(`🛠️ Converting Identity PK ${table}.id to VARCHAR(50)...`);
            try {
                const tableCheck = await client.query(`
                    SELECT 1 FROM information_schema.tables 
                    WHERE table_name = $1 AND table_schema = 'public'
                `, [table]);

                if (tableCheck.rows.length > 0) {
                    await client.query(`ALTER TABLE "${table}" ALTER COLUMN "id" TYPE VARCHAR(50) USING "id"::character varying`);
                } else {
                    console.log(`ℹ️ Table "${table}" does not exist, skipping...`);
                }
            } catch (err) {
                console.warn(`⚠️ Could not convert Identity PK ${table}.id: ${err.message}`);
            }
        }

        // Convert Foreign Keys
        for (const fk of foreignKeys) {
            console.log(`🛠️ Converting FK ${fk.table}.${fk.col} to VARCHAR(50)...`);
            try {
                const colCheck = await client.query(`
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = $1 AND column_name = $2
                `, [fk.table, fk.col]);

                if (colCheck.rows.length > 0) {
                    await client.query(`ALTER TABLE "${fk.table}" ALTER COLUMN "${fk.col}" TYPE VARCHAR(50) USING "${fk.col}"::character varying`);
                }
            } catch (err) {
                console.warn(`⚠️ Could not convert ${fk.table}.${fk.col}: ${err.message}`);
            }
        }

        console.log("✅ Identity and Foreign Key columns converted to VARCHAR(50).");
        console.log("ℹ️ Record table PKs (queue, reports, etc.) remain as SERIAL/Integer.");

        await client.query('COMMIT');
        console.log("🎉 Migration successful! Please restart your backend server.");
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("❌ Migration failed:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
