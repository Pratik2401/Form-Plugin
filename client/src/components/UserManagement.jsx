import { useState } from 'react';
import { Form, Button, ListGroup, Alert } from 'react-bootstrap';
import { registerUser } from '../api/authApi';

export default function UserManagement() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      await registerUser(email, password, role);
      setSuccess(`User ${email} created successfully`);
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4>Create New User</h4>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Form onSubmit={handleSubmit} className="mb-4">
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Role</Form.Label>
          <Form.Select
            value={role}
            onChange={e => setRole(e.target.value)}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </Form.Select>
        </Form.Group>
        
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create User'}
        </Button>
      </Form>
      
      <div className="mt-3">
        <p className="text-muted">Default admin credentials:</p>
        <ListGroup>
          <ListGroup.Item>Email: admin@example.com</ListGroup.Item>
          <ListGroup.Item>Password: admin123</ListGroup.Item>
        </ListGroup>
      </div>
    </div>
  );
}