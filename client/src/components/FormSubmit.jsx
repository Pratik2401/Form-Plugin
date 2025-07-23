import { useState } from 'react';
import { Card, Form, Button, Alert, Row, Col, ProgressBar } from 'react-bootstrap';
import { submitForm } from '../api/formApi';

export default function FormSubmit({ form, onSubmitted }) {
  const [values, setValues] = useState({});
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [files, setFiles] = useState({});
  
  const handleChange = (label, value) => {
    setValues({ ...values, [label]: value });
  };
  
  const handleFileChange = (label, fileList) => {
    if (fileList.length > 0) {
      setFiles({ ...files, [label]: fileList[0] });
    } else {
      const newFiles = { ...files };
      delete newFiles[label];
      setFiles(newFiles);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      // In a real implementation, you would handle file uploads here
      await submitForm(form._id || form.id, { ...values, email });
      setSuccess('Form submitted successfully!');
      setValues({});
      setFiles({});
      
      // Wait a moment before showing the submissions view
      setTimeout(() => {
        if (onSubmitted) onSubmitted();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit form');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Header className="bg-white py-3">
        <h5 className="mb-0">{form.name}</h5>
        {form.description && <p className="text-muted mb-0 mt-1">{form.description}</p>}
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        {loading && (
          <div className="mb-4">
            <ProgressBar animated now={100} variant="primary" />
            <p className="text-center mt-2 mb-0">Submitting your form...</p>
          </div>
        )}
        
        <Form onSubmit={handleSubmit}>
          <Row className="mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  Email <span className="text-danger">*</span>
                </Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    disabled={loading || success}
                  />
                </div>
                <Form.Text className="text-muted">
                  We'll never share your email with anyone else.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <div className="form-fields">
            {form.fields.map((field, i) => (
              <Form.Group className="mb-4" key={i}>
                <Form.Label>
                  {field.label}
                  {field.required && <span className="text-danger ms-1">*</span>}
                </Form.Label>
                
                {field.type === 'text' && (
                  <Form.Control
                    type="text"
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    value={values[field.label] || ''}
                    onChange={e => handleChange(field.label, e.target.value)}
                    required={field.required}
                    disabled={loading || success}
                  />
                )}
                
                {field.type === 'textarea' && (
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    value={values[field.label] || ''}
                    onChange={e => handleChange(field.label, e.target.value)}
                    required={field.required}
                    disabled={loading || success}
                  />
                )}
                
                {field.type === 'number' && (
                  <Form.Control
                    type="number"
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    value={values[field.label] || ''}
                    onChange={e => handleChange(field.label, e.target.value)}
                    required={field.required}
                    disabled={loading || success}
                  />
                )}
                
                {field.type === 'email' && (
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <Form.Control
                      type="email"
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                      value={values[field.label] || ''}
                      onChange={e => handleChange(field.label, e.target.value)}
                      required={field.required}
                      disabled={loading || success}
                    />
                  </div>
                )}
                
                {field.type === 'date' && (
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-calendar"></i>
                    </span>
                    <Form.Control
                      type="date"
                      value={values[field.label] || ''}
                      onChange={e => handleChange(field.label, e.target.value)}
                      required={field.required}
                      disabled={loading || success}
                    />
                  </div>
                )}
                
                {field.type === 'select' && (
                  <Form.Select
                    value={values[field.label] || ''}
                    onChange={e => handleChange(field.label, e.target.value)}
                    required={field.required}
                    disabled={loading || success}
                  >
                    <option value="">{field.placeholder || 'Select an option'}</option>
                    {field.options?.map((option, j) => (
                      <option key={j} value={option.value}>{option.label}</option>
                    ))}
                  </Form.Select>
                )}
                
                {field.type === 'radio' && field.options?.map((option, j) => (
                  <Form.Check
                    key={j}
                    type="radio"
                    label={option.label}
                    name={`radio-${field.label}`}
                    id={`radio-${i}-${j}`}
                    value={option.value}
                    checked={values[field.label] === option.value}
                    onChange={e => handleChange(field.label, e.target.value)}
                    required={field.required && j === 0}
                    disabled={loading || success}
                  />
                ))}
                
                {field.type === 'checkbox' && field.options?.map((option, j) => {
                  const checkboxValues = values[field.label] || [];
                  return (
                    <Form.Check
                      key={j}
                      type="checkbox"
                      label={option.label}
                      id={`checkbox-${i}-${j}`}
                      checked={checkboxValues.includes(option.value)}
                      onChange={e => {
                        const currentValues = values[field.label] || [];
                        if (e.target.checked) {
                          handleChange(field.label, [...currentValues, option.value]);
                        } else {
                          handleChange(field.label, currentValues.filter(v => v !== option.value));
                        }
                      }}
                      disabled={loading || success}
                    />
                  );
                })}
                
                {field.type === 'file' && (
                  <Form.Control
                    type="file"
                    onChange={e => handleFileChange(field.label, e.target.files)}
                    required={field.required}
                    disabled={loading || success}
                  />
                )}
                
                {field.description && (
                  <Form.Text className="text-muted">
                    {field.description}
                  </Form.Text>
                )}
              </Form.Group>
            ))}
          </div>
          
          <div className="d-flex justify-content-center mt-4">
            <Button 
              type="submit" 
              variant="primary" 
              size="lg"
              disabled={loading || success}
              className="px-5"
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Submitting...
                </>
              ) : success ? (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Submitted
                </>
              ) : (
                'Submit Form'
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}
