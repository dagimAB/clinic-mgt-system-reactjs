require("dotenv").config();
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
const { Pool } = require("pg");
const config = require("./config");

let pool = null;
let poolPromise = null;

const resolveHost = async () => {
  const originalHost = process.env.PG_HOST || "localhost";

  if (process.env.RESOLVED_PG_HOST) {
    return process.env.RESOLVED_PG_HOST;
  }

  if (originalHost === "localhost" || originalHost === "127.0.0.1") {
    return originalHost;
  }

  return new Promise((resolve) => {
    dns.resolve4(originalHost, (err, addresses) => {
      if (!err && addresses && addresses.length > 0) {
        const resolvedHost = addresses[0];
        process.env.RESOLVED_PG_HOST = resolvedHost;
        console.log(`✅ Resolved ${originalHost} to ${resolvedHost}`);
        resolve(resolvedHost);
      } else {
        console.warn(`⚠️ DNS resolution failed for ${originalHost}, using original hostname.`);
        resolve(originalHost);
      }
    });
  });
};

const createPool = async () => {
  if (pool) {
    return pool;
  }

  if (!poolPromise) {
    poolPromise = (async () => {
      const originalHost = process.env.PG_HOST || "localhost";
      const resolvedHost = await resolveHost();

      const poolConfig = {
        ...config,
        host: resolvedHost,
        ssl:
          originalHost !== "localhost" && originalHost !== "127.0.0.1"
            ? {
                rejectUnauthorized: false,
                servername: originalHost,
              }
            : false,
        connectionTimeoutMillis: 10000,
        max: 20,
        idleTimeoutMillis: 30000,
      };

      pool = new Pool(poolConfig);
      return pool;
    })();
  }

  return poolPromise;
};

const query = async (sql, values) => {
  const activePool = await createPool();
  const result = await activePool.query(sql, values);
  return result;
};

const connect = async () => {
  const activePool = await createPool();
  return activePool.connect();
};

const end = async () => {
  if (!pool) return;
  const currentPool = pool;
  pool = null;
  poolPromise = null;
  return currentPool.end();
};

module.exports = {
  query,
  connect,
  end,
};
