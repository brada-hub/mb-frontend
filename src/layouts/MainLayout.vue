<template>
  <q-layout view="lHh Lpr lFf">
    <!-- ═══════════════════════════════════════════════════════════════
         HEADER
         ═══════════════════════════════════════════════════════════════ -->
    <q-header class="main-header">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title class="flex items-center">
          <q-icon name="music_note" size="28px" class="q-mr-sm text-accent" />
          <span class="hide-on-mobile">Monster Band</span>
        </q-toolbar-title>

        <!-- Notificaciones -->
        <q-btn flat round icon="notifications" class="q-mr-sm">
          <q-badge v-if="notificaciones > 0" color="negative" floating>
            {{ notificaciones }}
          </q-badge>
        </q-btn>

        <!-- Usuario -->
        <q-btn flat round>
          <q-avatar size="36px" color="primary" text-color="white">
            {{ authStore.iniciales }}
          </q-avatar>
          <q-menu>
            <q-list style="min-width: 200px">
              <q-item-label header>
                {{ authStore.nombreCompleto }}
              </q-item-label>
              <q-item-label caption class="q-px-md q-pb-sm">
                {{ authStore.rolNombre }} - {{ authStore.seccionNombre }}
              </q-item-label>
              <q-separator />
              <q-item clickable v-close-popup @click="$router.push('/perfil')">
                <q-item-section avatar>
                  <q-icon name="person" />
                </q-item-section>
                <q-item-section>Mi Perfil</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="$router.push('/mi-cuenta')">
                <q-item-section avatar>
                  <q-icon name="account_balance_wallet" />
                </q-item-section>
                <q-item-section>Mi Cuenta</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="cerrarSesion">
                <q-item-section avatar>
                  <q-icon name="logout" color="negative" />
                </q-item-section>
                <q-item-section class="text-negative">Cerrar Sesión</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- ═══════════════════════════════════════════════════════════════
         SIDEBAR / DRAWER
         ═══════════════════════════════════════════════════════════════ -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="main-drawer"
    >
      <q-list>
        <!-- Logo -->
        <q-item-label header class="text-center q-py-lg">
          <div class="flex column items-center">
            <q-icon name="music_note" size="48px" color="primary" />
            <div class="text-h6 mb-gradient-text q-mt-sm">Monster Band</div>
            <div class="text-caption text-grey">Sistema de Gestión</div>
          </div>
        </q-item-label>

        <q-separator spaced />

        <!-- Navegación principal con detección de ruta mejorada -->
        <template v-for="item in menuItems" :key="item.to">
          <q-item
            v-if="!item.requiereGestion || authStore.puedeGestionar"
            clickable
            :to="item.to"
            :class="{ 'q-item--active': isRouteActive(item.to) }"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" />
            </q-item-section>
            <q-item-section>{{ item.label }}</q-item-section>
          </q-item>
        </template>

        <q-separator spaced />

        <!-- Configuración (solo super admin) -->
        <q-item
          v-if="authStore.esSuperAdmin"
          clickable
          to="/configuracion"
          :class="{ 'q-item--active': isRouteActive('/configuracion') }"
        >
          <q-item-section avatar>
            <q-icon name="settings" />
          </q-item-section>
          <q-item-section>Configuración</q-item-section>
        </q-item>
      </q-list>

      <!-- Versión -->
      <div class="absolute-bottom q-pa-md text-center text-caption text-grey">
        v1.0.0
      </div>
    </q-drawer>

    <!-- ═══════════════════════════════════════════════════════════════
         CONTENIDO PRINCIPAL
         ═══════════════════════════════════════════════════════════════ -->
    <q-page-container>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import { useCatalogosStore } from 'src/stores/catalogos';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const catalogosStore = useCatalogosStore();

const leftDrawerOpen = ref(false);
const notificaciones = ref(0);

const menuItems = computed(() => [
  { to: '/', icon: 'dashboard', label: 'Dashboard', exact: true },
  { to: '/miembros', icon: 'groups', label: 'Miembros', requiereGestion: true },
  { to: '/eventos', icon: 'event', label: 'Eventos' },
  // { to: '/asistencia', icon: 'how_to_reg', label: 'Asistencia' },
  // { to: '/repertorio', icon: 'library_music', label: 'Repertorio' },
  // { to: '/pagos', icon: 'payments', label: 'Pagos', requiereGestion: true },
]);

/**
 * Determina si una ruta del menú está activa.
 * Para Dashboard (/) usa coincidencia exacta.
 * Para otras rutas, verifica si la ruta actual comienza con la ruta del menú.
 */
function isRouteActive(menuPath: string): boolean {
  const currentPath = route.path;

  // Dashboard solo activo si está exactamente en /
  if (menuPath === '/') {
    return currentPath === '/';
  }

  // Para otras rutas, activar si la ruta actual comienza con el path del menú
  return currentPath === menuPath || currentPath.startsWith(menuPath + '/');
}

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

async function cerrarSesion() {
  await authStore.logout();
  void router.push('/login');
}

onMounted(() => {
  // Cargar catálogos al iniciar
  void catalogosStore.fetchAll();
});
</script>

<style lang="scss" scoped>
.main-header {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%) !important;
  border-bottom: 1px solid var(--mb-border);
}

.main-drawer {
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%) !important;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
