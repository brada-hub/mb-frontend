<template>
  <q-dialog v-model="isOpen" persistent transition-show="scale" transition-hide="scale">
    <q-card class="mb-card" style="width: 700px; max-width: 90vw;">
      <q-card-section>
        <div class="text-h6">Nuevo Evento</div>
      </q-card-section>

      <q-form @submit="handleSubmit">
        <q-card-section class="q-pt-none">
          <div class="row q-col-gutter-md">
            <!-- Tipo de Evento -->
            <div class="col-12">
              <div class="q-gutter-sm">
                <q-radio v-model="form.tipo" val="contrato" label="Contrato" color="positive" />
                <q-radio v-model="form.tipo" val="ensayo" label="Ensayo" color="primary" />
              </div>
            </div>

            <!-- Nombre -->
            <div class="col-12">
              <q-input
                v-model="form.nombre"
                label="Nombre del Evento *"
                filled
                dark
                :rules="[val => !!val || 'Requerido']"
              />
            </div>

            <!-- Fechas -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.fecha"
                label="Fecha *"
                type="date"
                filled
                dark
                :rules="[val => !!val || 'Requerido']"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.hora_citacion"
                label="Hora Citación *"
                type="time"
                filled
                dark
                :rules="[val => !!val || 'Requerido']"
              />
            </div>

            <!-- Lugar -->
            <div class="col-12">
              <q-input
                v-model="form.lugar"
                label="Lugar *"
                filled
                dark
                :rules="[val => !!val || 'Requerido']"
              />
            </div>

            <!-- Descripción -->
            <div class="col-12">
              <q-input
                v-model="form.descripcion"
                label="Descripción / Notas"
                type="textarea"
                filled
                dark
                rows="3"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="text-primary q-pa-md">
          <q-btn flat label="Cancelar" v-close-popup color="grey" />
          <q-btn type="submit" label="Guardar Evento" color="primary" unelevated :loading="isLoading" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { api } from 'src/boot/axios';
import { useMonsterNotify } from 'src/composables/useMonsterNotify';

const props = defineProps<{
  modelValue: boolean; // Para v-model
}>();

const emit = defineEmits(['update:modelValue', 'saved']);

const { notifySuccess, notifyError } = useMonsterNotify();

const isOpen = ref(false);
const isLoading = ref(false);

const form = ref({
  tipo: 'contrato',
  nombre: '',
  fecha: '',
  hora_citacion: '',
  lugar: '',
  descripcion: ''
});

// Sincronizar v-model con isOpen
watch(() => props.modelValue, (val) => {
  isOpen.value = val;
  if (val) {
    // Resetear formulario al abrir
    form.value = {
      tipo: 'contrato',
      nombre: '',
      fecha: new Date().toISOString().split('T')[0] || '',
      hora_citacion: '19:00',
      lugar: '',
      descripcion: ''
    };
  }
});

watch(isOpen, (val) => {
  emit('update:modelValue', val);
});

async function handleSubmit() {
  isLoading.value = true;
  try {
    const response = await api.post('/eventos', form.value);
    if (response.data.success) {
      notifySuccess('Evento creado exitosamente');
      emit('saved');
      isOpen.value = false;
    }
  } catch (error) {
    console.error(error);
    notifyError('Error al crear evento');
  } finally {
    isLoading.value = false;
  }
}
</script>
