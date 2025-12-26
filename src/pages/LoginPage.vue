<template>
  <div class="login-page">
    <!-- Fondo animado -->
    <div class="login-background">
      <div class="floating-notes">
        <q-icon v-for="n in 8" :key="n" name="music_note" :class="`note note-${n}`" />
      </div>
    </div>

    <!-- Card de Login -->
    <div class="login-container animate-fadeIn">
      <q-card class="login-card">
        <q-card-section class="text-center q-pt-xl">
          <q-icon name="music_note" size="64px" color="primary" />
          <h1 class="text-h4 mb-gradient-text q-mt-md q-mb-none">Monster Band</h1>
          <p class="text-subtitle1 text-grey q-mt-sm">Sistema de Gestión</p>
        </q-card-section>

        <q-card-section class="q-px-lg">
          <!-- Mensaje de error -->
          <q-banner v-if="errorMessage" class="bg-negative text-white q-mb-md" rounded>
            <template v-slot:avatar>
              <q-icon name="error" />
            </template>
            {{ errorMessage }}
          </q-banner>

          <q-form @submit="handleLogin" class="q-gutter-md">
            <!-- Usuario -->
            <q-input
              v-model="form.usuario"
              label="Usuario"
              filled
              dark
              :rules="[val => !!val || 'El usuario es requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>
            </q-input>

            <!-- Contraseña -->
            <q-input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              label="Contraseña"
              filled
              dark
              :rules="[val => !!val || 'La contraseña es requerida']"
            >
              <template v-slot:prepend>
                <q-icon name="lock" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>

            <!-- Botón de login -->
            <q-btn
              type="submit"
              label="Iniciar Sesión"
              color="primary"
              class="full-width q-mt-lg"
              size="lg"
              :loading="isLoading"
              unelevated
            >
              <template v-slot:loading>
                <q-spinner-dots />
              </template>
            </q-btn>
          </q-form>
        </q-card-section>

        <q-card-section class="text-center q-pb-lg">
          <p class="text-caption text-grey">
            ¿Olvidaste tu contraseña? Contacta al administrador
          </p>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const form = ref({
  usuario: '',
  password: '',
});

const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

async function handleLogin() {
  isLoading.value = true;
  errorMessage.value = '';

  const result = await authStore.login(form.value.usuario, form.value.password);

  isLoading.value = false;

  if (result.success) {
    if (result.requiereCambioPassword) {
      void router.push('/cambiar-password');
    } else {
      const redirect = route.query.redirect as string;
      void router.push(redirect || '/');
    }
  } else {
    errorMessage.value = result.message || 'Error al iniciar sesión';
  }
}

onMounted(() => {
  // Verificar si hay error de dispositivo
  if (route.query.error === 'device') {
    errorMessage.value = 'Este dispositivo no está autorizado. Contacte al administrador.';
  }
});
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
}

.login-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.floating-notes {
  .note {
    position: absolute;
    font-size: 32px;
    color: rgba(99, 102, 241, 0.15);
    animation: float 15s infinite ease-in-out;
  }

  @for $i from 1 through 8 {
    .note-#{$i} {
      left: #{random(100)}%;
      top: #{random(100)}%;
      animation-delay: #{$i * -2}s;
      animation-duration: #{15 + $i * 2}s;
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.15;
  }
  50% {
    transform: translateY(-100px) rotate(180deg);
    opacity: 0.3;
  }
}

.login-container {
  z-index: 10;
  width: 100%;
  max-width: 420px;
  padding: 1rem;
}

.login-card {
  background: rgba(30, 41, 59, 0.9) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}
</style>
