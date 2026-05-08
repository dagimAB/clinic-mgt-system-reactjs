const pool = require('./configs/db');

async function fix() {
    console.log("🛠️ Reverting incorrect VARCHAR migrations to INTEGER...");
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Revert columns that reference SERIAL IDs
        const toRevert = [
            { table: 'lab_records', col: 'request_id' },
            { table: 'reports', col: 'appointment_id' }
        ];

        for (const item of toRevert) {
            console.log(`🔄 Reverting ${item.table}.${item.col} to INTEGER...`);
            await client.query(`ALTER TABLE "${item.table}" ALTER COLUMN "${item.col}" TYPE INTEGER USING "${item.col}"::integer`);
        }

        await client.query('COMMIT');
        console.log("✅ Fix successful! Please restart your backend server.");
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("❌ Fix failed:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

fix();
