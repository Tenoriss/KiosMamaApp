'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const AUTH_KEY = 'kios-mama-authenticated'
const AUTH_USER_KEY = 'kios-mama-user'
const VALID_USERNAME = 'DewcyBahy'
const VALID_PASSWORD = '2025292304'

type AuthContextValue = {
  isAuthenticated: boolean
  isLoading: boolean
  username: string | null
  login: (username: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsAuthenticated(localStorage.getItem(AUTH_KEY) === 'true')
    setIsLoading(false)
  }, [])

  const login = (username: string, password: string) => {
    const valid = username === VALID_USERNAME && password === VALID_PASSWORD
    if (!valid) return false
    localStorage.setItem(AUTH_KEY, 'true')
    localStorage.setItem(AUTH_USER_KEY, username)
    setIsAuthenticated(true)
    return true
  }

  const logout = () => {
    localStorage.removeItem(AUTH_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
    setIsAuthenticated(false)
  }

  const username = isAuthenticated ? localStorage.getItem(AUTH_USER_KEY) : null

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth harus digunakan di dalam AuthProvider')
  return context
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login')
  }, [isAuthenticated, isLoading, router])

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-background" />
  }

  return <>{children}</>
}
