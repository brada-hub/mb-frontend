import { useState, useEffect } from 'react';
import { Users, Calendar, DollarSign, Activity, Flame, TrendingUp, Clock, MapPin, ChevronRight, Music, BookOpen, UserCheck, AlertCircle, CheckCircle2, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function DashboardJefeSeccion() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [miembrosSeccion, setMiembrosSeccion] = useState([]);

    const displayName = user?.miembro?.nombres || user?.user || 'Jefe';
    const instrumento = user?.miembro?.instrumento?.instrumento || 'Sección';
    const bandName = user?.banda?.nombre || 'Monster Band';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

    useEffect(() => { loadData(); }, [user]);

    const loadData = async () => {
        try {
            const [statsRes, miembrosRes] = await Promise.all([
                api.get('/dashboard/stats'),
                api.get('/miembros')
            ]);
            setData(statsRes.data);
            setMiembrosSeccion(miembrosRes.data || []);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    return (
        <div className="min-h-full bg-gray-50 dark:bg-[#0a0d14] transition-colors">
            <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8 space-y-4 sm:space-y-8">
                
                {/* Header con Badge de Jefe */}
                <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl sm:rounded-[2rem] p-6 sm:p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
                        <div>
                            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest">{bandName}</span>
                                <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-amber-500/30 text-amber-200 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest border border-amber-400/30">
                                    Jefe de Sección
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight mb-1 sm:mb-2 leading-none">
                                {greeting}, <br className="sm:hidden" /> {displayName}
                            </h1>
                            <p className="text-white/70 text-xs flex items-center gap-2">
                                <Music className="w-4 h-4" /> Coordinador de {instrumento}
                            </p>
                        </div>
                        
                        {/* Mi Asistencia Personal */}
                        <div className="flex gap-3 sm:gap-4">
                            <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/10 text-center flex-1 sm:min-w-[120px]">
                                <p className="text-2xl sm:text-3xl font-black">{data?.mi_asistencia || 0}%</p>
                                <p className="text-[9px] sm:text-[10px] text-white/60 font-bold uppercase mt-1">Mi Asistencia</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/10 text-center flex-1 sm:min-w-[120px]">
                                <p className="text-2xl sm:text-3xl font-black">{miembrosSeccion.length}</p>
                                <p className="text-[9px] sm:text-[10px] text-white/60 font-bold uppercase mt-1">Mi Sección</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid Principal */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Columna Izquierda - Mi Sección */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Miembros de Mi Sección */}
                        <div className="bg-white dark:bg-[#161b2c] border border-gray-200 dark:border-white/5 rounded-2xl p-6 transition-colors">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                    <Users className="w-5 h-5 text-purple-500" /> Mi Sección
                                </h2>
                                <span className="px-3 py-1 bg-purple-500/10 text-purple-500 rounded-full text-xs font-bold">
                                    {miembrosSeccion.length} músicos
                                </span>
                            </div>
                            
                            {loading ? (
                                <div className="space-y-3">
                                    {[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse" />)}
                                </div>
                            ) : miembrosSeccion.length > 0 ? (
                                <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                    {miembrosSeccion.map(m => (
                                        <div key={m.id_miembro} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/[0.02] rounded-xl border border-gray-100 dark:border-white/5">
                                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 font-black text-sm">
                                                {m.nombres?.charAt(0)}{m.apellidos?.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{m.nombres} {m.apellidos}</p>
                                                <p className="text-xs text-gray-500">{m.categoria?.nombre_categoria || 'Músico'}</p>
                                            </div>
                                            <div className={clsx(
                                                "w-3 h-3 rounded-full",
                                                m.user?.estado ? "bg-emerald-500" : "bg-gray-300"
                                            )} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-gray-400">
                                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p>No hay miembros en tu sección</p>
                                </div>
                            )}
                        </div>

                        {/* Stats de la Sección */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            <div className="bg-white dark:bg-[#161b2c] border border-gray-200 dark:border-white/5 rounded-xl p-3 sm:p-4 transition-colors">
                                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 mb-1 sm:mb-2" />
                                <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{data?.stats?.eventos?.hoy || 0}</p>
                                <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase">Eventos Hoy</p>
                            </div>
                            <div className="bg-white dark:bg-[#161b2c] border border-gray-200 dark:border-white/5 rounded-xl p-3 sm:p-4 transition-colors">
                                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 mb-1 sm:mb-2" />
                                <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{data?.stats?.eventos?.proximos || 0}</p>
                                <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase">Esta Semana</p>
                            </div>
                            <div className="bg-white dark:bg-[#161b2c] border border-gray-200 dark:border-white/5 rounded-xl p-3 sm:p-4 transition-colors">
                                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 mb-1 sm:mb-2" />
                                <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{data?.mi_racha || 0}</p>
                                <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase">Mi Racha</p>
                            </div>
                            <div className="bg-white dark:bg-[#161b2c] border border-gray-200 dark:border-white/5 rounded-xl p-3 sm:p-4 transition-colors">
                                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mb-1 sm:mb-2" />
                                <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{data?.stats?.asistencia?.promedio || 0}%</p>
                                <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase">Asist. Sección</p>
                            </div>
                        </div>
                    </div>

                    {/* Columna Derecha - Accesos y Eventos */}
                    <div className="space-y-6">
                        
                        {/* Accesos Rápidos */}
                        <div className="bg-white dark:bg-[#161b2c] border border-gray-200 dark:border-white/5 rounded-2xl p-6 transition-colors shadow-sm">
                            <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4 uppercase">Área de Gestión</h2>
                            <div className="space-y-3">
                                <button onClick={() => navigate('/dashboard/formaciones')} className="w-full flex items-center gap-4 p-4 bg-amber-500/5 hover:bg-amber-500/10 rounded-xl transition-all group border border-amber-500/10 hover:border-amber-500/30">
                                    <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500">
                                        <Layers className="w-5 h-5 shrink-0" />
                                    </div>
                                    <div className="text-left">
                                        <span className="text-sm font-black text-amber-500 block uppercase tracking-tight leading-none mb-1">Armar Mis Listas</span>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{data?.stats?.eventos?.pendientes_formacion || 0} Pendientes</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-amber-500/40 ml-auto group-hover:translate-x-1 transition-transform" />
                                </button>

                                <button onClick={() => navigate('/dashboard/eventos')} className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/[0.02] hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all group">
                                    <Calendar className="w-5 h-5 text-indigo-500" />
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Mi Agenda</span>
                                    <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                                </button>
                                <button onClick={() => navigate('/dashboard/repertorio')} className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/[0.02] hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all group">
                                    <Music className="w-5 h-5 text-emerald-500" />
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Repertorio</span>
                                    <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                                </button>
                                <button onClick={() => navigate('/dashboard/partituras')} className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/[0.02] hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-xl transition-all group">
                                    <BookOpen className="w-5 h-5 text-purple-500" />
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">Partituras</span>
                                    <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                                </button>
                                <button onClick={() => navigate('/dashboard/pagos')} className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/[0.02] hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl transition-all group">
                                    <DollarSign className="w-5 h-5 text-amber-500" />
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-amber-600 dark:group-hover:text-amber-400">Mis Pagos</span>
                                    <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                                </button>
                            </div>
                        </div>

                        {/* Próximos Eventos */}
                        <div className="bg-white dark:bg-[#161b2c] border border-gray-200 dark:border-white/5 rounded-2xl p-6 transition-colors">
                            <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-amber-500" /> Próximos
                            </h2>
                            {data?.mis_eventos?.length > 0 ? (
                                <div className="space-y-3">
                                    {data.mis_eventos.slice(0, 3).map(ev => (
                                        <div key={ev.id_evento} className="p-3 bg-gray-50 dark:bg-white/[0.02] rounded-xl">
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">{ev.evento}</p>
                                            <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {ev.hora?.substring(0, 5)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-400">
                                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                    <p className="text-xs">Sin eventos próximos</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
