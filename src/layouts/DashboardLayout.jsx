import { useState } from 'react';
import { Outlet, Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    Users, 
    Calendar, 
    music, 
    LogOut, 
    Menu, 
    X,
    Bell,
    Settings,
    FileText
} from 'lucide-react';
import { clsx } from 'clsx';

const SidebarItem = ({ icon: Icon, label, to, active }) => (
    <Link 
        to={to} 
        className={clsx(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
            active 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                : "text-gray-400 hover:text-white hover:bg-white/5"
        )}
    >
        <Icon className={clsx("w-5 h-5 transition-colors", active ? "text-white" : "text-gray-400 group-hover:text-white")} />
        <span className="font-medium">{label}</span>
    </Link>
);

export default function DashboardLayout() {
    const { user, logout, loading, isAuthenticated } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    if (loading) return <div className="h-screen w-full bg-[#0f111a] flex items-center justify-center text-white">Cargando...</div>;
    if (!isAuthenticated) return <Navigate to="/login" />;

    const sidebarItems = [
        { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
        { icon: Users, label: 'Miembros', to: '/dashboard/miembros' },
        { icon: Calendar, label: 'Eventos', to: '/dashboard/eventos' },
        { icon: FileText, label: 'Asistencia', to: '/dashboard/asistencia' },
        // Add more menu items here
    ];

    return (
        <div className="min-h-screen w-full bg-[#0f111a] flex text-gray-100 font-sans">
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={clsx(
                "fixed top-0 left-0 z-50 h-screen w-72 bg-[#161b2c]/80 backdrop-blur-xl border-r border-white/5 transition-transform duration-300 lg:translate-x-0 lg:static",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 flex items-center gap-3 border-b border-white/5">
                    <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <span className="font-bold text-white text-xl">M</span>
                    </div>
                    <div>
                        <h1 className="font-bold text-lg text-white leading-tight">Monster Band</h1>
                        <p className="text-xs text-indigo-400 font-medium tracking-wider">PANEL ADMIN</p>
                    </div>
                </div>

                <div className="p-4 space-y-1 mt-4">
                    {sidebarItems.map((item) => (
                        <SidebarItem 
                            key={item.to} 
                            {...item} 
                            active={location.pathname === item.to || location.pathname.startsWith(item.to + '/')}
                        />
                    ))}
                </div>

                <div className="absolute bottom-0 w-full p-4 border-t border-white/5">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold border border-indigo-500/20">
                            {user?.user?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.user}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.role || 'Admin'}</p>
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

            {/* Main Content */}
            <main className="flex-1 min-h-screen flex flex-col relative overflow-hidden">
                {/* Topbar */}
                <header className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-[#0f111a]/50 backdrop-blur-md sticky top-0 z-30">
                    <button 
                        className="lg:hidden p-2 text-gray-400 hover:text-white"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <h2 className="text-xl font-bold text-white hidden lg:block">
                        {sidebarItems.find(i => location.pathname.startsWith(i.to))?.label || 'Dashboard'}
                    </h2>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0f111a]"></span>
                        </button>
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                <div className="flex-1 p-8 overflow-y-auto w-full max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
