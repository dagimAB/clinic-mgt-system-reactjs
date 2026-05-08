import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetAuditLogs } from "../../../../../Redux/auth/action";
import Sidebar from "../../GlobalFiles/Sidebar";
import { Table, Tag, Input, Space, Typography, Card, Tooltip, DatePicker, Button } from "antd";
import { HistoryOutlined, SearchOutlined, InfoCircleOutlined, DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import { Navigate } from "react-router-dom";

const { Title, Text } = Typography;

const AuditLogs = () => {
  const dispatch = useDispatch();
  const { data } = useSelector((store) => store.auth);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterDate, setFilterDate] = useState(null);

  const fetchLogs = () => {
    setLoading(true);
    dispatch(GetAuditLogs()).then(res => {
        setLogs(res || []);
        setLoading(false);
    });
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (data?.isAuthenticated === false) return <Navigate to={"/"} />;
  if (data?.user?.userType !== "admin") return <Navigate to={"/dashboard"} />;

  const columns = [
    {
      title: "Timestamp",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (date) => new Date(date).toLocaleString(),
      sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
      defaultSortOrder: 'descend',
    },
    {
      title: "User ID",
      dataIndex: "user_id",
      key: "user_id",
      render: (id) => <Tag color="blue">{id}</Tag>,
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (action) => {
        let color = 'default';
        if (action.includes('CREATE')) color = 'green';
        if (action.includes('UPDATE')) color = 'orange';
        if (action.includes('DELETE')) color = 'red';
        if (action.includes('BACKUP')) color = 'purple';
        if (action.includes('PASSWORD')) color = 'cyan';
        return <Tag color={color}>{action}</Tag>;
      },
      filters: [
        { text: 'CREATE_STAFF', value: 'CREATE_STAFF' },
        { text: 'UPDATE_STAFF', value: 'UPDATE_STAFF' },
        { text: 'TRIGGER_BACKUP', value: 'TRIGGER_BACKUP' },
        { text: 'RESET_PASSWORD', value: 'RESET_PASSWORD' },
        { text: 'UPDATE_CONFIG', value: 'UPDATE_CONFIG' },
      ],
      onFilter: (value, record) => record.action.includes(value),
    },
    {
      title: "Target",
      key: "target",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: '12px' }}>{record.target_table.toUpperCase()}</Text>
          <Text type="secondary" style={{ fontSize: '11px' }}>ID: {record.target_id}</Text>
        </Space>
      ),
    },
    {
      title: "Details",
      dataIndex: "details",
      key: "details",
      render: (details) => (
        <Tooltip title={JSON.stringify(details, null, 2)}>
          <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' }}>
            <InfoCircleOutlined style={{ marginRight: '8px' }} />
            {JSON.stringify(details)}
          </div>
        </Tooltip>
      ),
    },
  ];

  const exportToCSV = () => {
    const headers = ["Timestamp", "User ID", "Action", "Target Table", "Target ID", "Details"];
    const csvData = filteredLogs.map(log => [
      new Date(log.timestamp).toLocaleString(),
      log.user_id,
      log.action,
      log.target_table,
      log.target_id,
      JSON.stringify(log.details).replace(/"/g, '""')
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `AUDIT_LOGS_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchText.toLowerCase()) ||
      log.user_id.toLowerCase().includes(searchText.toLowerCase()) ||
      log.target_table.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesDate = !filterDate || log.timestamp.startsWith(filterDate);
    
    return matchesSearch && matchesDate;
  });

  return (
    <div className="container" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Sidebar />
      <div className="AfterSideBar" style={{ flex: 1, padding: "32px" }}>
        <Title level={2} style={{ color: '#1a237e' }}>
          <HistoryOutlined /> Audit & Compliance Logs
        </Title>
        <Text type="secondary">Monitor all system actions, configuration changes, and security events.</Text>

        <Card style={{ marginTop: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
               <DatePicker 
                 placeholder="Filter by Date" 
                 onChange={(date, dateString) => setFilterDate(dateString)} 
                 style={{ width: '200px' }}
               />
               <Button icon={<ReloadOutlined />} onClick={fetchLogs}>Refresh</Button>
            </Space>
            
            <Space>
              <Input
                placeholder="Search Action, User, Table..."
                prefix={<SearchOutlined />}
                style={{ width: '300px' }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Button 
                type="primary" 
                icon={<DownloadOutlined />} 
                onClick={exportToCSV}
                disabled={filteredLogs.length === 0}
              >
                Export CSV
              </Button>
            </Space>
          </div>

          <Table 
            columns={columns} 
            dataSource={filteredLogs} 
            rowKey="id" 
            loading={loading}
            pagination={{ pageSize: 12 }}
            scroll={{ x: 'max-content' }}
          />
        </Card>
      </div>
    </div>
  );
};
export default AuditLogs;