import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.PROD 
    ? '/api'  // En producción, usar rutas relativas
    : 'http://localhost:3001/api'  // En desarrollo, usar puerto correcto del backend
)

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api