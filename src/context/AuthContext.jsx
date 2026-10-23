import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    auth.getSession().then((s) => {
      if (!active) return
      setSession(s)
      setUser(s?.user ?? null)
      setLoading(false)
    }).catch(() => {
      if (active) setLoading(false)
    })

    const { data: listener } = auth.onAuthStateChange((_event, s) => {
      if (!active) return
      setSession(s)
      setUser(s?.user ?? null)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
