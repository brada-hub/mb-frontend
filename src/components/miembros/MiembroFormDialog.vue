<template>
  <q-dialog v-model="isOpen" persistent transition-show="scale" transition-hide="scale">
    <q-card class="bg-dark text-white" style="width: 900px; max-width: 95vw;">

      <!-- HEADER -->
      <q-bar class="bg-primary text-white">
        <q-icon name="person" />
        <div class="text-weight-bold">{{ miembroId ? 'Editar Miembro' : 'Nuevo Miembro' }}</div>
        <q-space />
        <q-btn dense flat icon="close" v-close-popup>
          <q-tooltip>Cerrar</q-tooltip>
        </q-btn>
      </q-bar>

      <!-- CONTENIDO PRINCIPAL -->
      <q-card-section v-if="!showCredentialsStep" class="q-pa-md scroll" style="max-height: 85vh;">
        <q-form @submit="handleSubmit" class="q-gutter-md">

          <!-- SECCIÓN 1: DATOS PERSONALES Y UBICACIÓN -->
          <div class="text-h6 text-primary q-mb-sm">Datos Personales y Ubicación</div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <q-input
                :model-value="form.nombres"
                @update:model-value="val => form.nombres = (val || '').toString().toUpperCase().replace(/[^A-ZÁÉÍÓÚÑÜ\s]/g, '')"
                @keydown="bloquearNumerosYCaracteres"
                label="Nombres *"
                filled dark dense
                maxlength="30"
                class="uppercase-input"
                :rules="[val => !!val || 'Requerido']"
              >
                <template v-slot:prepend><q-icon name="person" /></template>
                <template v-slot:hint><span class="text-grey-6">Máx 30 letras</span></template>
              </q-input>
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                :model-value="form.apellidos"
                @update:model-value="val => form.apellidos = (val || '').toString().toUpperCase().replace(/[^A-ZÁÉÍÓÚÑÜ\s]/g, '')"
                @keydown="bloquearNumerosYCaracteres"
                label="Apellidos *"
                filled dark dense
                maxlength="30"
                class="uppercase-input"
                :rules="[val => !!val || 'Requerido']"
              >
                <template v-slot:prepend><q-icon name="person_outline" /></template>
                <template v-slot:hint><span class="text-grey-6">Máx 30 letras</span></template>
              </q-input>
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model="form.ci"
                label="CI *"
                filled dark dense
                maxlength="12"
                class="uppercase-input"
                hint="Ej: 1234567 o 1234567-A"
                :rules="[val => !!val || 'Requerido', isValidCI]"
                @update:model-value="val => form.ci = (val || '').toString().toUpperCase()"
              >
                <template v-slot:prepend><q-icon name="fingerprint" /></template>
              </q-input>
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                filled
                v-model="form.celular"
                label="Celular *"
                mask="########"
                unmasked-value
                @update:model-value="filtrarCelular"
                :rules="[
                  val => !!val || 'Requerido',
                  val => /^[67][0-9]{7}$/.test(val) || 'Debe empezar con 6 o 7'
                ]"
              >
                <template v-slot:prepend>
                  <q-icon name="smartphone" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-sm-6">
               <q-input
                filled
                v-model="form.fecha_nacimiento"
                label="Fecha Nacimiento *"
                type="date"
                :rules="[
                  val => !!val || 'Requerido',
                  val => new Date(val) < new Date() || 'Debe ser una fecha pasada'
                ]"
              >
                <template v-slot:prepend><q-icon name="event" /></template>
              </q-input>
            </div>

            <div class="col-12 q-mt-md">
              <div class="relative-position overflow-hidden bg-grey-9" style="border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); height: 250px;">
                 <div ref="inlineMapContainer" style="height: 100%; width: 100%; z-index: 1;"></div>
                 <q-btn icon="fullscreen" color="primary" round unelevated
                        class="absolute-top-right q-ma-xs"
                        style="z-index: 10;"
                        @click="showMapDialog = true">
                   <q-tooltip>Ampliar Mapa</q-tooltip>
                 </q-btn>
              </div>
              <div v-if="form.latitud" class="text-caption text-grey q-mt-xs text-right">
                <q-icon name="place" color="primary" /> {{ form.latitud }}, {{ form.longitud }}
              </div>
            </div>

            <div class="col-12">
              <q-input
                v-model="form.direccion"
                label="Dirección Detallada"
                filled dark dense
                type="textarea"
                rows="2"
                class="uppercase-input"
                @update:model-value="val => form.direccion = (val || '').toString().toUpperCase()"
              >
                 <template v-slot:prepend><q-icon name="home" /></template>
              </q-input>
            </div>
          </div>

          <q-separator dark class="q-my-md" />

          <!-- SECCIÓN 2: CONTACTO DE EMERGENCIA -->
          <div class="text-h6 text-primary q-mb-sm">Contacto de Emergencia</div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <q-input
                filled
                v-model="form.referencia_nombre"
                label="Nombre de Contacto"
                @keydown="bloquearNumerosYCaracteres"
                maxlength="50"
                class="uppercase-input"
                @update:model-value="val => form.referencia_nombre = (val || '').toString().toUpperCase().replace(/[^A-ZÁÉÍÓÚÑÜ\s]/g, '')"
                :rules="[ val => !val || /^[A-ZÁÉÍÓÚÑÜ\s]+$/.test(val) || 'Solo letras' ]"
              >
                <template v-slot:prepend><q-icon name="person_pin" /></template>
              </q-input>
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                filled
                v-model="form.referencia_celular"
                label="Celular de Contacto"
                mask="########"
                unmasked-value
                :rules="[ val => !val || /^[67][0-9]{7}$/.test(val) || 'Debe empezar con 6 o 7' ]"
              >
                 <template v-slot:prepend>
                    <q-icon name="phone_in_talk" />
                 </template>
              </q-input>
            </div>
          </div>

          <q-separator dark class="q-my-md" />

          <!-- SECCIÓN 3: INFO BANDA (AL FINAL) -->
          <div class="text-h6 text-primary q-mb-sm">Información de la Banda</div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-4">
              <q-select v-model="form.seccion_id" :options="seccionesOptions" label="Sección *" filled dark dense emit-value map-options :rules="[val => !!val || 'Requerido']">
                <template v-slot:prepend><q-icon name="music_note" /></template>
              </q-select>
            </div>
            <div class="col-12 col-sm-4">
              <q-select v-model="form.categoria_id" :options="categoriasOptions" label="Categoría *" filled dark dense emit-value map-options :rules="[val => !!val || 'Requerido']">
                 <template v-slot:prepend><q-icon name="star" /></template>
              </q-select>
            </div>
            <div class="col-12 col-sm-4">
              <q-select v-model="form.rol_id" :options="rolesOptions" label="Rol *" filled dark dense emit-value map-options :rules="[val => !!val || 'Requerido']">
                 <template v-slot:prepend><q-icon name="badge" /></template>
              </q-select>
            </div>
          </div>

          <div class="flex justify-end gap-3 q-mt-lg">
            <q-btn flat label="Cancelar" v-close-popup color="grey" />
            <q-btn type="submit" color="primary" label="Guardar" :loading="isLoading" unelevated />
          </div>
        </q-form>
      </q-card-section>

      <!-- PASO: CREDENCIALES (ÉXITO) -->
      <q-card-section v-else class="text-center q-pa-xl">
        <q-icon name="check_circle" color="positive" size="80px" class="q-mb-md" />
        <div class="text-h4 text-positive q-mb-md">¡Miembro Registrado!</div>

        <div class="bg-grey-9 rounded-borders q-pa-md q-my-md text-left inline-block" style="min-width: 300px;">
          <div class="text-subtitle1 q-mb-xs">Usuario: <span class="text-primary text-weight-bold">{{ credentials.usuario }}</span></div>
          <div class="text-subtitle1">Contraseña: <span class="text-primary text-weight-bold">{{ credentials.password }}</span></div>
        </div>

        <p class="text-grey q-mb-lg">Por favor comparte estas credenciales con el nuevo miembro.</p>

        <div class="flex justify-center gap-3">
          <q-btn color="green-14" icon="send" label="Enviar por WhatsApp" @click="shareWhatsApp" />
          <q-btn outline color="white" label="Finalizar" @click="closeDialog" />
        </div>
      </q-card-section>
    </q-card>

    <!-- DIALOGO MAPA FULLSCREEN -->
    <q-dialog v-model="showMapDialog" maximized @show="initDialogMap">
      <q-card class="bg-dark text-white">
        <q-bar class="bg-black">
          <div>Seleccionar Ubicación</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>
        <q-card-section class="q-pa-none fit">
          <div ref="mapContainer" class="fit"></div>
          <q-btn class="absolute-bottom q-mb-xl q-mx-auto" style="left:0; right:0; width: 200px; z-index: 9999;"
                 color="primary" label="Confirmar" rounded push v-close-popup />
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue';
import { useQuasar, openURL } from 'quasar';
import { api } from 'src/boot/axios';
import { useCatalogosStore } from 'src/stores/catalogos';
import { useMonsterNotify } from 'src/composables/useMonsterNotify';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix iconos leaflet
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const props = defineProps<{
  modelValue: boolean;
  miembroId?: number | null;
}>();

const emit = defineEmits(['update:modelValue', 'saved']);
const $q = useQuasar();
const catalogosStore = useCatalogosStore();
const { notifySuccess, notifyError } = useMonsterNotify();

const isOpen = ref(false);
const showCredentialsStep = ref(false);
const credentials = ref({ usuario: '', password: '' });
const isLoading = ref(false);
const showMapDialog = ref(false);

// Mapa Refs
const mapContainer = ref<HTMLElement | null>(null);
const inlineMapContainer = ref<HTMLElement | null>(null);
let dialogMap: L.Map | null = null;
let inlineMap: L.Map | null = null;
let inlineMarker: L.Marker | null = null;
let dialogMarker: L.Marker | null = null;
const defaultLat = -17.4139;
const defaultLng = -66.1653;

const form = ref({
  nombres: '',
  apellidos: '',
  ci: '',
  celular: '',
  fecha_nacimiento: '',
  direccion: '',
  latitud: null as number | null,
  longitud: null as number | null,
  referencia_nombre: '',
  referencia_celular: '',
  seccion_id: null as number | null,
  categoria_id: null as number | null,
  rol_id: null as number | null,
});

// Options
const seccionesOptions = computed(() => catalogosStore.secciones.map(s => ({ label: s.nombre, value: s.id })));
const categoriasOptions = computed(() => catalogosStore.categorias.map(c => ({ label: `${c.codigo} - ${c.nombre}`, value: c.id })));
const rolesOptions = computed(() => catalogosStore.roles.map(r => ({ label: r.nombre, value: r.id })));

// Watchers
watch(() => props.modelValue, async (val) => {
  isOpen.value = val;
  if (val) {
    showCredentialsStep.value = false;
    if (props.miembroId) {
      await fetchMiembro(props.miembroId);
    } else {
      resetForm();
    }
    // Inicializar mapa un poco despues para que el modal esté renderizado
    setTimeout(initInlineMap, 300);
  }
});

watch(isOpen, (val) => emit('update:modelValue', val));

function closeDialog() {
  isOpen.value = false;
}

function resetForm() {
  form.value = {
    nombres: '', apellidos: '', ci: '', celular: '',
    fecha_nacimiento: '', direccion: '', latitud: null, longitud: null,
    referencia_nombre: '', referencia_celular: '',
    seccion_id: null, categoria_id: null, rol_id: null
  };
}

async function fetchMiembro(id: number) {
  isLoading.value = true;
  try {
    const response = await api.get(`/miembros/${id}`);
    if (response.data.success) {
      const m = response.data.data;
      // Formatear fecha para input type="date" (YYYY-MM-DD)
      const fechaFormat = m.fecha_nacimiento ? m.fecha_nacimiento.split('T')[0] : '';

      form.value = {
        ...m,
        fecha_nacimiento: fechaFormat,
        latitud: m.latitud ? Number(m.latitud) : null,
        longitud: m.longitud ? Number(m.longitud) : null
      };
      if (m.ci_numero) form.value.ci = m.ci_numero + (m.ci_complemento ? `-${m.ci_complemento}` : '');
    }
  } catch (e) {
    notifyError('Error cargando datos');
    closeDialog();
  } finally {
    isLoading.value = false;
  }
}

// Map Logic
function createMarker(map: L.Map, lat: number, lng: number) {
  const m = L.marker([lat, lng], { draggable: true }).addTo(map);
  m.on('dragend', () => {
    const { lat, lng } = m.getLatLng();
    form.value.latitud = Number(lat.toFixed(6));
    form.value.longitud = Number(lng.toFixed(6));
  });
  return m;
}

async function initInlineMap() {
  await nextTick();
  if (!inlineMapContainer.value || !isOpen.value) return;

  if (inlineMap) inlineMap.remove();

  const lat = form.value.latitud || defaultLat;
  const lng = form.value.longitud || defaultLng;

  inlineMap = L.map(inlineMapContainer.value, {
    zoomControl: false,
    attributionControl: false
  }).setView([lat, lng], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(inlineMap);
  inlineMarker = createMarker(inlineMap, lat, lng);

  inlineMap.on('click', (e) => {
    form.value.latitud = Number(e.latlng.lat.toFixed(6));
    form.value.longitud = Number(e.latlng.lng.toFixed(6));
    inlineMarker?.setLatLng(e.latlng);
  });

  setTimeout(() => inlineMap?.invalidateSize(), 200);
}

async function initDialogMap() {
  await nextTick();
  if (!mapContainer.value) return;
  if (dialogMap) dialogMap.remove();

  const lat = form.value.latitud || defaultLat;
  const lng = form.value.longitud || defaultLng;

  dialogMap = L.map(mapContainer.value, {
    attributionControl: false
  }).setView([lat, lng], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(dialogMap);
  dialogMarker = createMarker(dialogMap, lat, lng);

  dialogMap.on('click', (e) => {
    form.value.latitud = Number(e.latlng.lat.toFixed(6));
    form.value.longitud = Number(e.latlng.lng.toFixed(6));
    dialogMarker?.setLatLng(e.latlng);
    inlineMarker?.setLatLng(e.latlng); // Mover el marcador pequeño
    inlineMap?.setView(e.latlng); // Centrar la vista del pequeño (NUEVO)
  });
}

// Validaciones
const isValidCI = (val: string) => /^\d+(?:-[a-zA-Z0-9]{1,2})?$/.test(val) || 'Formato inválido (Ej: 1234567 o 1234567-1E)';

function filtrarCelular(val: string | number | null) {
  const v = (val || '').toString();
  if (v.length > 0 && !/^[67]/.test(v)) {
    // Si el primer digito no es 6 o 7, lo borramos inmediatamente
    // Esto es un UX agresivo pero cumple "si o si debe empezar"
    nextTick(() => { form.value.celular = ''; });
    return;
  }
  // Si ya tiene más de 8 chars, cortar
  if (v.length > 8) {
      nextTick(() => { form.value.celular = v.substring(0, 8); });
  }
}

function bloquearNumerosYCaracteres(event: KeyboardEvent) {
  const teclasPermitidas = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Control', 'Alt', 'Shift'];
  if (teclasPermitidas.includes(event.key) || event.ctrlKey) return;
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]$/.test(event.key)) event.preventDefault();
}

async function handleSubmit() {
  isLoading.value = true;

  // Separar CI
  const ciMatch = form.value.ci.match(/^(\d+)(-?([a-zA-Z]))?$/);
  const payload = {
    ...form.value,
    ci_numero: ciMatch ? ciMatch[1] : form.value.ci,
    ci_complemento: ciMatch && ciMatch[3] ? ciMatch[3].toUpperCase() : null
  };

  try {
    if (props.miembroId) {
      await api.put(`/miembros/${props.miembroId}`, payload);
      notifySuccess('Miembro actualizado');
      emit('saved');
      closeDialog();
    } else {
      const resp = await api.post('/miembros', payload);
      if (resp.data.success) {
        credentials.value = resp.data.data.credenciales;
        showCredentialsStep.value = true;
        emit('saved');
      }
    }
  } catch (e: any) {
    if (e.response?.status === 422) {
      const errors = e.response.data.errors;
      const firstError = Object.values(errors)[0] as string[];
      notifyError(firstError[0] || 'Error de validación');
    } else {
      notifyError('Error al guardar datos');
    }
  } finally {
    isLoading.value = false;
  }
}

function shareWhatsApp() {
  const msg = `Hola ${form.value.nombres}, tus credenciales: Usuario: ${credentials.value.usuario}, Pass: ${credentials.value.password}`;
  openURL(`https://wa.me/${form.value.celular}?text=${encodeURIComponent(msg)}`);
}

onBeforeUnmount(() => {
  inlineMap?.remove();
  dialogMap?.remove();
});
</script>

<style scoped>
.leaflet-pane { z-index: 1 !important; }
</style>
