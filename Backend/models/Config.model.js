const dbhelper = require("../configs/dbhelper");
const {
  createConfigTable,
  setConfigQuery,
  getConfigQuery,
} = require("../configs/queries/config");

const initialize = async () => {
  try {
    await dbhelper.query(createConfigTable);
    console.log("✅ System Config table initialized successfully.");
    
    // Seed default certificate template if not exists
    const defaultCert = {
        template: "Standard Medical Certificate",
        logo_url: "",
        fields: ["student_id", "diagnosis", "rest_period"]
    };
    await dbhelper.query(setConfigQuery, ["certificate_settings", JSON.stringify(defaultCert)]);

    const defaultBackup = {
        schedule: "02:00 AM",
        retention_days: 90,
        format: "SQL Dump (compressed)",
        enabled: true
    };
    await dbhelper.query(setConfigQuery, ["backup_settings", JSON.stringify(defaultBackup)]);
  } catch (err) {
    console.error("❌ Failed to initialize System Config table:", err.message);
  }
};

const setConfig = async (key, value) => {
  return dbhelper.query(setConfigQuery, [key, JSON.stringify(value)]);
};

const getConfig = async (key) => {
  const result = await dbhelper.query(getConfigQuery, [key]);
  return result[0] ? result[0].value : null;
};

module.exports = {
  initialize,
  setConfig,
  getConfig,
};
