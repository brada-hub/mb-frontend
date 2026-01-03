import { useState, useEffect, useRef } from 'react';
import api from '../../api';
import { Button } from '../ui/Button';
import { 
    Plus, 
    Trash2, 
    Upload,
    ImageIcon,
    Tag,
    Image as ImageIconLucide,
    Search,
    Settings,
    X,
    GripVertical
} from 'lucide-react';
import { clsx } from 'clsx';
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

function SortableItem({ id, children, disabled }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id, disabled });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        position: 'relative',
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className={clsx(isDragging && "shadow-2xl scale-105")}>
            <div className="flex items-center gap-2 h-full">
                {/* Drag Handle */}
                <button 
                    {...attributes} 
                    {...listeners}
                    className={clsx(
                        "p-2 text-gray-500 hover:text-indigo-400 cursor-grab active:cursor-grabbing touch-none",
                        disabled && "opacity-30 cursor-not-allowed"
                    )}
                    disabled={disabled}
                >
                    <GripVertical className="w-5 h-5" />
                </button>
                {children}
            </div>
        </div>
    );
}

export default function MusicCatalogModal({ isOpen, onClose, editGenre }) {
    const [loading, setLoading] = useState(false);
    const [generos, setGeneros] = useState([]);
    const [newItem, setNewItem] = useState({ 
        name: '', 
        banner: null, 
        color_primario: '#4f46e5', 
        color_secundario: '#7c3aed' 
    });
    const [previewUrl, setPreviewUrl] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingId, setEditingId] = useState(null);
    const fileInputRef = useRef(null);
    const { notify } = useToast();

    const presets = [
        { p: '#4f46e5', s: '#7c3aed' }, // Indigo/Violet
        { p: '#0ea5e9', s: '#2563eb' }, // Blue
        { p: '#8b5cf6', s: '#ec4899' }, // Purple/Pink
        { p: '#10b981', s: '#059669' }, // Emerald
        { p: '#f59e0b', s: '#d97706' }, // Amber
        { p: '#ef4444', s: '#b91c1c' }, // Red
    ];

    useEffect(() => {
        if (isOpen) {
            loadGeneros();
            if (editGenre) {
                handleEdit(editGenre);
            }
        } else {
            resetForm();
        }
    }, [isOpen, editGenre]);

    const resetForm = () => {
        setNewItem({ 
            name: '', 
            banner: null, 
            color_primario: '#4f46e5', 
            color_secundario: '#7c3aed' 
        });
        setPreviewUrl(null);
        setEditingId(null);
        setSearchQuery("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const loadGeneros = async () => {
        setLoading(true);
        try {
            const res = await api.get('generos');
            setGeneros(res.data);
        } catch (error) {
            notify("Error al cargar géneros", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewItem({ ...newItem, banner: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEdit = (gen) => {
        setEditingId(gen.id_genero);
        setNewItem({
            name: gen.nombre_genero,
            banner: null, // Keep existing unless changed
            color_primario: gen.color_primario || '#4f46e5',
            color_secundario: gen.color_secundario || '#7c3aed'
        });
        setPreviewUrl(gen.banner_url);
    };

    const handleSave = async () => {
        if (!newItem.name) {
            notify("El nombre del género es obligatorio", "warning");
            return;
        }
        setLoading(true);
        const formData = new FormData();
        formData.append('nombre_genero', newItem.name.toUpperCase());
        formData.append('color_primario', newItem.color_primario);
        formData.append('color_secundario', newItem.color_secundario);
        if (newItem.banner) {
            formData.append('banner', newItem.banner);
        }
        if (editingId) {
            formData.append('_method', 'PUT');
        }

        try {
            if (editingId) {
                await api.post(`generos/${editingId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                notify("Género actualizado correctamente", "success");
            } else {
                await api.post('generos', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                notify("Género creado correctamente", "success");
            }
            onClose(); // Close modal on success
        } catch (error) {
            notify(error.response?.data?.message || "Error al guardar género", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Estás seguro de eliminar este género?")) return;
        setLoading(true);
        try {
            await api.delete(`generos/${id}`);
            notify("Género eliminado", "success");
            loadGeneros();
            if (editingId === id) resetForm();
        } catch (error) {
            notify(error.response?.data?.message || "No se puede eliminar porque tiene temas asociados", "error");
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

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setGeneros((items) => {
                const oldIndex = items.findIndex((item) => item.id_genero === active.id);
                const newIndex = items.findIndex((item) => item.id_genero === over.id);
                
                const newItems = arrayMove(items, oldIndex, newIndex);
                
                // Guardar orden en backend sin bloquear la UI
                const orders = newItems.map((g, i) => ({ id: g.id_genero, orden: i }));
                api.post('generos/reorder', { orders }).catch(() => {
                    notify("Error al guardar el orden", "error");
                    loadGeneros();
                });

                return newItems;
            });
        }
    };

    const filteredGeneros = generos.filter(g => 
        g.nombre_genero.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-0 md:p-4 bg-transparent animate-in fade-in duration-300">
            <div className="relative w-full max-w-5xl bg-[#161b2c] border border-white/10 md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-300">
                
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-white/20 rounded-2xl">
                            <Settings className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight">Personalización de Géneros</h2>
                            <p className="text-[10px] text-white/60 font-black uppercase tracking-widest">Monster Band Design Studio</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                        <X className="w-6 h-6 text-white" />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row h-full overflow-hidden">
                    {/* Form & Color Picker Side */}
                    <div className="w-full md:w-1/2 p-8 border-b md:border-b-0 md:border-r border-white/5 space-y-8 overflow-y-auto custom-scrollbar">
                        
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full">
                                {editingId ? 'EDITANDO GÉNERO' : 'CREAR NUEVO'}
                            </span>
                            {editingId && (
                                <button onClick={resetForm} className="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase tracking-wider">
                                    CANCELAR EDICIÓN
                                </button>
                            )}
                        </div>

                        {/* Name Input */}
                        <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2 mb-2 block">Nombre del Género</label>
                            <input 
                                type="text"
                                placeholder="..."
                                value={newItem.name}
                                onChange={(e) => setNewItem({...newItem, name: e.target.value.toUpperCase()})}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 uppercase font-black"
                                autoFocus
                            />
                        </div>

                        {/* Color Selection */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2 block">Colores del Banner (Degradado)</label>
                            <div className="flex flex-wrap gap-3">
                                {presets.map((p, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setNewItem({ ...newItem, color_primario: p.p, color_secundario: p.s })}
                                        style={{ background: `linear-gradient(135deg, ${p.p}, ${p.s})` }}
                                        className={clsx(
                                            "w-10 h-10 rounded-xl border-2 transition-all hover:scale-110",
                                            newItem.color_primario === p.p ? "border-white scale-110 shadow-lg shadow-white/20" : "border-transparent"
                                        )}
                                    />
                                ))}
                                <div className="flex gap-2 ml-auto">
                                    <input 
                                        type="color" 
                                        value={newItem.color_primario} 
                                        onChange={(e) => setNewItem({ ...newItem, color_primario: e.target.value })}
                                        className="w-10 h-10 rounded-xl bg-transparent border border-white/10 cursor-pointer overflow-hidden"
                                    />
                                    <input 
                                        type="color" 
                                        value={newItem.color_secundario} 
                                        onChange={(e) => setNewItem({ ...newItem, color_secundario: e.target.value })}
                                        className="w-10 h-10 rounded-xl bg-transparent border border-white/10 cursor-pointer overflow-hidden"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2 block">Imagen Decorativa (PNG Recomendado)</label>
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="relative h-32 cursor-pointer border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-2 hover:border-indigo-500/50 hover:bg-white/5 transition-all group overflow-hidden"
                            >
                                {previewUrl ? (
                                    <>
                                        <img src={previewUrl} className="h-full object-contain" alt="" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity font-black text-[10px] text-white uppercase tracking-widest">
                                            Cambiar Imagen
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-6 h-6 text-gray-500 group-hover:text-indigo-400 group-hover:scale-110 transition-all" />
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-white">Seleccionar Archivo</span>
                                    </>
                                )}
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            </div>
                        </div>

                        <Button className="w-full h-14 rounded-2xl shadow-xl shadow-indigo-600/20 uppercase font-black tracking-widest" onClick={handleSave} loading={loading}>
                            {editingId ? 'Guardar Cambios' : 'Crear Nuevo Género'}
                        </Button>
                    </div>

                    {/* Preview & List Side */}
                    <div className="w-full md:w-1/2 bg-black/40 flex flex-col overflow-hidden">
                        
                        <div className="p-6 border-b border-white/5 shrink-0 space-y-4">
                             {/* Mobile Emulator Frame Preview */}
                             <div className="w-full h-32 bg-[#0d1117] rounded-3xl border-4 border-[#2d333b] overflow-hidden relative flex items-center justify-center shrink-0">
                                <div 
                                    style={{ background: `linear-gradient(90deg, ${newItem.color_primario}, ${newItem.color_secundario})` }}
                                    className="w-[90%] h-20 rounded-2xl relative overflow-hidden flex items-center px-6 shadow-xl transition-all duration-500"
                                >
                                    <div className="relative z-10">
                                        <h4 className="text-white font-black text-lg uppercase tracking-tight leading-tight">
                                            {newItem.name || 'VISTA PREVIA'}
                                        </h4>
                                    </div>
                                    <div className="absolute right-[-10px] top-0 bottom-0 w-24 flex items-center justify-center scale-110 pointer-events-none">
                                        {previewUrl ? (
                                            <img src={previewUrl} className="h-full object-contain drop-shadow-2xl" alt="" />
                                        ) : (
                                            <ImageIconLucide className="w-8 h-8 text-white/20" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input 
                                    type="text" 
                                    placeholder="Buscar género para editar..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2">
                             <DndContext 
                                sensors={sensors} 
                                collisionDetection={closestCenter} 
                                onDragEnd={handleDragEnd}
                             >
                                <SortableContext 
                                    items={filteredGeneros.map(g => g.id_genero)} 
                                    strategy={verticalListSortingStrategy}
                                >
                                    {filteredGeneros.map((gen) => (
                                        <SortableItem key={gen.id_genero} id={gen.id_genero} disabled={searchQuery.length > 0}>
                                            <div 
                                                onClick={() => handleEdit(gen)}
                                                className={clsx(
                                                    "group flex-1 flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer",
                                                    editingId === gen.id_genero 
                                                        ? "bg-indigo-500/10 border-indigo-500/50" 
                                                        : "bg-[#161b2c] border-white/5 hover:border-white/20 hover:bg-white/5"
                                                )}
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div 
                                                        className="w-10 h-10 rounded-lg shrink-0 overflow-hidden relative"
                                                        style={{ background: `linear-gradient(135deg, ${gen.color_primario}, ${gen.color_secundario})` }}
                                                    >
                                                        {gen.banner_url && <img src={gen.banner_url} className="w-full h-full object-cover opacity-50" alt="" />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-black text-white uppercase truncate">{gen.nombre_genero}</p>
                                                        <p className="text-[9px] font-bold text-gray-500 uppercase">{gen.temas_count || 0} TEMAS</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-1">
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(gen.id_genero);
                                                        }}
                                                        className="p-2 hover:bg-red-500/20 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </SortableItem>
                                    ))}
                                </SortableContext>
                             </DndContext>
                            {filteredGeneros.length === 0 && (
                                <p className="text-center text-xs font-bold text-gray-600 uppercase py-4">No se encontraron géneros</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
