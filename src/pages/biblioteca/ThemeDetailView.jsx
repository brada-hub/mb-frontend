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
    Layers,
    Mic,
    ExternalLink,
    Video,
    Image as ImageIcon,
    Plus,
    Edit2,
    Trash2,
    ArrowLeft
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import MultimediaViewerModal from '../../components/modals/MultimediaViewerModal';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import RecursoModal from '../../components/modals/RecursoModal';
import TemaModal from '../../components/modals/TemaModal';
import { useAuth } from '../../context/AuthContext';

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

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'DIRECTOR';
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
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Sincronizando partituras...</p>
            </div>
        );
    }

    if (!tema) return null;

    // Filtrado inteligente según rol
    const filteredRecursos = isAdmin 
        ? recursos 
        : recursos.filter(r => r.id_instrumento === userInstrumentId);

    const activeInstruments = Array.from(new Map(filteredRecursos.map(r => [r.id_instrumento, r.instrumento])).values())
        .filter(Boolean)
        .sort((a, b) => a.instrumento.localeCompare(b.instrumento));

    const activeVoices = voces.filter(voz => 
        filteredRecursos.some(r => r.id_voz === voz.id_voz)
    ).sort((a, b) => a.nombre_voz.localeCompare(b.nombre_voz));

    const renderMemberView = () => {
        if (activeInstruments.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-gray-700 mb-6">
                        <FileText className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 uppercase">Sin recursos para tu instrumento</h3>
                    <p className="text-gray-500 max-w-xs text-sm">Aún no se han subido partituras para tu sección en este tema.</p>
                </div>
            );
        }
        
        const inst = activeInstruments[0];

        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
                {/* Voices Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeVoices.map(voz => {
                        const matchingResources = filteredRecursos.filter(r => r.id_instrumento === inst.id_instrumento && r.id_voz === voz.id_voz);
                        const validFiles = matchingResources.flatMap(r => r.archivos || []).filter(f => f.tipo !== 'audio');

                        if (validFiles.length === 0) return null;

                        return (
                            <div key={voz.id_voz} className="bg-surface-card border border-white/5 rounded-[35px] p-8 hover:border-indigo-500/30 transition-all hover:translate-y-[-4px] duration-300 shadow-xl group/card">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-indigo-400 group-hover/card:bg-indigo-600 group-hover/card:text-white transition-all">
                                            <Music className="w-5 h-5" />
                                        </div>
                                        <h4 className="text-lg font-black text-white uppercase tracking-tight">{voz.nombre_voz}</h4>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">{validFiles.length} {validFiles.length === 1 ? 'ARCHIVO' : 'ARCHIVOS'}</span>
                                </div>

                                <div className="space-y-3">
                                    {validFiles.map((file, idx) => (
                                        <button
                                            key={file.id_archivo}
                                            onClick={() => setViewerData({
                                                files: validFiles.map(f => ({
                                                    url: f.url_archivo,
                                                    type: f.tipo === 'pdf' ? 'pdf' : 'image',
                                                    title: `${tema.nombre_tema} - ${inst.instrumento} (${voz.nombre_voz})`
                                                })),
                                                initialIndex: idx
                                            })}
                                            className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-indigo-600 rounded-2xl transition-all group/btn border border-white/5"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-black/20 rounded-xl flex items-center justify-center text-gray-400 group-hover/btn:text-white">
                                                    {file.tipo === 'pdf' ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-xs font-black text-white uppercase truncate max-w-[150px]">{file.nombre_original || `Parte ${idx + 1}`}</p>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest group-hover/btn:text-indigo-200 uppercase">{file.tipo}</p>
                                                </div>
                                            </div>
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/0 group-hover/btn:bg-white/20 flex items-center justify-center text-white/0 group-hover/btn:text-white transition-all">
                                                <ExternalLink className="w-4 h-4" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {/* Audio Guías Section */}
                    {recursos.some(r => r.id_instrumento === inst.id_instrumento && r.archivos?.some(f => f.tipo === 'audio')) && (
                        <div className="md:col-span-2 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/20 rounded-[35px] p-8 shadow-xl mt-4">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4 text-center md:text-left">
                                    <div className="w-16 h-16 bg-purple-600 rounded-[20px] flex items-center justify-center text-white shadow-xl shadow-purple-600/30">
                                        <Play className="w-8 h-8 fill-current translate-x-1" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-white uppercase tracking-tight">Guías de Audio</h4>
                                        <p className="text-purple-300/80 text-[10px] font-bold uppercase tracking-widest mt-1">Escucha y practica con la referencia</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap justify-center gap-3">
                                    {recursos
                                        .filter(r => r.id_instrumento === inst.id_instrumento)
                                        .flatMap(r => r.archivos || [])
                                        .filter(f => f.tipo === 'audio')
                                        .map((file, idx) => (
                                            <a 
                                                key={`audio-member-${file.id_archivo}`} 
                                                href={file.url_archivo} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className="px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-lg shadow-purple-600/20 active:scale-95"
                                            >
                                                <Play className="w-4 h-4 fill-current" /> AUDIO {idx + 1}
                                            </a>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Unified Style */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-2">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/dashboard/biblioteca')}
                        className="p-3 bg-[#161b2c] hover:bg-indigo-600 rounded-xl text-white/50 hover:text-white transition-all group shrink-0 border border-white/5 shadow-lg"
                        title="Volver a Biblioteca"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="min-w-0">
                        <h1 className="text-3xl font-black text-white uppercase tracking-tight truncate">
                            {isEditingName ? (
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="bg-[#161b2c] border border-indigo-500/50 rounded-xl px-4 py-1 text-2xl font-black text-white uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full max-w-sm"
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
                
                {isAdmin && (
                    <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto mt-4 md:mt-0 px-2 lg:px-0">
                        <Button 
                            onClick={() => {
                                setRecursoInitialData({
                                    id_genero: tema.id_genero,
                                    id_tema: tema.id_tema
                                });
                                setIsRecursoModalOpen(true);
                            }}
                            className="h-12 px-6 shadow-lg shadow-indigo-600/10 text-[11px] font-black uppercase tracking-widest rounded-xl bg-indigo-600 hover:bg-indigo-500 flex-1 sm:flex-none"
                        >
                            <Plus className="w-4 h-4 mr-2" /> RECURSO
                        </Button>
                        <div className="grid grid-cols-2 gap-3 flex-1 sm:flex-none">
                            <Button 
                                variant="secondary" 
                                className="h-12 px-4 text-[11px] font-black uppercase tracking-widest rounded-xl bg-[#161b2c] border-white/5 hover:bg-white/5 w-full"
                                onClick={() => setIsEditingName(true)}
                            >
                                <Edit2 className="w-4 h-4 mr-2" /> Nombre
                            </Button>
                            <Button 
                                variant="secondary"
                                className="h-12 px-4 text-[11px] font-black uppercase tracking-widest rounded-xl bg-[#161b2c] border-white/5 hover:bg-white/5 w-full"
                                onClick={() => setIsTemaModalOpen(true)}
                            >
                                <Music className="w-4 h-4 mr-2" /> Ajustes
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* List / Grid Content Area */}
            <div className="flex-1 overflow-auto custom-scrollbar">
                {isAdmin ? (
                    <div className="px-2 lg:px-0">
                        {/* Desktop Table View */}
                        <div className="hidden lg:block bg-surface-card border border-white/5 rounded-[40px] overflow-x-auto shadow-2xl">
                            <div className="min-w-[800px]">
                                <table className="w-full border-separate border-spacing-y-2 px-6 py-4">
                                    <thead>
                                        <tr>
                                            <th className="text-left px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Instrumento</th>
                                            {activeVoices.map(voz => (
                                                <th key={voz.id_voz} className="text-center px-4 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                                    {voz.nombre_voz}
                                                </th>
                                            ))}
                                            <th className="text-center px-4 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Audio / Guía</th>
                                            <th className="px-4 py-4 text-center text-[10px] font-black text-white bg-indigo-600/20 uppercase tracking-widest rounded-tr-2xl">Gestión</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(activeInstruments.length > 0 ? activeInstruments : sections.flatMap(s => s.instrumentos || [])).slice(0, activeInstruments.length > 0 ? undefined : 0).map((inst) => (
                                            <tr key={inst.id_instrumento} className="group">
                                                <td className="px-6 py-4 bg-white/2 rounded-l-[24px] border-l border-t border-b border-white/5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                            <Layers className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-white uppercase tracking-tight">{inst.instrumento}</span>
                                                            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.1em]">{inst.seccion?.seccion}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {activeVoices.map(voz => {
                                                    const matchingResources = recursos.filter(r => r.id_instrumento === inst.id_instrumento && r.id_voz === voz.id_voz);
                                                    const validFiles = matchingResources.flatMap(r => r.archivos || []).filter(f => f.tipo !== 'audio');

                                                    return (
                                                        <td key={voz.id_voz} className="px-4 py-4 bg-white/2 border-t border-b border-white/5 text-center">
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
                                                                                className="w-10 h-10 flex items-center justify-center bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-xl transition-all border border-indigo-500/20 shadow-lg"
                                                                                title={`Ver archivo ${index + 1}`}
                                                                            >
                                                                                {file.tipo === 'pdf' ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                                                                            </button>
                                                                            {validFiles.length > 1 && (
                                                                                <span className="absolute -top-2 -right-2 w-5 h-5 bg-surface-dark text-white text-[9px] font-black flex items-center justify-center rounded-full border border-white/10 shadow-md">
                                                                                    {index + 1}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="h-[1px] w-4 bg-white/10 mx-auto"></div>
                                                            )}
                                                        </td>
                                                    );
                                                })}

                                                <td className="px-4 py-4 bg-white/2 border-t border-b border-white/5 text-center">
                                                    <div className="flex flex-wrap items-center justify-center gap-2">
                                                        {recursos
                                                            .filter(r => r.id_instrumento === inst.id_instrumento)
                                                            .flatMap(r => r.archivos || [])
                                                            .filter(f => f.tipo === 'audio')
                                                            .map(file => (
                                                                <a key={`audio-${file.id_archivo}`} href={file.url_archivo} target="_blank" rel="noreferrer" className="w-10 h-10 inline-flex items-center justify-center bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white rounded-xl transition-all border border-purple-500/20 shadow-lg">
                                                                    <Play className="w-5 h-5 fill-current" />
                                                                </a>
                                                            ))
                                                        }
                                                    </div>
                                                    {recursos.filter(r => r.id_instrumento === inst.id_instrumento && r.archivos?.some(f => f.tipo === 'audio')).length === 0 && (
                                                        <div className="h-[1px] w-4 bg-white/10 mx-auto"></div>
                                                    )}
                                                </td>

                                                <td className="px-4 py-4 bg-white/5 border-r border-t border-b border-white/10 rounded-r-[24px]">
                                                    <div className="flex flex-col gap-3 p-2 min-w-[200px]">
                                                        {recursos.filter(r => r.id_instrumento === inst.id_instrumento).length > 0 ? (
                                                            <div className="space-y-1">
                                                                {recursos.filter(r => r.id_instrumento === inst.id_instrumento).map((res) => (
                                                                    <div key={res.id_recurso} className="flex items-center justify-between p-2 bg-black/20 rounded-lg border border-white/5 hover:border-indigo-500/30 transition-all">
                                                                        <span className="text-[10px] font-bold text-indigo-400 uppercase truncate">
                                                                            {voces.find(v => v.id_voz === res.id_voz)?.nombre_voz}
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
                                                <td colSpan={activeVoices.length + 3} className="py-20 text-center text-gray-500 uppercase text-xs font-black tracking-widest">
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
                                    <div key={`mob-adm-${inst.id_instrumento}`} className="bg-surface-card border border-white/5 rounded-3xl p-5 shadow-xl">
                                        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-400">
                                                    <Layers className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-white uppercase tracking-tight">{inst.instrumento}</h4>
                                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{inst.seccion?.seccion}</p>
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
                                                const audioFiles = (res.archivos || []).filter(f => f.tipo === 'audio');
                                                const vozName = voces.find(v => v.id_voz === res.id_voz)?.nombre_voz;

                                                return (
                                                    <div key={`res-mob-${res.id_recurso}`} className="bg-white/2 rounded-xl p-3 border border-white/5">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{vozName}</span>
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
                                                            {audioFiles.map(f => (
                                                                <a key={f.id_archivo} href={f.url_archivo} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/10 rounded-lg text-[9px] font-bold text-purple-400 uppercase tracking-widest">
                                                                    <Play className="w-3 h-3 fill-current" /> AUDIO
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            }) : (
                                                <p className="text-center text-[9px] font-black text-gray-700 uppercase py-2">Sin recursos</p>
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

            <MultimediaViewerModal 
                isOpen={!!viewerData}
                onClose={() => setViewerData(null)}
                files={viewerData?.files}
                initialIndex={viewerData?.initialIndex}
            />

            <ConfirmationModal 
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
                onConfirm={() => confirmDeleteRecurso(deleteConfirm.id)}
                title="¿Eliminar Recurso?"
                message="Esta acción borrará la partitura y el audio de forma permanente. ¿Estás seguro?"
                confirmText="Sí, Eliminar"
            />
            
            <footer className="mt-8 py-6 text-center">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Monster Band Music Library</p>
            </footer>
        </div>
    );
}
