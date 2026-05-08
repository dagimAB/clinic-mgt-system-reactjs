require("dotenv").config();
const dns = require("dns");
const { Pool } = require("pg");

// Helper to resolve host to IPv4
const resolveHost = (host) => {
    return new Promise((resolve, reject) => {
        if (host === 'localhost' || host === '127.0.0.1') {
            return resolve(host);
        }
        dns.resolve4(host, (err, addresses) => {
            if (err) {
                console.error("DNS resolution failed for", host, err);
                // Fallback to original host if resolution fails
                resolve(host);
            } else {
                console.log(`Resolved ${host} to ${addresses[0]}`);
                resolve(addresses[0]);
            }
        });
    });
};

const createPool = async () => {
    const originalHost = process.env.PG_HOST || "localhost";
    const resolvedHost = await resolveHost(originalHost);

    const config = {
        user: process.env.PG_USER,
        host: resolvedHost,
        database: process.env.PG_DATABASE,
        password: process.env.PG_PASSWORD,
        port: process.env.PG_PORT || 5432,
        ssl: process.env.PG_SSL === "true" ? {
            rejectUnauthorized: false,
            servername: originalHost // Critical for Neon/SNI
        } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
    };

    return new Pool(config);
};

// Export a promise that resolves to the pool, or a wrapped client
// Since existing code expects `module.exports = new Pool`, we need to adapt.
// Ideally, we refactor db.js to export the pool instance directly.
// But since `new Pool` is synchronous and DNS is async, we have to change how db.js initializes.

// Workaround: We'll modify db.js to handle this internal logic or usage.
// Let's modify db.js directly.
