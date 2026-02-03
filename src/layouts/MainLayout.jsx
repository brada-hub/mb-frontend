import { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    Users, 
    Calendar, 
    LogOut, 
    Menu, 
    Bell,
    Settings,
    FileText,
    Shield,
    Layers,
    Music,
    ListMusic,
    Grid,
    DollarSign,
    Crown,
    Sun,
    Moon,
    Monitor,
    Building2,
    HardDrive,
    Activity
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import ForcePasswordChangeModal from '../components/modals/ForcePasswordChangeModal';
import CompleteProfileModal from '../components/modals/CompleteProfileModal';
import logoMb from '../assets/logo_mb.png';
import logoSimba from '../assets/logo_simba.png';

const SidebarItem = ({ icon: Icon, label, to, active, onClick, collapsed }) => {
    const LucideIcon = Icon;
    return (
        <Link 
            to={to} 
            onClick={onClick}
            className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative",
                active 
                    ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/25" 
                    : "text-gray-500 dark:text-gray-400 hover:text-brand-primary dark:hover:text-white hover:bg-brand-primary/5 dark:hover:bg-white/5",
                collapsed ? "justify-center px-0 w-11 h-11 mx-auto" : "w-full"
            )}
            title={collapsed ? label : ""}
        >
            <LucideIcon className={clsx("transition-transform duration-300", active ? "text-white" : "group-hover:scale-110", collapsed ? "w-5 h-5" : "w-5 h-5")} />
            {!collapsed && <span className="font-bold text-xs uppercase tracking-wide truncate">{label}</span>}
            
            {collapsed && active && (
                <motion.div 
                    layoutId="active-indicator"
                    className="absolute -right-3 w-1.5 h-8 bg-white rounded-l-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                />
            )}
        </Link>
    );
};

import { requestForToken } from '../firebase-config';
import { isNative, setupNativeNotifications } from '../utils/nativeApp';
import api from '../api';
import NotificationBell from '../components/NotificationBell';

export default function MainLayout() {
    const { user, logout, loading, isAuthenticated, updateUser } = useAuth();
    const { theme, updateTheme } = useTheme();
    const { notify } = useToast();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        // En tablets (640-1024), colapsado por defecto. En desktop, extendido.
        return window.innerWidth >= 640 && window.innerWidth < 1024;
    });
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [checking, setChecking] = useState(true);
    const [stopping, setStopping] = useState(false);
    const location = useLocation();

    useEffect(() => {
        if (!loading) {
            const timer = setTimeout(() => setChecking(false), 200);
            return () => clearTimeout(timer);
        } else {
            setChecking(true);
        }
    }, [loading]);

    const navigate = useNavigate();
    const userRole = (user?.role || user?.miembro?.rol?.rol || '').toUpperCase();
    
    // NIVELES DEFINITIVOS
    const isSuperAdmin = !!user?.is_super_admin;
    const isDirector = userRole === 'DIRECTOR';
    const isJefe = userRole === 'JEFE DE SECCIÓN';
    const isMusico = !isSuperAdmin && !isDirector && !isJefe;
    const isImpersonating = user?.original_banda_id !== undefined && user?.original_banda_id !== null;

    const displayRole = isSuperAdmin ? 'Admin de App' : (user?.miembro?.rol?.rol || 'Miembro');

    // Registro de Token para Notificaciones Push
    useEffect(() => {
        if (isAuthenticated && !loading) {
            const setupPush = async () => {
                try {
                    let token = null;
                    
                    if (isNative()) {
                        // Usar notificaciones nativas de Capacitor en Android
                        await setupNativeNotifications((nativeToken) => {
                            token = nativeToken;
                        });
                        // Esperar un poco para que el token se registre
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } else {
                        // Usar Firebase Web Push en navegador
                        token = await requestForToken();
                    }
                    
                    if (token) {
                        await api.post('/update-fcm-token', { fcm_token: token });
                        console.log('Push token sincronizado con el servidor.');
                    }
                } catch (error) {
                    console.error('Error configurando push notifications:', error);
                }
            };
            setupPush();
        }
    }, [isAuthenticated, loading]);

    // REDIRECCIÓN DE SEGURIDAD (GUARDS)
    useEffect(() => {
        if (!loading && !checking && isAuthenticated) {
            const path = location.pathname;
            
            // 1. SuperAdmin (No impostor) -> Rebotar al Panel Global si entra a rutas de banda
            if (isSuperAdmin && !isImpersonating) {
                const operationalRoutes = [
                    '/dashboard/eventos', 
                    '/dashboard/asistencia', 
                    '/dashboard/miembros', 
                    '/dashboard/secciones',
                    '/dashboard/repertorio',
                    '/dashboard/biblioteca',
                    '/dashboard/pagos'
                ];
                if (operationalRoutes.some(r => path.startsWith(r)) || path === '/dashboard') {
                    navigate('/dashboard/superadmin', { replace: true });
                }
            }

            // 2. Músico -> Rebotar si intenta entrar a gestión de pagos o personal
            if (isMusico) {
                const forbiddenForMusico = [
                    '/dashboard/pagos',
                    '/dashboard/miembros',
                    '/dashboard/roles',
                    '/dashboard/reportes'
                ];
                if (forbiddenForMusico.some(r => path.startsWith(r))) {
                    navigate('/dashboard', { replace: true });
                }
            }

            // 3. Jefe -> Rebotar si intenta entrar a gestión de personal pura o roles
            if (isJefe) {
                const forbiddenForJefe = [
                    '/dashboard/miembros',
                    '/dashboard/roles'
                ];
                if (forbiddenForJefe.some(r => path.startsWith(r))) {
                    navigate('/dashboard', { replace: true });
                }
            }
        }
    }, [location.pathname, loading, checking, isAuthenticated, isSuperAdmin, isImpersonating, isMusico]);

    if (loading || checking) return <div className="h-screen w-full bg-[#0f111a] flex items-center justify-center text-white font-black tracking-widest animate-pulse uppercase">Cargando Accesos...</div>;
    if (!isAuthenticated) return <Navigate to="/login" />;

    const hasPermission = (perm) => {
        // REGLA DE ORO: Si es SuperAdmin y NO está impersonando, solo tiene permisos de SaaS
        if (isSuperAdmin && !isImpersonating) {
            return perm === 'CREAR_BANDAS' || perm === 'VER_INGRESOS_SAAS' || perm === 'CONFIG_SAAS';
        }

        // Si está impersonando, el SuperAdmin actúa como Director (Acceso Total a la banda)
        if (isSuperAdmin && isImpersonating) return true;

        if (!perm) return true;
        
        // RESTRICCIONES SEGÚN LA TABLA DEL USUARIO (MÚSICO / DIRECTOR)
        if (perm === 'VER_INGRESOS_SAAS') return isSuperAdmin;
        if (perm === 'VER_DASHBOARD_OPERATIVO') return isDirector || isSuperAdmin;
        if (perm === 'GESTION_PAGOS_GLOBAL') return isDirector;
        if (perm === 'CREAR_BANDAS') return isSuperAdmin;

        if (perm === 'GESTION_BIBLIOTECA') {
            if (isDirector) return true;
            return Array.isArray(user?.permissions) && user.permissions.includes('GESTION_BIBLIOTECA');
        }

        if (perm === 'CONFIG_SAAS') return isSuperAdmin;

        if (Array.isArray(user?.permissions) && user.permissions.includes(perm)) return true;
        
        if (isDirector || isJefe) {
            if (perm === 'VER_DASHBOARD') return true;
            if (perm === 'GESTION_MIEMBROS') return isDirector;
            if (perm === 'GESTION_ELENCOS') return true;
            if (perm === 'GESTION_SECCIONES') return isDirector;
            if (perm === 'GESTION_ROLES') return isDirector || isSuperAdmin;
            if (perm === 'GESTION_ASISTENCIA') return true;
            if (perm === 'VER_REPORTES') return true;
        }

        if (isMusico) {
            // Músicos solo ven lo básico (Agenda, Repertorio, Sus Pagos)
            const basicPerms = [null, 'VER_DASHBOARD', 'GESTION_ASISTENCIA'];
            if (basicPerms.includes(perm)) return true;
        }

        return false;
    };

    const menuGroups = [];

    // GRUPO 1: SaaS (NEGOCIO)
    menuGroups.push({
        title: 'App Owner (SaaS)',
        items: [
            { icon: Crown, label: 'Resumen Global', to: '/dashboard/superadmin?tab=resumen', permission: 'CREAR_BANDAS' },
            { icon: Building2, label: 'Organizaciones', to: '/dashboard/superadmin?tab=bandas', permission: 'CREAR_BANDAS' },
            { icon: HardDrive, label: 'Almacenamiento', to: '/dashboard/superadmin?tab=storage', permission: 'CREAR_BANDAS' },
            { icon: Activity, label: 'Monitor Actividad', to: '/dashboard/superadmin?tab=logs', permission: 'CREAR_BANDAS' },
            { icon: Settings, label: 'Config. Planes', to: '/dashboard/superadmin?tab=config', permission: 'CREAR_BANDAS' },
            { icon: Shield, label: 'Roles y Permisos', to: '/dashboard/roles', permission: 'GESTION_ROLES' },
        ],
        showFor: isSuperAdmin // Solo para SuperAdmin
    });

    // GRUPO 2: CONTROL OPERATIVO
    menuGroups.push({
        title: 'Control Operativo',
        items: [
            { icon: LayoutDashboard, label: 'Centro de Comando', to: '/dashboard', permission: 'VER_DASHBOARD' },
            { icon: Calendar, label: 'Mi Agenda', to: '/dashboard/eventos', permission: null },
            { icon: FileText, label: 'Asistencia', to: '/dashboard/asistencia', permission: 'GESTION_ASISTENCIA' },
            { icon: FileText, label: 'Reportes', to: '/dashboard/reportes', permission: 'VER_REPORTES' },
        ],
        hideForSuperAdmin: !isImpersonating
    });

    // GRUPO 3: RECURSOS HUMANOS
    menuGroups.push({
        title: 'Recursos Humanos',
        items: [
            { icon: Users, label: 'Personal', to: '/dashboard/miembros', permission: 'GESTION_MIEMBROS' },
            { icon: Layers, label: 'Formaciones', to: '/dashboard/formaciones', permission: 'GESTION_ELENCOS' },
            { icon: Grid, label: 'Secciones', to: '/dashboard/secciones', permission: 'GESTION_SECCIONES' },
        ],
        hideForSuperAdmin: !isImpersonating
    });

    // GRUPO 4: ACADEMIA / BIBLIOTECA
    menuGroups.push({
        title: 'Academia / Biblioteca',
        items: [
            { icon: ListMusic, label: 'Repertorio', to: '/dashboard/repertorio', permission: null },
            { icon: Music, label: 'Partituras', to: '/dashboard/biblioteca', permission: null },
        ],
        hideForSuperAdmin: !isImpersonating
    });

    // GRUPO 5: ADMINISTRACIÓN
    menuGroups.push({
        title: 'Administración',
        items: [
            { icon: DollarSign, label: 'Gestión de Pagos', to: '/dashboard/pagos', permission: 'GESTION_PAGOS_GLOBAL' },
            { icon: DollarSign, label: 'Mis Pagos', to: '/dashboard/mis-pagos', permission: null },
            { icon: Shield, label: 'Roles y Permisos', to: '/dashboard/roles', permission: 'GESTION_ROLES' },
        ],
        hideForSuperAdmin: !isImpersonating
    });

    const filteredGroups = menuGroups
        .filter(group => {
            if (group.showFor !== undefined) return group.showFor;
            if (group.hideForSuperAdmin && isSuperAdmin) return false;
            return true;
        })
        .map(group => ({
            ...group,
            items: group.items.filter(item => hasPermission(item.permission))
        }))
        .filter(group => group.items.length > 0);

    const flattenedItems = filteredGroups.flatMap(g => g.items);

    if (!loading && !checking && flattenedItems.length === 0) {
        return (
            <div className="h-screen w-full bg-[#0f111a] flex flex-col items-center justify-center p-6 text-center">
                <Shield className="w-16 h-16 text-gray-600 mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">Sin Accesos Disponibles</h1>
                <p className="text-gray-400 max-w-sm mb-8">
                    Tu cuenta no tiene permisos configurados para acceder al panel web. 
                    Contacta con el administrador para que te asigne un rol.
                </p>
                <button 
                    onClick={logout}
                    className="px-8 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl hover:bg-red-500/20 transition-all font-bold"
                >
                    Cerrar Sesión
                </button>
            </div>
        );
    }

    const handleStopImpersonating = async () => {
        setStopping(true);
        try {
            const res = await api.post('/superadmin/stop-impersonate');
            updateUser(res.data.user);
            notify('Has vuelto al modo Administrador Monster', 'success');
        } catch (error) {
            console.error(error);
            notify('Error al volver al modo Administrador', 'error');
        } finally {
            setStopping(false);
        }
    };



    return (
        <div className="h-screen w-full bg-gray-50 dark:bg-[#0f111a] flex flex-col text-gray-900 dark:text-gray-100 font-sans overflow-hidden transition-colors duration-300">
            {/* Impersonation Banner */}
            {isImpersonating && (
                <div className="w-full bg-amber-500 py-2 px-4 shadow-xl z-[60] flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2 text-white">
                        <Shield className="w-4 h-4" />
                        <p className="text-[11px] font-black uppercase tracking-wider">
                            MODO SOPORTE TÉCNICO: Estás viendo {user?.banda?.nombre}
                        </p>
                    </div>
                    <button 
                        onClick={handleStopImpersonating}
                        disabled={stopping}
                        className="flex items-center gap-2 px-4 py-1 bg-black/20 hover:bg-black/30 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 active:scale-95 disabled:opacity-50"
                    >
                        {stopping ? 'Restaurando...' : 'Salir del soporte'}
                    </button>
                </div>
            )}

            <div className="flex-1 flex overflow-hidden relative">
                {isMobileMenuOpen && (
                    <div 
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                <aside className={clsx(
                    "fixed top-0 left-0 z-50 h-screen bg-white/95 dark:bg-[#161b2c]/95 backdrop-blur-2xl border-r border-gray-200 dark:border-white/5 transition-all duration-500 ease-in-out flex flex-col shadow-2xl overflow-hidden",
                    // Mobile state
                    isMobileMenuOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0",
                    // Desktop/Tablet states
                    !isMobileMenuOpen && (isSidebarCollapsed ? "w-24" : "w-72"),
                    !isSidebarOpen && "lg:-translate-x-full"
                )}>
                    <div className={clsx(
                        "p-6 border-b border-gray-200 dark:border-white/5 shrink-0 transition-all duration-500",
                        isSidebarCollapsed && !isMobileMenuOpen ? "flex justify-center" : "flex flex-col items-center"
                    )}>
                        <div className="flex flex-col items-center gap-3">
                            <div className={clsx(
                                "bg-transparent rounded-2xl flex items-center justify-center overflow-hidden shrink-0 transform transition-all duration-500 hover:scale-105",
                                isSidebarCollapsed && !isMobileMenuOpen ? "w-12 h-12" : "w-20 h-20"
                            )}>
                                {user?.is_super_admin ? (
                                    <img 
                                        src={logoSimba} 
                                        alt="SIMBA"
                                        className="w-full h-full object-contain p-1"
                                    />
                                ) : user?.banda?.logo ? (
                                    <img 
                                        src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${user.banda.logo}`} 
                                        alt={user?.banda?.nombre}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <img 
                                        src={logoMb} 
                                        alt="Monster Band"
                                        className="w-full h-full object-contain"
                                    />
                                )}
                            </div>
                            {(!isSidebarCollapsed || isMobileMenuOpen) && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center"
                                >
                                    <h1 className="font-black text-base text-gray-900 dark:text-white leading-tight uppercase tracking-tight transition-colors">
                                        {user?.is_super_admin ? 'SIMBA ADMIN' : (user?.banda?.nombre || 'Monster Band')}
                                    </h1>
                                    <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-black tracking-[0.2em] uppercase mt-1">
                                        {user?.is_super_admin ? 'Dueño de App' : 'Admin Panel'}
                                    </p>
                                </motion.div>
                            )}
                        </div>
                        {isMobileMenuOpen && (
                            <button 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-3 text-gray-400 hover:text-white bg-white/5 rounded-2xl active:scale-90 transition-all"
                            >
                                <LogOut className="w-5 h-5 rotate-180" />
                            </button>
                        )}
                    </div>

                    <div className="p-3 sm:p-4 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] space-y-8">
                        {filteredGroups.map((group, gIdx) => (
                            <div key={group.title} className="animate-in fade-in slide-in-from-left-2 duration-500">
                                {(!isSidebarCollapsed || isMobileMenuOpen) && (
                                    <h3 className="px-4 text-[9px] font-black text-gray-500 dark:text-gray-500 text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] mb-4 opacity-50">
                                        {group.title}
                                    </h3>
                                )}
                                <div className="space-y-1.5">
                                    {group.items.map((item) => (
                                        <SidebarItem 
                                            key={item.to} 
                                            {...item} 
                                            collapsed={isSidebarCollapsed && !isMobileMenuOpen}
                                            active={(() => {
                                                const [path, query] = item.to.split('?');
                                                const isSamePath = item.to === '/dashboard' ? location.pathname === '/dashboard' : location.pathname === path;
                                                if (!query) return isSamePath && !location.search;
                                                return isSamePath && location.search === `?${query}`;
                                            })()}
                                            onClick={() => {
                                                if (window.innerWidth < 1024) setIsMobileMenuOpen(false);
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="w-full p-4 border-t border-gray-200 dark:border-white/5 shrink-0 bg-gray-50 dark:bg-black/20">
                        <div className={clsx(
                            "flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-white/5 mb-4 border border-gray-200 dark:border-white/5 transition-all duration-500 shadow-sm dark:shadow-none",
                            isSidebarCollapsed && !isMobileMenuOpen ? "justify-center px-0" : "px-3"
                        )}>
                            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-black border border-indigo-500/20 shrink-0">
                                {user?.user?.charAt(0).toUpperCase()}
                            </div>
                            {(!isSidebarCollapsed || isMobileMenuOpen) && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black text-gray-900 dark:text-white truncate uppercase tracking-tight transition-colors">{user?.user}</p>
                                    <p className="text-[10px] text-indigo-400 font-bold tracking-widest truncate uppercase opacity-70">
                                        {displayRole}
                                    </p>
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={logout} 
                            className={clsx(
                                "w-full flex items-center justify-center gap-2 p-3.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest border border-transparent hover:border-red-500/20 active:scale-95",
                                isSidebarCollapsed && !isMobileMenuOpen ? "px-0" : "px-4"
                            )}
                        >
                            <LogOut className="w-4 h-4" />
                            {(!isSidebarCollapsed || isMobileMenuOpen) && "Cerrar Sesión"}
                        </button>
                    </div>
                </aside>

                <main className={clsx(
                    "flex-1 h-full flex flex-col relative transition-all duration-500 overflow-hidden ml-0",
                    isMobileMenuOpen ? "ml-0" : (isSidebarCollapsed ? "lg:ml-20" : "lg:ml-72")
                )}>
                    <header className="h-auto min-h-[84px] sm:min-h-[80px] lg:min-h-[100px] pt-[env(safe-area-inset-top)] px-4 sm:px-8 flex items-center justify-between border-b border-gray-200 dark:border-white/5 bg-white/80 dark:bg-[#0f111a]/80 backdrop-blur-2xl shrink-0 sticky top-0 z-[100] transition-colors duration-300">
                        <div className="flex items-center gap-4 sm:gap-6">
                            <button 
                                className="p-3 sm:p-4 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-2xl transition-all active:scale-90"
                                onClick={() => {
                                    if (window.innerWidth >= 1024) {
                                        setIsSidebarCollapsed(!isSidebarCollapsed);
                                    } else {
                                        setIsMobileMenuOpen(!isMobileMenuOpen);
                                    }
                                }}
                            >
                                <Menu className="w-6 h-6 sm:w-7 sm:h-7" />
                            </button>

                            <h2 className="text-sm sm:text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter opacity-90 transition-colors">
                                {[...flattenedItems].reverse().find(i => location.pathname.startsWith(i.to))?.label || 'Dashboard'}
                            </h2>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-6">
                            <NotificationBell />
                            
                            {/* Theme Toggle */}
                            <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/5">
                                <button 
                                    onClick={() => updateTheme('light')}
                                    className={clsx(
                                        "p-2 rounded-lg transition-all", 
                                        theme === 'light' ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-white"
                                    )}
                                >
                                    <Sun className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => updateTheme('system')}
                                    className={clsx(
                                        "p-2 rounded-lg transition-all hidden sm:block", 
                                        theme === 'system' ? "bg-white/10 text-white shadow-lg" : "text-gray-500 hover:text-white"
                                    )}
                                    title="Sistema"
                                >
                                    <Monitor className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => updateTheme('dark')}
                                    className={clsx(
                                        "p-2 rounded-lg transition-all", 
                                        theme === 'dark' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "text-gray-500 hover:text-white"
                                    )}
                                >
                                    <Moon className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="hidden sm:block h-10 w-px bg-white/5 mx-2" />
                            <button 
                                onClick={() => navigate('/dashboard/perfil')}
                                className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors"
                            >
                                <Settings className="w-4 h-4" />
                                Config
                            </button>
                        </div>
                    </header>

                    <div className="flex-1 w-full max-w-screen-2xl mx-auto pt-6 px-4 sm:px-8 pb-10 overflow-y-auto custom-scrollbar scroll-smooth">
                        <Outlet />
                    </div>
                </main>
            </div>
            
            <ForcePasswordChangeModal />
            <CompleteProfileModal isOpen={user && !user.is_super_admin && !user.profile_completed} user={user} />
        </div>
    );
}
