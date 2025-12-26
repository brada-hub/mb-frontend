import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import routes from './routes';

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // Guard de navegación
  Router.beforeEach((to, _from, next) => {
    const authStore = useAuthStore();

    // Rutas públicas
    if (to.meta.public) {
      // Si ya está autenticado y va al login, redirigir al dashboard
      if (authStore.isAuthenticated && to.name === 'login') {
        next({ name: 'dashboard' });
        return;
      }
      next();
      return;
    }

    // Rutas que requieren autenticación
    if (to.meta.requiresAuth !== false && !authStore.isAuthenticated) {
      next({ name: 'login', query: { redirect: to.fullPath } });
      return;
    }

    // Verificar cambio de contraseña obligatorio
    if (authStore.requiereCambioPassword && to.name !== 'cambiar-password') {
      next({ name: 'cambiar-password' });
      return;
    }

    // Verificar permisos de gestión
    if (to.meta.requiereGestion && !authStore.puedeGestionar) {
      next({ name: 'dashboard' });
      return;
    }

    // Verificar super admin
    if (to.meta.requiereSuperAdmin && !authStore.esSuperAdmin) {
      next({ name: 'dashboard' });
      return;
    }

    next();
  });

  return Router;
});
