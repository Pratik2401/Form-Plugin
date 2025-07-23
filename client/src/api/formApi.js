const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export async function createForm(form) {
  const res = await fetch(`${API_URL}/forms`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(form),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create form');
  }
  
  return res.json();
}

export async function getForms() {
  const res = await fetch(`${API_URL}/forms`);
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch forms');
  }
  
  return res.json();
}

export async function submitForm(formId, values) {
  const res = await fetch(`${API_URL}/forms/${formId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to submit form');
  }
  
  return res.json();
}

export async function getSubmissions(formId) {
  const res = await fetch(`${API_URL}/forms/${formId}/submissions`, {
    headers: getAuthHeaders()
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch submissions');
  }
  
  return res.json();
}
