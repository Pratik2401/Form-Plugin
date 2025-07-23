import { useState } from 'react';
import { Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { login } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const data = await login(email, password);
      authLogin(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow">
      <Card.Body className="p-4">
        {error && (
          <Alert variant="danger" className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </Alert>
        )}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email Address</Form.Label>
            <InputGroup>
              <InputGroup.Text className="bg-light">
                <i className="bi bi-envelope"></i>
              </InputGroup.Text>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                className="py-2"
              />
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-4">
            <div className="d-flex justify-content-between">
              <Form.Label>Password</Form.Label>
            </div>
            <InputGroup>
              <InputGroup.Text className="bg-light">
                <i className="bi bi-lock"></i>
              </InputGroup.Text>
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="py-2"
              />
              <Button 
                variant="light" 
                onClick={() => setShowPassword(!showPassword)}
                className="border"
              >
                <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
              </Button>
            </InputGroup>
          </Form.Group>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={loading}
            className="w-100 py-2 mt-2"
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Signing in...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right me-2"></i> Sign In
              </>
            )}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}