
import { useState, useEffect } from 'react';
import { getForms } from '../api/formApi';
import { Card, ListGroup, Button, Badge, Row, Col, Form, Spinner, Table } from 'react-bootstrap';

export default function FormList({ onSelectForm, isAdmin = false, limit = 0, compact = false }) {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  
  useEffect(() => {
    setLoading(true);
    getForms()
      .then(data => {
        setForms(data);
        setError('');
      })
      .catch(err => {
        setError('Failed to load forms');
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  
  // Filter and sort forms
  const filteredForms = forms
    .filter(form => {
      if (!searchTerm) return true;
      return form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             form.description?.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';
      
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue || Date.now());
        bValue = new Date(bValue || Date.now());
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  
  // Apply limit if specified
  const displayedForms = limit > 0 ? filteredForms.slice(0, limit) : filteredForms;
  
  const getFormattedDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  if (loading) return (
    <div className="text-center py-4">
      <Spinner animation="border" variant="primary" />
      <p className="mt-2 mb-0">Loading forms...</p>
    </div>
  );
  
  if (error) return (
    <div className="alert alert-danger">{error}</div>
  );
  
  if (compact) {
    return (
      <div className="table-responsive">
        <Table hover className="align-middle mb-0">
          <thead>
            <tr>
              <th>Form Name</th>
              <th className="text-center">Fields</th>
              <th className="text-center">Submissions</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedForms.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4 text-muted">No forms available</td>
              </tr>
            ) : (
              displayedForms.map(form => (
                <tr key={form._id || form.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="form-icon bg-light rounded p-2 me-2">
                        <i className="bi bi-file-earmark-text text-primary"></i>
                      </div>
                      <div>
                        <h6 className="mb-0">{form.name}</h6>
                        {form.description && <small className="text-muted">{form.description}</small>}
                      </div>
                    </div>
                  </td>
                  <td className="text-center">
                    <Badge bg="info" pill>{form.fields?.length || 0}</Badge>
                  </td>
                  <td className="text-center">
                    <Badge bg="success" pill>{form.submissionsCount || 0}</Badge>
                  </td>
                  <td className="text-end">
                    {isAdmin && (
                      <Button 
                        variant="outline-info" 
                        size="sm" 
                        className="me-1"
                        onClick={() => onSelectForm(form, 'submissions')}
                      >
                        <i className="bi bi-inbox me-1"></i> Submissions
                      </Button>
                    )}
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={() => onSelectForm(form, 'form')}
                    >
                      {isAdmin ? <><i className="bi bi-eye me-1"></i> Preview</> : <><i className="bi bi-pencil me-1"></i> Open</>}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    );
  }
  
  return (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Header className="bg-white py-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <h5 className="mb-0">Available Forms</h5>
          <div className="d-flex align-items-center">
            <Form.Control
              type="text"
              placeholder="Search forms..."
              className="me-2"
              style={{ width: '200px' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Form.Select 
              style={{ width: '150px' }}
              value={`${sortBy}-${sortDirection}`}
              onChange={e => {
                const [field, direction] = e.target.value.split('-');
                setSortBy(field);
                setSortDirection(direction);
              }}
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
            </Form.Select>
          </div>
        </div>
      </Card.Header>
      <Card.Body className="p-0">
        {displayedForms.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-clipboard-x display-4 text-muted"></i>
            <p className="mt-3 mb-0 text-muted">
              {searchTerm ? 'No forms match your search criteria' : 'No forms available yet'}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead>
                <tr>
                  <th>Form Name</th>
                  <th>Created</th>
                  <th className="text-center">Fields</th>
                  <th className="text-center">Submissions</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedForms.map(form => (
                  <tr key={form._id || form.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="form-icon bg-light rounded p-2 me-2">
                          <i className="bi bi-file-earmark-text text-primary"></i>
                        </div>
                        <div>
                          <h6 className="mb-0">{form.name}</h6>
                          {form.description && <small className="text-muted">{form.description}</small>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <small className="text-muted">{getFormattedDate(form.createdAt)}</small>
                    </td>
                    <td className="text-center">
                      <Badge bg="info" pill>{form.fields?.length || 0}</Badge>
                    </td>
                    <td className="text-center">
                      <Badge bg="success" pill>{form.submissionsCount || 0}</Badge>
                    </td>
                    <td className="text-end">
                      {isAdmin && (
                        <Button 
                          variant="outline-info" 
                          size="sm" 
                          className="me-1"
                          onClick={() => onSelectForm(form, 'submissions')}
                        >
                          <i className="bi bi-inbox me-1"></i> Submissions
                        </Button>
                      )}
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        onClick={() => onSelectForm(form, 'form')}
                      >
                        {isAdmin ? <><i className="bi bi-eye me-1"></i> Preview</> : <><i className="bi bi-pencil me-1"></i> Open</>}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
