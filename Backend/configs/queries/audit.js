const createAuditLogsTable = `
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    target_table VARCHAR(50),
    target_id VARCHAR(50),
    details JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createLogQuery = `
    INSERT INTO audit_logs (user_id, action, target_table, target_id, details)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
`;

const getLogsQuery = `
    SELECT al.*, s.name as user_name 
    FROM audit_logs al
    LEFT JOIN staff s ON al.user_id = s.id
    ORDER BY timestamp DESC
    LIMIT 100;
`;

const getFilteredLogsQuery = `
    SELECT al.*, s.name as user_name 
    FROM audit_logs al
    LEFT JOIN staff s ON al.user_id = s.id
    WHERE ($1::VARCHAR IS NULL OR al.user_id = $1)
      AND ($2::VARCHAR IS NULL OR al.action = $2)
      AND ($3::DATE IS NULL OR al.timestamp::date = $3)
    ORDER BY timestamp DESC;
`;

module.exports = {
  createAuditLogsTable,
  createLogQuery,
  getLogsQuery,
  getFilteredLogsQuery,
};
