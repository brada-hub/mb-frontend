import { useState, useEffect } from 'react';
import { Calendar, Plus, MapPin, Clock, Search, MoreVertical, Edit, Trash2, Navigation } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import EventoModal from '../../components/modals/EventoModal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import api from '../../api';
import { useToast } from '../../context/ToastContext';

export default function EventosList() {
    const { notify } = useToast();
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
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
            // Fetch 'proximos' or 'all'? Let's fetch all for management, but maybe filter in backend later.
            // Using the 'index' endpoint which returns all sorted by date desc
            const res = await api.get('/eventos'); 
            setEventos(res.data);
        } catch (error) {
            console.error(error);
            notify('Error al cargar eventos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingEvento(null);
        setIsModalOpen(true);
    };

    const handleEdit = (evento) => {
        setEditingEvento(evento);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id) => {
        setConfirmState({ isOpen: true, id });
    };

    const handleConfirmDelete = async () => {
        try {
            await api.delete(`/eventos/${confirmState.id}`);
            notify('Evento eliminado', 'success');
            loadEventos();
        } catch (error) {
            notify('Error al eliminar evento', 'error');
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

    const filteredEventos = eventos
        .filter(e => {
            const term = searchTerm.toLowerCase();
            const nombre = e.evento?.toLowerCase() || '';
            const tipo = e.tipo?.evento?.toLowerCase() || '';
            const fecha = e.fecha || '';
            return nombre.includes(term) || tipo.includes(term) || fecha.includes(term);
        })
        .sort((a, b) => new Date(b.fecha + 'T' + b.hora) - new Date(a.fecha + 'T' + a.hora));

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-white italic tracking-tighter">AGENDA DE EVENTOS</h1>
                    <p className="text-gray-400 mt-2 font-medium">Gestiona ensayos, presentaciones y actividades.</p>
                </div>
                <Button onClick={handleCreate} variant="monster" className="shadow-lg shadow-brand-primary/20">
                    <Plus className="w-5 h-5 mr-2" />
                    Nuevo Evento
                </Button>
            </div>

            {/* Search */}
            <div className="bg-surface-card p-4 rounded-3xl border border-white/5 shadow-xl">
                <Input 
                    icon={Search} 
                    placeholder="Buscar eventos..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-surface-input border-transparent focus:border-brand-primary"
                />
            </div>

            {/* List */}
            {loading ? (
                <div className="text-center py-20 text-gray-500">Cargando agenda...</div>
            ) : filteredEventos.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredEventos.map(evento => {
                        const eventDate = new Date(`${evento.fecha}T${evento.hora}`);
                        const isPast = eventDate < new Date();

                        return (
                            <div key={evento.id_evento} className={`relative group bg-surface-card border rounded-3xl overflow-hidden transition-all hover:scale-[1.02] hover:shadow-2xl ${isPast ? 'border-white/5 opacity-75 grayscale-[50%]' : 'border-white/10 hover:border-brand-primary/50'}`}>
                                {/* Status Banner for Past Events */}
                                {isPast && (
                                    <div className="absolute top-0 inset-x-0 h-1 bg-gray-600"></div>
                                )}
                                
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getTypeColor(evento.tipo?.evento)}`}>
                                            {evento.tipo?.evento}
                                        </span>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEdit(evento)} className="p-2 hover:bg-white/10 rounded-lg text-blue-400">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteClick(evento.id_evento)} className="p-2 hover:bg-white/10 rounded-lg text-red-400">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1 line-clamp-2">{evento.evento}</h3>
                                        <p className="text-sm text-gray-400 font-medium flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-brand-primary" />
                                            {new Date(evento.fecha).toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long' })}
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
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-20 bg-surface-card border border-white/5 rounded-3xl">
                    <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg font-medium">No hay eventos programados</p>
                    <Button onClick={handleCreate} variant="link" className="mt-2 text-brand-primary">
                        Crear el primero ahora
                    </Button>
                </div>
            )}

            <EventoModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={loadEventos}
                eventoToEdit={editingEvento}
            />

            <ConfirmModal 
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState({ isOpen: false, id: null })}
                onConfirm={handleConfirmDelete}
                title="¿Eliminar Evento?"
                message="Esta acción no se puede deshacer. Se perderán los registros de asistencia asociados."
                confirmText="Sí, Eliminar"
                variant="danger"
            />
        </div>
    );
}
