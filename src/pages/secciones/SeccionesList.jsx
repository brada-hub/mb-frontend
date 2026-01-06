import { useState, useEffect } from 'react';
import api from '../../api';
import { Button } from '../../components/ui/Button';
import { Layers, Plus, Trash2, Edit2, Search, AlertCircle, Music } from 'lucide-react';
import SeccionModal from '../../components/modals/SeccionModal';
import InstrumentoModal from '../../components/modals/InstrumentoModal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { clsx } from 'clsx';

export default function SeccionesList() {
    const [secciones, setSecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isInstrumentModalOpen, setIsInstrumentModalOpen] = useState(false);
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
        <div className="h-full overflow-y-auto custom-scrollbar space-y-6 pr-2">
            <SeccionModal 
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedSeccion(null);
                }}
                onSuccess={loadSecciones}
                seccion={selectedSeccion}
            />

            <InstrumentoModal 
                isOpen={isInstrumentModalOpen}
                onClose={() => {
                    setIsInstrumentModalOpen(false);
                    setSelectedSeccion(null);
                    loadSecciones(); // Recargar para ver si cambió algo si es necesario
                }}
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

            {/* Header Section Clean */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-2">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">Secciones</h1>
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-widest mt-1">Gestión de instrumentos</p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
                    <div className="w-full md:w-80">
                        <Input 
                            icon={Search}
                            placeholder="Buscar sección..." 
                            className="h-12 w-full text-sm bg-[#161b2c] border-white/5 rounded-xl focus:ring-brand-primary/50"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleAdd} className="h-12 px-6 shadow-lg shadow-brand-primary/10 text-xs font-black uppercase tracking-widest rounded-xl bg-brand-primary hover:bg-brand-primary/90 shrink-0">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Sincronizando Secciones...</p>
                </div>
            ) : filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
                        {filtered.map((s) => (
                            <div 
                                key={s.id_seccion} 
                                className="group bg-surface-card border border-white/5 rounded-[40px] p-8 hover:border-brand-primary/20 transition-all duration-500 hover:shadow-2xl flex flex-col h-full relative"
                            >
                                {/* Top Info */}
                                <div className="flex items-center gap-5 mb-8">
                                    <div className="w-16 h-16 bg-[#1e2330] rounded-3xl flex items-center justify-center text-indigo-500 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                        <Layers className="w-8 h-8" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none mb-2">
                                            {s.seccion}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-1 bg-green-500/10 text-green-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-green-500/10">Activa</span>
                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                                <span className="opacity-30">.</span> {s.instrumentos?.length || 0} Instrumentos
                                            </span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setSelectedSeccion(s);
                                            setIsInstrumentModalOpen(true);
                                        }}
                                        className="w-12 h-12 rounded-2xl bg-[#1e2330] flex items-center justify-center text-indigo-400 hover:bg-brand-primary hover:text-white transition-all shadow-lg active:scale-95"
                                    >
                                        <Music className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="mb-10 flex-grow">
                                    <p className="text-sm text-gray-400 font-medium uppercase tracking-tight leading-relaxed line-clamp-3">
                                        {s.descripcion || 'Sin descripción detallada de la sección.'}
                                    </p>
                                </div>

                                {/* Action Buttons - Layout Matching Image */}
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            onClick={() => handleEdit(s)}
                                            className="h-12 rounded-2xl bg-white/5 text-white text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5 active:scale-95"
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteClick(s.id_seccion)}
                                            disabled={s.instrumentos?.length > 0}
                                            className={clsx(
                                                "h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border active:scale-95",
                                                s.instrumentos?.length > 0
                                                    ? "bg-white/2 border-white/5 text-gray-700 cursor-not-allowed opacity-20"
                                                    : "bg-red-500/5 text-red-500/60 hover:bg-red-500/10 hover:text-red-500 border-red-500/10"
                                            )}
                                            title={s.instrumentos?.length > 0 ? "No puedes eliminar una sección con instrumentos activos" : "Eliminar Sección"}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setSelectedSeccion(s);
                                            setIsInstrumentModalOpen(true);
                                        }}
                                        className="w-full h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white text-[11px] font-black uppercase tracking-[0.15em] transition-all border border-indigo-500/20 shadow-lg active:scale-[0.98]"
                                    >
                                        Gestionar Instrumentos
                                    </button>
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
