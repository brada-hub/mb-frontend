import LoginPage from '../pages/auth/LoginPage';
import DashboardHome from '../pages/dashboard/DashboardHome';
import MiembrosList from '../pages/miembros/MiembrosList';
import RolesList from '../pages/roles/RolesList';
import SeccionesList from '../pages/secciones/SeccionesList';
import BibliotecaList from '../pages/biblioteca/BibliotecaList';
import ThemeDetailView from '../pages/biblioteca/ThemeDetailView';
import EventosList from '../pages/eventos/EventosList';
import AsistenciasList from '../pages/asistencias/AsistenciasList';
import AsistenciaReporte from '../pages/asistencias/AsistenciaReporte';
import ConvocatoriaEvento from '../pages/eventos/ConvocatoriaEvento';
import MixesList from '../pages/repertorio/MixesList';
import MainLayout from '../layouts/MainLayout';
import PagosAdmin from '../pages/pagos/PagosAdmin';
import MisPagos from '../pages/pagos/MisPagos';
import ReportesHome from '../pages/reportes/ReportesHome';
import FormacionesList from '../pages/miembros/FormacionesList';
import { Navigate } from 'react-router-dom';

import NotificationsList from '../pages/notificaciones/NotificationsList';
import SuperAdminPanel from '../pages/superadmin/SuperAdminPanel';

const routes = [
    {
        path: '/login',
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
