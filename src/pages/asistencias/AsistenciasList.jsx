import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Calendar, Clock, Users, CheckCircle2, XCircle, AlertCircle, 
    MapPin, ChevronRight, Check, X, Timer, UserCheck, UserX,
    RefreshCw, Save, ArrowRight, ArrowLeft, Filter, Zap, ChevronDown, ListCheck, ArrowLeftCircle, FileText,
    Shield, Music2, Lock, Unlock, UserPlus
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import api from '../../api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';
import MemberHistory from './components/MemberHistory';
import { Search } from 'lucide-react';
import ConfirmModal from '../../components/modals/ConfirmModal';
import { SkeletonList, SkeletonAsistencia } from '../../components/ui/skeletons/Skeletons';

const getEstadoClasses = (estado) => {
    const normalized = (estado === 'PUNTUAL' || estado === 'RETRASO') ? 'PRESENTE' : estado;
    switch (normalized) {
        case 'PRESENTE':
            return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30';
        case 'FALTA':
            return 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30';
        case 'JUSTIFICADO':
            return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30';
        default:
            return 'bg-black/5 dark:bg-white/5 text-gray-400 border-gray-300 dark:border-white/10';
    }
};

const getEstadoIcon = (estado) => {
    const normalized = (estado === 'PUNTUAL' || estado === 'RETRASO') ? 'PRESENTE' : estado;
    switch (normalized) {
        case 'PRESENTE': return <Check className="w-4 h-4" />;
        case 'FALTA': return <X className="w-4 h-4" />;
        case 'JUSTIFICADO': return <AlertCircle className="w-4 h-4" />;
        default: return null;
    }
};

const SwipeableAsistenciaItem = ({ conv, estadoActual, handleMarcarEstado, puedeMarcar, onReemplazar, isAdmin, isDirector }) => {
    const x = useMotionValue(0);
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Background based on swipe direction
    const background = useTransform(
        x,
        [-100, 0, 100],
        ["#ef4444", "rgba(0,0,0,0)", "#22c55e"]
    );
    
    const iconLeftOpacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0]);
    const iconRightOpacity = useTransform(x, [0, 50, 100], [0, 0.5, 1]);
    const iconScale = useTransform(x, [-100, 0, 100], [1.2, 0.8, 1.2]);

    const handleDragStart = () => {
        if (timer) clearTimeout(timer);
        setIsLongPressing(false);
    };

    const handleDragEnd = (_, info) => {
        if (timer) clearTimeout(timer);
        setIsLongPressing(false);
        
        if (!puedeMarcar) return;
        if (info.offset.x > 80) {
            handleMarcarEstado(conv.id_convocatoria, 'PRESENTE');
        } else if (info.offset.x < -80) {
            handleMarcarEstado(conv.id_convocatoria, 'FALTA');
        }
    };

    // Long Press for "Permiso" (JUSTIFICADO)
    const [isLongPressing, setIsLongPressing] = useState(false);
    const [timer, setTimer] = useState(null);

    const onPointerDown = () => {
        if (!puedeMarcar) return;
        setIsLongPressing(true);
        const t = setTimeout(() => {
            handleMarcarEstado(conv.id_convocatoria, 'JUSTIFICADO');
            if (window.navigator.vibrate) window.navigator.vibrate(40);
            setIsLongPressing(false);
        }, 600);
        setTimer(t);
    };

    const onPointerUp = () => {
        if (timer) clearTimeout(timer);
        setIsLongPressing(false);
    };

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20, height: 0 }}
            transition={{ duration: 0.2 }}
            className="relative overflow-hidden select-none touch-pan-y"
        >
            {/* Action Indicators (Below) */}
            <motion.div 
                style={{ background }}
                className="absolute inset-0 flex items-center justify-between px-8 z-0"
            >
                <motion.div style={{ opacity: iconLeftOpacity, scale: iconScale }} className="flex flex-col items-center gap-1">
                    <X className="w-6 h-6 text-white" />
                    <span className="text-[10px] font-black text-white uppercase">FALTA</span>
                </motion.div>
                <motion.div style={{ opacity: iconRightOpacity, scale: iconScale }} className="flex flex-col items-center gap-1">
                    <Check className="w-6 h-6 text-white" />
                    <span className="text-[10px] font-black text-white uppercase">PRESENTE</span>
                </motion.div>
            </motion.div>

            {/* Main Row */}
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                style={{ x }}
                className={clsx(
                    "relative z-10 p-2 sm:p-3 border-b border-surface-border transition-all duration-300",
                    isLongPressing ? "bg-blue-500/20 scale-[0.98] shadow-inner" : "bg-surface-card hover:bg-black/[0.02] dark:hover:bg-white/[0.02]",
                    estadoActual === 'PRESENTE' && !isLongPressing && "bg-green-500/[0.04]",
                    estadoActual === 'FALTA' && !isLongPressing && "bg-red-500/[0.04]",
                    estadoActual === 'JUSTIFICADO' && !isLongPressing && "bg-blue-500/[0.04]"
                )}
            >
                <div>
                    <div className="flex items-center justify-between gap-3">
                        <div 
                            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                            onClick={(e) => {
                                // Prevent expansion if dragging
                                if (x.get() !== 0) return;
                                setIsExpanded(!isExpanded);
                            }}
                        >
                            <div className={clsx(
                                "w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-[10px] sm:text-xs border transition-all duration-500",
                                estadoActual ? getEstadoClasses(estadoActual) : "bg-white/5 text-gray-500 border-white/10"
                            )}>
                                {estadoActual ? getEstadoIcon(estadoActual) : conv.miembro?.nombres?.charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate leading-tight flex items-center gap-2 transition-colors">
                                    {conv.miembro?.nombres} {conv.miembro?.apellidos}
                                    {isExpanded && <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-500" />}
                                </p>
                                <div className="flex flex-col">
                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider leading-tight flex items-center gap-2">
                                        {conv.miembro?.instrumento?.instrumento}
                                        {conv.miembro?.seccion && ` • ${conv.miembro.seccion.seccion}`}
                                        {conv.asistencia?.latitud_marcado && (
                                            <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-md text-[7px] font-black border border-indigo-500/20 transition-colors">
                                                <MapPin className="w-2 h-2" /> GPS
                                            </span>
                                        )}
                                        {!puedeMarcar && (
                                            <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400 bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded-md text-[7px] font-black border border-gray-200 dark:border-white/10 transition-colors">
                                                <Shield className="w-2 h-2" /> PROTEGIDO
                                            </span>
                                        )}
                                    </p>
                                    {conv.asistencia?.estado && estadoActual !== conv.asistencia.estado && (
                                        <p className="text-[7px] text-yellow-500 font-black uppercase tracking-tighter mt-0.5">
                                            Pendiente (Original: {conv.asistencia.estado})
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Botón Reemplazar (Solo Admin/Director) */}
                        {(isAdmin || isDirector) && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onReemplazar(conv);
                                }}
                                className="p-1.5 sm:p-2 bg-black/5 dark:bg-white/5 hover:bg-brand-primary/10 text-gray-500 hover:text-brand-primary rounded-lg sm:rounded-xl transition-all border border-gray-200 dark:border-white/5 hover:border-brand-primary/20 group/rep"
                                title="Reemplazar por Suplente"
                            >
                                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:rotate-180 transition-transform duration-500" />
                            </button>
                        )}
                    </div>
                    
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div onClick={(e) => e.stopPropagation()}>
                                    <MemberHistory memberId={conv.miembro.id_miembro} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default function AsistenciasList() {
    const navigate = useNavigate();
    const { notify } = useToast();
    const { user } = useAuth();

    const roleName = user?.role?.toUpperCase() || '';
    const isJefe = roleName.includes('JEFE');
    const miInstrumento = user?.miembro?.id_instrumento;
    const isDirector = roleName === 'DIRECTOR';
    const isAdmin = roleName === 'ADMIN' || roleName === 'SUPER_ADMIN';
    const hasFullAccess = isAdmin || isDirector;
    
    const [eventosHoy, setEventosHoy] = useState([]);
    const [selectedEvento, setSelectedEvento] = useState(null);
    const [listaAsistencia, setListaAsistencia] = useState([]);
    const [asistenciasTemp, setAsistenciasTemp] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadingLista, setLoadingLista] = useState(false);
    const [saving, setSaving] = useState(false);
    const [puedeMarcar, setPuedeMarcar] = useState(false);
    const [instrumentos, setInstrumentos] = useState([]);
    const [selectedInstrumento, setSelectedInstrumento] = useState('TODOS');

    const [snackbar, setSnackbar] = useState({ show: false, message: '', id: null, originalStatus: null });
    const pendingTimers = useRef({}); // Stores id_convocatoria -> timeoutId
    const prevStatusRef = useRef({}); // Stores id_convocatoria -> last status before change

    // UI States
    const [activeTab, setActiveTab] = useState('PENDIENTES'); // PENDIENTES, RESUMEN

    const [ searchTerm, setSearchTerm] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isActionsOpen, setIsActionsOpen] = useState(false);

    // Modal Permiso
    const [showPermisoModal, setShowPermisoModal] = useState(false);
    const [selectedConvPermiso, setSelectedConvPermiso] = useState(null);
    const [motivoPermiso, setMotivoPermiso] = useState('');

    // Modal Reemplazo
    const [showReemplazoModal, setShowReemplazoModal] = useState(false);
    const [selectedConvReemplazo, setSelectedConvReemplazo] = useState(null);
    const [searchReemplazo, setSearchReemplazo] = useState('');
    const [miembrosDisponibles, setMiembrosDisponibles] = useState([]);
    const [loadingReemplazo, setLoadingReemplazo] = useState(false);

    // Modal Cierre Asistencia
    const [showCierreModal, setShowCierreModal] = useState(false);
    const [eventoACerrar, setEventoACerrar] = useState(null);
    const [loadingCierre, setLoadingCierre] = useState(false);

    useEffect(() => {
        loadEventosHoy();
    }, []);

    const loadEventosHoy = async () => {
        setLoading(true);
        try {
            const res = await api.get('/asistencia/eventos-hoy');
            setEventosHoy(res.data);
        } catch (error) {
            console.error(error);
            notify('Error al cargar eventos del día', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadListaAsistencia = async (id_evento) => {
        setLoadingLista(true);
        try {
            const res = await api.get(`/asistencia/lista/${id_evento}`);
            setListaAsistencia(res.data.convocatorias);
            setInstrumentos(res.data.instrumentos || []);
            setPuedeMarcar(res.data.puede_marcar);
            
            // Inicializar estado temporal con las asistencias existentes
            const temp = {};
            res.data.convocatorias.forEach(c => {
                temp[c.id_convocatoria] = c.asistencia?.estado || null;
            });
            setAsistenciasTemp(temp);
        } catch (error) {
            console.error(error);
            notify('Error al cargar lista de asistencia', 'error');
        } finally {
            setLoadingLista(false);
        }
    };

    const handleSelectEvento = (evento) => {
        setSelectedEvento(evento);
        loadListaAsistencia(evento.id_evento);
    };

    const handleMarcarPropia = async () => {
        if (!selectedEvento) return;
        setSaving(true);
        try {
            // Get location
            const pos = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            const res = await api.post('/asistencia/marcar', {
                id_evento: selectedEvento.id_evento,
                latitud: pos.coords.latitude,
                longitud: pos.coords.longitude
            });

            notify(res.data.message || 'Asistencia marcada correctamente', 'success');
            // Reload list to show the new status
            loadListaAsistencia(selectedEvento.id_evento);
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Error al marcar asistencia. Asegúrate de activar el GPS.';
            notify(msg, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleEnviarRecordatorios = async () => {
        if (!selectedEvento) return;
        setLoadingLista(true);
        try {
            const res = await api.post('/asistencia/recordatorio', { id_evento: selectedEvento.id_evento });
            // Mostrar toast o mensaje de éxito
            alert(res.data.message);
        } catch (error) {
            console.error('Error enviando recordatorios:', error);
            alert('Error al enviar recordatorios');
        } finally {
            setLoadingLista(false);
        }
    };

    const syncAsistencia = async (id_convocatoria, estado, observacion = null) => {
        try {
            await api.post('/asistencia/marcar-manual', {
                id_convocatoria,
                estado,
                observacion
            });
            // Recordar el estado guardado para que permanezca al recargar localmente si es necesario
            setListaAsistencia(prev => prev.map(c => 
                c.id_convocatoria === id_convocatoria 
                    ? { ...c, asistencia: { ...c.asistencia, estado, observacion } }
                    : c
            ));
        } catch (error) {
            console.error(error);
            notify('Error al sincronizar asistencia', 'error');
        }
    };

    const handleMarcarEstado = (id_convocatoria, estado) => {
        if (!puedeMarcar) {
            notify('El control de asistencia no está habilitado aún', 'warning');
            return;
        }

        const conv = listaAsistencia.find(c => c.id_convocatoria === id_convocatoria);
        if (!conv) return;

        // --- RESTRICCIONES PERMISO ---
        if (estado === 'JUSTIFICADO') {
             if (!hasFullAccess) {
                 notify('Solo el Director o Administrador pueden otorgar permisos', 'error');
                 return;
             }
             // Abrir modal de motivo
             setSelectedConvPermiso(id_convocatoria);
             setMotivoPermiso('');
             setShowPermisoModal(true);
             return; // El proceso sigue en handleConfirmPermiso
        }

        // --- RESTRICCIONES GPS (Para todos menos ADMIN) ---
        if (!isAdmin && conv.asistencia?.latitud_marcado) {
            notify('No puedes modificar una asistencia registrada legítimamente vía GPS', 'error');
            return;
        }

        // --- RESTRICCIONES JEFE ---
        if (isJefe && !isDirector && !isAdmin) {
            // 1. Solo su instrumento
            if (conv.miembro?.id_instrumento !== miInstrumento) {
                notify('Solo puedes marcar asistencia a integrantes de tu instrumento', 'error');
                return;
            }
        }

        const currentStatus = asistenciasTemp[id_convocatoria];
        if (currentStatus === estado) return; // No change

        // Save for undo
        prevStatusRef.current[id_convocatoria] = currentStatus;
        
        // Optimistic UI Update
        setAsistenciasTemp(prev => ({ ...prev, [id_convocatoria]: estado }));

        // Clear existing timer if user swiped again quickly
        if (pendingTimers.current[id_convocatoria]) {
            clearTimeout(pendingTimers.current[id_convocatoria]);
        }

        // Show Snackbar
        setSnackbar({
            show: true,
            message: `${conv?.miembro?.nombres} marcado como ${estado}`,
            id: id_convocatoria,
            originalStatus: currentStatus
        });

        // Setup Sync Timer (Buffer de 2 segundos)
        pendingTimers.current[id_convocatoria] = setTimeout(() => {
            syncAsistencia(id_convocatoria, estado);
            setSnackbar(prev => prev.id === id_convocatoria ? { ...prev, show: false } : prev);
            delete pendingTimers.current[id_convocatoria];
        }, 2500);
    };

    const handleOpenReemplazo = async (conv) => {
        if (!hasFullAccess) {
            notify('Solo el Director o Administrador pueden realizar reemplazos', 'error');
            return;
        }
        setSelectedConvReemplazo(conv);
        setSearchReemplazo('');
        setMiembrosDisponibles([]);
        setShowReemplazoModal(true);
        
        try {
            setLoadingReemplazo(true);
            const res = await api.get(`/convocatorias/disponibles?id_evento=${selectedEvento.id_evento}&id_instrumento=${conv.miembro?.id_instrumento}`);
            setMiembrosDisponibles(res.data);
        } catch (error) {
            notify('Error al cargar músicos disponibles', 'error');
        } finally {
            setLoadingReemplazo(false);
        }
    };

    const handleConfirmReemplazo = async (id_nuevo_miembro) => {
        try {
            const res = await api.post('/convocatorias/reemplazar', {
                id_convocatoria: selectedConvReemplazo.id_convocatoria,
                id_nuevo_miembro
            });
            
            // Actualizar lista local (reemplazar por el nuevo registro retornado)
            setListaAsistencia(prev => prev.map(c => 
                c.id_convocatoria === selectedConvReemplazo.id_convocatoria ? res.data : c
            ));

            // Resetear asistencia temporal si había algo
            setAsistenciasTemp(prev => {
                const updated = { ...prev };
                delete updated[selectedConvReemplazo.id_convocatoria];
                updated[res.data.id_convocatoria] = null;
                return updated;
            });
            
            notify('Músico reemplazado correctamente', 'success');
            setShowReemplazoModal(false);
        } catch (error) {
            notify(error.response?.data?.message || 'Error al reemplazar', 'error');
        }
    };

    const handleCerrarAsistencia = (eventoObjetivo = null) => {
        if (!hasFullAccess) return;
        const target = eventoObjetivo || selectedEvento;
        if (!target) return;

        setEventoACerrar(target);
        setShowCierreModal(true);
    };

    const handleConfirmCierre = async () => {
        if (!eventoACerrar) return;
        
        setLoadingCierre(true);
        try {
            await api.post('/asistencia/cerrar', { id_evento: eventoACerrar.id_evento });
            notify('Asistencia cerrada correctamente', 'success');
            
            // Si es el evento seleccionado actualmente, recargar
            if (selectedEvento?.id_evento === eventoACerrar.id_evento) {
                loadListaAsistencia(eventoACerrar.id_evento);
                setSelectedEvento(prev => ({ ...prev, puede_marcar_asistencia: false, asistencia_cerrada: true }));
            }
            
            // Actualizar lista de eventos del día
            setEventosHoy(prev => prev.map(e => 
                e.id_evento === eventoACerrar.id_evento 
                    ? { ...e, puede_marcar_asistencia: false, asistencia_cerrada: true } 
                    : e
            ));
            
            setShowCierreModal(false);
            setEventoACerrar(null);
        } catch (error) {
            console.error(error);
            notify('Error al cerrar asistencia', 'error');
        } finally {
            setLoadingCierre(false);
        }
    };

    const handleUndo = () => {
        const { id, originalStatus } = snackbar;
        if (!id) return;

        // Restore State
        setAsistenciasTemp(prev => ({ ...prev, [id]: originalStatus }));
        
        // Cancel Sync
        if (pendingTimers.current[id]) {
            clearTimeout(pendingTimers.current[id]);
            delete pendingTimers.current[id];
        }

        setSnackbar({ show: false, message: '', id: null, originalStatus: null });
        notify('Cambio deshecho', 'info');
    };

    const handleConfirmPermiso = () => {
        if (!motivoPermiso.trim()) {
            notify('Debes ingresar un motivo para el permiso', 'warning');
            return;
        }
        
        const id = selectedConvPermiso;
        const currentStatus = asistenciasTemp[id];
        
        prevStatusRef.current[id] = currentStatus;
        setAsistenciasTemp(prev => ({ ...prev, [id]: 'JUSTIFICADO' }));
        
        const conv = listaAsistencia.find(c => c.id_convocatoria === id);
        setSnackbar({
            show: true,
            message: `${conv?.miembro?.nombres} con permiso registrado`,
            id: id,
            originalStatus: currentStatus
        });

        pendingTimers.current[id] = setTimeout(() => {
            syncAsistencia(id, 'JUSTIFICADO', motivoPermiso);
            setSnackbar(prev => prev.id === id ? { ...prev, show: false } : prev);
            delete pendingTimers.current[id];
        }, 2500);

        setShowPermisoModal(false);
    };

    const handleMarcarTodos = (estado) => {
        if (!puedeMarcar) {
            notify('El control de asistencia no está habilitado aún', 'warning');
            return;
        }

        if (estado === 'JUSTIFICADO' && !hasFullAccess) {
             notify('No tienes permisos para otorgar permisos masivos', 'error');
             return;
        }

        const filteredList = selectedInstrumento === 'TODOS' 
            ? listaAsistencia 
            : listaAsistencia.filter(c => c.miembro?.instrumento?.id_instrumento === parseInt(selectedInstrumento));

        const batch = [];
        const newTemp = { ...asistenciasTemp };

        filteredList.forEach(c => {
            const id = c.id_convocatoria;
            
            // Restricción GPS masiva (Menos ADMIN)
            if (!isAdmin && c.asistencia?.latitud_marcado) return;

            // Restricción Jefe en masivo
            if (isJefe && !isDirector && !isAdmin) {
                if (c.miembro?.id_instrumento !== miInstrumento) return;
            }
            
            if (newTemp[id] !== estado) {
                newTemp[id] = estado;
                batch.push({ id_convocatoria: id, estado });
            }
        });

        if (batch.length === 0) {
            if (isJefe) notify('No tienes integrantes pendientes o permitidos para marcado masivo en esta selección', 'info');
            return;
        }

        setAsistenciasTemp(newTemp);
        
        // Massive update uses marcar-masivo for efficiency
        api.post('/asistencia/marcar-masivo', {
            id_evento: selectedEvento.id_evento,
            asistencias: batch
        }).then(() => {
            notify(`Marcados ${batch.length} como ${estado}`, 'success');
        }).catch(() => notify('Error en marcado masivo', 'error'));
    };



    // Estadísticas temporales (Filtradas por permiso)
    const filteredStatsList = listaAsistencia.filter(c => 
        hasFullAccess || (isJefe && c.miembro?.id_instrumento === miInstrumento)
    );

    const stats = {
        total: filteredStatsList.length,
        puntuales: filteredStatsList.filter(c => asistenciasTemp[c.id_convocatoria] === 'PRESENTE').length,
        permisos: filteredStatsList.filter(c => asistenciasTemp[c.id_convocatoria] === 'JUSTIFICADO').length,
        faltas: filteredStatsList.filter(c => asistenciasTemp[c.id_convocatoria] === 'FALTA').length,
        sinMarcar: filteredStatsList.filter(c => asistenciasTemp[c.id_convocatoria] === null).length
    };

    // Lógica para detectar si el usuario (si es Jefe) ya marcó su propia asistencia
    const miAsistenciaEnEvento = listaAsistencia.find(c => c.id_miembro === user?.miembro?.id_miembro);
    const jefeYaMarco = miAsistenciaEnEvento?.asistencia && ['PUNTUAL', 'RETRASO', 'PRESENTE'].includes(miAsistenciaEnEvento.asistencia.estado);
    const jefeBloqueado = isJefe && !hasFullAccess && !jefeYaMarco;

    if (loading) {
        return <SkeletonAsistencia />;
    }

    return (
        <div className="space-y-4 sm:space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between pb-1 sm:pb-2">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter transition-colors">Asistencias</h1>
                {(isAdmin || isDirector) && (
                    <button 
                        onClick={() => navigate('/dashboard/asistencia/reporte')}
                        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all border border-surface-border"
                    >
                        <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-500" />
                        Reporte
                    </button>
                )}
            </div>

            {/* Layout Principal */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                
                {/* Pantalla A: Lista de Eventos del Día */}
                <div className={clsx(
                    "xl:col-span-4 space-y-4",
                    selectedEvento && "hidden xl:block animate-out slide-out-to-left duration-300"
                )}>
                    {eventosHoy.length === 0 ? (
                        <div className="bg-surface-card border border-surface-border rounded-3xl p-8 text-center transition-colors">
                            <Calendar className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4 transition-colors" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium transition-colors">No hay eventos programados hoy</p>
                            <p className="text-gray-400 dark:text-gray-600 text-sm mt-2 transition-colors">Los eventos aparecerán cuando llegue su fecha</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {eventosHoy.map(evento => {
                                const isSelected = selectedEvento?.id_evento === evento.id_evento;
                                const puedeAbrir = evento.puede_marcar_asistencia;
                                const minutosParaInicio = evento.minutos_para_inicio;
                                
                                return (
                                    <motion.div
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        key={evento.id_evento}
                                        onClick={() => handleSelectEvento(evento)}
                                        className={`w-full text-left p-3 sm:p-4 rounded-xl border transition-all cursor-pointer ${
                                            isSelected 
                                                ? 'bg-brand-primary/10 border-brand-primary/40 shadow-lg shadow-brand-primary/5' 
                                                : 'bg-surface-card border-surface-border hover:border-gray-300 dark:hover:border-white/10'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${
                                                evento.tipo?.evento === 'ENSAYO' ? 'bg-blue-500/20 text-blue-400' :
                                                evento.tipo?.evento === 'PRESENTACION' ? 'bg-purple-500/20 text-purple-400' :
                                                'bg-white/10 text-gray-400'
                                            }`}>
                                                {evento.tipo?.evento}
                                            </span>
                                            
                                            {(() => {
                                                if (evento.asistencia_cerrada) return (
                                                    <span className="flex items-center gap-1 text-[8px] font-black text-red-500 uppercase">
                                                        <Lock className="w-2 h-2" /> CERRADO
                                                    </span>
                                                );
                                                if (puedeAbrir) return (
                                                    <span className="flex items-center gap-1 text-[8px] font-black text-green-500 uppercase">
                                                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                                                        ABIERTO
                                                    </span>
                                                );
                                                const mins = Math.round(minutosParaInicio);
                                                if (mins > 0) {
                                                    return (
                                                        <span className="flex items-center gap-1 text-[8px] font-black text-blue-400 uppercase">
                                                            <Clock className="w-2 h-2" /> EN ESPERA
                                                        </span>
                                                    );
                                                }
                                                return (
                                                    <span className="flex items-center gap-1 text-[8px] font-black text-red-500 uppercase">
                                                        <Lock className="w-2 h-2" /> CERRADO
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                        
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 truncate transition-colors">{evento.evento}</h3>
                                        
                                        <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                            <div className="flex items-center gap-3">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {evento.hora?.substr(0, 5)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {evento.convocatorias?.length || 0}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {/* Botón Cerrar en Tarjeta (Solo Admin/Director Active) */}
                                                {puedeAbrir && !evento.asistencia_cerrada && hasFullAccess && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            // Set selected first to ensure context
                                                            if (selectedEvento?.id_evento !== evento.id_evento) {
                                                                handleSelectEvento(evento);
                                                            }
                                                            // Trigger close logic (small delay to allow state update if needed, though handleCerrarAsistencia uses selectedEvento from state, so we might need to pass it or ensure state is set)
                                                            // Better: Modify handleCerrarAsistencia to accept an event argument.
                                                            // For now, let's just use the direct API call here or assume selected works.
                                                            // Actually, let's just make the button stop propagation and open the detail view? No, the user wants it "outside".
                                                            // Let's modify handleCerrarAsistencia to take an optional event.
                                                            handleCerrarAsistencia(evento); 
                                                        }}
                                                        className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                                        title="Cerrar Asistencia"
                                                    >
                                                        <Lock className="w-3 h-3" />
                                                    </button>
                                                )}
                                                <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-90 text-brand-primary' : 'text-gray-700'}`} />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Pantalla B: Panel de Control de Asistencia */}
                <div className={clsx(
                    "xl:col-span-8",
                    !selectedEvento && "hidden xl:block"
                )}>
                    {!selectedEvento ? (
                        <div className="bg-surface-card border border-surface-border rounded-3xl p-12 text-center h-full flex flex-col items-center justify-center min-h-[400px] transition-colors">
                            <UserCheck className="w-20 h-20 text-gray-400 dark:text-gray-700 mb-6 transition-colors" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Selecciona un Evento</h3>
                            <p className="text-gray-500 dark:text-gray-500 max-w-md transition-colors">
                                Elige un evento de la lista para iniciar el control de asistencia
                            </p>
                        </div>
                    ) : (
                        <div className="bg-surface-card border border-surface-border rounded-3xl overflow-hidden animate-in slide-in-from-right duration-500 transition-colors">
                            {/* Header Pegajoso (Sticky) - Solid background to prevent overlap */}
                            <div className="sticky top-0 z-40 bg-white dark:bg-[#1e2335] border-b border-surface-border p-3 sm:p-6 shadow-lg transition-colors">
                                <div className="flex items-center justify-between mb-3 xl:hidden">
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => setSelectedEvento(null)}
                                            className="text-indigo-400 hover:text-white transition-colors"
                                        >
                                            <ArrowLeftCircle className="w-7 h-7" />
                                        </button>
                                        <div className="bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                                            <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">CONTROL</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                                        <div className="flex items-center gap-1 text-[8px] font-black text-indigo-400/60 uppercase whitespace-nowrap">
                                            <ArrowRight className="w-2.5 h-2.5"/> Presente
                                        </div>
                                        <div className="flex items-center gap-1 text-[8px] font-black text-red-400/60 uppercase whitespace-nowrap">
                                            <ArrowLeft className="w-2.5 h-2.5"/> Falta
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm sm:text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter truncate leading-tight transition-colors">{selectedEvento.evento}</h3>
                                        <div className="flex items-center gap-2 text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                                            <Clock className="w-3 h-3" />
                                            {selectedEvento.hora?.substr(0, 5)}
                                            {!puedeMarcar && (
                                                <span className="text-yellow-500/80 flex items-center gap-1">
                                                    <Lock className="w-3 h-3" />
                                                    Cerrado
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 relative">
                                        <div className="relative">
                                            {hasFullAccess ? (
                                                <>
                                                    <button 
                                                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                                                        className={clsx(
                                                            "h-10 px-3 rounded-xl border flex items-center gap-2 transition-all text-[10px] font-black uppercase tracking-widest",
                                                            selectedInstrumento !== 'TODOS' 
                                                                ? "bg-brand-primary border-brand-primary text-white" 
                                                                : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                                        )}
                                                    >
                                                        <Filter className="w-3.5 h-3.5" />
                                                        <span className="hidden sm:inline">Sección</span>
                                                        <ChevronDown className={clsx("w-3 h-3 transition-transform", isFilterOpen && "rotate-180")} />
                                                    </button>

                                                    <AnimatePresence>
                                                        {isFilterOpen && (
                                                            <motion.div 
                                                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                                className="absolute right-0 top-full mt-2 w-48 bg-[#1e2335] border border-white/10 rounded-2xl shadow-2xl z-50 p-2 overflow-hidden"
                                                            >
                                                                <button 
                                                                    onClick={() => { setSelectedInstrumento('TODOS'); setIsFilterOpen(false); }}
                                                                    className={clsx(
                                                                        "w-full text-left p-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors",
                                                                        selectedInstrumento === 'TODOS' ? "bg-white/10 text-white" : "text-gray-500 hover:bg-white/5"
                                                                    )}
                                                                >
                                                                    TODAS LAS SECCIONES
                                                                </button>
                                                                {instrumentos.map(inst => (
                                                                    <button 
                                                                        key={inst.id_instrumento}
                                                                        onClick={() => { setSelectedInstrumento(inst.id_instrumento.toString()); setIsFilterOpen(false); }}
                                                                        className={clsx(
                                                                            "w-full text-left p-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors mt-1",
                                                                            selectedInstrumento === inst.id_instrumento.toString() ? "bg-brand-primary text-white" : "text-gray-500 hover:bg-white/5"
                                                                        )}
                                                                    >
                                                                        {inst.instrumento}
                                                                    </button>
                                                                ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                    
                                                    {/* Botón Cerrar Asistencia */}
                                                    {puedeMarcar && (isAdmin || isDirector) && (
                                                        <button 
                                                            onClick={handleCerrarAsistencia}
                                                            className="h-10 px-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 transition-all flex items-center gap-2"
                                                            title="Cerrar Asistencia Manualmente"
                                                        >
                                                            <Lock className="w-4 h-4" />
                                                            <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">Cerrar</span>
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="h-10 px-4 bg-brand-primary/10 border border-brand-primary/20 rounded-xl flex items-center gap-2 text-[9px] font-black text-brand-primary uppercase tracking-widest">
                                                    <Music2 className="w-3.5 h-3.5" />
                                                    {user?.miembro?.instrumento?.instrumento}
                                                </div>
                                            )}
                                        </div>

                                        {puedeMarcar && (
                                            <div className="relative">
                                                <button 
                                                    onClick={() => setIsActionsOpen(!isActionsOpen)}
                                                    className="h-10 w-10 sm:w-auto sm:px-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center gap-2 hover:bg-indigo-500 hover:text-white transition-all text-xs"
                                                >
                                                    <Zap className="w-4 h-4" />
                                                    <span className="hidden sm:inline font-black uppercase tracking-widest text-[10px]">Acciones</span>
                                                </button>

                                                <AnimatePresence>
                                                    {isActionsOpen && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                            className="absolute right-0 top-full mt-2 w-56 bg-indigo-600 border border-indigo-400/30 rounded-2xl shadow-2xl z-50 p-2 overflow-hidden"
                                                        >
                                                            <button 
                                                                onClick={() => { handleMarcarTodos('PRESENTE'); setIsActionsOpen(false); }}
                                                                className="w-full text-left p-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 flex items-center gap-2"
                                                            >
                                                                <UserCheck className="w-3.5 h-3.5" /> TODOS PRESENTES
                                                            </button>
                                                            <button 
                                                                onClick={() => { handleMarcarTodos('FALTA'); setIsActionsOpen(false); }}
                                                                className="w-full text-left p-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/80 hover:bg-white/10 flex items-center gap-2 mt-1"
                                                            >
                                                                <UserX className="w-3.5 h-3.5" /> TODOS FALTA
                                                            </button>
                                                            
                                                            {(isAdmin || isDirector) && (
                                                                <div className="mt-2 pt-2 border-t border-white/10">
                                                                    <button 
                                                                        onClick={() => { handleEnviarRecordatorios(); setIsActionsOpen(false); }}
                                                                        className="w-full text-left p-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-amber-300 hover:bg-white/10 flex items-center gap-2"
                                                                    >
                                                                        <Bell className="w-3.5 h-3.5" /> Mandar Recordatorios
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {(hasFullAccess || isJefe) && (
                                    <div className="mt-3 relative">
                                        <input 
                                            type="text"
                                            placeholder="Buscar músico..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs font-bold text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors uppercase tracking-wide"
                                        />
                                        <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                    </div>
                                )}

                                    {(hasFullAccess || isJefe) && (
                                        <div className="flex bg-white/5 p-1 rounded-xl mt-3">
                                            <button 
                                                onClick={() => setActiveTab('PENDIENTES')}
                                                className={clsx(
                                                    "flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                                                    activeTab === 'PENDIENTES' ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-gray-300"
                                                )}
                                            >
                                                <span>Pendientes</span>
                                                {stats.sinMarcar > 0 && (
                                                    <span className="w-4 h-4 sm:w-5 sm:h-5 bg-indigo-500 text-white rounded-full flex items-center justify-center text-[8px] sm:text-[10px] animate-pulse">
                                                        {stats.sinMarcar}
                                                    </span>
                                                )}
                                            </button>
                                            <button 
                                                onClick={() => setActiveTab('RESUMEN')}
                                                className={clsx(
                                                    "flex-1 py-2 sm:py-3 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                                                    activeTab === 'RESUMEN' ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-gray-300"
                                                )}
                                            >
                                                <span>Resumen</span>
                                            </button>
                                        </div>
                                    )}

                                {(hasFullAccess || isJefe) && (
                                    <div className="grid grid-cols-5 gap-1.5 sm:gap-3 mt-3 sm:mt-5">
                                        <div className="bg-white/5 rounded-xl px-2 py-1.5 sm:p-3 flex flex-col items-center justify-center border border-white/5 transition-all">
                                            <p className="text-sm sm:text-xl font-black text-white leading-tight">{stats.total}</p>
                                            <p className="text-[7px] sm:text-[9px] font-black text-gray-500 uppercase tracking-tighter sm:tracking-widest mt-0.5">Total</p>
                                        </div>
                                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-2 py-1.5 sm:p-3 flex flex-col items-center justify-center transition-all">
                                            <p className="text-sm sm:text-xl font-black text-green-400 leading-tight">{stats.puntuales}</p>
                                            <p className="text-[7px] sm:text-[9px] font-black text-green-500 uppercase tracking-tighter sm:tracking-widest mt-0.5">Pres.</p>
                                        </div>
                                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-2 py-1.5 sm:p-3 flex flex-col items-center justify-center transition-all">
                                            <p className="text-sm sm:text-xl font-black text-indigo-400 leading-tight">{stats.permisos}</p>
                                            <p className="text-[7px] sm:text-[9px] font-black text-indigo-500 uppercase tracking-tighter sm:tracking-widest mt-0.5">Perm.</p>
                                        </div>
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-2 py-1.5 sm:p-3 flex flex-col items-center justify-center transition-all">
                                            <p className="text-sm sm:text-xl font-black text-red-400 leading-tight">{stats.faltas}</p>
                                            <p className="text-[7px] sm:text-[9px] font-black text-red-500 uppercase tracking-tighter sm:tracking-widest mt-0.5">Faltas</p>
                                        </div>
                                        <div className="bg-white/5 rounded-xl px-2 py-1.5 sm:p-3 flex flex-col items-center justify-center border border-white/5 transition-all">
                                            <p className="text-sm sm:text-xl font-black text-gray-400 leading-tight">{stats.sinMarcar}</p>
                                            <p className="text-[7px] sm:text-[9px] font-black text-gray-600 uppercase tracking-tighter sm:tracking-widest mt-0.5">Rest.</p>
                                        </div>
                                    </div>
                                )}
                                {jefeBloqueado && (
                                    <div className="mx-6 mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-4">
                                        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-500/20">
                                            <AlertCircle className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-tight">Acción Requerida</p>
                                            <p className="text-[9px] font-bold text-amber-500/80 uppercase tracking-wide mt-0.5">Valida tu ubicación para habilitar el control de tu sección.</p>
                                        </div>
                                    </div>
                                )}

                                {/* BOTÓN PARA MÚSICOS Y JEFES (MARCAR ASISTENCIA PROPIA) */}
                                {!hasFullAccess && (!isJefe || !jefeYaMarco) && puedeMarcar && selectedEvento && (
                                    <div className="mt-5 px-6 pb-2">
                                        {(() => {
                                            const miConv = listaAsistencia.find(c => c.id_miembro === user?.miembro?.id_miembro);
                                            if (!miConv) return (
                                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl text-center">
                                                    <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">No estás convocado a este evento</p>
                                                </div>
                                            );

                                            if (miConv.asistencia) {
                                                const est = miConv.asistencia.estado;
                                                const isPuntual = est === 'PUNTUAL' || est === 'RETRASO' || est === 'PRESENTE';
                                                
                                                return (
                                                    <div className={clsx(
                                                        "p-5 rounded-2xl text-center flex flex-col items-center gap-2 border",
                                                        isPuntual ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"
                                                    )}>
                                                        <div className={clsx(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg",
                                                            isPuntual ? "bg-emerald-500 shadow-emerald-500/20" : "bg-red-500 shadow-red-500/20"
                                                        )}>
                                                            {isPuntual ? <Check className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                                                        </div>
                                                        <div>
                                                            <p className={clsx("text-xs font-black uppercase tracking-widest", isPuntual ? "text-emerald-500" : "text-red-500")}>
                                                                Asistencia: {est}
                                                            </p>
                                                            {miConv.asistencia.hora_llegada && (
                                                                <p className="text-[10px] font-bold opacity-60 uppercase mt-0.5">Marcado a las {miConv.asistencia.hora_llegada.substring(0, 5)}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <button 
                                                    disabled={saving}
                                                    onClick={handleMarcarPropia}
                                                    className="w-full py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-[2rem] shadow-2xl shadow-indigo-600/30 flex flex-col items-center gap-1 group transition-all active:scale-95 disabled:opacity-50 border border-white/10"
                                                >
                                                    {saving ? (
                                                        <RefreshCw className="w-7 h-7 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <MapPin className="w-7 h-7 group-hover:scale-110 transition-transform mb-1" />
                                                            <span className="text-[13px] font-black uppercase tracking-[0.2em]">Confirmar mi Presencia</span>
                                                            <span className="text-[8px] font-bold opacity-60 uppercase tracking-widest">Se validará tu ubicación vía GPS</span>
                                                        </>
                                                    )}
                                                </button>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                            {/* Vista de Lista (Solo para Staff/Jefes) */}
                            {(hasFullAccess || isJefe) && (
                                <div className="max-h-[calc(100vh-240px)] overflow-y-auto custom-scrollbar transition-all">
                                    {loadingLista ? (
                                        <div className="p-4">
                                            <SkeletonList items={8} />
                                        </div>
                                    ) : listaAsistencia.length === 0 ? (
                                        <div className="p-12 text-center text-gray-500 font-medium uppercase text-xs tracking-widest">
                                            No hay músicos convocados
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-white/5">
                                            <AnimatePresence mode="popLayout">
                                                {listaAsistencia
                                                    .filter(c => {
                                                        // 1. Filtro base de permisos (Hacer desaparecer al resto para Jefes)
                                                        if (!isAdmin && isJefe && c.miembro?.id_instrumento !== miInstrumento) return false;

                                                        // 2. Filtro de selector manual (Solo Admin)
                                                        const matchInstrumento = selectedInstrumento === 'TODOS' || c.miembro?.instrumento?.id_instrumento === parseInt(selectedInstrumento);
                                                        if (!matchInstrumento) return false;

                                                        // 3. Filtro de búsqueda
                                                        const matchSearch = searchTerm === '' || 
                                                            (c.miembro?.nombres + ' ' + c.miembro?.apellidos).toLowerCase().includes(searchTerm.toLowerCase());
                                                        if (!matchSearch) return false;

                                                        const estado = asistenciasTemp[c.id_convocatoria];
                                                        if (activeTab === 'PENDIENTES') {
                                                            return estado === null;
                                                        }
                                                        return estado !== null;
                                                    })
                                                    .map(conv => (
                                                        <SwipeableAsistenciaItem 
                                                            key={conv.id_convocatoria}
                                                            conv={conv}
                                                            estadoActual={asistenciasTemp[conv.id_convocatoria]}
                                                            handleMarcarEstado={handleMarcarEstado}
                                                            puedeMarcar={
                                                                puedeMarcar && 
                                                                (isAdmin || (
                                                                    !conv.asistencia?.latitud_marcado && 
                                                                    (isDirector || (isJefe && !jefeBloqueado && conv.miembro?.id_instrumento === miInstrumento))
                                                                ))
                                                            }
                                                            onReemplazar={handleOpenReemplazo}
                                                            isAdmin={isAdmin}
                                                            isDirector={isDirector}
                                                        />
                                                    ))}
                                            </AnimatePresence>
                                            
                                            {activeTab === 'PENDIENTES' && listaAsistencia.filter(c => asistenciasTemp[c.id_convocatoria] === null && (selectedInstrumento === 'TODOS' || c.miembro?.instrumento?.id_instrumento === parseInt(selectedInstrumento))).length === 0 && (
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="p-16 text-center"
                                                >
                                                    <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/10">
                                                        <CheckCircle2 className="w-10 h-10" />
                                                    </div>
                                                    <h3 className="text-lg font-black text-white uppercase tracking-tighter">¡Asistencia Completada!</h3>
                                                    <p className="text-sm text-gray-500 uppercase tracking-widest mt-2">No quedan músicos pendientes en esta sección.</p>
                                                    <Button 
                                                        onClick={() => setSelectedEvento(null)}
                                                        className="mt-8 xl:hidden h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs"
                                                    >
                                                        Volver al Menú
                                                    </Button>
                                                </motion.div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Vista para el Músico (Simple: Solo el botón) */}
                            {!hasFullAccess && !isJefe && (
                                <div className="p-12 text-center bg-gray-50 dark:bg-black/20">
                                    <div className="max-w-xs mx-auto space-y-8">
                                        <div className="space-y-2">
                                            <div className="w-16 h-16 bg-brand-primary/10 rounded-3xl flex items-center justify-center mx-auto text-brand-primary mb-4">
                                                <MapPin className="w-8 h-8" />
                                            </div>
                                            <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Tu Registro de Hoy</h4>
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Asegúrate de estar en el sitio antes de marcar</p>
                                        </div>

                                        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-3xl p-6 shadow-xl">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Estado del Evento</p>
                                            <div className="flex items-center justify-center gap-2 mb-6">
                                                {puedeMarcar ? (
                                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black border border-emerald-500/20">
                                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                                        ABIERTO PARA MARCAR
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-[10px] font-black border border-red-500/20">
                                                        <Lock className="w-3 h-3" />
                                                        MARCADO CERRADO
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* MODALES */}
                <AnimatePresence>
                    {showPermisoModal && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-[#1e2335] w-full max-w-sm rounded-[32px] overflow-hidden border border-white/10 shadow-2xl"
                            >
                                <div className="p-8">
                                    <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-3xl flex items-center justify-center mb-6">
                                        <AlertCircle className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Registrar Permiso</h3>
                                    <p className="text-xs text-gray-500 uppercase tracking-widest font-black mb-6">Ingresa el motivo de la justificación</p>
                                    
                                    <textarea 
                                        value={motivoPermiso}
                                        onChange={(e) => setMotivoPermiso(e.target.value)}
                                        placeholder="Ej: Motivos de salud, viaje, etc..."
                                        className="w-full h-32 bg-black/20 border border-white/5 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all resize-none mb-6"
                                    />

                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => setShowPermisoModal(false)}
                                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-400 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all"
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            onClick={handleConfirmPermiso}
                                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-lg shadow-blue-600/20 transition-all"
                                        >
                                            Guardar
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showReemplazoModal && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-[#1e2335] w-full max-w-lg rounded-[32px] overflow-hidden border border-white/10 shadow-2xl flex flex-col max-h-[85vh]"
                            >
                                <div className="p-6 border-b border-white/5">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center">
                                            <RefreshCw className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-white uppercase tracking-tighter">Reemplazar Músico</h3>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Cambiar a {selectedConvReemplazo?.miembro?.nombres} por un suplente</p>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input 
                                            type="text"
                                            value={searchReemplazo}
                                            onChange={(e) => setSearchReemplazo(e.target.value)}
                                            placeholder="Buscar por nombre o apellido..."
                                            className="w-full bg-black/20 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-white text-xs focus:outline-none focus:border-brand-primary/50 transition-all font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[300px]">
                                    {loadingReemplazo ? (
                                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                                            <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Buscando suplentes...</p>
                                        </div>
                                    ) : miembrosDisponibles.filter(m => 
                                        `${m.nombres} ${m.apellidos}`.toLowerCase().includes(searchReemplazo.toLowerCase())
                                    ).length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <UserX className="w-12 h-12 text-gray-800 mb-2" />
                                            <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">No hay músicos disponibles</p>
                                            <p className="text-[8px] text-gray-700 uppercase mt-1">Asegúrate de que no estén ya convocados</p>
                                        </div>
                                    ) : (
                                        miembrosDisponibles.filter(m => 
                                            `${m.nombres} ${m.apellidos}`.toLowerCase().includes(searchReemplazo.toLowerCase())
                                        ).map(m => (
                                            <button
                                                key={m.id_miembro}
                                                onClick={() => handleConfirmReemplazo(m.id_miembro)}
                                                className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] hover:bg-brand-primary border border-white/5 hover:border-brand-primary/30 transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white font-bold text-xs group-hover:bg-white/20">
                                                        {m.nombres?.charAt(0)}
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-sm font-bold text-white group-hover:text-white">{m.nombres} {m.apellidos}</p>
                                                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider group-hover:text-white/70">{m.instrumento?.instrumento}</p>
                                                    </div>
                                                </div>
                                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all">
                                                    <UserPlus className="w-4 h-4" />
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>

                                <div className="p-6 border-t border-white/5">
                                    <button 
                                        onClick={() => setShowReemplazoModal(false)}
                                        className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-400 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {snackbar.show && (
                        <motion.div 
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-48px)] max-w-md bg-indigo-600 rounded-3xl p-4 shadow-2xl flex items-center justify-between border border-white/20 backdrop-blur-xl"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                                    <RefreshCw className="w-5 h-5 text-white animate-spin-slow" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Sincronizando...</span>
                                    <span className="text-sm font-bold text-white">{snackbar.message}</span>
                                </div>
                            </div>
                            <button 
                                onClick={handleUndo}
                                className="px-4 py-2 bg-white text-indigo-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-50 transition-colors"
                            >
                                Deshacer
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                <ConfirmModal 
                    isOpen={showCierreModal}
                    onClose={() => setShowCierreModal(false)}
                    onConfirm={handleConfirmCierre}
                    title="Cerrar Asistencia"
                    message={`¿Estás seguro de cerrar la asistencia para "${eventoACerrar?.evento}"? Ya no se podrán realizar cambios después.`}
                    confirmText={loadingCierre ? "Cerrando..." : "Cerrar Asistencia"}
                    variant="danger"
                />
            </div>
        </div>
    );
}

