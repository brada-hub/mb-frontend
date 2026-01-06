import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Calendar, Clock, Users, CheckCircle2, XCircle, AlertCircle, 
    MapPin, ChevronRight, Check, X, Timer, UserCheck, UserX,
    RefreshCw, Save
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import api from '../../api';
import { useToast } from '../../context/ToastContext';

export default function AsistenciasList() {
    const navigate = useNavigate();
    const { notify } = useToast();
    
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

    const handleMarcarEstado = (id_convocatoria, estado) => {
        if (!puedeMarcar) {
            notify('El control de asistencia no está habilitado aún', 'warning');
            return;
        }
        
        setAsistenciasTemp(prev => ({
            ...prev,
            [id_convocatoria]: prev[id_convocatoria] === estado ? null : estado
        }));
    };

    const handleGuardarAsistencia = async () => {
        if (!selectedEvento) return;

        const asistencias = Object.entries(asistenciasTemp)
            .filter(([_, estado]) => estado !== null)
            .map(([id_convocatoria, estado]) => ({
                id_convocatoria: parseInt(id_convocatoria),
                estado
            }));

        if (asistencias.length === 0) {
            notify('No hay asistencias para guardar', 'warning');
            return;
        }

        setSaving(true);
        try {
            await api.post('/asistencia/marcar-masivo', {
                id_evento: selectedEvento.id_evento,
                asistencias
            });
            notify('Asistencia guardada correctamente', 'success');
            loadListaAsistencia(selectedEvento.id_evento);
        } catch (error) {
            console.error(error);
            notify(error.response?.data?.message || 'Error al guardar asistencia', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleMarcarTodos = (estado) => {
        if (!puedeMarcar) {
            notify('El control de asistencia no está habilitado aún', 'warning');
            return;
        }

        const temp = { ...asistenciasTemp };
        
        // Solo marcar los visibles (filtrados)
        const filteredList = selectedInstrumento === 'TODOS' 
            ? listaAsistencia 
            : listaAsistencia.filter(c => c.miembro?.instrumento?.id_instrumento === parseInt(selectedInstrumento));

        filteredList.forEach(c => {
            temp[c.id_convocatoria] = estado;
        });
        setAsistenciasTemp(temp);
    };

    const getEstadoClasses = (estado) => {
        switch (estado) {
            case 'PUNTUAL':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'RETRASO':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'FALTA':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'JUSTIFICADO':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            default:
                return 'bg-white/5 text-gray-500 border-white/10';
        }
    };

    const getEstadoIcon = (estado) => {
        switch (estado) {
            case 'PUNTUAL': return <Check className="w-4 h-4" />;
            case 'RETRASO': return <Timer className="w-4 h-4" />;
            case 'FALTA': return <X className="w-4 h-4" />;
            case 'JUSTIFICADO': return <AlertCircle className="w-4 h-4" />;
            default: return null;
        }
    };

    // Estadísticas temporales
    const stats = {
        total: listaAsistencia.length,
        puntuales: Object.values(asistenciasTemp).filter(e => e === 'PUNTUAL').length,
        retrasos: Object.values(asistenciasTemp).filter(e => e === 'RETRASO').length,
        faltas: Object.values(asistenciasTemp).filter(e => e === 'FALTA').length,
        sinMarcar: Object.values(asistenciasTemp).filter(e => e === null).length
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Cargando asistencias...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            {/* Header Unified */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-2">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">Control de Asistencia</h1>
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-widest mt-1">
                        {new Date().toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                
                <div className="flex gap-3 w-full xl:w-auto justify-end">
                    <Button onClick={loadEventosHoy} className="h-12 px-6 shadow-lg shadow-indigo-500/10 text-xs font-black uppercase tracking-widest rounded-xl bg-[#161b2c] border border-white/5 hover:bg-white/5 text-gray-300 hover:text-white shrink-0">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Actualizar
                    </Button>
                </div>
            </div>

            {/* Layout Principal */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                
                {/* Lista de Eventos del Día */}
                <div className="xl:col-span-4 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="w-5 h-5 text-brand-primary" />
                        <h2 className="text-lg font-bold text-white uppercase tracking-wide">Eventos de Hoy</h2>
                    </div>

                    {eventosHoy.length === 0 ? (
                        <div className="bg-surface-card border border-white/5 rounded-3xl p-8 text-center">
                            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 font-medium">No hay eventos programados hoy</p>
                            <p className="text-gray-600 text-sm mt-2">Los eventos aparecerán cuando llegue su fecha</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {eventosHoy.map(evento => {
                                const isSelected = selectedEvento?.id_evento === evento.id_evento;
                                const puedeAbrir = evento.puede_marcar_asistencia;
                                const minutosParaInicio = evento.minutos_para_inicio;
                                
                                return (
                                    <button
                                        key={evento.id_evento}
                                        onClick={() => handleSelectEvento(evento)}
                                        className={`w-full text-left p-5 rounded-2xl border transition-all ${
                                            isSelected 
                                                ? 'bg-brand-primary/10 border-brand-primary/50 shadow-lg shadow-brand-primary/10' 
                                                : 'bg-surface-card border-white/5 hover:border-white/20'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase ${
                                                evento.tipo?.evento === 'ENSAYO' ? 'bg-blue-500/20 text-blue-400' :
                                                evento.tipo?.evento === 'PRESENTACION' ? 'bg-purple-500/20 text-purple-400' :
                                                'bg-white/10 text-gray-400'
                                            }`}>
                                                {evento.tipo?.evento}
                                            </span>
                                            
                                            {puedeAbrir ? (
                                                <span className="flex items-center gap-1 text-[9px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                                    ACTIVO
                                                </span>
                                            ) : minutosParaInicio > 0 ? (
                                                <span className="text-[9px] font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-lg">
                                                    EN {minutosParaInicio} MIN
                                                </span>
                                            ) : (
                                                <span className="text-[9px] font-bold text-gray-500 bg-white/5 px-2 py-1 rounded-lg">
                                                    CERRADO
                                                </span>
                                            )}
                                        </div>
                                        
                                        <h3 className="font-bold text-white mb-2 line-clamp-1">{evento.evento}</h3>
                                        
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {evento.hora?.substr(0, 5)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3.5 h-3.5" />
                                                {evento.convocatorias?.length || 0}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-end mt-3 text-brand-primary">
                                            <ChevronRight className={`w-5 h-5 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Panel de Control de Asistencia */}
                <div className="xl:col-span-8">
                    {!selectedEvento ? (
                        <div className="bg-surface-card border border-white/5 rounded-3xl p-12 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
                            <UserCheck className="w-20 h-20 text-gray-700 mb-6" />
                            <h3 className="text-xl font-bold text-white mb-2">Selecciona un Evento</h3>
                            <p className="text-gray-500 max-w-md">
                                Elige un evento de la lista para iniciar el control de asistencia
                            </p>
                        </div>
                    ) : (
                        <div className="bg-surface-card border border-white/5 rounded-3xl overflow-hidden">
                            {/* Header del Panel */}
                            <div className="p-6 border-b border-white/5 bg-surface-card/80 backdrop-blur-sm">
                                <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{selectedEvento.evento}</h3>
                                        <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                                            <Clock className="w-4 h-4" />
                                            Hora programada: {selectedEvento.hora?.substr(0, 5)}
                                        </p>
                                    </div>
                                    
                                    {puedeMarcar ? (
                                        <div className="flex flex-wrap gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleMarcarTodos('PUNTUAL')}>
                                                <UserCheck className="w-4 h-4 mr-1" />
                                                Todos Puntuales
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleMarcarTodos('FALTA')}>
                                                <UserX className="w-4 h-4 mr-1" />
                                                Todos Falta
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-500 text-sm font-medium flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5" />
                                            Control no disponible aún
                                        </div>
                                    )}
                                </div>

                                {/* Filtros e Instrumentos */}
                                {instrumentos.length > 0 && (
                                    <div className="px-6 pb-4 flex items-center gap-2 overflow-x-auto custom-scrollbar">
                                        <button
                                            onClick={() => setSelectedInstrumento('TODOS')}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                                selectedInstrumento === 'TODOS'
                                                    ? 'bg-white text-black'
                                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                            }`}
                                        >
                                            TODOS
                                        </button>
                                        {instrumentos.map(inst => (
                                            <button
                                                key={inst.id_instrumento}
                                                onClick={() => setSelectedInstrumento(inst.id_instrumento.toString())}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                                    selectedInstrumento === inst.id_instrumento.toString()
                                                        ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25'
                                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                                }`}
                                            >
                                                {inst.instrumento}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Stats Bar */}
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
                                    <div className="bg-white/5 rounded-xl p-3 text-center">
                                        <p className="text-2xl font-bold text-white">{stats.total}</p>
                                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Total</p>
                                    </div>
                                    <div className="bg-green-500/10 rounded-xl p-3 text-center border border-green-500/20">
                                        <p className="text-2xl font-bold text-green-400">{stats.puntuales}</p>
                                        <p className="text-[9px] font-bold text-green-500/70 uppercase tracking-wider">Puntuales</p>
                                    </div>
                                    <div className="bg-yellow-500/10 rounded-xl p-3 text-center border border-yellow-500/20">
                                        <p className="text-2xl font-bold text-yellow-400">{stats.retrasos}</p>
                                        <p className="text-[9px] font-bold text-yellow-500/70 uppercase tracking-wider">Retrasos</p>
                                    </div>
                                    <div className="bg-red-500/10 rounded-xl p-3 text-center border border-red-500/20">
                                        <p className="text-2xl font-bold text-red-400">{stats.faltas}</p>
                                        <p className="text-[9px] font-bold text-red-500/70 uppercase tracking-wider">Faltas</p>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-3 text-center">
                                        <p className="text-2xl font-bold text-gray-400">{stats.sinMarcar}</p>
                                        <p className="text-[9px] font-bold text-gray-600 uppercase tracking-wider">Sin Marcar</p>
                                    </div>
                                </div>
                            </div>

                            {/* Lista de Músicos */}
                            <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                                {loadingLista ? (
                                    <div className="p-12 text-center">
                                        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                        <p className="text-gray-500 text-sm">Cargando lista...</p>
                                    </div>
                                ) : listaAsistencia.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-500">No hay músicos convocados</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-white/5">
                                        {listaAsistencia
                                            .filter(c => selectedInstrumento === 'TODOS' || c.miembro?.instrumento?.id_instrumento === parseInt(selectedInstrumento))
                                            .map(conv => {
                                            const estadoActual = asistenciasTemp[conv.id_convocatoria];
                                            const estadoGuardado = conv.asistencia?.estado;
                                            
                                            return (
                                                <div key={conv.id_convocatoria} className="p-4 hover:bg-white/[0.02] transition-all">
                                                    <div className="flex items-center justify-between gap-4">
                                                        {/* Info del Músico */}
                                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm border transition-all ${
                                                                estadoActual 
                                                                    ? getEstadoClasses(estadoActual)
                                                                    : 'bg-white/5 text-gray-500 border-white/10'
                                                            }`}>
                                                                {estadoActual ? getEstadoIcon(estadoActual) : conv.miembro?.nombres?.charAt(0)}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="font-bold text-white truncate">
                                                                    {conv.miembro?.nombres} {conv.miembro?.apellidos}
                                                                </p>
                                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                                                    {conv.miembro?.instrumento?.instrumento}
                                                                    {conv.miembro?.seccion && ` • ${conv.miembro.seccion.seccion}`}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Botones de Estado */}
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleMarcarEstado(conv.id_convocatoria, 'PUNTUAL')}
                                                                disabled={!puedeMarcar}
                                                                className={`p-2.5 rounded-xl border transition-all ${
                                                                    estadoActual === 'PUNTUAL'
                                                                        ? 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/30'
                                                                        : 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20 disabled:opacity-30'
                                                                }`}
                                                                title="Puntual"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleMarcarEstado(conv.id_convocatoria, 'RETRASO')}
                                                                disabled={!puedeMarcar}
                                                                className={`p-2.5 rounded-xl border transition-all ${
                                                                    estadoActual === 'RETRASO'
                                                                        ? 'bg-yellow-500 text-white border-yellow-500 shadow-lg shadow-yellow-500/30'
                                                                        : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20 disabled:opacity-30'
                                                                }`}
                                                                title="Retraso"
                                                            >
                                                                <Timer className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleMarcarEstado(conv.id_convocatoria, 'FALTA')}
                                                                disabled={!puedeMarcar}
                                                                className={`p-2.5 rounded-xl border transition-all ${
                                                                    estadoActual === 'FALTA'
                                                                        ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/30'
                                                                        : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20 disabled:opacity-30'
                                                                }`}
                                                                title="Falta"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleMarcarEstado(conv.id_convocatoria, 'JUSTIFICADO')}
                                                                disabled={!puedeMarcar}
                                                                className={`p-2.5 rounded-xl border transition-all ${
                                                                    estadoActual === 'JUSTIFICADO'
                                                                        ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/30'
                                                                        : 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20 disabled:opacity-30'
                                                                }`}
                                                                title="Justificado"
                                                            >
                                                                <AlertCircle className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Indicador de estado guardado vs temporal */}
                                                    {estadoGuardado && estadoActual !== estadoGuardado && (
                                                        <p className="text-[9px] text-yellow-500 mt-2 ml-16 font-bold uppercase">
                                                            Cambio pendiente de guardar (antes: {estadoGuardado})
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Footer con Guardar */}
                            {puedeMarcar && listaAsistencia.length > 0 && (
                                <div className="p-6 border-t border-white/5 bg-surface-card/80 backdrop-blur-sm">
                                    <Button 
                                        onClick={handleGuardarAsistencia}
                                        disabled={saving || Object.values(asistenciasTemp).every(e => e === null)}
                                        className="w-full py-4 shadow-xl shadow-brand-primary/20"
                                    >
                                        {saving ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                Guardando...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5 mr-2" />
                                                Guardar Asistencia
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
