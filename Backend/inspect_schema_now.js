const { Client } = require("pg");
require("dotenv").config();
const dns = require("dns");

async function inspect() {
    const host = process.env.PG_HOST;
    if (!host) {
        console.log("No PG_HOST defined");
        return;
    }

    dns.resolve4(host, async (err, addresses) => {
        if (err) {
            console.error("DNS resolution failed:", err);
            return;
        }
        const ip = addresses[0];
        console.log(`Resolved IP: ${ip}`);

        const client = new Client({
            user: process.env.PG_USER,
            host: ip,
            database: process.env.PG_DATABASE,
            password: process.env.PG_PASSWORD,
            port: process.env.PG_PORT || 5432,
            ssl: process.env.PG_SSL === "true" ? { rejectUnauthorized: false, servername: host } : false,
        });

        try {
            await client.connect();
            const res = await client.query(`
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name IN ('appointments', 'reports')
            ORDER BY table_name, ordinal_position;
        `);
            console.log("Schema columns:");
            console.table(res.rows);
        } catch (e) {
            console.error(e);
        } finally {
            await client.end();
        }
    });
}

inspect();
