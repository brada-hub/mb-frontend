import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import api from '../../api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { 
    Music, 
    Search, 
    FileText, 
    ChevronRight, 
    Play,
    Plus,
    Tag,
    Edit,
    Trash2,
    ArrowLeft,
    Lock,
    Unlock,
    Video,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import RecursoModal from '../../components/modals/RecursoModal';
import MusicCatalogModal from '../../components/modals/MusicCatalogModal';
import TemaModal from '../../components/modals/TemaModal';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import MultimediaViewerModal from '../../components/modals/MultimediaViewerModal';
import { SkeletonRepertoireGrid, SkeletonGenreList } from '../../components/ui/skeletons/Skeletons';

export default function BibliotecaList() {
    const navigate = useNavigate();
    const { notify } = useToast();
    const { user } = useAuth();
    
    const [generos, setGeneros] = useState([]);
    const [temas, setTemas] = useState([]);
    const [selectedGenero, setSelectedGenero] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [genreSearch, setGenreSearch] = useState('');
    const [genreToEdit, setGenreToEdit] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, id: null, type: 'genero' });
    const [loading, setLoading] = useState(true);
    const [isRecursoModalOpen, setIsRecursoModalOpen] = useState(false);
    const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
    const [isTemaModalOpen, setIsTemaModalOpen] = useState(false);
    const [recursoInitialData, setRecursoInitialData] = useState(null);
    const [editTemaInitialData, setEditTemaInitialData] = useState(null);
    const [mobileView, setMobileView] = useState('genres'); // 'genres' or 'themes'
    const [viewerData, setViewerData] = useState(null);
    
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
    const authorized = userRole === 'ADMIN' || userRole === 'DIRECTOR' || !!user?.is_super_admin;
    const canManage = authorized && editMode;

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [genRes, temaRes] = await Promise.all([
                api.get('generos'),
                api.get('temas')
            ]);
            setGeneros(genRes.data);
            setTemas(temaRes.data);
            
            if (genRes.data.length > 0) {
                setSelectedGenero(current => {
                    if (current) {
                        return genRes.data.find(g => g.id_genero === current.id_genero) || genRes.data[0];
                    }
                    return genRes.data[0];
                });
            }
        } catch (error) {
            notify("Error al cargar la biblioteca", "error");
        } finally {
            setLoading(false);
        }
    }, [notify]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredTemas = useMemo(() => {
        return temas.filter(t => {
            const matchesGenero = selectedGenero ? t.id_genero === selectedGenero.id_genero : true;
            const matchesSearch = t.nombre_tema.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesGenero && matchesSearch;
        });
    }, [temas, selectedGenero, searchQuery]);

    const filteredGeneros = useMemo(() => {
        return generos.filter(g => g.nombre_genero.toLowerCase().includes(genreSearch.toLowerCase()));
    }, [generos, genreSearch]);

    return (
        <div 
            className="h-full overflow-y-auto lg:overflow-hidden custom-scrollbar animate-in fade-in duration-700 pr-2 lg:pr-0"
        >
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:h-full">
                
                {/* Columna Izquierda: Géneros */}
                <aside className={clsx(
                    "flex flex-col lg:h-full lg:overflow-y-auto lg:pr-2 lg:pb-10 lg:custom-scrollbar px-2",
                    mobileView === 'themes' && 'hidden lg:flex'
                )}>
                    {/* Header Géneros - Separated for Scroll Effect */}
                    <div className="px-1 mb-1 sm:mb-2">
                        <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight transition-colors">Géneros</h2>
                        <p className="text-gray-500 text-[9px] sm:text-[10px] font-medium uppercase tracking-widest transition-colors">Explora por categoría</p>
                    </div>

                    <div className="sticky top-0 z-30 bg-white/95 dark:bg-[#090b14]/95 backdrop-blur-md -mx-2 px-3 py-2 sm:py-3 mb-2 sm:mb-4 border-b border-surface-border flex items-center gap-2 transition-colors">
                        {authorized && (
                            <button
                                onClick={toggleEditMode}
                                title={editMode ? "Desactivar Edición" : "Activar Edición"}
                                className={clsx(
                                    "h-10 sm:h-12 px-3 sm:px-4 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 border shrink-0",
                                    editMode 
                                        ? "bg-brand-primary/20 border-brand-primary text-brand-primary" 
                                        : "bg-surface-card border-surface-border text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10"
                                )}
                            >
                                {editMode ? <Unlock className="w-4 h-4 sm:w-5 sm:h-5" /> : <Lock className="w-4 h-4 sm:w-5 sm:h-5" />}
                            </button>
                        )}
                        <div className="flex-1">
                            <Input 
                                icon={Search}
                                placeholder="BUSCAR..."
                                value={genreSearch}
                                onChange={(e) => setGenreSearch(e.target.value)}
                                className="bg-surface-input border-surface-border h-10 sm:h-11 text-[9px] sm:text-[10px] font-black uppercase rounded-xl shadow-inner shadow-black/10 dark:shadow-black/20 w-full"
                            />
                        </div>
                        {canManage && (
                            <button 
                                onClick={() => {
                                    setGenreToEdit(null);
                                    setIsCatalogModalOpen(true);
                                }}
                                className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl shrink-0 z-50 shadow-lg bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center gap-2 active:scale-95 transition-all text-white"
                            >
                                <Plus className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest hidden sm:inline">AÑADIR</span>
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 sm:gap-3">
                        {loading && generos.length === 0 ? (
                            <SkeletonGenreList />
                        ) : (
                            filteredGeneros.map((gen) => (
                                <div
                                    key={gen.id_genero}
                                    onClick={() => {
                                        setSelectedGenero(gen);
                                        setMobileView('themes');
                                    }}
                                    className={clsx(
                                        "relative flex flex-col rounded-2xl sm:rounded-[32px] transition-all duration-500 group overflow-hidden shadow-xl shrink-0 cursor-pointer border-2",
                                        selectedGenero?.id_genero === gen.id_genero
                                            ? "border-brand-primary bg-brand-primary/5 sm:scale-[1.02] z-10"
                                            : "border-surface-border hover:border-gray-300 dark:hover:border-white/20"
                                    )}
                                >
                                    <div 
                                        className="relative h-24 sm:h-32 flex items-center px-4 sm:px-6 overflow-hidden"
                                        style={{ 
                                            background: `linear-gradient(135deg, ${gen.color_primario || '#4f46e5'}, ${gen.color_secundario || '#7c3aed'})` 
                                        }}
                                    >
                                        <div className="relative z-10 text-left max-w-[65%]">
                                            <h4 className="text-base sm:text-xl text-white uppercase tracking-tight leading-tight drop-shadow-lg mb-0.5 sm:mb-1 truncate font-black">
                                                {gen.nombre_genero}
                                            </h4>
                                            <div className="inline-flex items-center text-[8px] sm:text-[9px] font-black text-white/80 uppercase tracking-widest bg-black/20 backdrop-blur-md px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-white/10">
                                                {gen.temas_count} CANCIONES
                                            </div>
                                        </div>
                                        
                                        <div className="absolute -right-2 top-0 bottom-0 w-28 sm:w-36 flex items-center justify-center transition-transform group-hover:scale-110 duration-500 pointer-events-none drop-shadow-2xl">
                                            {gen.banner_url ? (
                                                <img src={gen.banner_url} alt="" className="h-[120%] object-contain origin-center translate-y-2 opacity-90 group-hover:opacity-100 transition-opacity" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white/10 -rotate-12 translate-x-4">
                                                    <Tag className="w-16 h-16 sm:w-20 sm:h-20" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Edit Mode Overlay */}
                                    {editMode && (
                                        <div className="px-4 py-3 bg-white dark:bg-[#0f121d] border-t border-surface-border flex gap-2 animate-in slide-in-from-top-2">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setGenreToEdit(gen);
                                                    setIsCatalogModalOpen(true);
                                                }}
                                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-blue-500/10 text-blue-600 dark:text-blue-500/50 hover:text-blue-600 dark:hover:text-blue-500 hover:bg-blue-500/10 text-[9px] font-black uppercase tracking-widest transition-all active:scale-95"
                                            >
                                                <Edit className="w-4 h-4" /> <span className="hidden sm:inline">EDITAR</span>
                                            </button>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (gen.temas_count > 0) {
                                                        notify(`No puedes eliminar el género "${gen.nombre_genero}" porque contiene ${gen.temas_count} canciones.`, "warning");
                                                        return;
                                                    }
                                                    setDeleteConfirmation({ isOpen: true, id: gen.id_genero, type: 'genero' });
                                                }}
                                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/10 text-red-600 dark:text-red-500/50 hover:text-red-600 dark:hover:text-red-500 hover:bg-red-500/10 text-[9px] font-black uppercase tracking-widest transition-all active:scale-95"
                                            >
                                                <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">ELIMINAR</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </aside>

                {/* Temas Grid */}
                <div className={clsx(
                    "flex flex-col lg:h-full lg:overflow-y-auto lg:pr-4 lg:pb-10 lg:custom-scrollbar px-2",
                    mobileView === 'genres' && 'hidden lg:flex'
                )}>
                    {mobileView === 'themes' && (
                        <button 
                            onClick={() => setMobileView('genres')}
                            className="lg:hidden flex items-center gap-2 mb-2 sm:mb-4 text-indigo-400 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] bg-indigo-400/10 w-full justify-center py-2.5 sm:py-4 rounded-xl sm:rounded-2xl border border-indigo-500/20 active:scale-95 transition-all"
                        >
                            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> Volver a Géneros
                        </button>
                    )}

                    {/* Header Temas - Separated for Scroll Effect */}
                    <div className="px-1 mb-1 sm:mb-2">
                        <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight truncate transition-colors">
                            {selectedGenero?.nombre_genero || 'Temas'}
                        </h2>
                        <p className="text-gray-500 text-[9px] sm:text-[10px] font-medium uppercase tracking-widest transition-colors">Canciones disponibles</p>
                    </div>

                    <div className="sticky top-0 z-30 bg-white/95 dark:bg-[#090b14]/95 backdrop-blur-md -mx-2 px-3 py-2 sm:py-3 mb-2 sm:mb-4 border-b border-surface-border flex items-center gap-2 transition-colors">
                        <div className="flex-1">
                            <Input 
                                icon={Search}
                                placeholder="Buscar canción..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-surface-input border-surface-border h-10 sm:h-12 text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-inner shadow-black/10 dark:shadow-black/20 w-full"
                            />
                        </div>
                        {canManage && (
                            <button 
                                onClick={() => {
                                    setEditTemaInitialData(null);
                                    setIsTemaModalOpen(true);
                                }} 
                                className="h-10 sm:h-12 px-4 sm:px-5 rounded-xl sm:rounded-2xl shrink-0 z-50 shadow-lg bg-brand-primary hover:bg-indigo-500 flex items-center justify-center gap-2 active:scale-95 transition-all text-white w-auto"
                            >
                                <Plus className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} />
                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest hidden sm:inline">AÑADIR</span>
                            </button>
                        )}
                    </div>

                    <div>
                        {loading ? (
                            <SkeletonRepertoireGrid />
                        ) : filteredTemas.length > 0 ? (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 px-1">
                                {filteredTemas.map((tema) => (
                                    <div 
                                        key={tema.id_tema}
                                        onClick={authorized ? () => navigate(`/dashboard/biblioteca/${tema.id_tema}/detalle`) : undefined}
                                        className={clsx(
                                            "group bg-surface-card border border-surface-border rounded-2xl sm:rounded-3xl p-3 sm:p-6 transition-all duration-300 hover:shadow-2xl",
                                            authorized ? "hover:border-indigo-500/30 sm:hover:-translate-y-1 cursor-pointer" : "cursor-default"
                                        )}
                                    >
                                        <div className="flex items-start justify-between mb-2 sm:mb-4">
                                            <div className="flex items-center gap-3 sm:gap-4 text-left">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black/5 dark:bg-white/5 rounded-xl sm:rounded-2xl flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:bg-indigo-600/20 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0">
                                                    <Music className="w-5 h-5 sm:w-6 sm:h-6" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-gray-900 dark:text-white font-black text-base sm:text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors uppercase tracking-tight leading-tight line-clamp-2">
                                                        {tema.nombre_tema}
                                                    </h4>
                                                    <p className="text-[9px] sm:text-[10px] text-gray-500 font-black uppercase tracking-widest truncate transition-colors">{selectedGenero?.nombre_genero}</p>
                                                </div>
                                            </div>
                                            {authorized && (
                                                <div className="w-9 h-9 sm:w-11 sm:h-11 bg-black/5 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-lg sm:rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all flex items-center justify-center shrink-0 shadow-lg active:scale-90">
                                                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                                                </div>
                                            )}
                                        </div>

                                        {(() => {
                                            const userInstrumentId = user?.miembro?.id_instrumento;
                                            const userVozId = user?.miembro?.id_voz;
                                            const recursos = tema.recursos || [];

                                            // Calculate counts for display
                                            let displayPartituras = tema.partituras_count || 0;
                                            let displayGuias = (tema.guias_count || 0) + (tema.audio ? 1 : 0);

                                            // If in study mode and we have instrument info, calculate based on user selection
                                            // This is mostly for admins who want to see their own material or members if the backend didn't filter
                                            if (!canManage && userInstrumentId) {
                                                const myRecs = recursos.filter(r => 
                                                    r.id_instrumento == userInstrumentId && 
                                                    (r.id_voz == userVozId || r.id_voz == null)
                                                );
                                                displayPartituras = myRecs.reduce((acc, r) => 
                                                    acc + (r.archivos || []).filter(f => f.tipo !== 'audio').length, 0
                                                );
                                                displayGuias = myRecs.reduce((acc, r) => 
                                                    acc + (r.archivos || []).filter(f => f.tipo === 'audio').length, 0
                                                ) + (tema.audio ? 1 : 0);
                                            }

                                            return (
                                                <div className="flex items-center gap-1 text-[8px] sm:text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-tight border-t border-surface-border pt-2 sm:pt-4 pb-2 sm:pb-4 px-1 transition-colors">
                                                    <div className="flex items-center gap-1 flex-1 justify-center min-w-0">
                                                        <FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                                                        <span className="truncate">{displayPartituras} <span className="hidden sm:inline">PARTITURAS</span><span className="sm:hidden">PART.</span></span>
                                                    </div>
                                                    <div className="w-px h-2.5 sm:h-3 bg-surface-border shrink-0"></div>
                                                    <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400/60 flex-1 justify-center min-w-0 transition-colors">
                                                        <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                                                        <span className="truncate">{displayGuias} <span className="hidden sm:inline">GUÍAS</span><span className="sm:hidden">GUÍA</span></span>
                                                    </div>
                                                    {tema.videos?.[0]?.url_video && (
                                                        <>
                                                            <div className="w-px h-2.5 sm:h-3 bg-surface-border shrink-0"></div>
                                                            <div className="flex items-center gap-1 text-red-500/80 flex-1 justify-center min-w-0">
                                                                <Video className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                                                                <span className="truncate">VIDEO</span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        })()}

                                        {(() => {
                                            const recursos = tema.recursos || [];
                                            const userInstrumentId = user?.miembro?.id_instrumento;
                                            const userVozId = user?.miembro?.id_voz;
                                            
                                            // Filter resources for Reader Mode
                                            const myResources = (userInstrumentId && !canManage)
                                                ? recursos.filter(r => 
                                                    r.id_instrumento == userInstrumentId && 
                                                    (r.id_voz == userVozId || r.id_voz == null)
                                                )
                                                : recursos; 

                                            const visualFiles = myResources.flatMap(res => 
                                                (res.archivos || []).filter(f => f.tipo !== 'audio').map(f => ({
                                                    ...f,
                                                    url: f.url_archivo,
                                                    type: f.tipo === 'pdf' ? 'pdf' : 'image',
                                                    title: `${tema.nombre_tema} - ${res.voz?.nombre_voz || 'General'}`
                                                }))
                                            );
                                            
                                            // Audios
                                            const resourceAudios = myResources.flatMap(res => 
                                                (res.archivos || []).filter(f => f.tipo === 'audio')
                                            );

                                            // Main theme audio
                                            const themeAudio = tema.audio ? [{
                                                id_archivo: `theme-${tema.id_tema}`,
                                                url_archivo: tema.audio.url_audio,
                                                nombre_original: 'Audio Principal'
                                            }] : [];

                                            const allAudios = [...resourceAudios, ...themeAudio];
                                            const videoLink = tema.videos?.[0]?.url_video;

                                            if (canManage) {
                                                const totalResources = (tema.partituras_count || 0) + (tema.guias_count || 0);
                                                return (
                                                    <div className="flex gap-2 pt-3 border-t border-surface-border mt-auto transition-colors">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); setEditTemaInitialData(tema); setIsTemaModalOpen(true); }}
                                                            className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl bg-black/5 dark:bg-white/5 border border-surface-border text-[10px] font-black text-gray-700 dark:text-white hover:bg-black/10 dark:hover:bg-white/10 uppercase tracking-widest transition-all"
                                                        >
                                                            <Edit className="w-3.5 h-3.5" /> Editar
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { 
                                                                e.stopPropagation(); 
                                                                if (totalResources > 0) {
                                                                    notify(`No puedes eliminar un tema con ${totalResources} recursos asociados. Elimina primero las partituras.`, 'warning');
                                                                    return;
                                                                }
                                                                setDeleteConfirmation({ isOpen: true, id: tema.id_tema, type: 'tema' }); 
                                                            }}
                                                            className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl border border-red-500/10 text-red-600 dark:text-red-500/50 hover:text-red-600 dark:hover:text-red-500 hover:bg-red-500/10 text-[10px] font-black uppercase tracking-widest transition-all"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" /> Eliminar
                                                        </button>
                                                    </div>
                                                );
                                            }

                                            if (visualFiles.length === 0 && allAudios.length === 0 && !videoLink) return null;

                                            return (
                                                <div className="flex gap-2 pt-2 sm:pt-3 border-t border-surface-border mt-auto transition-colors">
                                                    {visualFiles.length > 0 && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setViewerData({ files: visualFiles, initialIndex: 0 }); }}
                                                            className="flex-[2] flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-indigo-600 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/30 active:scale-95"
                                                        >
                                                            <FileText className="w-4 h-4 sm:w-5 sm:h-5" /> ESTUDIAR
                                                        </button>
                                                    )}
                                                    <div className="flex gap-2 flex-1">
                                                        {allAudios.length > 0 && (
                                                            <button
                                                                onClick={(e) => { 
                                                                    e.stopPropagation(); 
                                                                    setViewerData({ 
                                                                        files: allAudios.map(a => ({
                                                                            url: a.url_archivo,
                                                                            title: `${tema.nombre_tema} - ${a.nombre_original || 'Guía'}`,
                                                                            type: 'audio'
                                                                        })), 
                                                                        initialIndex: 0 
                                                                    }); 
                                                                }}
                                                                className="flex-1 flex items-center justify-center gap-2 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                                                            >
                                                                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                                                            </button>
                                                        )}
                                                        {videoLink && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); window.open(videoLink, '_blank'); }}
                                                                className="flex-1 flex items-center justify-center gap-2 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                                                                title="Ver video de referencia"
                                                            >
                                                                <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-32 bg-black/[0.02] dark:bg-white/2 border border-dashed border-surface-border rounded-[40px] text-center px-6 transition-colors">
                                <Search className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-6 transition-colors" />
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Sin resultados</h3>
                                <p className="text-gray-500 text-sm transition-colors">No hay temas en este género aún.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modales */}
            <RecursoModal isOpen={isRecursoModalOpen} onClose={() => { setIsRecursoModalOpen(false); setRecursoInitialData(null); }} onSuccess={loadData} initialData={recursoInitialData} />
            <MusicCatalogModal isOpen={isCatalogModalOpen} onClose={() => { setIsCatalogModalOpen(false); setGenreToEdit(null); loadData(); }} editGenre={genreToEdit} />
            <TemaModal isOpen={isTemaModalOpen} onClose={() => { setIsTemaModalOpen(false); setEditTemaInitialData(null); }} idGenero={selectedGenero?.id_genero} nombreGenero={selectedGenero?.nombre_genero} onSuccess={loadData} initialData={editTemaInitialData} />
            <ConfirmationModal 
                isOpen={deleteConfirmation.isOpen} 
                onClose={() => setDeleteConfirmation({ ...deleteConfirmation, isOpen: false })} 
                onConfirm={async () => {
                    try {
                        const endpoint = deleteConfirmation.type === 'genero' ? `generos/${deleteConfirmation.id}` : `temas/${deleteConfirmation.id}`;
                        await api.delete(endpoint);
                        notify(`${deleteConfirmation.type === 'genero' ? 'Género' : 'Canción'} eliminado exitosamente`, 'success');
                        loadData();
                        setDeleteConfirmation({ isOpen: false, id: null, type: 'genero' });
                    } catch (err) { notify('Error al eliminar', 'error'); }
                }}
                title={deleteConfirmation.type === 'genero' ? "¿Eliminar Género?" : "¿Eliminar Canción?"}
                message="Esta acción es irreversible. Se eliminará todo el material asociado."
                confirmText="Sí, Eliminar"
            />
            <MultimediaViewerModal isOpen={!!viewerData} onClose={() => setViewerData(null)} files={viewerData?.files} initialIndex={viewerData?.initialIndex} />
        </div>
    );
}