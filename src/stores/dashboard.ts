import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

interface DashboardMiembro {
  proximos_eventos: Evento[];
  asistencia_mes: {
    a_tiempo: number;
    tarde: number;
    ausente: number;
    total_eventos: number;
  };
  saldo_pendiente: number;
  notificaciones_no_leidas: number;
}

interface DashboardGeneral {
  miembros: {
    total: number;
    por_seccion: {
      id: number;
      nombre: string;
      color: string;
      icono: string;
      total: number;
    }[];
  };
  eventos: {
    proximos: Evento[];
    mes_actual: {
      ensayos: number;
      contratos: number;
      total: number;
    };
  };
  asistencia_mes: {
    a_tiempo: number;
    tarde: number;
    ausente: number;
  };
  finanzas: {
    pagos_pendientes: number;
    miembros_con_deuda: number;
  };
}

interface Evento {
  id: number;
  nombre: string;
  tipo: 'ensayo' | 'contrato';
  fecha: string;
  hora_citacion: string;
  lugar: string;
  estado: string;
}

interface DashboardState {
  dataGeneral: DashboardGeneral | null;
  dataMiembro: DashboardMiembro | null;
  isLoading: boolean;
}

export const useDashboardStore = defineStore('dashboard', {
  state: (): DashboardState => ({
    dataGeneral: null,
    dataMiembro: null,
    isLoading: false,
  }),

  actions: {
    async fetchDashboardGeneral() {
      this.isLoading = true;
      try {
        const response = await api.get('/dashboard/general');
        if (response.data.success) {
          this.dataGeneral = response.data.data;
        }
      } catch (error) {
        console.error('Error al cargar dashboard:', error);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchDashboardMiembro() {
      this.isLoading = true;
      try {
        const response = await api.get('/dashboard/miembro');
        if (response.data.success) {
          this.dataMiembro = response.data.data;
        }
      } catch (error) {
        console.error('Error al cargar dashboard:', error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
