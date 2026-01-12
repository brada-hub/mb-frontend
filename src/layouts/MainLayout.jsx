import { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation, Link } from 'react-router-dom';
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
    DollarSign
} from 'lucide-react';
import { clsx } from 'clsx';
import ForcePasswordChangeModal from '../components/modals/ForcePasswordChangeModal';

const SidebarItem = ({ icon: Icon, label, to, active, onClick }) => {
    const LucideIcon = Icon;
    return (
        <Link 
            to={to} 
            onClick={onClick}
            className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                active 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
        >
            <LucideIcon className={clsx("w-5 h-5 transition-colors", active ? "text-white" : "text-gray-400 group-hover:text-white")} />
            <span className="font-medium">{label}</span>
        </Link>
    );
};

export default function MainLayout() {
    const { user, logout, loading, isAuthenticated } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [checking, setChecking] = useState(true);
    const location = useLocation();

    useEffect(() => {
        if (!loading) {
            const timer = setTimeout(() => setChecking(false), 200);
            return () => clearTimeout(timer);
        } else {
            setChecking(true);
        }
    }, [loading]);

    if (loading || checking) return <div className="h-screen w-full bg-[#0f111a] flex items-center justify-center text-white font-black tracking-widest animate-pulse uppercase">Cargando Accesos...</div>;
    if (!isAuthenticated) return <Navigate to="/login" />;

    const userRole = (user?.role || user?.miembro?.rol?.rol || '').toUpperCase();
    const isJefe = userRole.includes('JEFE');
    const isAdminOrDirector = ['ADMIN', 'DIRECTOR'].includes(userRole);
    const isPowerUser = isAdminOrDirector || isJefe;

    const hasPermission = (perm) => {
        if (!perm) return true;
        
        // Bloqueo total de finanzas para Jefes/Miembros
        if (perm === 'GESTION_FINANZAS') return isAdminOrDirector;
        
        // Bloqueo total de ROLES para todos menos el ADMIN
        if (perm === 'GESTION_ROLES') return userRole === 'ADMIN';

        if (user?.permissions?.includes(perm)) return true;
        
        if (isPowerUser) {
            if (perm === 'VER_DASHBOARD') return true;
            if (perm === 'GESTION_ASISTENCIA') return true;
        }

        return false;
    };

    const menuGroups = [
        {
            title: 'Centro de Control',
            items: [
                { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard', permission: 'VER_DASHBOARD' },
                { icon: Calendar, label: 'Agenda', to: '/dashboard/eventos', permission: null },
                { icon: FileText, label: 'Asistencia', to: '/dashboard/asistencia', permission: 'GESTION_ASISTENCIA' },
            ]
        },
        {
            title: 'Gestión de Personal',
            items: [
                { icon: Users, label: 'Miembros', to: '/dashboard/miembros', permission: 'GESTION_MIEMBROS' },
                { icon: Grid, label: 'Secciones', to: '/dashboard/secciones', permission: 'GESTION_SECCIONES' },
            ]
        },
        {
            title: 'Contenido Musical',
            items: [
                { icon: ListMusic, label: 'Repertorio', to: '/dashboard/repertorio', permission: null },
                { icon: Music, label: 'Biblioteca', to: '/dashboard/biblioteca', permission: null },
            ]
        },
        {
            title: 'Administración y Finanzas',
            items: [
                { icon: DollarSign, label: 'Gestión Pagos', to: '/dashboard/pagos', permission: 'GESTION_FINANZAS' },
                { icon: DollarSign, label: 'Mis Pagos', to: '/dashboard/mis-pagos', permission: null },
                { icon: Shield, label: 'Roles y Permisos', to: '/dashboard/roles', permission: 'GESTION_ROLES' },
            ]
        }
    ];

    const filteredGroups = menuGroups.map(group => ({
        ...group,
        items: group.items.filter(item => hasPermission(item.permission))
    })).filter(group => group.items.length > 0);

    const flattenedItems = filteredGroups.flatMap(g => g.items);

    const onDashboardRoot = location.pathname === '/dashboard' || location.pathname === '/dashboard/';
    
    if (onDashboardRoot && !hasPermission('VER_DASHBOARD')) {
        if (flattenedItems.length > 0) {
            return <Navigate to={flattenedItems[0].to} replace />;
        }
    }

    const currentItem = flattenedItems.find(i => i.to !== '/dashboard' && location.pathname.startsWith(i.to));
    if (currentItem && !hasPermission(currentItem.permission)) {
        return <Navigate to="/dashboard" replace />;
    }

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

    return (
        <div className="h-screen w-full bg-[#0f111a] flex text-gray-100 font-sans overflow-hidden">
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <aside className={clsx(
                "fixed top-0 left-0 z-50 h-screen w-72 bg-[#161b2c]/80 backdrop-blur-xl border-r border-white/5 transition-transform duration-300 flex flex-col",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
                isSidebarOpen ? "lg:translate-x-0" : "lg:-translate-x-full"
            )}>
                <div className="p-6 flex items-center justify-between border-b border-white/5 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <span className="font-bold text-white text-xl">M</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-lg text-white leading-tight">Monster Band</h1>
                            <p className="text-xs text-indigo-400 font-medium tracking-wider">PANEL ADMIN</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="lg:hidden p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg"
                    >
                        <LogOut className="w-5 h-5 rotate-180" />
                    </button>
                </div>

                <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                    {filteredGroups.map((group, gIdx) => (
                        <div key={group.title} className={clsx(gIdx !== 0 && "mt-6")}>
                            <h3 className="px-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">
                                {group.title}
                            </h3>
                            <div className="space-y-1">
                                {group.items.map((item) => (
                                    <SidebarItem 
                                        key={item.to} 
                                        {...item} 
                                        active={item.to === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(item.to)}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    />
                                ))}
                            </div>
                            {gIdx !== filteredGroups.length - 1 && (
                                <div className="mx-4 mt-6 border-b border-white/[0.03]" />
                            )}
                        </div>
                    ))}
                </div>

                <div className="w-full p-4 border-t border-white/5 shrink-0">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold border border-indigo-500/20">
                            {user?.user?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.user}</p>
                            <p className="text-xs text-indigo-400 font-bold tracking-wider truncate">
                                {userRole}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={logout} 
                        className="w-full flex items-center justify-center gap-2 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            <main className={clsx(
                "flex-1 h-screen flex flex-col relative transition-all duration-300",
                isSidebarOpen ? "lg:ml-72" : "lg:ml-0"
            )}>
                <header className="h-10 sm:h-16 lg:h-20 px-2 sm:px-8 flex items-center justify-between border-b border-white/5 bg-[#0f111a]/50 backdrop-blur-md shrink-0 sticky top-0 z-30">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button 
                            className="p-1 sm:p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            onClick={() => {
                                if (window.innerWidth >= 1024) {
                                    setIsSidebarOpen(!isSidebarOpen);
                                } else {
                                    setIsMobileMenuOpen(!isMobileMenuOpen);
                                }
                            }}
                        >
                            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>

                        <h2 className="text-sm sm:text-xl font-bold text-white hidden sm:block uppercase tracking-tighter">
                            {[...flattenedItems].reverse().find(i => location.pathname.startsWith(i.to))?.label || 'Dashboard'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-4">
                        <button className="p-1 sm:p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors relative">
                            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full border-2 border-[#0f111a]"></span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 pt-0 px-2 sm:px-6 lg:px-8 pb-4 sm:pb-6 overflow-y-auto w-full max-w-full mx-auto flex flex-col">
                    <Outlet />
                </div>
            </main>
            
            <ForcePasswordChangeModal />
        </div>
    );
}
