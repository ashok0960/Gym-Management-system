import React, { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api, { authAPI } from '../services/api'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const stored = localStorage.getItem('user')
    if (token && stored) {
      try {
        setUser(JSON.parse(stored))
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } catch {
        localStorage.clear()
      }
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      const res = await authAPI.login({ username, password })
      const { access, refresh, user: u } = res.data
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
      localStorage.setItem('user', JSON.stringify(u))
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`
      setUser(u)
      toast.success(`Welcome back, ${u.username}!`)
      return { success: true, user: u }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
      return { success: false }
    }
  }

  const register = async (data) => {
    try {
      const res = await authAPI.register(data)
      const { access, refresh, user: u } = res.data
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
      localStorage.setItem('user', JSON.stringify(u))
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`
      setUser(u)
      toast.success('Account created successfully!')
      return { success: true, user: u }
    } catch (err) {
      if (err.response?.data) {
        Object.entries(err.response.data).forEach(([k, v]) =>
          toast.error(`${k}: ${Array.isArray(v) ? v[0] : v}`)
        )
      } else {
        toast.error('Registration failed')
      }
      return { success: false }
    }
  }

  const logout = () => {
    localStorage.clear()
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    toast.success('Logged out')
  }

  const isAdmin = !!(user?.is_admin || user?.role === 'ADMIN')
  const isTrainer = !!(user?.is_trainer || user?.is_vendor || user?.role === 'TRAINER' || user?.role === 'VENDOR')
  const isVendor = isTrainer
  const isMember = !isAdmin && !isTrainer
  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isTrainer, isVendor, isMember, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
