import { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Info, AlertTriangle, Clock, Trash2, Ghost } from 'lucide-react';
import api from '../../api';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { SkeletonList } from '../../components/ui/skeletons/Skeletons';

export default function NotificationsList() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const res = await api.get('/notificaciones');
            setNotifications(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notificaciones/${id}/leer`);
            setNotifications(prev => prev.map(n => n.id_notificacion === id ? { ...n, leido: true } : n));
        } catch (error) {
            console.error(error);
        }
    };

    const getIcon = (titulo) => {
        const t = titulo.toLowerCase();
        if (t.includes('pago') || t.includes('dinero') || t.includes('cobro')) return <CheckCircle2 className="w-6 h-6 text-emerald-400" />;
        if (t.includes('convocatoria') || t.includes('evento')) return <Info className="w-6 h-6 text-blue-400" />;
        if (t.includes('falta') || t.includes('atención') || t.includes('crítica')) return <AlertTriangle className="w-6 h-6 text-amber-400" />;
        return <Bell className="w-6 h-6 text-indigo-400" />;
    };

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto space-y-6 pt-10 px-4">
                 <SkeletonList items={6} />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Notificaciones</h1>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Historial completo de alertas</p>
                </div>
            </div>

            {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-surface-card border border-white/5 rounded-[2.5rem] opacity-50">
                    <Ghost className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-bold text-white uppercase italic tracking-tighter">Bandeja Vacía</h3>
                    <p className="text-gray-500 text-xs mt-1">No tienes notificaciones registradas todavía.</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {notifications.map((n, idx) => (
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={n.id_notificacion}
                            onClick={() => !n.leido && markAsRead(n.id_notificacion)}
                            className={clsx(
                                "bg-surface-card border p-5 rounded-[2rem] flex items-center gap-5 transition-all cursor-pointer group",
                                !n.leido 
                                    ? "border-indigo-500/30 bg-indigo-500/[0.03] shadow-lg shadow-indigo-500/5" 
                                    : "border-white/5 opacity-70 hover:opacity-100"
                            )}
                        >
                            <div className={clsx(
                                "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border",
                                !n.leido ? "bg-indigo-500/10 border-indigo-500/20" : "bg-white/5 border-white/5"
                            )}>
                                {getIcon(n.titulo)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className={clsx(
                                        "font-black uppercase tracking-tight text-sm sm:text-base",
                                        !n.leido ? "text-white" : "text-gray-400"
                                    )}>
                                        {n.titulo}
                                    </h4>
                                    <span className="text-[10px] font-bold text-gray-600 uppercase flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5" />
                                        {new Date(n.created_at).toLocaleString()}
                                    </span>
                                </div>
                                <p className={clsx(
                                    "text-xs sm:text-sm leading-relaxed",
                                    !n.leido ? "text-gray-300" : "text-gray-500"
                                )}>
                                    {n.mensaje}
                                </p>
                            </div>

                            {!n.leido && (
                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
