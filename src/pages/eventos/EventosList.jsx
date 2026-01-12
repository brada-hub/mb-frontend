import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, MapPin, Clock, Search, MoreVertical, Edit, Trash2, Navigation, Users, CheckCircle, Info, Briefcase, Activity } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import EventoModal from '../../components/modals/EventoModal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import api from '../../api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export default function EventosList() {
    const navigate = useNavigate();
    const { notify } = useToast();
    const { user } = useAuth();
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('ENSAYOS'); // 'ENSAYOS' o 'CONTRATOS'
    
    // Check Permissions
    const isAdmin = user?.role === 'ADMIN';
    const canManage = isAdmin || user?.role === 'DIRECTOR' || user?.role === 'ADMINISTRADOR';

    // Helper to check if event is past (already started)
    const getStatus = (fecha, hora, tipo) => {
        const eventDate = new Date(`${fecha}T${hora}`);
        const now = new Date();
        const isPast = eventDate < now;
        
        // Margen dinámico desde el tipo de evento (default 24h)
        const hrsSellar = tipo?.horas_despues_sellar ?? 24;
        const lockTime = new Date(eventDate.getTime() + hrsSellar * 60 * 60 * 1000);
        
        const isLocked = now > lockTime;
        return { isPast, isLocked };
    };

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvento, setEditingEvento] = useState(null);
    const [confirmState, setConfirmState] = useState({ isOpen: false, id: null });

    useEffect(() => {
        loadEventos();
    }, []);

    const loadEventos = async () => {
        setLoading(true);
        try {
            const res = await api.get('/eventos'); 
            setEventos(res.data);
        } catch (error) {
            console.error(error);
            notify('Error al cargar agenda', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingEvento(null);
        setIsModalOpen(true);
    };

    const handleEdit = async (evento) => {
        try {
            const res = await api.get(`/eventos/${evento.id_evento}`);
            setEditingEvento(res.data);
            setIsModalOpen(true);
        } catch (error) {
            console.error(error);
            notify('Error al cargar detalles', 'error');
        }
    };

    const handleDeleteClick = (id) => {
        setConfirmState({ isOpen: true, id });
    };

    const handleConfirmDelete = async () => {
        try {
            await api.delete(`/eventos/${confirmState.id}`);
            notify('Eliminado correctamente', 'success');
            loadEventos();
        } catch (error) {
            notify('Error al eliminar', 'error');
        } finally {
            setConfirmState({ isOpen: false, id: null });
        }
    };

    const getTypeColor = (tipo) => {
        switch (tipo?.toUpperCase()) {
            case 'ENSAYO': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            case 'PRESENTACION': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
            case 'FIESTA': return 'text-pink-400 bg-pink-500/10 border-pink-500/20';
            case 'REUNION': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
            case 'VIAJE': return 'text-green-400 bg-green-500/10 border-green-500/20';
            default: return 'text-gray-400 bg-white/5 border-white/10';
        }
    };

    // Filter by Tab AND Search
    const filteredEventos = eventos
        .filter(e => {
            const eventType = e.tipo?.evento?.toUpperCase();
            const matchesTab = activeTab === 'ENSAYOS' ? eventType === 'ENSAYO' : eventType !== 'ENSAYO';
            
            if (!matchesTab) return false;

            const term = searchTerm.toLowerCase();
            const nombre = e.evento?.toLowerCase() || '';
            const tipo = e.tipo?.evento?.toLowerCase() || '';
            const fecha = e.fecha || '';
            return nombre.includes(term) || tipo.includes(term) || fecha.includes(term);
        })
        .sort((a, b) => new Date(b.fecha + 'T' + b.hora) - new Date(a.fecha + 'T' + a.hora));

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Unified */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-2">
                <div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight">Agenda de la Banda</h1>
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-widest mt-1">Control de ensayos y presentaciones</p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
                    <div className="w-full md:w-80">
                        <Input 
                            icon={Search}
                            placeholder="Buscar evento..." 
                            className="h-12 w-full text-sm bg-[#161b2c] border-white/5 rounded-xl focus:ring-brand-primary/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    {canManage && (
                        <Button onClick={handleCreate} className="h-12 px-6 shadow-lg shadow-brand-primary/10 text-xs font-black uppercase tracking-widest rounded-xl bg-brand-primary hover:bg-brand-primary/90 shrink-0">
                            <Plus className="w-4 h-4 mr-2" />
                            Nuevo Evento
                        </Button>
                    )}
                </div>
            </div>

            {/* TABS SELECTOR */}
            <div className="flex p-1 bg-white/5 rounded-2xl w-full max-w-md border border-white/5">
                <button 
                    onClick={() => setActiveTab('ENSAYOS')}
                    className={clsx(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-xs tracking-widest uppercase",
                        activeTab === 'ENSAYOS' ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-white"
                    )}
                >
                    Ensayos & Actividades
                </button>
                <button 
                    onClick={() => setActiveTab('CONTRATOS')}
                    className={clsx(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-xs tracking-widest uppercase",
                        activeTab === 'CONTRATOS' ? "bg-purple-600 text-white shadow-lg" : "text-gray-500 hover:text-white"
                    )}
                >
                    Contratos & Shows
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div className="text-center py-20 text-gray-500 flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-bold uppercase tracking-widest">Sincronizando Agenda...</span>
                </div>
            ) : filteredEventos.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredEventos.map(evento => {
                        const { isPast, isLocked } = getStatus(evento.fecha, evento.hora, evento.tipo);
                        const lockActions = isLocked && !isAdmin;

                        return (
                            <div 
                                key={evento.id_evento} 
                                className={clsx(
                                    "relative group bg-surface-card border rounded-3xl overflow-hidden transition-all border-white/10",
                                    !isPast && "hover:scale-[1.02] hover:shadow-2xl",
                                    isPast && "opacity-75 grayscale-[0.5]",
                                    canManage && !lockActions && "hover:border-brand-primary/50"
                                )}
                            >
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-2">
                                            <span className={clsx(
                                                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                                                getTypeColor(evento.tipo?.evento)
                                            )}>
                                                {evento.tipo?.evento}
                                            </span>
                                            {isPast && (
                                                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-gray-500/30 bg-gray-500/10 text-gray-400">
                                                    Histórico
                                                </span>
                                            )}
                                        </div>
                                        
                                        {canManage && !lockActions && (
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEdit(evento)} className="p-2 hover:bg-white/10 rounded-lg text-blue-400">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeleteClick(evento.id_evento)} className="p-2 hover:bg-white/10 rounded-lg text-red-400">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1 line-clamp-2">{evento.evento}</h3>
                                        <p className="text-sm text-gray-400 font-medium flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-brand-primary" />
                                            {new Date(evento.fecha + 'T12:00:00').toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long' })}
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-surface-input rounded-xl">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-500">Hora</p>
                                                <p className="text-sm font-bold text-white">{evento.hora.substr(0, 5)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-surface-input rounded-xl">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-[10px] uppercase font-bold text-gray-500">Lugar</p>
                                                <p className="text-sm font-bold text-white truncate" title={evento.direccion || 'Ubicación GPS'}>
                                                    {evento.direccion || 'Coordenadas GPS'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {evento.latitud && (
                                        <a 
                                            href={`https://www.google.com/maps?q=${evento.latitud},${evento.longitud}`} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="block mt-2 py-2 text-center text-xs font-bold text-brand-secondary bg-brand-secondary/5 hover:bg-brand-secondary/10 rounded-xl transition-colors"
                                        >
                                            <Navigation className="w-3 h-3 inline-block mr-1 -mt-0.5" />
                                            Ver Mapa
                                        </a>
                                    )}
                                    
                                    {/* Actions Footer - Role Based */}
                                    <div className="mt-2 space-y-2">
                                        {canManage ? (
                                            <button 
                                                onClick={() => navigate(`/dashboard/eventos/${evento.id_evento}/convocatoria`)}
                                                className={clsx(
                                                    "w-full py-2 text-center text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2",
                                                    isPast 
                                                        ? "text-gray-400 bg-white/5 hover:bg-white/10" 
                                                        : "text-brand-primary bg-brand-primary/5 hover:bg-brand-primary/10"
                                                )}
                                            >
                                                {isPast ? <Activity className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                                                {isPast ? 'Ver Reporte de Asistencia' : 'Gestionar Convocatoria'}
                                            </button>
                                        ) : (
                                            <>
                                                <div className="text-center">
                                                    {evento.estoy_convocado ? (
                                                        <span className={clsx(
                                                            "text-[10px] font-bold flex items-center justify-center gap-1",
                                                            isPast ? "text-gray-500" : "text-green-500 animate-pulse"
                                                        )}>
                                                            <CheckCircle className="w-3 h-3" /> {isPast ? 'ESTUVISTE PRESENTE' : 'TE TOCA IR'}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-gray-600 flex items-center justify-center gap-1">
                                                            <Info className="w-3 h-3" /> Solo Informativo
                                                        </span>
                                                    )}
                                                </div>
                                                <button 
                                                    onClick={() => navigate(`/dashboard/eventos/${evento.id_evento}/convocatoria`)}
                                                    className="w-full py-2 text-center text-xs font-bold text-gray-400 bg-white/5 hover:bg-white/10 rounded-xl transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Users className="w-3 h-3" />
                                                    {isPast ? 'Ver Detalles' : 'Ver Formación'}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-20 bg-surface-card border border-white/5 rounded-3xl">
                    <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg font-medium">No hay eventos en esta categoría</p>
                    {canManage && (
                        <Button onClick={handleCreate} variant="link" className="mt-2 text-brand-primary">
                            Crear el primero ahora
                        </Button>
                    )}
                </div>
            )}

            <EventoModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={loadEventos}
                eventoToEdit={editingEvento}
                defaultType={activeTab === 'ENSAYOS' ? 'ENSAYO' : 'PRESENTACION'}
            />

            <ConfirmModal 
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState({ isOpen: false, id: null })}
                onConfirm={handleConfirmDelete}
                title="¿Eliminar?"
                message="Esta acción no se puede deshacer."
                confirmText="Sí, Eliminar"
                variant="danger"
            />
        </div>
    );
}
