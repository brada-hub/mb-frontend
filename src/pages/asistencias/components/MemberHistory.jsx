import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, XCircle, Clock, AlertCircle, Flame, Activity } from 'lucide-react';
import api from '../../../api';
import clsx from 'clsx';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MemberHistory({ memberId }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        loadHistory();
    }, [memberId]);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/asistencias/member/${memberId}`);
            setData(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsApp = () => {
        const phone = data.member?.celular;
        if (!phone) return;
        
        let message = `¡Hola ${data.member.nombres}! Te saluda el director de la banda. `;
        if (data.stats.streak >= 3) {
            message += `¡Felicidades por tu racha de ${data.stats.streak} asistencias! 🔥 Sigue así.`;
        } else if (data.stats.attendance_rate < 50) {
            message += `Notamos que has faltado últimamente (${data.stats.attendance_rate}% asistencia). ¿Está todo bien?`;
        } else {
            message += `Revisando el historial de asistencias. ¡Gracias por tu compromiso!`;
        }

        window.open(`https://wa.me/591${phone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    if (loading) return (
        <div className="p-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-white/20 border-t-brand-primary rounded-full animate-spin"></div>
        </div>
    );

    if (!data) return null;

    return (
        <div className="p-5 bg-[#0a0d14] rounded-2xl mt-3 border border-indigo-500/10 space-y-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
            
            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-3 relative z-10">
                <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center transition-all hover:bg-white/[0.08]">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Ritmo</p>
                    <div className="relative">
                        <p className="text-xl font-black text-white">{data.stats?.attendance_rate}%</p>
                        <div className="w-12 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${data.stats?.attendance_rate}%` }}
                                className={clsx(
                                    "h-full rounded-full",
                                    data.stats?.attendance_rate >= 80 ? "bg-green-500" :
                                    data.stats?.attendance_rate >= 50 ? "bg-yellow-500" : "bg-red-500"
                                )}
                            />
                        </div>
                    </div>
                </div>
                
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-3 flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95">
                    <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest mb-1">Racha</p>
                    <div className="flex items-center gap-1">
                        <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                        <p className="text-2xl font-black text-orange-400">{data.stats?.streak}</p>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center transition-all hover:bg-white/[0.08]">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Total</p>
                    <p className="text-xl font-black text-white">{data.stats?.total_events}</p>
                </div>
            </div>

            {/* Recent History List */}
            <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between px-1">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Actividad Reciente</p>
                    <Activity className="w-3 h-3 text-indigo-500/50" />
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-2">
                    {data.history.map((event, idx) => (
                        <motion.div 
                            key={event.id_evento} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-center justify-between p-3 bg-white/[0.03] hover:bg-white/[0.06] rounded-xl border border-white/5 transition-colors group"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate">{event.evento}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <Clock className="w-3 h-3 text-gray-600" />
                                    <p className="text-[10px] text-gray-500 font-medium">
                                        {format(parseISO(event.fecha), "eeee dd 'de' MMM", { locale: es })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {event.estado === 'PUNTUAL' && <span className="text-[8px] bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-1 rounded-lg font-black uppercase tracking-tighter">Puntual</span>}
                                {event.estado === 'RETRASO' && <span className="text-[8px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-1 rounded-lg font-black uppercase tracking-tighter">Retraso</span>}
                                {event.estado === 'FALTA' && <span className="text-[8px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-1 rounded-lg font-black uppercase tracking-tighter">Falta</span>}
                                {event.estado === 'JUSTIFICADO' && <span className="text-[8px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-1 rounded-lg font-black uppercase tracking-tighter">Permiso</span>}
                                {!event.estado && <span className="text-[8px] text-gray-600 font-extrabold uppercase">Sin Marcar</span>}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
            
            {/* Action Buttons */}
            <div className="relative z-10">
                <motion.button 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleWhatsApp}
                    className="w-full py-3.5 bg-green-500 hover:bg-green-400 text-[#0a0d14] rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-green-500/20 transition-all border-b-4 border-green-700 active:border-b-0 active:translate-y-1"
                >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Contactar vía WhatsApp
                </motion.button>
            </div>
        </div>
    );
}
