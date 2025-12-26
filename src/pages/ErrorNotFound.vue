<template>
  <div class="fullscreen bg-dark text-white flex flex-center">
    <div class="text-center animate-fadeIn">
      <q-icon name="music_off" size="120px" color="grey" class="q-mb-xl" />

      <div class="text-h1 text-bold mb-gradient-text q-mb-md">404</div>

      <p class="text-h5 text-grey-5 q-mb-xl">
        Oops! Parece que esta página no existe
      </p>

      <q-btn
        color="primary"
        icon="home"
        label="Volver al inicio"
        to="/"
        size="lg"
        unelevated
      />
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.fullscreen {
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
}
</style>
