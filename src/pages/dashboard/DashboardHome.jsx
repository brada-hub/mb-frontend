import { useState, useEffect } from 'react';
import { Users, Calendar, DollarSign, Activity, Flame, TrendingUp, ArrowUpRight, Clock, Zap, MapPin, Navigation, CheckCircle2, Building2, Crown, Shield, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import AttendanceHeatmap from '../asistencias/components/AttendanceHeatmap';

// --- Premium Components ---

const HeroCard = ({ user, event, loading }) => {
    const navigate = useNavigate();
    const bandName = user?.banda?.nombre || 'Monster Band';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full overflow-hidden bg-white dark:bg-[#161b2c] rounded-[2.5rem] border border-gray-200 dark:border-white/5 p-1 px-1 shadow-sm dark:shadow-none transition-colors duration-500"
        >
            <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
            
            <div className="relative z-10 p-8 sm:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-indigo-500/20 rounded-full border border-indigo-500/30">
                            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">{bandName}</span>
                        </div>
                        {user?.is_super_admin && (
                            <div className="px-3 py-1 bg-amber-500/20 rounded-full border border-amber-500/30">
                                <span className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-[0.2em]">SaaS Root</span>
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic leading-none transition-colors">
                            {greeting}, <br />
                            <span className="text-indigo-600 dark:text-indigo-400">{user?.user}</span>
                        </h1>
                        <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-widest max-w-sm opacity-60">
                            Todo listo para las operaciones de hoy. Revisa tu agenda y gestiona tu equipo.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => navigate('/dashboard/eventos')}
                            className="group p-6 bg-gray-50 dark:bg-white/[0.03] hover:bg-gray-100 dark:hover:bg-white/[0.06] rounded-[2rem] border border-gray-200 dark:border-white/5 transition-all w-44 shadow-sm dark:shadow-none"
                        >
                            <Calendar className="w-6 h-6 text-indigo-500 dark:text-indigo-400 mb-4 group-hover:scale-110 transition-transform" />
                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-1">Agenda</p>
                            <p className="text-xs font-bold text-gray-900 dark:text-white uppercase group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Ver Eventos</p>
                        </button>
                        <button 
                            onClick={() => navigate('/dashboard/miembros')}
                            className="group p-6 bg-gray-50 dark:bg-white/[0.03] hover:bg-gray-100 dark:hover:bg-white/[0.06] rounded-[2rem] border border-gray-200 dark:border-white/5 transition-all w-44 shadow-sm dark:shadow-none"
                        >
                            <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-1">Personal</p>
                            <p className="text-xs font-bold text-gray-900 dark:text-white uppercase group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Gestionar</p>
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const StatCard = ({ title, value, label, icon: Icon, color, loading, subtitle }) => {
    const colors = {
        indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        amber: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
        rose: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
        sky: 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20'
    };

    const hoverColors = {
        indigo: 'hover:border-indigo-500/40',
        emerald: 'hover:border-emerald-500/40',
        amber: 'hover:border-amber-500/40',
        rose: 'hover:border-rose-500/40',
        sky: 'hover:border-sky-500/40'
    };

    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className={clsx(
                "group relative bg-white dark:bg-[#161b2c]/40 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-[2.5rem] p-8 transition-all duration-500 overflow-hidden shadow-sm dark:shadow-none",
                hoverColors[color]
            )}
        >
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all" />
            
            <div className="relative z-10 p-0 flex flex-col h-full justify-between gap-6">
                <div className="flex items-center justify-between">
                    <div className={clsx("p-4 rounded-2xl border transition-transform group-hover:rotate-6", colors[color])}>
                        <Icon className="w-6 h-6" />
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-500 dark:text-gray-500 uppercase tracking-[0.2em]">{title}</p>
                    {loading ? (
                        <div className="h-10 w-2/3 bg-gray-100 dark:bg-white/5 animate-pulse rounded-xl mt-2" />
                    ) : (
                        <h3 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter tabular-nums truncate transition-colors">
                            {value}
                        </h3>
                    )}
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</span>
                        <div className={clsx("w-2 h-2 rounded-full animate-pulse", colors[color].split(' ')[1])} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Radial Health Ring Component
const HealthRing = ({ percentage, loading }) => {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (percentage / 100) * circumference;
    
    const getColor = (p) => {
        if (p >= 80) return { stroke: '#22c55e', text: 'text-green-400', glow: 'shadow-[0_0_30px_rgba(34,197,94,0.3)]' };
        if (p >= 50) return { stroke: '#f59e0b', text: 'text-amber-400', glow: 'shadow-[0_0_30px_rgba(245,158,11,0.3)]' };
        return { stroke: '#ef4444', text: 'text-red-400', glow: 'shadow-[0_0_30px_rgba(239,68,68,0.3)]' };
    };
    
    const colors = getColor(percentage);
    
    return (
        <div className="relative w-44 h-44">
            <svg className="w-full h-full transform -rotate-90">
                <circle cx="88" cy="88" r="45" stroke="rgba(255,255,255,0.03)" strokeWidth="12" fill="none" />
                {!loading && (
                    <motion.circle 
                        cx="88" 
                        cy="88" 
                        r="45" 
                        stroke={colors.stroke}
                        strokeWidth="12" 
                        fill="none"
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        strokeDasharray={circumference}
                    />
                )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {loading ? (
                    <div className="w-12 h-12 bg-white/5 rounded-full animate-pulse" />
                ) : (
                    <>
                        <span className={clsx("text-4xl font-black tracking-tighter", colors.text)}>{percentage}%</span>
                        <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest mt-1">Eficiencia</span>
                    </>
                )}
            </div>
        </div>
    );
};

// Top Musicians with Streaks
const TopStreaksList = ({ musicians, loading }) => {
    if (loading) return (
        <div className="space-y-4">
            {[1,2,3,4].map(i => (
                <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />
            ))}
        </div>
    );
    
    return (
        <div className="space-y-3">
            {musicians.slice(0, 5).map((m, idx) => (
                <motion.div 
                    key={m.id_miembro}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-white/[0.05] rounded-3xl border border-gray-200 dark:border-white/5 transition-all shadow-sm dark:shadow-none"
                >
                    <div className="flex items-center gap-4">
                        <div className={clsx(
                            "w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black shadow-lg",
                            idx === 0 ? "bg-amber-500 text-black rotate-3" :
                            idx === 1 ? "bg-gray-300 text-black -rotate-3" :
                            idx === 2 ? "bg-orange-700 text-white" :
                            "bg-gray-200 dark:bg-white/5 text-gray-500"
                        )}>
                            {idx + 1}
                        </div>
                        <div>
                            <p className="text-sm font-black text-gray-900 dark:text-white uppercase italic transition-colors">{m.nombres} {m.apellidos?.charAt(0)}.</p>
                            <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">{m.instrumento}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-orange-500/10 px-4 py-2 rounded-2xl border border-orange-500/20">
                        <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                        <span className="text-sm font-black text-orange-600 dark:text-orange-400 tabular-nums">{m.streak}</span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default function DashboardHome() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { notify } = useToast();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState(false);
    const [autoMark, setAutoMark] = useState(true);
    const [timeRange, setTimeRange] = useState('ANUAL'); 

    const isImpersonating = !!user?.original_banda_id;
    const userRole = (user?.role || user?.miembro?.rol?.rol || '').toUpperCase();
    const isMusico = userRole === 'MIEMBRO';

    useEffect(() => { loadDashboardStats(); }, [user, isImpersonating]);

    const loadDashboardStats = async () => {
        setLoading(true);
        try {
            const endpoint = (user?.is_super_admin && !isImpersonating) ? '/superadmin/stats' : '/dashboard/stats';
            const res = await api.get(endpoint);
            setData(res.data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const handleMarcarAsistencia = async (id_evento) => {
        if (!navigator.geolocation) return notify('Geolocalización no soportada', 'error');
        setMarking(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    await api.post('/asistencia/marcar', { id_evento, latitud: pos.coords.latitude, longitud: pos.coords.longitude });
                    notify('¡Asistencia registrada!', 'success');
                    loadDashboardStats();
                } catch (error) { notify(error.response?.data?.message || 'Error al marcar', 'error'); } finally { setMarking(false); }
            },
            () => { notify('Ubicación requerida', 'error'); setMarking(false); },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    return (
        <div className="max-w-[1600px] mx-auto pb-24 space-y-8 animate-in fade-in duration-1000 px-4 sm:px-0">
            
            <HeroCard user={user} loading={loading} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {!isMusico && (
                    <StatCard title="Miembros" value={data?.stats?.miembros?.total || 0} icon={Users} color="indigo" loading={loading} label="Staff Activo" />
                )}
                <StatCard title="Asistencia" value={`${data?.stats?.asistencia?.promedio || 0}%`} icon={Activity} color="emerald" loading={loading} label="Promedio Global" />
                <StatCard title="Eventos Hoy" value={data?.stats?.eventos?.hoy || 0} icon={Calendar} color="amber" loading={loading} label={`${data?.stats?.eventos?.proximos || 0} Semanales`} />
                <StatCard title="Finanzas" value={`$${data?.stats?.finanzas?.mes || 0}`} icon={DollarSign} color="rose" loading={loading} label="Balance Bruto" />
                {isMusico && (
                    <StatCard title="Mi Racha" value={data?.top_streaks?.[0]?.streak || 0} icon={Flame} color="sky" loading={loading} label="Días Consecutivos" />
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Heatmap Section */}
                    <div className="bg-white dark:bg-[#161b2c] border border-gray-200 dark:border-white/5 rounded-[3rem] p-10 relative overflow-hidden group shadow-2xl transition-colors duration-500">
                        <div className="absolute -right-20 -bottom-20 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
                            <TrendingUp className="w-96 h-96 text-gray-900 dark:text-white" />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter flex items-center gap-3 transition-colors">
                                        <Activity className="w-6 h-6 text-emerald-500" /> Rendimiento Operativo
                                    </h3>
                                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Monitoreo de actividad de la organización</p>
                                </div>
                                <div className="flex bg-gray-100 dark:bg-black/40 p-1.5 rounded-2xl border border-gray-200 dark:border-white/5 backdrop-blur-md">
                                    {['SEMANAL', 'MENSUAL', 'ANUAL'].map(r => (
                                        <button 
                                            key={r} 
                                            onClick={() => setTimeRange(r)} 
                                            className={clsx(
                                                "px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest", 
                                                timeRange === r 
                                                    ? "bg-white text-gray-900 shadow-md dark:shadow-lg dark:text-black" 
                                                    : "text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white"
                                            )}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {timeRange === 'ANUAL' && (
                                    <motion.div key="an" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
                                        <AttendanceHeatmap heatmapData={data?.heatmap} />
                                    </motion.div>
                                )}
                                {timeRange === 'MENSUAL' && (
                                    <div className="py-20 flex flex-col items-center gap-10">
                                        <HealthRing percentage={data?.stats?.asistencia?.promedio_mes || 0} loading={loading} />
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                                            <div className="text-center">
                                                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-1">Días ON</p>
                                                <p className="text-3xl font-black text-gray-900 dark:text-white tabular-nums">24</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-1">Baja</p>
                                                <p className="text-3xl font-black text-gray-900 dark:text-white tabular-nums">02</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-1">Justificados</p>
                                                <p className="text-3xl font-black text-gray-900 dark:text-white tabular-nums">05</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-1">Tendencia</p>
                                                <p className="text-3xl font-black text-green-500 dark:text-green-400 tabular-nums">▲ 12%</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {timeRange === 'SEMANAL' && (
                                    <div className="grid grid-cols-7 gap-4 py-8">
                                        {['L','M','M','J','V','S', 'D'].map((d, i) => {
                                            const dw = data?.weekly?.[i] || { present: 0, total: 0 };
                                            const h = dw.total > 0 ? (dw.present/dw.total)*100 : 0;
                                            return (
                                                <div key={i} className="flex flex-col items-center gap-4">
                                                    <div className="w-full bg-gray-50 dark:bg-white/[0.02] rounded-3xl h-48 relative border border-gray-200 dark:border-white/5 flex items-end overflow-hidden">
                                                        <motion.div 
                                                            initial={{ height: 0 }}
                                                            animate={{ height: `${h}%` }}
                                                            className={clsx(
                                                                "w-full transition-all duration-1000", 
                                                                h > 80 ? "bg-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)]" : "bg-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                                                            )} 
                                                        />
                                                    </div>
                                                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{d}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Today's Agenda (Modern Version) */}
                    {data?.mis_eventos?.length > 0 && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter flex items-center gap-3 transition-colors">
                                    <Clock className="w-6 h-6 text-indigo-500 dark:text-indigo-400" /> Próximas Horas
                                </h3>
                                <button onClick={() => navigate('/dashboard/eventos')} className="text-[9px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest hover:text-gray-900 dark:hover:text-white transition-colors">
                                    Ver Agenda Completa →
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data.mis_eventos.map(ev => (
                                    <div key={ev.id_evento} className="group bg-white dark:bg-[#161b2c]/80 border border-gray-200 dark:border-white/5 rounded-[2.5rem] p-8 flex flex-col justify-between gap-6 transition-all hover:border-indigo-500/30 shadow-md dark:shadow-none">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                                    <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-none">{ev.tipo?.evento} • {ev.hora.substring(0, 5)}</p>
                                                </div>
                                                <h4 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter transition-colors">{ev.evento}</h4>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5 font-bold"><MapPin className="w-3.5 h-3.5" /> {ev.direccion || 'TBD'}</p>
                                            </div>
                                            <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl group-hover:bg-indigo-500/10 transition-colors">
                                                <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                                            </div>
                                        </div>
                                        <div>
                                            {ev.asistencia ? (
                                                <div className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400 text-[10px] font-black tracking-[0.2em] uppercase transition-colors">
                                                    <CheckCircle2 className="w-4 h-4" /> Asistencia Confirmada
                                                </div>
                                            ) : ev.puede_marcar ? (
                                                <button 
                                                    onClick={() => handleMarcarAsistencia(ev.id_evento)} 
                                                    disabled={marking} 
                                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                                                >
                                                    {marking ? <Zap className="w-4 h-4 animate-spin mx-auto" /> : 'Registrar Mi Entrada'}
                                                </button>
                                            ) : (
                                                <div className="w-full py-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl text-gray-400 dark:text-gray-600 text-[9px] font-black tracking-[0.2em] uppercase text-center italic transition-colors">
                                                    Disponible en el lugar y hora
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Info Area */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Activity Score */}
                    <div className="bg-white dark:bg-[#161b2c] border border-gray-200 dark:border-white/5 rounded-[3rem] p-10 flex flex-col items-center gap-8 shadow-xl dark:shadow-none transition-colors duration-500">
                        <div className="text-center">
                            <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] mb-1">Índice de Actividad</h4>
                            <p className="text-xs font-bold text-gray-900 dark:text-white uppercase opacity-40 italic transition-colors">Rendimiento Mensual</p>
                        </div>
                        <HealthRing percentage={data?.stats?.asistencia?.promedio_mes || 0} loading={loading} />
                        <div className="w-full pt-8 border-t border-gray-100 dark:border-white/5 space-y-4">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                <span className="text-gray-400 dark:text-gray-500 italic">Próximo Hito:</span>
                                <span className="text-gray-900 dark:text-white transition-colors">90% Eficiencia</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${data?.stats?.asistencia?.promedio_mes || 0}%` }}
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Top Streaks Card */}
                    <div className="bg-white dark:bg-[#161b2c] border border-gray-200 dark:border-white/5 rounded-[3rem] p-10 shadow-xl dark:shadow-none overflow-hidden relative group transition-colors duration-500">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none rotate-12 group-hover:rotate-0 transition-transform">
                            <Flame className="w-32 h-32 text-orange-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="mb-10">
                                <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter flex items-center gap-3 transition-colors">
                                    <Flame className="w-6 h-6 text-orange-500" /> Wall of Fame
                                </h4>
                                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Líderes de Constancia</p>
                            </div>
                            <TopStreaksList musicians={data?.top_streaks || []} loading={loading} />
                        </div>
                    </div>

                    {/* Quick Tools */}
                    <div className="p-1.5 bg-indigo-600/10 border border-indigo-500/20 rounded-[2.5rem] flex flex-col gap-1.5">
                        <button onClick={() => navigate('/dashboard/asistencia')} className="w-full p-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] flex items-center justify-between transition-all group active:scale-[0.98] shadow-lg shadow-indigo-600/20">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/10 rounded-2xl group-hover:scale-110 transition-transform"><Activity className="w-5 h-5" /></div>
                                <div className="text-left">
                                    <p className="text-[11px] font-black uppercase tracking-widest">Control</p>
                                    <p className="text-xs font-black uppercase italic tracking-tighter opacity-80">Asistencia Masiva</p>
                                </div>
                            </div>
                            <ArrowUpRight className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
