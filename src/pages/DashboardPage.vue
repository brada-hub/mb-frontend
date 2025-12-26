<template>
  <q-page class="dashboard-page q-pa-md">
    <!-- ═══════════════════════════════════════════════════════════════
         HEADER
         ═══════════════════════════════════════════════════════════════ -->
    <div class="row q-mb-lg">
      <div class="col">
        <h1 class="text-h4 mb-gradient-text q-mb-none">Dashboard</h1>
        <p class="text-subtitle1 text-grey">
          ¡Bienvenido, {{ authStore.nombreCompleto }}!
        </p>
      </div>
    </div>

    <!-- Vista de Administrador / Director -->
    <template v-if="authStore.puedeGestionar">
      <!-- ─── Estadísticas principales ─── -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-sm-6 col-md-3">
          <StatCard
            icon="groups"
            label="Total Miembros"
            :value="dashboardStore.dataGeneral?.miembros.total || 0"
            color="primary"
          />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <StatCard
            icon="event"
            label="Eventos del Mes"
            :value="dashboardStore.dataGeneral?.eventos.mes_actual.total || 0"
            color="secondary"
          />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <StatCard
            icon="check_circle"
            label="A Tiempo (Mes)"
            :value="dashboardStore.dataGeneral?.asistencia_mes.a_tiempo || 0"
            color="positive"
          />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <StatCard
            icon="payments"
            label="Pagos Pendientes"
            :value="formatMoney(dashboardStore.dataGeneral?.finanzas.pagos_pendientes || 0)"
            color="warning"
            is-money
          />
        </div>
      </div>

      <!-- ─── Gráfico y Próximos Eventos ─── -->
      <div class="row q-col-gutter-md">
        <!-- Miembros por sección -->
        <div class="col-12 col-md-6">
          <q-card class="mb-card">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="groups" class="q-mr-sm" />
                Miembros por Sección
              </div>
              <div class="secciones-grid">
                <div
                  v-for="seccion in dashboardStore.dataGeneral?.miembros.por_seccion"
                  :key="seccion.id"
                  class="seccion-item"
                >
                  <div class="seccion-icon" :style="{ backgroundColor: seccion.color + '20' }">
                    <q-icon :name="seccion.icono || 'music_note'" :style="{ color: seccion.color }" />
                  </div>
                  <div class="seccion-info">
                    <div class="text-weight-medium">{{ seccion.nombre }}</div>
                    <div class="text-h5" :style="{ color: seccion.color }">{{ seccion.total }}</div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Próximos eventos -->
        <div class="col-12 col-md-6">
          <q-card class="mb-card">
            <q-card-section>
              <div class="text-h6 q-mb-md flex justify-between items-center">
                <div>
                  <q-icon name="event" class="q-mr-sm" />
                  Próximos Eventos
                </div>
                <q-btn flat size="sm" color="primary" to="/eventos">Ver todos</q-btn>
              </div>
              <q-list separator>
                <q-item
                  v-for="evento in dashboardStore.dataGeneral?.eventos.proximos"
                  :key="evento.id"
                  clickable
                  :to="`/eventos/${evento.id}`"
                >
                  <q-item-section avatar>
                    <q-avatar
                      :color="evento.tipo === 'contrato' ? 'positive' : 'primary'"
                      text-color="white"
                      size="40px"
                    >
                      <q-icon :name="evento.tipo === 'contrato' ? 'work' : 'school'" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ evento.nombre }}</q-item-label>
                    <q-item-label caption>
                      {{ formatDate(evento.fecha) }} - {{ evento.hora_citacion }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-badge :color="evento.tipo === 'contrato' ? 'positive' : 'primary'">
                      {{ evento.tipo }}
                    </q-badge>
                  </q-item-section>
                </q-item>
                <q-item v-if="!dashboardStore.dataGeneral?.eventos.proximos?.length">
                  <q-item-section class="text-center text-grey">
                    No hay eventos próximos
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>

    <!-- Vista de Músico -->
    <template v-else>
      <!-- ─── Mis estadísticas ─── -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-sm-6 col-md-3">
          <StatCard
            icon="event"
            label="Mis Eventos"
            :value="dashboardStore.dataMiembro?.asistencia_mes.total_eventos || 0"
            color="primary"
          />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <StatCard
            icon="check_circle"
            label="A Tiempo"
            :value="dashboardStore.dataMiembro?.asistencia_mes.a_tiempo || 0"
            color="positive"
          />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <StatCard
            icon="schedule"
            label="Tardanzas"
            :value="dashboardStore.dataMiembro?.asistencia_mes.tarde || 0"
            color="warning"
          />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <StatCard
            icon="account_balance_wallet"
            label="Saldo Pendiente"
            :value="formatMoney(dashboardStore.dataMiembro?.saldo_pendiente || 0)"
            color="info"
            is-money
          />
        </div>
      </div>

      <!-- Mis próximos eventos -->
      <div class="row">
        <div class="col-12">
          <q-card class="mb-card">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="event" class="q-mr-sm" />
                Mis Próximos Eventos
              </div>
              <q-list separator>
                <q-item
                  v-for="evento in dashboardStore.dataMiembro?.proximos_eventos"
                  :key="evento.id"
                  clickable
                  :to="`/eventos/${evento.id}`"
                >
                  <q-item-section avatar>
                    <q-avatar
                      :color="evento.tipo === 'contrato' ? 'positive' : 'primary'"
                      text-color="white"
                    >
                      <q-icon :name="evento.tipo === 'contrato' ? 'work' : 'school'" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ evento.nombre }}</q-item-label>
                    <q-item-label caption>
                      📅 {{ formatDate(evento.fecha) }} | ⏰ {{ evento.hora_citacion }}
                    </q-item-label>
                    <q-item-label caption>
                      📍 {{ evento.lugar }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      v-if="evento.tipo === 'contrato'"
                      color="positive"
                      label="Ir al evento"
                      size="sm"
                      to="/asistencia/registrar"
                    />
                  </q-item-section>
                </q-item>
                <q-item v-if="!dashboardStore.dataMiembro?.proximos_eventos?.length">
                  <q-item-section class="text-center text-grey q-py-lg">
                    <q-icon name="event_busy" size="48px" class="q-mb-md" />
                    <div>No tienes eventos programados</div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>

    <!-- Loading -->
    <q-inner-loading :showing="dashboardStore.isLoading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import { useDashboardStore } from 'src/stores/dashboard';
import StatCard from 'src/components/StatCard.vue';

const authStore = useAuthStore();
const dashboardStore = useDashboardStore();

function formatMoney(value: number): string {
  return `Bs. ${value.toLocaleString('es-BO', { minimumFractionDigits: 2 })}`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-BO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

onMounted(async () => {
  if (authStore.puedeGestionar) {
    await dashboardStore.fetchDashboardGeneral();
  } else {
    await dashboardStore.fetchDashboardMiembro();
  }
});
</script>

<style lang="scss" scoped>
.dashboard-page {
  max-width: 1400px;
  margin: 0 auto;
}

.secciones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
}

.seccion-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    transform: translateY(-2px);
  }
}

.seccion-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
