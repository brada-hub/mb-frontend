import { useAuth } from '../../context/AuthContext';
import DashboardDirector from './DashboardDirector';
import DashboardJefeSeccion from './DashboardJefeSeccion';
import DashboardMusico from './DashboardMusico';

/**
 * DashboardHome - Router de Dashboards según Rol
 * 
 * Detecta el rol del usuario y carga el dashboard correspondiente:
 * - Director/SuperAdmin -> DashboardDirector
 * - Jefe de Sección/Delegado -> DashboardJefeSeccion
 * - Músico/Miembro -> DashboardMusico
 */
export default function DashboardHome() {
    const { user } = useAuth();
    
    // Determinar rol del usuario
    const userRole = (user?.role || user?.miembro?.rol?.rol || '').toUpperCase();
    const isDirector = userRole.includes('DIRECTOR') || user?.is_super_admin;
    const isJefeSeccion = userRole.includes('JEFE') || userRole.includes('DELEGADO');
    
    // Cargar dashboard según rol
    if (isDirector) {
        return <DashboardDirector />;
    }
    
    if (isJefeSeccion) {
        return <DashboardJefeSeccion />;
    }
    
    // Por defecto: Músico
    return <DashboardMusico />;
}
