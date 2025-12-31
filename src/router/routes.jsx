import { Navigate } from 'react-router-dom';
import { 
    LoginPage, 
    DashboardHome, 
    MiembrosList,
    RolesList,
    SeccionesList
} from '../pages';
import MainLayout from '../layouts/MainLayout';

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
            { path: 'eventos', element: <div className="text-white">Eventos (Próximamente)</div> },
            { path: 'asistencia', element: <div className="text-white">Asistencia (Próximamente)</div> }
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
