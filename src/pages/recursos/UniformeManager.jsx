import { useState, useEffect } from 'react';
import { 
    Plus, Trash2, Save, Edit3, X, Shirt,
    Sparkles, Eye, Palette, Check, Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import ConfirmModal from '../../components/modals/ConfirmModal';
import clsx from 'clsx';

// ─── Prendas disponibles para configurar ─────────────────────────────
// Incluye prendas formales Y casuales
const PRENDAS_BASE = [
    // Parte superior
    { id: 'saco', label: 'Saco', emoji: '🧥', required: false },
    { id: 'camisa', label: 'Camisa', emoji: '👔', required: false },
    { id: 'chaleco', label: 'Chaleco', emoji: '🦺', required: false },
    { id: 'polo', label: 'Polo / Polera', emoji: '👕', required: false },
    // Parte inferior
    { id: 'pantalon', label: 'Pantalón de Vestir', emoji: '👖', required: false },
    { id: 'jean', label: 'Jean', emoji: '👖', required: false },
    // Calzado
    { id: 'zapatos', label: 'Zapatos', emoji: '👞', required: false },
    { id: 'tenis', label: 'Tenis / Zapatillas', emoji: '👟', required: false },
    // Extras
    { id: 'gorra', label: 'Gorra / Sombrero', emoji: '🧢', required: false },
];

// Corbata o moñito - mutuamente excluyentes
const ACCESORIO_CUELLO = [
    { id: 'corbata', label: 'Corbata', emoji: '👔' },
    { id: 'monito', label: 'Moñito', emoji: '🎀' },
];

// ─── Colores predefinidos con nombre ─────────────────────────────────
const COLORES_PREDEFINIDOS = [
    { nombre: 'Blanco', hex: '#FFFFFF' },
    { nombre: 'Negro', hex: '#1a1a1a' },
    { nombre: 'Guindo', hex: '#722F37' },
    { nombre: 'Rojo', hex: '#DC2626' },
    { nombre: 'Azul Marino', hex: '#1E3A5F' },
    { nombre: 'Azul Rey', hex: '#2563EB' },
    { nombre: 'Gris Oscuro', hex: '#374151' },
    { nombre: 'Gris Claro', hex: '#9CA3AF' },
    { nombre: 'Beige', hex: '#D2B48C' },
    { nombre: 'Crema', hex: '#FFFDD0' },
    { nombre: 'Café', hex: '#6B3E26' },
    { nombre: 'Verde Militar', hex: '#4B5320' },
    { nombre: 'Vino', hex: '#722F37' },
    { nombre: 'Dorado', hex: '#DAA520' },
    { nombre: 'Plateado', hex: '#C0C0C0' },
    { nombre: 'Rosa', hex: '#EC4899' },
    { nombre: 'Morado', hex: '#7C3AED' },
    { nombre: 'Naranja', hex: '#EA580C' },
    { nombre: 'Amarillo', hex: '#EAB308' },
    { nombre: 'Turquesa', hex: '#14B8A6' },
];

// ─── Componente de selección de color (INLINE, sin dropdown) ─────────
function ColorSelector({ value, colorNombre, onChange }) {
    const handleSelectPreset = (color) => {
        onChange(color.hex, color.nombre);
    };

    const handleColorPickerChange = (e) => {
        onChange(e.target.value, colorNombre || 'Personalizado');
    };

    const handleNombreChange = (e) => {
        onChange(value || '#000000', e.target.value);
    };

    return (
        <div className="space-y-3">
            {/* ── Fila principal: muestra de color + nombre escrito ── */}
            <div className="flex items-center gap-3">
                {/* Color picker nativo (circulito clickeable) */}
                <div className="relative flex-shrink-0">
                    <div 
                        className="w-10 h-10 rounded-xl border-2 border-gray-300 dark:border-white/20 shadow-lg overflow-hidden"
                        style={{ backgroundColor: value || '#333' }}
                    >
                        <input 
                            type="color"
                            value={value || '#000000'}
                            onChange={handleColorPickerChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            title="Seleccionar color"
                        />
                    </div>
                </div>
                {/* Campo de texto para escribir el nombre del color */}
                <div className="flex-1">
                    <input
                        type="text"
                        value={colorNombre || ''}
                        onChange={handleNombreChange}
                        placeholder="Escribe el color, ej: Guindo, Blanca..."
                        className="w-full bg-surface-input border border-surface-border rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-brand-primary/50 placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all"
                    />
                </div>
                {/* Hex code pequeño */}
                <span className="text-[9px] text-gray-400 dark:text-gray-600 font-mono flex-shrink-0 hidden sm:block">{value || '#---'}</span>
            </div>

            {/* ── Paleta de colores rápidos ── */}
            <div className="flex flex-wrap gap-1.5">
                {COLORES_PREDEFINIDOS.map((c) => (
                    <button
                        key={c.nombre + c.hex}
                        type="button"
                        onClick={() => handleSelectPreset(c)}
                        className="group/color relative"
                        title={c.nombre}
                    >
                        <div 
                            className={clsx(
                                "w-7 h-7 rounded-lg border-2 transition-all hover:scale-125 hover:z-10",
                                value === c.hex 
                                    ? "border-brand-primary ring-2 ring-brand-primary/40 scale-110" 
                                    : "border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30"
                            )}
                            style={{ backgroundColor: c.hex }}
                        />
                        {/* Tooltip con nombre */}
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[7px] font-bold px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover/color:opacity-100 transition-opacity pointer-events-none z-20">
                            {c.nombre}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── Card de preview para un traje ───────────────────────────────────
function TrajePreviewCard({ uniforme, onEdit, onDelete, onDuplicate }) {
    const items = uniforme.items || [];
    
    // Orden visual
    const ordenPrendas = ['gorra', 'saco', 'camisa', 'polo', 'corbata', 'monito', 'chaleco', 'pantalon', 'jean', 'zapatos', 'tenis'];
    const sortedItems = [...items].sort((a, b) => ordenPrendas.indexOf(a.tipo) - ordenPrendas.indexOf(b.tipo));

    const getPrendaInfo = (tipo) => {
        const base = PRENDAS_BASE.find(p => p.id === tipo);
        if (base) return base;
        const acc = ACCESORIO_CUELLO.find(a => a.id === tipo);
        if (acc) return acc;
        return { label: tipo, emoji: '👕' };
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="group bg-white dark:bg-surface-card border border-gray-200 dark:border-white/5 rounded-3xl overflow-hidden hover:border-gray-300 dark:hover:border-white/15 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-brand-primary/5"
        >
            {/* Header con nombre */}
            <div className="p-6 pb-4 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">{uniforme.nombre}</h3>
                        {uniforme.descripcion && (
                            <p className="text-[10px] text-gray-500 font-bold mt-1">{uniforme.descripcion}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => onDuplicate(uniforme)}
                            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white transition-all"
                            title="Duplicar"
                        >
                            <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button 
                            onClick={() => onEdit(uniforme)} 
                            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 dark:text-gray-500 hover:text-brand-primary transition-all"
                            title="Editar"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                            onClick={() => onDelete(uniforme.id)} 
                            className="p-2 rounded-xl hover:bg-red-500/10 text-gray-400 dark:text-gray-500 hover:text-red-500 transition-all"
                            title="Eliminar"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Lista de prendas */}
            <div className="p-4 space-y-1.5">
                {sortedItems.length === 0 ? (
                    <p className="text-center text-gray-400 dark:text-gray-600 text-xs py-6">Sin prendas configuradas</p>
                ) : (
                    sortedItems.map((item, idx) => {
                        const info = getPrendaInfo(item.tipo);
                        return (
                            <div 
                                key={idx}
                                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.03] hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-all"
                            >
                                <span className="text-base">{info.emoji}</span>
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex-1 uppercase tracking-wide">{info.label}</span>
                                <div className="flex items-center gap-2">
                                    <div 
                                        className="w-5 h-5 rounded-lg border border-gray-300 dark:border-white/20 shadow-sm"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-[10px] font-bold text-gray-500 min-w-[60px] text-right">
                                        {item.detalle || item.color}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Color strip */}
            <div className="px-4 pb-4">
                <div className="flex gap-1 mt-2">
                    {sortedItems.map((item, idx) => (
                        <div 
                            key={idx}
                            className="flex-1 h-2 rounded-full first:rounded-l-full last:rounded-r-full"
                            style={{ backgroundColor: item.color }}
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

// ─── Componente principal ────────────────────────────────────────────
export default function UniformeManager() {
    const { notify } = useToast();
    
    const [uniformes, setUniformes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingUniforme, setEditingUniforme] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

    // Form state
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [prendas, setPrendas] = useState({});
    const [accesorioCuello, setAccesorioCuello] = useState(null); // 'corbata' | 'monito' | null

    useEffect(() => { loadUniformes(); }, []);

    const loadUniformes = async () => {
        try {
            const res = await api.get('/uniformes');
            setUniformes(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            notify('Error al cargar vestuarios', 'error');
        }
    };

    const resetForm = () => {
        setNombre('');
        setDescripcion('');
        setPrendas({});
        setAccesorioCuello(null);
        setEditingUniforme(null);
    };

    const handleNew = () => {
        resetForm();
        // Inicializar prendas base con valores vacíos
        const initial = {};
        PRENDAS_BASE.forEach(p => {
            initial[p.id] = { activo: p.required, color: '', colorNombre: '' };
        });
        setPrendas(initial);
        setShowForm(true);
    };

    const handleEdit = (uni) => {
        setEditingUniforme(uni);
        setNombre(uni.nombre || '');
        setDescripcion(uni.descripcion || '');
        
        // Rebuild prendas from items
        const prendaState = {};
        PRENDAS_BASE.forEach(p => {
            const item = uni.items?.find(i => i.tipo === p.id);
            prendaState[p.id] = {
                activo: !!item,
                color: item?.color || '',
                colorNombre: item?.detalle || ''
            };
        });
        setPrendas(prendaState);

        // Check accesorio cuello
        const corbata = uni.items?.find(i => i.tipo === 'corbata');
        const monito = uni.items?.find(i => i.tipo === 'monito');
        if (corbata) {
            setAccesorioCuello('corbata');
            prendaState._accColor = corbata.color;
            prendaState._accNombre = corbata.detalle || '';
        } else if (monito) {
            setAccesorioCuello('monito');
            prendaState._accColor = monito.color;
            prendaState._accNombre = monito.detalle || '';
        } else {
            setAccesorioCuello(null);
            prendaState._accColor = '';
            prendaState._accNombre = '';
        }
        setPrendas({...prendaState});
        setShowForm(true);
    };

    const handleDuplicate = (uni) => {
        handleEdit({...uni, id: undefined, nombre: `${uni.nombre} (Copia)`});
        setEditingUniforme(null);
    };

    const handleDelete = (id) => {
        setDeleteConfirm({ open: true, id });
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/uniformes/${deleteConfirm.id}`);
            notify('Traje eliminado', 'success');
            loadUniformes();
        } catch (error) {
            notify('Error al eliminar', 'error');
        }
    };

    const togglePrenda = (id) => {
        setPrendas(prev => ({
            ...prev,
            [id]: { ...prev[id], activo: !prev[id]?.activo }
        }));
    };

    const updatePrendaColor = (id, hex, nombre) => {
        setPrendas(prev => ({
            ...prev,
            [id]: { ...prev[id], color: hex, colorNombre: nombre }
        }));
    };

    const handleSave = async () => {
        if (!nombre.trim()) return notify('El nombre del traje es obligatorio', 'warning');
        
        // Build items array
        const items = [];
        PRENDAS_BASE.forEach(p => {
            if (prendas[p.id]?.activo) {
                if (!prendas[p.id]?.color) return notify(`Falta el color de ${p.label}`, 'warning');
                items.push({
                    tipo: p.id,
                    color: prendas[p.id].color,
                    detalle: prendas[p.id].colorNombre || ''
                });
            }
        });

        // Accesorio de cuello
        if (accesorioCuello) {
            const accColor = prendas._accColor;
            if (!accColor) return notify(`Falta el color del ${accesorioCuello === 'corbata' ? 'Corbata' : 'Moñito'}`, 'warning');
            items.push({
                tipo: accesorioCuello,
                color: accColor,
                detalle: prendas._accNombre || ''
            });
        }

        if (items.length === 0) return notify('Activa al menos una prenda', 'warning');

        setLoading(true);
        try {
            const payload = {
                nombre: nombre.toUpperCase(),
                descripcion,
                items
            };

            if (editingUniforme) {
                await api.put(`/uniformes/${editingUniforme.id}`, payload);
                notify('Traje actualizado ✓', 'success');
            } else {
                await api.post('/uniformes', payload);
                notify('Nuevo traje creado ✓', 'success');
            }
            loadUniformes();
            setShowForm(false);
            resetForm();
        } catch (error) {
            notify('Error al guardar', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-[calc(100vh-80px)] bg-gray-50 dark:bg-surface-base px-4 sm:px-6 py-6">
            {/* ─── Header ─────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 border-b border-gray-200 dark:border-white/5 pb-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 bg-brand-primary/20 rounded-2xl flex items-center justify-center">
                            <Shirt className="w-5 h-5 text-brand-primary" />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                            VESTUARIO
                        </h1>
                    </div>
                    <p className="text-gray-400 dark:text-gray-600 font-bold uppercase tracking-[0.3em] text-[9px] ml-[52px]">
                        Configura los trajes de tu banda
                    </p>
                </div>
                {!showForm && (
                    <Button 
                        onClick={handleNew}
                        className="bg-brand-primary text-white font-black hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20 uppercase tracking-widest text-[10px] rounded-2xl px-6"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Nuevo Traje
                    </Button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {showForm ? (
                    /* ─── FORMULARIO DE EDICIÓN ───────────────────────── */
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="max-w-3xl mx-auto"
                    >
                        {/* Form header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => { setShowForm(false); resetForm(); }}
                                    className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                    {editingUniforme ? 'Editar Traje' : 'Nuevo Traje'}
                                </h2>
                            </div>
                            <Button
                                onClick={handleSave}
                                loading={loading}
                                className="bg-brand-primary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl px-8 shadow-lg shadow-brand-primary/20"
                            >
                                <Save className="w-4 h-4 mr-2" /> {editingUniforme ? 'Guardar' : 'Crear'}
                            </Button>
                        </div>

                        {/* Nombre y descripción */}
                        <div className="bg-white dark:bg-surface-card border border-gray-200 dark:border-white/5 rounded-3xl p-6 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">
                                        Nombre del Traje
                                    </label>
                                    <Input
                                        placeholder="Ej: Traje Formal, Gala, Casual..."
                                        value={nombre}
                                        onChange={e => setNombre(e.target.value)}
                                        className="bg-surface-input border-surface-border h-14 text-sm font-bold rounded-2xl"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">
                                        Descripción (Opcional)
                                    </label>
                                    <Input
                                        placeholder="Para eventos formales, ceremonias..."
                                        value={descripcion}
                                        onChange={e => setDescripcion(e.target.value)}
                                        className="bg-surface-input border-surface-border h-14 text-sm font-bold rounded-2xl"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ─── Prendas ─── */}
                        <div className="bg-white dark:bg-surface-card border border-gray-200 dark:border-white/5 rounded-3xl overflow-hidden mb-6">
                            <div className="p-6 border-b border-gray-100 dark:border-white/5">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                                    Prendas del Traje
                                </p>
                            </div>

                            <div className="divide-y divide-gray-100 dark:divide-white/[0.03]">
                                {PRENDAS_BASE.map((prenda) => {
                                    const isActive = prendas[prenda.id]?.activo;
                                    return (
                                        <div key={prenda.id} className="p-5">
                                            <div className="flex items-center gap-4 mb-3">
                                                <button
                                                    type="button"
                                                    onClick={() => togglePrenda(prenda.id)}
                                                    className={clsx(
                                                        "w-8 h-8 rounded-xl flex items-center justify-center transition-all border",
                                                        isActive 
                                                            ? "bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20" 
                                                            : "bg-gray-100 dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-400 dark:text-gray-600 hover:border-gray-400 dark:hover:border-white/20"
                                                    )}
                                                >
                                                    {isActive ? <Check className="w-4 h-4" /> : null}
                                                </button>
                                                <span className="text-lg">{prenda.emoji}</span>
                                                <div className="flex-1">
                                                    <p className={clsx(
                                                        "text-sm font-black uppercase tracking-tight transition-colors",
                                                        isActive ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-600"
                                                    )}>
                                                        {prenda.label}
                                                    </p>
                                                    {prenda.required && (
                                                        <p className="text-[8px] text-brand-primary font-bold uppercase tracking-widest">Obligatorio</p>
                                                    )}
                                                </div>
                                            </div>

                                            <AnimatePresence>
                                                {isActive && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="ml-12 overflow-hidden"
                                                    >
                                                        <ColorSelector
                                                            value={prendas[prenda.id]?.color}
                                                            colorNombre={prendas[prenda.id]?.colorNombre}
                                                            onChange={(hex, nombre) => updatePrendaColor(prenda.id, hex, nombre)}
                                                        />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ─── Accesorio de Cuello ─── */}
                        <div className="bg-white dark:bg-surface-card border border-gray-200 dark:border-white/5 rounded-3xl overflow-hidden mb-6">
                            <div className="p-6 border-b border-gray-100 dark:border-white/5">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="text-base">🎀</span>
                                    Accesorio de Cuello
                                </p>
                                <p className="text-[9px] text-gray-400 dark:text-gray-600 mt-1 ml-6">Elige entre corbata o moñito (opcional)</p>
                            </div>

                            <div className="p-5">
                                {/* Selector de tipo */}
                                <div className="flex gap-3 mb-4">
                                    {ACCESORIO_CUELLO.map((acc) => (
                                        <button
                                            key={acc.id}
                                            type="button"
                                            onClick={() => setAccesorioCuello(
                                                accesorioCuello === acc.id ? null : acc.id
                                            )}
                                            className={clsx(
                                                "flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl border-2 transition-all font-black text-sm uppercase tracking-tight",
                                                accesorioCuello === acc.id
                                                    ? "border-brand-primary bg-brand-primary/10 text-gray-900 dark:text-white shadow-lg shadow-brand-primary/10"
                                                    : "border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] text-gray-400 dark:text-gray-500 hover:border-gray-300 dark:hover:border-white/15 hover:text-gray-600 dark:hover:text-gray-300"
                                            )}
                                        >
                                            <span className="text-xl">{acc.emoji}</span>
                                            {acc.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Color del accesorio */}
                                <AnimatePresence>
                                    {accesorioCuello && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <ColorSelector
                                                value={prendas._accColor || ''}
                                                colorNombre={prendas._accNombre || ''}
                                                onChange={(hex, nombre) => setPrendas(prev => ({
                                                    ...prev,
                                                    _accColor: hex,
                                                    _accNombre: nombre
                                                }))}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* ─── Preview Rápido ─── */}
                        <div className="bg-white dark:bg-surface-card border border-gray-200 dark:border-white/5 rounded-3xl p-6 mb-6">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                <Eye className="w-3.5 h-3.5 text-brand-primary" />
                                Vista Previa
                            </p>
                            
                            <div className="space-y-2">
                                {PRENDAS_BASE.filter(p => prendas[p.id]?.activo).map(p => (
                                    <div key={p.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.03]">
                                        <span>{p.emoji}</span>
                                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex-1 uppercase">{p.label}</span>
                                        <div 
                                            className="w-6 h-6 rounded-lg border border-gray-300 dark:border-white/20"
                                            style={{ backgroundColor: prendas[p.id]?.color || '#333' }}
                                        />
                                        <span className="text-xs font-bold text-gray-900 dark:text-white min-w-[80px] text-right">
                                            {prendas[p.id]?.colorNombre || '---'}
                                        </span>
                                    </div>
                                ))}
                                {accesorioCuello && (
                                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.03]">
                                        <span>{accesorioCuello === 'corbata' ? '👔' : '🎀'}</span>
                                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex-1 uppercase">
                                            {accesorioCuello === 'corbata' ? 'Corbata' : 'Moñito'}
                                        </span>
                                        <div 
                                            className="w-6 h-6 rounded-lg border border-gray-300 dark:border-white/20"
                                            style={{ backgroundColor: prendas._accColor || '#333' }}
                                        />
                                        <span className="text-xs font-bold text-gray-900 dark:text-white min-w-[80px] text-right">
                                            {prendas._accNombre || '---'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Color strip preview */}
                            <div className="flex gap-1 mt-4">
                                {PRENDAS_BASE.filter(p => prendas[p.id]?.activo).map(p => (
                                    <div 
                                        key={p.id}
                                        className="flex-1 h-3 rounded-full"
                                        style={{ backgroundColor: prendas[p.id]?.color || '#333' }}
                                    />
                                ))}
                                {accesorioCuello && (
                                    <div 
                                        className="flex-1 h-3 rounded-full"
                                        style={{ backgroundColor: prendas._accColor || '#333' }}
                                    />
                                )}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    /* ─── LISTA DE TRAJES ─────────────────────────────── */
                    <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {uniformes.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center justify-center py-24 text-center"
                            >
                                <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-6">
                                    <Shirt className="w-10 h-10 text-gray-400 dark:text-gray-700" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Sin trajes configurados</h3>
                                <p className="text-gray-500 text-sm mb-8 max-w-md">
                                    Crea tu primer traje definiendo cada prenda con su color. Podrás asignar estos trajes a tus eventos.
                                </p>
                                <Button 
                                    onClick={handleNew}
                                    className="bg-brand-primary text-white font-black hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20 uppercase tracking-widest text-[10px] rounded-2xl px-8"
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Crear Primer Traje
                                </Button>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                <AnimatePresence>
                                    {uniformes.map(uni => (
                                        <TrajePreviewCard
                                            key={uni.id}
                                            uniforme={uni}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                            onDuplicate={handleDuplicate}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
            <ConfirmModal
                isOpen={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, id: null })}
                onConfirm={confirmDelete}
                title="Eliminar Traje"
                message="¿Estás seguro de eliminar este traje? Esta acción no se puede deshacer."
                confirmText="Sí, Eliminar"
                cancelText="Cancelar"
                variant="danger"
            />
        </div>
    );
}
