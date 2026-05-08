const pool = require('./configs/db');

async function inspect() {
    const client = await pool.connect();
    try {
        const tables = ['staff', 'reports', 'lab_test_requests', 'queue'];
        for (const table of tables) {
            console.log(`\n--- Schema for table: ${table} ---`);
            const res = await client.query(`
                SELECT column_name, data_type, character_maximum_length, is_nullable
                FROM information_schema.columns
                WHERE table_name = $1
                ORDER BY ordinal_position;
            `, [table]);
            console.table(res.rows);

            console.log(`--- Constraints for table: ${table} ---`);
            const cons = await client.query(`
                SELECT conname, pg_get_constraintdef(c.oid)
                FROM pg_constraint c
                JOIN pg_namespace n ON n.oid = c.connamespace
                WHERE contype = 'f' AND conrelid = $1::regclass;
            `, [table]);
            console.table(cons.rows);
        }
    } catch (err) {
        console.error("Inspection failed:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

inspect();
