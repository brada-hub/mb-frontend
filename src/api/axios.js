import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 30000, // 30 seconds timeout
});

// Flag for handling 401 redirection
let isRedirectingToLogin = false;

/**
 * ACTIVE DEDUPLICATION
 * Prevents multiple identical GET requests within a 100ms window.
 * This effectively silences React StrictMode's double-mount and rapid re-renders.
 */
const lastRequests = new Map();

// Request interceptor
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.method?.toLowerCase() === 'get') {
        const url = config.url;
        const now = Date.now();
        const lastTime = lastRequests.get(url);

        if (lastTime && (now - lastTime < 100)) {
            // Cancel this request before it leaves the client
            const controller = new AbortController();
            config.signal = controller.signal;
            controller.abort("DUPLICATE_REQUEST_THROTTLED");
        }
        lastRequests.set(url, now);
        
        // Cleanup old entries occasionally
        if (lastRequests.size > 50) {
            const staleThreshold = now - 5000;
            for (let [key, time] of lastRequests.entries()) {
                if (time < staleThreshold) lastRequests.delete(key);
            }
        }
    }
    
    return config;
});

// Response interceptor
api.interceptors.response.use(
    response => response,
    error => {
        // Silently ignore throttled requests
        if (error.message === "DUPLICATE_REQUEST_THROTTLED" || error.code === "ERR_CANCELED") {
            return new Promise(() => {}); // Return a pending promise that never resolves/rejects
        }

        const status = error.response?.status;
        const token = localStorage.getItem('token');
        const isLoginRequest = error.config?.url?.includes('/login');
        const isLogoutRequest = error.config?.url?.includes('/logout');

        if (status === 401 && !isLoginRequest && !isLogoutRequest) {
            if (token && !isRedirectingToLogin) {
                isRedirectingToLogin = true;
                localStorage.removeItem('token');
                setTimeout(() => {
                    window.location.href = '/login';
                    setTimeout(() => { isRedirectingToLogin = false; }, 2000);
                }, 100);
            }
            return Promise.reject({ silent: true, expired: true });
        }

        return Promise.reject(error);
    }
);

export default api;
