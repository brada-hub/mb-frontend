import { useState, useEffect } from 'react';
import { Users, Calendar, DollarSign, Activity, Flame, TrendingUp, ArrowUpRight, Clock, MapPin, Layers, Send, Eye, CheckCircle2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

// --- Componentes ---
const StatCard = ({ title, value, label, icon: Icon, color, loading, onClick }) => {
    const colors = {
        primary: 'text-[#bc1b1b] dark:text-[#bc1b1b] bg-[#bc1b1b]/10 border-[#bc1b1b]/20',
        secondary: 'text-[#ffbe0b] dark:text-[#ffbe0b] bg-[#ffbe0b]/10 border-[#ffbe0b]/20',
        amber: 'text-amber-600 dark:text-amber-400 bg-[#ffbe0b]/10 border-amber-500/20',
        rose: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
    };

    return (
        <motion.div 
            whileHover={{ y: -4 }} 
            onClick={onClick}
            className={clsx(
                "bg-white dark:bg-surface-card border border-gray-200 dark:border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 transition-all hover:shadow-xl dark:hover:shadow-none",
                onClick && "cursor-pointer active:scale-95 transition-transform"
            )}
        >
            <div className={clsx("p-2 sm:p-3 rounded-lg sm:rounded-xl border w-fit mb-2 sm:mb-4", colors[color])}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">{title}</p>
            {loading ? (
                <div className="h-7 sm:h-9 w-16 sm:w-24 bg-gray-100 dark:bg-white/5 animate-pulse rounded-lg mt-1" />
            ) : (
                <h3 className="text-xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight mt-0.5 sm:mt-1">{value}</h3>
            )}
            <p className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-1 sm:mt-2">{label}</p>
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
                            idx === 0 ? "bg-[#ffbe0b] text-black rotate-2" : idx === 1 ? "bg-gray-300 text-black -rotate-2" : idx === 2 ? "bg-orange-700 text-white" : "bg-white/10 text-gray-400"
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
    const { notify } = useToast();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
    const [broadcastForm, setBroadcastForm] = useState({ titulo: '', mensaje: '' });
    const [sending, setSending] = useState(false);
    const [showTracking, setShowTracking] = useState(false);
    const [trackingData, setTrackingData] = useState([]);
    const [trackingLoading, setTrackingLoading] = useState(false);
    const [recentBroadcasts, setRecentBroadcasts] = useState([]);

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
            
            // Si es director, cargar comunicaciones recientes
            if (!user?.is_super_admin || isImpersonating) {
                const notifsRes = await api.get('/notificaciones');
                setRecentBroadcasts(notifsRes.data.filter(n => n.tipo === 'broadcast').slice(0, 5));
            }
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const handleSendBroadcast = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            await api.post('/notificaciones/broadcast', broadcastForm);
            setIsBroadcastModalOpen(false);
            setBroadcastForm({ titulo: '', mensaje: '' });
            notify('Comunicado enviado a toda la banda', 'success');
            loadStats();
        } catch (error) {
            console.error(error);
            notify('Error al enviar comunicado', 'error');
        } finally {
            setSending(false);
        }
    };

    const handleViewTracking = async (id_referencia, tipo) => {
        setTrackingLoading(true);
        setShowTracking(true);
        try {
            const res = await api.get(`/notificaciones/seguimiento/${id_referencia}/${tipo}`);
            setTrackingData(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setTrackingLoading(false);
        }
    };

    return (
        <div className="min-h-full bg-gray-50 dark:bg-surface-base transition-colors">
            <div className="max-w-[1600px] mx-auto px-4 py-4 sm:py-8 space-y-4 sm:space-y-8">
                
                {/* Hero Premium */}
                <div className="bg-gradient-to-br from-[#bc1b1b] via-[#7f1d1d] to-[#ffbe0b] rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 text-white relative overflow-hidden shadow-2xl shadow-[#bc1b1b]/20">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
                    
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 sm:gap-8">
                        <div>
                            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                                <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md border border-white/10">{bandName}</span>
                                {user?.is_super_admin && (
                                    <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-[#ffbe0b]/30 text-amber-200 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest border border-amber-400/30 backdrop-blur-md">
                                        SuperAdmin
                                    </span>
                                )}
                            </div>
                            <h1 className="text-2xl sm:text-5xl font-black uppercase tracking-tighter drop-shadow-lg leading-none">
                                {greeting}, <br className="sm:hidden" /> <span className="text-white/80">{displayName}</span>
                            </h1>
                            <p className="mt-2 sm:mt-3 text-white/60 text-[9px] sm:text-sm uppercase tracking-widest font-bold">
                                Panel de Control • Director de Banda
                            </p>
                        </div>
                        
                        <div className="flex gap-2 sm:gap-3">
                            <button onClick={() => navigate('/dashboard/eventos')} className="group p-3 sm:p-5 bg-white/10 hover:bg-[#ffbe0b]/20 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-white/10 transition-all hover:-translate-y-1 active:scale-95 flex-1 sm:flex-initial">
                                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2 group-hover:scale-110 transition-transform mx-auto text-[#ffbe0b]" />
                                <p className="text-[10px] sm:text-xs font-bold text-center">Agenda</p>
                            </button>
                            <button onClick={() => navigate('/dashboard/miembros')} className="group p-3 sm:p-5 bg-white/10 hover:bg-[#bc1b1b]/20 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-white/10 transition-all hover:-translate-y-1 active:scale-95 flex-1 sm:flex-initial">
                                <Users className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2 group-hover:scale-110 transition-transform mx-auto text-white" />
                                <p className="text-[10px] sm:text-xs font-bold text-center">Personal</p>
                            </button>
                            <button onClick={() => navigate('/dashboard/asistencia')} className="group p-3 sm:p-5 bg-white/10 hover:bg-[#bc1b1b]/20 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-white/10 transition-all hover:-translate-y-1 active:scale-95 flex-1 sm:flex-initial">
                                <Activity className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2 group-hover:scale-110 transition-transform mx-auto text-white" />
                                <p className="text-[10px] sm:text-xs font-bold text-center">Control</p>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Miembros" value={data?.stats?.miembros?.total || 0} icon={Users} color="secondary" loading={loading} label="Staff Activo" onClick={() => navigate('/dashboard/miembros')} />
                    <StatCard title="Asistencia" value={`${data?.stats?.asistencia?.promedio || 0}%`} icon={Activity} color="primary" loading={loading} label="Promedio Global" onClick={() => navigate('/dashboard/asistencia')} />
                    <StatCard title="Eventos Hoy" value={data?.stats?.eventos?.hoy || 0} icon={Calendar} color="secondary" loading={loading} label={`${data?.stats?.eventos?.proximos || 0} Esta Semana`} onClick={() => navigate('/dashboard/eventos')} />
                    <StatCard title="Listas Pendientes" value={data?.stats?.eventos?.pendientes_formacion || 0} icon={Layers} color="amber" loading={loading} label="Por armar o completar" onClick={() => navigate('/dashboard/formaciones')} />
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Sección Principal - Más intuitiva */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* Próximos Eventos de la Semana */}
                        <div className="bg-white dark:bg-surface-card border border-gray-200 dark:border-white/5 rounded-3xl p-6 transition-colors">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-[#bc1b1b]" /> Esta Semana
                                </h2>
                                <button onClick={() => navigate('/dashboard/eventos')} className="text-xs font-bold text-[#bc1b1b] uppercase tracking-wider hover:text-[#bc1b1b]">
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
                                            <div className="p-3 bg-[#bc1b1b]/10 rounded-xl text-[#bc1b1b]">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{ev.evento}</p>
                                                <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                                                    <MapPin className="w-3 h-3" /> {ev.direccion || 'Por confirmar'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-black text-[#bc1b1b]">{ev.hora?.substring(0, 5)}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">{ev.tipo?.evento}</p>
                                            </div>
                                            <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-[#bc1b1b] transition-colors" />
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-gray-400">
                                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm font-bold">Sin eventos esta semana</p>
                                    <button onClick={() => navigate('/dashboard/eventos')} className="mt-3 px-4 py-2 bg-[#bc1b1b]/10 text-[#bc1b1b] rounded-lg text-xs font-bold hover:bg-[#bc1b1b]/20 transition-colors">
                                        + Crear Evento
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Resumen Rápido */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Asistencia del Mes - Simple */}
                            <div className="bg-white dark:bg-surface-card border border-gray-200 dark:border-white/5 rounded-2xl p-5 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Asistencia del Mes</p>
                                    <Activity className="w-4 h-4 text-[#bc1b1b]" />
                                </div>
                                <div className="flex items-end gap-3">
                                    <span className={clsx("text-4xl font-black", (data?.stats?.asistencia?.promedio_mes || 0) >= 80 ? "text-[#bc1b1b]" : (data?.stats?.asistencia?.promedio_mes || 0) >= 50 ? "text-[#ffbe0b]" : "text-red-500")}>
                                        {data?.stats?.asistencia?.promedio_mes || 0}%
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase mb-1">promedio</span>
                                </div>
                                <div className="mt-4 h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }} 
                                        animate={{ width: `${data?.stats?.asistencia?.promedio_mes || 0}%` }}
                                        className={clsx("h-full", (data?.stats?.asistencia?.promedio_mes || 0) >= 80 ? "bg-[#bc1b1b]" : (data?.stats?.asistencia?.promedio_mes || 0) >= 50 ? "bg-[#ffbe0b]" : "bg-red-500")} 
                                    />
                                </div>
                            </div>
                            
                            {/* Eventos Completados */}
                            <div className="bg-white dark:bg-surface-card border border-gray-200 dark:border-white/5 rounded-2xl p-5 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Actividad Reciente</p>
                                    <TrendingUp className="w-4 h-4 text-[#bc1b1b]" />
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
                        <div className="bg-white dark:bg-surface-card border border-gray-200 dark:border-white/5 rounded-3xl p-6 transition-colors">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4">
                                Acciones Rápidas
                            </h3>
                            <div className="space-y-3">
                                <button onClick={() => navigate('/dashboard/miembros')} className="w-full flex items-center gap-4 p-4 bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 hover:bg-[#bc1b1b]/5 dark:hover:bg-[#bc1b1b]/10 hover:border-[#bc1b1b]/20 dark:hover:border-[#bc1b1b]/20 rounded-xl transition-all group shadow-sm hover:shadow-md">
                                    <Users className="w-5 h-5 text-[#bc1b1b]" />
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-[#bc1b1b] dark:group-hover:text-[#bc1b1b]">Gestionar Miembros</span>
                                </button>
                                <button onClick={() => navigate('/dashboard/eventos')} className="w-full flex items-center gap-4 p-4 bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 hover:bg-[#ffbe0b]/5 dark:hover:bg-[#ffbe0b]/10 hover:border-[#ffbe0b]/20 dark:hover:border-[#ffbe0b]/20 rounded-xl transition-all group shadow-sm hover:shadow-md">
                                    <Calendar className="w-5 h-5 text-[#ffbe0b]" />
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-[#ffbe0b] dark:group-hover:text-[#ffbe0b]">Crear Evento</span>
                                </button>
                                <button onClick={() => navigate('/dashboard/reportes')} className="w-full flex items-center gap-4 p-4 bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 hover:bg-[#bc1b1b]/5 dark:hover:bg-[#bc1b1b]/10 hover:border-[#bc1b1b]/20 dark:hover:border-[#bc1b1b]/20 rounded-xl transition-all group shadow-sm hover:shadow-md">
                                    <TrendingUp className="w-5 h-5 text-[#bc1b1b]" />
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-[#bc1b1b] dark:group-hover:text-[#bc1b1b]">Ver Reportes</span>
                                </button>
                                <button onClick={() => setIsBroadcastModalOpen(true)} className="w-full flex items-center gap-4 p-4 bg-white dark:bg-white/[0.02] border border-dashed border-[#ffbe0b]/40 dark:border-[#ffbe0b]/20 hover:bg-[#ffbe0b]/5 dark:hover:bg-[#ffbe0b]/10 rounded-xl transition-all group shadow-sm hover:shadow-md">
                                    <Send className="w-5 h-5 text-[#ffbe0b]" />
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-[#ffbe0b] dark:group-hover:text-[#ffbe0b]">Enviar Comunicado</span>
                                </button>
                            </div>
                        </div>

                        {/* Top Streaks */}
                        <div className="bg-white dark:bg-surface-card border border-gray-200 dark:border-white/5 rounded-3xl p-6 transition-colors">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2 mb-4">
                                <Flame className="w-5 h-5 text-orange-500" /> Wall of Fame
                            </h3>
                            <TopStreaksList musicians={data?.top_streaks || []} loading={loading} />
                        </div>

                        {/* Control de Asistencia */}
                        <button onClick={() => navigate('/dashboard/asistencia')} className="w-full p-5 bg-[#bc1b1b] hover:bg-[#991b1b] text-white rounded-2xl flex items-center justify-between transition-all shadow-lg shadow-[#bc1b1b]/20 active:scale-[0.98]">
                            <div className="flex items-center gap-3">
                                <Activity className="w-5 h-5" />
                                <span className="text-sm font-bold uppercase tracking-wide">Control de Asistencia</span>
                            </div>
                            <ArrowUpRight className="w-5 h-5" />
                        </button>

                        {/* Recent Broadcasts tracking */}
                        <div className="bg-white dark:bg-surface-card border border-gray-200 dark:border-white/5 rounded-3xl p-6 transition-colors">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4 flex items-center justify-between">
                                Comunicados Recientes
                                <Send className="w-4 h-4 text-[#bc1b1b]" />
                            </h3>
                            <div className="space-y-3">
                                {recentBroadcasts.length > 0 ? (
                                    recentBroadcasts.map((b, idx) => (
                                        <div key={idx} className="p-3 bg-gray-50 dark:bg-white/[0.02] rounded-xl border border-gray-100 dark:border-white/5 flex items-center justify-between group">
                                            <div className="flex-1 min-w-0 pr-4">
                                                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{b.titulo}</p>
                                                <p className="text-[10px] text-gray-500 mt-0.5">{new Date(b.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <button 
                                                onClick={() => handleViewTracking(b.id_referencia, 'broadcast')}
                                                className="p-2 bg-[#bc1b1b]/10 text-[#bc1b1b] rounded-lg hover:bg-[#bc1b1b]/20 transition-all"
                                                title="Ver quién leyó"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-[10px] text-gray-500 text-center py-4">No hay envíos recientes</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Eventos de Hoy */}
                {data?.mis_eventos?.length > 0 && (
                    <div className="bg-white dark:bg-surface-card border border-gray-200 dark:border-white/5 rounded-3xl p-8 transition-colors">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                <Clock className="w-5 h-5 text-[#ffbe0b]" /> Eventos de Hoy
                            </h2>
                            <button onClick={() => navigate('/dashboard/eventos')} className="text-xs font-bold text-[#bc1b1b] uppercase tracking-wider hover:text-[#bc1b1b]">
                                Ver todos →
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {data.mis_eventos.slice(0, 4).map(ev => (
                                <div key={ev.id_evento} className="p-5 bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl">
                                    <p className="text-[10px] font-black text-[#bc1b1b] uppercase tracking-widest">{ev.tipo?.evento} • {ev.hora?.substring(0, 5)}</p>
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

            {/* Modal de Broadcast */}
            {isBroadcastModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-surface-card w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                        <div className="p-6 border-b border-white/5 bg-[#bc1b1b] text-white">
                            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                                <Send className="w-6 h-6" /> Enviar Comunicado
                            </h3>
                            <p className="text-xs font-bold text-white/60 uppercase tracking-widest mt-1">Llegará a toda la organización</p>
                        </div>
                        <form onSubmit={handleSendBroadcast} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Asunto / Título</label>
                                <input 
                                    required
                                    type="text" 
                                    value={broadcastForm.titulo}
                                    onChange={e => setBroadcastForm({...broadcastForm, titulo: e.target.value})}
                                    className="w-full bg-gray-100 dark:bg-white/5 px-4 py-3 rounded-xl border border-transparent focus:border-[#bc1b1b] outline-none font-bold"
                                    placeholder="Ej: Ensayo General Cancelado"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Mensaje</label>
                                <textarea 
                                    required
                                    value={broadcastForm.mensaje}
                                    onChange={e => setBroadcastForm({...broadcastForm, mensaje: e.target.value})}
                                    rows={4}
                                    className="w-full bg-gray-100 dark:bg-white/5 px-4 py-3 rounded-xl border border-transparent focus:border-[#bc1b1b] outline-none font-bold"
                                    placeholder="Escribe el mensaje para los músicos..."
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsBroadcastModalOpen(false)} className="flex-1 py-3 bg-gray-100 dark:bg-white/5 text-gray-500 rounded-xl font-black uppercase tracking-widest text-xs">Cancelar</button>
                                <button type="submit" disabled={sending} className="flex-[2] py-3 bg-[#bc1b1b] text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-[#bc1b1b]/20 disabled:opacity-50">
                                    {sending ? 'Enviando...' : 'Enviar Ahora'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Modal de Seguimiento */}
            {showTracking && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-surface-card w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[80vh]">
                        <div className="p-6 border-b border-white/5 bg-gray-50 dark:bg-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 text-gray-900 dark:text-white">
                                    <Eye className="w-6 h-6 text-[#bc1b1b]" /> Seguimiento de Lectura
                                </h3>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Conoce quién ha visto el mensaje</p>
                            </div>
                            <button onClick={() => setShowTracking(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-2">
                            {trackingLoading ? (
                                [1,2,3,4].map(i => <div key={i} className="h-12 bg-gray-100 dark:bg-white/5 animate-pulse rounded-xl" />)
                            ) : trackingData.length > 0 ? (
                                trackingData.map((t, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/[0.02] rounded-xl border border-gray-100 dark:border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center font-black text-xs", t.leido ? "bg-[#bc1b1b]/20 text-[#bc1b1b]" : "bg-gray-500/20 text-gray-500")}>
                                                {t.nombre.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{t.nombre}</p>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">@{t.usuario}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {t.leido ? (
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] font-black text-[#bc1b1b] uppercase flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" /> Visto
                                                    </span>
                                                    <span className="text-[9px] text-gray-400 font-bold">{t.fecha_lectura}</span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-black text-gray-400 uppercase">Pendiente</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-10 font-bold uppercase tracking-widest text-xs">No hay datos disponibles</p>
                            )}
                        </div>
                        
                        <div className="p-6 bg-gray-50 dark:bg-black/20 border-t border-white/5">
                            <button onClick={() => setShowTracking(false)} className="w-full py-3 bg-[#bc1b1b] text-white rounded-xl font-black uppercase tracking-widest text-xs">Cerrar</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
