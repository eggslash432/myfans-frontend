import axios from 'axios'


const api = axios.create({
baseURL: import.meta.env.VITE_API_BASE_URL,
withCredentials: false,
})


// アクセストークン付与
api.interceptors.request.use(cfg => {
const token = localStorage.getItem('access_token')
if (token) {
cfg.headers = cfg.headers ?? {}
cfg.headers.Authorization = `Bearer ${token}`
}
return cfg
})


export default api