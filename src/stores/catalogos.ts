import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

interface Seccion {
  id: number;
  nombre: string;
  nombre_corto: string;
  icono: string;
  color: string;
  es_viento: boolean;
  miembros_count?: number;
}

interface Categoria {
  id: number;
  codigo: string;
  nombre: string;
  monto_base: number;
}

interface Rol {
  id: number;
  nombre: string;
  slug: string;
  nivel: number;
}

interface CatalogosState {
  secciones: Seccion[];
  categorias: Categoria[];
  roles: Rol[];
  isLoading: boolean;
  lastFetch: number | null;
}

export const useCatalogosStore = defineStore('catalogos', {
  state: (): CatalogosState => ({
    secciones: [],
    categorias: [],
    roles: [],
    isLoading: false,
    lastFetch: null,
  }),

  getters: {
    seccionById: (state) => (id: number) =>
      state.secciones.find(s => s.id === id),

    categoriaById: (state) => (id: number) =>
      state.categorias.find(c => c.id === id),

    rolById: (state) => (id: number) =>
      state.roles.find(r => r.id === id),

    seccionesViento: (state) =>
      state.secciones.filter(s => s.es_viento),

    seccionesPercusion: (state) =>
      state.secciones.filter(s => !s.es_viento),
  },

  actions: {
    async fetchAll(force = false) {
      // Cache de 5 minutos
      if (!force && this.lastFetch && Date.now() - this.lastFetch < 300000) {
        return;
      }

      this.isLoading = true;
      try {
        const response = await api.get('/catalogos/todos');
        if (response.data.success) {
          const { secciones, categorias, roles } = response.data.data;
          this.secciones = secciones;
          this.categorias = categorias;
          this.roles = roles;
          this.lastFetch = Date.now();
        }
      } catch (error) {
        console.error('Error al cargar catálogos:', error);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchSecciones() {
      try {
        const response = await api.get('/catalogos/secciones');
        if (response.data.success) {
          this.secciones = response.data.data;
        }
      } catch (error) {
        console.error('Error al cargar secciones:', error);
      }
    },

    async fetchCategorias() {
      try {
        const response = await api.get('/catalogos/categorias');
        if (response.data.success) {
          this.categorias = response.data.data;
        }
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    },

    async fetchRoles() {
      try {
        const response = await api.get('/catalogos/roles');
        if (response.data.success) {
          this.roles = response.data.data;
        }
      } catch (error) {
        console.error('Error al cargar roles:', error);
      }
    },
  },
});
