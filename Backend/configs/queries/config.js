const createConfigTable = `
CREATE TABLE IF NOT EXISTS system_config (
    key VARCHAR(50) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const setConfigQuery = `
    INSERT INTO system_config (key, value)
    VALUES ($1, $2)
    ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP
    RETURNING *;
`;

const getConfigQuery = `SELECT value FROM system_config WHERE key = $1;`;

module.exports = {
  createConfigTable,
  setConfigQuery,
  getConfigQuery,
};
