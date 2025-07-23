
import { useState } from 'react';
import { createForm } from '../api/formApi';
import { Card, Form, Button, Row, Col, ListGroup, InputGroup, Alert, Badge, Modal } from 'react-bootstrap';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const inputTypes = [
  { label: 'Text', value: 'text', icon: 'type' },
  { label: 'Number', value: 'number', icon: 'hash' },
  { label: 'Email', value: 'email', icon: 'envelope' },
  { label: 'Date', value: 'date', icon: 'calendar' },
  { label: 'Password', value: 'password', icon: 'lock' },
  { label: 'Textarea', value: 'textarea', icon: 'text-paragraph' },
  { label: 'Checkbox', value: 'checkbox', icon: 'check-square' },
  { label: 'Select', value: 'select', icon: 'list' },
  { label: 'Radio', value: 'radio', icon: 'record-circle' },
  { label: 'File', value: 'file', icon: 'file-earmark' },
];

function SortableField({ id, index, field, editField, removeField, inputTypes }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
    position: 'relative',
    borderLeft: '3px solid #0d6efd',
    paddingLeft: 25,
    padding: 16,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h6 className="mb-1">
            {field.label}
            {field.required && <span className="text-danger ms-1">*</span>}
          </h6>
          <div>
            <Badge bg="secondary" className="me-2">
              <i className={`bi bi-${inputTypes.find(t => t.value === field.type)?.icon || 'type'} me-1`}></i>
              {inputTypes.find(t => t.value === field.type)?.label || field.type}
            </Badge>
            {field.placeholder && (
              <small className="text-muted">Placeholder: {field.placeholder}</small>
            )}
          </div>
        </div>
        <div>
          <Button 
            variant="link" 
            size="sm" 
            className="text-primary"
            onClick={() => editField(index)}
          >
            <i className="bi bi-pencil"></i>
          </Button>
          <Button 
            variant="link" 
            size="sm" 
            className="text-danger"
            onClick={() => removeField(index)}
          >
            <i className="bi bi-trash"></i>
          </Button>
        </div>
      </div>
      <div className="drag-handle position-absolute top-50 start-0 translate-middle-y" {...listeners}>
        <i className="bi bi-grip-vertical text-muted"></i>
      </div>
    </div>
  );
}

export default function FormBuilder({ onFormCreated }) {
  const [fields, setFields] = useState([]);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [newField, setNewField] = useState({ 
    label: '', 
    type: 'text',
    required: true,
    placeholder: '',
    options: []
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [editingFieldIndex, setEditingFieldIndex] = useState(-1);
  const [showPreview, setShowPreview] = useState(false);

  const resetNewField = () => {
    setNewField({ 
      label: '', 
      type: 'text',
      required: true,
      placeholder: '',
      options: []
    });
  };

  const addField = () => {
    if (newField.label) {
      if (editingFieldIndex >= 0) {
        // Update existing field
        const updatedFields = [...fields];
        updatedFields[editingFieldIndex] = { ...newField };
        setFields(updatedFields);
        setEditingFieldIndex(-1);
      } else {
        // Add new field
        setFields([...fields, { ...newField }]);
      }
      resetNewField();
      setShowFieldModal(false);
    }
  };

  const editField = (index) => {
    setNewField({ ...fields[index] });
    setEditingFieldIndex(index);
    setShowFieldModal(true);
  };

  const removeField = (index) => {
    const updatedFields = [...fields];
    updatedFields.splice(index, 1);
    setFields(updatedFields);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex((_, idx) => `field-${idx}` === active.id);
      const newIndex = fields.findIndex((_, idx) => `field-${idx}` === over.id);
      setFields((fields) => arrayMove(fields, oldIndex, newIndex));
    }
  };

  const addOption = () => {
    setNewField({
      ...newField,
      options: [...newField.options, { label: '', value: '' }]
    });
  };

  const updateOption = (index, field, value) => {
    const updatedOptions = [...newField.options];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    setNewField({ ...newField, options: updatedOptions });
  };

  const removeOption = (index) => {
    const updatedOptions = [...newField.options];
    updatedOptions.splice(index, 1);
    setNewField({ ...newField, options: updatedOptions });
  };

  const handleCreateForm = async () => {
    if (!formName || fields.length === 0) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const data = await createForm({ 
        name: formName, 
        description: formDescription,
        fields 
      });
      setSuccess(`Form "${formName}" created successfully!`);
      setFields([]);
      setFormName('');
      setFormDescription('');
      if (onFormCreated) onFormCreated();
    } catch (err) {
      setError(err.message || 'Failed to create form');
    } finally {
      setLoading(false);
    }
  };

  const FieldModal = () => (
    <Modal show={showFieldModal} onHide={() => {
      setShowFieldModal(false);
      resetNewField();
      setEditingFieldIndex(-1);
    }} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{editingFieldIndex >= 0 ? 'Edit Field' : 'Add New Field'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-3">
          <Col md={8}>
            <Form.Group>
              <Form.Label>Field Label <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Full Name"
                value={newField.label}
                onChange={e => setNewField({ ...newField, label: e.target.value })}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Field Type <span className="text-danger">*</span></Form.Label>
              <Form.Select
                value={newField.type}
                onChange={e => setNewField({ ...newField, type: e.target.value })}
              >
                {inputTypes.map(t => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        
        <Row className="mb-3">
          <Col md={8}>
            <Form.Group>
              <Form.Label>Placeholder Text</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Enter your full name"
                value={newField.placeholder || ''}
                onChange={e => setNewField({ ...newField, placeholder: e.target.value })}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mt-4">
              <Form.Check
                type="checkbox"
                label="Required Field"
                checked={newField.required}
                onChange={e => setNewField({ ...newField, required: e.target.checked })}
              />
            </Form.Group>
          </Col>
        </Row>
        
        {(newField.type === 'select' || newField.type === 'radio' || newField.type === 'checkbox') && (
          <div className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Form.Label className="mb-0">Options</Form.Label>
              <Button variant="outline-primary" size="sm" onClick={addOption}>
                <i className="bi bi-plus"></i> Add Option
              </Button>
            </div>
            
            {newField.options.map((option, i) => (
              <Row key={i} className="mb-2 align-items-center">
                <Col xs={5}>
                  <Form.Control
                    placeholder="Label"
                    value={option.label}
                    onChange={e => updateOption(i, 'label', e.target.value)}
                  />
                </Col>
                <Col xs={5}>
                  <Form.Control
                    placeholder="Value"
                    value={option.value}
                    onChange={e => updateOption(i, 'value', e.target.value)}
                  />
                </Col>
                <Col xs={2}>
                  <Button variant="outline-danger" size="sm" onClick={() => removeOption(i)}>
                    <i className="bi bi-trash"></i>
                  </Button>
                </Col>
              </Row>
            ))}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => {
          setShowFieldModal(false);
          resetNewField();
          setEditingFieldIndex(-1);
        }}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={addField}
          disabled={!newField.label}
        >
          {editingFieldIndex >= 0 ? 'Update Field' : 'Add Field'}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  const FormPreview = () => (
    <Modal show={showPreview} onHide={() => setShowPreview(false)} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Form Preview: {formName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {formDescription && <p className="text-muted mb-4">{formDescription}</p>}
        
        <Form>
          {fields.map((field, i) => (
            <Form.Group key={i} className="mb-3">
              <Form.Label>
                {field.label}
                {field.required && <span className="text-danger ms-1">*</span>}
              </Form.Label>
              
              {field.type === 'text' && (
                <Form.Control type="text" placeholder={field.placeholder} />
              )}
              
              {field.type === 'textarea' && (
                <Form.Control as="textarea" rows={3} placeholder={field.placeholder} />
              )}
              
              {field.type === 'number' && (
                <Form.Control type="number" placeholder={field.placeholder} />
              )}
              
              {field.type === 'email' && (
                <Form.Control type="email" placeholder={field.placeholder} />
              )}
              
              {field.type === 'date' && (
                <Form.Control type="date" />
              )}
              
              {field.type === 'select' && (
                <Form.Select>
                  <option value="">Select an option</option>
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
                  name={`radio-${i}`}
                  id={`radio-${i}-${j}`}
                />
              ))}
              
              {field.type === 'checkbox' && field.options?.map((option, j) => (
                <Form.Check
                  key={j}
                  type="checkbox"
                  label={option.label}
                  id={`checkbox-${i}-${j}`}
                />
              ))}
              
              {field.type === 'file' && (
                <Form.Control type="file" />
              )}
            </Form.Group>
          ))}
          
          <Button variant="primary" disabled>
            Submit (Preview Only)
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowPreview(false)}>
          Close Preview
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <>
      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Create New Form</h5>
            <div>
              <Button 
                variant="outline-secondary" 
                size="sm" 
                className="me-2"
                onClick={() => setShowPreview(true)}
                disabled={fields.length === 0}
              >
                <i className="bi bi-eye me-1"></i> Preview
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => {
                  resetNewField();
                  setShowFieldModal(true);
                }}
              >
                <i className="bi bi-plus-lg me-1"></i> Add Field
              </Button>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form>
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Form Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Contact Form"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Description (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Brief description of this form"
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <div className="form-fields-container mb-4">
              <h6 className="mb-3">Form Fields</h6>
              
              {fields.length === 0 ? (
                <div className="text-center py-5 bg-light rounded">
                  <i className="bi bi-layout-text-window display-4 text-muted"></i>
                  <p className="mt-3 mb-0 text-muted">No fields added yet. Click "Add Field" to start building your form.</p>
                </div>
              ) : (
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext
                    items={fields.map((_, idx) => `field-${idx}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    {fields.map((field, index) => (
                      <SortableField
                        key={index}
                        id={`field-${index}`}
                        index={index}
                        field={field}
                        editField={editField}
                        removeField={removeField}
                        inputTypes={inputTypes}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </div>
            
            <div className="d-flex justify-content-end">
              <Button 
                variant="success" 
                onClick={handleCreateForm} 
                disabled={!formName || fields.length === 0 || loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-1"></i> Create Form
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
      
      <FieldModal />
      <FormPreview />
      
      <style>{`
        .field-item {
          border-left: 3px solid #0d6efd;
          padding-left: 25px !important;
        }
        .drag-handle {
          left: 8px;
          cursor: grab;
        }
        .nav-tabs-custom .nav-link {
          border: none;
          padding: 0.75rem 1rem;
          color: #6c757d;
          font-weight: 500;
        }
        .nav-tabs-custom .nav-link.active {
          color: #0d6efd;
          border-bottom: 2px solid #0d6efd;
        }
      `}</style>
    </>
  );
}
