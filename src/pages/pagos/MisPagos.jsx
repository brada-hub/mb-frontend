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
        <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
            {/* Header / Resumen */}
            <div className="bg-gradient-to-br from-indigo-900 via-[#161b2c] to-[#0f111a] rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                    <PiggyBank className="w-64 h-64 text-white" />
                </div>
                
                <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-1 relative z-10">Mi Billetera</h1>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-8 relative z-10">Resumen de Actividad Remunerada</p>
                
                <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                    <div className="bg-surface-card/50 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-emerald-500/20 rounded-lg">
                                <DollarSign className="w-5 h-5 text-emerald-400" />
                            </div>
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Por Cobrar</span>
                        </div>
                        <p className="text-3xl font-black text-white">{totalPorCobrar} <span className="text-sm text-gray-500 font-medium">Eventos</span></p>
                    </div>

                    <div className="bg-surface-card/50 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <History className="w-5 h-5 text-blue-400" />
                            </div>
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Historial Cobrado</span>
                        </div>
                        <p className="text-3xl font-black text-white">{data.historial_cobrado.length} <span className="text-sm text-gray-500 font-medium">Eventos</span></p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 p-1 bg-surface-card border border-white/5 rounded-xl w-full max-w-sm mx-auto sm:mx-0">
                <button 
                    onClick={() => setActiveTab('COBRAR')}
                    className={clsx(
                        "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                        activeTab === 'COBRAR' ? "bg-indigo-600 text-white shadow-lg" : "text-gray-500 hover:text-white hover:bg-white/5"
                    )}
                >
                    Por Cobrar ({data.por_cobrar.length})
                </button>
                <button 
                    onClick={() => setActiveTab('HISTORIAL')}
                    className={clsx(
                        "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                        activeTab === 'HISTORIAL' ? "bg-indigo-600 text-white shadow-lg" : "text-gray-500 hover:text-white hover:bg-white/5"
                    )}
                >
                    Historial
                </button>
            </div>

            {/* Content Switch */}
            <div className="space-y-4">
                {activeTab === 'COBRAR' ? (
                    data.por_cobrar.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center bg-surface-card border border-white/5 rounded-3xl">
                            <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4 opacity-50" />
                            <h3 className="text-lg font-bold text-white">¡Todo al día!</h3>
                            <p className="text-gray-500 text-sm mt-1">No tienes pagos pendientes por recoger.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {data.por_cobrar.map(item => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={item.id_convocatoria}
                                    className="bg-surface-card border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-indigo-500/30 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/5 rounded-xl flex flex-col items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-indigo-500/20 transition-all">
                                            <span className="text-xs font-black uppercase">{new Date(item.fecha).toLocaleString('es', { month: 'short' })}</span>
                                            <span className="text-lg font-black leading-none">{new Date(item.fecha).getDate()}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-sm sm:text-base">{item.evento}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={clsx(
                                                    "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border",
                                                    item.tipo === 'CONTRATO' 
                                                        ? "bg-purple-500/10 text-purple-400 border-purple-500/20" 
                                                        : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                )}>
                                                    {item.tipo}
                                                </span>
                                                <span className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                                    <Clock className="w-3 h-3" /> {item.hora?.substr(0, 5)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-emerald-400 text-xs font-black uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                                            Pendiente
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )
                ) : (
                    Object.entries(historialGrouped).length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center bg-surface-card border border-white/5 rounded-3xl">
                            <History className="w-16 h-16 text-gray-700 mb-4" />
                            <h3 className="text-lg font-bold text-white">Sin Historial</h3>
                            <p className="text-gray-500 text-sm mt-1">Aún no tienes pagos registrados en el sistema.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(historialGrouped).map(([mes, eventos]) => (
                                <div key={mes}>
                                    <h3 className="text-gray-500 text-xs font-black uppercase tracking-widest mb-3 pl-2 border-l-2 border-indigo-500">{mes}</h3>
                                    <div className="grid gap-3">
                                        {eventos.map(item => (
                                            <div 
                                                key={item.id_convocatoria}
                                                className="bg-surface-card border border-white/5 p-4 rounded-2xl flex items-center justify-between opacity-75 hover:opacity-100 transition-opacity"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-500">
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-200 text-sm">{item.evento}</h3>
                                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                                            Pagado el: {new Date(item.fecha_pago).toLocaleDateString()}
                                                        </p>
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
