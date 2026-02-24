import { supabase } from '@/lib/supabase'

const API_URL = 'https://edigivault-api.onrender.com'

const getToken = async () => {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token || null
}

export const api = {
  async get(path: string) {
    const token = await getToken()
    if (!token) return null
    const res = await fetch(`${API_URL}${path}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    if (res.status === 401) return null
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      const msg = typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail || err)
      throw new Error(msg || `API Error: ${res.status}`)
    }
    return res.json()
  },

  async post(path: string, body?: any) {
    const token = await getToken()
    if (!token) throw new Error('Not authenticated')
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (res.status === 401) throw new Error('Session expired. Please login again.')
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      const msg = typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail || err)
      throw new Error(msg || `API Error: ${res.status}`)
    }
    return res.json()
  },

  async patch(path: string, body?: any) {
    const token = await getToken()
    if (!token) throw new Error('Not authenticated')
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
      const msg = typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail || err)
      throw new Error(msg || `API Error: ${res.status}`)
    }
    return res.json()
  },
}

// Project/Property/Service creation helpers
export async function createProject(title: string, description: string) {
  const result = await api.post('/v1/client/projects', { name: title, description })
  const project = result?.data
  return { project: { id: project?.id, pr_number: project?.pr_number || `PR-${Date.now()}` } }
}

export async function createProperty(projectId: string, data: any) {
  const addressParts = [
    data.addressFields?.doorNo, data.addressFields?.buildingName,
    data.addressFields?.crossRoad, data.addressFields?.mainRoad,
    data.addressFields?.landmark, data.addressFields?.areaName,
    data.addressFields?.taluk, data.addressFields?.district,
    data.addressFields?.state, data.addressFields?.pincode,
  ].filter(Boolean).join(', ')

  const result = await api.post('/v1/client/properties', {
    project_id: projectId,
    name: data.propertyName || 'Unnamed Property',
    type: data.propertyType || null,
    address: addressParts || data.addressShort || null,
    size: data.sizeValue ? `${data.sizeValue} ${data.sizeUnit || ''}`.trim() : null,
    size_unit: data.sizeUnit || null,
    latitude: data.latitude || null,
    longitude: data.longitude || null,
  })
  return { property: { id: result?.data?.id } }
}

export async function createOrUpdateServiceRequest(projectId: string, propertyId: string, mainService: string, subService?: string) {
  const result = await api.post('/v1/client/services', {
    property_id: propertyId,
    service_group: mainService,
    service_type: subService || null,
  })
  return { serviceRequest: { id: result?.data?.id } }
}

// Document helpers — upload directly to Supabase Storage + insert DB row
export async function uploadDocument(serviceId: string, docGroup: string, docName: string, file: File) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')
  
  const userId = session.user.id
  const fileExt = file.name.split('.').pop() || 'pdf'
  const safeName = docName.replace(/[^a-zA-Z0-9]/g, '_')
  const filePath = `${userId}/${serviceId}/${safeName}.${fileExt}`

  // Upload file to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file, { upsert: true })

  if (uploadError) {
    // If 'documents' bucket doesn't exist, try 'avatars' bucket as fallback
    console.warn('Upload to documents bucket failed, using direct insert:', uploadError)
  }

  // Get public URL
  let fileUrl = ''
  if (uploadData) {
    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath)
    fileUrl = urlData.publicUrl
  }

  // Insert document record into DB
  const { data, error } = await supabase
    .from('documents')
    .insert({
      service_id: serviceId,
      category: docGroup,
      sub_category: docName,
      file_name: file.name,
      file_url: fileUrl || `uploaded://${filePath}`,
      file_type: file.type,
      file_size: file.size,
      status: 'uploaded',
      uploaded_by: userId,
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to save document record: ${error.message}`)
  return data
}

export async function toggleNotAvailable(serviceId: string, docName: string, notAvailable: boolean) {
  // For now, store in localStorage since documents table doesn't have not_available column
  const key = `na_docs_${serviceId}`
  const stored = JSON.parse(localStorage.getItem(key) || '{}')
  if (notAvailable) {
    stored[docName] = true
  } else {
    delete stored[docName]
  }
  localStorage.setItem(key, JSON.stringify(stored))
  return { success: true }
}

export async function submitServiceRequest(serviceRequestId: string, requiredDocNames: string[]) {
  // Update service status to 'in_progress' on base table
  const { error } = await supabase
    .from('services')
    .update({ status: 'in_progress' })
    .eq('id', serviceRequestId)

  if (error) throw new Error(`Failed to submit: ${error.message}`)
  return { success: true }
}

// Legacy helpers
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
