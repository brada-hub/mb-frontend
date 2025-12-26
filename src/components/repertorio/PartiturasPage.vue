<template>
  <q-page class="q-pa-md">
    <q-btn flat icon="arrow_back" label="Volver" @click="$router.back()" class="q-mb-md" />
    <h1 class="text-h4 mb-gradient-text q-mb-lg">Partituras</h1>
    <q-card class="mb-card">
      <q-card-section class="text-center text-grey">
        Partituras del tema - ID: {{ temaId }}
      </q-card-section>
    </q-card>
  </q-page>
</template>
<script setup lang="ts">
defineProps<{ temaId: string }>();
</script>
