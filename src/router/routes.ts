import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  // ═══════════════════════════════════════════════════════════════════
  // RUTAS PÚBLICAS
  // ═══════════════════════════════════════════════════════════════════
  {
    path: '/login',
    name: 'login',
    component: () => import('pages/LoginPage.vue'),
    meta: { public: true },
  },
  {
    path: '/cambiar-password',
    name: 'cambiar-password',
    component: () => import('pages/CambiarPasswordPage.vue'),
    meta: { requiresAuth: true },
  },

  // ═══════════════════════════════════════════════════════════════════
  // RUTAS PROTEGIDAS (Layout principal)
  // ═══════════════════════════════════════════════════════════════════
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      // Dashboard
      {
        path: '',
        name: 'dashboard',
        component: () => import('pages/DashboardPage.vue'),
      },

      // ─── Miembros ───
      {
        path: 'miembros',
        name: 'miembros',
        component: () => import('pages/miembros/MiembrosPage.vue'),
        meta: { requiereGestion: true },
      },
      {
        path: 'miembros/:id',
        name: 'miembro-detalle',
        component: () => import('pages/miembros/MiembroDetallePage.vue'),
        props: true,
      },

      // ─── Eventos / Contratos ───
      {
        path: 'eventos',
        name: 'eventos',
        component: () => import('pages/eventos/EventosPage.vue'),
      },
      {
        path: 'eventos/:id',
        name: 'evento-detalle',
        component: () => import('pages/eventos/EventoDetallePage.vue'),
        props: true,
      },
      {
        path: 'eventos/:id/lista',
        name: 'evento-lista',
        component: () => import('pages/eventos/EventoListaPage.vue'),
        props: true,
        meta: { requiereGestion: true },
      },

      /*
      // ─── Asistencia (Pendiente) ───
      // {
      //   path: 'asistencia',
      //   name: 'asistencia',
      //   component: () => import('pages/asistencia/AsistenciaPage.vue'),
      // },
      // {
      //   path: 'asistencia/registrar',
      //   name: 'registrar-asistencia',
      //   component: () => import('pages/asistencia/RegistrarAsistenciaPage.vue'),
      // },

      // ─── Repertorio (Pendiente) ───
      // {
      //   path: 'repertorio',
      //   name: 'repertorio',
      //   component: () => import('pages/repertorio/RepertorioPage.vue'),
      // },
      // {
      //   path: 'repertorio/:generoId',
      //   name: 'repertorio-genero',
      //   component: () => import('pages/repertorio/TemasPage.vue'),
      //   props: true,
      // },
      // {
      //   path: 'repertorio/tema/:temaId',
      //   name: 'repertorio-tema',
      //   component: () => import('pages/repertorio/PartiturasPage.vue'),
      //   props: true,
      // },

      // ─── Pagos (Pendiente) ───
      // {
      //   path: 'pagos',
      //   name: 'pagos',
      //   component: () => import('pages/pagos/PagosPage.vue'),
      //   meta: { requiereGestion: true },
      // },
      // {
      //   path: 'mi-cuenta',
      //   name: 'mi-cuenta',
      //   component: () => import('pages/pagos/MiCuentaPage.vue'),
      // },
      */

      // ─── Configuración ───
      {
        path: 'configuracion',
        name: 'configuracion',
        component: () => import('pages/ConfiguracionPage.vue'),
        meta: { requiereSuperAdmin: true },
      },

      // ─── Perfil ───
      {
        path: 'perfil',
        name: 'perfil',
        component: () => import('pages/PerfilPage.vue'),
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // 404
  // ═══════════════════════════════════════════════════════════════════
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
