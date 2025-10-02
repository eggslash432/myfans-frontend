import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../lib/api'


interface AuthState {
user: any | null
loading: boolean
login: (email: string, password: string) => Promise<void>
signup: (email: string, password: string) => Promise<void>
logout: () => void
refreshMe: () => Promise<void>
}


const AuthCtx = createContext<AuthState | null>(null)


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
const [user, setUser] = useState<any | null>(null)
const [loading, setLoading] = useState(true)


const refreshMe = async () => {
try {
const { data } = await api.get('/auth/me')
setUser(data)
} catch {
setUser(null)
} finally {
setLoading(false)
}
}


useEffect(() => {
refreshMe()
}, [])


const login = async (email: string, password: string) => {
const { data } = await api.post('/auth/login', { email, password })
localStorage.setItem('access_token', data.access_token)
await refreshMe()
}


const signup = async (email: string, password: string) => {
await api.post('/auth/signup', { email, password })
await login(email, password)
}


const logout = () => {
localStorage.removeItem('access_token')
setUser(null)
}


const value = useMemo(() => ({ user, loading, login, signup, logout, refreshMe }), [user, loading])


return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}


export const useAuth = () => {
const ctx = useContext(AuthCtx)
if (!ctx) throw new Error('useAuth must be used within AuthProvider')
return ctx
}