const dbhelper = require("./Backend/configs/dbhelper");

const deleteUsers = async () => {
    try {
        console.log("Adding unassign button and cleaning up users...");
        
        // Delete doctor user and selamawit if they exist
        const query = `DELETE FROM doctors WHERE email IN ('doctor@gmail.com', 'selamawit@gmail.com') OR name ILIKE '%doctor user%'`;
        await dbhelper.query(query);
        
        console.log("✅ Cleanup complete: Removed users.");
    } catch (err) {
        console.error("❌ Cleanup failed:", err.message);
    } finally {
        process.exit();
    }
};

deleteUsers();
