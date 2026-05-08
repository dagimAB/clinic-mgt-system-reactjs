import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetSystemConfig, UpdateSystemConfig, TriggerBackup } from "../../../../../Redux/auth/action";
import Sidebar from "../../GlobalFiles/Sidebar";
import { Tabs, Form, Input, Button, Checkbox, Card, message, Statistic, Divider, Space, Typography, Row, Col, Tag } from "antd";
import { SettingOutlined, CloudUploadOutlined, FileTextOutlined, SaveOutlined, ReloadOutlined } from "@ant-design/icons";
import { Navigate } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

const SystemConfig = () => {
  const dispatch = useDispatch();
  const { data } = useSelector((store) => store.auth);
  const [form] = Form.useForm();
  const [backupForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [backupUpdateLoading, setBackupUpdateLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [lastBackup, setLastBackup] = useState(null);

  useEffect(() => {
    // Load initial certificate settings
    dispatch(GetSystemConfig("certificate_settings")).then(res => {
        if (res) {
            form.setFieldsValue(res);
        }
    });

    // Load initial backup settings
    dispatch(GetSystemConfig("backup_settings")).then(res => {
        if (res) {
            backupForm.setFieldsValue(res);
        }
    });
  }, [dispatch]);

  const onUpdateConfig = (values) => {
    setLoading(true);
    dispatch(UpdateSystemConfig({ key: "certificate_settings", value: values })).then(res => {
      if (res.message === "Configuration updated successfully") {
        message.success("Certificate settings updated!");
      } else {
        message.error("Failed to update configuration");
      }
      setLoading(false);
    });
  };

  const onUpdateBackupPolicy = (values) => {
    setBackupUpdateLoading(true);
    dispatch(UpdateSystemConfig({ key: "backup_settings", value: values })).then(res => {
      if (res.message === "Configuration updated successfully") {
        message.success("Backup policy updated!");
      } else {
        message.error("Failed to update backup policy");
      }
      setBackupUpdateLoading(false);
    });
  };

  const onTriggerBackup = () => {
    setBackupLoading(true);
    dispatch(TriggerBackup()).then(res => {
      if (res.message === "Backup initiated successfully") {
          message.success(res.message);
          setLastBackup(new Date().toLocaleString());
      } else {
          message.error("Backup failed");
      }
      setBackupLoading(false);
    });
  };

  if (data?.isAuthenticated === false) return <Navigate to={"/"} />;
  if (data?.user?.userType !== "admin") return <Navigate to={"/dashboard"} />;

  return (
    <div className="container" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f7fe' }}>
      <Sidebar />
      <div className="AfterSideBar" style={{ flex: 1, padding: "32px" }}>
        <Title level={2} style={{ color: '#1a237e', marginBottom: '8px' }}>
          <SettingOutlined /> System Configuration
        </Title>
        <Paragraph style={{ marginBottom: '24px', fontSize: '16px', color: '#64748b' }}>
          Manage global application settings, document templates, and system safety procedures.
        </Paragraph>

        <Card style={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <Tabs defaultActiveKey="1" size="large">
            
            {/* TAB 1: CERTIFICATE SETTINGS */}
            <TabPane 
                tab={<span><FileTextOutlined />Certificate Settings</span>} 
                key="1"
            >
              <div style={{ padding: '24px 0' }}>
                <Title level={4}>Medical Certificate Template</Title>
                <Text type="secondary">Customize the fields and branding for student medical clearance forms.</Text>
                <Divider />
                
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onUpdateConfig}
                  style={{ maxWidth: '600px' }}
                >
                  <Form.Item label="Template Name" name="template" required>
                    <Input placeholder="e.g. Standard Medical Certificate" size="large" />
                  </Form.Item>

                  <Form.Item label="University Logo URL" name="logo_url">
                    <Input placeholder="https://aastu.edu.et/logo.png" size="large" prefix={<CloudUploadOutlined />} />
                  </Form.Item>

                  <Form.Item label="Enable Standard Fields" name="fields">
                    <Checkbox.Group style={{ width: '100%' }}>
                      <Row>
                        <Col span={12}><Checkbox value="student_id">Student ID</Checkbox></Col>
                        <Col span={12}><Checkbox value="diagnosis">Diagnosis</Checkbox></Col>
                        <Col span={12}><Checkbox value="rest_period">Recommended Rest</Checkbox></Col>
                        <Col span={12}><Checkbox value="issue_date">Issue Date</Checkbox></Col>
                        <Col span={12}><Checkbox value="doctor_signature">Doctor Signature</Checkbox></Col>
                        <Col span={12}><Checkbox value="stamp">Official Stamp</Checkbox></Col>
                      </Row>
                    </Checkbox.Group>
                  </Form.Item>

                  <Form.Item>
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        icon={<SaveOutlined />} 
                        loading={loading}
                        size="large"
                        style={{ height: '50px', borderRadius: '8px', width: '250px' }}
                    >
                      Save Configuration
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </TabPane>

            {/* TAB 2: BACKUP & RETENTION */}
            <TabPane 
                tab={<span><CloudUploadOutlined />Backup & Security</span>} 
                key="2"
            >
              <div style={{ padding: '24px 0' }}>
                <Row gutter={24}>
                  <Col span={12}>
                    <Title level={4}>Configure Backup Policy</Title>
                    <Paragraph>
                        Define how often the system should secure clinical records and user data.
                    </Paragraph>
                    
                    <Form
                        form={backupForm}
                        layout="vertical"
                        onFinish={onUpdateBackupPolicy}
                        style={{ backgroundColor: '#fffbe6', padding: '20px', border: '1px solid #ffe58f', borderRadius: '8px' }}
                    >
                        <Form.Item label="Backup Schedule (Time)" name="schedule" required>
                            <Input placeholder="e.g. 02:00 AM" />
                        </Form.Item>
                        
                        <Form.Item label="Retention Period (Days)" name="retention_days" required>
                            <Input type="number" placeholder="90" />
                        </Form.Item>

                        <Form.Item label="Backup Format" name="format">
                            <Input disabled />
                        </Form.Item>

                        <Button 
                            type="dashed" 
                            htmlType="submit" 
                            loading={backupUpdateLoading}
                            style={{ width: '100%', marginBottom: '10px' }}
                        >
                            Update Policy
                        </Button>
                    </Form>

                    <Divider />
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <Button 
                            type="primary" 
                            size="large" 
                            icon={<ReloadOutlined />} 
                            loading={backupLoading}
                            onClick={onTriggerBackup}
                            style={{ height: '50px', borderRadius: '8px', backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                        >
                            Trigger Manual Backup Now
                        </Button>
                        <Text type="secondary">Manual backup logs are recorded in the audit logs for compliance.</Text>
                    </Space>
                  </Col>
                  
                  <Col span={12}>
                    <Card title="Latest Backup Status" bordered={false} style={{ boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.02)' }}>
                        <Statistic 
                            title="Database Health" 
                            value="Operational" 
                            valueStyle={{ color: '#3f8600' }} 
                        />
                        <Divider />
                        <Statistic 
                            title="Last Successful Backup" 
                            value={lastBackup || "2026-01-20 02:00:00"} 
                            valueStyle={{ fontSize: '16px' }}
                        />
                        <div style={{ marginTop: '24px' }}>
                            <Tag color="green">AUTO-SYNC ENABLED</Tag>
                            <Tag color="blue">ENCRYPTION ACTIVE</Tag>
                        </div>
                    </Card>
                  </Col>
                </Row>
              </div>
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default SystemConfig;
