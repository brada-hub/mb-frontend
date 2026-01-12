import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    DollarSign, Calendar, Clock, CheckCircle2, AlertCircle, 
    PiggyBank, History, ChevronRight 
} from 'lucide-react';
import api from '../../api';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';

export default function MisPagos() {
    const { user } = useAuth();
    const [data, setData] = useState({ por_cobrar: [], historial_cobrado: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('COBRAR'); // COBRAR | HISTORIAL

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/pagos/mis-pagos');
            setData(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const totalPorCobrar = data.por_cobrar.length;
    
    // Agrupar por mes para el historial
    const historialGrouped = data.historial_cobrado.reduce((acc, curr) => {
        const date = new Date(curr.fecha_pago);
        const key = date.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
        if (!acc[key]) acc[key] = [];
        acc[key].push(curr);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Cargando tus finanzas...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto px-2 sm:px-6 pb-20">
            {/* Header / Resumen */}
            <div className="bg-gradient-to-br from-indigo-900/40 via-[#161b2c] to-[#0f111a] rounded-[2.5rem] sm:rounded-[4rem] p-6 sm:p-12 border border-white/10 relative overflow-hidden shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)]">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                    <PiggyBank className="w-64 h-64 sm:w-96 sm:h-96 text-white -rotate-12 translate-x-20 -translate-y-10" />
                </div>
                
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                    <div className="flex flex-col">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full w-fit mb-4">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Estado Financiero</span>
                        </div>
                        <h1 className="text-3xl sm:text-6xl font-black text-white uppercase tracking-tighter leading-none mb-2">Mi Actividad</h1>
                        <p className="text-gray-500 text-xs sm:text-lg font-medium tracking-tight max-w-lg">Seguimiento de tus participaciones y eventos por cobrar.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 min-w-0 lg:min-w-[500px]">
                        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 sm:p-8 transition-all hover:bg-white/10 hover:-translate-y-1 duration-300 shadow-xl group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-emerald-500/20 rounded-2xl group-hover:scale-110 transition-transform">
                                    <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
                                </div>
                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Pendiente</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <p className="text-4xl sm:text-6xl font-black text-white tracking-tighter">{totalPorCobrar}</p>
                                <span className="text-xs sm:text-base text-gray-500 font-black uppercase">Eventos</span>
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 sm:p-8 transition-all hover:bg-white/10 hover:-translate-y-1 duration-300 shadow-xl group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-500/20 rounded-2xl group-hover:scale-110 transition-transform">
                                    <History className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                                </div>
                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Completado</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <p className="text-4xl sm:text-6xl font-black text-white tracking-tighter">{data.historial_cobrado.length}</p>
                                <span className="text-xs sm:text-base text-gray-500 font-black uppercase">Eventos</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs & Controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-1.5 p-1.5 bg-[#161b2c] border border-white/5 rounded-2xl w-full md:w-auto shadow-2xl">
                    <button 
                        onClick={() => setActiveTab('COBRAR')}
                        className={clsx(
                            "flex-1 md:min-w-[180px] px-6 py-3.5 text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] rounded-xl transition-all duration-500",
                            activeTab === 'COBRAR' ? "bg-indigo-600 text-white shadow-[0_10px_20px_-5px_rgba(79,70,229,0.5)] scale-[1.05]" : "text-gray-500 hover:text-white hover:bg-white/5"
                        )}
                    >
                        Pendientes de Cobro ({data.por_cobrar.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('HISTORIAL')}
                        className={clsx(
                            "flex-1 md:min-w-[180px] px-6 py-3.5 text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] rounded-xl transition-all duration-500",
                            activeTab === 'HISTORIAL' ? "bg-indigo-600 text-white shadow-[0_10px_20px_-5px_rgba(79,70,229,0.5)] scale-[1.05]" : "text-gray-500 hover:text-white hover:bg-white/5"
                        )}
                    >
                        Historial de Cobros
                    </button>
                </div>

                <div className="hidden md:flex items-center gap-4 text-gray-400">
                    <p className="text-[10px] font-black uppercase tracking-widest">Filtrar por:</p>
                    <select className="bg-[#161b2c] border border-white/5 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:border-indigo-500/50 text-white">
                        <option>Todos los eventos</option>
                        <option>Contratos</option>
                        <option>Rematitos</option>
                    </select>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="min-h-[50vh]">
                {activeTab === 'COBRAR' ? (
                    data.por_cobrar.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center bg-[#161b2c]/20 border-2 border-dashed border-white/5 rounded-[3rem] animate-in zoom-in duration-700">
                            <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-8 relative">
                                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                                <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">¡Finanzas al día!</h3>
                            <p className="text-gray-500 text-sm sm:text-base mt-3 max-w-sm mx-auto leading-relaxed">No tienes liquidaciones pendientes en este momento. ¡Buen trabajo!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {data.por_cobrar.map((item, idx) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05, type: 'spring', damping: 20 }}
                                    key={item.id_convocatoria}
                                    className="bg-surface-card border border-white/5 p-6 rounded-[2.5rem] flex flex-col gap-6 group hover:border-indigo-500/40 transition-all hover:bg-[#161b2c] hover:shadow-2xl relative overflow-hidden"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="p-4 bg-white/5 rounded-2xl flex flex-col items-center justify-center text-gray-500 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 min-w-[70px]">
                                            <span className="text-[10px] font-black uppercase leading-none mb-1">{new Date(item.fecha).toLocaleString('es', { month: 'short' })}</span>
                                            <span className="text-2xl font-black leading-none">{new Date(item.fecha).getDate()}</span>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={clsx(
                                                "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
                                                item.tipo === 'CONTRATO' 
                                                    ? "bg-purple-500/10 text-purple-400 border-purple-500/20" 
                                                    : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                            )}>
                                                {item.tipo}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-black uppercase">
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                                Listo
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-white text-lg sm:text-xl truncate tracking-tight mb-2">{item.evento}</h3>
                                        <div className="flex items-center gap-4 text-xs text-gray-500 font-bold uppercase">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-indigo-400" />
                                                {item.hora?.substr(0, 5)}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-indigo-400" />
                                                {new Date(item.fecha).getFullYear()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest text-emerald-400">Actividad Remunerada</span>
                                        <div className="text-white font-black text-lg">
                                            PENDIENTE
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )
                ) : (
                    Object.entries(historialGrouped).length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center bg-[#161b2c]/20 border-2 border-dashed border-white/5 rounded-[3rem]">
                            <History className="w-16 h-16 text-gray-700 mb-6 opacity-30" />
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Sin Historial</h3>
                            <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto">Aún no se registran liquidaciones en tu cuenta histórica.</p>
                        </div>
                    ) : (
                        <div className="space-y-12 pb-20">
                            {Object.entries(historialGrouped).sort((a,b) => b[1][0].fecha_pago.localeCompare(a[1][0].fecha_pago)).map(([mes, eventos]) => (
                                <div key={mes} className="relative">
                                    <div className="sticky top-[100px] z-20 py-4 mb-6">
                                        <div className="inline-flex items-center gap-4 px-6 py-3 bg-[#161b2c] border border-white/5 rounded-2xl shadow-2xl">
                                            <Calendar className="w-5 h-5 text-indigo-500" />
                                            <h3 className="text-white text-sm sm:text-base font-black uppercase tracking-[0.3em]">{mes}</h3>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 relative z-10">
                                        {eventos.map(item => (
                                            <div 
                                                key={item.id_convocatoria}
                                                className="bg-[#161b2c]/30 border border-white/5 p-6 rounded-[2rem] flex flex-col gap-4 opacity-80 hover:opacity-100 transition-all hover:bg-[#161b2c]/60 hover:scale-[1.02] group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0 border border-white/10 group-hover:bg-emerald-500/10 transition-colors">
                                                        <CheckCircle2 className="w-6 h-6" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-bold text-gray-200 text-base truncate">{item.evento}</h3>
                                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Cobrado con éxito</p>
                                                    </div>
                                                </div>
                                                <div className="mt-2 pt-4 border-t border-white/5 flex flex-col gap-2">
                                                    <div className="flex justify-between items-center text-[10px] text-gray-500 font-black uppercase tracking-wider">
                                                        <span>Estado de Actividad</span>
                                                        <span className="text-emerald-400 font-black uppercase">Cobrado / Liquidado</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-[10px] text-gray-500 font-black uppercase tracking-wider">
                                                        <span>Fecha de Pago</span>
                                                        <span className="text-gray-300">{new Date(item.fecha_pago).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
