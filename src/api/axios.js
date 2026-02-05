import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 30000, // 30 seconds timeout
});

// Request interceptor - add token
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor - handle 401 silently during logout
api.interceptors.response.use(
    response => response,
    error => {
        // Si hay un error 401 y no hay token, significa que la sesión expiró o falló el login
        const token = localStorage.getItem('token');
        const isLoginRequest = error.config?.url?.includes('/login');

        // Solo silenciamos si NO es un login y NO hay token (para evitar ruidos al cerrar sesión)
        if (error.response?.status === 401 && !token && !isLoginRequest) {
            return Promise.reject({ silent: true });
        }
        return Promise.reject(error);
    }
);

export default api;
