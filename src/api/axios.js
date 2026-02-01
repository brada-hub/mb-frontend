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
        // If 401 and no token, user is logging out - don't log error
        const token = localStorage.getItem('token');
        if (error.response?.status === 401 && !token) {
            return Promise.reject({ silent: true });
        }
        return Promise.reject(error);
    }
);

export default api;
