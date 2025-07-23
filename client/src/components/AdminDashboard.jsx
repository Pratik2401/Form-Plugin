import { useState } from 'react';
import { Card, Button, Tabs, Tab, Row, Col, Container, Badge } from 'react-bootstrap';
import FormBuilder from './FormBuilder';
import FormList from './FormList';
import { useAuth } from '../context/AuthContext';
import UserManagement from './UserManagement';
import { getForms } from '../api/formApi';

export default function AdminDashboard({ onSelectForm }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshForms, setRefreshForms] = useState(false);
  const [stats, setStats] = useState({ forms: 0, submissions: 0, users: 0 });
  const { user, logout } = useAuth();

  // Get dashboard stats
  useState(() => {
    getForms().then(forms => {
      let submissionsCount = 0;
      forms.forEach(form => {
        submissionsCount += form.submissionsCount || 0;
      });
      setStats({
        forms: forms.length,
        submissions: submissionsCount,
        users: 1 // Default to 1 for the admin user
      });
    });
  }, [refreshForms]);

  const StatCard = ({ title, value, icon, color }) => (
    <Card className="mb-4 border-0 shadow-sm">
      <Card.Body>
        <Row>
          <Col xs={8}>
            <div className="text-muted text-uppercase small">{title}</div>
            <h3 className="mt-2 mb-0">{value}</h3>
          </Col>
          <Col xs={4} className="text-end">
            <div className={`bg-${color} bg-opacity-10 p-3 rounded-circle d-inline-block`}>
              <i className={`bi bi-${icon} text-${color} fs-4`}></i>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );

  return (
    <div className="admin-dashboard">
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h4 className="mb-1">Welcome, {user?.email || 'Admin'}</h4>
              <p className="text-muted mb-0">Manage your forms and users</p>
            </div>
            <Button variant="outline-danger" size="sm" onClick={logout}>
              <i className="bi bi-box-arrow-right me-1"></i> Logout
            </Button>
          </div>
        </Card.Body>
      </Card>
      
      <Tabs
        activeKey={activeTab}
        onSelect={k => setActiveTab(k)}
        className="mb-4 nav-tabs-custom"
      >
        <Tab eventKey="dashboard" title={<><i className="bi bi-speedometer2 me-1"></i> Dashboard</>}>
          <Row>
            <Col md={4}>
              <StatCard title="Total Forms" value={stats.forms} icon="file-earmark-text" color="primary" />
            </Col>
            <Col md={4}>
              <StatCard title="Total Submissions" value={stats.submissions} icon="inbox" color="success" />
            </Col>
            <Col md={4}>
              <StatCard title="Users" value={stats.users} icon="people" color="info" />
            </Col>
          </Row>
          
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-bottom-0 py-3">
              <h5 className="mb-0">Recent Forms</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <FormList 
                key={refreshForms} 
                onSelectForm={onSelectForm} 
                isAdmin={true}
                limit={5}
                compact={true}
              />
            </Card.Body>
            <Card.Footer className="bg-white border-top-0 text-center">
              <Button variant="link" onClick={() => setActiveTab('forms')}>View All Forms</Button>
            </Card.Footer>
          </Card>
        </Tab>
        
        <Tab eventKey="forms" title={<><i className="bi bi-file-earmark-text me-1"></i> Forms</>}>
          <FormBuilder onFormCreated={() => setRefreshForms(!refreshForms)} />
          <FormList 
            key={refreshForms} 
            onSelectForm={onSelectForm} 
            isAdmin={true}
          />
        </Tab>
        
        <Tab eventKey="users" title={<><i className="bi bi-people me-1"></i> User Management</>}>
          <UserManagement />
        </Tab>
      </Tabs>
    </div>
  );
}