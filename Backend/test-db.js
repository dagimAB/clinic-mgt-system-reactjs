require("dotenv").config();
const { Client } = require("pg");
const dns = require("dns");

const host = process.env.PG_HOST;

console.log("Resolving host:", host);

dns.resolve4(host, (err, addresses) => {
    if (err) {
        console.error("DNS resolution failed:", err);
        process.exit(1);
    }

    const ip = addresses[0];
    console.log(`Resolved to IP: ${ip}`);

    const config = {
        user: process.env.PG_USER,
        host: ip, // Connect to IP directly
        database: process.env.PG_DATABASE,
        password: process.env.PG_PASSWORD,
        port: process.env.PG_PORT,
        ssl: process.env.PG_SSL === "true" ? {
            rejectUnauthorized: false,
            servername: host // SNI: Verify against original hostname
        } : false,
        connectionTimeoutMillis: 10000,
    };

    console.log("Connecting with config (password hidden):", { ...config, password: "****" });

    const client = new Client(config);

    client.connect()
        .then(() => {
            console.log("Connected successfully!");
            return client.query("SELECT NOW()");
        })
        .then(res => {
            console.log("Query result:", res.rows[0]);
            client.end();
            process.exit(0);
        })
        .catch(err => {
            console.error("Connection error:", err);
            process.exit(1);
        });
});
