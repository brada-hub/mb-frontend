import { useState, useEffect } from 'react';
import api from '../../api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { 
    Search, Plus, Layers, Edit, Trash2, Users, 
    MoreVertical, CheckCircle2, XCircle, Filter,
    LayoutGrid, List, ChevronRight, Info, Calendar,
    AlertCircle, Clock, MapPin, ArrowRight
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import FormacionModal from '../../components/modals/FormacionModal';
import { SkeletonFormacionCard } from '../../components/ui/skeletons/Skeletons';

export default function FormacionesList() {
    const { notify } = useToast();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('convocatorias'); // 'convocatorias' | 'plantillas'
    
    // Data states
    const [convocatorias, setConvocatorias] = useState([]);
    const [plantillas, setPlantillas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    // UI states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlantilla, setSelectedPlantilla] = useState(null);

    const isJefeSeccion = user?.miembro?.rol?.rol === 'JEFE DE SECCIÓN';
    const isAdminOrDirector = ['ADMIN', 'DIRECTOR'].includes(user?.miembro?.rol?.rol);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/eventos/proximas-convocatorias');
            setConvocatorias(res.data || []);
        } catch (error) {
            notify(`Error al cargar las convocatorias próximas`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredConvocatorias = convocatorias.filter(c => 
        c.evento.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.tipo?.evento?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight transition-colors">Centro de Formaciones</h1>
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-widest mt-1 transition-colors">
                        Gestiona el personal y arma las listas para tus próximos eventos
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <button 
                        onClick={() => navigate('/dashboard/reportes')}
                        className="px-6 py-3 rounded-2xl bg-white/5 border border-white/5 text-indigo-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest active:scale-95"
                    >
                        <LayoutGrid className="w-4 h-4" />
                        Ver Matriz
                    </button>
                </div>
            </div>

            {/* Content Display - Listas por Evento */}
            <div className="space-y-6">
                <div className="relative group max-w-2xl">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                    <Input 
                        placeholder="Buscar evento o contrato..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-16 h-14 rounded-2xl bg-black/20 border-white/5 text-sm font-bold w-full"
                    />
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <SkeletonFormacionCard key={i} />
                        ))}
                    </div>
                ) : filteredConvocatorias.length === 0 ? (
                    <div className="bg-surface-card border border-white/5 rounded-[3rem] p-20 text-center flex flex-col items-center">
                        <Calendar className="w-16 h-16 text-gray-700 mb-6" />
                        <h2 className="text-2xl font-black text-white uppercase mb-2">No hay listas pendientes</h2>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Los eventos aparecerán aquí cuando tengan requerimientos de personal definidos.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredConvocatorias.map((evento, idx) => (
                            <motion.div
                                key={evento.id_evento}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => navigate(`/dashboard/eventos/${evento.id_evento}/convocatoria`)}
                                className="group relative bg-surface-card border border-white/5 hover:border-indigo-500/30 transition-all duration-500 rounded-[2.5rem] p-6 cursor-pointer overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Calendar className="w-24 h-24" />
                                </div>

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-500/20">
                                            {evento.tipo?.evento}
                                        </div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {evento.hora?.substring(0, 5)}
                                        </p>
                                    </div>

                                    <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-indigo-400 transition-colors">
                                        {evento.evento}
                                    </h3>
                                    
                                    <p className="text-[10px] text-gray-500 font-bold uppercase flex items-center gap-1.5 mb-2">
                                        <MapPin className="w-3 h-3" /> {evento.direccion || 'Sin dirección'}
                                    </p>

                                    {/* Jefe de Sección Badge */}
                                    {evento.mi_seccion_status && (
                                        <div className={clsx(
                                            "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border mb-4 self-start text-[10px] font-black uppercase tracking-tight transition-all",
                                            evento.mi_seccion_status.completado 
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                                : "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                                        )}>
                                            <Users className="w-3 h-3" />
                                            {evento.mi_seccion_status.instrumento}: {evento.mi_seccion_status.convocados} / {evento.mi_seccion_status.total}
                                            {evento.mi_seccion_status.completado && <CheckCircle2 className="w-3 h-3" />}
                                        </div>
                                    )}

                                    <div className="mt-auto pt-6 border-t border-white/5">
                                        <div className="flex justify-between items-end mb-2">
                                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Progreso Formación</p>
                                            <p className={clsx(
                                                "text-sm font-black",
                                                evento.meta_formacion?.completado ? "text-emerald-500" : "text-amber-500"
                                            )}>
                                                {evento.meta_formacion?.total_convocado} / {evento.meta_formacion?.total_necesario}
                                            </p>
                                        </div>
                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${evento.meta_formacion?.porcentaje}%` }}
                                                className={clsx(
                                                    "h-full rounded-full transition-all",
                                                    evento.meta_formacion?.completado ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                                                )}
                                            />
                                        </div>
                                        
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                                                {evento.fecha && new Date(evento.fecha + 'T12:00:00').toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })}
                                            </span>
                                            <div className="flex items-center gap-1 text-indigo-400 text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                                                Armar Lista <ArrowRight className="w-3 h-3" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Formación */}
            <FormacionModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={loadData}
                formacionToEdit={selectedPlantilla}
            />
        </div>
    );
}
