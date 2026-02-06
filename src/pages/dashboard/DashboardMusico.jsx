import { useState, useEffect } from 'react';
import { Users, Calendar, DollarSign, Activity, Flame, TrendingUp, ArrowUpRight, Clock, MapPin, ChevronRight, Music, FileText, BookOpen, Bell, Settings, Navigation, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Skeleton } from '../../components/ui/skeletons/Skeletons';

export default function DashboardMusico() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const displayName = user?.miembro?.nombres || user?.user || 'Músico';
    const instrumento = user?.miembro?.instrumento?.instrumento || 'Instrumento';
    const bandName = user?.banda?.nombre || 'Monster Band';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

    useEffect(() => { loadStats(); }, [user]);

    const loadStats = async () => {
        try {
            const res = await api.get('/dashboard/stats');
            setData(res.data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    if (loading) {
        return (
            <div className="min-h-full bg-gray-50 dark:bg-surface-base p-4 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
                {/* Header Skeleton */}
                <div className="h-64 rounded-[2rem] bg-[#0a0a0a] border border-white/5 relative overflow-hidden p-8 flex flex-col justify-end space-y-4">
                    <Skeleton className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" />
                    <Skeleton className="h-4 w-40 opacity-50" />
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-16 w-48 rounded-2xl opacity-20" />
                </div>
                {/* Grid Skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-2xl bg-[#0a0a0a] border border-white/5" />
                    ))}
                </div>
                {/* List Skeleton */}
                <div className="bg-[#0a0a0a] rounded-3xl p-6 border border-white/5 space-y-6">
                    <Skeleton className="h-6 w-32" />
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                             <Skeleton className="h-12 w-12 rounded-xl" />
                             <div className="flex-1 space-y-2">
                                 <Skeleton className="h-4 w-1/3" />
                                 <Skeleton className="h-3 w-1/4" />
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const getAsistenciaColor = (pct) => {
        if (pct >= 80) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
        if (pct >= 50) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        return 'text-red-500 bg-red-500/10 border-red-500/20';
    };

    return (
        <div className="min-h-full bg-gray-50 dark:bg-surface-base transition-colors">
            <div className="max-w-5xl mx-auto px-4 py-4 sm:py-8 space-y-4 sm:space-y-8">
                
                {/* Header Personal */}
                <div className="bg-gradient-to-br from-[#bc1b1b] to-[#991b1b] rounded-3xl sm:rounded-[2rem] p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl shadow-[#bc1b1b]/20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
                    
                    <div className="relative z-10">
                        <p className="text-white/60 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] mb-1 sm:mb-2">{bandName} • {instrumento}</p>
                        <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight mb-1 sm:mb-2 drop-shadow-md">
                            {greeting}, {displayName}
                        </h1>
                        <p className="text-white/70 text-xs sm:text-sm font-medium tracking-wide">Tu centro de control personal</p>
                        
                        {/* Indicador de Asistencia */}
                        <div className="mt-4 sm:mt-6 inline-flex items-center gap-3 bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl px-4 sm:px-5 py-2 sm:py-3 border border-white/10 hover:bg-white/15 transition-all cursor-default">
                            <div className={clsx("w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_10px_currentColor]", (data?.mi_asistencia || 0) >= 80 ? "bg-emerald-400 text-emerald-400" : (data?.mi_asistencia || 0) >= 50 ? "bg-amber-400 text-amber-400" : "bg-red-400 text-red-400")} />
                            <span className="text-lg sm:text-xl font-black">{data?.mi_asistencia || 0}%</span>
                            <span className="text-white/50 text-[10px] sm:text-sm font-bold uppercase tracking-wider">Asistencia Global</span>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white dark:bg-surface-card border border-gray-200 dark:border-white/5 rounded-2xl p-4 sm:p-5 transition-all hover:bg-gray-50 dark:hover:bg-white/[0.03]">
                        <div className="flex items-center gap-3 mb-2 sm:mb-3">
                            <div className="p-2 sm:p-2.5 bg-[#bc1b1b]/10 rounded-xl text-[#bc1b1b]">
                                <Calendar className="w-4 h-4 sm:w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{data?.stats?.eventos?.hoy || 0}</p>
                        <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Eventos Hoy</p>
                    </div>
                    
                    <div className="bg-white dark:bg-surface-card border border-gray-200 dark:border-white/5 rounded-2xl p-4 sm:p-5 transition-all hover:bg-gray-50 dark:hover:bg-white/[0.03]">
                        <div className="flex items-center gap-3 mb-2 sm:mb-3">
                            <div className="p-2 sm:p-2.5 bg-amber-500/10 rounded-xl text-amber-500">
                                <Clock className="w-4 h-4 sm:w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{data?.stats?.eventos?.proximos || 0}</p>
                        <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Esta Semana</p>
                    </div>
                    
                    <div className="bg-white dark:bg-surface-card border border-gray-200 dark:border-white/5 rounded-2xl p-4 sm:p-5 transition-all hover:bg-gray-50 dark:hover:bg-white/[0.03]">
                        <div className="flex items-center gap-3 mb-2 sm:mb-3">
                            <div className="p-2 sm:p-2.5 bg-orange-500/10 rounded-xl text-orange-500">
                                <Flame className="w-4 h-4 sm:w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{data?.mi_racha || 0}</p>
                        <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Racha Actual</p>
                    </div>
                    
                    <div className={clsx("border rounded-2xl p-4 sm:p-5 transition-all hover:-translate-y-1 shadow-sm", getAsistenciaColor(data?.mi_asistencia || 0))}>
                        <div className="flex items-center gap-3 mb-2 sm:mb-3">
                            <div className="p-2 sm:p-2.5 bg-current/10 rounded-xl">
                                <Activity className="w-4 h-4 sm:w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-black">{data?.mi_asistencia || 0}%</p>
                        <p className="text-[9px] sm:text-[10px] font-bold opacity-70 uppercase tracking-wider mt-1">Mi Asistencia</p>
                    </div>
                </div>

                {/* Tactical Briefing - Misión de Hoy */}
                {data?.mis_eventos?.some(ev => ev.es_hoy) && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative group overflow-hidden rounded-[2rem] bg-[#bc1b1b]/5 border border-[#bc1b1b]/20 p-6 sm:p-8 shadow-2xl shadow-[#bc1b1b]/5"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Navigation className="w-32 h-32 -mr-8 -mt-8 rotate-12" />
                        </div>
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                            <div className="flex items-start gap-4 sm:gap-6">
                                <div className="p-4 bg-[#bc1b1b] text-white rounded-3xl shadow-lg shadow-[#bc1b1b]/30 animate-pulse">
                                    <Clock className="w-8 h-8" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 bg-[#bc1b1b] text-white text-[10px] font-black rounded-full uppercase tracking-widest">Misión de Hoy</span>
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Confirmado
                                        </span>
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-tight mb-2 truncate">
                                        {data.mis_eventos.find(ev => ev.es_hoy).evento}
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <MapPin className="w-4 h-4 text-[#bc1b1b]" />
                                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide truncate max-w-[150px] sm:max-w-[300px]">
                                                {data.mis_eventos.find(ev => ev.es_hoy).direccion || 'Ubicación táctica por confirmar'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Clock className="w-4 h-4 text-[#bc1b1b]" />
                                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide">
                                                {data.mis_eventos.find(ev => ev.es_hoy).hora?.substring(0, 5)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <a 
                                href={data.mis_eventos.find(ev => ev.es_hoy).latitud && data.mis_eventos.find(ev => ev.es_hoy).longitud 
                                    ? `https://www.google.com/maps/search/?api=1&query=${data.mis_eventos.find(ev => ev.es_hoy).latitud},${data.mis_eventos.find(ev => ev.es_hoy).longitud}`
                                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.mis_eventos.find(ev => ev.es_hoy).direccion || data.mis_eventos.find(ev => ev.es_hoy).evento)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 bg-white dark:bg-[#121212] hover:bg-[#bc1b1b] hover:text-white text-gray-900 dark:text-white font-black uppercase tracking-widest text-[10px] py-4 px-8 rounded-2xl shadow-xl transition-all border border-white/5 active:scale-95 whitespace-nowrap"
                            >
                                <Navigation className="w-4 h-4" /> Desplegar Ruta
                            </a>
                        </div>
                    </motion.div>
                )}

                <div>
                    <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[#bc1b1b]" /> Acceso Rápido
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <button 
                            onClick={() => navigate('/dashboard/eventos')}
                            className="group flex items-center gap-3 sm:gap-5 p-4 sm:p-6 bg-white dark:bg-surface-card border border-gray-200 dark:border-white/5 rounded-2xl hover:border-[#bc1b1b]/50 hover:shadow-lg transition-all"
                        >
                            <div className="p-3 sm:p-4 bg-[#bc1b1b]/10 rounded-2xl text-[#bc1b1b] group-hover:scale-110 transition-transform flex-shrink-0">
                                <Calendar className="w-6 h-6 sm:w-7 sm:h-7" />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <p className="text-base sm:text-lg font-black text-gray-900 dark:text-white uppercase truncate">Mi Agenda</p>
                                <p className="text-[10px] sm:text-sm text-gray-500 truncate">Ver todos mis eventos</p>
                            </div>
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 group-hover:text-[#bc1b1b] transition-colors flex-shrink-0" />
                        </button>

                        <button 
                            onClick={() => navigate('/dashboard/eventos?filter=confirmed')}
                            className="group flex items-center gap-3 sm:gap-5 p-4 sm:p-6 bg-white dark:bg-surface-card border border-gray-200 dark:border-white/5 rounded-2xl hover:border-[#bc1b1b]/50 hover:shadow-lg transition-all"
                        >
                            <div className="p-3 sm:p-4 bg-[#bc1b1b]/10 rounded-2xl text-[#bc1b1b] group-hover:scale-110 transition-transform flex-shrink-0">
                                <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <p className="text-base sm:text-lg font-black text-gray-900 dark:text-white uppercase truncate">Mis Misiones</p>
                                <p className="text-[10px] sm:text-sm text-gray-500 truncate">Eventos confirmados</p>
                            </div>
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 group-hover:text-[#bc1b1b] transition-colors flex-shrink-0" />
                        </button>
                        
                        <button 
                            onClick={() => navigate('/dashboard/repertorio')}
                            className="group flex items-center gap-3 sm:gap-5 p-4 sm:p-6 bg-white dark:bg-surface-card border border-gray-200 dark:border-white/5 rounded-2xl hover:border-[#bc1b1b]/50 hover:shadow-lg transition-all"
                        >
                            <div className="p-3 sm:p-4 bg-[#bc1b1b]/10 rounded-2xl text-[#bc1b1b] group-hover:scale-110 transition-transform flex-shrink-0">
                                <Music className="w-6 h-6 sm:w-7 sm:h-7" />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <p className="text-base sm:text-lg font-black text-gray-900 dark:text-white uppercase truncate">Repertorio</p>
                                <p className="text-[10px] sm:text-sm text-gray-500 truncate">Temas activos de la banda</p>
                            </div>
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 group-hover:text-[#bc1b1b] transition-colors flex-shrink-0" />
                        </button>
                        
                        <button 
                            onClick={() => navigate('/dashboard/partituras')}
                            className="group flex items-center gap-3 sm:gap-5 p-4 sm:p-6 bg-white dark:bg-surface-card border border-gray-200 dark:border-white/5 rounded-2xl hover:border-[#ffbe0b]/50 hover:shadow-lg transition-all"
                        >
                            <div className="p-3 sm:p-4 bg-[#ffbe0b]/10 rounded-2xl text-[#ffbe0b] group-hover:scale-110 transition-transform flex-shrink-0">
                                <BookOpen className="w-6 h-6 sm:w-7 sm:h-7" />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <p className="text-base sm:text-lg font-black text-gray-900 dark:text-white uppercase truncate">Partituras</p>
                                <p className="text-[10px] sm:text-sm text-gray-500 truncate">Mis partituras asignadas</p>
                            </div>
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 group-hover:text-[#ffbe0b] transition-colors flex-shrink-0" />
                        </button>
                        
                        <button 
                            onClick={() => navigate('/dashboard/pagos')}
                            className="group flex items-center gap-3 sm:gap-5 p-4 sm:p-6 bg-white dark:bg-surface-card border border-gray-200 dark:border-white/5 rounded-2xl hover:border-[#ffbe0b]/50 hover:shadow-lg transition-all"
                        >
                            <div className="p-3 sm:p-4 bg-[#ffbe0b]/10 rounded-2xl text-[#ffbe0b] group-hover:scale-110 transition-transform flex-shrink-0">
                                <DollarSign className="w-6 h-6 sm:w-7 sm:h-7" />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <p className="text-base sm:text-lg font-black text-gray-900 dark:text-white uppercase truncate">Mis Pagos</p>
                                <p className="text-[10px] sm:text-sm text-gray-500 truncate">Estado de mis cuotas</p>
                            </div>
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 group-hover:text-[#ffbe0b] transition-colors flex-shrink-0" />
                        </button>
                    </div>
                </div>

                {/* Próximos Eventos */}
                {data?.mis_eventos?.length > 0 && (
                    <div>
                        <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-[#ffbe0b]" /> Próximos Eventos
                        </h2>
                        <div className="space-y-3">
                            {data.mis_eventos.slice(0, 3).map(ev => (
                                <div key={ev.id_evento} className="flex items-center gap-4 p-4 bg-white dark:bg-surface-card border border-gray-200 dark:border-white/5 rounded-2xl">
                                    <div className="p-3 bg-[#bc1b1b]/10 rounded-xl text-[#bc1b1b]">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className="text-sm font-black text-gray-900 dark:text-white uppercase">{ev.evento}</p>
                                            <span className="px-1.5 py-0.5 bg-[#bc1b1b]/10 text-[#bc1b1b] text-[8px] font-black rounded-md uppercase">Confirmado</span>
                                        </div>
                                        <a 
                                            href={ev.latitud && ev.longitud 
                                                ? `https://www.google.com/maps/search/?api=1&query=${ev.latitud},${ev.longitud}`
                                                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.direccion || ev.evento)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-gray-500 flex items-center gap-1 hover:text-[#bc1b1b] transition-colors cursor-pointer"
                                        >
                                            <MapPin className="w-3 h-3" /> {ev.direccion || 'Por confirmar'}
                                            <Navigation className="w-2.5 h-2.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-[#bc1b1b]">{ev.hora?.substring(0, 5)}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">{ev.tipo?.evento}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
