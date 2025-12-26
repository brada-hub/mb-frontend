import { boot } from 'quasar/wrappers';
import axios, { type AxiosInstance } from 'axios';
import { useAuthStore } from 'src/stores/auth';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Configurar la URL base de la API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export default boot(({ app, router }) => {
  // Interceptor de request para agregar token
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error instanceof Error ? error : new Error(String(error)));
    }
  );

  // Interceptor de response para manejar errores
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        const status = error.response.status;

        // Token expirado o no autorizado
        if (status === 401) {
          const authStore = useAuthStore();
          authStore.clearAuth();
          void router.push('/login');
        }

        // Dispositivo no autorizado
        if (status === 403 && error.response.data?.error_code === 'DEVICE_NOT_AUTHORIZED') {
          const authStore = useAuthStore();
          authStore.clearAuth();
          void router.push('/login?error=device');
        }
      }

      return Promise.reject(error instanceof Error ? error : new Error(String(error)));
    }
  );

  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
