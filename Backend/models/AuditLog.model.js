const dbhelper = require("../configs/dbhelper");
const {
  createAuditLogsTable,
  createLogQuery,
  getLogsQuery,
  getFilteredLogsQuery,
} = require("../configs/queries/audit");

const initialize = async () => {
  try {
    await dbhelper.query(createAuditLogsTable);
    console.log("✅ Audit Logs table initialized successfully.");
  } catch (err) {
    console.error("❌ Failed to initialize Audit Logs table:", err.message);
  }
};

const logAction = async (user_id, action, target_table, target_id, details = {}) => {
  const values = [user_id, action, target_table, target_id, JSON.stringify(details)];
  return dbhelper.query(createLogQuery, values);
};

const getLogs = async () => {
  return dbhelper.query(getLogsQuery);
};

const getFilteredLogs = async (user_id, action, date) => {
  return dbhelper.query(getFilteredLogsQuery, [user_id, action, date]);
};

module.exports = {
  initialize,
  logAction,
  getLogs,
  getFilteredLogs,
};
