import { useState, useEffect } from 'react';
import { Users, Calendar, DollarSign, Activity, Flame, TrendingUp, ArrowUpRight, LayoutList, BarChart3, Search, ChevronDown, Clock, Zap, MapPin, Map, Navigation, CheckCircle2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import AttendanceHeatmap from '../asistencias/components/AttendanceHeatmap';

const StatCard = ({ title, value, label, icon: Icon, color, loading, subtitle }) => {
    const colors = {
        indigo: 'text-indigo-400',
        purple: 'text-purple-400',
        green: 'text-green-400',
        pink: 'text-pink-400',
        orange: 'text-orange-400'
    };

    const gradientBgs = {
        indigo: 'from-indigo-500/5 to-transparent',
        purple: 'from-purple-500/5 to-transparent',
        green: 'from-green-500/5 to-transparent',
        pink: 'from-pink-500/5 to-transparent',
        orange: 'from-orange-500/5 to-transparent'
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#161b2c]/60 backdrop-blur-xl border border-white/5 p-5 rounded-[2rem] flex flex-col justify-between hover:border-white/10 transition-all group relative overflow-hidden h-full"
        >
            <div className={clsx("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", gradientBgs[color])} />
            
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.2em]">
                        {title}
                    </p>
                    <div className={clsx("p-2 rounded-xl bg-white/5 transition-transform group-hover:scale-110", colors[color])}>
                        <Icon className="w-4 h-4" />
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-2">
                        <div className="h-10 w-24 bg-white/5 animate-pulse rounded-xl"></div>
                        <div className="h-4 w-32 bg-white/5 animate-pulse rounded-lg"></div>
                    </div>
                ) : (
                    <>
                        <h3 className="text-4xl font-black text-white tracking-tighter tabular-nums mb-1">
                            {value}
                        </h3>
                        {subtitle && <p className="text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">{subtitle}</p>}
                    </>
                )}
            </div>

            <div className="relative z-10 mt-4">
                {loading ? (
                    <div className="h-6 w-full bg-white/5 animate-pulse rounded-lg"></div>
                ) : (
                    <div className={clsx(
                        "text-[9px] font-black px-3 py-1.5 rounded-xl inline-flex items-center gap-2 border border-white/5 transition-all whitespace-nowrap",
                        color === 'green' ? "bg-green-500/10 text-green-400" : "bg-white/5 text-gray-400"
                    )}>
                        {label}
                        <ArrowUpRight className="w-3 h-3 opacity-50 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// Radial Health Ring Component
const HealthRing = ({ percentage, loading }) => {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (percentage / 100) * circumference;
    
    const getColor = (p) => {
        if (p >= 80) return { stroke: '#22c55e', text: 'text-green-400', bg: 'bg-green-500/10' };
        if (p >= 50) return { stroke: '#eab308', text: 'text-yellow-400', bg: 'bg-yellow-500/10' };
        return { stroke: '#ef4444', text: 'text-red-400', bg: 'bg-red-500/10' };
    };
    
    const colors = getColor(percentage);
    
    return (
        <div className="relative w-28 h-28">
            <svg className="w-full h-full transform -rotate-90">
                <circle cx="56" cy="56" r="45" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
                {!loading && (
                    <motion.circle 
                        cx="56" 
                        cy="56" 
                        r="45" 
                        stroke={colors.stroke}
                        strokeWidth="8" 
                        fill="none"
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        strokeDasharray={circumference}
                        style={{ filter: `drop-shadow(0 0 6px ${colors.stroke})` }}
                    />
                )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {loading ? (
                    <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse" />
                ) : (
                    <>
                        <span className={clsx("text-2xl font-black", colors.text)}>{percentage}%</span>
                        <span className="text-[8px] text-gray-500 font-bold uppercase">Este Mes</span>
                    </>
                )}
            </div>
        </div>
    );
};

// Top Musicians with Streaks
const TopStreaksList = ({ musicians, loading }) => {
    if (loading) return (
        <div className="space-y-3">
            {[1,2,3].map(i => (
                <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
            ))}
        </div>
    );
    
    if (!musicians || musicians.length === 0) return (
        <p className="text-gray-600 text-xs text-center py-4">Sin datos de rachas disponibles</p>
    );
    
    return (
        <div className="space-y-2">
            {musicians.slice(0, 5).map((m, idx) => (
                <motion.div 
                    key={m.id_miembro}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center justify-between p-3 bg-white/[0.03] hover:bg-white/[0.06] rounded-xl border border-white/5 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className={clsx(
                            "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black",
                            idx === 0 ? "bg-yellow-500/20 text-yellow-400" :
                            idx === 1 ? "bg-gray-400/20 text-gray-400" :
                            idx === 2 ? "bg-orange-700/20 text-orange-600" :
                            "bg-white/5 text-gray-500"
                        )}>
                            #{idx + 1}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white">{m.nombres} {m.apellidos?.charAt(0)}.</p>
                            <p className="text-[9px] text-gray-500 uppercase">{m.instrumento}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-sm font-black text-orange-400">{m.streak}</span>
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
    const [timeRange, setTimeRange] = useState('ANUAL'); // SEMANAL, MENSUAL, ANUAL

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371000; // Metros
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    useEffect(() => {
        loadDashboardStats();
    }, []);

    // Efecto de Auto-Marcado (Optimizado para Batería)
    useEffect(() => {
        // Solo vigilar si está activado, hay eventos y no estamos ya en proceso de marcado
        if (!autoMark || !data?.mis_eventos?.length || marking) return;

        const checkAttendance = () => {
            const ahora = new Date();
            
            data.mis_eventos.forEach(ev => {
                // Solo procesar si no tiene asistencia
                if (ev.asistencia) return;

                // Calcular ventana de tiempo en el cliente (más preciso)
                const [h, m] = ev.hora.split(':').map(Number);
                const horaEvento = new Date();
                horaEvento.setHours(h, m, 0, 0);

                const minAntes = 15; // Optimizado: 15 minutos antes
                const minCierre = ev.minutos_cierre || (ev.tipo?.minutos_cierre || 60);

                const inicio = new Date(horaEvento.getTime() - minAntes * 60000);
                const fin = new Date(horaEvento.getTime() + minCierre * 60000);

                if (ahora >= inicio && ahora <= fin && ev.latitud && ev.longitud) {
                    // Si estamos en hora, pedimos ubicación UNA VEZ (no constante)
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const { latitude, longitude } = position.coords;
                            const dist = calculateDistance(latitude, longitude, ev.latitud, ev.longitud);
                            const radius = ev.radio || 100;
                            
                            if (dist <= radius) {
                                handleMarcarAsistencia(ev.id_evento, true);
                            }
                        },
                        null,
                        { enableHighAccuracy: true, timeout: 5000 }
                    );
                }
            });
        };

        // Primera ejecución inmediata
        checkAttendance();

        // Polling cada 3 minutos (Máximo ahorro de batería)
        const intervalId = setInterval(checkAttendance, 180000);

        return () => clearInterval(intervalId);
    }, [data?.mis_eventos, autoMark, marking]);

    const loadDashboardStats = async () => {
        setLoading(true);
        try {
            const res = await api.get('/dashboard/stats');
            setData(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarcarAsistencia = async (id_evento, isAuto = false) => {
        if (!navigator.geolocation) {
            return notify('Tu navegador no soporta geolocalización', 'error');
        }

        if (!isAuto) setMarking(true);
        
        const performMark = async (latitud, longitud) => {
            try {
                await api.post('/asistencia/marcar', { id_evento, latitud, longitud });
                notify(isAuto ? '✨ ¡Asistencia automática registrada! Bienvenido.' : '¡Asistencia registrada con éxito!', 'success');
                loadDashboardStats();
            } catch (error) {
                console.error(error);
                if (!isAuto) notify(error.response?.data?.message || 'Error al marcar asistencia', 'error');
            } finally {
                if (!isAuto) setMarking(false);
            }
        };

        if (isAuto) {
            navigator.geolocation.getCurrentPosition(
                (pos) => performMark(pos.coords.latitude, pos.coords.longitude),
                null, 
                { enableHighAccuracy: true }
            );
        } else {
            navigator.geolocation.getCurrentPosition(
                (position) => performMark(position.coords.latitude, position.coords.longitude),
                (error) => {
                    let msg = 'Error al obtener ubicación';
                    if (error.code === 1) msg = 'Debes permitir el acceso a tu ubicación para marcar asistencia';
                    notify(msg, 'error');
                    setMarking(false);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-1000 px-4 sm:px-0">
            {/* Header with Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-2 h-8 bg-brand-primary rounded-full" />
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Centro de Comando</h1>
                    </div>
                    <p className="text-gray-500 text-sm font-medium ml-5">Nivel de desempeño y métricas operativas</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    {/* Toggle Magic Auto-Mark */}
                    {user?.role === 'MIEMBRO' && (
                        <button 
                            onClick={() => {
                                setAutoMark(!autoMark);
                                notify(`Asistencia automática ${!autoMark ? 'activada ✨' : 'desactivada ✋'}`, 'info');
                            }}
                            className={clsx(
                                "flex items-center gap-3 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                autoMark 
                                    ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary shadow-xl shadow-brand-primary/10" 
                                    : "bg-white/5 border-white/10 text-gray-500"
                            )}
                        >
                            <Zap className={clsx("w-4 h-4", autoMark && "animate-pulse")} />
                            {autoMark ? 'Auto-Asistencia ON' : 'Auto-Asistencia OFF'}
                        </button>
                    )}

                    {(user?.role === 'ADMIN' || user?.role === 'DIRECTOR') && (
                        <button 
                            onClick={() => navigate('/asistencias')}
                            className="flex items-center gap-3 px-6 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-brand-primary/20 active:scale-95 border border-white/10"
                        >
                            <Zap className="w-4 h-4" />
                            Control de Asistencia
                        </button>
                    )}
                </div>
            </div>

            {/* Musician Attendance Quick Action */}
            {data?.mis_eventos?.length > 0 && (
                <div className="grid grid-cols-1 gap-6">
                    {data.mis_eventos.map(ev => (
                        <motion.div 
                            key={ev.id_evento}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-[#1e253c] to-[#161b2c] border border-brand-primary/20 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-12 opacity-[0.05] group-hover:rotate-12 transition-transform">
                                <Navigation className="w-32 h-32 text-brand-primary" />
                            </div>

                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-[10px] font-black text-brand-primary uppercase tracking-widest">
                                            {ev.tipo?.evento}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase">
                                            <Clock className="w-3.5 h-3.5" />
                                            Hoy {ev.hora.substring(0, 5)}
                                        </span>
                                    </div>
                                    
                                    <div>
                                        <h2 className="text-3xl font-black text-white tracking-tighter mb-2">{ev.evento}</h2>
                                        <div className="flex flex-wrap items-center gap-4">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <MapPin className="w-4 h-4 text-brand-primary" />
                                                <span className="text-sm font-medium">{ev.direccion || 'Ubicación establecida'}</span>
                                            </div>
                                            
                                            {ev.latitud && ev.longitud && (
                                                <a 
                                                    href={`https://www.google.com/maps/search/?api=1&query=${ev.latitud},${ev.longitud}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-black text-brand-primary uppercase tracking-widest transition-all group/link"
                                                >
                                                    <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                                                    Ver Mapa
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    {ev.asistencia ? (
                                        <div className="flex items-center gap-3 px-8 py-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400 font-black uppercase text-xs tracking-widest">
                                            <CheckCircle2 className="w-5 h-5" />
                                            ASISTENCIA REGISTRADA ({ev.asistencia.estado})
                                        </div>
                                    ) : ev.puede_marcar ? (
                                        <button
                                            onClick={() => handleMarcarAsistencia(ev.id_evento)}
                                            disabled={marking}
                                            className={clsx(
                                                "relative group/btn overflow-hidden px-10 py-5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all shadow-2xl shadow-brand-primary/30 active:scale-95",
                                                marking && "opacity-70 pointer-events-none"
                                            )}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
                                            <div className="flex items-center gap-3">
                                                {marking ? (
                                                    <Activity className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <Map className="w-5 h-5" />
                                                )}
                                                {marking ? 'VALIDANDO POSICIÓN...' : 'MARCAR MI PRESENCIA'}
                                            </div>
                                        </button>
                                    ) : (
                                        <div className="flex flex-col items-center sm:items-end gap-1">
                                            <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-500 font-bold uppercase text-[10px] tracking-widest">
                                                Fuera de horario de marcado
                                            </div>
                                            <p className="text-[9px] text-gray-600 font-bold italic">
                                                * Podrás marcar desde {ev.tipo?.minutos_antes_marcar || 30}m antes
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Combined Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Nómina Activa" 
                    value={data?.stats?.miembros?.total || "0"} 
                    subtitle="Miembros registrados"
                    label={`${data?.stats?.miembros?.nuevos_mes || 0} ingresos este mes`} 
                    icon={Users} 
                    color="indigo" 
                    loading={loading}
                />
                
                {/* Consolidado de Eventos */}
                <StatCard 
                    title="Gestión de Eventos" 
                    value={data?.stats?.eventos?.hoy || "0"} 
                    subtitle="Eventos programados hoy"
                    label={`${data?.stats?.eventos?.proximos || 0} en agenda próxima`} 
                    icon={Calendar} 
                    color="orange" 
                    loading={loading}
                />

                <StatCard 
                    title="Rendimiento Grupal" 
                    value={`${data?.stats?.asistencia?.promedio || 0}%`} 
                    subtitle="Asistencia histórica"
                    label="Tendencia en alza" 
                    icon={Activity} 
                    color="pink" 
                    loading={loading}
                />
            </div>

            {/* Main Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Heatmap Section */}
                <div className="lg:col-span-2 bg-[#161b2c] border border-white/5 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                        <TrendingUp className="w-64 h-64 text-white" />
                    </div>
                    
                    <div className="relative z-10">
                        {/* Header with Tabs */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                    <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
                                    Mapa de Constancia
                                </h3>
                                <p className="text-gray-500 text-xs mt-1">Actividad de ensayos durante el año</p>
                            </div>
                            
                            {/* Time Range Tabs */}
                            <div className="flex bg-black/30 p-1 rounded-xl border border-white/5">
                                {['SEMANAL', 'MENSUAL', 'ANUAL'].map(range => (
                                    <button
                                        key={range}
                                        onClick={() => setTimeRange(range)}
                                        className={clsx(
                                            "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                            timeRange === range 
                                                ? "bg-white text-black shadow-lg" 
                                                : "text-gray-500 hover:text-white"
                                        )}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="hidden sm:flex items-center gap-2 text-[10px] text-gray-500 font-bold mb-4">
                            <span>MENOS</span>
                            <div className="flex gap-1.5">
                                {[0, 1, 2, 3, 4].map(l => (
                                    <div key={l} className={clsx(
                                        "w-3.5 h-3.5 rounded-sm",
                                        l === 0 && "bg-white/5",
                                        l === 1 && "bg-green-900/40",
                                        l === 2 && "bg-green-700/60",
                                        l === 3 && "bg-green-500",
                                        l === 4 && "bg-[#39FF14]"
                                    )}></div>
                                ))}
                            </div>
                            <span>MÁS</span>
                        </div>

                        {loading ? (
                            <div className="py-10 flex flex-col items-center justify-center space-y-4">
                                <div className="grid grid-rows-7 grid-flow-col gap-1.5 opacity-20">
                                    {Array.from({ length: 364 }).map((_, i) => (
                                        <div key={i} className="w-3 h-3 bg-white/20 rounded-sm animate-pulse" />
                                    ))}
                                </div>
                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] animate-pulse">Sincronizando datos de actividad...</p>
                            </div>
                        ) : (
                            <AnimatePresence mode="wait">
                                {timeRange === 'ANUAL' && (
                                    <motion.div
                                        key="anual"
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                    >
                                        <AttendanceHeatmap heatmapData={data?.heatmap} />
                                    </motion.div>
                                )}
                                {timeRange === 'MENSUAL' && (
                                    <motion.div
                                        key="mensual"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="py-12 text-center"
                                    >
                                        <div className="flex flex-col sm:flex-row items-center justify-center gap-12">
                                            <HealthRing percentage={data?.stats?.asistencia?.promedio_mes || 0} loading={loading} />
                                            <div className="text-left space-y-1">
                                                <p className="text-[10px] text-brand-primary font-black uppercase tracking-widest">Actividad Reciente</p>
                                                <p className="text-5xl font-black text-white tracking-tighter">{data?.stats?.eventos?.este_mes || 0}</p>
                                                <p className="text-xs text-gray-500 font-bold uppercase">Eventos completados este mes</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                {timeRange === 'SEMANAL' && (
                                    <motion.div
                                        key="semanal"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="py-6"
                                    >
                                        <div className="grid grid-cols-7 gap-4">
                                            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, idx) => {
                                                const dayData = data?.weekly?.[idx] || { present: 0, total: 0 };
                                                const height = dayData.total > 0 ? (dayData.present / dayData.total) * 100 : 0;
                                                return (
                                                    <div key={idx} className="flex flex-col items-center gap-4">
                                                        <div className="flex-1 w-full bg-white/[0.03] rounded-2xl h-40 relative overflow-hidden flex items-end justify-center group/bar border border-white/5">
                                                            <motion.div 
                                                                initial={{ height: 0 }}
                                                                animate={{ height: `${height}%` }}
                                                                className={clsx(
                                                                    "w-full transition-all duration-1000 relative",
                                                                    height > 80 ? "bg-green-500/80" :
                                                                    height > 50 ? "bg-indigo-500/80" :
                                                                    "bg-red-500/80"
                                                                )}
                                                            >
                                                                <div className="absolute top-0 left-0 right-0 h-8 bg-white/10 rounded-full blur-md" />
                                                            </motion.div>
                                                            
                                                            <div className="absolute opacity-0 group-hover/bar:opacity-100 transition-all bottom-full mb-3 z-20 pointer-events-none transform translate-y-2 group-hover:translate-y-0">
                                                                <div className="bg-[#111522] border border-white/10 px-3 py-1.5 rounded-lg text-[9px] font-black text-white whitespace-nowrap shadow-2xl">
                                                                    {dayData.present}/{dayData.total} PRESENTES
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <p className="text-[10px] font-black text-gray-500 uppercase">{day}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    {/* Health Ring Card */}
                    <div className="bg-[#161b2c]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Salud Operativa</h4>
                            <div className="p-2 bg-white/5 rounded-lg">
                                <Activity className="w-3 h-3 text-indigo-400" />
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <HealthRing percentage={data?.stats?.asistencia?.promedio_mes || 0} loading={loading} />
                        </div>
                        <div className="mt-6 p-4 bg-white/[0.03] rounded-2xl border border-white/5 text-center">
                            <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                                {(data?.stats?.asistencia?.promedio_mes || 0) >= 80 
                                    ? "¡Excelente compromiso! La banda mantiene un ritmo profesional." 
                                    : "Oportunidad de mejora en la asistencia grupal."}
                            </p>
                        </div>
                    </div>

                    {/* Top Streaks */}
                    <div className="bg-[#161b2c]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Flame className="w-3.5 h-3.5 text-orange-500" />
                                Ranking de Rachas
                            </h4>
                        </div>
                        <TopStreaksList musicians={data?.top_streaks} loading={loading} />
                    </div>

                    {/* Quick Event Card */}
                    {data?.proximo_evento && !loading && (
                        <div className="bg-gradient-to-br from-indigo-600/90 to-purple-700/90 rounded-[2rem] p-6 relative overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/10 transition-all active:scale-[0.98]" onClick={() => navigate('/eventos')}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                            <div className="relative z-10 space-y-4">
                                <div>
                                    <p className="text-white/60 text-[9px] font-black uppercase tracking-[0.3em] mb-1">Próxima Parada</p>
                                    <h4 className="text-white font-black text-xl tracking-tighter leading-tight">{data.proximo_evento.evento}</h4>
                                </div>
                                <div className="flex items-center gap-2 text-white/80 text-[10px] font-bold">
                                    <Clock className="w-3 h-3" />
                                    {new Date(data.proximo_evento.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}
                                </div>
                                <div className="pt-2">
                                    <div className="w-full py-3 bg-white/10 group-hover:bg-white/20 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all text-center border border-white/10">
                                        Gestionar Evento
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
