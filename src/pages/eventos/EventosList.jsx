import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, MapPin, Clock, Search, MoreVertical, Edit, Trash2, Navigation, Users, CheckCircle, Info, Briefcase, Activity } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import EventoModal from '../../components/modals/EventoModal';
import CalendarioMensual from './CalendarioMensual';
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
    // const [searchTerm, setSearchTerm] = useState(''); // REMOVED
    // const [activeTab, setActiveTab] = useState('ENSAYOS'); // REMOVED
    const [showCalendar, setShowCalendar] = useState(false);
    
    // Check Permissions
    const canManage = user?.role === 'ADMIN' || user?.role === 'DIRECTOR' || !!user?.is_super_admin;
    
    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvento, setEditingEvento] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
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

    const handleCreate = (date = null) => {
        setEditingEvento(null);
        // Si viene un evento (e.g. click en boton), ignorarlo si no es string
        const d = (typeof date === 'string') ? date : null;
        setSelectedDate(d);
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
    

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Unified */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-2">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight transition-colors">Agenda de la Banda</h1>
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-widest mt-1 transition-colors">Control de ensayos y presentaciones</p>
                </div>
                
                {canManage && (
                    <Button onClick={() => handleCreate()} className="h-12 px-8 shadow-xl shadow-brand-primary/20 text-[10px] font-black uppercase tracking-widest rounded-2xl bg-indigo-600 hover:bg-indigo-500 shrink-0">
                        <Plus className="w-5 h-5 mr-2" />
                        Programar Actividad
                    </Button>
                )}
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-500 flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-bold uppercase tracking-widest">Sincronizando Agenda...</span>
                </div>
            ) : (
                <CalendarioMensual 
                    eventos={eventos} 
                    onEventClick={handleEdit}
                    onDateClick={canManage ? handleCreate : undefined}
                />
            )}

            <EventoModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={loadEventos}
                eventoToEdit={editingEvento}
                defaultDate={selectedDate}
                defaultType="ENSAYO"
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
