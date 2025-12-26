import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

interface Miembro {
  id: number;
  nombres: string;
  apellidos: string;
  nombre_completo: string;
  iniciales: string;
  ci: string;
  celular: string;
  usuario: string;
  foto: string | null;
  seccion: {
    id: number;
    nombre: string;
    icono: string;
    color: string;
  } | null;
  categoria: {
    id: number;
    codigo: string;
    nombre: string;
  } | null;
  rol: {
    id: number;
    nombre: string;
    slug: string;
  } | null;
  es_super_admin: boolean;
  es_director: boolean;
  es_jefe_seccion: boolean;
}

interface AuthState {
  token: string | null;
  miembro: Miembro | null;
  requiereCambioPassword: boolean;
  isLoading: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('token'),
    miembro: JSON.parse(localStorage.getItem('miembro') || 'null'),
    requiereCambioPassword: false,
    isLoading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.miembro,
    nombreCompleto: (state) => state.miembro?.nombre_completo || '',
    iniciales: (state) => state.miembro?.iniciales || '',
    rolNombre: (state) => state.miembro?.rol?.nombre || '',
    seccionNombre: (state) => state.miembro?.seccion?.nombre || '',
    esSuperAdmin: (state) => state.miembro?.es_super_admin || false,
    esDirector: (state) => state.miembro?.es_director || false,
    esJefeSeccion: (state) => state.miembro?.es_jefe_seccion || false,
    puedeGestionar: (state) =>
      state.miembro?.es_super_admin ||
      state.miembro?.es_director ||
      state.miembro?.es_jefe_seccion ||
      false,
  },

  actions: {
    async login(usuario: string, password: string, deviceId?: string) {
      this.isLoading = true;
      try {
        const response = await api.post('/auth/login', {
          usuario,
          password,
          device_id: deviceId || this.getDeviceId(),
          device_nombre: navigator.userAgent,
        });

        if (response.data.success) {
          const { token, miembro, requiere_cambio_password } = response.data.data;

          this.token = token;
          this.miembro = miembro;
          this.requiereCambioPassword = requiere_cambio_password;

          // Guardar en localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('miembro', JSON.stringify(miembro));

          // Configurar header de axios
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          return { success: true, requiereCambioPassword: requiere_cambio_password };
        }

        return { success: false, message: response.data.message };
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        return {
          success: false,
          message: err.response?.data?.message || 'Error al iniciar sesión',
        };
      } finally {
        this.isLoading = false;
      }
    },

    async logout() {
      try {
        await api.post('/auth/logout');
      } catch {
        // Ignorar errores en logout
      } finally {
        this.clearAuth();
      }
    },

    async cambiarPassword(actual: string, nuevo: string, confirmacion: string) {
      try {
        await api.post('/auth/cambiar-password', {
          password_actual: actual,
          password_nueva: nuevo,
          password_confirmation: confirmacion,
        });

        // Si fue exitoso, actualizamos el estado
        this.requiereCambioPassword = false;

        return { success: true };
      } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = error as any;
        return {
          success: false,
          message: err.response?.data?.message || 'Error al cambiar contraseña',
        };
      }
    },

    // ─────────────────────────────────────────────────────────────────
    // GESTIÓN DE ESTADO (PERSISTENCIA LOCAL)
    // ─────────────────────────────────────────────────────────────────
    initialize() {
      const token = localStorage.getItem('token');
      const miembro = localStorage.getItem('miembro');

      try {
        if (token) {
          this.token = token;
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        if (miembro) {
          this.miembro = JSON.parse(miembro);
        }
      } catch {
        this.clearAuth();
      }
    },

    setToken(token: string) {
      this.token = token;
      localStorage.setItem('token', token);

      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        void this.fetchPerfil();
      }
    },

    async fetchPerfil() {
      if (!this.token) return;

      try {
        const response = await api.get('/auth/perfil');
        if (response.data.success) {
          this.miembro = response.data.data;
          localStorage.setItem('miembro', JSON.stringify(this.miembro));
        }
      } catch {
        this.clearAuth();
      }
    },

    clearAuth() {
      this.token = null;
      this.miembro = null;
      this.requiereCambioPassword = false;
      localStorage.removeItem('token');
      localStorage.removeItem('miembro');
      delete api.defaults.headers.common['Authorization'];
    },

    initAuth() {
      const token = localStorage.getItem('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        void this.fetchPerfil();
      }
    },

    getDeviceId(): string {
      let deviceId = localStorage.getItem('device_id');
      if (!deviceId) {
        deviceId = 'WEB_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('device_id', deviceId);
      }
      return deviceId;
    },
  },
});
