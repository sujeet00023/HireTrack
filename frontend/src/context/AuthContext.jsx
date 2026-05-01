import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ht_user')) } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem('ht_token')
    if (!token) { setLoading(false); return }
    api.get('/auth/me')
      .then(r => { setUser(r.data.user); persistUser(r.data.user) })
      .catch(() => { localStorage.removeItem('ht_token'); localStorage.removeItem('ht_user') })
      .finally(() => setLoading(false))
  }, [])

  function persistUser(u) {
    localStorage.setItem('ht_user', JSON.stringify(u))
    setUser(u)
  }

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('ht_token', data.token)
    persistUser(data.user)
    return data.user
  }

  async function register(name, email, password) {
    const { data } = await api.post('/auth/register', { name, email, password })
    localStorage.setItem('ht_token', data.token)
    persistUser(data.user)
    return data.user
  }

  function logout() {
    localStorage.removeItem('ht_token')
    localStorage.removeItem('ht_user')
    setUser(null)
    toast.success('Logged out')
  }

  async function updateProfile(updates) {
    const { data } = await api.put('/auth/profile', updates)
    persistUser(data.user)
    return data.user
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
