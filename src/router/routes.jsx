import { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// Lazy loading function
const Loadable = (Component) => (props) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Component {...props} />
  </Suspense>
);

// Lazy imports
const LoginPage = Loadable(lazy(() => import('../pages/auth/LoginPage')));
const DashboardHome = Loadable(lazy(() => import('../pages/dashboard/DashboardHome')));
const MiembrosList = Loadable(lazy(() => import('../pages/miembros/MiembrosList')));
const RolesList = Loadable(lazy(() => import('../pages/roles/RolesList')));
const SeccionesList = Loadable(lazy(() => import('../pages/secciones/SeccionesList')));
const BibliotecaList = Loadable(lazy(() => import('../pages/biblioteca/BibliotecaList')));
const ThemeDetailView = Loadable(lazy(() => import('../pages/biblioteca/ThemeDetailView')));
const EventosList = Loadable(lazy(() => import('../pages/eventos/EventosList')));
const AsistenciasList = Loadable(lazy(() => import('../pages/asistencias/AsistenciasList')));
const AsistenciaReporte = Loadable(lazy(() => import('../pages/asistencias/AsistenciaReporte')));
const ConvocatoriaEvento = Loadable(lazy(() => import('../pages/eventos/ConvocatoriaEvento')));
const MixesList = Loadable(lazy(() => import('../pages/repertorio/MixesList')));
const MainLayout = Loadable(lazy(() => import('../layouts/MainLayout')));
const PagosAdmin = Loadable(lazy(() => import('../pages/pagos/PagosAdmin')));
const MisPagos = Loadable(lazy(() => import('../pages/pagos/MisPagos')));
const ReportesHome = Loadable(lazy(() => import('../pages/reportes/ReportesHome')));
const FormacionesList = Loadable(lazy(() => import('../pages/miembros/FormacionesList')));
const NotificationsList = Loadable(lazy(() => import('../pages/notificaciones/NotificationsList')));
const ProfilePage = Loadable(lazy(() => import('../pages/auth/ProfilePage')));
const SuperAdminPanel = Loadable(lazy(() => import('../pages/superadmin/SuperAdminPanel')));


const routes = [
    {
        path: '/login',
        element: <LoginPage />
    },
    {
        path: '/:bandSlug/login',
        element: <LoginPage />
    },
    {
        path: '/dashboard',
        element: <MainLayout />,
        children: [
            { index: true, element: <DashboardHome /> },
            { path: 'miembros', element: <MiembrosList /> },
            { path: 'formaciones', element: <FormacionesList /> },
            { path: 'roles', element: <RolesList /> },
            { path: 'secciones', element: <SeccionesList /> },
            { path: 'pagos', element: <PagosAdmin /> },
            { path: 'mis-pagos', element: <MisPagos /> },
            { path: 'biblioteca', element: <BibliotecaList /> },
            { path: 'biblioteca/:id/detalle', element: <ThemeDetailView /> },
            { path: 'repertorio', element: <MixesList /> },
            { path: 'eventos', element: <EventosList /> },
            { path: 'eventos/:id/convocatoria', element: <ConvocatoriaEvento /> },
            { path: 'asistencia', element: <AsistenciasList /> },
            { path: 'asistencia/reporte', element: <AsistenciaReporte /> },
            { path: 'reportes', element: <ReportesHome /> },
            { path: 'notificaciones', element: <NotificationsList /> },
            { path: 'perfil', element: <ProfilePage /> },
            { path: 'superadmin', element: <SuperAdminPanel /> }
        ]
    },
    {
        path: '/',
        element: <Navigate to="/dashboard" replace />
    },
    {
        path: '*',
        element: <Navigate to="/dashboard" replace />
    }
];

export default routes;
