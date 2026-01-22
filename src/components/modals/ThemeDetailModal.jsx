 import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api';
import { Button } from '../ui/Button';
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
    Trash2
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import MultimediaViewerModal from './MultimediaViewerModal';
import ConfirmModal from './ConfirmModal';
import { useAuth } from '../../context/AuthContext';

export default function ThemeDetailModal({ isOpen, onClose, tema, onDeleted, onAddResource, onEditResource, refreshTrigger }) {
    const [recursos, setRecursos] = useState([]);
    const [voces, setVoces] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [viewerData, setViewerData] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
    const { notify } = useToast();
    const { user } = useAuth();

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'DIRECTOR' || !!user?.is_super_admin;
    const userInstrumentId = user?.miembro?.id_instrumento;

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    useEffect(() => {
        if (isOpen && tema) {
            loadData();
            setEditName(tema.nombre_tema);
            setIsEditing(false);
        }
    }, [isOpen, tema, refreshTrigger]);

    const loadData = async () => {
        if (!tema?.id_tema) return;
        setLoading(true);
        try {
            const [recRes, vozRes, secRes] = await Promise.all([
                api.get(`recursos?id_tema=${tema.id_tema}`),
                api.get('voces'),
                api.get('secciones')
            ]);
            setRecursos(recRes.data);
            setVoces(vozRes.data);
            setSections(secRes.data);
        } catch (error) {
            notify("Error al cargar los datos del tema", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateName = async () => {
        if (!editName.trim() || editName === tema.nombre_tema) {
            setIsEditing(false);
            return;
        }

        try {
            await api.put(`temas/${tema.id_tema}`, {
                nombre_tema: editName
            });
            notify("Nombre del tema actualizado", "success");
            tema.nombre_tema = editName.toUpperCase();
            setIsEditing(false);
        } catch (error) {
            notify("Error al actualizar el nombre", "error");
        }
    };

    const handleDelete = (id) => {
        setDeleteConfirm({ isOpen: true, id });
    };

    const confirmDelete = async () => {
        const id = deleteConfirm.id;
        try {
            await api.delete(`recursos/${id}`);
            notify("Recurso eliminado", "success");
            loadData();
            if (onDeleted) onDeleted();
        } catch (error) {
            notify("Error al eliminar", "error");
        }
    };

    if (!isOpen || !tema) return null;

    // Filtrado inteligente según rol
    const filteredRecursos = (isAdmin || (user?.is_super_admin && !userInstrumentId)) 
        ? recursos 
        : recursos.filter(r => r.id_instrumento === userInstrumentId);

    const activeInstruments = Array.from(new Map(filteredRecursos.map(r => [r.id_instrumento, r.instrumento])).values())
        .filter(Boolean)
        .sort((a, b) => a.instrumento.localeCompare(b.instrumento));

    const activeVoices = voces.filter(voz => 
        filteredRecursos.some(r => r.id_voz === voz.id_voz)
    ).sort((a, b) => a.nombre_voz.localeCompare(b.nombre_voz));

    const renderMemberView = () => {
        if (activeInstruments.length === 0) return null;
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
                            <div key={voz.id_voz} className="bg-black/5 dark:bg-[#1a2035] border border-surface-border rounded-[35px] p-8 hover:border-indigo-500/30 transition-all hover:translate-y-[-4px] duration-300 shadow-xl group/card">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-indigo-400 group-hover/card:bg-indigo-600 group-hover/card:text-white transition-all">
                                            <Music className="w-5 h-5" />
                                        </div>
                                        <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight transition-colors">{voz.nombre_voz}</h4>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-500 uppercase tracking-widest bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full transition-colors">{validFiles.length} {validFiles.length === 1 ? 'ARCHIVO' : 'ARCHIVOS'}</span>
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
                                            className="w-full flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 hover:bg-indigo-600 rounded-2xl transition-all group/btn border border-surface-border"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-black/10 dark:bg-black/20 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover/btn:text-white transition-colors">
                                                    {file.tipo === 'pdf' ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-xs font-black text-gray-900 dark:text-white uppercase truncate max-w-[150px] transition-colors">{file.nombre_original || `Parte ${idx + 1}`}</p>
                                                    <p className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest group-hover/btn:text-indigo-200 uppercase transition-colors">{file.tipo}</p>
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
                        <div className="md:col-span-2 bg-gradient-to-r from-[#7c3aed]/20 to-[#4f46e5]/20 border border-purple-500/20 rounded-[35px] p-8 shadow-xl mt-4 transition-colors">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4 text-center md:text-left">
                                    <div className="w-16 h-16 bg-purple-600 rounded-[20px] flex items-center justify-center text-white shadow-xl shadow-purple-600/30">
                                        <Play className="w-8 h-8 fill-current translate-x-1" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight transition-colors">Guías de Audio</h4>
                                        <p className="text-purple-600 dark:text-purple-300/80 text-[10px] font-bold uppercase tracking-widest mt-1 transition-colors">Escucha y practica con la referencia</p>
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

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-6xl bg-surface-card border border-surface-border md:rounded-[50px] shadow-2xl overflow-hidden flex flex-col h-full md:max-h-[90vh] text-gray-900 dark:text-gray-100">
                
                {/* Close Button - Always visible on top right */}
                <button 
                    onClick={onClose} 
                    className="absolute top-6 right-6 z-[60] p-3 bg-black/5 dark:bg-[#0f111a]/60 hover:bg-red-500/20 hover:text-red-400 backdrop-blur-md rounded-2xl text-gray-400 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-all shadow-xl border border-surface-border group"
                    title="Cerrar (Esc)"
                >
                    <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                </button>

                {/* Header Section */}
                <div className="p-6 md:p-10 bg-gradient-to-br from-black/5 to-black/10 dark:from-[#1e253c] dark:to-[#161b2c] relative overflow-hidden shrink-0 border-b border-surface-border">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>

                    
                    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4 md:gap-6 pr-12 md:pr-0">
                            <div className="w-14 h-14 md:w-20 md:h-20 bg-indigo-600 rounded-[20px] md:rounded-[30px] flex items-center justify-center text-white shadow-2xl shadow-indigo-600/40 transform -rotate-2 hover:rotate-0 transition-transform shrink-0">
                                <Music className="w-6 h-6 md:w-10 md:h-10" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] md:tracking-[0.3em] mb-1 md:mb-2">
                                    Catálogo Musical • {tema.genero?.nombre_genero}
                                </p>
                                {isEditing ? (
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="bg-white/10 border border-indigo-500/50 rounded-xl px-4 py-2 text-xl font-black text-white uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full max-w-sm"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleUpdateName();
                                                if (e.key === 'Escape') setIsEditing(false);
                                            }}
                                        />
                                        <Button size="sm" onClick={handleUpdateName}>Guardar</Button>
                                        <button onClick={() => setIsEditing(false)} className="text-[10px] font-black text-gray-500 uppercase hover:text-white">Cancelar</button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col">
                                        <h2 className="text-xl md:text-4xl font-black text-white uppercase tracking-tighter leading-none truncate">
                                            {tema.nombre_tema}
                                        </h2>
                                        {!isAdmin && activeInstruments[0] && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">{activeInstruments[0].instrumento}</span>
                                                <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{activeInstruments[0].seccion?.seccion}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {isAdmin && (
                            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-3">
                                <Button 
                                    onClick={onAddResource}
                                    className="rounded-2xl h-11 md:h-12 px-4 md:px-6 text-[10px] md:text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20"
                                >
                                    <Plus className="w-4 h-4 mr-2" /> AÑADIR RECURSO
                                </Button>
                                <Button 
                                    variant="secondary" 
                                    className="rounded-2xl h-11 md:h-12 px-4 md:px-6 text-[10px] md:text-xs font-black uppercase tracking-widest"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <Edit2 className="w-4 h-4 mr-2" /> Modificar Tema
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table Area */}
                <div className="flex-1 overflow-auto p-6 md:p-10 custom-scrollbar bg-black/5 dark:bg-black/5 transition-colors">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                            <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Cargando...</p>
                        </div>
                    ) : filteredRecursos.length > 0 ? (
                        isAdmin ? (
                            <div className="min-w-[800px]">
                                <table className="w-full border-separate border-spacing-y-2">
                                    <thead>
                                        <tr>
                                            <th className="text-left px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Instrumento</th>
                                            {activeVoices.map(voz => (
                                                <th key={voz.id_voz} className="text-center px-4 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                                    {voz.nombre_voz}
                                                </th>
                                            ))}
                                            <th className="text-center px-4 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Audio / Guía</th>
                                            {isAdmin && (
                                                <th className="px-4 py-4 text-center text-[10px] font-black text-gray-900 dark:text-white bg-indigo-600/20 uppercase tracking-widest rounded-tr-2xl transition-colors">Gestión</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeInstruments.map((inst) => (
                                            <tr key={inst.id_instrumento} className="group">
                                                <td className="px-6 py-4 bg-black/5 dark:bg-white/2 rounded-l-[24px] border-l border-t border-b border-surface-border transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                            <Layers className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight transition-colors">{inst.instrumento}</span>
                                                            <span className="text-[8px] font-bold text-gray-500 dark:text-gray-500 uppercase tracking-[0.1em] transition-colors">{inst.seccion?.seccion}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {activeVoices.map(voz => {
                                                    const matchingResources = recursos.filter(r => r.id_instrumento === inst.id_instrumento && r.id_voz === voz.id_voz);
                                                    const validFiles = matchingResources.flatMap(r => r.archivos || []).filter(f => f.tipo !== 'audio');

                                                    return (
                                                        <td key={voz.id_voz} className="px-4 py-4 bg-black/5 dark:bg-white/2 border-t border-b border-surface-border text-center transition-colors">
                                                            {validFiles.length > 0 ? (
                                                                <div className="flex flex-wrap items-center justify-center gap-3">
                                                                    {validFiles.map((file, index) => {
                                                                        const parentRes = matchingResources.find(r => r.id_recurso === file.id_recurso);
                                                                        return (
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
                                                                                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-surface-card text-gray-900 dark:text-white text-[9px] font-black flex items-center justify-center rounded-full border border-surface-border shadow-md transition-colors">
                                                                                        {index + 1}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            ) : (
                                                                <div className="h-[1px] w-4 bg-gray-300 dark:bg-white/10 mx-auto"></div>
                                                            )}
                                                        </td>
                                                    );
                                                })}

                                                {/* Audio Column */}
                                                <td className="px-4 py-4 bg-black/5 dark:bg-white/2 border-t border-b border-surface-border text-center transition-colors">
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
                                                        <div className="h-[1px] w-4 bg-gray-300 dark:bg-white/10 mx-auto"></div>
                                                    )}
                                                </td>



                                                {isAdmin && (
                                                    <td className="px-4 py-4 bg-black/10 dark:bg-white/5 border-r border-t border-b border-surface-border rounded-r-[24px] transition-colors">
                                                        <div className="flex flex-col gap-3 p-2 min-w-[200px]">
                                                            {filteredRecursos.filter(r => r.id_instrumento === inst.id_instrumento).length > 0 ? (
                                                                <div className="space-y-1">
                                                                    {filteredRecursos.filter(r => r.id_instrumento === inst.id_instrumento).map((res) => (
                                                                        <div key={res.id_recurso} className="flex flex-col gap-1 p-2 bg-black/40 rounded-lg border border-surface-border hover:border-indigo-500/30 transition-all group/item">
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="flex items-center gap-2 overflow-hidden">
                                                                                    <span className="text-[10px] font-bold text-indigo-400 uppercase truncate">
                                                                                        {voces.find(v => v.id_voz === res.id_voz)?.nombre_voz}
                                                                                    </span>
                                                                                </div>
                                                                                 <div className="flex gap-1">
                                                                                    <button onClick={() => onEditResource(res)} className="p-1 hover:bg-indigo-500 rounded text-gray-500 hover:text-white transition-colors" title="Editar"><Edit2 className="w-3 h-3" /></button>
                                                                                    <button onClick={() => handleDelete(res.id_recurso)} className="p-1 hover:bg-red-500 rounded text-gray-500 hover:text-white transition-colors" title="Eliminar"><Trash2 className="w-3 h-3" /></button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <span className="text-[9px] text-gray-600 text-center font-bold uppercase py-2 opacity-50">---</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            renderMemberView()
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center py-10">
                            <div className="w-24 h-24 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-400 mb-8 border border-surface-border transition-colors">
                                <FileText className="w-10 h-10" />
                            </div>
                            <h4 className="text-gray-900 dark:text-white font-bold text-xl mb-3 uppercase tracking-tighter transition-colors">Sin recursos disponibles</h4>
                            <p className="text-gray-500 max-w-sm text-sm font-medium mb-10 transition-colors">No se han subido partituras ni audios para este tema todavía.</p>
                            {isAdmin && (
                                <Button onClick={onAddResource} className="px-10 h-14 rounded-2xl shadow-2xl shadow-indigo-600/20 gap-3">
                                    <Plus className="w-6 h-6" /> Subir Primer Recurso
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-6 bg-surface-card border-t border-surface-border flex items-center justify-center gap-4 shrink-0 transition-colors">
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] transition-colors">Monster Band Music Library</p>
                </div>

                <MultimediaViewerModal 
                    isOpen={!!viewerData}
                    onClose={() => setViewerData(null)}
                    files={viewerData?.files}
                    initialIndex={viewerData?.initialIndex}
                />

                <ConfirmModal 
                    isOpen={deleteConfirm.isOpen}
                    onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
                    onConfirm={confirmDelete}
                    title="¿Eliminar Recurso?"
                    message="Esta acción borrará la partitura y el audio de forma permanente. ¿Estás seguro?"
                    confirmText="Sí, Eliminar"
                />
            </div>
        </div>,
        document.body
    );
}
