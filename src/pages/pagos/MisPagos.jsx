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
        <div className="space-y-4 sm:space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto px-2 sm:px-6 pb-20">
            {/* Header / Resumen */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight transition-colors leading-none">Mis Pagos y Actividad</h1>
                    <p className="text-gray-500 text-[9px] sm:text-xs font-medium uppercase tracking-widest mt-0.5 sm:mt-1 transition-colors leading-none">Seguimiento de participaciones</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="bg-surface-card border border-surface-border p-2 sm:p-3 px-4 sm:px-5 rounded-xl sm:rounded-2xl flex items-center gap-3 sm:gap-4 shadow-sm transition-colors">
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] sm:text-[9px] font-black text-gray-500 dark:text-gray-500 uppercase tracking-widest mb-0.5">Pendientes</span>
                            <span className="text-lg sm:text-xl font-black text-emerald-500 leading-none">{totalPorCobrar}</span>
                        </div>
                        <div className="w-px h-6 sm:h-8 bg-surface-border" />
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] sm:text-[9px] font-black text-gray-500 dark:text-gray-500 uppercase tracking-widest mb-0.5">Cobrados</span>
                            <span className="text-lg sm:text-xl font-black text-[#bc1b1b] leading-none">{data.historial_cobrado.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs & Controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 bg-surface-card border border-surface-border p-3 sm:p-4 rounded-2xl sm:rounded-[2rem] shadow-sm transition-colors">
                <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-1 rounded-xl sm:rounded-2xl border border-surface-border w-full md:w-auto">
                    <button 
                        onClick={() => setActiveTab('COBRAR')}
                        className={clsx(
                            "flex-1 md:min-w-[160px] px-4 sm:px-6 py-2 sm:py-3 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg sm:rounded-xl transition-all",
                            activeTab === 'COBRAR' ? "bg-[#bc1b1b] text-white shadow-lg shadow-[#bc1b1b]/20" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        )}
                    >
                        Pend ({data.por_cobrar.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('HISTORIAL')}
                        className={clsx(
                            "flex-1 md:min-w-[160px] px-4 sm:px-6 py-2 sm:py-3 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg sm:rounded-xl transition-all",
                            activeTab === 'HISTORIAL' ? "bg-[#bc1b1b] text-white shadow-lg shadow-[#bc1b1b]/20" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        )}
                    >
                        Historial
                    </button>
                </div>
 
                <div className="flex items-center gap-3 sm:gap-4 text-gray-500 w-full sm:w-auto">
                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-50 whitespace-nowrap">Filtrar:</p>
                    <select className="flex-1 sm:flex-initial bg-surface-input border border-surface-border rounded-xl px-3 sm:px-4 py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-[#bc1b1b]/50 text-gray-900 dark:text-white transition-colors cursor-pointer h-9 sm:h-10">
                        <option>EVENTOS</option>
                        <option>CONTRATOS</option>
                        <option>ENSAYOS</option>
                    </select>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="min-h-[50vh]">
                {activeTab === 'COBRAR' ? (
                    data.por_cobrar.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center bg-surface-card border-2 border-dashed border-surface-border rounded-[3rem] animate-in zoom-in duration-700 transition-colors">
                            <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-8 relative">
                                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                                <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight transition-colors">¡Finanzas al día!</h3>
                            <p className="text-gray-500 text-sm sm:text-base mt-3 max-w-sm mx-auto leading-relaxed transition-colors">No tienes liquidaciones pendientes en este momento. ¡Buen trabajo!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {data.por_cobrar.map((item, idx) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05, type: 'spring', damping: 20 }}
                                    key={item.id_convocatoria}
                                    className="bg-surface-card border border-surface-border p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col gap-4 sm:gap-6 group hover:border-[#bc1b1b]/40 transition-all hover:bg-black/[0.02] dark:hover:bg-[#0a0a0a] hover:shadow-2xl relative overflow-hidden"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="p-3 sm:p-4 bg-black/5 dark:bg-white/5 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-gray-500 shrink-0 group-hover:bg-[#bc1b1b] group-hover:text-white transition-all duration-500 min-w-[60px] sm:min-w-[70px]">
                                            <span className="text-[8px] sm:text-[10px] font-black uppercase leading-none mb-1">{new Date(item.fecha).toLocaleString('es', { month: 'short' })}</span>
                                            <span className="text-xl sm:text-2xl font-black leading-none">{new Date(item.fecha).getDate()}</span>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5 sm:gap-2">
                                            <span className={clsx(
                                                "text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border",
                                                item.tipo === 'CONTRATO' 
                                                    ? "bg-purple-500/10 text-purple-400 border-purple-500/20" 
                                                    : "bg-[#bc1b1b]/10 text-[#bc1b1b] border-[#bc1b1b]/20"
                                            )}>
                                                {item.tipo}
                                            </span>
                                            <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-emerald-400 font-black uppercase">
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                                Listo
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg sm:text-xl truncate tracking-tight mb-2 transition-colors">{item.evento}</h3>
                                        <div className="flex items-center gap-4 text-xs text-gray-500 font-bold uppercase">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-[#ffbe0b]" />
                                                {item.hora?.substr(0, 5)}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-[#ffbe0b]" />
                                                {new Date(item.fecha).getFullYear()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-3 sm:pt-4 border-t border-surface-border flex items-center justify-between transition-colors">
                                        <span className="text-[9px] sm:text-[10px] text-emerald-500 dark:text-emerald-400 font-black uppercase tracking-widest transition-colors leading-none truncate">Liquidación</span>
                                        <div className="text-gray-900 dark:text-white font-black text-sm sm:text-lg transition-colors leading-none">
                                            PENDIENTE
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )
                ) : (
                    Object.entries(historialGrouped).length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center bg-surface-card border-2 border-dashed border-surface-border rounded-[3rem] transition-colors">
                            <History className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-6 opacity-30 transition-colors" />
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight transition-colors">Sin Historial</h3>
                            <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto transition-colors">Aún no se registran liquidaciones en tu cuenta histórica.</p>
                        </div>
                    ) : (
                        <div className="space-y-12 pb-20">
                            {Object.entries(historialGrouped).sort((a,b) => b[1][0].fecha_pago.localeCompare(a[1][0].fecha_pago)).map(([mes, eventos]) => (
                                <div key={mes} className="relative">
                                    <div className="sticky top-[100px] z-20 py-2 sm:py-4 mb-4 sm:mb-6">
                                        <div className="inline-flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-2 sm:py-3 bg-surface-card border border-surface-border rounded-xl shadow-lg transition-colors">
                                            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ffbe0b]" />
                                            <h3 className="text-gray-900 dark:text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] transition-colors">{mes}</h3>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 relative z-10">
                                        {eventos.map(item => (
                                            <div 
                                                key={item.id_convocatoria}
                                                className="bg-surface-card border border-surface-border p-3 sm:p-5 rounded-xl sm:rounded-2xl flex flex-col gap-3 sm:gap-4 opacity-100 hover:opacity-100 transition-all hover:bg-black/[0.02] dark:hover:bg-[#0a0a0a]/60 hover:scale-[1.02] group"
                                            >
                                                <div className="flex items-center gap-3 sm:gap-4">
                                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black/5 dark:bg-white/5 rounded-xl sm:rounded-2xl flex items-center justify-center text-emerald-500 shrink-0 border border-surface-border group-hover:bg-emerald-500/10 transition-colors">
                                                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-bold text-gray-700 dark:text-gray-200 text-sm sm:text-base truncate transition-colors leading-tight">{item.evento}</h3>
                                                        <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5 sm:mt-1 transition-colors">Cobrado</p>
                                                    </div>
                                                </div>
                                                <div className="mt-1 sm:mt-2 pt-3 sm:pt-4 border-t border-surface-border flex flex-col gap-1 sm:gap-2 transition-colors">
                                                    <div className="flex justify-between items-center text-[8px] sm:text-[10px] text-gray-500 font-black uppercase tracking-wider transition-colors">
                                                        <span>Estado</span>
                                                        <span className="text-emerald-500 dark:text-emerald-400 font-black uppercase transition-colors">Liquidado</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-[8px] sm:text-[10px] text-gray-500 font-black uppercase tracking-wider transition-colors">
                                                        <span>Fecha</span>
                                                        <span className="text-gray-700 dark:text-gray-300 transition-colors">{new Date(item.fecha_pago).toLocaleDateString()}</span>
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
