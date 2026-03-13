// e-DigiVault ERPNext API Client
// Backend: edigivault.m.frappe.cloud

const API_URL = 'https://edigivault.m.frappe.cloud'

export const api = {
  async get(path: string) {
    const res = await fetch(`${API_URL}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
    if (res.status === 401 || res.status === 403) return null
    return res.json()
  },

  async post(path: string, body?: any) {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (res.status === 401) throw new Error('Session expired. Please login again.')
    return res.json()
  },

  async patch(path: string, body?: any) {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
    return res.json()
  },
}

// ERPNext resource helpers
export const erpnext = {
  async list(doctype: string, fields?: string[], filters?: any[], limit = 20) {
    const qs = new URLSearchParams()
    if (fields) qs.set('fields', JSON.stringify(fields))
    if (filters) qs.set('filters', JSON.stringify(filters))
    qs.set('limit_page_length', String(limit))
    const res = await api.get(`/api/resource/${encodeURIComponent(doctype)}?${qs}`)
    return res?.data || []
  },

  async getDoc(doctype: string, name: string) {
    const res = await api.get(`/api/resource/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`)
    return res?.data || null
  },

  async count(doctype: string, filters?: any[]) {
    const qs = new URLSearchParams({ doctype })
    if (filters) qs.set('filters', JSON.stringify(filters))
    const res = await api.get(`/api/method/frappe.client.get_count?${qs}`)
    return res?.message || 0
  },

  async create(doctype: string, doc: Record<string, any>) {
    const res = await api.post(`/api/resource/${encodeURIComponent(doctype)}`, doc)
    return res?.data || null
  },

  async update(doctype: string, name: string, updates: Record<string, any>) {
    const res = await api.patch(`/api/resource/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`, updates)
    return res?.data || null
  },

  async login(usr: string, pwd: string) {
    const res = await api.post('/api/method/login', { usr, pwd })
    return res
  },

  async logout() {
    await api.get('/api/method/logout')
  },

  async getLoggedUser() {
    const res = await api.get('/api/method/frappe.auth.get_logged_user')
    return res?.message || null
  },
}

// Project/Property/Service creation helpers (ERPNext)
export async function createProject(title: string, description: string) {
  const result = await erpnext.create('DigiVault Project', { project_name: title, project_status: 'Pending' })
  return { project: { id: result?.name, pr_number: result?.name || `PROJ-${Date.now()}` } }
}

export async function createProperty(projectId: string, data: any) {
  const result = await erpnext.create('DigiVault Property', {
    client: data.clientId || null,
    property_name: data.propertyName || 'Unnamed Property',
    property_type: data.propertyType || null,
    property_address: [data.addressFields?.doorNo, data.addressFields?.buildingName, data.addressFields?.areaName].filter(Boolean).join(', ') || data.addressShort || null,
    survey_number: data.surveyNumber || null,
    total_area: data.sizeValue || null,
    area_unit: data.sizeUnit || null,
    state: data.addressFields?.state || 'Karnataka',
    district: data.addressFields?.district || null,
    taluk: data.addressFields?.taluk || null,
    pincode: data.addressFields?.pincode || null,
  })
  return { property: { id: result?.name } }
}

export async function createOrUpdateServiceRequest(projectId: string, propertyId: string, mainService: string, subService?: string) {
  const key = `edv_service_req_${projectId}`
  const stored = JSON.parse(localStorage.getItem(key) || '[]')
  const req = { id: crypto.randomUUID(), projectId, propertyId, mainService, subService, createdAt: new Date().toISOString() }
  stored.push(req)
  localStorage.setItem(key, JSON.stringify(stored))
  return { serviceRequest: { id: req.id } }
}

// Document upload — store locally for now, ERPNext file upload can be added later
export async function uploadDocument(serviceId: string, docGroup: string, docName: string, file: File) {
  const key = `edv_docs_${serviceId}`
  const stored = JSON.parse(localStorage.getItem(key) || '[]')
  stored.push({ id: crypto.randomUUID(), serviceId, docGroup, docName, fileName: file.name, fileType: file.type, fileSize: file.size, status: 'uploaded', createdAt: new Date().toISOString() })
  localStorage.setItem(key, JSON.stringify(stored))
  return stored[stored.length - 1]
}

export async function toggleNotAvailable(serviceId: string, docName: string, notAvailable: boolean) {
  const key = `na_docs_${serviceId}`
  const stored = JSON.parse(localStorage.getItem(key) || '{}')
  if (notAvailable) { stored[docName] = true } else { delete stored[docName] }
  localStorage.setItem(key, JSON.stringify(stored))
  return { success: true }
}

export async function submitServiceRequest(serviceRequestId: string, requiredDocNames: string[]) {
  localStorage.setItem(`edv_submitted_${serviceRequestId}`, 'true')
  return { success: true }
}

// Auth helpers (ERPNext session-based)
export function getStoredUser() {
  const raw = localStorage.getItem("edv_user")
  return raw ? JSON.parse(raw) : null
}

export function setStoredUser(user: { email: string; name: string }) {
  localStorage.setItem("edv_user", JSON.stringify(user))
}

export function clearStoredUser() {
  localStorage.removeItem("edv_user")
  localStorage.removeItem("edv_fullname")
}

export function isAuthenticated() {
  return !!getStoredUser()
}
