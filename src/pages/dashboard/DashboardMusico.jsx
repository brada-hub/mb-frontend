import { useState, useEffect } from 'react';
import { Users, Calendar, DollarSign, Activity, Flame, TrendingUp, ArrowUpRight, Clock, MapPin, ChevronRight, Music, FileText, BookOpen, Bell, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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

    const getAsistenciaColor = (pct) => {
        if (pct >= 80) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
        if (pct >= 50) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        return 'text-red-500 bg-red-500/10 border-red-500/20';
    };

    return (
        <div className="min-h-full bg-gray-50 dark:bg-[#0a0d14] transition-colors">
            <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
                
                {/* Header Personal */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                    
                    <div className="relative z-10">
                        <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mb-2">{bandName} • {instrumento}</p>
                        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mb-2">
                            {greeting}, {displayName}
                        </h1>
                        <p className="text-white/70 text-sm">Tu centro de control personal</p>
                        
                        {/* Indicador de Asistencia */}
                        <div className="mt-6 inline-flex items-center gap-3 bg-white/10 backdrop-blur-lg rounded-2xl px-5 py-3 border border-white/10">
                            <div className={clsx("w-3 h-3 rounded-full animate-pulse", (data?.mi_asistencia || 0) >= 80 ? "bg-emerald-400" : (data?.mi_asistencia || 0) >= 50 ? "bg-amber-400" : "bg-red-400")} />
                            <span className="text-xl font-black">{data?.mi_asistencia || 0}%</span>
                            <span className="text-white/50 text-sm font-bold">Asistencia</span>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-[#161b2c] border border-gray-200 dark:border-white/5 rounded-2xl p-5 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-500">
                                <Calendar className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{data?.stats?.eventos?.hoy || 0}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Eventos Hoy</p>
                    </div>
                    
                    <div className="bg-white dark:bg-[#161b2c] border border-gray-200 dark:border-white/5 rounded-2xl p-5 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500">
                                <Clock className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{data?.stats?.eventos?.proximos || 0}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Esta Semana</p>
                    </div>
                    
                    <div className="bg-white dark:bg-[#161b2c] border border-gray-200 dark:border-white/5 rounded-2xl p-5 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-500">
                                <Flame className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{data?.mi_racha || 0}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Racha Actual</p>
                    </div>
                    
                    <div className={clsx("border rounded-2xl p-5 transition-colors", getAsistenciaColor(data?.mi_asistencia || 0))}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 bg-current/10 rounded-xl">
                                <Activity className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-2xl font-black">{data?.mi_asistencia || 0}%</p>
                        <p className="text-[10px] font-bold opacity-70 uppercase tracking-wider mt-1">Mi Asistencia</p>
                    </div>
                </div>

                {/* Accesos Rápidos - Grid Grande */}
                <div>
                    <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-500" /> Acceso Rápido
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => navigate('/dashboard/eventos')}
                            className="group flex items-center gap-5 p-6 bg-white dark:bg-[#161b2c] border border-gray-200 dark:border-white/5 rounded-2xl hover:border-indigo-500/50 hover:shadow-lg transition-all"
                        >
                            <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-500 group-hover:scale-110 transition-transform">
                                <Calendar className="w-7 h-7" />
                            </div>
                            <div className="text-left flex-1">
                                <p className="text-lg font-black text-gray-900 dark:text-white uppercase">Mi Agenda</p>
                                <p className="text-sm text-gray-500">Ver todos mis eventos</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                        </button>
                        
                        <button 
                            onClick={() => navigate('/dashboard/repertorio')}
                            className="group flex items-center gap-5 p-6 bg-white dark:bg-[#161b2c] border border-gray-200 dark:border-white/5 rounded-2xl hover:border-emerald-500/50 hover:shadow-lg transition-all"
                        >
                            <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500 group-hover:scale-110 transition-transform">
                                <Music className="w-7 h-7" />
                            </div>
                            <div className="text-left flex-1">
                                <p className="text-lg font-black text-gray-900 dark:text-white uppercase">Repertorio</p>
                                <p className="text-sm text-gray-500">Temas activos de la banda</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                        </button>
                        
                        <button 
                            onClick={() => navigate('/dashboard/partituras')}
                            className="group flex items-center gap-5 p-6 bg-white dark:bg-[#161b2c] border border-gray-200 dark:border-white/5 rounded-2xl hover:border-purple-500/50 hover:shadow-lg transition-all"
                        >
                            <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-500 group-hover:scale-110 transition-transform">
                                <BookOpen className="w-7 h-7" />
                            </div>
                            <div className="text-left flex-1">
                                <p className="text-lg font-black text-gray-900 dark:text-white uppercase">Partituras</p>
                                <p className="text-sm text-gray-500">Mis partituras asignadas</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-purple-500 transition-colors" />
                        </button>
                        
                        <button 
                            onClick={() => navigate('/dashboard/pagos')}
                            className="group flex items-center gap-5 p-6 bg-white dark:bg-[#161b2c] border border-gray-200 dark:border-white/5 rounded-2xl hover:border-amber-500/50 hover:shadow-lg transition-all"
                        >
                            <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500 group-hover:scale-110 transition-transform">
                                <DollarSign className="w-7 h-7" />
                            </div>
                            <div className="text-left flex-1">
                                <p className="text-lg font-black text-gray-900 dark:text-white uppercase">Mis Pagos</p>
                                <p className="text-sm text-gray-500">Estado de mis cuotas</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-amber-500 transition-colors" />
                        </button>
                    </div>
                </div>

                {/* Próximos Eventos */}
                {data?.mis_eventos?.length > 0 && (
                    <div>
                        <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-amber-500" /> Próximos Eventos
                        </h2>
                        <div className="space-y-3">
                            {data.mis_eventos.slice(0, 3).map(ev => (
                                <div key={ev.id_evento} className="flex items-center gap-4 p-4 bg-white dark:bg-[#161b2c] border border-gray-200 dark:border-white/5 rounded-2xl">
                                    <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-black text-gray-900 dark:text-white uppercase">{ev.evento}</p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" /> {ev.direccion || 'Por confirmar'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-indigo-500">{ev.hora?.substring(0, 5)}</p>
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
