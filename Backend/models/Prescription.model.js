// Dummy Prescription model created to fix startup error
// This file was missing, preventing the server from starting.

module.exports = {
    createMedicine: async (medicineData) => {
        console.log(`[Dummy Model] createMedicine called with data:`, medicineData);
        // Simulating success
        return true;
    }
};
