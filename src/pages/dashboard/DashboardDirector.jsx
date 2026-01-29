import { useState, useEffect } from 'react';
import { Users, Calendar, DollarSign, Activity, Flame, TrendingUp, ArrowUpRight, Clock, MapPin, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// --- Componentes ---
const StatCard = ({ title, value, label, icon: Icon, color, loading, onClick }) => {
    const colors = {
        indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        amber: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
        rose: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
    };

    return (
        <motion.div 
            whileHover={{ y: -4 }} 
            onClick={onClick}
            className={clsx(
                "bg-white dark:bg-[#161b2c] border border-gray-200 dark:border-white/5 rounded-3xl p-6 transition-all hover:shadow-xl dark:hover:shadow-none",
                onClick && "cursor-pointer active:scale-95 transition-transform"
            )}
        >
            <div className={clsx("p-3 rounded-xl border w-fit mb-4", colors[color])}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{title}</p>
            {loading ? (
                <div className="h-9 w-24 bg-gray-100 dark:bg-white/5 animate-pulse rounded-lg mt-1" />
            ) : (
                <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{value}</h3>
            )}
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-2">{label}</p>
        </motion.div>
    );
};


const TopStreaksList = ({ musicians, loading }) => {
    if (loading) return <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />)}</div>;
    if (!musicians.length) return <p className="text-gray-500 text-sm text-center py-6">Sin datos de rachas</p>;
    
    return (
        <div className="space-y-2">
            {musicians.slice(0, 5).map((m, idx) => (
                <motion.div key={m.id_miembro} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-white/[0.04] rounded-xl transition-all"
                >
                    <div className="flex items-center gap-3">
                        <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black",
                            idx === 0 ? "bg-amber-500 text-black rotate-2" : idx === 1 ? "bg-gray-300 text-black -rotate-2" : idx === 2 ? "bg-orange-700 text-white" : "bg-white/10 text-gray-400"
                        )}>{idx + 1}</div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{m.nombres} {m.apellidos?.charAt(0)}.</p>
                            <p className="text-[10px] text-gray-500">{m.instrumento}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-orange-500">
                        <Flame className="w-4 h-4 fill-current" />
                        <span className="text-sm font-black">{m.streak}</span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default function DashboardDirector() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const isImpersonating = user?.original_banda_id !== undefined && user?.original_banda_id !== null;
    const displayName = user?.miembro?.nombres || user?.user || 'Director';
    const bandName = user?.banda?.nombre || 'Monster Band';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

    useEffect(() => { loadStats(); }, [user, isImpersonating]);

    const loadStats = async () => {
        try {
            const endpoint = (user?.is_super_admin && !isImpersonating) ? '/superadmin/stats' : '/dashboard/stats';
            const res = await api.get(endpoint);
            setData(res.data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    return (
        <div className="min-h-full bg-gray-50 dark:bg-[#0a0d14] transition-colors">
            <div className="max-w-[1600px] mx-auto px-4 py-8 space-y-8">
                
                {/* Hero Premium */}
                <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-[2.5rem] p-8 sm:p-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                    
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">{bandName}</span>
                                {user?.is_super_admin && (
                                    <span className="px-3 py-1 bg-amber-500/30 text-amber-200 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-400/30">
                                        SuperAdmin
                                    </span>
                                )}
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter">
                                {greeting}, <span className="text-indigo-200">{displayName}</span>
                            </h1>
                            <p className="mt-3 text-white/60 text-sm uppercase tracking-widest font-bold">
                                Panel de Control • Director de Banda
                            </p>
                        </div>
                        
                        <div className="flex gap-3">
                            <button onClick={() => navigate('/dashboard/eventos')} className="group p-5 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-2xl border border-white/10 transition-all">
                                <Calendar className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                                <p className="text-xs font-bold">Agenda</p>
                            </button>
                            <button onClick={() => navigate('/dashboard/miembros')} className="group p-5 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-2xl border border-white/10 transition-all">
                                <Users className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                                <p className="text-xs font-bold">Personal</p>
                            </button>
                            <button onClick={() => navigate('/dashboard/asistencia')} className="group p-5 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-2xl border border-white/10 transition-all">
                                <Activity className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                                <p className="text-xs font-bold">Control</p>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Miembros" value={data?.stats?.miembros?.total || 0} icon={Users} color="indigo" loading={loading} label="Staff Activo" onClick={() => navigate('/dashboard/miembros')} />
                    <StatCard title="Asistencia" value={`${data?.stats?.asistencia?.promedio || 0}%`} icon={Activity} color="emerald" loading={loading} label="Promedio Global" onClick={() => navigate('/dashboard/asistencia')} />
                    <StatCard title="Eventos Hoy" value={data?.stats?.eventos?.hoy || 0} icon={Calendar} color="indigo" loading={loading} label={`${data?.stats?.eventos?.proximos || 0} Esta Semana`} onClick={() => navigate('/dashboard/eventos')} />
                    <StatCard title="Listas Pendientes" value={data?.stats?.eventos?.pendientes_formacion || 0} icon={Layers} color="amber" loading={loading} label="Por armar o completar" onClick={() => navigate('/dashboard/formaciones')} />
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Sección Principal - Más intuitiva */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* Próximos Eventos de la Semana */}
                        <div className="bg-white dark:bg-[#161b2c] border border-gray-200 dark:border-white/5 rounded-3xl p-6 transition-colors">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-indigo-500" /> Esta Semana
                                </h2>
                                <button onClick={() => navigate('/dashboard/eventos')} className="text-xs font-bold text-indigo-500 uppercase tracking-wider hover:text-indigo-400">
                                    Ver Agenda →
                                </button>
                            </div>
                            
                            {loading ? (
                                <div className="space-y-3">
                                    {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse" />)}
                                </div>
                            ) : data?.mis_eventos?.length > 0 ? (
                                <div className="space-y-3">
                                    {data.mis_eventos.slice(0, 5).map((ev, idx) => (
                                        <motion.div 
                                            key={ev.id_evento} 
                                            initial={{ opacity: 0, x: -20 }} 
                                            animate={{ opacity: 1, x: 0 }} 
                                            transition={{ delay: idx * 0.1 }}
                                            className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-all group cursor-pointer"
                                            onClick={() => navigate('/dashboard/eventos')}
                                        >
                                            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{ev.evento}</p>
                                                <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                                                    <MapPin className="w-3 h-3" /> {ev.direccion || 'Por confirmar'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-black text-indigo-500">{ev.hora?.substring(0, 5)}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">{ev.tipo?.evento}</p>
                                            </div>
                                            <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-gray-400">
                                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm font-bold">Sin eventos esta semana</p>
                                    <button onClick={() => navigate('/dashboard/eventos')} className="mt-3 px-4 py-2 bg-indigo-500/10 text-indigo-500 rounded-lg text-xs font-bold hover:bg-indigo-500/20 transition-colors">
                                        + Crear Evento
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Resumen Rápido */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Asistencia del Mes - Simple */}
                            <div className="bg-white dark:bg-[#161b2c] border border-gray-200 dark:border-white/5 rounded-2xl p-5 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Asistencia del Mes</p>
                                    <Activity className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div className="flex items-end gap-3">
                                    <span className={clsx("text-4xl font-black", (data?.stats?.asistencia?.promedio_mes || 0) >= 80 ? "text-emerald-500" : (data?.stats?.asistencia?.promedio_mes || 0) >= 50 ? "text-amber-500" : "text-red-500")}>
                                        {data?.stats?.asistencia?.promedio_mes || 0}%
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase mb-1">promedio</span>
                                </div>
                                <div className="mt-4 h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }} 
                                        animate={{ width: `${data?.stats?.asistencia?.promedio_mes || 0}%` }}
                                        className={clsx("h-full", (data?.stats?.asistencia?.promedio_mes || 0) >= 80 ? "bg-emerald-500" : (data?.stats?.asistencia?.promedio_mes || 0) >= 50 ? "bg-amber-500" : "bg-red-500")} 
                                    />
                                </div>
                            </div>
                            
                            {/* Eventos Completados */}
                            <div className="bg-white dark:bg-[#161b2c] border border-gray-200 dark:border-white/5 rounded-2xl p-5 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Actividad Reciente</p>
                                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                                </div>
                                <div className="flex items-center gap-6">
                                    <div>
                                        <span className="text-4xl font-black text-gray-900 dark:text-white">{data?.stats?.eventos?.hoy || 0}</span>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Hoy</p>
                                    </div>
                                    <div className="w-px h-10 bg-gray-200 dark:bg-white/10" />
                                    <div>
                                        <span className="text-4xl font-black text-gray-900 dark:text-white">{data?.stats?.eventos?.proximos || 0}</span>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Esta Semana</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* Acciones Rápidas */}
                        <div className="bg-white dark:bg-[#161b2c] border border-gray-200 dark:border-white/5 rounded-3xl p-6 transition-colors">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4">
                                Acciones Rápidas
                            </h3>
                            <div className="space-y-3">
                                <button onClick={() => navigate('/dashboard/miembros')} className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/[0.02] hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all group">
                                    <Users className="w-5 h-5 text-indigo-500" />
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Gestionar Miembros</span>
                                </button>
                                <button onClick={() => navigate('/dashboard/eventos')} className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/[0.02] hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl transition-all group">
                                    <Calendar className="w-5 h-5 text-amber-500" />
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-amber-600 dark:group-hover:text-amber-400">Crear Evento</span>
                                </button>
                                <button onClick={() => navigate('/dashboard/reportes')} className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/[0.02] hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all group">
                                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Ver Reportes</span>
                                </button>
                            </div>
                        </div>

                        {/* Top Streaks */}
                        <div className="bg-white dark:bg-[#161b2c] border border-gray-200 dark:border-white/5 rounded-3xl p-6 transition-colors">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2 mb-4">
                                <Flame className="w-5 h-5 text-orange-500" /> Wall of Fame
                            </h3>
                            <TopStreaksList musicians={data?.top_streaks || []} loading={loading} />
                        </div>

                        {/* Control de Asistencia */}
                        <button onClick={() => navigate('/dashboard/asistencia')} className="w-full p-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl flex items-center justify-between transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]">
                            <div className="flex items-center gap-3">
                                <Activity className="w-5 h-5" />
                                <span className="text-sm font-bold uppercase tracking-wide">Control de Asistencia</span>
                            </div>
                            <ArrowUpRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Eventos de Hoy */}
                {data?.mis_eventos?.length > 0 && (
                    <div className="bg-white dark:bg-[#161b2c] border border-gray-200 dark:border-white/5 rounded-3xl p-8 transition-colors">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                <Clock className="w-5 h-5 text-amber-500" /> Eventos de Hoy
                            </h2>
                            <button onClick={() => navigate('/dashboard/eventos')} className="text-xs font-bold text-indigo-500 uppercase tracking-wider hover:text-indigo-400">
                                Ver todos →
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {data.mis_eventos.slice(0, 4).map(ev => (
                                <div key={ev.id_evento} className="p-5 bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl">
                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{ev.tipo?.evento} • {ev.hora?.substring(0, 5)}</p>
                                    <p className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight mt-1">{ev.evento}</p>
                                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-2">
                                        <MapPin className="w-3 h-3" /> {ev.direccion || 'Por confirmar'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
