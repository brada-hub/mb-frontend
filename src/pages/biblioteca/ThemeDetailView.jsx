import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import { Button } from '../../components/ui/Button';
import { 
    X, 
    Music, 
    FileText, 
    Play, 
    Download, 
    ZoomIn, 
    ZoomOut, 
    RotateCw, 
    Maximize2, 
    ChevronLeft, 
    ChevronRight, 
    Video, 
    Layers,
    Image as ImageIcon,
    Edit2,
    Trash2,
    Plus,
    ArrowLeft,
    Unlock,
    Lock
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import MultimediaViewerModal from '../../components/modals/MultimediaViewerModal';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import RecursoModal from '../../components/modals/RecursoModal';
import TemaModal from '../../components/modals/TemaModal';
import { useAuth } from '../../context/AuthContext';
import { SkeletonDetail } from '../../components/ui/skeletons/Skeletons';

const getCleanUrl = (url) => {
    if (!url) return '';
    return url.replace(/^https?:\/\/[^/]+/, '');
};

export default function ThemeDetailView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { notify } = useToast();
    const { user } = useAuth();

    const [tema, setTema] = useState(null);
    const [recursos, setRecursos] = useState([]);
    const [voces, setVoces] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditingName, setIsEditingName] = useState(false);
    const [editName, setEditName] = useState('');
    const [viewerData, setViewerData] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
    
    // Modales para recursos y tema
    const [isRecursoModalOpen, setIsRecursoModalOpen] = useState(false);
    const [recursoInitialData, setRecursoInitialData] = useState(null);
    const [isTemaModalOpen, setIsTemaModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    // Inicializar modo gestión desde localStorage o defecto false
    const [editMode, setEditMode] = useState(() => {
        const saved = localStorage.getItem('monster_admin_mode');
        return saved === 'true';
    });

    // Persistir el cambio de modo
    const handleEditModeChange = (newMode) => {
        setEditMode(newMode);
        localStorage.setItem('monster_admin_mode', newMode);
    };

    // Estados para el Visor Inmersivo (Reader Mode)
    const [viewIndex, setViewIndex] = useState(0);
    const [zoom, setZoom] = useState(100);
    const [rotation, setRotation] = useState(0);
    const [viewPosition, setViewPosition] = useState({ x: 0, y: 0 });
    const [isViewDragging, setIsViewDragging] = useState(false);
    const [viewDragStart, setViewDragStart] = useState({ x: 0, y: 0 });

    const resetView = () => {
        setZoom(100);
        setRotation(0);
        setViewPosition({ x: 0, y: 0 });
    };

    // Reset view when changing file or mode
    useEffect(() => {
        resetView();
    }, [viewIndex, editMode]);

    // View Event Handlers
    const handleMouseDown = (e) => {
        if (zoom <= 100) return;
        setIsViewDragging(true);
        setViewDragStart({ x: e.clientX - viewPosition.x, y: e.clientY - viewPosition.y });
    };

    const handleMouseMove = (e) => {
        if (!isViewDragging) return;
        setViewPosition({
            x: e.clientX - viewDragStart.x,
            y: e.clientY - viewDragStart.y
        });
    };

    const handleMouseUp = () => setIsViewDragging(false);

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'DIRECTOR' || !!user?.is_super_admin;
    const canManage = isAdmin && editMode; // Solo pueden gestionar si son admin Y tienen editMode activo
    const userInstrumentId = user?.miembro?.id_instrumento;

    const loadData = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [temaRes, recRes, vozRes, secRes] = await Promise.all([
                api.get(`temas/${id}`),
                api.get(`recursos?id_tema=${id}`),
                api.get('voces'),
                api.get('secciones')
            ]);
            setTema(temaRes.data);
            setEditName(temaRes.data.nombre_tema);
            setRecursos(recRes.data);
            setVoces(vozRes.data);
            setSections(secRes.data);
        } catch (error) {
            notify("Error al cargar los datos del tema", "error");
            navigate('/dashboard/biblioteca');
        } finally {
            setLoading(false);
        }
    }, [id, notify, navigate]);

    useEffect(() => {
        loadData();
    }, [loadData, refreshTrigger]);

    const handleUpdateName = async () => {
        if (!editName.trim() || editName === tema.nombre_tema) {
            setIsEditingName(false);
            return;
        }

        try {
            await api.put(`temas/${tema.id_tema}`, {
                nombre_tema: editName
            });
            notify("Nombre del tema actualizado", "success");
            setTema(prev => ({ ...prev, nombre_tema: editName.toUpperCase() }));
            setIsEditingName(false);
        } catch (error) {
            notify("Error al actualizar el nombre", "error");
        }
    };

    const handleDeleteRecurso = (id) => {
        setDeleteConfirm({ isOpen: false, id: null }); // Close confirm
        confirmDeleteRecurso(id);
    };

    const confirmDeleteRecurso = async (id) => {
        try {
            await api.delete(`recursos/${id}`);
            notify("Recurso eliminado", "success");
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            notify("Error al eliminar", "error");
        }
    };

    if (loading && !tema) {
        return <SkeletonDetail />;
    }

    if (!tema) return null;

    // Filtrado inteligente: 
    // Si está en modo gestión (canManage) o no tiene instrumento: Ve todo.
    // Si está en modo lectura (y tiene instrumento): Ve solo lo suyo.
    const userVozId = user?.miembro?.id_voz;

    const filteredRecursos = (canManage || (isAdmin && !userInstrumentId))
        ? recursos 
        : recursos.filter(r => 
            r.id_instrumento == userInstrumentId && 
            (r.id_voz == userVozId || r.id_voz == null)
        );

    const activeInstruments = Array.from(new Map(filteredRecursos.map(r => [r.id_instrumento, r.instrumento])).values())
        .filter(Boolean)
        .sort((a, b) => a.instrumento.localeCompare(b.instrumento));

    const activeVoicesBase = voces.filter(voz => 
        filteredRecursos.some(r => r.id_voz === voz.id_voz)
    ).sort((a, b) => a.nombre_voz.localeCompare(b.nombre_voz));

    const activeVoices = [...activeVoicesBase];
    if (filteredRecursos.some(r => r.id_voz === null)) {
        activeVoices.unshift({ id_voz: null, nombre_voz: 'GRAL / PERCUSIÓN' });
    }

    const renderMemberView = () => {
        // Preparar lista plana de archivos
        const memberFiles = filteredRecursos.flatMap(r => {
            const instName = activeInstruments.find(i => i.id_instrumento === r.id_instrumento)?.instrumento || '';
            const vozName = activeVoices.find(v => v.id_voz === r.id_voz)?.nombre_voz || '';
            return (r.archivos || []).filter(f => f.tipo !== 'audio').map(f => ({
                ...f,
                title: `${instName} - ${vozName}`,
                type: (f.tipo === 'pdf' || f.url_archivo.toLowerCase().includes('.pdf')) ? 'pdf' : 'image',
                original_title: f.nombre_original
            }));
        });

        // Collect all audio resources
        const allAudioResources = filteredRecursos.filter(r => r.archivos?.some(f => f.tipo === 'audio'));

        if (memberFiles.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-gray-700 mb-6">
                        <FileText className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 uppercase">Sin recursos disponibles</h3>
                    <p className="text-gray-500 max-w-xs text-sm">No se han encontrado partituras para visualizar en este modo.</p>
                </div>
            );
        }

        // Seleccionar archivo actual
        const currentFile = memberFiles[viewIndex] || memberFiles[0];
        if (!memberFiles[viewIndex] && memberFiles.length > 0 && viewIndex !== 0) {
            setViewIndex(0);
        }

        const isImage = currentFile.type === 'image';

        // Botón "X" logic: Si es admin sale a gestión, si no, vuelve atrás
        const handleCloseReader = () => {
             navigate('/dashboard/biblioteca');
        };

        return (
            <div className="fixed inset-0 z-50 bg-[#09090b] flex flex-col animate-in fade-in duration-300">
                <div className="flex items-center justify-between p-4 bg-black/40 border-b border-white/5 shrink-0 z-50 backdrop-blur-md">
                    <div className="flex items-center gap-4 min-w-0">
                        <button 
                            onClick={handleCloseReader}
                            className="p-3 hover:bg-white/10 rounded-2xl text-white/70 hover:text-white transition-all bg-white/5 border border-white/10"
                            title="Volver"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <div className="flex flex-col min-w-0">
                            <h3 className="text-xs lg:text-sm font-black text-white uppercase tracking-tight truncate max-w-[150px] lg:max-w-2xl">
                                {tema.nombre_tema} • <span className="text-brand-primary">{currentFile.title}</span>
                            </h3>
                            {memberFiles.length > 1 && (
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-0.5">
                                    Archivo {viewIndex + 1} de {memberFiles.length}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isAdmin && (
                            <button
                                onClick={() => handleEditModeChange(!editMode)}
                                title={editMode ? "Desactivar Gestión" : "Activar Gestión"}
                                className={clsx(
                                    "p-3 rounded-2xl flex items-center justify-center transition-all duration-300 border mr-2",
                                    editMode 
                                        ? "bg-brand-primary/20 border-brand-primary text-brand-primary" 
                                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                )}
                            >
                                {editMode ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                            </button>
                        )}
                        {isImage && (
                            <div className="hidden lg:flex items-center bg-white/5 rounded-2xl p-1 gap-1 border border-white/10 mr-2">
                                <button onClick={() => setZoom(prev => Math.max(25, prev - 25))} className="p-2 hover:bg-white/10 rounded-xl text-white/50 hover:text-white"><ZoomOut className="w-4 h-4" /></button>
                                <span className="text-[10px] font-black text-white w-10 text-center">{zoom}%</span>
                                <button onClick={() => setZoom(prev => Math.min(500, prev + 25))} className="p-2 hover:bg-white/10 rounded-xl text-white/50 hover:text-white"><ZoomIn className="w-4 h-4" /></button>
                                <div className="w-px h-4 bg-white/10 mx-1"></div>
                                <button onClick={() => setRotation(prev => (prev + 90) % 360)} className="p-2 hover:bg-white/10 rounded-xl text-white/50 hover:text-white"><RotateCw className="w-4 h-4" /></button>
                                <button onClick={resetView} className="p-2 hover:bg-white/10 rounded-xl text-white/50 hover:text-white" title="Resetear"><Maximize2 className="w-4 h-4" /></button>
                            </div>
                        )}
                        {tema.videos?.[0]?.url_video && (
                            <button 
                                onClick={() => window.open(tema.videos[0].url_video, '_blank')}
                                className="h-10 rounded-2xl px-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white transition-all shadow-lg border border-red-500/10"
                            >
                                <Video className="w-4 h-4" /> <span className="hidden sm:inline">Video</span>
                            </button>
                        )}
                        <a 
                            href={getCleanUrl(currentFile.url_archivo)}
                            download
                            className="h-10 rounded-2xl px-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-brand-primary hover:bg-brand-primary/80 text-white transition-all shadow-lg"
                        >
                            <Download className="w-4 h-4" /> <span className="hidden sm:inline">Descargar</span>
                        </a>
                    </div>
                </div>

                <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-dots-pattern">
                    {memberFiles.length > 1 && (
                        <>
                            <button 
                                onClick={() => setViewIndex(prev => Math.max(0, prev - 1))}
                                disabled={viewIndex === 0}
                                className={`absolute left-4 lg:left-6 z-30 p-4 text-black/40 hover:text-black/80 hover:bg-black/5 rounded-full transition-all duration-300 ${viewIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                            >
                                <ChevronLeft className="w-10 h-10 lg:w-12 lg:h-12" />
                            </button>
                            <button 
                                onClick={() => setViewIndex(prev => Math.min(memberFiles.length - 1, prev + 1))}
                                disabled={viewIndex === memberFiles.length - 1}
                                className={`absolute right-4 lg:right-6 z-30 p-4 text-black/40 hover:text-black/80 hover:bg-black/5 rounded-full transition-all duration-300 ${viewIndex === memberFiles.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                            >
                                <ChevronRight className="w-10 h-10 lg:w-12 lg:h-12" />
                            </button>
                        </>
                    )}

                    <div 
                        className={`w-full h-full flex items-center justify-center relative touch-none select-none ${isImage ? (isViewDragging ? 'cursor-grabbing' : zoom > 100 ? 'cursor-grab' : 'cursor-default') : ''}`}
                        onMouseDown={isImage ? handleMouseDown : undefined}
                        onMouseMove={isImage ? handleMouseMove : undefined}
                        onMouseUp={isImage ? handleMouseUp : undefined}
                        onMouseLeave={isImage ? handleMouseUp : undefined}
                    >
                        {isImage ? (
                            <div 
                                className="w-full h-full transition-transform duration-100 ease-out flex items-center justify-center p-4 lg:p-10"
                                style={{ 
                                    transform: `translate(${viewPosition.x}px, ${viewPosition.y}px) scale(${zoom / 100}) rotate(${rotation}deg)`
                                }}
                            >
                                <img 
                                    src={getCleanUrl(currentFile.url_archivo)} 
                                    alt={currentFile.title}
                                    className="w-full h-full object-contain drop-shadow-2xl pointer-events-none"
                                />
                            </div>
                        ) : (
                            <div className="w-full h-full p-4 lg:p-10 flex items-center justify-center">
                                <div className="w-full h-full max-w-6xl bg-white rounded-lg shadow-2xl overflow-hidden">
                                     <iframe 
                                        src={`${getCleanUrl(currentFile.url_archivo)}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                                        className="w-full h-full border-none"
                                        title={currentFile.title}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none opacity-50 text-[9px] font-black uppercase tracking-[0.3em] text-white hidden lg:block">
                    {isImage && "Pellizca o usa la rueda para Zoom • Arrastra para mover"}
                </div>

                {(allAudioResources.length > 0 || tema.audio) && (
                    <div className="absolute bottom-6 right-6 z-50">
                         <div className="bg-[#161b2c]/95 backdrop-blur-xl border border-white/10 rounded-[24px] p-4 shadow-2xl shadow-black/50 flex flex-col gap-3 max-w-[280px]">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                                <Music className="w-3.5 h-3.5 text-indigo-400" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest pl-1">Guías de Audio</span>
                            </div>
                            <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                                {tema.audio && (
                                    <div className="flex flex-col gap-1.5 p-2 bg-indigo-600/5 rounded-xl border border-indigo-500/10">
                                         <span className="text-[9px] font-black text-indigo-400 uppercase tracking-tight truncate">Audio Principal (Tema)</span>
                                        <audio controls className="w-full h-8 block custom-audio-player-xs" src={getCleanUrl(tema.audio.url_audio)}></audio>
                                    </div>
                                )}
                                {allAudioResources
                                    .flatMap(r => (r.archivos || []).filter(f => f.tipo === 'audio').map(f => ({ ...f, inst: r.instrumento })))
                                    .map((file) => (
                                        <div key={file.id_archivo} className="flex flex-col gap-1.5 p-2 bg-white/5 rounded-xl border border-white/5">
                                            <span className="text-[9px] font-bold text-gray-500 truncate w-full">{file.nombre_original} ({file.inst})</span>
                                            <audio controls className="w-full h-8 block custom-audio-player-xs" src={getCleanUrl(file.url_archivo)}></audio>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-2">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/dashboard/biblioteca')}
                        className="p-3 bg-surface-card hover:bg-brand-primary rounded-xl text-gray-500 dark:text-white/50 hover:text-white transition-all group shrink-0 border border-surface-border shadow-lg"
                        title="Volver a Biblioteca"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="min-w-0">
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight truncate transition-colors">
                            {isEditingName ? (
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="bg-surface-input border border-brand-primary/50 rounded-xl px-4 py-1 text-2xl font-black text-gray-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-brand-primary w-full max-w-sm transition-colors"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleUpdateName();
                                            if (e.key === 'Escape') setIsEditingName(false);
                                        }}
                                    />
                                    <Button size="sm" onClick={handleUpdateName} className="h-10 px-4 text-[10px] font-black uppercase tracking-widest">Listo</Button>
                                </div>
                            ) : (
                                tema.nombre_tema
                            )}
                        </h1>
                        <p className="text-gray-500 text-sm font-medium uppercase tracking-widest mt-1">
                            {tema.genero?.nombre_genero} • Catálogo Musical
                        </p>
                    </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto mt-4 md:mt-0 px-2 lg:px-0">
                    {canManage && (
                        <div className="flex gap-3 flex-1 sm:flex-none animate-in slide-in-from-right-4 duration-300">
                            <Button 
                                onClick={() => {
                                    setRecursoInitialData({
                                        id_genero: tema.id_genero,
                                        id_tema: tema.id_tema
                                    });
                                    setIsRecursoModalOpen(true);
                                }}
                                className="h-12 px-6 shadow-lg shadow-indigo-600/10 text-[11px] font-black uppercase tracking-widest rounded-xl bg-indigo-600 hover:bg-indigo-500"
                            >
                                <Plus className="w-4 h-4 mr-2" /> RECURSO
                            </Button>
                            <div className="flex gap-2">
                                <Button 
                                    variant="secondary" 
                                    className="h-12 px-4 bg-surface-card border-surface-border hover:bg-black/5 dark:hover:bg-white/5"
                                    onClick={() => setIsEditingName(true)}
                                    title="Editar nombre"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button 
                                    variant="secondary"
                                    className="h-12 px-4 bg-surface-card border-surface-border hover:bg-black/5 dark:hover:bg-white/5"
                                    onClick={() => setIsTemaModalOpen(true)}
                                    title="Ajustes del tema"
                                >
                                    <Music className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar">
                {canManage ? (
                    <div className="px-2 lg:px-0">
                        {/* Desktop Table View */}
                        <div className="hidden lg:block bg-surface-card border border-surface-border rounded-[40px] overflow-x-auto shadow-2xl transition-colors">
                            <div className="min-w-[800px]">
                                <table className="w-full border-separate border-spacing-y-2 px-6 py-4">
                                    <thead>
                                        <tr>
                                            <th className="text-left px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest transition-colors">Instrumento</th>
                                            {activeVoices.map(voz => (
                                                <th key={voz.id_voz} className="text-center px-4 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest transition-colors">
                                                    {voz.nombre_voz}
                                                </th>
                                            ))}
                                            <th className="px-4 py-4 text-center text-[10px] font-black text-white bg-indigo-600/20 uppercase tracking-widest rounded-tr-2xl">Gestión</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(activeInstruments.length > 0 ? activeInstruments : sections.flatMap(s => s.instrumentos || [])).map((inst) => (
                                            <tr key={inst.id_instrumento} className="group">
                                            <td className="px-6 py-4 bg-black/[0.02] dark:bg-white/2 rounded-l-[24px] border-l border-t border-b border-surface-border transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                        <Layers className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight transition-colors">{inst.instrumento}</span>
                                                        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.1em] transition-colors">{inst.seccion?.seccion}</span>
                                                    </div>
                                                </div>
                                            </td>

                                                {activeVoices.map(voz => {
                                                    const matchingResources = recursos.filter(r => r.id_instrumento === inst.id_instrumento && r.id_voz === voz.id_voz);
                                                    const validFiles = matchingResources.flatMap(r => r.archivos || []).filter(f => f.tipo !== 'audio');

                                                    return (
                                                        <td key={voz.id_voz} className="px-4 py-4 bg-black/[0.02] dark:bg-white/2 border-t border-b border-surface-border text-center transition-colors">
                                                            {validFiles.length > 0 ? (
                                                                <div className="flex flex-wrap items-center justify-center gap-3">
                                                                    {validFiles.map((file, index) => (
                                                                        <div key={file.id_archivo} className="relative group/btn">
                                                                            <button 
                                                                                onClick={() => setViewerData({
                                                                                    files: validFiles.map(f => ({
                                                                                        url: f.url_archivo,
                                                                                        type: f.tipo === 'pdf' ? 'pdf' : 'image',
                                                                                        title: `${tema.nombre_tema} - ${inst.instrumento} (${voz.nombre_voz} - ${f.nombre_original})`
                                                                                    })),
                                                                                    initialIndex: index
                                                                                })}
                                                                                className="w-10 h-10 flex items-center justify-center bg-indigo-600/10 hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 hover:text-white rounded-xl transition-all border border-indigo-500/20 shadow-lg"
                                                                                title={`Ver archivo ${index + 1}`}
                                                                            >
                                                                                {file.tipo === 'pdf' ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                                                                            </button>
                                                                            {validFiles.length > 1 && (
                                                                                <span className="absolute -top-2 -right-2 w-5 h-5 bg-surface-dark text-white text-[9px] font-black flex items-center justify-center rounded-full border border-surface-border shadow-md pointer-events-none select-none">
                                                                                    {index + 1}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="h-[1px] w-4 bg-surface-border mx-auto"></div>
                                                            )}
                                                        </td>
                                                    );
                                                })}

                                                <td className="px-4 py-4 bg-black/5 dark:bg-white/5 border-r border-t border-b border-surface-border rounded-r-[24px] transition-colors">
                                                <div className="flex flex-col gap-3 p-2 min-w-[200px]">
                                                    {recursos.filter(r => r.id_instrumento === inst.id_instrumento).length > 0 ? (
                                                        <div className="space-y-1">
                                                            {recursos.filter(r => r.id_instrumento === inst.id_instrumento).map((res) => (
                                                                <div key={res.id_recurso} className="flex items-center justify-between p-2 bg-black/10 dark:bg-black/20 rounded-lg border border-surface-border hover:border-indigo-500/30 transition-all">
                                                                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase truncate transition-colors">
                                                                            {res.id_voz ? voces.find(v => v.id_voz === res.id_voz)?.nombre_voz : 'GRAL / PERCUSIÓN'}
                                                                        </span>
                                                                        <div className="flex gap-1">
                                                                            <button 
                                                                                onClick={() => {
                                                                                    setRecursoInitialData({
                                                                                        ...res,
                                                                                        id_genero: tema.id_genero
                                                                                    });
                                                                                    setIsRecursoModalOpen(true);
                                                                                }}
                                                                                className="p-1 hover:bg-indigo-500 rounded text-gray-500 hover:text-white transition-colors"
                                                                            >
                                                                                <Edit2 className="w-3 h-3" />
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => setDeleteConfirm({ isOpen: true, id: res.id_recurso })}
                                                                                className="p-1 hover:bg-red-500 rounded text-gray-500 hover:text-white transition-colors"
                                                                            >
                                                                                <Trash2 className="w-3 h-3" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center">
                                                                <button 
                                                                    onClick={() => {
                                                                        setRecursoInitialData({
                                                                            id_genero: tema.id_genero,
                                                                            id_tema: tema.id_tema,
                                                                            id_instrumento: inst.id_instrumento,
                                                                            id_seccion: inst.id_seccion
                                                                        });
                                                                        setIsRecursoModalOpen(true);
                                                                    }}
                                                                    className="text-[9px] font-black text-white/20 hover:text-brand-primary uppercase tracking-widest transition-colors"
                                                                >
                                                                    + Añadir Recursos
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {activeInstruments.length === 0 && (
                                            <tr>
                                                <td colSpan={activeVoices.length + 2} className="py-20 text-center text-gray-500 uppercase text-xs font-black tracking-widest">
                                                    No hay recursos detallados para este tema
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Admin View (Cards) */}
                        <div className="lg:hidden space-y-4">
                            {(activeInstruments.length > 0 ? activeInstruments : sections.flatMap(s => s.instrumentos || [])).map((inst) => {
                                const instResources = recursos.filter(r => r.id_instrumento === inst.id_instrumento);
                                return (
                                    <div key={`mob-adm-${inst.id_instrumento}`} className="bg-surface-card border border-surface-border rounded-3xl p-5 shadow-xl transition-colors">
                                    <div className="flex items-center justify-between mb-4 border-b border-surface-border pb-3 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 transition-colors">
                                                <Layers className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight transition-colors">{inst.instrumento}</h4>
                                                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest transition-colors">{inst.seccion?.seccion}</p>
                                            </div>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    setRecursoInitialData({
                                                        id_genero: tema.id_genero,
                                                        id_tema: tema.id_tema,
                                                        id_instrumento: inst.id_instrumento,
                                                        id_seccion: inst.id_seccion
                                                    });
                                                    setIsRecursoModalOpen(true);
                                                }}
                                                className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {instResources.length > 0 ? instResources.map(res => {
                                                const validFiles = (res.archivos || []).filter(f => f.tipo !== 'audio');
                                                const vozName = voces.find(v => v.id_voz === res.id_voz)?.nombre_voz;

                                                return (
                                                    <div key={`res-mob-${res.id_recurso}`} className="bg-black/[0.02] dark:bg-white/2 rounded-xl p-3 border border-surface-border transition-colors">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest transition-colors">{vozName}</span>
                                                            <div className="flex gap-1">
                                                                <button onClick={() => { setRecursoInitialData({...res, id_genero: tema.id_genero}); setIsRecursoModalOpen(true); }} className="p-1.5 text-gray-500 hover:text-white"><Edit2 className="w-3.5 h-3.5" /></button>
                                                                <button onClick={() => setDeleteConfirm({ isOpen: true, id: res.id_recurso })} className="p-1.5 text-gray-600 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {validFiles.map((f, i) => (
                                                                <button 
                                                                    key={f.id_archivo}
                                                                    onClick={() => setViewerData({
                                                                        files: validFiles.map(file => ({
                                                                            url: file.url_archivo,
                                                                            type: file.tipo === 'pdf' ? 'pdf' : 'image',
                                                                            title: `${tema.nombre_tema} - ${inst.instrumento} (${vozName})`
                                                                        })),
                                                                        initialIndex: i
                                                                    })}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/10 rounded-lg text-[9px] font-bold text-white uppercase tracking-widest"
                                                                >
                                                                    {f.tipo === 'pdf' ? <FileText className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                                                                    VER
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            }) : (
                                            <p className="text-center text-[9px] font-black text-gray-400 dark:text-gray-700 uppercase py-2 transition-colors">Sin recursos</p>
                                        )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    renderMemberView()
                )}
            </div>

            {/* Modals Section */}
            <RecursoModal 
                isOpen={isRecursoModalOpen} 
                onClose={() => {
                    setIsRecursoModalOpen(false);
                    setRecursoInitialData(null);
                }} 
                onSuccess={() => setRefreshTrigger(prev => prev + 1)}
                initialData={recursoInitialData}
            />

            <TemaModal 
                isOpen={isTemaModalOpen}
                onClose={() => setIsTemaModalOpen(false)}
                idGenero={tema.id_genero}
                nombreGenero={tema.genero?.nombre_genero}
                onSuccess={() => setRefreshTrigger(prev => prev + 1)}
                initialData={tema}
            />



            <ConfirmationModal 
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
                onConfirm={() => confirmDeleteRecurso(deleteConfirm.id)}
                title="¿Eliminar Recurso?"
                message="Esta acción borrará la partitura y el audio de forma permanente. ¿Estás seguro?"
                confirmText="Sí, Eliminar"
            />

            <MultimediaViewerModal 
                isOpen={!!viewerData}
                onClose={() => setViewerData(null)}
                files={viewerData?.files}
                initialIndex={viewerData?.initialIndex}
            />
            
            <footer className="mt-8 py-6 text-center">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Monster Band Music Library</p>
            </footer>
        </div>
    );
}
