import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { 
    Search, 
    Plus, 
    Layers, 
    ChevronRight, 
    Edit, 
    Trash2,
    Music,
    FileText,
    Play,
    Lock,
    Unlock,
    ArrowLeft,
    EyeOff,
    Eye
} from 'lucide-react';
import { clsx } from 'clsx';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import MixModal from '../../components/modals/MixModal';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import MultimediaViewerModal from '../../components/modals/MultimediaViewerModal';

export default function MixesList() {
    const navigate = useNavigate();
    const { notify } = useToast();
    const { user } = useAuth();
    
    const [mixes, setMixes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMixModalOpen, setIsMixModalOpen] = useState(false);
    const [mixToEdit, setMixToEdit] = useState(null);
    const [selectedMix, setSelectedMix] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, id: null, type: 'mix' });
    const [viewerData, setViewerData] = useState(null);
    const [mobileView, setMobileView] = useState('list'); // 'list' or 'detail'

    const [editMode, setEditMode] = useState(() => {
        const saved = localStorage.getItem('monster_admin_mode');
        return saved === 'true';
    });

    const toggleEditMode = () => {
        const newMode = !editMode;
        setEditMode(newMode);
        localStorage.setItem('monster_admin_mode', newMode);
    };

    const userRole = (user?.role || user?.miembro?.rol?.rol || '').toUpperCase();
    // Bloqueo estricto: Solo ADMIN y DIRECTOR gestionan. Jefes y Miembros solo ven/estudian.
    const authorized = userRole === 'ADMIN' || userRole === 'DIRECTOR';
    const canManage = authorized && editMode;

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('mixes');
            setMixes(res.data);
            
            // Si hay un mix seleccionado, refrescarlo
            if (selectedMix) {
                const updatedMix = res.data.find(m => m.id_mix === selectedMix.id_mix);
                if (updatedMix) {
                    const fullRes = await api.get(`mixes/${updatedMix.id_mix}`);
                    setSelectedMix(fullRes.data);
                }
            }
        } catch (error) {
            notify("Error al cargar los mixes", "error");
        } finally {
            setLoading(false);
        }
    }, [notify, selectedMix]);

    useEffect(() => {
        loadData();
    }, []);

    const filteredMixes = useMemo(() => {
        return mixes.filter(m => m.nombre.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [mixes, searchQuery]);

    const handleSelectMix = async (mix) => {
        try {
            const res = await api.get(`mixes/${mix.id_mix}`);
            setSelectedMix(res.data);
            setMobileView('detail');
        } catch (error) {
            notify("Error al cargar el mix", "error");
        }
    };

    const handleToggleVisibility = async (e, mix) => {
        e.stopPropagation();
        try {
            const formData = new FormData();
            formData.append('_method', 'PUT');
            formData.append('nombre', mix.nombre);
            formData.append('activo', mix.activo ? '0' : '1');

            await api.post(`mixes/${mix.id_mix}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            notify(`Mix ${mix.activo ? 'oculto' : 'publicado'} correctamente`, "success");
            loadData();
        } catch (error) {
            notify("Error al cambiar visibilidad", "error");
        }
    };

    return (
        <div className="h-full overflow-y-auto lg:overflow-hidden custom-scrollbar animate-in fade-in duration-700">
            {/* Layout Principal - Dos Columnas */}
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:h-full">
                
                {/* Columna Izquierda: Lista de Mixes */}
                <aside className={clsx(
                    "flex flex-col lg:h-full lg:overflow-y-auto lg:pr-2 lg:custom-scrollbar px-2",
                    mobileView === 'detail' && 'hidden lg:flex'
                )}>
                    {/* Header Mixes - Compacto */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
                        <div>
                            <h2 className="text-lg font-black text-white uppercase tracking-tight">Mixes</h2>
                            <p className="text-gray-500 text-[10px] font-medium uppercase tracking-widest">Repertorios disponibles</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {authorized && (
                                <button
                                    onClick={toggleEditMode}
                                    className={clsx(
                                        "h-9 px-3 rounded-lg flex items-center gap-1.5 transition-all duration-300 font-black text-[9px] uppercase tracking-widest border",
                                        editMode 
                                            ? "bg-brand-primary/20 border-brand-primary text-brand-primary" 
                                            : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                    )}
                                >
                                    {editMode ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                </button>
                            )}
                            <Input 
                                icon={Search}
                                placeholder="Buscar..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-9 w-32 bg-[#161b2c] border-white/5 rounded-lg text-xs"
                            />
                            {canManage && (
                                <Button 
                                    onClick={() => {
                                        setMixToEdit(null);
                                        setIsMixModalOpen(true);
                                    }}
                                    className="h-9 px-3 text-[9px] font-black uppercase tracking-widest rounded-lg bg-indigo-600 hover:bg-indigo-500"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {loading && mixes.length === 0 ? (
                        <div className="py-20 text-center animate-pulse">
                            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Cargando repertorios...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 pb-20">
                            {filteredMixes.map((mix) => (
                                <div
                                    key={mix.id_mix}
                                    onClick={() => handleSelectMix(mix)}
                                    className={clsx(
                                        "group relative flex flex-col rounded-2xl transition-all duration-300 overflow-hidden shadow-lg cursor-pointer border-2",
                                        selectedMix?.id_mix === mix.id_mix 
                                            ? "border-indigo-500 bg-indigo-500/5" 
                                            : "border-white/5 bg-surface-card hover:border-white/20",
                                        !mix.activo && "opacity-60 saturate-50"
                                    )}
                                >
                                    <div className="p-4">
                                        <div className="flex items-center gap-4">
                                            <div className={clsx(
                                                "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                                                selectedMix?.id_mix === mix.id_mix 
                                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" 
                                                    : "bg-white/5 text-gray-400 group-hover:bg-indigo-600/20 group-hover:text-indigo-400"
                                            )}>
                                                <Layers className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-xl font-black text-white uppercase tracking-tight mb-1">{mix.nombre}</h4>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                                        {mix.temas_count} CANCIONES
                                                    </span>
                                                    <span className="w-1 h-1 rounded-full bg-white/10" />
                                                    {!mix.activo ? (
                                                        <span className="flex items-center gap-1 text-[9px] text-red-500 font-black uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/10">
                                                            <EyeOff className="w-3 h-3" /> REPERTORIO OCULTO
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">
                                                            SETLIST LISTO
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {mix.audio && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setViewerData({
                                                            files: [{
                                                                url: mix.audio.url_audio.replace('monster-back:8000', 'localhost:8000'),
                                                                title: `Mix: ${mix.nombre} - Guía Principal`,
                                                                type: 'audio'
                                                            }],
                                                            initialIndex: 0
                                                        });
                                                    }}
                                                    className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white flex items-center justify-center transition-all"
                                                >
                                                    <Play className="w-4 h-4 fill-current" />
                                                </button>
                                            )}
                                            <ChevronRight className={clsx(
                                                "w-6 h-6 transition-all",
                                                selectedMix?.id_mix === mix.id_mix ? "text-indigo-400 translate-x-1" : "text-gray-700"
                                            )} />
                                        </div>
                                    </div>

                                    {canManage && (
                                        <div className="px-6 pb-6 pt-0 flex gap-2">
                                            <button 
                                                onClick={(e) => handleToggleVisibility(e, mix)}
                                                className={clsx(
                                                    "w-12 h-10 flex items-center justify-center rounded-xl border transition-all shadow-lg",
                                                    mix.activo 
                                                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white shadow-emerald-500/10"
                                                        : "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white shadow-red-500/10"
                                                )}
                                                title={mix.activo ? "Ocultar de la banda" : "Mostrar a la banda"}
                                            >
                                                {mix.activo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                            </button>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    api.get(`mixes/${mix.id_mix}`).then(res => {
                                                        setMixToEdit(res.data);
                                                        setIsMixModalOpen(true);
                                                    });
                                                }}
                                                className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white hover:bg-white/10 uppercase tracking-widest transition-all"
                                            >
                                                <Edit className="w-3.5 h-3.5" /> Editar
                                            </button>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteConfirmation({ isOpen: true, id: mix.id_mix, type: 'mix' });
                                                }}
                                                className="w-12 h-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10 border border-red-500/20"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {filteredMixes.length === 0 && !loading && (
                                <div className="py-20 text-center opacity-30 flex flex-col items-center">
                                    <Layers className="w-16 h-16 mb-4" />
                                    <p className="font-bold uppercase text-xs tracking-[0.2em]">No se encontraron mixes</p>
                                </div>
                            )}
                        </div>
                    )}
                </aside>

                {/* Detalle del Mix / Flujo */}
                <div className={clsx(
                    "flex flex-col lg:h-full lg:overflow-y-auto lg:pr-4 lg:pb-10 lg:custom-scrollbar",
                    mobileView === 'list' && 'hidden lg:flex'
                )}>
                    {/* Cabecera Ultra-Compacta para Detalle en Móvil */}
                    {mobileView === 'detail' && (
                        <div className="lg:hidden flex items-center gap-2 px-1 py-1 mb-1">
                            <button 
                                onClick={() => setMobileView('list')}
                                className="p-2 text-indigo-400 bg-indigo-400/5 rounded-lg active:scale-95"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-sm font-black text-white uppercase truncate tracking-tight leading-none">{selectedMix.nombre}</h2>
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-none mt-0.5">
                                    {selectedMix.temas?.length || 0} temas
                                </p>
                            </div>
                            {selectedMix.audio && (
                                <button
                                    onClick={() => setViewerData({
                                        files: [{
                                            url: selectedMix.audio.url_audio.replace('monster-back:8000', 'localhost:8000'),
                                            title: `Mix: ${selectedMix.nombre} - Guía Principal`,
                                            type: 'audio'
                                        }],
                                        initialIndex: 0
                                    })}
                                    className="p-2 rounded-lg bg-purple-600 text-white"
                                >
                                    <Play className="w-4 h-4 fill-current" />
                                </button>
                            )}
                        </div>
                    )}

                    <div className="flex flex-col h-full animate-in fade-in duration-500">
                        {selectedMix ? (
                            <>
                                {/* Header Desktop - Solo visible en LG */}
                                <div className="hidden lg:block px-1 mb-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                                                    {selectedMix.nombre}
                                                </h2>
                                            </div>
                                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest ml-5">
                                                Flujo de interpretación • {selectedMix.temas?.length || 0} canciones
                                            </p>
                                        </div>
                                        {selectedMix.audio && (
                                            <button
                                                onClick={() => setViewerData({
                                                    files: [{
                                                        url: selectedMix.audio.url_audio.replace('monster-back:8000', 'localhost:8000'),
                                                        title: `Mix: ${selectedMix.nombre} - Guía Principal`,
                                                        type: 'audio'
                                                    }],
                                                    initialIndex: 0
                                                })}
                                                className="h-12 px-6 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-3 transition-all shadow-lg shadow-purple-600/20 font-black text-[11px] uppercase tracking-widest"
                                            >
                                                <Play className="w-5 h-5 fill-current" />
                                                Reproducir Guía Mix
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3 sm:space-y-4">
                                    {selectedMix.temas?.map((tema, index) => {
                                        const themeRecursos = tema.recursos || [];
                                        const userInstrumentId = user?.miembro?.id_instrumento;
                                        const userVozId = user?.miembro?.id_voz;
                                        
                                        // Filter resources based on user instrument/voice (Library-style logic)
                                        const filteredThemeRecursos = (userInstrumentId && !canManage)
                                            ? themeRecursos.filter(r => 
                                                r.id_instrumento == userInstrumentId && 
                                                (r.id_voz == userVozId || r.id_voz == null)
                                            )
                                            : themeRecursos;

                                        const hasVisuals = filteredThemeRecursos.some(res => 
                                            (res.archivos || []).some(f => f.tipo !== 'audio')
                                        );

                                        // All audios including resources and main theme audio
                                        const audioFiles = [
                                            ...filteredThemeRecursos.flatMap(res => 
                                                (res.archivos || []).filter(f => f.tipo === 'audio').map(f => ({
                                                    url: f.url_archivo,
                                                    title: `${tema.nombre_tema} - ${f.nombre_original || 'Guía'}`
                                                }))
                                            ),
                                            ...(tema.audio ? [{
                                                url: tema.audio.url_audio,
                                                title: `${tema.nombre_tema} - Audio Principal`
                                            }] : [])
                                        ];

                                        const handleOpenViewer = () => {
                                            const allMixFiles = selectedMix.temas.flatMap(t => {
                                                const tRecursos = t.recursos || [];
                                                const tFilteredResources = (userInstrumentId && !canManage)
                                                    ? tRecursos.filter(r => 
                                                        r.id_instrumento == userInstrumentId && 
                                                        (r.id_voz == userVozId || r.id_voz == null)
                                                    )
                                                    : tRecursos;
                                                
                                                return tFilteredResources.flatMap(res => 
                                                    (res.archivos || []).filter(f => f.tipo !== 'audio').map(f => ({
                                                        ...f,
                                                        url: f.url_archivo,
                                                        type: f.tipo === 'pdf' ? 'pdf' : 'image',
                                                        title: `${t.nombre_tema} - ${res.voz?.nombre_voz || 'General'}`
                                                    }))
                                                );
                                            });

                                            if (allMixFiles.length > 0) {
                                                const currentThemeFirstFile = allMixFiles.find(f => f.title.startsWith(tema.nombre_tema));
                                                const globalIndex = currentThemeFirstFile ? allMixFiles.indexOf(currentThemeFirstFile) : 0;

                                                setViewerData({ 
                                                    files: allMixFiles, 
                                                    initialIndex: globalIndex !== -1 ? globalIndex : 0 
                                                });
                                            } else {
                                                navigate(`/dashboard/biblioteca/${tema.id_tema}/detalle`);
                                            }
                                        };

                                        return (
                                            <div 
                                                key={`${tema.id_tema}-${index}`}
                                                className="relative group bg-surface-card border border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 hover:border-indigo-500/30 transition-all duration-300 shadow-xl overflow-hidden"
                                            >
                                                {/* Number Indicator - Posicionado arriba a la izquierda para no estorbar */}
                                                <div className="absolute top-4 left-6 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                                                    <span className="text-5xl sm:text-6xl font-black italic tracking-tighter text-indigo-500">{index + 1}</span>
                                                </div>

                                                <div className="relative z-10 flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6 pl-1 sm:pl-2">
                                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600/10 border border-indigo-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center text-indigo-400 font-black text-lg sm:text-xl shrink-0 shadow-inner">
                                                        {index + 1}
                                                    </div>
                                                    <div className="pt-0.5 sm:pt-1">
                                                        <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-0.5 sm:mb-1">{tema.genero?.nombre_genero}</p>
                                                        <h4 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight leading-none">{tema.nombre_tema}</h4>
                                                    </div>
                                                </div>

                                                <div className="relative z-10 flex gap-2 sm:gap-3">
                                                    <button
                                                        onClick={handleOpenViewer}
                                                        disabled={!hasVisuals}
                                                        className={clsx(
                                                            "flex-[3] flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-[0.1em] transition-all active:scale-95 shadow-lg",
                                                            hasVisuals
                                                                ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20" 
                                                                : "bg-surface-card border border-white/5 text-gray-600 cursor-not-allowed"
                                                        )}
                                                    >
                                                        <FileText className="w-4 h-4 sm:w-5 sm:h-5" /> 
                                                        {hasVisuals ? 'Abrir Partituras' : 'Sin Material'}
                                                    </button>
                                                    {audioFiles.length > 0 && (
                                                        <button
                                                            onClick={() => setViewerData({
                                                                files: audioFiles.map(a => ({
                                                                    url: a.url.replace('monster-back:8000', 'localhost:8000'),
                                                                    title: a.title,
                                                                    type: 'audio'
                                                                })),
                                                                initialIndex: 0
                                                            })}
                                                            className="flex-1 flex items-center justify-center gap-2 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white border border-purple-500/20 transition-all active:scale-95"
                                                            title="Escuchar guía de audio"
                                                        >
                                                            <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-32 bg-white/2 border-2 border-dashed border-white/5 rounded-[40px] text-center px-10">
                                <div className="w-24 h-24 bg-indigo-600/10 rounded-full flex items-center justify-center text-indigo-400 mb-8 animate-bounce">
                                    <Layers className="w-12 h-12" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">Selecciona un Repertorio</h3>
                                <p className="text-gray-500 max-w-sm text-sm leading-relaxed">
                                    Elige un mix de la lista para visualizar el flujo completo de canciones y acceder rápidamente a tus partituras en el orden correcto de interpretación.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modales */}
            <MixModal 
                isOpen={isMixModalOpen}
                onClose={() => {
                    setIsMixModalOpen(false);
                    setMixToEdit(null);
                }}
                onSuccess={loadData}
                initialData={mixToEdit}
            />

            <ConfirmationModal 
                isOpen={deleteConfirmation.isOpen}
                onClose={() => setDeleteConfirmation({ isOpen: false, id: null, type: 'mix' })}
                onConfirm={async () => {
                    try {
                        await api.delete(`mixes/${deleteConfirmation.id}`);
                        notify(`Mix eliminado exitosamente`, 'success');
                        if (selectedMix?.id_mix === deleteConfirmation.id) setSelectedMix(null);
                        loadData();
                        setDeleteConfirmation({ isOpen: false, id: null, type: 'mix' });
                    } catch (err) {
                        notify('Error al eliminar el mix', 'error');
                    }
                }}
                title="¿Eliminar Mix?"
                message="Esta acción borrará el mix pero NO las canciones que contiene. ¿Deseas continuar?"
                confirmText="Sí, Eliminar"
            />

            <MultimediaViewerModal 
                isOpen={!!viewerData}
                onClose={() => setViewerData(null)}
                files={viewerData?.files}
                initialIndex={viewerData?.initialIndex}
            />
        </div>
    );
}
