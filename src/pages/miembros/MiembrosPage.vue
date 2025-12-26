<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="page-header q-mb-lg flex justify-between items-center">
      <div>
        <h1 class="q-mb-none">Miembros</h1>
        <p class="hide-on-mobile">Gestión de músicos de la banda</p>
      </div>
      <q-btn
        color="primary"
        icon="add"
        :label="$q.screen.gt.xs ? 'Nuevo Miembro' : ''"
        @click="openCreateDialog"
        unelevated
        :round="!$q.screen.gt.xs"
        :padding="$q.screen.gt.xs ? undefined : 'sm'"
      />
    </div>

    <!-- Filtros -->
    <q-card class="mb-card q-mb-lg sticky-top-desktop">
      <q-card-section class="q-pa-md">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input
              v-model="filtros.buscar"
              placeholder="Buscar por nombre, CI..."
              filled dark dense debounce="300"
              @update:model-value="fetchMiembros"
            >
              <template v-slot:prepend><q-icon name="search" /></template>
              <template v-slot:append>
                <q-icon v-if="filtros.buscar" name="close" class="cursor-pointer" @click="resetSearch" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-select
              v-model="filtros.seccion"
              :options="seccionesOptions"
              label="Sección"
              filled dark dense
              emit-value map-options clearable
              @update:model-value="fetchMiembros"
            >
              <template v-slot:prepend><q-icon name="filter_list" color="primary" /></template>
            </q-select>
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-select
              v-model="filtros.categoria"
              :options="categoriasOptions"
              label="Categoría"
              filled dark dense
              emit-value map-options clearable
              @update:model-value="fetchMiembros"
            >
              <template v-slot:prepend><q-icon name="category" color="primary" /></template>
            </q-select>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Lista de miembros (GRID SYSTEM GLOBAL) -->
    <div v-if="!isLoading && miembros.length > 0" class="mb-grid">
      <div v-for="miembro in miembros" :key="miembro.id" class="mb-col">
        <q-card class="mb-card cursor-pointer full-height" @click="$router.push(`/miembros/${miembro.id}`)">
          <q-card-section class="q-pa-md">
            <!-- Header Card -->
            <div class="flex items-center no-wrap gap-3 q-mb-md">
              <q-avatar :color="miembro.seccion?.color || 'primary'" text-color="white" size="64px" class="flex-shrink-0">
                <span class="text-weight-bold text-h2" style="font-size: 1.5rem">{{ miembro.iniciales || 'XX' }}</span>
              </q-avatar>
              <div class="overflow-hidden">
                <div class="text-h3 q-mb-none ellipsis text-weight-bold text-primary">{{ miembro.nombre_completo }}</div>
                <div class="text-caption text-grey">CI: {{ miembro.ci }}</div>
              </div>
            </div>

            <q-separator dark class="q-my-sm opacity-2" />

            <!-- Body Card Info -->
            <div class="flex wrap gap-2 q-mt-md items-center">
               <div class="flex items-center text-grey-4 text-subtitle2">
                 <q-icon name="smartphone" size="18px" color="primary" class="q-mr-xs"/> {{ miembro.celular }}
               </div>
               <q-space />
               <div class="flex gap-2">
                 <q-badge :style="{backgroundColor: (miembro.seccion?.color || '#6366f1') + '22', color: miembro.seccion?.color, border: '1px solid ' + (miembro.seccion?.color || '#6366f1') + '44'}" class="q-px-sm q-py-xs text-weight-bold">
                   <q-icon :name="miembro.seccion?.icono || 'music_note'" size="14px" class="q-mr-xs"/>
                   {{ miembro.seccion?.nombre }}
                 </q-badge>
                 <q-badge :color="getCategoriaColor(miembro.categoria?.codigo)" class="q-px-sm q-py-xs text-weight-bold">
                   Cat. {{ miembro.categoria?.codigo }}
                 </q-badge>
               </div>
            </div>
          </q-card-section>

          <q-card-actions class="q-px-md q-pb-md">
            <q-btn flat round dense icon="visibility" color="primary" :to="`/miembros/${miembro.id}`" @click.stop>
              <q-tooltip>Ver Detalles</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="edit" color="info" @click.stop="openEditDialog(miembro.id)">
              <q-tooltip>Editar Miembro</q-tooltip>
            </q-btn>
            <q-space />
            <q-btn unelevated round dense icon="chat" color="positive" @click.stop="abrirWhatsApp(miembro)">
              <q-tooltip>Enviar WhatsApp</q-tooltip>
            </q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Estados Vacíos / Carga -->
    <div v-else-if="isLoading" class="flex flex-center q-py-xl">
      <q-spinner-dots color="primary" size="64px" />
    </div>

    <div v-else class="text-center q-pa-xl bg-dark rounded-borders q-mt-lg" style="border: 1px dashed var(--mb-border)">
      <q-icon name="groups" size="80px" color="grey-9" />
      <div class="text-h2 text-grey-8 q-mt-md">No hay miembros registrados</div>
      <p class="text-grey-7">Comienza agregando músicos a tu banda</p>
      <q-btn color="primary" label="Agregar Miembro" icon="add" class="q-mt-md" @click="openCreateDialog" unelevated />
    </div>

    <!-- Paginación -->
    <div v-if="miembros.length > 0" class="flex flex-center q-mt-xl">
      <q-pagination v-model="pagination.page" :max="totalPages" :max-pages="5" direction-links boundary-links color="primary" active-design="unelevated" @update:model-value="fetchMiembros" />
    </div>

    <!-- COMPONENTE: MODAL FORMULARIO -->
    <MiembroFormDialog
      v-model="showDialog"
      :miembro-id="editMiembroId"
      @saved="fetchMiembros"
    />

  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar, openURL } from 'quasar';
import { api } from 'src/boot/axios';
import { useCatalogosStore } from 'src/stores/catalogos';
import MiembroFormDialog from 'src/components/miembros/MiembroFormDialog.vue'; // Importar componente

const $q = useQuasar();
const catalogosStore = useCatalogosStore();

interface Miembro {
  id: number;
  nombre_completo: string;
  iniciales: string;
  ci: string;
  celular: string;
  seccion: { id: number; nombre: string; color: string; icono?: string } | null;
  categoria: { id: number; codigo: string } | null;
  rol: { id: number; nombre: string } | null;
}

const miembros = ref<Miembro[]>([]);
const isLoading = ref(false);
const showDialog = ref(false);
const editMiembroId = ref<number | null>(null);

const filtros = ref({
  buscar: '',
  seccion: null as number | null,
  categoria: null as number | null,
});

const pagination = ref({ page: 1, rowsPerPage: 12, rowsNumber: 0 });

const totalPages = computed(() => Math.ceil(pagination.value.rowsNumber / pagination.value.rowsPerPage));
const seccionesOptions = computed(() => catalogosStore.secciones.map(s => ({ label: s.nombre, value: s.id })));
const categoriasOptions = computed(() => catalogosStore.categorias.map(c => ({ label: c.nombre, value: c.id })));

function resetSearch() {
  filtros.value.buscar = '';
  fetchMiembros();
}

function getCategoriaColor(codigo?: string): string {
  const c: Record<string, string> = { A: 'positive', B: 'info', C: 'warning' };
  return c[codigo || ''] || 'grey';
}

function abrirWhatsApp(m: Miembro) {
  openURL(`https://wa.me/591${m.celular}`);
}

function openCreateDialog() {
  editMiembroId.value = null;
  showDialog.value = true;
}

function openEditDialog(id: number) {
  editMiembroId.value = id;
  showDialog.value = true;
}

async function fetchMiembros() {
  isLoading.value = true;
  try {
    const params: Record<string, unknown> = { page: pagination.value.page, per_page: pagination.value.rowsPerPage };
    if (filtros.value.buscar) params.buscar = filtros.value.buscar;
    if (filtros.value.seccion) params.seccion_id = filtros.value.seccion;
    if (filtros.value.categoria) params.categoria_id = filtros.value.categoria;

    const resp = await api.get('/miembros', { params });
    if (resp.data.success) {
      miembros.value = resp.data.data.data;
      pagination.value.rowsNumber = resp.data.data.total;
    }
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  void catalogosStore.fetchAll();
  void fetchMiembros();
});
</script>

<style scoped>
.sticky-top-desktop {
  position: sticky;
  top: 10px;
  z-index: 10;
}

@media (max-width: 1023px) {
  .sticky-top-desktop {
    position: relative;
    top: 0;
  }
}

.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.flex-shrink-0 { flex-shrink: 0; }
.opacity-2 { opacity: 0.2; }
</style>
