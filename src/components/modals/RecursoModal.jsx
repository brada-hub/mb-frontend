import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { clsx } from 'clsx';
import api from '../../api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { 
    X, 
    Upload, 
    FileText, 
    PlayCircle, 
    Check,
    Video,
    Image as ImageIcon,
    Trash,
    File,
    GripVertical
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

function SortableItem({ id, children }) {
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
        zIndex: isDragging ? 10 : 1,
        position: 'relative',
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className={clsx(isDragging && "shadow-2xl scale-[1.02]")}>
            <div className="flex items-center gap-2 w-full">
                <button 
                    type="button"
                    {...attributes} 
                    {...listeners}
                    className="p-2 text-gray-500 hover:text-indigo-400 cursor-grab active:cursor-grabbing touch-none shrink-0"
                >
                    <GripVertical className="w-5 h-5" />
                </button>
                {children}
            </div>
        </div>
    );
}
import MultimediaViewerModal from './MultimediaViewerModal';

export default function RecursoModal({ isOpen, onClose, onSuccess, initialData }) {
    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            tipo_recurso: 'PARTITURA',
            id_tema: '',
            id_genero: '',
            id_seccion: '',
            id_instrumento: '',
            id_voz: ''
        }
    });

    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState([]); // { id: string|number, type: 'existing'|'new', file?: File, url?: string, name: string }
    const [audioFile, setAudioFile] = useState(null); // { file?: File, url?: string, name: string, isExisting: boolean }
    const [catalogs, setCatalogs] = useState({
        generos: [],
        temas: [],
        secciones: [], // Contains .instrumentos
        voces: []
    });
    const [isInitialized, setIsInitialized] = useState(false);
    const [viewerData, setViewerData] = useState(null);
    const [themeResources, setThemeResources] = useState([]);
    const [isValidatingVoice, setIsValidatingVoice] = useState(false);
    const { notify } = useToast();

    const selectedGenero = watch('id_genero');
    const selectedTema = watch('id_tema');
    const selectedSeccion = watch('id_seccion');
    const selectedInstrumento = watch('id_instrumento');
    const watchArchivos = watch('archivos'); // Changed from archivo to archivos
    const watchAudio = watch('audio_guia');

    // Fetch resources for theme when selected
    useEffect(() => {
        const fetchThemeResources = async () => {
            if (selectedTema && selectedTema !== 'NEW') {
                setIsValidatingVoice(true);
                try {
                    const res = await api.get(`recursos?id_tema=${selectedTema}`);
                    setThemeResources(res.data);
                } catch (error) {
                    console.error("Error fetching theme resources:", error);
                } finally {
                    setIsValidatingVoice(false);
                }
            } else {
                setThemeResources([]);
            }
        };
        fetchThemeResources();
    }, [selectedTema]);

    // Voices that are already taken for this instrument in this theme
    const takenVoices = themeResources
        .filter(r => String(r.id_instrumento) === String(selectedInstrumento))
        .filter(r => !initialData?.id_recurso || r.id_recurso !== initialData.id_recurso)
        .map(r => String(r.id_voz));

    // Get instruments for selected section
    const availableInstruments = catalogs.secciones.find(s => String(s.id_seccion) === String(selectedSeccion))?.instrumentos || [];

    // Cargar catálogos solo una vez al abrir el modal
    useEffect(() => {
        if (isOpen) {
            loadCatalogs();
            if (initialData?.archivos) {
                const existingFiles = initialData.archivos
                    .filter(a => a.tipo !== 'audio')
                    .sort((a, b) => (a.orden || 0) - (b.orden || 0))
                    .map(a => ({
                        id: a.id_archivo,
                        type: 'existing',
                        url: a.url_archivo,
                        name: a.nombre_original,
                        fileType: a.tipo
                    }));
                setFileList(existingFiles);

                const existingAudio = initialData.archivos.find(a => a.tipo === 'audio');
                if (existingAudio) {
                    setAudioFile({
                        id: existingAudio.id_archivo,
                        name: existingAudio.nombre_original,
                        url: existingAudio.url_archivo,
                        isExisting: true
                    });
                } else {
                    setAudioFile(null);
                }
            } else {
                setFileList([]);
                setAudioFile(null);
            }
        } else {
            setIsInitialized(false);
            reset();
            setFileList([]);
            setAudioFile(null);
        }
    }, [isOpen, initialData]);

    const loadCatalogs = async () => {
        try {
            const [genRes, secRes, vozRes, temaRes] = await Promise.all([
                api.get('generos'),
                api.get('secciones'),
                api.get('voces'),
                api.get('temas')
            ]);
            
            setCatalogs({
                generos: genRes.data,
                secciones: secRes.data,
                voces: vozRes.data,
                temas: temaRes.data
            });
        } catch (error) {
            notify("Error al cargar catálogos", "error");
        }
    };

    // Initialize form when catalogs and initialData are ready
    useEffect(() => {
        if (isOpen && catalogs.generos.length > 0 && initialData && !isInitialized) {
            // Set basic fields first
            if (initialData.id_genero) setValue('id_genero', String(initialData.id_genero));
            if (initialData.id_voz) setValue('id_voz', String(initialData.id_voz));
            if (initialData.video_url_opcional) setValue('video_url_opcional', initialData.video_url_opcional);
            if (initialData.tipo_recurso) setValue('tipo_recurso', initialData.tipo_recurso);

            // Set section which will trigger availableInstruments change
            const seccionId = initialData.instrumento?.id_seccion || initialData.id_seccion;
            if (seccionId) setValue('id_seccion', String(seccionId));
            
            setIsInitialized(true);
        }
    }, [isOpen, catalogs.generos, initialData, isInitialized, setValue]);

    // Separate effect for theme to ensure genre is processed first
    useEffect(() => {
        if (isInitialized && initialData?.id_tema && String(selectedGenero) === String(initialData.id_genero)) {
            setValue('id_tema', String(initialData.id_tema));
        }
    }, [isInitialized, initialData, selectedGenero, setValue]);

    // Separate effect for instrument ensure seccion is set first
    useEffect(() => {
        if (isInitialized && initialData?.id_instrumento && availableInstruments.length > 0) {
            setValue('id_instrumento', String(initialData.id_instrumento));
        }
    }, [isInitialized, initialData, availableInstruments, setValue]);

    const onSubmit = async (data) => {
        setLoading(true);
        const isEditing = !!initialData?.id_recurso;
        const formData = new FormData();
        
        if (isEditing) {
            formData.append('_method', 'PUT');
        }

        formData.append('id_tema', data.id_tema);
        if (data.id_tema === 'NEW') {
            formData.append('nuevo_tema_nombre', data.nuevo_tema_nombre);
            formData.append('id_genero', data.id_genero);
        }
        // Send id_instrumento instead of section
        formData.append('id_instrumento', data.id_instrumento);
        formData.append('id_voz', data.id_voz);
        formData.append('tipo_recurso', data.tipo_recurso || 'PARTITURA');
        
        if (data.video_url_opcional !== undefined) {
            formData.append('video_url_opcional', data.video_url_opcional || '');
        }
        
        // Handle file order
        const existingOrder = fileList
            .filter(f => f.type === 'existing')
            .map(f => f.id);
        
        formData.append('existing_files_order', JSON.stringify(existingOrder));

        // Handle new files in their current order
        const newFiles = fileList.filter(f => f.type === 'new');
        newFiles.forEach((f, index) => {
            formData.append(`new_archivos[${index}]`, f.file);
        });
        
        if (audioFile && !audioFile.isExisting) {
            formData.append('audio_guia', audioFile.file);
        } else if (!audioFile && initialData?.archivos?.some(a => a.tipo === 'audio')) {
            // Signal deletion of audio if it was there but now removed
            formData.append('delete_audio', 'true');
        }

        try {
            const endpoint = isEditing ? `recursos/${initialData.id_recurso}` : 'recursos';
            await api.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            notify(isEditing ? "Recurso actualizado correctamente" : "Recurso subido correctamente", "success");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error completo de subida:", error.response?.data);
            if (error.response?.status === 422 && error.response.data.errors) {
                const firstError = Object.values(error.response.data.errors)[0][0];
                notify(`Error: ${firstError}`, "error");
            } else {
                notify(error.response?.data?.message || "Error al subir recurso", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setFileList((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 md:p-4 bg-transparent animate-in fade-in duration-300">
            <div className="relative w-full max-w-2xl bg-[#161b2c] border border-white/10 md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
                
                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-between text-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-white/20 rounded-2xl">
                            <Upload className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight">
                                {initialData?.id_recurso ? 'Modificar Recurso' : 'Subir Recurso'}
                            </h2>
                            <p className="text-[10px] text-white/60 font-black uppercase tracking-widest">
                                {initialData?.id_recurso ? 'Actualizar archivos o datos' : 'Partituras y Guías de Audio'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Género y Tema */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Asignación de Tema</label>
                            <select 
                                {...register('id_genero', { required: true })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            >
                                <option value="" className="bg-[#161b2c]">Seleccionar Género...</option>
                                {catalogs.generos.map(g => <option key={g.id_genero} value={g.id_genero} className="bg-[#161b2c]">{g.nombre_genero}</option>)}
                            </select>

                            <select 
                                {...register('id_tema', { required: true })}
                                disabled={!selectedGenero}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
                            >
                                <option value="" className="bg-[#161b2c]">Seleccionar Tema...</option>
                                <option value="NEW" className="bg-[#161b2c] text-indigo-400 font-bold">+ NUEVO TEMA (Escribir nombre)</option>
                                {catalogs.temas.filter(t => String(t.id_genero) === String(selectedGenero)).map(t => (
                                    <option key={t.id_tema} value={t.id_tema} className="bg-[#161b2c]">{t.nombre_tema}</option>
                                ))}
                            </select>

                            {selectedTema === 'NEW' && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-2">Nombre del Nuevo Tema</label>
                                    <input 
                                        {...register('nuevo_tema_nombre', { required: selectedTema === 'NEW' })}
                                        placeholder="EJ: LA MARIPOSA..."
                                        className="w-full bg-indigo-500/5 border border-indigo-500/30 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Sección e Instrumento */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Asignación Instrumental</label>
                            
                            <div className="grid grid-cols-2 gap-2">
                                <select 
                                    {...register('id_seccion', { required: true })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                >
                                    <option value="" className="bg-[#161b2c]">Sección...</option>
                                    {catalogs.secciones.map(s => <option key={s.id_seccion} value={s.id_seccion} className="bg-[#161b2c]">{s.seccion}</option>)}
                                </select>

                                <select 
                                    {...register('id_instrumento', { required: true })}
                                    disabled={!selectedSeccion || availableInstruments.length === 0}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
                                >
                                    <option value="" className="bg-[#161b2c]">Instrumento...</option>
                                    {availableInstruments.map(i => <option key={i.id_instrumento} value={i.id_instrumento} className="bg-[#161b2c]">{i.instrumento}</option>)}
                                </select>
                            </div>

                            <select 
                                {...register('id_voz', { required: true })}
                                disabled={!selectedInstrumento || isValidatingVoice}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
                            >
                                <option value="" className="bg-[#161b2c]">
                                    {isValidatingVoice ? 'Validando disponibilidad...' : 'Seleccionar Voz...'}
                                </option>
                                {catalogs.voces.map(v => {
                                    const isTaken = takenVoices.includes(String(v.id_voz));
                                    return (
                                        <option 
                                            key={v.id_voz} 
                                            value={v.id_voz} 
                                            className={clsx("bg-[#161b2c]", isTaken && "text-gray-500")}
                                            disabled={isTaken}
                                        >
                                            {v.nombre_voz} {isTaken ? '(OCUPADA)' : ''}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                         <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Archivos y Enlaces Multimedia</label>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="relative group text-center">
                                <label className={clsx(
                                    "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-3xl cursor-pointer transition-all",
                                    fileList.length > 0
                                        ? "bg-emerald-500/10 border-emerald-500/50 hover:bg-emerald-500/20" 
                                        : "bg-white/5 border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5"
                                )}>
                                    <div className="flex gap-2 text-indigo-400">
                                        <FileText className="w-8 h-8" />
                                        <ImageIcon className="w-8 h-8" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-tighter mt-2 text-white/50">
                                        Subir Partituras (PDF/FOTO)
                                    </span>
                                    <input 
                                        type="file" 
                                        multiple 
                                        className="hidden" 
                                        accept=".pdf,image/*" 
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files);
                                            const newItems = files.map(f => ({
                                                id: Math.random().toString(36).substr(2, 9),
                                                type: 'new',
                                                file: f,
                                                url: URL.createObjectURL(f),
                                                name: f.name,
                                                fileType: f.type.includes('pdf') ? 'pdf' : 'imagen'
                                            }));
                                            setFileList(prev => [...prev, ...newItems]);
                                        }}
                                    />
                                </label>
                            </div>

                            <div className="relative group">
                                <label className={clsx(
                                    "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-3xl cursor-pointer transition-all",
                                    audioFile
                                        ? "bg-purple-500/10 border-purple-500/50 hover:bg-purple-500/20" 
                                        : "bg-white/5 border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5"
                                )}>
                                    {audioFile ? (
                                        <Check className="w-8 h-8 text-purple-400 mb-2" />
                                    ) : (
                                        <PlayCircle className="w-8 h-8 text-gray-500 mb-2 group-hover:text-purple-400" />
                                    )}
                                    <span className={clsx(
                                        "text-[10px] font-black uppercase tracking-tighter truncate max-w-[80%] px-4",
                                        audioFile ? "text-purple-400" : "text-gray-500 group-hover:text-white"
                                    )}>
                                        {audioFile 
                                            ? audioFile.name 
                                            : "Audio Guía (Opcional)"}
                                    </span>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="audio/*" 
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setAudioFile({
                                                    file: file,
                                                    name: file.name,
                                                    isExisting: false
                                                });
                                            }
                                        }}
                                    />
                                </label>
                                {audioFile && (
                                    <button 
                                        type="button"
                                        onClick={() => setAudioFile(null)}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all z-10"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                         </div>

                         {/* FILE LIST PREVIEW & REORDER */}
                         {fileList.length > 0 && (
                             <div className="space-y-3 bg-[#0f111a]/50 p-4 rounded-3xl border border-white/5">
                                 <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-2">Orden de Partituras</h4>
                                 <div className="space-y-2">
                                     <DndContext 
                                        sensors={sensors} 
                                        collisionDetection={closestCenter} 
                                        onDragEnd={handleDragEnd}
                                     >
                                        <SortableContext 
                                            items={fileList.map(f => f.id)} 
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {fileList.map((item, index) => (
                                                <SortableItem key={item.id} id={item.id}>
                                                    <div className="flex-1 flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5 group/file">
                                                        <button 
                                                            type="button"
                                                            onClick={() => setViewerData({
                                                                url: item.url,
                                                                type: item.fileType,
                                                                title: item.name
                                                            })}
                                                            className="w-12 h-12 bg-indigo-500/10 rounded-xl overflow-hidden flex items-center justify-center text-indigo-400 shrink-0 hover:ring-2 hover:ring-indigo-500 transition-all cursor-zoom-in"
                                                        >
                                                            {item.fileType === 'pdf' ? (
                                                                <FileText className="w-6 h-6" />
                                                            ) : (
                                                                <img src={item.url} alt="preview" className="w-full h-full object-cover" />
                                                            )}
                                                        </button>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-bold text-white truncate uppercase">{item.name}</p>
                                                            <p className="text-[9px] text-gray-500 font-black uppercase">Página {index + 1}</p>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <button 
                                                                type="button" 
                                                                onClick={() => {
                                                                    const newList = fileList.filter((_, i) => i !== index);
                                                                    setFileList(newList);
                                                                }}
                                                                className="p-1.5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded-lg transition-all"
                                                            >
                                                                <Trash className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </SortableItem>
                                            ))}
                                        </SortableContext>
                                     </DndContext>
                                 </div>
                             </div>
                         )}
                    </div>

                    <div className="flex justify-end bg-white/5 rounded-3xl p-4">
                        <Button type="submit" loading={loading} className="w-full md:w-auto px-12 h-12">
                             {initialData?.id_recurso ? 'Guardar Cambios' : 'Confirmar Subida'}
                        </Button>
                    </div>

                </form>
            </div>

            <MultimediaViewerModal 
                isOpen={!!viewerData}
                onClose={() => setViewerData(null)}
                url={viewerData?.url}
                type={viewerData?.type}
                title={viewerData?.title}
            />
        </div>
    );
}
