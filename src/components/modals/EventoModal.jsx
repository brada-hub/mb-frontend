import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Clock, MapPin, Navigation, Radio, AlignLeft, Hash, Home, Users, Plus, Minus, ChevronDown, Activity, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import MapPicker from '../ui/MapPicker';
import SmartDateInput from '../ui/SmartDateInput';
import api from '../../api';
import { useToast } from '../../context/ToastContext';

export default function EventoModal({ isOpen, onClose, onSuccess, eventoToEdit = null, defaultType = null }) {
    const { notify } = useToast();
    const [loading, setLoading] = useState(false);
    const [tipos, setTipos] = useState([]);
    const [instrumentos, setInstrumentos] = useState([]);
    const [miembrosPorInstrumento, setMiembrosPorInstrumento] = useState({});
    
    // Quick Add Type State
    const [showNewTypeForm, setShowNewTypeForm] = useState(false);
    const [newTypeName, setNewTypeName] = useState('');
    const [newTypeMinAntes, setNewTypeMinAntes] = useState(15);
    const [newTypeHrsSellar, setNewTypeHrsSellar] = useState(24);
    const [newTypeMinTolerancia, setNewTypeMinTolerancia] = useState(15);
    const [newTypeMinCierre, setNewTypeMinCierre] = useState(60);
    const [creatingType, setCreatingType] = useState(false);
    
    // CONSTANTES DE LUGARES
    const LUGARES_FRECUENTES = [
        { 
            nombre: 'Sala de Ensayo Principal', 
            icon: Home,
            lat: -17.411808, 
            lng: -66.158669, 
            radio: 50,
            direccion: 'Ubicación Predeterminada de Ensayo' 
        }
    ];

    // Helper para obtener fecha local en formato YYYY-MM-DD
    const getLocalDateString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const calculateTimeWithOffset = (baseTime, offsetMinutes) => {
        if (!baseTime || offsetMinutes === undefined) return '--:--';
        const [hours, minutes] = baseTime.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes + offsetMinutes, 0);
        return date.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    // Form State
    const [formData, setFormData] = useState({
        id_tipo_evento: '',
        evento: '',
        fecha: getLocalDateString(),
        hora: '19:00',
        direccion: '',
        latitud: '',
        longitud: '',
        radio: 100,
        minutos_tolerancia: 15,
        minutos_cierre: 60,
        requerimientos: []
    });

    const handleSetLugar = (lugar) => {
        setFormData(prev => ({
            ...prev,
            latitud: lugar.lat,
            longitud: lugar.lng,
            direccion: lugar.direccion,
            radio: lugar.radio
        }));
        notify(`Ubicación establecida: ${lugar.nombre}`, 'success');
    };

    // ✅ Cargar datos automáticamente cuando el modal se abre
    useEffect(() => {
        if (isOpen && eventoToEdit) {
            console.log("✏️ Editando evento:", eventoToEdit);
            setFormData({
                id_tipo_evento: eventoToEdit.id_tipo_evento || '',
                evento: eventoToEdit.evento || '',
                fecha: eventoToEdit.fecha || getLocalDateString(),
                hora: eventoToEdit.hora ? eventoToEdit.hora.substring(0, 5) : '19:00',
                direccion: eventoToEdit.direccion || '',
                latitud: eventoToEdit.latitud || '',
                longitud: eventoToEdit.longitud || '',
                radio: eventoToEdit.radio || 100,
                minutos_tolerancia: eventoToEdit.minutos_tolerancia ?? (eventoToEdit.tipo?.minutos_tolerancia || 15),
                minutos_cierre: eventoToEdit.minutos_cierre ?? (eventoToEdit.tipo?.minutos_cierre || 60),
                // Mapear solo los campos necesarios para evitar basura en el state
                requerimientos: eventoToEdit.requerimientos?.map(r => ({
                    id_instrumento: r.id_instrumento,
                    cantidad_necesaria: r.cantidad_necesaria
                })) || []
            });
        } else if (isOpen) {
            // Reset para nuevo evento
            setFormData({
                id_tipo_evento: '',
                evento: '',
                fecha: getLocalDateString(),
                hora: '19:00',
                direccion: '',
                latitud: '',
                longitud: '',
                radio: 100,
                minutos_tolerancia: 15,
                minutos_cierre: 60,
                requerimientos: []
            });
        }
    }, [isOpen, eventoToEdit]);

    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    const loadData = async () => {
        setLoading(true);
        // Cargar Tipos
        try {
            const res = await api.get('/eventos/tipos');
            setTipos(res.data);
            
            // Si es un evento nuevo y tenemos un defaultType, lo pre-seleccionamos
            if (!eventoToEdit && defaultType && res.data.length > 0) {
                const target = res.data.find(t => t.evento.toUpperCase() === defaultType.toUpperCase());
                if (target) {
                    setFormData(prev => {
                        let next = { ...prev, id_tipo_evento: target.id_tipo_evento };
                        
                        // Si es ensayo, disparar lógica de auto-relleno inmediatamente
                        if (target.evento === 'ENSAYO') {
                            next.evento = generateEnsayoTitle(prev.fecha);
                            const sala = LUGARES_FRECUENTES[0];
                            if (sala) {
                                next.latitud = sala.lat;
                                next.longitud = sala.lng;
                                next.direccion = sala.direccion;
                                next.radio = sala.radio;
                            }
                        }
                        return next;
                    });
                }
            }
        } catch (error) {
            console.error(error);
            notify('Error al cargar tipos de evento', 'error');
        }

        // Cargar Instrumentos
        try {
            const res = await api.get('/instrumentos');
            
            // Orden personalizado
            const orden = ['PLATILLO', 'TAMBOR', 'BOMBO', 'TROMBÓN', 'CLARINETE', 'BARÍTONO', 'TROMPETA', 'HELICÓN'];
            
            const ordenados = res.data.sort((a, b) => {
                const indexA = orden.indexOf(a.instrumento.toUpperCase());
                const indexB = orden.indexOf(b.instrumento.toUpperCase());
                
                // Si no está en la lista, lo manda al final
                const valA = indexA === -1 ? 999 : indexA;
                const valB = indexB === -1 ? 999 : indexB;
                
                return valA - valB;
            });

            setInstrumentos(ordenados);
        } catch (error) {
            console.error(error);
            // Fallback
            try {
                const res = await api.get('/catalogos/instrumentos');
                setInstrumentos(res.data);
            } catch (e) {
                // ignore
            }
        }

        // Cargar Miembros
        try {
            const res = await api.get('/miembros');
            console.log("✅ Miembros cargados:", res.data.length);
            const counts = {};
            res.data.forEach(m => {
                if (m.id_instrumento) {
                    counts[m.id_instrumento] = (counts[m.id_instrumento] || 0) + 1;
                }
            });
            setMiembrosPorInstrumento(counts);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    // 🧠 Lógica inteligente para títulos de ENSAYO
    const generateEnsayoTitle = (dateString) => {
        // Asegurar que la fecha se interprete correctamente en la zona local, evitando el desfase UTC
        // Creamos la fecha a las 12 del mediodía para evitar cualquier borde de cambio de día
        const dt = new Date(dateString + 'T12:00:00');
        
        const dayName = dt.toLocaleDateString('es-BO', { weekday: 'long' }).toUpperCase();
        const dayNum = dt.getDate().toString().padStart(2, '0');
        const monthName = dt.toLocaleDateString('es-BO', { month: 'long' }).toUpperCase();
        return `ENSAYO ${dayName} ${dayNum} ${monthName}`;
    };

    const handleTipoChange = (e) => {
        const typeId = e.target.value;
        const selectedTypeObj = tipos.find(t => t.id_tipo_evento == typeId);
        
        let newFormData = { ...formData, id_tipo_evento: typeId };
        
        // AUTO-RELLENO MAGICO PARA ENSAYOS
        if (selectedTypeObj) {
            newFormData.minutos_tolerancia = selectedTypeObj.minutos_tolerancia || 15;
            newFormData.minutos_cierre = selectedTypeObj.minutos_cierre || 60;

            if (selectedTypeObj.evento === 'ENSAYO') {
                // 1. Título automático
                newFormData.evento = generateEnsayoTitle(formData.fecha);
                
                // 2. Ubicación automática (Sala Principal)
                const sala = LUGARES_FRECUENTES[0];
                if (sala) {
                    newFormData.latitud = sala.lat;
                    newFormData.longitud = sala.lng;
                    newFormData.direccion = sala.direccion;
                    newFormData.radio = sala.radio;
                }
                notify('Configuración de ensayo autocompletada 🪄', 'success');
            }
        }

        setFormData(newFormData);
        if (errors.id_tipo_evento) setErrors({...errors, id_tipo_evento: null});
    };

    // Actualizar título si cambia la fecha Y es un ensayo
    const handleFechaChange = (e) => {
        const newDate = e.target.value;
        const currentType = tipos.find(t => t.id_tipo_evento == formData.id_tipo_evento);
        
        setFormData(prev => {
            let nextData = { ...prev, fecha: newDate };
            // Si es ensayo, regenerar título con la nueva fecha
            if (currentType && currentType.evento === 'ENSAYO') {
                nextData.evento = generateEnsayoTitle(newDate);
            }
            return nextData;
        });
        
        if (errors.fecha) setErrors({...errors, fecha: null});
    };

    const handleToggleInstrumento = (id_instrumento) => {
        setFormData(prev => {
            const reqs = [...prev.requerimientos];
            const idx = reqs.findIndex(r => r.id_instrumento === id_instrumento);
            
            if (idx >= 0) {
                // Remove
                reqs.splice(idx, 1);
            } else {
                // Add with 0 or 1? User asked to enable input. Let's start with 1 or 0? 
                // "si le das un check... habilite un campo para poner que cantidad" -> start with 0 or empty?
                // Let's start with 0 to force user input, or 1 as default.
                reqs.push({ id_instrumento, cantidad_necesaria: 1 });
            }
            return { ...prev, requerimientos: reqs };
        });
    };

    const handleQuantityChange = (id_instrumento, value) => {
        let cant = parseInt(value) || 0;
        const maxAvailable = miembrosPorInstrumento[id_instrumento] || 0;

        if (cant > maxAvailable) {
            cant = maxAvailable;
            notify(`Máximo disponible para este instrumento: ${maxAvailable}`, 'warning');
        }

        setFormData(prev => {
            const reqs = [...prev.requerimientos];
            const idx = reqs.findIndex(r => r.id_instrumento === id_instrumento);
            if (idx >= 0) {
                reqs[idx].cantidad_necesaria = cant;
            }
            return { ...prev, requerimientos: reqs };
        });
    };

    const handleCreateNewType = async () => {
        if (!newTypeName.trim()) return;
        setCreatingType(true);
        try {
            const res = await api.post('/eventos/tipos', { 
                evento: newTypeName,
                minutos_antes_marcar: newTypeMinAntes,
                horas_despues_sellar: newTypeHrsSellar,
                minutos_tolerancia: newTypeMinTolerancia,
                minutos_cierre: newTypeMinCierre
            });
            setTipos(prev => [...prev, res.data]);
            setFormData(prev => ({ ...prev, id_tipo_evento: res.data.id_tipo_evento }));
            setNewTypeName('');
            setShowNewTypeForm(false);
            notify('¡Nuevo tipo de evento creado!', 'success');
        } catch (error) {
            console.error(error);
            notify(error.response?.data?.message || 'Error al crear tipo', 'error');
        } finally {
            setCreatingType(false);
        }
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            // Seleccionar SOLO los instrumentos que tengan miembros disponibles
            const allReqs = instrumentos.map(inst => {
                const available = miembrosPorInstrumento[inst.id_instrumento] || 0;
                if (available > 0) {
                    return {
                        id_instrumento: inst.id_instrumento,
                        cantidad_necesaria: available
                    };
                }
                return null;
            }).filter(Boolean); // Eliminar nulos (los que tienen 0 disponibles)
            
            setFormData(prev => ({ ...prev, requerimientos: allReqs }));
        } else {
            setFormData(prev => ({ ...prev, requerimientos: [] }));
        }
    };

    const getRequerimiento = (id_instrumento) => {
        return formData.requerimientos?.find(r => r.id_instrumento === id_instrumento);
    };

    const selectedTipo = tipos.find(t => t.id_tipo_evento == formData.id_tipo_evento);
    const showRequerimientos = selectedTipo && selectedTipo.evento !== 'ENSAYO';

    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        if (!formData.id_tipo_evento) newErrors.id_tipo_evento = 'El tipo de evento es requerido';
        if (!formData.evento.trim()) newErrors.evento = 'El título del evento es requerido';
        if (!formData.fecha) newErrors.fecha = 'La fecha es requerida';
        if (!formData.hora) newErrors.hora = 'La hora es requerida';
        if (!formData.latitud || !formData.longitud) newErrors.ubicacion = 'Debes seleccionar una ubicación en el mapa';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const scrollToError = () => {
        const firstError = document.querySelector('.has-error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            notify('Por favor completa los campos obligatorios', 'error');
            setTimeout(scrollToError, 100);
            return;
        }

        setLoading(true);

        try {
            if (eventoToEdit) {
                await api.put(`/eventos/${eventoToEdit.id_evento}`, formData);
                notify('Evento actualizado exitosamente', 'success');
            } else {
                await api.post('/eventos', formData);
                notify('Evento creado exitosamente', 'success');
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Error al guardar el evento';
            notify(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl max-h-[90vh] bg-surface-card border border-white/10 rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex-none px-6 py-4 border-b border-white/5 flex justify-between items-center bg-surface-card rounded-t-3xl">
                    <div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">
                            {eventoToEdit ? 'EDITAR EVENTO' : 'NUEVO EVENTO'}
                        </h2>
                        <p className="text-sm text-gray-400 font-medium">Programación de actividades</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Formulario con Scroll */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="space-y-8">
                        
                        {/* 1. DATOS PRINCIPALES */}
                        <div className="space-y-6">
                            {/* Tipo de Evento */}
                            <div className={`space-y-2 ${errors.id_tipo_evento ? 'has-error' : ''}`}>
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Tipo de Evento <span className="text-red-500">*</span>
                                    </label>
                                    <button 
                                        type="button"
                                        onClick={() => setShowNewTypeForm(!showNewTypeForm)}
                                        className="text-[10px] font-black text-brand-primary hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1"
                                    >
                                        {showNewTypeForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                        {showNewTypeForm ? 'CANCELAR' : 'AÑADIR OTRO TIPO'}
                                    </button>
                                </div>

                                {showNewTypeForm ? (
                                    <div className="space-y-3 p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-2xl animate-in slide-in-from-top-2 duration-300">
                                        <div className="relative">
                                            <Hash className="absolute left-4 top-3.5 w-5 h-5 text-brand-primary" />
                                            <input 
                                                autoFocus
                                                value={newTypeName}
                                                onChange={(e) => setNewTypeName(e.target.value.toUpperCase())}
                                                placeholder="NOMBRE DEL TIPO (EJ: BAUTIZO)"
                                                className="w-full pl-12 pr-4 py-3 bg-black/20 border border-brand-primary/30 rounded-xl text-white font-bold outline-none placeholder:text-brand-primary/30 text-sm"
                                            />
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-brand-primary uppercase ml-1">Abrir (Min previos)</label>
                                                <div className="relative">
                                                    <Clock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-brand-primary/50" />
                                                    <input 
                                                        type="number"
                                                        value={newTypeMinAntes}
                                                        onChange={(e) => setNewTypeMinAntes(parseInt(e.target.value) || 0)}
                                                        className="w-full pl-9 pr-3 py-2 bg-black/20 border border-brand-primary/20 rounded-lg text-white font-bold outline-none text-xs"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-brand-primary uppercase ml-1">Cierre Automático (Min)</label>
                                                <div className="relative">
                                                    <X className="absolute left-3 top-2.5 w-3.5 h-3.5 text-brand-primary/50" />
                                                    <input 
                                                        type="number"
                                                        value={newTypeMinCierre}
                                                        onChange={(e) => setNewTypeMinCierre(parseInt(e.target.value) || 0)}
                                                        className="w-full pl-9 pr-3 py-2 bg-black/20 border border-brand-primary/20 rounded-lg text-white font-bold outline-none text-xs"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-brand-primary uppercase ml-1">Tolerancia (Min)</label>
                                                <div className="relative">
                                                    <Shield className="absolute left-3 top-2.5 w-3.5 h-3.5 text-brand-primary/50" />
                                                    <input 
                                                        type="number"
                                                        value={newTypeMinTolerancia}
                                                        onChange={(e) => setNewTypeMinTolerancia(parseInt(e.target.value) || 0)}
                                                        className="w-full pl-9 pr-3 py-2 bg-black/20 border border-brand-primary/20 rounded-lg text-white font-bold outline-none text-xs"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-brand-primary uppercase ml-1">Sellar Auditoría (Hrs)</label>
                                                <div className="relative">
                                                    <Activity className="absolute left-3 top-2.5 w-3.5 h-3.5 text-brand-primary/50" />
                                                    <input 
                                                        type="number"
                                                        value={newTypeHrsSellar}
                                                        onChange={(e) => setNewTypeHrsSellar(parseInt(e.target.value) || 0)}
                                                        className="w-full pl-9 pr-3 py-2 bg-black/20 border border-brand-primary/20 rounded-lg text-white font-bold outline-none text-xs"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button 
                                                type="button"
                                                variant="ghost"
                                                onClick={() => setShowNewTypeForm(false)}
                                                className="flex-1 h-10 text-[10px] font-black"
                                            >
                                                CANCELAR
                                            </Button>
                                            <Button 
                                                type="button"
                                                onClick={handleCreateNewType}
                                                loading={creatingType}
                                                className="flex-[2] h-10 bg-brand-primary text-[10px] font-black"
                                            >
                                                GUARDAR TIPO 🪄
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative group">
                                        <Hash className={`absolute left-4 top-3.5 w-5 h-5 z-10 ${errors.id_tipo_evento ? 'text-red-500' : 'text-gray-500'}`} />
                                        <select 
                                            value={formData.id_tipo_evento}
                                            onChange={handleTipoChange}
                                            className={`w-full pl-12 pr-10 py-3 bg-surface-input border rounded-xl text-white font-bold outline-none appearance-none cursor-pointer transition-all ${
                                                errors.id_tipo_evento ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 focus:border-brand-primary hover:border-white/20'
                                            }`}
                                        >
                                            <option value="" disabled>SELECCIONE UN TIPO...</option>
                                            {tipos.map(t => (
                                                <option key={t.id_tipo_evento} value={t.id_tipo_evento}>{t.evento}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-4 pointer-events-none text-gray-500 group-hover:text-white transition-colors">
                                            <ChevronDown className="w-4 h-4" />
                                        </div>
                                    </div>
                                )}
                                {errors.id_tipo_evento && <p className="text-xs text-red-500 font-bold ml-1">{errors.id_tipo_evento}</p>}
                            </div>

                            {/* Título */}
                            <div className={`space-y-2 ${errors.evento ? 'has-error' : ''}`}>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                                    Título <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <AlignLeft className={`absolute left-4 top-3.5 w-5 h-5 z-10 ${errors.evento ? 'text-red-500' : 'text-gray-500'}`} />
                                    <input 
                                        value={formData.evento}
                                        onChange={(e) => {
                                            setFormData({...formData, evento: e.target.value.toUpperCase()});
                                            if (errors.evento) setErrors({...errors, evento: null});
                                        }}
                                        className={`w-full pl-12 pr-4 py-3 bg-surface-input border rounded-xl text-white font-bold outline-none uppercase ${
                                            errors.evento ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 focus:border-brand-primary'
                                        }`}
                                    />
                                </div>
                                {errors.evento && <p className="text-xs text-red-500 font-bold ml-1">{errors.evento}</p>}
                            </div>

                            {/* Fecha y Hora */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <SmartDateInput 
                                        label="Fecha"
                                        value={formData.fecha}
                                        onChange={(val) => {
                                            const currentType = tipos.find(t => t.id_tipo_evento == formData.id_tipo_evento);
                                            setFormData(prev => {
                                                let nextData = { ...prev, fecha: val };
                                                if (currentType && currentType.evento === 'ENSAYO') {
                                                    nextData.evento = generateEnsayoTitle(val);
                                                }
                                                return nextData;
                                            });
                                            if (errors.fecha) setErrors({...errors, fecha: null});
                                        }}
                                        min={getLocalDateString()}
                                        error={errors.fecha}
                                    />
                                </div>
                                <div className={`space-y-2 ${errors.hora ? 'has-error' : ''}`}>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Hora</label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                                        <input 
                                            type="time"
                                            value={formData.hora}
                                            onChange={(e) => setFormData({...formData, hora: e.target.value})}
                                            className="w-full pl-12 pr-4 py-3 bg-surface-input border border-white/10 rounded-xl text-white font-bold outline-none focus:border-brand-primary"
                                        />
                                    </div>
                                    {errors.hora && <p className="text-xs text-red-500 font-bold ml-1">{errors.hora}</p>}
                                </div>
                            </div>

                            {/* Configuración de Asistencia */}
                            <div className="pt-4 border-t border-white/5 space-y-4">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-brand-primary" />
                                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Reglas de Asistencia</h4>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Tolerancia</label>
                                            <span className="text-[10px] font-black text-brand-primary">+{formData.minutos_tolerancia} MIN</span>
                                        </div>
                                        <div className="relative">
                                            <Shield className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                                            <input 
                                                type="number"
                                                value={formData.minutos_tolerancia}
                                                onChange={(e) => setFormData({...formData, minutos_tolerancia: parseInt(e.target.value) || 0})}
                                                className="w-full pl-12 pr-4 py-3 bg-surface-input border border-white/10 rounded-xl text-white font-bold outline-none focus:border-brand-primary"
                                                placeholder="Minutos"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Tiempo Límite</label>
                                            <span className="text-[10px] font-black text-red-400">CIERRE: {calculateTimeWithOffset(formData.hora, formData.minutos_cierre)}</span>
                                        </div>
                                        <div className="relative">
                                            <X className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                                            <input 
                                                type="number"
                                                value={formData.minutos_cierre}
                                                onChange={(e) => setFormData({...formData, minutos_cierre: parseInt(e.target.value) || 0})}
                                                className="w-full pl-12 pr-4 py-3 bg-surface-input border border-white/10 rounded-xl text-white font-bold outline-none focus:border-brand-primary"
                                                placeholder="Minutos"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[9px] text-gray-500 font-medium italic px-1">
                                    * Los músicos podran marcar asistencia hasta las {calculateTimeWithOffset(formData.hora, formData.minutos_cierre)}. Después de esa hora, se considerarán FALTA automáticamente.
                                </p>
                            </div>
                        </div>

                        {/* 2. REQUERIMIENTOS (Condicional) */}
                        {showRequerimientos && (
                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Requerimientos</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="checkbox" 
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-600 text-brand-primary bg-surface-input cursor-pointer"
                                            id="selectAll"
                                        />
                                        <label htmlFor="selectAll" className="text-xs font-bold text-white cursor-pointer select-none">
                                            Seleccionar Todo (Full Casa)
                                        </label>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {instrumentos.map(inst => {
                                        const req = getRequerimiento(inst.id_instrumento);
                                        const isChecked = !!req;
                                        const cantidad = req ? req.cantidad_necesaria : '';
                                        const maxAvailable = miembrosPorInstrumento[inst.id_instrumento] || 0;

                                        return (
                                            <div key={inst.id_instrumento} 
                                                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                                                    isChecked ? 'bg-brand-primary/10 border-brand-primary/30' : 'bg-surface-input border-white/5'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <input 
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => handleToggleInstrumento(inst.id_instrumento)}
                                                        className="w-5 h-5 rounded border-gray-600 text-brand-primary bg-surface-input cursor-pointer"
                                                    />
                                                    <div>
                                                        <span className={`text-sm font-bold block ${isChecked ? 'text-white' : 'text-gray-400'}`}>
                                                            {inst.instrumento}
                                                        </span>
                                                        <span className="text-[10px] text-gray-500">Disponible: {maxAvailable}</span>
                                                    </div>
                                                </div>
                                                {isChecked && (
                                                    <input 
                                                        type="number"
                                                        min="1"
                                                        max={maxAvailable}
                                                        value={cantidad}
                                                        onChange={(e) => handleQuantityChange(inst.id_instrumento, e.target.value)}
                                                        className="w-16 py-1 px-2 bg-black/20 border border-white/10 rounded-lg text-center text-sm font-bold text-white outline-none"
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 3. UBICACIÓN (Mapa) */}
                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ubicación</label>
                                {LUGARES_FRECUENTES.length > 0 && (
                                    <button 
                                        type="button"
                                        onClick={() => handleSetLugar(LUGARES_FRECUENTES[0])}
                                        className="text-xs flex items-center gap-1 text-brand-primary hover:text-brand-light transition-colors font-bold px-3 py-1 bg-brand-primary/10 rounded-lg"
                                    >
                                        <Home className="w-3 h-3" />
                                        {LUGARES_FRECUENTES[0].nombre}
                                    </button>
                                )}
                            </div>

                            <div className={`h-[250px] w-full rounded-2xl overflow-hidden border relative ${errors.ubicacion ? 'border-red-500' : 'border-white/10'}`}>
                                <MapPicker 
                                    label="Mapa"
                                    value={formData.latitud && formData.longitud ? { lat: parseFloat(formData.latitud), lng: parseFloat(formData.longitud) } : null}
                                    radius={formData.radio}
                                    onChange={(coords) => {
                                        setFormData(prev => ({ ...prev, latitud: coords.lat, longitud: coords.lng }));
                                        if (errors.ubicacion) setErrors({...errors, ubicacion: null});
                                    }}
                                />
                                {errors.ubicacion && (
                                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-lg z-[1000]">
                                        {errors.ubicacion}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                                    <Input 
                                        placeholder="Dirección / Referencia"
                                        value={formData.direccion}
                                        onChange={(e) => setFormData({...formData, direccion: e.target.value.toUpperCase()})}
                                        className="pl-12 uppercase"
                                    />
                                </div>
                                <div className="space-y-2 px-3 py-2 bg-surface-input rounded-xl border border-white/5">
                                    <div className="flex justify-between">
                                        <span className="text-xs font-bold text-gray-400">RADIO</span>
                                        <span className="text-xs font-bold text-brand-primary">{formData.radio}m</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="10" 
                                        max="500" 
                                        step="10" 
                                        value={formData.radio} 
                                        onChange={(e) => setFormData({...formData, radio: parseInt(e.target.value)})}
                                        className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                                    />
                                </div>
                            </div>
                        </div>

                    </div>
                </form>

                {/* Footer */}
                <div className="flex-none p-4 border-t border-white/5 bg-surface-card/50 flex justify-end gap-3 rounded-b-3xl">
                    <Button variant="ghost" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button variant="monster" onClick={handleSubmit} loading={loading}>
                        {eventoToEdit ? 'Guardar Cambios' : 'Agendar Evento'}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
}