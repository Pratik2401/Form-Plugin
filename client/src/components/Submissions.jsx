import { useState, useEffect } from 'react';
import { getSubmissions } from '../api/formApi';
import { Card, ListGroup, Button, Form, Table, Alert, Row, Col, Badge, Spinner, Dropdown, InputGroup } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

export default function Submissions({ form }) {
  const [submissions, setSubmissions] = useState([]);
  const [email, setEmail] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { isAdmin } = useAuth();
  
  useEffect(() => {
    setLoading(true);
    getSubmissions(form._id || form.id)
      .then(data => {
        setSubmissions(data);
        setError('');
      })
      .catch(err => {
        setError(err.message || 'Failed to load submissions');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [form]);
  
  const handleExport = () => {
    const token = localStorage.getItem('token');
    window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/forms/${form._id || form.id}/submissions/csv?token=${token}`, '_blank');
  };
  
  const handleFilter = () => {
    if (!email) return;
    setFiltered(submissions.filter(s => s.data.email === email));
  };
  
  // Filter submissions based on search term
  const filteredSubmissions = submissions.filter(submission => {
    if (!searchTerm) return true;
    
    // Search in email
    if (submission.data.email.toLowerCase().includes(searchTerm.toLowerCase())) {
      return true;
    }
    
    // Search in other fields
    for (const field of form.fields) {
      const value = submission.data[field.label];
      if (value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())) {
        return true;
      }
    }
    
    return false;
  });
  
  // Pagination
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const paginatedSubmissions = filteredSubmissions.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  if (loading) return (
    <div className="text-center py-5">
      <Spinner animation="border" variant="primary" />
      <p className="mt-3 mb-0">Loading submissions...</p>
    </div>
  );
  
  if (error) return (
    <div className="alert alert-danger">{error}</div>
  );
  
  const SubmissionDetails = ({ submission }) => (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Header className="bg-white py-3">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Submission Details</h5>
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={() => setSelectedSubmission(null)}
          >
            <i className="bi bi-arrow-left me-1"></i> Back to List
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <Row className="mb-4">
          <Col md={6}>
            <div className="mb-3">
              <div className="text-muted small">Submitted By</div>
              <div className="d-flex align-items-center">
                <div className="bg-light rounded-circle p-2 me-2">
                  <i className="bi bi-person text-primary"></i>
                </div>
                <h6 className="mb-0">{submission.data.email}</h6>
              </div>
            </div>
          </Col>
          <Col md={6} className="text-md-end">
            <div className="mb-3">
              <div className="text-muted small">Submission Date</div>
              <div className="d-flex align-items-center justify-content-md-end">
                <div className="bg-light rounded-circle p-2 me-2">
                  <i className="bi bi-calendar text-primary"></i>
                </div>
                <h6 className="mb-0">{formatDate(submission.submittedAt)}</h6>
              </div>
            </div>
          </Col>
        </Row>
        
        <h6 className="border-bottom pb-2 mb-3">Form Responses</h6>
        
        <div className="table-responsive">
          <Table className="table-borderless">
            <tbody>
              {Object.entries(submission.data)
                .filter(([key]) => key !== 'email')
                .map(([key, value], j) => (
                  <tr key={j}>
                    <td style={{ width: '30%' }} className="fw-bold text-muted">{key}</td>
                    <td>{value || '-'}</td>
                  </tr>
                ))
              }
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
  
  return (
    <>
      {selectedSubmission ? (
        <SubmissionDetails submission={selectedSubmission} />
      ) : (
        <Card className="border-0 shadow-sm mb-4">
          <Card.Header className="bg-white py-3">
            <div className="d-flex justify-content-between align-items-center flex-wrap">
              <h5 className="mb-0">Submissions for: {form.name}</h5>
              <Badge bg="primary" pill className="ms-2">{submissions.length}</Badge>
            </div>
          </Card.Header>
          <Card.Body>
            {isAdmin() ? (
              <>
                <Row className="mb-4">
                  <Col md={6} lg={4}>
                    <InputGroup>
                      <InputGroup.Text className="bg-light">
                        <i className="bi bi-search"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Search submissions..."
                        value={searchTerm}
                        onChange={e => {
                          setSearchTerm(e.target.value);
                          setPage(1); // Reset to first page on search
                        }}
                      />
                    </InputGroup>
                  </Col>
                  <Col md={6} lg={8} className="d-flex justify-content-md-end mt-3 mt-md-0">
                    <Button 
                      variant="outline-success" 
                      className="me-2"
                      onClick={handleExport}
                    >
                      <i className="bi bi-file-earmark-excel me-1"></i> Export CSV
                    </Button>
                    <Dropdown>
                      <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
                        <i className="bi bi-gear me-1"></i> Options
                      </Dropdown.Toggle>

                      <Dropdown.Menu align="end">
                        <Dropdown.Item onClick={() => setItemsPerPage(10)}>Show 10 per page</Dropdown.Item>
                        <Dropdown.Item onClick={() => setItemsPerPage(25)}>Show 25 per page</Dropdown.Item>
                        <Dropdown.Item onClick={() => setItemsPerPage(50)}>Show 50 per page</Dropdown.Item>
                        <Dropdown.Item onClick={() => setItemsPerPage(100)}>Show 100 per page</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </Col>
                </Row>
                
                {filteredSubmissions.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-inbox display-4 text-muted"></i>
                    <p className="mt-3 mb-0 text-muted">
                      {searchTerm ? 'No submissions match your search criteria' : 'No submissions yet'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <Table hover className="align-middle">
                        <thead>
                          <tr>
                            <th>Email</th>
                            {form.fields.slice(0, 3).map(field => (
                              <th key={field.label}>{field.label}</th>
                            ))}
                            <th>Submitted At</th>
                            <th className="text-end">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedSubmissions.map((submission, i) => (
                            <tr key={i}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="bg-light rounded-circle p-2 me-2">
                                    <i className="bi bi-person text-primary"></i>
                                  </div>
                                  {submission.data.email}
                                </div>
                              </td>
                              {form.fields.slice(0, 3).map(field => (
                                <td key={field.label}>
                                  {submission.data[field.label] ? (
                                    <span className="text-truncate d-inline-block" style={{ maxWidth: '150px' }}>
                                      {submission.data[field.label]}
                                    </span>
                                  ) : (
                                    <span className="text-muted">-</span>
                                  )}
                                </td>
                              ))}
                              <td>
                                <small className="text-muted">{formatDate(submission.submittedAt)}</small>
                              </td>
                              <td className="text-end">
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                  onClick={() => setSelectedSubmission(submission)}
                                >
                                  <i className="bi bi-eye me-1"></i> View
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="d-flex justify-content-between align-items-center mt-4">
                        <div className="text-muted small">
                          Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, filteredSubmissions.length)} of {filteredSubmissions.length} entries
                        </div>
                        <div>
                          <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            className="me-2"
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                          >
                            <i className="bi bi-chevron-left"></i> Previous
                          </Button>
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            disabled={page === totalPages}
                            onClick={() => setPage(page + 1)}
                          >
                            Next <i className="bi bi-chevron-right"></i>
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                <div className="mb-4">
                  <Form onSubmit={e => { e.preventDefault(); handleFilter(); }}>
                    <Form.Group className="mb-3">
                      <Form.Label>Enter your email to view your submissions</Form.Label>
                      <InputGroup>
                        <InputGroup.Text className="bg-light">
                          <i className="bi bi-envelope"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="email"
                          placeholder="Your email address"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                        />
                        <Button variant="primary" type="submit">
                          <i className="bi bi-search me-1"></i> Find My Submissions
                        </Button>
                      </InputGroup>
                    </Form.Group>
                  </Form>
                </div>
                
                {email && (
                  <div className="submissions-list">
                    {filtered.length === 0 ? (
                      <div className="text-center py-5 bg-light rounded">
                        <i className="bi bi-inbox display-4 text-muted"></i>
                        <p className="mt-3 mb-0 text-muted">No submissions found for this email.</p>
                      </div>
                    ) : (
                      <div className="list-group">
                        {filtered.map((submission, i) => (
                          <div key={i} className="list-group-item list-group-item-action p-4 mb-3 border rounded shadow-sm">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h6 className="mb-0">
                                <i className="bi bi-calendar-check me-2 text-primary"></i>
                                Submitted on {formatDate(submission.submittedAt)}
                              </h6>
                              <Badge bg="primary" pill>#{i + 1}</Badge>
                            </div>
                            
                            <div className="table-responsive">
                              <Table size="sm" className="mb-0">
                                <tbody>
                                  {Object.entries(submission.data)
                                    .filter(([key]) => key !== 'email')
                                    .map(([key, value], j) => (
                                      <tr key={j}>
                                        <td style={{ width: '30%' }} className="fw-bold text-muted">{key}</td>
                                        <td>{value || '-'}</td>
                                      </tr>
                                    ))
                                  }
                                </tbody>
                              </Table>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </Card.Body>
        </Card>
      )}
    </>
  );
}
