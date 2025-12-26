<template>
  <q-page class="q-pa-md">
    <div class="page-header q-mb-lg flex justify-between">
      <q-btn flat icon="arrow_back" label="Volver" @click="$router.back()" />
      <h1 class="text-h4 mb-gradient-text q-mb-none">Detalles del Evento</h1>
    </div>

    <div v-if="isLoading" class="flex flex-center">
      <q-spinner-dots color="primary" size="50px" />
    </div>

    <q-card v-else-if="evento" class="mb-card q-pa-lg">
      <div class="text-h3">{{ evento.nombre }}</div>
      <q-chip :label="evento.tipo" color="primary" />

      <div class="q-mt-md">
         <div><strong>Fecha:</strong> {{ evento.fecha }}</div>
         <div><strong>Hora:</strong> {{ evento.hora_citacion }}</div>
         <div><strong>Lugar:</strong> {{ evento.lugar }}</div>
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
const evento = ref<any>(null);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const { data } = await api.get(`/eventos/${route.params.id as string}`);
    if (data.success) {
      evento.value = data.data;
    }
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
});
</script>
