// ERPNext auth compatibility layer
// Replaces Supabase client — all auth goes through ERPNext session cookies

const API_URL = 'https://edigivault.m.frappe.cloud'

type AuthCallback = (event: string, session: any) => void
let authCallbacks: AuthCallback[] = []

const sessionFromStorage = () => {
  const user = localStorage.getItem('edv_user')
  if (!user) return null
  return { user: JSON.parse(user), access_token: 'erpnext-session' }
}

export const supabase = {
  auth: {
    async getSession() {
      const user = localStorage.getItem('edv_user')
      if (!user) return { data: { session: null } }
      return { data: { session: { user: JSON.parse(user), access_token: 'erpnext-session' } } }
    },

    async signInWithOtp({ phone }: { phone: string }) {
      return { error: { message: 'Please use email/password login for ERPNext' } }
    },

    async verifyOtp({ phone, token }: { phone: string; token: string }) {
      return { data: { user: null }, error: { message: 'Use email login' } }
    },

    async signOut() {
      try { await fetch(`${API_URL}/api/method/logout`, { credentials: 'include' }) } catch {}
      localStorage.removeItem('edv_user')
      localStorage.removeItem('edv_fullname')
      authCallbacks.forEach(cb => cb('SIGNED_OUT', null))
      return { error: null }
    },

    onAuthStateChange(callback: AuthCallback) {
      authCallbacks.push(callback)
      const session = sessionFromStorage()
      if (session) callback('INITIAL_SESSION', session)
      return { data: { subscription: { unsubscribe: () => { authCallbacks = authCallbacks.filter(cb2 => cb2 !== callback) } } } }
    },
  },

  async rpc(fn: string, params?: any) {
    return { data: null, error: null }
  },

  storage: {
    from(bucket: string) {
      return {
        upload: async () => ({ data: null, error: { message: 'Use ERPNext file upload' } }),
        getPublicUrl: (path: string) => ({ data: { publicUrl: `${API_URL}/files/${path}` } }),
      }
    }
  },

  from(table: string) {
    return {
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }), single: async () => ({ data: null, error: null }) }), data: [], error: null }),
      insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
      update: () => ({ eq: async () => ({ error: null }) }),
    }
  },
}
