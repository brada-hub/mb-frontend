import { useState, useEffect } from 'react';
import api from '../../api';
import { Button } from '../../components/ui/Button';
import { Layers, Plus, Trash2, Edit2, Search, AlertCircle } from 'lucide-react';
import SeccionModal from '../../components/modals/SeccionModal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';

export default function SeccionesList() {
    const [secciones, setSecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSeccion, setSelectedSeccion] = useState(null);
    const [confirmState, setConfirmState] = useState({ isOpen: false, id: null, loading: false });
    const { notify } = useToast();

    const loadSecciones = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        setLoading(true);
        try {
            const res = await api.get('/secciones');
            setSecciones(res.data);
        } catch (error) {
            console.error("Error loading sections:", error);
            notify("Error al cargar las secciones", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSecciones();
    }, []);

    const handleEdit = (seccion) => {
        setSelectedSeccion(seccion);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedSeccion(null);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id) => {
        setConfirmState({ isOpen: true, id, loading: false });
    };

    const handleConfirmDelete = async () => {
        setConfirmState(prev => ({ ...prev, loading: true }));
        try {
            await api.delete(`/secciones/${confirmState.id}`);
            notify("Sección eliminada correctamente", "success");
            loadSecciones();
            setConfirmState({ isOpen: false, id: null, loading: false });
        } catch (error) {
            console.error("Error deleting section:", error);
            const msg = error.response?.data?.message || "Error al eliminar la sección";
            notify(msg, "error");
            setConfirmState(prev => ({ ...prev, loading: false }));
        }
    };

    const filtered = secciones.filter(s => 
        s.seccion.toLowerCase().includes(search.toLowerCase()) ||
        (s.descripcion && s.descripcion.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <SeccionModal 
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedSeccion(null);
                }}
                onSuccess={loadSecciones}
                seccion={selectedSeccion}
            />

            <ConfirmModal 
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState({ isOpen: false, id: null, loading: false })}
                onConfirm={handleConfirmDelete}
                loading={confirmState.loading}
                title="Eliminar Sección"
                message="¿Estás seguro de eliminar esta sección? Esta acción es irreversible y afectará a la organización de la banda."
                confirmText="Eliminar Ahora"
                variant="danger"
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Secciones de la Banda</h1>
                    <p className="text-gray-400 text-sm">Distribución técnica de los integrantes</p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                        <Input 
                            placeholder="Buscar sección..." 
                            className="pl-10 h-11 w-full md:w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleAdd} className="h-11 shadow-lg shadow-brand-primary/20">
                        <Plus className="w-5 h-5 mr-2" />
                        Nueva Sección
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Sincronizando Secciones...</p>
                </div>
            ) : filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filtered.map((s) => (
                        <div 
                            key={s.id_seccion} 
                            className="group bg-surface-card border border-white/5 rounded-[32px] p-6 hover:border-brand-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-primary/5 flex flex-col h-full"
                        >
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
                                    <Layers className="w-8 h-8" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight truncate group-hover:text-brand-primary transition-colors">
                                        {s.seccion}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full text-[9px] font-black uppercase tracking-widest">Activa</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-400 mb-8 flex-grow leading-relaxed">
                                {s.descripcion || 'Sin descripción detallada de la familia de instrumentos.'}
                            </p>

                            <div className="flex items-center gap-2 pt-6 border-t border-white/5">
                                <Button 
                                    className="flex-1 h-10 text-xs font-bold" 
                                    variant="secondary"
                                    onClick={() => handleEdit(s)}
                                >
                                    <Edit2 className="w-3.5 h-3.5 mr-2" /> EDITAR
                                </Button>
                                <Button 
                                    className="flex-1 h-10 text-xs font-bold" 
                                    variant="danger"
                                    onClick={() => handleDeleteClick(s.id_seccion)}
                                    title="Eliminar sección"
                                >
                                    <Trash2 className="w-3.5 h-3.5 mr-2" /> ELIMINAR
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-surface-card border border-dashed border-white/10 rounded-[32px] text-center">
                    <AlertCircle className="w-16 h-16 text-white/5 mb-4" />
                    <p className="text-white font-extrabold uppercase tracking-widest">No hay secciones registradas</p>
                    <p className="text-gray-500 text-sm mt-1">Crea una nueva sección para organizar tus instrumentos.</p>
                </div>
            )}
        </div>
    );
}
