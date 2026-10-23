import { supabase } from './supabase'

function requireSupabase() {
  if (!supabase) {
    throw new Error('Authentication is unavailable. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  return supabase
}

export const auth = {
  signUp: async ({ email, password, fullName }) => {
    const { data, error } = await requireSupabase().auth.signUp({
      email,
      password,
      options: {
        data: { display_name: fullName, full_name: fullName },
      },
    })
    if (error) throw error
    return data
  },

  signIn: async ({ email, password }) => {
    const { data, error } = await requireSupabase().auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  signOut: async () => {
    const { error } = await requireSupabase().auth.signOut()
    if (error) throw error
  },

  resetPassword: async (email) => {
    const { error } = await requireSupabase().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  },

  updatePassword: async (password) => {
    const { error } = await requireSupabase().auth.updateUser({ password })
    if (error) throw error
  },

  getSession: async () => {
    if (!supabase) return null
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  },

  onAuthStateChange: (callback) => {
    if (!supabase) {
      return { data: { subscription: { unsubscribe() {} } } }
    }
    return supabase.auth.onAuthStateChange(callback)
  },

  deleteAccount: async () => {
    const { api } = await import('./api')
    return api.delete('/api/account')
  },
}
