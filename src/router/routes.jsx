import LoginPage from '../pages/auth/LoginPage';
import DashboardHome from '../pages/dashboard/DashboardHome';
import MiembrosList from '../pages/miembros/MiembrosList';
import RolesList from '../pages/roles/RolesList';
import SeccionesList from '../pages/secciones/SeccionesList';
import BibliotecaList from '../pages/biblioteca/BibliotecaList';
import ThemeDetailView from '../pages/biblioteca/ThemeDetailView';
import EventosList from '../pages/eventos/EventosList';
import AsistenciasList from '../pages/asistencias/AsistenciasList';
import ConvocatoriaEvento from '../pages/eventos/ConvocatoriaEvento';
import MixesList from '../pages/repertorio/MixesList';
import MainLayout from '../layouts/MainLayout';
import { Navigate } from 'react-router-dom';

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
            { path: 'roles', element: <RolesList /> },
            { path: 'secciones', element: <SeccionesList /> },
            { path: 'biblioteca', element: <BibliotecaList /> },
            { path: 'biblioteca/:id/detalle', element: <ThemeDetailView /> },
            { path: 'repertorio', element: <MixesList /> },
            { path: 'eventos', element: <EventosList /> },
            { path: 'eventos/:id/convocatoria', element: <ConvocatoriaEvento /> },
            { path: 'asistencia', element: <AsistenciasList /> }
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
