import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import api from '../../api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { 
    X, 
    Search, 
    Plus, 
    Trash2, 
    GripVertical,
    Music,
    Layers,
    Save,
    Tag,
    Eye,
    EyeOff
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import {
    DndContext, 
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableTema({ id, tema, onRemove }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 1,
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            className={clsx(
                "flex items-center gap-3 p-3 bg-black/5 dark:bg-white/5 border border-surface-border rounded-2xl mb-2 transition-all group",
                isDragging ? "shadow-2xl scale-[1.02] bg-indigo-600/20 border-indigo-500/50" : "hover:border-brand-primary/30 dark:hover:border-surface-border"
            )}
        >
            <button 
                type="button"
                {...attributes} 
                {...listeners}
                className="p-1 text-gray-500 hover:text-white cursor-grab active:cursor-grabbing touch-none"
            >
                <GripVertical className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight truncate transition-colors">{tema.nombre_tema}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-500 font-bold uppercase tracking-widest transition-colors">{tema.genero?.nombre_genero}</p>
            </div>
            <button 
                onClick={() => onRemove(id)}
                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                type="button"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}

export default function MixModal({ isOpen, onClose, onSuccess, initialData }) {
    const [nombre, setNombre] = useState('');
    const [activo, setActivo] = useState(true);
    const [audioFile, setAudioFile] = useState(null);
    const [selectedTemas, setSelectedTemas] = useState([]); // List of { id_temp: string, ...tema }
    const [allTemas, setAllTemas] = useState([]);
    const [genres, setGenres] = useState([]);
    const [selectedGenreId, setSelectedGenreId] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const { notify } = useToast();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (isOpen) {
            loadData();
            if (initialData) {
                setNombre(initialData.nombre);
                setActivo(initialData.activo ?? true);
                setSelectedTemas(initialData.temas.map((t, idx) => ({ ...t, id_temp: `existing-${t.id_tema}-${idx}` })));
                setAudioFile(null);
            } else {
                setNombre('');
                setActivo(true);
                setSelectedTemas([]);
                setAudioFile(null);
            }
            setSelectedGenreId('all');
            setSearchQuery('');
        }
    }, [isOpen, initialData]);

    const loadData = async () => {
        try {
            const [temasRes, genresRes] = await Promise.all([
                api.get('temas'),
                api.get('generos')
            ]);
            setAllTemas(temasRes.data);
            setGenres(genresRes.data);
        } catch (error) {
            notify("Error al cargar datos", "error");
        }
    };

    const filteredAvailableTemas = useMemo(() => {
        return allTemas.filter(t => {
            const matchesGenre = selectedGenreId === 'all' || t.id_genero === parseInt(selectedGenreId);
            const matchesSearch = !searchQuery || 
                t.nombre_tema.toLowerCase().includes(searchQuery.toLowerCase());
            
            // No mostrar si ya está seleccionado
            const isAlreadyAdded = selectedTemas.some(st => st.id_tema === t.id_tema);
            
            return matchesGenre && matchesSearch && !isAlreadyAdded;
        }).slice(0, 10);
    }, [allTemas, searchQuery, selectedGenreId, selectedTemas]);

    const handleAddTema = (tema) => {
        const newEntry = {
            ...tema,
            id_temp: `new-${tema.id_tema}-${Date.now()}`
        };
        setSelectedTemas([...selectedTemas, newEntry]);
        setSearchQuery('');
    };

    const handleRemoveTema = (id) => {
        setSelectedTemas(selectedTemas.filter(t => t.id_temp !== id));
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setSelectedTemas((items) => {
                const oldIndex = items.findIndex(t => t.id_temp === active.id);
                const newIndex = items.findIndex(t => t.id_temp === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleSave = async () => {
        if (!nombre.trim()) {
            notify("El nombre del mix es obligatorio", "warning");
            return;
        }
        if (selectedTemas.length === 0) {
            notify("Añade al menos un tema al mix", "warning");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('nombre', nombre);
            formData.append('activo', activo ? '1' : '0');
            
            selectedTemas.forEach(t => {
                formData.append('temas[]', t.id_tema);
            });

            if (audioFile) {
                formData.append('audio_file', audioFile);
            }

            const config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };

            if (initialData) {
                formData.append('_method', 'PUT');
                await api.post(`mixes/${initialData.id_mix}`, formData, config);
                notify("Mix actualizado correctamente", "success");
            } else {
                await api.post('mixes', formData, config);
                notify("Mix creado correctamente", "success");
            }
            onSuccess?.();
            onClose();
        } catch (error) {
            notify("Error al guardar el mix", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose} />
            
            <div className="relative w-full max-w-2xl bg-surface-card border border-surface-border rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] text-gray-900 dark:text-gray-100 transition-colors">
                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-surface-border bg-surface-card transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight transition-colors">
                                {initialData ? 'Editar Mix' : 'Nuevo Mix / Repertorio'}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-500 text-xs font-bold uppercase tracking-widest mt-1 transition-colors">Organización de temas</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                    {/* Nombre y Visibilidad */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                        <div className="flex-1 w-full space-y-3">
                            <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1 transition-colors">Nombre del Mix</label>
                            <Input 
                                placeholder="EJ: MIX MORENADAS 2024"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                className="h-14 bg-surface-input border-surface-border rounded-2xl text-lg font-bold uppercase focus:ring-indigo-500/50 text-gray-900 dark:text-white transition-all"
                            />
                        </div>
                        <div className="w-full sm:w-auto space-y-3">
                            <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1 transition-colors">Visibilidad</label>
                            <button
                                type="button"
                                onClick={() => setActivo(!activo)}
                                className={clsx(
                                    "h-14 px-6 rounded-2xl border transition-all flex items-center gap-3 font-black text-[10px] uppercase tracking-widest min-w-[140px] justify-center",
                                    activo 
                                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                                        : "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
                                )}
                            >
                                {activo ? (
                                    <><Eye className="w-4 h-4" /> Visible</>
                                ) : (
                                    <><EyeOff className="w-4 h-4" /> Oculto</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Audio del Mix */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1 transition-colors">Audio del Mix (Opcional)</label>
                        <div className="relative group">
                            <input 
                                id="mix-audio-upload"
                                type="file"
                                accept=".mp3,.wav,.ogg,.m4a"
                                onChange={(e) => setAudioFile(e.target.files[0])}
                                className="hidden"
                            />
                            <div className={clsx(
                                "flex items-center gap-4 w-full bg-surface-input border rounded-2xl p-2 transition-all",
                                audioFile || initialData?.audio ? "border-indigo-500/50 bg-indigo-500/5" : "border-surface-border"
                            )}>
                                <label 
                                    htmlFor="mix-audio-upload"
                                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl cursor-pointer transition-all shadow-lg shrink-0"
                                >
                                    Seleccionar Archivo
                                </label>
                                <div className="flex-1 min-w-0 pr-2">
                                    <p className="text-[10px] font-bold text-gray-900 dark:text-white uppercase truncate transition-colors">
                                        {audioFile 
                                            ? audioFile.name 
                                            : initialData?.audio 
                                                ? initialData.audio.url_audio.split('/').pop() 
                                                : 'Sin archivo seleccionado'}
                                    </p>
                                    {(audioFile || initialData?.audio) && (
                                        <p className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-0.5 transition-colors">
                                            {audioFile ? 'Archivo listo para subir' : 'Audio actual guardado'}
                                        </p>
                                    )}
                                </div>
                                {audioFile && (
                                    <button 
                                        type="button"
                                        onClick={() => setAudioFile(null)}
                                        className="p-1.5 hover:bg-red-500/20 text-red-600 dark:text-red-500 rounded-lg transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Selector de Temas */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Buscar y Añadir Temas</label>
                        
                        <div className="flex flex-col gap-3">
                            {/* Filtro de Géneros */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
                                 <button
                                    onClick={() => setSelectedGenreId('all')}
                                    className={clsx(
                                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border",
                                        selectedGenreId === 'all' 
                                            ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20" 
                                            : "bg-black/5 dark:bg-white/5 border-surface-border text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10"
                                    )}
                                >
                                    Todos
                                </button>
                                {genres.map(genre => (
                                    <button
                                        key={genre.id_genero}
                                        onClick={() => setSelectedGenreId(genre.id_genero)}
                                        className={clsx(
                                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border",
                                            parseInt(selectedGenreId) === genre.id_genero 
                                                ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20" 
                                                : "bg-black/5 dark:bg-white/5 border-surface-border text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10"
                                        )}
                                    >
                                        {genre.nombre_genero}
                                    </button>
                                ))}
                            </div>

                             <div className="relative">
                                <Input 
                                    icon={Search}
                                    placeholder="Escribe el nombre de una canción..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-12 bg-surface-input border-surface-border rounded-2xl text-gray-900 dark:text-white transition-all"
                                />
                                
                                {filteredAvailableTemas.length > 0 && (searchQuery || selectedGenreId !== 'all') && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-surface-card border border-surface-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200 max-h-60 overflow-y-auto custom-scrollbar">
                                        {filteredAvailableTemas.map(tema => (
                                            <button
                                                key={tema.id_tema}
                                                onClick={() => handleAddTema(tema)}
                                                className="w-full flex items-center gap-4 p-4 hover:bg-black/5 dark:hover:bg-white/5 text-left border-b border-surface-border last:border-none transition-colors"
                                            >
                                                <div className="w-10 h-10 bg-black/5 dark:bg-white/5 rounded-xl flex items-center justify-center text-gray-400">
                                                    <Music className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight transition-colors">{tema.nombre_tema}</p>
                                                    <p className="text-[9px] text-gray-500 dark:text-gray-500 font-bold uppercase tracking-widest transition-colors">{tema.genero?.nombre_genero}</p>
                                                </div>
                                                <Plus className="ml-auto w-5 h-5 text-indigo-400" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Lista Ordenable */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Temas Seleccionados ({selectedTemas.length})</label>
                            <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest italic">Arrastra para reordenar</span>
                        </div>
                        
                         {selectedTemas.length > 0 ? (
                            <DndContext 
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext 
                                    items={selectedTemas.map(t => t.id_temp)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-2">
                                        {selectedTemas.map((tema) => (
                                            <SortableTema 
                                                key={tema.id_temp} 
                                                id={tema.id_temp} 
                                                tema={tema} 
                                                onRemove={handleRemoveTema}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center bg-black/5 dark:bg-white/[0.02] border-2 border-dashed border-surface-border rounded-[32px] text-gray-500 dark:text-gray-600 text-center px-6 transition-colors">
                                <Music className="w-12 h-12 mb-4 opacity-20" />
                                <p className="text-sm font-bold uppercase tracking-widest opacity-40">No hay temas en este mix</p>
                            </div>
                        )}
                    </div>
                </div>

                 {/* Footer */}
                <div className="p-8 border-t border-surface-border bg-black/5 dark:bg-black/20 flex gap-4 transition-colors">
                    <Button 
                        variant="secondary"
                        onClick={onClose}
                        className="flex-1 h-16 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 bg-transparent border border-surface-border text-gray-900 dark:text-white transition-colors"
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-[2] h-16 rounded-2xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-brand-primary/20"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                {initialData ? 'Actualizar Mix' : 'Crear Mix'}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
}
