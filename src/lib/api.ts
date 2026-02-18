import { supabase } from '@/lib/supabase'

const API_URL = 'https://edigivault-api.onrender.com'

const getToken = async () => {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token || null
}

export const api = {
  async get(path: string) {
    const token = await getToken()
    const res = await fetch(`${API_URL}${path}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    if (res.status === 401) {
      window.location.href = '/login'
      return null
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `API Error: ${res.status}`)
    }
    return res.json()
  },

  async post(path: string, body?: any) {
    const token = await getToken()
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (res.status === 401) {
      window.location.href = '/login'
      return null
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `API Error: ${res.status}`)
    }
    return res.json()
  },

  async patch(path: string, body?: any) {
    const token = await getToken()
    const res = await fetch(`${API_URL}${path}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `API Error: ${res.status}`)
    }
    return res.json()
  },
}

// Document helpers for ReviewDocuments page
export async function uploadDocument(serviceRequestId: string, docGroup: string, docName: string, file: File) {
  const token = await getToken();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('doc_group', docGroup);
  formData.append('doc_name', docName);
  const res = await fetch(`${API_URL}/v1/client/services/${serviceRequestId}/documents`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

export async function toggleNotAvailable(serviceRequestId: string, docName: string, notAvailable: boolean) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/v1/client/services/${serviceRequestId}/documents/toggle`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ doc_name: docName, not_available: notAvailable }),
  });
  if (!res.ok) throw new Error('Toggle failed');
  return res.json();
}

export async function submitServiceRequest(serviceRequestId: string, requiredDocNames: string[]) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/v1/client/services/${serviceRequestId}/submit`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ required_doc_names: requiredDocNames }),
  });
  if (!res.ok) throw new Error('Submit failed');
  return res.json();
}

// Legacy helpers — kept for backward compat with pages not yet wired
export function getStoredUser() {
  const raw = localStorage.getItem("auth_user")
  return raw ? JSON.parse(raw) : null
}

export function setStoredUser(user: { id: string; phone: string }) {
  localStorage.setItem("auth_user", JSON.stringify(user))
}

export function clearStoredUser() {
  localStorage.removeItem("auth_user")
}

export function isAuthenticated() {
  return !!getStoredUser()
}
