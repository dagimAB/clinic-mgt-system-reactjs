const pool = require('./configs/db');

async function sync() {
    console.log("Syncing staff IDs with role-specific tables...");
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const roleTables = ['doctors', 'nurses', 'admins', 'laboratory_technologists'];

        for (const table of roleTables) {
            console.log(`Syncing ids in table: ${table}...`);
            // Update table ID to match staff ID where emails match
            await client.query(`
                UPDATE "${table}" t
                SET id = s.id
                FROM staff s
                WHERE LOWER(t.email) = LOWER(s.email)
            `);
        }

        // Special case for patients: if we want to use studentID as the primary 'id'
        // Let's see if that's desirable. For now, let's just make sure patients.id remains unique.

        await client.query('COMMIT');
        console.log("✅ Staff IDs synced successfully!");
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("❌ Sync failed:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

sync();
