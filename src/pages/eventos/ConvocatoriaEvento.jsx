import { useState, useEffect, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Users, CheckCircle2, Clock, UserPlus, 
    Search, Filter, Music2, Shield, Check, X, Plus, Trash2 
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import api from '../../api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export default function ConvocatoriaEvento() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { notify } = useToast();
    const { user } = useAuth();
    
    const [evento, setEvento] = useState(null);
    const [convocatorias, setConvocatorias] = useState([]);
    const [secciones, setSecciones] = useState([]);
    const [miembrosDisponibles, setMiembrosDisponibles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSeccion, setSelectedSeccion] = useState('');
    const [showPostularModal, setShowPostularModal] = useState(false);
    const [selectedMiembros, setSelectedMiembros] = useState([]);
    const [instrumentos, setInstrumentos] = useState([]);
    const [selectedInstrumento, setSelectedInstrumento] = useState('');
    
    // Estados para el modal de postulación
    const [postularSearch, setPostularSearch] = useState('');
    const [postularInstrumento, setPostularInstrumento] = useState('');

    // Permisos de gestión
    const roleName = user?.role?.toUpperCase() || '';
    
    // Solo Admin y Director pueden CONFIRMAR (Validar) definitivamente
    const canConfirm = ['DIRECTOR', 'ADMIN', 'ADMINISTRADOR'].includes(roleName) || 
                       [1, 2].includes(parseInt(user?.miembro?.id_rol));

    // Admin, Director y Jefes de Sección pueden GESTIONAR (Añadir/Quitar)
    const canManage = canConfirm || roleName.includes('JEFE') || 
                      parseInt(user?.miembro?.id_rol) === 3;
    
    useEffect(() => {
        console.log('USER DEBUG:', user);
        console.log('ROLE NAME:', roleName);
    }, [user]);

    const isJefeSeccion = roleName.includes('JEFE');
    const miInstrumentoId = user?.miembro?.id_instrumento;
    const miInstrumentoNombre = user?.miembro?.instrumento?.instrumento;
    const isVirtual = !evento?.requerimientos || evento?.requerimientos.length === 0;

    // Helper para verificar si un músico o instrumento es de MI responsabilidad (mismo instrumento)
    const isMyResponsibility = (target) => {
        if (canConfirm) return true; // Admin/Director tienen acceso total
        if (!target || !miInstrumentoId) return false;
        
        // target puede ser un Miembro o un Requerimiento/Instrumento
        const targetInstrumentId = target.id_instrumento || target.instrumento?.id_instrumento;
        if (!targetInstrumentId) return false;

        return String(targetInstrumentId) === String(miInstrumentoId);
    };

    useEffect(() => {
        loadData(true); // Pasar true para mostrar cargando la primera vez
        loadMiembrosDisponibles(); 
    }, [id]);

    const loadData = async (initial = false) => {
        // Solo mostrar pantalla de carga si es la carga inicial y no tenemos datos
        if (initial && !evento) setLoading(true);
        
        try {
            const [eventoRes, convocatoriasRes, seccionesRes, instrumentosRes] = await Promise.all([
                api.get(`/eventos/${id}`),
                api.get(`/convocatorias?id_evento=${id}`),
                api.get('/secciones'),
                api.get('/instrumentos')
            ]);
            
            setEvento(eventoRes.data);
            setConvocatorias(convocatoriasRes.data);
            setSecciones(seccionesRes.data);
            setInstrumentos(instrumentosRes.data);
        } catch (error) {
            console.error(error);
            notify('Error al cargar datos del evento', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadMiembrosDisponibles = async (seccionId = null) => {
        try {
            let url = `/convocatorias/disponibles?id_evento=${id}`;
            if (seccionId) url += `&id_seccion=${seccionId}`;
            
            const res = await api.get(url);
            setMiembrosDisponibles(res.data);
            return res.data;
        } catch (error) {
            console.error(error);
            notify('Error al cargar miembros disponibles', 'error');
        }
    };

    const handleOpenPostular = () => {
        // 1. Abrir modal inmediatamente
        setShowPostularModal(true);
        
        // 2. Limpiar estados
        setPostularSearch('');
        setPostularInstrumento('');
        setMiembrosDisponibles([]); 
        
        // 3. Iniciar carga de datos
        const seccionId = isJefeSeccion ? miSeccion : null;
        loadMiembrosDisponibles(seccionId);
    };

    const handleOpenPostularConInstrumento = async (id_instrumento) => {
        setShowPostularModal(true);
        setPostularSearch('');
        setPostularInstrumento(id_instrumento.toString());
        setMiembrosDisponibles([]); 
        const seccionId = isJefeSeccion ? miSeccion : null;
        loadMiembrosDisponibles(seccionId);
    };

    const handlePostular = async () => {
        if (selectedMiembros.length === 0) {
            notify('Selecciona al menos un miembro', 'warning');
            return;
        }

        try {
            await api.post('/convocatorias/postular', {
                id_evento: parseInt(id),
                id_miembros: selectedMiembros,
                confirmar: false // Siempre empezar como pendiente para revisión
            });
            notify('Miembros añadidos exitosamente', 'success');
            setShowPostularModal(false);
            setSelectedMiembros([]);
            loadData();
            loadMiembrosDisponibles(); // Recargar disponibles
        } catch (error) {
            notify('Error al agregar miembros', 'error');
        }
    };

    const handleQuickAdd = async (id_miembro) => {
        // Encontrar al miembro para saber su instrumento
        const miembro = miembrosDisponibles.find(m => m.id_miembro === id_miembro);
        if (!miembro) return;

        // Verificar si hay requerimiento para este instrumento
        const req = evento?.requerimientos?.find(r => r.id_instrumento === miembro.id_instrumento);
        if (!req) {
            notify('Este instrumento no es requerido para este evento', 'warning');
            return;
        }

        // Verificar si la cuota ya está llena
        const actualCount = convocatorias.filter(c => c.miembro?.id_instrumento === miembro.id_instrumento).length;
        if (actualCount >= req.cantidad_necesaria) {
            notify(`Ya se ha completado la cuota de ${miembro.instrumento?.instrumento}`, 'warning');
            return;
        }

        try {
            await api.post('/convocatorias/postular', {
                id_evento: parseInt(id),
                id_miembros: [id_miembro],
                confirmar: false
            });
            notify('Miembro añadido', 'success');
            loadData();
            loadMiembrosDisponibles();
        } catch (error) {
            notify('Error al añadir', 'error');
        }
    };

    const handleConfirmar = async (id_convocatoria) => {
        try {
            await api.post('/convocatorias/confirmar', { id_convocatoria });
            notify('Miembro confirmado', 'success');
            loadData();
        } catch (error) {
            notify('Error al confirmar', 'error');
        }
    };

    const handleConfirmarMasivo = async (id_instrumento = null) => {
        const pendientes = convocatorias.filter(c => {
            const isPending = !c.confirmado_por_director;
            const isMatch = (id_instrumento !== null && id_instrumento !== undefined && id_instrumento !== '') 
                ? String(c.miembro?.id_instrumento) === String(id_instrumento) 
                : true;
            return isPending && isMatch;
        });

        if (pendientes.length === 0) {
            notify('No hay miembros pendientes por confirmar en este grupo', 'info');
            return;
        }

        try {
            await api.post('/convocatorias/confirmar-masivo', {
                id_convocatorias: pendientes.map(c => c.id_convocatoria)
            });
            notify(`${pendientes.length} músicos confirmados`, 'success');
            loadData();
        } catch (error) {
            notify('Error al confirmar el grupo', 'error');
        }
    };

    const handleEliminar = async (id_convocatoria) => {
        try {
            await api.delete(`/convocatorias/${id_convocatoria}`);
            notify('Miembro removido de la convocatoria', 'success');
            await loadData();
            await loadMiembrosDisponibles(); // Recargar disponibles al liberar cupo
        } catch (error) {
            notify('Error al remover', 'error');
        }
    };

    const toggleMiembroSelection = (id_miembro) => {
        const isSelected = selectedMiembros.includes(id_miembro);
        
        if (!isSelected) {
            // Encontrar al miembro para saber su instrumento
            const miembro = miembrosDisponibles.find(m => m.id_miembro === id_miembro);
            if (!miembro) return;

            // Encontrar el requerimiento para ese instrumento (solo si no es virtual)
            if (!isVirtual) {
                const req = evento?.requerimientos?.find(r => r.id_instrumento === miembro.id_instrumento);
                if (req) {
                    const yaConvocados = convocatorias.filter(c => c.miembro?.id_instrumento === miembro.id_instrumento).length;
                    const seleccionadosEnModal = selectedMiembros.filter(id => {
                        const m = miembrosDisponibles.find(md => md.id_miembro === id);
                        return m && m.id_instrumento === miembro.id_instrumento;
                    }).length;

                    if (yaConvocados + seleccionadosEnModal >= req.cantidad_necesaria) {
                        notify(`La cuota de ${miembro.instrumento?.instrumento} (${req.cantidad_necesaria}) ya está completa`, 'warning');
                        return;
                    }
                }
            }
        }

        setSelectedMiembros(prev => 
            prev.includes(id_miembro) 
                ? prev.filter(id => id !== id_miembro)
                : [...prev, id_miembro]
        );
    };

    const filteredConvocatorias = convocatorias.filter(c => {
        // Filtro de Responsabilidad: Si es Jefe, SOLO ve su instrumento exacto
        if (isJefeSeccion && !canConfirm) {
            if (!isMyResponsibility(c.miembro)) return false;
        }

        const matchSearch = c.miembro?.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           c.miembro?.apellidos?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchInstrumento = !selectedInstrumento || c.miembro?.id_instrumento === parseInt(selectedInstrumento);
        
        return matchSearch && matchInstrumento;
    });

    // Filtrar miembros disponibles
    const filteredDisponibles = miembrosDisponibles.filter(m => {
        // 🛡️ FILTRO JEFE: En la lista de disponibles, solo ve su instrumento
        if (isJefeSeccion && !canConfirm) {
            if (!isMyResponsibility(m)) return false;
        }

        // 1. Si el evento tiene requerimientos definidos (Contrato), verificar cuotas
        if (!isVirtual) {
            const requerimiento = evento?.requerimientos?.find(r => r.id_instrumento === m.id_instrumento);
            if (!requerimiento) return false;

            const convokedCount = convocatorias.filter(c => c.miembro?.id_instrumento === m.id_instrumento).length;
            if (convokedCount >= requerimiento.cantidad_necesaria) return false;
        }

        // 2. Filtros de búsqueda y manuales
        const nombre = (m.nombres || '').toLowerCase();
        const apellido = (m.apellidos || '').toLowerCase();
        const busqueda = postularSearch.toLowerCase();
        const matchSearch = nombre.includes(busqueda) || apellido.includes(busqueda);
        const matchInstrumento = !postularInstrumento || String(m.id_instrumento) === String(postularInstrumento);
        
        return matchSearch && matchInstrumento;
    });

    // Estadísticas
    const statsConvocatorias = (isJefeSeccion && !canConfirm) 
        ? convocatorias.filter(c => isMyResponsibility(c.miembro))
        : convocatorias;

    const confirmados = statsConvocatorias.filter(c => c.confirmado_por_director).length;
    const pendientes = statsConvocatorias.filter(c => !c.confirmado_por_director).length;

    const isEventComplete = evento?.requerimientos?.every(req => {
        const count = convocatorias.filter(c => c.miembro?.id_instrumento === req.id_instrumento).length;
        return count >= req.cantidad_necesaria;
    });

    if (loading && !evento) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Sincronizando escenario...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/dashboard/eventos')}
                        className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-white uppercase flex items-center gap-3">
                            CONVOCATORIA
                            {isJefeSeccion && !canConfirm && (
                                <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full border border-yellow-500/20 animate-pulse">
                                    MODO JEFE DE {miInstrumentoNombre}
                                </span>
                            )}
                        </h1>
                        <p className="text-gray-400 font-medium">
                            {evento?.evento} - {evento?.fecha && new Date(evento.fecha + 'T12:00:00').toLocaleDateString('es-BO', { 
                                weekday: 'long', day: 'numeric', month: 'long' 
                            })}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    {canManage && (
                        <Button 
                            variant="primary" 
                            onClick={handleOpenPostular}
                        >
                            <UserPlus className="w-5 h-5 mr-2" />
                            Añadir Músico
                        </Button>
                    )}
                    {canConfirm && pendientes > 0 && (
                        <Button 
                            variant="secondary" 
                            onClick={() => isEventComplete ? handleConfirmarMasivo() : notify('Debes completar todas las vacantes antes de confirmar todo el escenario', 'warning')}
                            className={!isEventComplete ? 'opacity-50' : ''}
                        >
                            <CheckCircle2 className="w-5 h-5 mr-2" />
                            Validar Formación ({pendientes})
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-surface-card border border-white/5 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-xl">
                            <Users className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{statsConvocatorias.length}</p>
                            <p className="text-xs text-gray-500 font-medium">{isJefeSeccion && !canConfirm ? `Mis ${miInstrumentoNombre}s` : 'Total Convocados'}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface-card border border-white/5 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-xl">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{confirmados}</p>
                            <p className="text-xs text-gray-500 font-medium">Confirmados</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface-card border border-white/5 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/10 rounded-xl">
                            <Clock className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{pendientes}</p>
                            <p className="text-xs text-gray-500 font-medium">Pendientes</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface-card border border-white/5 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-xl">
                            <Music2 className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{evento?.tipo?.evento}</p>
                            <p className="text-xs text-gray-500 font-medium">Tipo Evento</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                

                {/* Full Width Row: CONVOCADOS */}
                <div className="xl:col-span-12 space-y-6">

                    {/* Main List Table */}
                    <div className="bg-surface-card border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col h-[520px] shadow-2xl">
                        <div className="p-8 border-b border-white/5 bg-surface-card/60 backdrop-blur-md space-y-6">
                            <div className="flex flex-col lg:flex-row gap-6 justify-between items-center">
                                <div className="flex items-center gap-3 self-start lg:self-center">
                                    <div className="w-1.5 h-6 bg-green-500 rounded-full" />
                                    <h3 className="text-xl font-bold text-white uppercase">Formación en vivo</h3>
                                </div>

                                <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
                                    {/* Búsqueda */}
                                    <div className="relative group w-full md:w-64">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 group-focus-within:text-brand-primary" />
                                        <input 
                                            type="text"
                                            placeholder="Buscar por nombre..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/5 rounded-2xl text-[11px] font-medium outline-none focus:border-brand-primary/50 transition-all placeholder:text-gray-600"
                                        />
                                    </div>

                                    {/* Filtro de Instrumento */}
                                    <div className="flex items-center gap-2 w-full md:w-auto">
                                        <div className="relative flex-1 md:w-64">
                                            <select
                                                value={selectedInstrumento}
                                                onChange={(e) => setSelectedInstrumento(e.target.value)}
                                                className="w-full pl-4 pr-10 py-2.5 bg-white/[0.03] border border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-wider outline-none focus:border-brand-primary/50 appearance-none cursor-pointer"
                                            >
                                                <option value="" className="bg-surface-card text-white">Todos los Instrumentos</option>
                                                {evento?.requerimientos?.map(r => (
                                                    <option key={r.id_instrumento} value={r.id_instrumento} className="bg-surface-card text-white">
                                                        {r.instrumento?.instrumento}
                                                    </option>
                                                ))}
                                            </select>
                                            <Music2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600 pointer-events-none" />
                                        </div>
                                        {selectedInstrumento && (
                                            <button 
                                                onClick={() => setSelectedInstrumento('')}
                                                className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all border border-red-500/20"
                                                title="Limpiar Filtro"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Botón de Acción Masiva */}
                                    {canConfirm && convocatorias.some(c => !c.confirmado_por_director) && (
                                        <button 
                                            onClick={() => {
                                                const isReady = selectedInstrumento 
                                                    ? (evento?.requerimientos?.find(r => String(r.id_instrumento) === String(selectedInstrumento))?.cantidad_necesaria <= convocatorias.filter(c => String(c.miembro?.id_instrumento) === String(selectedInstrumento)).length)
                                                    : isEventComplete;

                                                if (isReady) {
                                                    handleConfirmarMasivo(selectedInstrumento);
                                                } else {
                                                    notify(selectedInstrumento ? 'Debes completar las vacantes de esta sección primero' : 'Debes completar todas las vacantes del escenario primero', 'warning');
                                                }
                                            }}
                                            className={`px-4 py-2.5 bg-brand-primary text-white rounded-xl hover:bg-brand-secondary transition-all text-[9px] font-bold uppercase tracking-wider shadow-lg shadow-brand-primary/20 flex items-center gap-2 ${
                                                (() => {
                                                    const isReady = selectedInstrumento 
                                                        ? (evento?.requerimientos?.find(r => String(r.id_instrumento) === String(selectedInstrumento))?.cantidad_necesaria <= convocatorias.filter(c => String(c.miembro?.id_instrumento) === String(selectedInstrumento)).length)
                                                        : isEventComplete;
                                                    return !isReady ? 'opacity-50 grayscale' : '';
                                                })()
                                            }`}
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            {selectedInstrumento ? 'Validar Sección' : 'Validar Escenario'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto custom-scrollbar bg-black/20">
                            <table className="w-full">
                                <thead className="bg-surface-input border-b border-white/5 sticky top-0 z-20">
                                    <tr>
                                        <th className="text-left px-8 py-5 text-[9px] font-bold text-gray-500 uppercase tracking-wider">Músico</th>
                                        <th className="text-center px-8 py-5 text-[9px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="text-right px-8 py-5 text-[9px] font-bold text-gray-500 uppercase tracking-wider w-32">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {(() => {
                                        // 💡 LOGICA INTELIGENTE: Si no hay requerimientos (ej. Ensayo), construye una lista basada en los convocados reales
                                        let displayReqs = evento?.requerimientos || [];

                                        // 🛡️ FILTRO JEFE: Si es jefe, SOLO ve requerimientos de SU INSTRUMENTO
                                        if (isJefeSeccion && !canConfirm) {
                                            displayReqs = displayReqs.filter(r => isMyResponsibility(r));
                                        }
                                        
                                        if (displayReqs.length === 0 && convocatorias.length > 0) {
                                            // Generar requerimientos virtuales basados en lo que hay
                                            const instrumentosMap = new Map();
                                            const sourceDocs = (isJefeSeccion && !canConfirm)
                                                ? convocatorias.filter(c => String(c.miembro?.id_seccion) === String(miSeccion))
                                                : convocatorias;

                                            sourceDocs.forEach(c => {
                                                if (c.miembro?.instrumento) {
                                                    const id = c.miembro.instrumento.id_instrumento;
                                                    if (!instrumentosMap.has(id)) {
                                                        instrumentosMap.set(id, {
                                                            id_instrumento: id,
                                                            cantidad_necesaria: 0, // Indefinido
                                                            instrumento: c.miembro.instrumento
                                                        });
                                                    }
                                                    instrumentosMap.get(id).cantidad_necesaria++;
                                                }
                                            });
                                            displayReqs = Array.from(instrumentosMap.values());
                                        }

                                        if (displayReqs.length === 0) {
                                            return (
                                                <tr>
                                                    <td colSpan="3" className="px-8 py-24 text-center">
                                                        <div className="flex flex-col items-center gap-4 opacity-20">
                                                            <Music2 className="w-16 h-16 text-gray-400" />
                                                            <div>
                                                                <p className="font-bold text-white uppercase text-xl">Sin Convocados</p>
                                                                <p className="text-[10px] uppercase font-bold tracking-[0.3em] mt-1">
                                                                    {canManage ? 'Añade músicos manualmente o configura el evento' : 'Aún no hay músicos asignados'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }

                                        return displayReqs
                                            .filter(req => !selectedInstrumento || req.id_instrumento === parseInt(selectedInstrumento))
                                            .map(req => {
                                                const membersInReq = filteredConvocatorias.filter(c => c.miembro?.id_instrumento === req.id_instrumento);
                                                // Si es requerimiento virtual (cantidad ajustada dinámicamente), emptySlots es 0
                                                const isVirtual = !evento?.requerimientos?.find(r => r.id_instrumento === req.id_instrumento);
                                                const emptySlots = isVirtual ? 0 : Math.max(0, req.cantidad_necesaria - membersInReq.length);
                                                
                                                const confirmadosInstrumento = convocatorias.filter(c => 
                                                    c.miembro?.id_instrumento === req.id_instrumento && c.confirmado_por_director
                                                ).length;
                                                
                                                const porcentaje = isVirtual ? 100 : Math.min(100, (membersInReq.length / req.cantidad_necesaria) * 100);
                                                const completo = isVirtual ? true : membersInReq.length >= req.cantidad_necesaria;
                                                const allConfirmed = isVirtual ? (confirmadosInstrumento === membersInReq.length && membersInReq.length > 0) : confirmadosInstrumento >= req.cantidad_necesaria;
                                                
                                                const needsConfirmation = convocatorias.some(c => 
                                                    c.miembro?.id_instrumento === req.id_instrumento && !c.confirmado_por_director
                                                );

                                                return (
                                                    <Fragment key={req.id_instrumento}>
                                                        {/* Header for Instrument Group */}
                                                        {!selectedInstrumento && (
                                                            <tr className="bg-white/[0.01]">
                                                                <td colSpan="3" className="px-8 py-3 border-y border-white/[0.02]">
                                                                    <div className="flex items-center justify-between gap-4">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                                                                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                                                                                {req.instrumento?.instrumento}
                                                                            </span>
                                                                            <span className={`text-[10px] font-bold ml-2 ${allConfirmed ? 'text-green-500' : 'text-brand-primary'}`}>
                                                                                {membersInReq.length} {!isVirtual && `/ ${req.cantidad_necesaria}`}
                                                                            </span>
                                                                        </div>
                                                                        
                                                                        <div className="flex items-center gap-4 flex-1 justify-end">
                                                                            {!isVirtual && (
                                                                                <div className="w-32 h-1 bg-black/40 rounded-full overflow-hidden">
                                                                                    <div 
                                                                                        className={`h-full transition-all duration-1000 ease-out ${allConfirmed ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : completo ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]' : 'bg-brand-primary shadow-[0_0_8px_rgba(var(--brand-primary-rgb),0.4)]'}`}
                                                                                        style={{ width: `${porcentaje}%` }}
                                                                                    />
                                                                                </div>
                                                                            )}

                                                                             {canConfirm && needsConfirmation && (
                                                                                <button 
                                                                                    onClick={() => {
                                                                                        if (completo) {
                                                                                            handleConfirmarMasivo(req.id_instrumento);
                                                                                        } else {
                                                                                            notify('Completa todas las vacantes de esta sección para validar', 'warning');
                                                                                        }
                                                                                    }}
                                                                                    className={`flex items-center gap-2 px-4 py-1.5 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all border border-green-500/20 shadow-lg shadow-green-500/5 group/conf ${!completo ? 'opacity-50 grayscale' : ''}`}
                                                                                >
                                                                                    <Check className="w-3.5 h-3.5 group-hover/conf:scale-110 transition-transform" />
                                                                                    <span>Validar Sección</span>
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}

                                                        {/* Convocated Members */}
                                                        {membersInReq.map(c => (
                                                            <tr key={c.id_convocatoria} className="hover:bg-white/[0.02] transition-all group">
                                                                <td className="px-8 py-5">
                                                                    <div className="flex items-center gap-5">
                                                                        <div className="w-11 h-11 rounded-3xl bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 flex items-center justify-center text-brand-primary font-bold text-sm border border-brand-primary/10 shadow-lg group-hover:scale-110 transition-transform duration-500">
                                                                            {c.miembro?.nombres?.charAt(0)}
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-bold text-white text-sm line-clamp-1 group-hover:text-brand-primary transition-colors">
                                                                                {c.miembro?.nombres} {c.miembro?.apellidos}
                                                                            </p>
                                                                            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-wider mt-0.5">{c.miembro?.instrumento?.instrumento}</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-5 text-center">
                                                                    {c.confirmado_por_director ? (
                                                                        <div className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase text-green-500 bg-green-500/5 px-3 py-1.5 rounded-full border border-green-500/10">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                                            READY
                                                                        </div>
                                                                    ) : (
                                                                        <div className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase text-yellow-500 bg-yellow-500/5 px-3 py-1.5 rounded-full border border-yellow-500/10">
                                                                            <Clock className="w-3 h-3" />
                                                                            WAIT
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td className="px-8 py-5 text-right w-32">
                                                                    <div className="flex justify-end gap-2">
                                                                        {!c.confirmado_por_director && canConfirm && (
                                                                            <button
                                                                                onClick={() => handleConfirmar(c.id_convocatoria)}
                                                                                className="w-9 h-9 flex items-center justify-center bg-green-500/10 hover:bg-green-500 rounded-xl text-green-500 hover:text-white transition-all active:scale-90 border border-green-500/20 shadow-lg shadow-green-500/5"
                                                                                title="Confirmar"
                                                                            >
                                                                                <Check className="w-4 h-4 stroke-[3]" />
                                                                            </button>
                                                                        )}
                                                                        {/* Un Jefe solo puede eliminar de su instrumento exacto. Admin/Dir borran todo. */}
                                                                        {(canConfirm || (isJefeSeccion && isMyResponsibility(c.miembro))) && (
                                                                            <button
                                                                                onClick={() => handleEliminar(c.id_convocatoria)}
                                                                                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500 rounded-xl text-red-500 hover:text-white transition-all active:scale-95 border border-red-500/20 shadow-lg shadow-red-500/5 group/del"
                                                                                title="Quitar"
                                                                            >
                                                                                <Trash2 className="w-3.5 h-3.5 group-hover/del:rotate-12 transition-transform" />
                                                                                <span className="text-[10px] font-bold uppercase tracking-wider">Eliminar</span>
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}

                                                        {/* Empty Placeholder Slots - Solo si es MI INSTRUMENTO */}
                                                        {!isVirtual && isMyResponsibility(req) && Array.from({ length: emptySlots }).map((_, idx) => (
                                                            <tr key={`empty-${req.id_instrumento}-${idx}`} className="group opacity-40 hover:opacity-100 transition-opacity">
                                                                <td className="px-8 py-5">
                                                                    <div className="flex items-center gap-5">
                                                                        <div className="w-11 h-11 rounded-3xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center text-gray-600 font-bold text-sm">
                                                                            ?
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-bold text-gray-600 text-sm italic">Espacio vacante</p>
                                                                            <p className="text-[9px] text-gray-700 font-bold uppercase tracking-wider mt-0.5">{req.instrumento?.instrumento}</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-5 text-center">
                                                                    <span className="text-[8px] font-bold text-gray-700 uppercase tracking-widest border border-white/5 px-2 py-1 rounded-full">Pendiente</span>
                                                                </td>
                                                                <td className="px-8 py-5 text-right w-32">
                                                                    <button 
                                                                        onClick={() => handleOpenPostularConInstrumento(req.id_instrumento)}
                                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/5 hover:bg-brand-primary text-brand-primary hover:text-white rounded-xl text-[10px] font-bold uppercase transition-all border border-brand-primary/10"
                                                                    >
                                                                        <Plus className="w-3 h-3" />
                                                                        Convocar
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </Fragment>
                                                );
                                            })
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Reclutamiento */}
            {showPostularModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setShowPostularModal(false)}
                    />
                    <div className="relative bg-surface-card border border-white/5 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-white/5 bg-surface-card/80 backdrop-blur-xl">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-white uppercase tracking-tight">Convocar Músicos</h3>
                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">
                                        {evento?.requerimientos?.find(r => String(r.id_instrumento) === String(postularInstrumento))?.instrumento?.instrumento || 'músicos'}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <button 
                                        onClick={() => setShowPostularModal(false)}
                                        className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Progress & Quota Info */}
                            {postularInstrumento && (
                                <div className="mb-8 p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                                    {(() => {
                                        const req = evento?.requerimientos?.find(r => String(r.id_instrumento) === String(postularInstrumento));
                                        if (!req) return null;
                                        
                                        const yaConvocados = convocatorias.filter(c => String(c.miembro?.id_instrumento) === String(postularInstrumento)).length;
                                        const enModal = selectedMiembros.length;
                                        const total = yaConvocados + enModal;
                                        const porc = Math.min(100, (total / req.cantidad_necesaria) * 100);
                                        const isFull = total >= req.cantidad_necesaria;

                                        return (
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">Estado de la Sección</p>
                                                        <p className={`text-xl font-black ${isFull ? 'text-green-500' : 'text-white'}`}>
                                                            {total} / {req.cantidad_necesaria} 
                                                            <span className="text-[10px] font-bold text-gray-500 ml-2 uppercase tracking-widest">Músicos</span>
                                                        </p>
                                                    </div>
                                                    {isFull && (
                                                        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-lg text-[9px] font-black uppercase animate-bounce">
                                                            <Check className="w-3 h-3" />
                                                            ¡Cuota Completa!
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="h-2 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5">
                                                    <div 
                                                        className={`h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(var(--brand-primary-rgb),0.3)] ${
                                                            isFull ? 'bg-green-500' : 'bg-brand-primary'
                                                        }`}
                                                        style={{ width: `${porc}%` }}
                                                    />
                                                </div>
                                                {isFull && (
                                                    <p className="text-[9px] text-yellow-500/70 font-bold uppercase tracking-wider text-center pt-1">
                                                        No se pueden seleccionar más músicos para este instrumento
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-primary transition-colors" />
                                <input 
                                    type="text"
                                    placeholder="Buscar por nombre..."
                                    value={postularSearch}
                                    onChange={(e) => setPostularSearch(e.target.value)}
                                    className="w-full pl-11 pr-4 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-white text-sm font-medium outline-none focus:border-brand-primary/50 focus:bg-white/[0.05] transition-all"
                                />
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 max-h-[50vh] overflow-y-auto custom-scrollbar bg-black/20">
                            {filteredDisponibles.length === 0 ? (
                                <div className="py-20 flex flex-col items-center justify-center text-center opacity-30">
                                    <Users className="w-16 h-16 mb-4 text-gray-600" />
                                    <p className="font-bold text-gray-500 uppercase">No hay músicos disponibles</p>
                                    <p className="text-[10px] font-bold uppercase tracking-wider mt-2">Prueba con otra búsqueda</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {filteredDisponibles.map(m => {
                                        const isSelected = selectedMiembros.includes(m.id_miembro);
                                        return (
                                            <div 
                                                key={m.id_miembro} 
                                                onClick={() => toggleMiembroSelection(m.id_miembro)}
                                                className={`group p-4 rounded-3xl border transition-all cursor-pointer flex items-center justify-between ${
                                                    isSelected 
                                                        ? 'bg-brand-primary/10 border-brand-primary/30' 
                                                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border transition-all ${
                                                        isSelected ? 'bg-brand-primary text-white border-brand-primary/50 shadow-lg shadow-brand-primary/20' : 'bg-white/5 text-gray-500 border-white/5'
                                                    }`}>
                                                        {m.nombres.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white leading-tight">{m.nombres}</p>
                                                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">{m.apellidos}</p>
                                                    </div>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                                    isSelected ? 'bg-green-500 border-green-500 text-white' : 'border-white/10'
                                                }`}>
                                                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 border-t border-white/5 bg-surface-card flex items-center justify-between">
                            <div className="text-gray-500">
                                <span className="text-xl font-bold text-white">{selectedMiembros.length}</span>
                                <span className="text-[10px] uppercase font-bold tracking-widest ml-2">Seleccionados</span>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="ghost" onClick={() => { setShowPostularModal(false); setSelectedMiembros([]); }}>
                                    Cancelar
                                </Button>
                                <Button 
                                    onClick={handlePostular}
                                    disabled={selectedMiembros.length === 0}
                                    className="px-8 shadow-xl shadow-brand-primary/20"
                                >
                                    Convocar Seleccionados
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

