import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../../api';
import { Button } from '../../components/ui/Button';
import { 
    Music, 
    Search, 
    Filter, 
    FileText, 
    Download, 
    ChevronRight, 
    Play,
    Plus,
    Tag,
    Library,
    Edit,
    Trash2,
    ArrowLeft,
    Image as ImageIcon
} from 'lucide-react';
import { clsx } from 'clsx';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import RecursoModal from '../../components/modals/RecursoModal';
import MusicCatalogModal from '../../components/modals/MusicCatalogModal';
import ThemeDetailModal from '../../components/modals/ThemeDetailModal';
import TemaModal from '../../components/modals/TemaModal';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import MultimediaViewerModal from '../../components/modals/MultimediaViewerModal';

export default function BibliotecaList() {
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
    const [selectedTemaDetail, setSelectedTemaDetail] = useState(null);
    const [recursoInitialData, setRecursoInitialData] = useState(null);
    const [editTemaInitialData, setEditTemaInitialData] = useState(null);
    const [refreshDetailsTrigger, setRefreshDetailsTrigger] = useState(0);
    const [mobileView, setMobileView] = useState('genres'); // 'genres' or 'themes'
    const [viewerData, setViewerData] = useState(null);
    const { notify } = useToast();
    const { user } = useAuth();

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'DIRECTOR';

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [genRes, temaRes] = await Promise.all([
                api.get('generos'),
                api.get('temas')
            ]);
            setGeneros(genRes.data);
            setTemas(temaRes.data);
            
            // Preservar selección inteligente
            if (genRes.data.length > 0) {
                setSelectedGenero(current => {
                    if (current) {
                        return genRes.data.find(g => g.id_genero === current.id_genero) || genRes.data[0];
                    }
                    return genRes.data[0];
                });
            } else {
                setSelectedGenero(null);
            }
        } catch (error) {
            console.error("Error loading library:", error);
            notify("Error al cargar la biblioteca musical", "error");
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
        <div className="h-full overflow-y-auto lg:overflow-hidden custom-scrollbar animate-in fade-in duration-700 pr-2 lg:pr-0">
            {/* Content Layout */}
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-8 lg:h-full">
                
                {/* Categorías (Géneros) */}
                <aside className={clsx(
                    "flex flex-col space-y-4 lg:h-full lg:overflow-y-auto lg:pr-4 lg:pb-10 lg:custom-scrollbar px-2",
                    mobileView === 'themes' && 'hidden lg:flex'
                )}>
                    <div className="flex flex-col gap-3 mb-6 flex-shrink-0">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-2 outline-none">Géneros de la Banda</h3>
                        
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 px-2">
                            <div className="relative group flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder="Buscar Género..."
                                    value={genreSearch}
                                    onChange={(e) => setGenreSearch(e.target.value)}
                                    className="h-10 bg-[#161b2c] border border-white/5 rounded-xl pl-10 pr-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 w-full transition-all"
                                />
                            </div>
                            {isAdmin && (
                                <Button 
                                    onClick={() => {
                                        setGenreToEdit(null);
                                        setIsCatalogModalOpen(true);
                                    }}
                                    className="h-10 px-4 min-w-[110px] text-[10px] uppercase font-bold tracking-widest shadow-lg shadow-indigo-600/20"
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Nuevo
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 py-4">
                        {filteredGeneros.map((gen) => (
                            <div
                                key={gen.id_genero}
                                onClick={() => {
                                    setSelectedGenero(gen);
                                    setMobileView('themes');
                                }}
                                className={clsx(
                                    "relative flex flex-col rounded-[32px] transition-all duration-500 group overflow-hidden shadow-xl shrink-0 cursor-pointer border-2",
                                    selectedGenero?.id_genero === gen.id_genero
                                        ? "border-brand-primary bg-brand-primary/5 scale-[1.02] z-10"
                                        : "border-white/5 hover:border-white/20"
                                )}
                            >
                                {/* Main Card Content */}
                                <div 
                                    className="relative h-32 flex items-center px-6 overflow-hidden"
                                    style={{ 
                                        background: `linear-gradient(135deg, ${gen.color_primario || '#4f46e5'}, ${gen.color_secundario || '#7c3aed'})` 
                                    }}
                                >
                                    <div className="relative z-10 text-left max-w-[60%]">
                                        <h4 
                                            className="text-xl text-white uppercase tracking-tight leading-tight drop-shadow-lg mb-1 truncate"
                                            style={{ fontFamily: "'Archivo Black', sans-serif" }}
                                        >
                                            {gen.nombre_genero}
                                        </h4>
                                        <div className="inline-flex items-center text-[9px] font-black text-white/80 uppercase tracking-widest bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                            {gen.temas_count} CANCIONES
                                        </div>
                                    </div>
                                    
                                    <div className="absolute -right-2 top-0 bottom-0 w-36 flex items-center justify-center transition-transform group-hover:scale-110 duration-500 pointer-events-none drop-shadow-2xl">
                                        {gen.banner_url ? (
                                            <img 
                                                src={gen.banner_url} 
                                                alt="" 
                                                className="h-[120%] object-contain origin-center translate-y-2 opacity-90 group-hover:opacity-100 transition-opacity" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white/10 -rotate-12 translate-x-4">
                                                <Tag className="w-20 h-20" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {isAdmin && (
                                    <div className="bg-[#161b2c] p-3 flex items-center gap-3 border-t border-white/5">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setGenreToEdit(gen);
                                                setIsCatalogModalOpen(true);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-white hover:bg-white/10 uppercase tracking-[0.15em] transition-all active:scale-95 shadow-lg"
                                        >
                                            <Edit className="w-3 h-3" /> Editar
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (gen.temas_count > 0) {
                                                    notify("No puedes eliminar un género que contiene canciones. Vacíalo primero.", "warning");
                                                    return;
                                                }
                                                setDeleteConfirmation({ isOpen: true, id: gen.id_genero, type: 'genero' });
                                            }}
                                            className={clsx(
                                                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-[0.15em] transition-all active:scale-95 shadow-lg",
                                                gen.temas_count > 0 
                                                    ? "bg-white/5 border-white/5 text-gray-700 cursor-not-allowed"
                                                    : "bg-[#1e1414] border-red-500/10 text-red-500/50 hover:text-red-500 hover:bg-red-500/10"
                                            )}
                                            title={gen.temas_count > 0 ? "Elimina las canciones primero" : "Eliminar Género"}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Eliminar
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Temas Grid */}
                <div className={clsx(
                    "flex flex-col lg:h-full lg:overflow-y-auto lg:pr-4 lg:pb-10 lg:custom-scrollbar px-2",
                    mobileView === 'genres' && 'hidden lg:flex'
                )}>
                    {/* Botón Volver (Solo Móvil) */}
                    {mobileView === 'themes' && (
                        <button 
                            onClick={() => setMobileView('genres')}
                            className="lg:hidden flex items-center gap-2 mb-4 text-indigo-400 font-black text-[10px] uppercase tracking-widest bg-indigo-400/10 w-fit px-4 py-2 rounded-xl flex-shrink-0"
                        >
                            <ArrowLeft className="w-4 h-4" /> Volver a Géneros
                        </button>
                    )}

                    <div className="flex flex-col gap-3 mb-6 flex-shrink-0">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-2">
                            {selectedGenero ? `Temas: ${selectedGenero.nombre_genero}` : 'Temas'}
                        </h3>
                        
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 px-2">
                            <div className="relative group flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-400 transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder="Buscar tema..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-10 bg-[#161b2c] border border-white/5 rounded-xl pl-10 pr-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 w-full transition-all"
                                />
                            </div>
                            {isAdmin && (
                                <Button 
                                    onClick={() => {
                                        setEditTemaInitialData(null);
                                        setIsTemaModalOpen(true);
                                    }} 
                                    className="h-10 px-4 min-w-[110px] text-[10px] uppercase font-bold tracking-widest shadow-lg shadow-indigo-600/20"
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Tema
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Contenido Unificado - SIN keys en las ramas condicionales */}
                    <div className="py-2">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4 shadow-xl"></div>
                                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Sincronizando Biblioteca...</p>
                            </div>
                        ) : filteredTemas.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2 py-4">
                                {filteredTemas.map((tema) => (
                                    <div 
                                        key={tema.id_tema}
                                        onClick={() => setSelectedTemaDetail({ ...tema, genero: selectedGenero })}
                                        className="group bg-surface-card border border-white/5 rounded-3xl p-6 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-4 text-left">
                                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-indigo-600/20 group-hover:text-indigo-400 transition-colors shrink-0">
                                                    <Music className="w-6 h-6" />
                                                </div>
                                                <div className="min-w-0 flex-1 text-left">
                                                    <h4 className="text-white font-black text-lg group-hover:text-indigo-300 transition-colors uppercase tracking-tight leading-tight line-clamp-2">
                                                        {tema.nombre_tema}
                                                    </h4>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{selectedGenero?.nombre_genero}</p>
                                                </div>
                                            </div>
                                            <div 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedTemaDetail({ ...tema, genero: selectedGenero });
                                                }}
                                                className="p-2 bg-indigo-600/10 text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shrink-0"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-[10px] font-black text-gray-500 uppercase tracking-widest border-t border-white/5 pt-4 pb-4">
                                            <div className="flex items-center gap-1.5 flex-1 justify-center">
                                                <FileText className="w-3.5 h-3.5" />
                                                {tema.partituras_count || 0} PARTITURAS
                                            </div>
                                            <div className="w-px h-3 bg-white/10"></div>
                                            <div className="flex items-center gap-1.5 text-indigo-400/60 flex-1 justify-center">
                                                <Play className="w-3.5 h-3.5" />
                                                {tema.guias_count || 0} AUDIO GUÍAS
                                            </div>
                                        </div>

                                        {/* Quick Access for Members */}
                                        {!isAdmin && tema.recursos?.length > 0 && (
                                            <div className="flex flex-col gap-2 pt-3 border-t border-white/5 mt-auto">
                                                <div className="flex gap-2">
                                                    {(() => {
                                                        const visualFiles = tema.recursos.flatMap(res => 
                                                            (res.archivos || []).filter(f => f.tipo !== 'audio').map(f => ({
                                                                ...f,
                                                                url: f.url_archivo,
                                                                type: f.tipo === 'pdf' ? 'pdf' : 'image',
                                                                title: `${tema.nombre_tema} - ${res.voz?.nombre_voz}`
                                                            }))
                                                        );
                                                        const audioFiles = tema.recursos.flatMap(res => 
                                                            (res.archivos || []).filter(f => f.tipo === 'audio')
                                                        );

                                                        return (
                                                            <>
                                                                {visualFiles.length > 0 && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setViewerData({
                                                                                files: visualFiles,
                                                                                initialIndex: 0
                                                                            });
                                                                        }}
                                                                        className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/20 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
                                                                    >
                                                                        <FileText className="w-4 h-4" /> ESTUDIAR PARTITURAS
                                                                    </button>
                                                                )}
                                                                {audioFiles.length > 0 && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            window.open(audioFiles[0].url_archivo, '_blank');
                                                                        }}
                                                                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white border border-purple-500/20 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                                                                        title="Escuchar guía de audio"
                                                                    >
                                                                        <Play className="w-4 h-4 fill-current" /> GUÍA
                                                                    </button>
                                                                )}
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        )}

                                        {isAdmin && (
                                            <div className="flex gap-2 pt-3 border-t border-white/5 mt-auto">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditTemaInitialData(tema);
                                                        setIsTemaModalOpen(true);
                                                    }}
                                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 shadow-lg"
                                                >
                                                    <Edit className="w-3.5 h-3.5" /> Editar
                                                </button>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const hasResources = (tema.partituras_count > 0 || tema.guias_count > 0);
                                                        if (hasResources) {
                                                            notify("No puedes eliminar una canción que tiene partituras o audios. Bórralos primero.", "warning");
                                                            return;
                                                        }
                                                        setDeleteConfirmation({ isOpen: true, id: tema.id_tema, type: 'tema' });
                                                    }}
                                                    className={clsx(
                                                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg",
                                                        (tema.partituras_count > 0 || tema.guias_count > 0)
                                                            ? "bg-white/5 border-white/5 text-gray-700 cursor-not-allowed font-bold"
                                                            : "bg-[#1e1414] border-red-500/10 text-red-500/50 hover:text-red-500 hover:bg-red-500/10"
                                                    )}
                                                    title={(tema.partituras_count > 0 || tema.guias_count > 0) ? "Elimina las partituras primero" : "Eliminar Canción"}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Eliminar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-32 bg-white/2 border border-dashed border-white/5 rounded-[40px] text-center px-6">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-gray-700 mb-6">
                                    <Search className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Sin resultados</h3>
                                <p className="text-gray-500 max-w-xs text-sm">No encontramos temas que coincidan con tu búsqueda en este género.</p>
                                <Button variant="secondary" className="mt-8" onClick={() => setSearchQuery('')}>Limpiar Búsqueda</Button>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Modales */}
            <RecursoModal 
                isOpen={isRecursoModalOpen} 
                onClose={() => {
                    setIsRecursoModalOpen(false);
                    setRecursoInitialData(null);
                }} 
                onSuccess={() => {
                    loadData();
                    setRefreshDetailsTrigger(prev => prev + 1);
                }}
                initialData={recursoInitialData}
            />
            
            <MusicCatalogModal 
                isOpen={isCatalogModalOpen} 
                onClose={() => {
                    setIsCatalogModalOpen(false);
                    setGenreToEdit(null);
                    loadData();
                }}
                editGenre={genreToEdit}
            />

            <TemaModal 
                isOpen={isTemaModalOpen}
                onClose={() => {
                    setIsTemaModalOpen(false);
                    setEditTemaInitialData(null);
                }}
                idGenero={selectedGenero?.id_genero}
                nombreGenero={selectedGenero?.nombre_genero}
                onSuccess={loadData}
                initialData={editTemaInitialData}
            />

            <ThemeDetailModal 
                isOpen={!!selectedTemaDetail}
                tema={selectedTemaDetail}
                onClose={() => setSelectedTemaDetail(null)}
                onDeleted={loadData}
                onAddResource={() => {
                    setRecursoInitialData({
                        id_genero: selectedTemaDetail.id_genero,
                        id_tema: selectedTemaDetail.id_tema
                    });
                    setIsRecursoModalOpen(true);
                }}
                onEditResource={(recurso) => {
                    setRecursoInitialData({
                        ...recurso,
                        id_genero: selectedTemaDetail?.id_genero
                    });
                    setIsRecursoModalOpen(true);
                }}
                refreshTrigger={refreshDetailsTrigger}
            />

            <ConfirmationModal 
                isOpen={deleteConfirmation.isOpen}
                onClose={() => setDeleteConfirmation({ isOpen: false, id: null, type: 'genero' })}
                onConfirm={async () => {
                    try {
                        const endpoint = deleteConfirmation.type === 'genero' 
                            ? `generos/${deleteConfirmation.id}` 
                            : `temas/${deleteConfirmation.id}`;
                        
                        await api.delete(endpoint);
                        notify(`${deleteConfirmation.type === 'genero' ? 'Género' : 'Canción'} eliminada exitosamente`, 'success');
                        loadData();
                        setDeleteConfirmation({ isOpen: false, id: null, type: 'genero' });
                    } catch (err) {
                        notify(err.response?.data?.message || 'Error al eliminar el elemento', 'error');
                    }
                }}
                title={deleteConfirmation.type === 'genero' ? "¿Eliminar Género?" : "¿Eliminar Canción?"}
                message={deleteConfirmation.type === 'genero' 
                    ? "Esta acción es irreversible. Se eliminarán todas las canciones y partituras asociadas a este género."
                    : "Esta acción es irreversible. Se eliminarán todas las partituras y guías asociadas a esta canción."}
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