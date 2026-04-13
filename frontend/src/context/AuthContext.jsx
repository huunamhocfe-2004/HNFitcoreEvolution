import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const stored = localStorage.getItem('fitcore_user')
        const token = localStorage.getItem('fitcore_token')
        if (stored && token) {
            setUser(JSON.parse(stored))
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        }
        setLoading(false)
    }, [])

    const login = (userData, token) => {
        localStorage.setItem('fitcore_user', JSON.stringify(userData))
        localStorage.setItem('fitcore_token', token)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setUser(userData)
    }

    const logout = () => {
        localStorage.removeItem('fitcore_user')
        localStorage.removeItem('fitcore_token')
        delete api.defaults.headers.common['Authorization']
        setUser(null)
    }

    const updateUser = (data) => {
        const newUser = { ...user, ...data }
        localStorage.setItem('fitcore_user', JSON.stringify(newUser))
        setUser(newUser)
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
