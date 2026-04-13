import axios from 'axios'

const api = axios.create({
    baseURL: '/api',
    timeout: 10000,
})

// Attach token on every request
api.interceptors.request.use(config => {
    const token = localStorage.getItem('fitcore_token')
    if (token) config.headers['Authorization'] = `Bearer ${token}`
    return config
})

// Global response error handler
api.interceptors.response.use(
    res => res,
    err => {
        if (err.response?.status === 401 || err.response?.status === 403) {
            localStorage.removeItem('fitcore_user')
            localStorage.removeItem('fitcore_token')
            window.location.href = '/login'
        }
        return Promise.reject(err)
    }
)

export default api
