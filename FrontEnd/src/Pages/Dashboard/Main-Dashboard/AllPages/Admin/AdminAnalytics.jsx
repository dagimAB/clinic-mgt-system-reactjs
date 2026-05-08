import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { GetAdminStats, GetTrendAnalytics } from "../../../../../Redux/auth/action";
import Sidebar from "../../GlobalFiles/Sidebar";
import { Row, Col, Card, Statistic, Typography, Table, Tag, Button, Space, Divider, message } from "antd";
import { 
  DashboardOutlined, 
  UserOutlined, 
  MedicineBoxOutlined, 
  FieldTimeOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  ArrowUpOutlined,
  LineChartOutlined
} from "@ant-design/icons";
import { Navigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const { Title, Text } = Typography;

const AdminAnalytics = () => {
  const { data } = useSelector((store) => store.auth);
  const [stats, setStats] = useState({ daily: {}, roles: [], workload: [], weekly: [], tracelog: [] });
  const [trends, setTrends] = useState({ illness: [], monthly: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const statsData = await GetAdminStats()(null);
    const trendsData = await GetTrendAnalytics()(null);
    setStats(statsData);
    setTrends(trendsData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);


  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(26, 35, 126);
    doc.text("Weekly Clinical Activity Summary", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Institutional Audit Period: ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()} - ${new Date().toLocaleDateString()}`, 14, 28);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 33);

    // Section 1: Vital Metrics
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("1. Clinic Performance Indicators (Weekly)", 14, 45);
    
    const weeklyTotal = stats.weekly.reduce((acc, curr) => acc + parseInt(curr.count), 0);
    
    autoTable(doc, {
      head: [['Weekly Metric', 'Current Value']],
      body: [
        ['Total Patients Served (this week)', weeklyTotal],
        ['Average Patient Waiting Time', `${stats.daily?.avg_wait_time || 15} mins`],
        ['Most Prevalent Health Condition', trends.illness[0]?.disease || "N/A"],
        ['On-Duty Physician Staffing', stats.daily?.total_doctors || 0]
      ],
      startY: 50,
      theme: 'grid',
    });

    // Section 2: Daily Volume
    doc.text("2. Daily Patient Throughput Breakdown", 14, doc.lastAutoTable.finalY + 15);
    
    const dailyData = stats.weekly.map(item => [item.day_name.trim(), `${item.count} students`]);
    autoTable(doc, {
      head: [['Operation Day', 'Registered Visits']],
      body: dailyData.length > 0 ? dailyData : [['Data unavailable for selected range', '0']],
      startY: doc.lastAutoTable.finalY + 20,
      headStyles: { fillColor: [79, 51, 234] }
    });

    // Section 3: Diagnostic Trends
    doc.text("3. Diagnostic Distribution (Top 10)", 14, doc.lastAutoTable.finalY + 15);
    const diseaseData = trends.illness.map(item => [item.disease, `${item.count} verified cases`]);
    autoTable(doc, {
      head: [['Medical Condition', 'Confirmed Count']],
      body: diseaseData,
      startY: doc.lastAutoTable.finalY + 20,
      headStyles: { fillColor: [46, 125, 50] }
    });

    doc.save(`Clinical_Activity_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    message.success("Weekly Activity Report exported successfully");
  };

  const handleExportStaffPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Clinical Staff Productivity Analysis", 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Official Audit Log: ${new Date().toLocaleString()}`, 14, 28);
    
    const tableData = stats.workload.map(item => {
      let metricName = "Activity";
      if (item.role === 'DOCTOR') metricName = "Consultations";
      if (item.role === 'NURSE') metricName = "Registrations";
      if (item.role === 'LAB_TECH') metricName = "Tests Completed";
      
      return [
        item.id,
        item.name,
        item.role,
        `${item.total_reports} ${metricName}`
      ];
    });

    autoTable(doc, {
      head: [['ID', 'Staff Name', 'Assigned Role', 'Performance Metric']],
      body: tableData,
      startY: 40,
      headStyles: { fillColor: [26, 35, 126] }
    });

    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text("Confidential Institutional Record. Performance is tracked based on verified system actions.", 14, doc.lastAutoTable.finalY + 15);

    doc.save("Staff_Productivity_Audit.pdf");
    message.success("Performance audit exported successfully");
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Sheet 1: Institutional Health Patterns
    const diseaseData = trends.illness.map(item => ({
        "Medical Condition": item.disease,
        "Total Cases (Verified)": item.count,
        "Risk Level": item.count > 5 ? "Elevated" : "Standard"
    }));
    const wsIllness = XLSX.utils.json_to_sheet(diseaseData);
    XLSX.utils.book_append_sheet(wb, wsIllness, "Diagnostic Trends");
    
    // Sheet 2: Monthly Patient Volume
    const monthlyData = trends.monthly.map(item => ({
        "Fiscal Month": item.month,
        "Total Admissions": item.count,
        "Comparison": "Baseline Year 2026"
    }));
    const wsTrends = XLSX.utils.json_to_sheet(monthlyData);
    XLSX.utils.book_append_sheet(wb, wsTrends, "Growth Trends");

    // Sheet 3: Staff Performance
    const workloadData = stats.workload.map(item => ({
        "Staff ID": item.id,
        "Name": item.name,
        "Role": item.role,
        "Verified Actions": item.total_reports
    }));
    const wsWorkload = XLSX.utils.json_to_sheet(workloadData);
    XLSX.utils.book_append_sheet(wb, wsWorkload, "Staff Activity");

    // Sheet 4: Operational Traceability (Staff-to-Patient Accountability)
    const traceData = (stats.tracelog || []).map(item => ({
        "Action Timestamp": item.timestamp,
        "Staff Member": item.staff_name,
        "Department/Role": item.role,
        "Action Type": item.action,
        "Target Patient (Student ID)": item.target
    }));
    const wsTrace = XLSX.utils.json_to_sheet(traceData);
    XLSX.utils.book_append_sheet(wb, wsTrace, "Operational Trace");

    XLSX.writeFile(wb, `AASTU_Institutional_Health_Audit_2026.xlsx`);
    message.success("Health & Growth Audit exported successfully (Multi-sheet)");
  };

  if (data?.isAuthenticated === false) return <Navigate to={"/"} />;
  if (data?.user?.userType !== "admin") return <Navigate to={"/dashboard"} />;

  const workloadColumns = [
    { title: 'Staff Name', dataIndex: 'name', key: 'name' },
    { title: 'Role', dataIndex: 'role', key: 'role', render: (role) => <Tag color="blue">{role}</Tag> },
    { 
        title: 'Workload (Activity Count)', 
        dataIndex: 'total_reports', 
        key: 'total_reports', 
        sorter: (a, b) => a.total_reports - b.total_reports,
        render: (count, record) => {
            let label = "Actions";
            if (record.role === 'DOCTOR') label = "Consultations";
            if (record.role === 'NURSE') label = "Registrations";
            if (record.role === 'LAB_TECH') label = "Tests Logged";
            return <span>{count} {label}</span>;
        }
    },
  ];

  return (
    <div className="container" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Sidebar />
      <div className="AfterSideBar" style={{ flex: 1, padding: "32px", overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <Title level={2} style={{ color: '#1a237e', marginBottom: '4px' }}>
              <DashboardOutlined /> Clinical Analytics & Reports
            </Title>
            <Text type="secondary">Real-time insights into clinic performance and health trends.</Text>
          </div>
          <Space>

            <Button icon={<FilePdfOutlined />} type="primary" danger onClick={handleExportPDF}>Weekly PDF</Button>
            <Button icon={<FilePdfOutlined />} type="primary" ghost onClick={handleExportStaffPDF}>Staff PDF</Button>
            <Button icon={<FileExcelOutlined />} style={{ backgroundColor: '#2e7d32', color: 'white' }} onClick={handleExportExcel}>Monthly Excel</Button>
          </Space>
        </div>

        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card bordered={false} className="stat-card">
              <Statistic
                title="Patients Served Today"
                value={stats.daily?.patients_served_today || 0}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#3f51b5' }}
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                <ArrowUpOutlined /> 12% from yesterday
              </Text>
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} className="stat-card">
              <Statistic
                title="Avg. Wait Time"
                value={stats.daily?.avg_wait_time || 15}
                precision={1}
                suffix="mins"
                prefix={<FieldTimeOutlined />}
                valueStyle={{ color: '#f44336' }}
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Within target range (20m)
              </Text>
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} className="stat-card">
              <Statistic
                title="Active Doctors"
                value={stats.daily?.total_doctors || 0}
                prefix={<MedicineBoxOutlined />}
                valueStyle={{ color: '#2e7d32' }}
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>On duty today</Text>
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} className="stat-card">
              <Statistic
                title="Common Illness"
                value={trends.illness[0]?.disease || "N/A"}
                prefix={<LineChartOutlined />}
                valueStyle={{ color: '#ffa000', fontSize: '20px' }}
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>Weekly trend leader</Text>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col span={14}>
            <Card title="Common Illnesses (This Week)" bordered={false} style={{ borderRadius: '12px' }}>
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa', borderRadius: '8px' }}>
                {trends.illness.length > 0 ? (
                  <div style={{ width: '100%', padding: '20px' }}>
                    {trends.illness.map(item => (
                      <div key={item.disease} style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <Text strong>{item.disease}</Text>
                          <Text type="secondary">{item.count} cases</Text>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px' }}>
                          <div style={{ width: `${(item.count / trends.illness[0].count) * 100}%`, height: '100%', backgroundColor: '#1a237e', borderRadius: '4px' }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Text type="secondary">No clinical data available for this period.</Text>
                )}
              </div>
            </Card>
          </Col>
          <Col span={10}>
            <Card title="Institutional Visit Growth" bordered={false} style={{ borderRadius: '12px', minHeight: '410px' }}>
              <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', backgroundColor: '#fafafa', borderRadius: '8px', padding: '20px', border: '1px solid #f0f0f0' }}>
                {trends.monthly.length > 0 ? trends.monthly.map((m, idx) => (
                  <div key={m.month} style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ 
                        height: `${(m.count / Math.max(...trends.monthly.map(x=>x.count), 1)) * 200}px`, 
                        width: '30px', 
                        backgroundColor: '#1a237e', 
                        borderRadius: '6px 6px 0 0',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        transition: 'all 0.5s',
                        marginBottom: '8px'
                    }}></div>
                    <Text strong style={{ fontSize: '12px' }}>{new Date(m.month + '-01').toLocaleString('default', { month: 'short' })}</Text>
                    <Text type="secondary" style={{ fontSize: '10px' }}>{m.count}</Text>
                  </div>
                )) : (
                    <Space direction="vertical" align="center" style={{ width: '100%' }}>
                      <LineChartOutlined style={{ fontSize: '48px', color: '#bdbdbd' }} />
                      <Text type="secondary">Waiting for clinical data...</Text>
                    </Space>
                )}
              </div>
            </Card>
          </Col>
        </Row>

        <Card title="Staff Performance (Reports Generated)" style={{ marginTop: '24px', borderRadius: '12px' }}>
          <Table 
            dataSource={stats.workload} 
            columns={workloadColumns} 
            pagination={{ pageSize: 5 }}
            loading={loading}
            rowKey="id"
          />
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
