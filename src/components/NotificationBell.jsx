import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle2, Info, AlertTriangle, Clock, Ghost, Check, X, MousePointer2, Settings, ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import api from '../api';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationBell() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState('list'); // 'list' or 'settings'
    const [loading, setLoading] = useState(false);
    const [processingAction, setProcessingAction] = useState(null);
    const [actionFeedback, setActionFeedback] = useState({}); // { notifId: 'confirmed' | 'rejected' }
    const [preferences, setPreferences] = useState({
        pago: true,
        convocatoria: true,
        asistencia: true,
        general: true
    });
    const dropdownRef = useRef(null);

    useEffect(() => {
        loadUnreadCount();
        loadPreferences();
        const interval = setInterval(loadUnreadCount, 60000);
        
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setView('list');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            clearInterval(interval);
        };
    }, []);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const res = await api.get('/notificaciones');
            setNotifications(res.data);
        } catch (error) {
            console.error('Error cargando notificaciones:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadUnreadCount = async () => {
        try {
            const res = await api.get('/notificaciones/unread-count');
            setUnreadCount(res.data.count);
        } catch (error) {
            console.error('Error cargando contador:', error);
        }
    };

    const loadPreferences = async () => {
        try {
            const res = await api.get('/profile');
            if (res.data?.user?.preferencias_notificaciones) {
                setPreferences(prev => ({ ...prev, ...res.data.user.preferencias_notificaciones }));
            }
        } catch (error) {
            console.error('Error cargando preferencias:', error);
        }
    };

    const togglePreference = async (key) => {
        const newPrefs = { ...preferences, [key]: !preferences[key] };
        setPreferences(newPrefs);
        try {
            await api.post('/update-preferences', { preferences: newPrefs });
        } catch (error) {
            console.error('Error guardando preferencias:', error);
        }
    };

    const handleNotificationClick = async (notif) => {
        if (!notif.leido) {
            await markAsRead(notif.id_notificacion);
        }
        
        if (notif.ruta) {
            setIsOpen(false);
            navigate(notif.ruta);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notificaciones/${id}/leer`);
            setNotifications(prev => prev.map(n => n.id_notificacion === id ? { ...n, leido: true } : n));
            loadUnreadCount();
        } catch (error) {
            console.error('Error marcando como leída:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.post('/notificaciones/marcar-todas');
            setNotifications(prev => prev.map(n => ({ ...n, leido: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marcando todas como leídas:', error);
        }
    };

    const handleAction = async (e, notifId, referenceId, confirm) => {
        e.stopPropagation();
        setProcessingAction(notifId);
        try {
            await api.post('/convocatorias/responder', {
                id_convocatoria: referenceId,
                confirmado: confirm
            });
            
            // Feedback visual inmediato
            setActionFeedback(prev => ({ ...prev, [notifId]: confirm ? 'confirmed' : 'rejected' }));
            
            // Marcar como leída tras un breve delay para que vean el feedback
            setTimeout(() => {
                markAsRead(notifId);
            }, 1500);
            
        } catch (error) {
            console.error('Error procesando acción:', error);
        } finally {
            setProcessingAction(null);
        }
    };

    const hasPriorityNotifications = notifications.some(n => !n.leido && n.tipo === 'asistencia');

    const getIcon = (tipo, titulo) => {
        if (tipo === 'pago') return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
        if (tipo === 'convocatoria') return <Info className="w-4 h-4 text-blue-400" />;
        if (tipo === 'cancelacion') return <X className="w-4 h-4 text-red-500" />;
        if (tipo === 'asistencia') return <AlertTriangle className="w-4 h-4 text-amber-400" />;
        const t = titulo.toLowerCase();
        if (t.includes('pago')) return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
        return <Bell className="w-4 h-4 text-indigo-400" />;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => {
                    const newState = !isOpen;
                    setIsOpen(newState);
                    if (newState) {
                        setView('list');
                        loadNotifications();
                    }
                }}
                className="p-1.5 sm:p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all relative active:scale-95 group"
            >
                <Bell className={clsx("w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:rotate-12", isOpen && "text-indigo-400")} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 sm:h-5 sm:w-5">
                        <span className={clsx(
                            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                            hasPriorityNotifications ? "bg-amber-400" : "bg-red-400"
                        )}></span>
                        <span className={clsx(
                            "relative inline-flex rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-[#0f111a] items-center justify-center",
                            hasPriorityNotifications ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "bg-red-500"
                        )}>
                            <span className="text-[8px] sm:text-[10px] font-black text-white">{unreadCount > 9 ? '+9' : unreadCount}</span>
                        </span>
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-[320px] sm:w-[400px] bg-[#161b2c] border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden backdrop-blur-xl"
                    >
                        {view === 'list' ? (
                            <>
                                <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Notificaciones</h3>
                                        {unreadCount > 0 && (
                                            <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] font-black rounded-full">
                                                {unreadCount} NUEVAS
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={markAllAsRead}
                                            className="text-[10px] font-black text-gray-500 hover:text-indigo-400 uppercase tracking-widest transition-colors"
                                        >
                                            Leer todo
                                        </button>
                                        <button 
                                            onClick={() => setView('settings')}
                                            className="p-1.5 text-gray-500 hover:text-white bg-white/5 rounded-lg transition-all"
                                        >
                                            <Settings className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                    {loading && notifications.length === 0 ? (
                                        <div className="p-10 flex flex-col items-center justify-center gap-3">
                                            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sincronizando...</p>
                                        </div>
                                    ) : notifications.length === 0 ? (
                                        <div className="p-12 flex flex-col items-center justify-center text-center opacity-40">
                                            <Ghost className="w-12 h-12 text-gray-400 mb-4" />
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No hay nada por aquí</p>
                                            <p className="text-[10px] text-gray-600 mt-1 uppercase font-medium">Te avisaremos cuando pase algo importante</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-white/[0.03]">
                                            {notifications.map((n) => (
                                                <div 
                                                    key={n.id_notificacion}
                                                    onClick={() => handleNotificationClick(n)}
                                                    className={clsx(
                                                        "p-4 flex gap-4 transition-all cursor-pointer group relative",
                                                        !n.leido ? "bg-indigo-500/[0.03] hover:bg-indigo-500/[0.07]" : "hover:bg-white/[0.02]"
                                                    )}
                                                >
                                                    <div className={clsx(
                                                        "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border transition-all",
                                                        !n.leido 
                                                            ? "bg-indigo-500/10 border-indigo-500/20 shadow-lg shadow-indigo-500/10" 
                                                            : "bg-white/5 border-white/5 grayscale opacity-50"
                                                    )}>
                                                        {getIcon(n.tipo, n.titulo)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-0.5">
                                                            <h4 className={clsx(
                                                                "text-xs font-black truncate uppercase tracking-tight flex items-center gap-2",
                                                                !n.leido ? "text-white" : "text-gray-500"
                                                            )}>
                                                                {n.titulo}
                                                                {n.ruta && <MousePointer2 className="w-3 h-3 text-indigo-400 hidden group-hover:block" />}
                                                            </h4>
                                                            <span className="text-[8px] font-bold text-gray-600 uppercase flex items-center gap-1">
                                                                <Clock className="w-2.5 h-2.5" />
                                                                {new Date(n.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <p className={clsx(
                                                            "text-[10px] sm:text-xs leading-relaxed line-clamp-2",
                                                            !n.leido ? "text-gray-300 font-medium" : "text-gray-500"
                                                        )}>
                                                            {n.mensaje}
                                                        </p>
                                                        
                                                        {!n.leido && n.tipo === 'convocatoria' && (
                                                            <div className="mt-3 flex items-center gap-2">
                                                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                                                                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Actividad Programada</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 bg-white/[0.02] border-t border-white/5">
                                    <button 
                                        onClick={() => {
                                            setIsOpen(false);
                                            navigate('/dashboard/notificaciones');
                                        }}
                                        className="w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black text-gray-400 hover:text-white uppercase tracking-widest transition-all"
                                    >
                                        Ver todo el historial
                                    </button>
                                </div>
                            </>
                        ) : (
                            // Settings View (Silent Mode)
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-8">
                                    <button 
                                        onClick={() => setView('list')}
                                        className="p-2 hover:bg-white/5 rounded-xl transition-all"
                                    >
                                        <ArrowLeft className="w-4 h-4 text-gray-400" />
                                    </button>
                                    <div>
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Silent Mode</h3>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">Controla tus interrupciones</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        { id: 'pago', label: 'Pagos y Cobros', icon: CheckCircle2, iconColor: 'text-emerald-400' },
                                        { id: 'convocatoria', label: 'Nuevas Convocatorias', icon: Info, iconColor: 'text-blue-400' },
                                        { id: 'asistencia', label: 'Asistencia y Faltas', icon: AlertTriangle, iconColor: 'text-amber-400' },
                                        { id: 'general', label: 'Avisos Generales', icon: Bell, iconColor: 'text-indigo-400' },
                                    ].map((pref) => (
                                        <button 
                                            key={pref.id}
                                            onClick={() => togglePreference(pref.id)}
                                            className={clsx(
                                                "w-full flex items-center justify-between p-4 rounded-2xl border transition-all group",
                                                preferences[pref.id] 
                                                    ? "bg-white/5 border-white/5 hover:bg-white/10" 
                                                    : "bg-black/20 border-white/[0.02] opacity-50 grayscale hover:grayscale-0"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={clsx(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center bg-white/5",
                                                    preferences[pref.id] && pref.iconColor
                                                )}>
                                                    <pref.icon className="w-4 h-4" />
                                                </div>
                                                <span className="text-[10px] sm:text-xs font-bold text-gray-300 group-hover:text-white transition-colors">
                                                    {pref.label}
                                                </span>
                                            </div>
                                            {preferences[pref.id] ? (
                                                <div className="w-10 h-5 bg-indigo-500 rounded-full relative p-1 transition-colors">
                                                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                                                    <Volume2 className="w-2 h-2 text-white/50 absolute left-2 top-1.5" />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-5 bg-white/10 rounded-full relative p-1 transition-colors">
                                                    <div className="absolute left-1 top-1 w-3 h-3 bg-gray-500 rounded-full" />
                                                    <VolumeX className="w-2 h-2 text-gray-500 absolute right-2 top-1.5" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <p className="mt-8 text-[9px] text-center text-gray-600 font-bold uppercase leading-relaxed uppercase tracking-tighter">
                                    Los cambios se guardan automáticamente y se sincronizan con tus otros dispositivos.
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
