const pool = require('./configs/db');

async function migrate() {
    console.log("Starting migration for Doctor role features...");
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log("Updating REPORTS table...");
        await client.query(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS treatment_plan TEXT`);
        await client.query(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS follow_up_date DATE`);
        await client.query(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS recommendations TEXT`);

        console.log("Updating CERTIFICATES table...");
        await client.query(`ALTER TABLE certificates ADD COLUMN IF NOT EXISTS medical_justification TEXT`);
        await client.query(`ALTER TABLE certificates ADD COLUMN IF NOT EXISTS duration_days INTEGER`);

        await client.query('COMMIT');
        console.log("✅ Schema migration for Doctor features completed!");
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("❌ Migration failed:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
