import { useState, useEffect } from 'react'; // Re-trigger
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, BarChart2, TrendingUp, Users, ChevronDown, Flame, Activity } from 'lucide-react';
import api from '../../../api';
import clsx from 'clsx';
import { format, startOfYear, endOfYear, eachDayOfInterval, getDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

import AttendanceHeatmap from './AttendanceHeatmap';

export default function AnalyticsView() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('ANUAL'); // SEMANAL, MENSUAL, ANUAL

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        try {
            const res = await api.get('/asistencias/stats');
            setStats(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <Activity className="w-8 h-8 text-[#bc1b1b] animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Tabs */}
            <div className="flex justify-center">
                <div className="bg-[#111522] border border-white/10 p-1 rounded-2xl flex gap-1">
                    {['SEMANAL', 'MENSUAL', 'ANUAL'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={clsx(
                                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                activeTab === tab 
                                    ? "bg-white text-black shadow-lg shadow-white/10" 
                                    : "text-gray-500 hover:text-white"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="bg-[#1e2335] border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <TrendingUp className="w-32 h-32 text-white" />
                </div>

                {activeTab === 'ANUAL' && (
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                                    <Flame className="w-6 h-6 text-orange-500" />
                                    Mapa de Calor
                                </h3>
                                <p className="text-gray-500 text-xs mt-1">Consistencia anual de ensayos</p>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                <span>Menos</span>
                                <div className="flex gap-1">
                                    <div className="w-3 h-3 bg-white/5 rounded-sm"></div>
                                    <div className="w-3 h-3 bg-green-900/40 rounded-sm"></div>
                                    <div className="w-3 h-3 bg-green-700/60 rounded-sm"></div>
                                    <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                                    <div className="w-3 h-3 bg-[#39FF14] rounded-sm"></div>
                                </div>
                                <span>Más</span>
                            </div>
                        </div>
                        
                        <AttendanceHeatmap heatmapData={stats?.heatmap} />
                    </div>
                )}

                {activeTab === 'MENSUAL' && (
                     <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                                {stats?.monthly?.month_name}
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Eventos</p>
                                    <p className="text-3xl font-black text-white">{stats?.monthly?.total_events}</p>
                                </div>
                                <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Tasa Asistencia</p>
                                    <p className={clsx("text-3xl font-black", 
                                        stats?.monthly?.attendance_rate >= 80 ? "text-green-400" :
                                        stats?.monthly?.attendance_rate >= 50 ? "text-[#ffbe0b]" : "text-[#bc1b1b]"
                                    )}>
                                        {stats?.monthly?.attendance_rate}%
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center">
                             <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                                <Activity className="w-8 h-8 text-[#bc1b1b] mb-4" />
                                <p className="text-sm font-bold text-white mb-2 uppercase tracking-tighter">Resumen del Mes</p>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Este mes se han realizado {stats?.monthly?.total_events} convocatorias exitosas. 
                                    La participación promedio es del {stats?.monthly?.attendance_rate}%, 
                                    {stats?.monthly?.attendance_rate >= 80 ? " superando el objetivo de excelencia." : " manteniedo un ritmo constante."}
                                </p>
                             </div>
                        </div>
                     </div>
                )}

                 {activeTab === 'SEMANAL' && (
                     <div className="relative z-10 space-y-6">
                         <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Esta Semana</h3>
                            <span className="text-[10px] font-black text-[#ffbe0b] uppercase tracking-widest bg-[#ffbe0b]/10 px-3 py-1 rounded-full border border-[#ffbe0b]/20">
                                En Vivo
                            </span>
                         </div>
                         
                         <div className="grid grid-cols-1 sm:grid-cols-7 gap-4">
                             {stats?.weekly?.map((day, idx) => {
                                 const height = day.total > 0 ? (day.present / day.total) * 100 : 0;
                                 return (
                                     <motion.div 
                                         key={idx}
                                         initial={{ opacity: 0, y: 20 }}
                                         animate={{ opacity: 1, y: 0 }}
                                         transition={{ delay: idx * 0.05 }}
                                         className="bg-black/20 border border-white/5 rounded-3xl p-5 flex flex-col items-center gap-4 group/bar"
                                     >
                                         <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                             {format(parseISO(day.fecha), "eee", { locale: es })}
                                         </span>
                                         <div className="flex-1 w-full flex items-end justify-center min-h-[120px] bg-black/40 rounded-full relative overflow-hidden">
                                              <div className="absolute inset-x-0 top-0 h-full bg-white/[0.02] -z-10" />
                                              <motion.div 
                                                 initial={{ height: 0 }}
                                                 animate={{ height: `${height}%` }}
                                                 className={clsx(
                                                     "w-full rounded-full transition-all duration-1000 relative",
                                                     height >= 80 ? "bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]" :
                                                     height >= 50 ? "bg-[#ffbe0b] shadow-[0_0_20px_rgba(255,190,11,0.4)]" :
                                                     "bg-[#bc1b1b] shadow-[0_0_20px_rgba(188,27,27,0.4)]"
                                                 )}
                                              >
                                                  <div className="absolute top-0 left-0 right-0 h-4 bg-white/20 rounded-full blur-sm" />
                                              </motion.div>
                                         </div>
                                         <div className="flex flex-col items-center">
                                             <span className="text-sm font-black text-white">{day.present}</span>
                                             <span className="text-[8px] font-bold text-gray-500 uppercase">/{day.total}</span>
                                         </div>
                                     </motion.div>
                                 );
                             })}
                             {(!stats?.weekly || stats.weekly.length === 0) && (
                                 <div className="col-span-full py-12 text-center bg-black/20 rounded-3xl border border-dashed border-white/10">
                                     <Calendar className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                                     <p className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">No hay actividad registrada esta semana</p>
                                 </div>
                             )}
                         </div>
                     </div>
                 )}
            </div>
        </div>
    );
}
