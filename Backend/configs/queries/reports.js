const createReportsTable = `
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    patient_id VARCHAR(50),
    doctor_id VARCHAR(50),
    appointment_id INTEGER,
    date DATE NOT NULL,
    time TIME NOT NULL,
    disease VARCHAR(255) NOT NULL,
    temperature DECIMAL(5,2),
    weight DECIMAL(5,2),
    bp VARCHAR(20),
    glucose DECIMAL(5,2),
    info TEXT,
    medicines JSONB,
    treatment_plan TEXT,
    follow_up_date DATE,
    recommendations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createReportQuery = `
    INSERT INTO reports (patient_id, doctor_id, appointment_id, date, time, disease, temperature, weight, bp, glucose, info, medicines, treatment_plan, follow_up_date, recommendations)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING *;
`;

const getAllReportsQuery = `
    SELECT r.*, s.name as doctor_name 
    FROM reports r
    LEFT JOIN staff s ON r.doctor_id = s.id
    ORDER BY r.date DESC, r.time DESC;
`;

const getReportsByUserQuery = `
    SELECT * FROM reports 
    WHERE (patient_id = $1 OR doctor_id = $1)
    ORDER BY date DESC, time DESC;
`;

// NEW: Aggregation Queries for Analytics
const getIllnessTrendsQuery = `
    SELECT disease, COUNT(*) as count 
    FROM reports 
    WHERE date >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY disease
    ORDER BY count DESC
    LIMIT 10;
`;

const getMonthlyTrendsQuery = `
    SELECT TO_CHAR(date, 'YYYY-MM') as month, COUNT(*) as count
    FROM reports
    WHERE date >= CURRENT_DATE - INTERVAL '6 months'
    GROUP BY month
    ORDER BY month ASC;
`;

module.exports = {
    createReportsTable,
    createReportQuery,
    getAllReportsQuery,
    getReportsByUserQuery,
    getIllnessTrendsQuery,
    getMonthlyTrendsQuery,
};
