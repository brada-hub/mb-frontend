<template>
  <q-page class="q-pa-md">
    <div class="page-header q-mb-lg flex justify-between">
      <q-btn flat icon="arrow_back" label="Volver" @click="$router.back()" />
      <h1 class="text-h4 mb-gradient-text q-mb-none">Detalles del Miembro</h1>
    </div>

    <div v-if="isLoading" class="flex flex-center">
      <q-spinner-dots color="primary" size="50px" />
    </div>

    <q-card v-else-if="miembro" class="mb-card q-pa-lg">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-4 text-center">
          <q-avatar size="150px" :color="miembro.seccion?.color || 'primary'" text-color="white" class="q-mb-md shadow-3">
             <div class="text-h2">{{ miembro.iniciales }}</div>
          </q-avatar>
          <div class="text-h3">{{ miembro.nombre_completo }}</div>
           <q-chip :style="{backgroundColor: (miembro.seccion?.color || '#6366f1')+'33', color: miembro.seccion?.color}">
             {{ miembro.seccion?.nombre }}
           </q-chip>
        </div>

        <div class="col-12 col-md-8">
           <q-list dark separator>
             <q-item>
               <q-item-section avatar><q-icon name="badge" /></q-item-section>
               <q-item-section>
                 <q-item-label caption>CI</q-item-label>
                 <q-item-label>{{ miembro.ci }}</q-item-label>
               </q-item-section>
             </q-item>
             <q-item>
               <q-item-section avatar><q-icon name="phone" /></q-item-section>
               <q-item-section>
                 <q-item-label caption>Celular</q-item-label>
                 <q-item-label>{{ miembro.celular }}</q-item-label>
               </q-item-section>
             </q-item>
             <q-item>
               <q-item-section avatar><q-icon name="star" /></q-item-section>
               <q-item-section>
                 <q-item-label caption>Categoría</q-item-label>
                 <q-item-label>Categoría {{ miembro.categoria?.codigo }}</q-item-label>
               </q-item-section>
             </q-item>
             <q-item>
               <q-item-section avatar><q-icon name="location_on" /></q-item-section>
               <q-item-section>
                 <q-item-label caption>Dirección</q-item-label>
                 <q-item-label>{{ miembro.direccion || 'Sin registrar' }}</q-item-label>
               </q-item-section>
             </q-item>
           </q-list>
        </div>
      </div>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { api } from 'src/boot/axios';

const route = useRoute();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const miembro = ref<any>(null);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const { data } = await api.get(`/miembros/${route.params.id as string}`);
    if (data.success) {
      miembro.value = data.data;
    }
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
});
</script>
