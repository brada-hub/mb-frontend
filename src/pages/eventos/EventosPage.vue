<template>
  <q-page class="q-pa-md">
    <!-- Header usando clases globales -->
    <div class="page-header q-mb-lg flex justify-between items-center">
      <div>
        <h1 class="q-mb-none">Eventos</h1>
        <p>Ensayos y contratos de la banda</p>
      </div>
      <q-btn
        color="primary"
        icon="add"
        label="Nuevo Evento"
        @click="showCreateDialog = true"
        unelevated
      />
    </div>

    <!-- Tabs -->
    <q-tabs v-model="tab" class="q-mb-lg" active-color="primary" indicator-color="primary">
      <q-tab name="proximos" label="Próximos" icon="event" />
      <q-tab name="pasados" label="Pasados" icon="history" />
    </q-tabs>

    <!-- Lista de eventos (Grid de Componentes) -->
    <div class="mb-grid">
      <div v-for="evento in eventos" :key="evento.id" class="mb-col">
        <q-card class="mb-card cursor-pointer" @click="$router.push(`/eventos/${evento.id}`)">
          <q-card-section>
            <div class="flex justify-between items-start q-mb-md">
              <q-badge
                :color="evento.tipo === 'contrato' ? 'positive' : 'primary'"
                :label="evento.tipo === 'contrato' ? 'CONTRATO' : 'ENSAYO'"
                class="status-badge"
              />
              <q-badge
                :color="getEstadoColor(evento.estado)"
                :label="evento.estado"
                outline
                class="status-badge"
              />
            </div>

            <div class="text-h2 q-mb-sm" style="font-size: 1.25rem">{{ evento.nombre }}</div>

            <div class="flex items-center gap-2 text-grey q-mb-xs">
              <q-icon name="event" size="18px" />
              <span>{{ formatDate(evento.fecha) }}</span>
            </div>

            <div class="flex items-center gap-2 text-grey q-mb-xs">
              <q-icon name="schedule" size="18px" />
              <span>{{ evento.hora_citacion }}</span>
            </div>

            <div v-if="evento.lugar" class="flex items-center gap-2 text-grey">
              <q-icon name="location_on" size="18px" />
              <span>{{ evento.lugar }}</span>
            </div>
          </q-card-section>

          <q-separator dark />

          <q-card-actions>
            <q-btn flat color="primary" label="Ver detalles" :to="`/eventos/${evento.id}`" />
            <q-space />
            <q-btn
              v-if="!evento.lista_confirmada"
              flat
              color="secondary"
              icon="group_add"
              :to="`/eventos/${evento.id}/lista`"
            />
          </q-card-actions>
        </q-card>
      </div>

      <div v-if="eventos.length === 0 && !isLoading" class="col-12">
        <q-card class="mb-card text-center q-pa-xl">
          <q-icon name="event_busy" size="64px" color="grey" />
          <div class="text-h3 text-grey q-mt-md">No hay eventos</div>
        </q-card>
      </div>
    </div>

    <!-- Spinner -->
    <q-inner-loading :showing="isLoading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>

    <!-- COMPONENTE: Diálogo de Creación -->
    <EventoFormDialog
      v-model="showCreateDialog"
      @saved="fetchEventos"
    />

  </q-page>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { api } from 'src/boot/axios';
import EventoFormDialog from 'src/components/eventos/EventoFormDialog.vue';

interface Evento {
  id: number;
  nombre: string;
  tipo: 'ensayo' | 'contrato';
  fecha: string;
  hora_citacion: string;
  lugar: string;
  estado: string;
  lista_confirmada: boolean;
}

const tab = ref('proximos');
const eventos = ref<Evento[]>([]);
const isLoading = ref(false);
const showCreateDialog = ref(false);

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-BO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function getEstadoColor(estado: string): string {
  const colors: Record<string, string> = {
    borrador: 'grey',
    confirmado: 'info',
    en_curso: 'warning',
    finalizado: 'positive',
    cancelado: 'negative',
  };
  return colors[estado] || 'grey';
}

async function fetchEventos() {
  isLoading.value = true;
  try {
    const params = {
      proximos: tab.value === 'proximos',
    };
    const response = await api.get('/eventos', { params });
    if (response.data.success) {
      eventos.value = response.data.data.data;
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    isLoading.value = false;
  }
}

watch(tab, fetchEventos);
onMounted(fetchEventos);
</script>
