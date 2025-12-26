<template>
  <q-page class="q-pa-md">
    <div class="page-header q-mb-lg">
      <h1 class="text-h4 mb-gradient-text q-mb-none">Cambiar Contraseña</h1>
      <p class="text-subtitle1 text-grey">Debes cambiar tu contraseña antes de continuar</p>
    </div>

    <q-card class="mb-card" style="max-width: 500px">
      <q-card-section>
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <q-input
            v-model="form.passwordActual"
            :type="showCurrent ? 'text' : 'password'"
            label="Contraseña Actual"
            filled
            dark
            :rules="[val => !!val || 'Requerido']"
          >
            <template v-slot:append>
              <q-icon
                :name="showCurrent ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showCurrent = !showCurrent"
              />
            </template>
          </q-input>

          <q-input
            v-model="form.passwordNuevo"
            :type="showNew ? 'text' : 'password'"
            label="Nueva Contraseña"
            filled
            dark
            :rules="[
              val => !!val || 'Requerido',
              val => val.length >= 8 || 'Mínimo 8 caracteres'
            ]"
          >
            <template v-slot:append>
              <q-icon
                :name="showNew ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showNew = !showNew"
              />
            </template>
          </q-input>

          <q-input
            v-model="form.passwordConfirmation"
            :type="showConfirm ? 'text' : 'password'"
            label="Confirmar Nueva Contraseña"
            filled
            dark
            :rules="[
              val => !!val || 'Requerido',
              val => val === form.passwordNuevo || 'Las contraseñas no coinciden'
            ]"
          >
            <template v-slot:append>
              <q-icon
                :name="showConfirm ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showConfirm = !showConfirm"
              />
            </template>
          </q-input>

          <q-btn
            type="submit"
            label="Cambiar Contraseña"
            color="primary"
            class="full-width"
            :loading="isLoading"
            unelevated
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

const form = ref({
  passwordActual: '',
  passwordNuevo: '',
  passwordConfirmation: '',
});

const showCurrent = ref(false);
const showNew = ref(false);
const showConfirm = ref(false);
const isLoading = ref(false);

async function handleSubmit() {
  isLoading.value = true;

  const result = await authStore.cambiarPassword(
    form.value.passwordActual,
    form.value.passwordNuevo,
    form.value.passwordConfirmation
  );

  isLoading.value = false;

  if (result.success) {
    $q.notify({
      type: 'positive',
      message: 'Contraseña cambiada correctamente',
    });
    void router.push('/');
  } else {
    $q.notify({
      type: 'negative',
      message: result.message || 'Error al cambiar contraseña',
    });
  }
}
</script>
