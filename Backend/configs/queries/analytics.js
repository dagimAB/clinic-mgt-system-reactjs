const getDailyStatsQuery = `
    SELECT 
        (SELECT COUNT(*) FROM staff WHERE role = 'DOCTOR') as total_doctors,
        (SELECT COUNT(*) FROM queue WHERE status = 'Visited' AND created_at::date = CURRENT_DATE) as patients_served_today,
        (SELECT AVG(EXTRACT(EPOCH FROM (created_at - created_at)) / 60) FROM queue WHERE status = 'Visited' AND created_at::date = CURRENT_DATE) as avg_wait_time
    ;
`;

const getRoleDistributionQuery = `
    SELECT role, COUNT(*) as count 
    FROM staff 
    GROUP BY role;
`;

const getWorkloadQuery = `
    SELECT 
        id, name, role,
        CASE 
            WHEN role = 'DOCTOR' THEN (SELECT COUNT(*) FROM reports WHERE doctor_id = staff.id)
            WHEN role = 'NURSE' THEN (SELECT COUNT(*) FROM audit_logs WHERE user_id = staff.id AND action = 'CREATE_PATIENT')
            WHEN role = 'LAB_TECH' THEN (SELECT COUNT(*) FROM lab_records WHERE technologist_id = staff.id)
            ELSE 0
        END as total_reports,
        (SELECT COUNT(*) FROM reports) as grand_total
    FROM staff
    WHERE role IN ('DOCTOR', 'NURSE', 'LAB_TECH');
`;

const getIndividualWorkloadQuery = `
    SELECT 
        id, name, role,
        (SELECT COUNT(*) FROM reports WHERE doctor_id = staff.id) as doc_consultations,
        (SELECT COUNT(*) FROM lab_records WHERE technologist_id = staff.id) as lab_tests,
        (SELECT COUNT(*) FROM audit_logs WHERE user_id = staff.id AND action = 'CREATE_PATIENT') as nurse_checkins,
        CASE 
            WHEN role = 'DOCTOR' THEN (SELECT COUNT(*) FROM reports WHERE doctor_id = staff.id)
            WHEN role = 'NURSE' THEN (SELECT COUNT(*) FROM audit_logs WHERE user_id = staff.id AND action = 'CREATE_PATIENT')
            WHEN role = 'LAB_TECH' THEN (SELECT COUNT(*) FROM lab_records WHERE technologist_id = staff.id)
            ELSE 0
        END as total_reports
    FROM staff
    WHERE id = $1;
`;

const getWeeklyActivityQuery = `
    SELECT 
        TO_CHAR(created_at, 'Dy') as day_name,
        COUNT(*) as count,
        EXTRACT(DOW FROM created_at) as dow
    FROM queue
    WHERE created_at::date >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY day_name, dow
    ORDER BY dow ASC;
`;

const getOverviewCountsQuery = `
    SELECT 
        (SELECT COUNT(*) FROM patients) as patient,
        (SELECT COUNT(*) FROM staff WHERE role = 'DOCTOR') as doctor,
        (SELECT COUNT(*) FROM staff WHERE role = 'ADMIN') as admin,
        (SELECT COUNT(*) FROM staff WHERE role = 'LAB_TECH') as lab_tech
    ;
`;

const getOperationalLogQuery = `
    (SELECT r.date::text as timestamp, s.name as staff_name, s.role, 'Consultation' as action, r.patient_id as target
     FROM reports r JOIN staff s ON r.doctor_id = s.id)
    UNION ALL
    (SELECT al.timestamp::text, s.name as staff_name, s.role, 'Registration' as action, al.target_id as target
     FROM audit_logs al JOIN staff s ON al.user_id = s.id WHERE al.action = 'CREATE_PATIENT')
    UNION ALL
    (SELECT lr.submission_date::text, s.name as staff_name, s.role, 'Lab Test' as action, p.studentid as target
     FROM lab_records lr 
     JOIN laboratory_technologists lt ON lr.technologist_id = lt.id 
     JOIN staff s ON lt.email = s.email
     JOIN lab_test_requests lreq ON lr.request_id = lreq.id
     JOIN patients p ON lreq.patient_id = p.id)
    ORDER BY timestamp DESC LIMIT 100;
`;

module.exports = {
  getDailyStatsQuery,
  getRoleDistributionQuery,
  getWorkloadQuery,
  getOverviewCountsQuery,
  getWeeklyActivityQuery,
  getOperationalLogQuery,
  getIndividualWorkloadQuery
};
