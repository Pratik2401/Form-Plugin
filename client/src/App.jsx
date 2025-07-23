import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import FormBuilder from './components/FormBuilder';
import FormList from './components/FormList';
import FormSubmit from './components/FormSubmit';
import Submissions from './components/Submissions';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import { Container, Navbar, Nav, Button, Row, Col, Spinner } from 'react-bootstrap';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppNavbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  return (
    <Navbar bg="white" expand="md" className="shadow-sm mb-4 py-3">
      <Container>
        <Navbar.Brand href="/" className="fw-bold d-flex align-items-center">
          <div className="brand-icon me-2 bg-primary bg-gradient text-white rounded p-2">
            <i className="bi bi-file-earmark-text"></i>
          </div>
          <span>Smart Form Builder</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav" className="justify-content-end">
          <Nav>
            {user ? (
              <>
                {isAdmin() && (
                  <Nav.Link 
                    onClick={() => navigate('/admin')} 
                    className="me-3 d-flex align-items-center"
                  >
                    <i className="bi bi-speedometer2 me-1"></i> Dashboard
                  </Nav.Link>
                )}
                <div className="d-flex align-items-center">
                  <div className="me-3 text-muted d-none d-md-block">
                    <i className="bi bi-person-circle me-1"></i>
                    {user.email || 'Admin'}
                  </div>
                  <Button variant="outline-danger" size="sm" onClick={logout}>
                    <i className="bi bi-box-arrow-right me-1"></i> Logout
                  </Button>
                </div>
              </>
            ) : (
              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={() => navigate('/login')}
              >
                <i className="bi bi-shield-lock me-1"></i> Admin Login
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
      <style jsx>{`
        .brand-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }
      `}</style>
    </Navbar>
  );
}

function Footer() {
  return (
    <footer className="app-footer">
      <Container>
        <Row>
          <Col md={12} className="text-center">
            <p className="mb-0">&copy; {new Date().getFullYear()} Smart Form Builder. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

function Home() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const handleSelectForm = (form, viewType = 'form') => {
    if (viewType === 'submissions' && isAdmin()) {
      navigate(`/form/${form._id || form.id}/submissions`);
    } else {
      navigate(`/form/${form._id || form.id}`);
    }
  };
  
  return (
    <div className="app-container">
      <AppNavbar />
      <div className="content-container">
        <Container fluid="md" className="py-4">
          {isAdmin() ? (
            <AdminDashboard onSelectForm={handleSelectForm} />
          ) : (
            <>
              <div className="text-center mb-5">
                <h1 className="display-5 fw-bold mb-3">Smart Form Builder</h1>
                <p className="lead text-muted mb-4">Create and submit forms with our easy-to-use platform</p>
              </div>
              <FormList onSelectForm={handleSelectForm} />
            </>
          )}
        </Container>
      </div>
      <Footer />
    </div>
  );
}

function FormPage() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSubmissions, setShowSubmissions] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/forms/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load form');
        return res.json();
      })
      .then(data => {
        setForm(data);
        setError('');
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);
  
  if (loading) return (
    <div className="app-container">
      <AppNavbar />
      <div className="content-container">
        <Container fluid="md" className="py-4">
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading form...</p>
          </div>
        </Container>
      </div>
      <Footer />
    </div>
  );
  
  if (error || !form) return (
    <div className="app-container">
      <AppNavbar />
      <div className="content-container">
        <Container fluid="md" className="py-4">
          <div className="text-center py-5">
            <div className="alert alert-danger d-inline-block">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error || 'Form not found'}
            </div>
            <div className="mt-4">
              <Button variant="outline-primary" onClick={() => window.history.back()}>
                <i className="bi bi-arrow-left me-2"></i> Go Back
              </Button>
            </div>
          </div>
        </Container>
      </div>
      <Footer />
    </div>
  );
  
  return (
    <div className="app-container">
      <AppNavbar />
      <div className="content-container">
        <Container fluid="md" className="py-4">
          {!showSubmissions ? (
            <>
              <div className="text-center mb-5">
                <h2 className="mb-2">{form.name}</h2>
                {form.description && <p className="text-muted">{form.description}</p>}
              </div>
              <FormSubmit form={form} onSubmitted={() => setShowSubmissions(true)} />
            </>
          ) : (
            <Submissions form={form} />
          )}
        </Container>
      </div>
      <Footer />
    </div>
  );
}

function FormSubmissionsPage() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAdmin } = useAuth();
  
  useEffect(() => {
    if (!isAdmin()) return;
    
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/forms/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load form');
        return res.json();
      })
      .then(data => {
        setForm(data);
        setError('');
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, isAdmin]);
  
  if (!isAdmin()) return <Navigate to="/login" />;
  
  if (loading) return (
    <div className="app-container">
      <AppNavbar />
      <div className="content-container">
        <Container fluid="md" className="py-4">
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading submissions...</p>
          </div>
        </Container>
      </div>
      <Footer />
    </div>
  );
  
  if (error || !form) return (
    <div className="app-container">
      <AppNavbar />
      <div className="content-container">
        <Container fluid="md" className="py-4">
          <div className="text-center py-5">
            <div className="alert alert-danger d-inline-block">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error || 'Form not found'}
            </div>
            <div className="mt-4">
              <Button variant="outline-primary" onClick={() => window.history.back()}>
                <i className="bi bi-arrow-left me-2"></i> Go Back
              </Button>
            </div>
          </div>
        </Container>
      </div>
      <Footer />
    </div>
  );
  
  return (
    <div className="app-container">
      <AppNavbar />
      <div className="content-container">
        <Container fluid="md" className="py-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="mb-1">{form.name}</h4>
              <p className="text-muted mb-0">Form Submissions</p>
            </div>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => window.history.back()}
            >
              <i className="bi bi-arrow-left me-1"></i> Back
            </Button>
          </div>
          <Submissions form={form} />
        </Container>
      </div>
      <Footer />
    </div>
  );
}

function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) return (
    <Container fluid="md" className="py-4">
      <div className="text-center py-5">Loading...</div>
    </Container>
  );
  
  if (!user || !isAdmin()) return <Navigate to="/login" />;
  
  return children;
}

function LoginPage() {
  const { user, isAdmin } = useAuth();
  
  if (user) {
    if (isAdmin()) {
      return <Navigate to="/admin" />;
    }
    return <Navigate to="/" />;
  }
  
  return (
    <div className="app-container">
      <AppNavbar />
      <div className="content-container">
        <Container fluid="md" className="py-5">
          <Row className="justify-content-center">
            <Col md={6} lg={5} xl={4}>
              <div className="text-center mb-4">
                <div className="brand-icon mx-auto mb-3 bg-primary bg-gradient text-white rounded-circle p-3" style={{ width: '80px', height: '80px' }}>
                  <i className="bi bi-shield-lock fs-1"></i>
                </div>
                <h2 className="mb-1">Admin Login</h2>
                <p className="text-muted">Sign in to access the admin dashboard</p>
              </div>
              <Login />
              <div className="text-center mt-4">
                <p className="text-muted small">
                  <i className="bi bi-info-circle me-1"></i>
                  Default credentials: admin@example.com / admin123
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      <Footer />
    </div>
  );
}

function AdminPage() {
  const navigate = useNavigate();
  
  const handleSelectForm = (form, viewType = 'form') => {
    if (viewType === 'submissions') {
      navigate(`/form/${form._id || form.id}/submissions`);
    } else {
      navigate(`/form/${form._id || form.id}`);
    }
  };
  
  return (
    <div className="app-container">
      <AppNavbar />
      <div className="content-container">
        <Container fluid="md" className="py-4">
          <AdminDashboard onSelectForm={handleSelectForm} />
        </Container>
      </div>
      <Footer />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin" element={
        <AdminRoute>
          <AdminPage />
        </AdminRoute>
      } />
      <Route path="/form/:id" element={<FormPage />} />
      <Route path="/form/:id/submissions" element={
        <AdminRoute>
          <FormSubmissionsPage />
        </AdminRoute>
      } />
    </Routes>
  );
}

function App() {
  // Check for role parameter in URL (for WordPress plugin integration)
  const queryParams = new URLSearchParams(window.location.search);
  const role = queryParams.get('role');
  
  useEffect(() => {
    // If role=admin is passed and no user is logged in, set a demo admin user
    if (role === 'admin' && !localStorage.getItem('user')) {
      localStorage.setItem('user', JSON.stringify({ role: 'admin', email: 'wordpress-admin' }));
      localStorage.setItem('token', 'wordpress-admin-token');
    }
    
    // Add Bootstrap icons CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css';
    document.head.appendChild(link);
    
    // Add Google Fonts
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
    document.head.appendChild(fontLink);
    
    return () => {
      document.head.removeChild(link);
      document.head.removeChild(fontLink);
    };
  }, [role]);
  
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
