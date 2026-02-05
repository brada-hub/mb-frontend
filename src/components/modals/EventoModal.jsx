import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, Calendar, Clock, MapPin, Navigation, AlignLeft, Hash, Home, Plus, ChevronDown, Activity, Shield, DollarSign, LayoutList } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import MapPicker from '../ui/MapPicker';
import SmartDateInput from '../ui/SmartDateInput';
import api from '../../api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';

export default function EventoModal({ isOpen, onClose, onSuccess, eventoToEdit = null, defaultType = null, defaultDate = null }) {
    const { user } = useAuth();
    const navigate = useNavigate();
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
        remunerado: false,
        monto_sugerido: 0,
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
                remunerado: !!eventoToEdit.remunerado,
                monto_sugerido: eventoToEdit.monto_sugerido || 0,
                requerimientos: eventoToEdit.requerimientos?.map(r => ({
                    id_instrumento: r.id_instrumento,
                    cantidad_necesaria: r.cantidad_necesaria
                })) || []
            });
        } else if (isOpen) {
            setFormData({
                id_tipo_evento: '',
                evento: '',
                fecha: defaultDate || getLocalDateString(),
                hora: '19:00',
                direccion: '',
                latitud: '',
                longitud: '',
                radio: 100,
                minutos_tolerancia: 15,
                minutos_cierre: 60,
                remunerado: false,
                monto_sugerido: 0,
                requerimientos: []
            });
        }
    }, [isOpen, eventoToEdit, defaultDate]);

    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/eventos/tipos');
            setTipos(res.data);
            if (!eventoToEdit && defaultType && res.data.length > 0) {
                const target = res.data.find(t => t.evento.toUpperCase() === defaultType.toUpperCase());
                if (target) {
                    setFormData(prev => {
                        let next = { ...prev, id_tipo_evento: target.id_tipo_evento };
                        if (target.evento === 'ENSAYO') {
                            next.evento = generateEnsayoTitle(prev.fecha);
                            const sala = LUGARES_FRECUENTES[0];
                            if (sala) {
                                next.latitud = sala.lat; next.longitud = sala.lng; next.direccion = sala.direccion; next.radio = sala.radio;
                            }
                        }
                        return next;
                    });
                }
            }
        } catch (error) { console.error(error); }

        try {
            const res = await api.get('/instrumentos');
            const orden = ['PLATILLO', 'TAMBOR', 'BOMBO', 'TROMBÓN', 'CLARINETE', 'BARÍTONO', 'TROMPETA', 'HELICÓN'];
            const ordenados = res.data.sort((a, b) => {
                const indexA = orden.indexOf(a.instrumento.toUpperCase());
                const indexB = orden.indexOf(b.instrumento.toUpperCase());
                return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
            });
            setInstrumentos(ordenados);
        } catch (error) { console.error(error); }

        try {
            const res = await api.get('/miembros');
            const counts = {};
            res.data.forEach(m => { if (m.id_instrumento) counts[m.id_instrumento] = (counts[m.id_instrumento] || 0) + 1; });
            setMiembrosPorInstrumento(counts);
        } catch (error) { console.error(error); }
        setLoading(false);
    };

    const generateEnsayoTitle = (dateString) => {
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
        if (selectedTypeObj) {
            newFormData.minutos_tolerancia = selectedTypeObj.minutos_tolerancia || 15;
            newFormData.minutos_cierre = selectedTypeObj.minutos_cierre || 60;
            if (selectedTypeObj.evento === 'ENSAYO') {
                newFormData.evento = generateEnsayoTitle(formData.fecha);
                const sala = LUGARES_FRECUENTES[0];
                if (sala) {
                    newFormData.latitud = sala.lat; newFormData.longitud = sala.lng; newFormData.direccion = sala.direccion; newFormData.radio = sala.radio;
                }
            }
            const typeName = selectedTypeObj.evento.toUpperCase();
            newFormData.remunerado = (typeName === 'CONTRATO' || typeName === 'SHOW');
        }
        setFormData(newFormData);
    };

    const handleToggleInstrumento = (id_instrumento) => {
        setFormData(prev => {
            const reqs = [...prev.requerimientos];
            const idx = reqs.findIndex(r => r.id_instrumento === id_instrumento);
            if (idx >= 0) reqs.splice(idx, 1);
            else reqs.push({ id_instrumento, cantidad_necesaria: 1 });
            return { ...prev, requerimientos: reqs };
        });
    };

    const handleQuantityChange = (id_instrumento, value) => {
        let cant = parseInt(value) || 0;
        const maxAvailable = miembrosPorInstrumento[id_instrumento] || 0;
        if (cant > maxAvailable) { cant = maxAvailable; notify(`Máximo: ${maxAvailable}`, 'warning'); }
        setFormData(prev => {
            const reqs = [...prev.requerimientos];
            const idx = reqs.findIndex(r => r.id_instrumento === id_instrumento);
            if (idx >= 0) reqs[idx].cantidad_necesaria = cant;
            return { ...prev, requerimientos: reqs };
        });
    };

    const handleCreateNewType = async () => {
        if (!newTypeName.trim()) return;
        setCreatingType(true);
        try {
            const res = await api.post('/eventos/tipos', { 
                evento: newTypeName, minutos_antes_marcar: newTypeMinAntes, horas_despues_sellar: newTypeHrsSellar, minutos_tolerancia: newTypeMinTolerancia, minutos_cierre: newTypeMinCierre
            });
            setTipos(prev => [...prev, res.data]);
            setFormData(prev => ({ ...prev, id_tipo_evento: res.data.id_tipo_evento }));
            setNewTypeName(''); setShowNewTypeForm(false);
            notify('¡Nuevo tipo creado!', 'success');
        } catch (error) { console.error(error); } finally { setCreatingType(false); }
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            const allReqs = instrumentos.map(inst => {
                const available = miembrosPorInstrumento[inst.id_instrumento] || 0;
                return available > 0 ? { id_instrumento: inst.id_instrumento, cantidad_necesaria: available } : null;
            }).filter(Boolean);
            setFormData(prev => ({ ...prev, requerimientos: allReqs }));
        } else setFormData(prev => ({ ...prev, requerimientos: [] }));
    };

    const getRequerimiento = (id_instrumento) => formData.requerimientos?.find(r => r.id_instrumento === id_instrumento);
    const selectedTipo = tipos.find(t => t.id_tipo_evento == formData.id_tipo_evento);
    const showRequerimientos = selectedTipo && selectedTipo.evento !== 'ENSAYO';
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        if (!formData.id_tipo_evento) newErrors.id_tipo_evento = 'Requerido';
        if (!formData.evento.trim()) newErrors.evento = 'Requerido';
        if (!formData.fecha) newErrors.fecha = 'Requerido';
        if (!formData.hora) newErrors.hora = 'Requerido';
        if (!formData.latitud || !formData.longitud) newErrors.ubicacion = 'Requerido';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) { notify('Completar campos', 'error'); return; }
        setLoading(true);
        try {
            if (eventoToEdit) await api.put(`/eventos/${eventoToEdit.id_evento}`, formData);
            else await api.post('/eventos', formData);
            onSuccess(); onClose();
            notify('Guardado exitosamente', 'success');
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const canEdit = user?.role === 'ADMIN' || user?.role === 'DIRECTOR' || !!user?.is_super_admin;
    const isEditing = !!eventoToEdit;

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl max-h-[90vh] bg-surface-card border border-surface-border rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
                <div className="flex-none px-6 py-4 border-b border-surface-border flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                            {!canEdit ? 'DETALLES DEL EVENTO' : isEditing ? 'EDITAR EVENTO' : 'NUEVO EVENTO'}
                        </h2>
                        <p className="text-sm text-gray-500 font-medium">{!canEdit ? 'Información de programación' : 'Programación de actividades'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full text-gray-400 transition-colors"><X className="w-6 h-6" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {!canEdit ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* INFO CARD MINIMALISTA */}
                            <div className={clsx("p-4 rounded-2xl border-l-4 flex items-center justify-between", selectedTipo?.evento === 'CONTRATO' ? "bg-purple-500/10 border-purple-500" : selectedTipo?.evento === 'BANDIN' ? "bg-orange-500/10 border-orange-500" : "bg-indigo-500/10 border-indigo-500")}>
                                <div className="flex items-center gap-3">
                                    <Hash className="w-5 h-5 text-indigo-500" />
                                    <span className="font-black uppercase tracking-widest text-xs">{selectedTipo?.evento || 'EVENTO'}</span>
                                </div>
                                {formData.remunerado && <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-500 uppercase">Remunerado</div>}
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic px-2">{formData.evento}</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-surface-input border border-surface-border p-4 rounded-2xl flex items-center gap-4">
                                    <Calendar className="w-6 h-6 text-indigo-500" />
                                    <div><span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Fecha</span><span className="font-black text-gray-900 dark:text-white">{formData.fecha}</span></div>
                                </div>
                                <div className="bg-surface-input border border-surface-border p-4 rounded-2xl flex items-center gap-4">
                                    <Clock className="w-6 h-6 text-indigo-500" />
                                    <div><span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Hora</span><span className="font-black text-gray-900 dark:text-white">{formData.hora} HS</span></div>
                                </div>
                            </div>
                            <div className="bg-surface-input border border-surface-border p-5 rounded-2xl space-y-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-5 h-5 text-emerald-500" />
                                        <div>
                                            <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Punto de Encuentro</span>
                                            <span className="font-bold text-gray-900 dark:text-white uppercase">{formData.direccion || 'Ubicación de la banda'}</span>
                                        </div>
                                    </div>
                                    
                                    {(formData.latitud && formData.longitud || formData.direccion) && (
                                        <a 
                                            href={formData.latitud && formData.longitud 
                                                ? `https://www.google.com/maps/search/?api=1&query=${formData.latitud},${formData.longitud}`
                                                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.direccion || formData.evento)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-2"
                                        >
                                            <Navigation className="w-3 h-3" />
                                            Como llegar
                                        </a>
                                    )}
                                </div>
                                <div className="h-[200px] rounded-xl overflow-hidden border border-surface-border shadow-inner">
                                    <MapPicker staticView label="Mapa" value={formData.latitud && formData.longitud ? { lat: parseFloat(formData.latitud), lng: parseFloat(formData.longitud) } : null} radius={formData.radio} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* FORMULARIO COMPLETO PARA ADMIN */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Tipo de Evento</label>
                                        <button type="button" onClick={() => setShowNewTypeForm(!showNewTypeForm)} className="text-[10px] font-black text-brand-primary uppercase tracking-widest">
                                            {showNewTypeForm ? 'CANCELAR' : 'AÑADIR TIPO'}
                                        </button>
                                    </div>
                                    <select value={formData.id_tipo_evento} onChange={handleTipoChange} className="w-full p-3 bg-surface-input border border-surface-border rounded-xl font-bold">
                                        <option value="" disabled>Seleccione...</option>
                                        {tipos.map(t => <option key={t.id_tipo_evento} value={t.id_tipo_evento}>{t.evento}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Título</label>
                                    <input value={formData.evento} onChange={(e) => setFormData({...formData, evento: e.target.value.toUpperCase()})} className="w-full p-3 bg-surface-input border border-surface-border rounded-xl font-bold uppercase" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <SmartDateInput label="Fecha" value={formData.fecha} onChange={(val) => {
                                        const currentType = tipos.find(t => t.id_tipo_evento == formData.id_tipo_evento);
                                        setFormData(prev => {
                                            let next = { ...prev, fecha: val };
                                            if (currentType?.evento === 'ENSAYO') next.evento = generateEnsayoTitle(val);
                                            return next;
                                        });
                                    }} />
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2 px-1">Hora</label>
                                        <input type="time" value={formData.hora} onChange={(e) => setFormData({...formData, hora: e.target.value})} className="w-full p-3 bg-surface-input border border-surface-border rounded-xl font-bold" />
                                    </div>
                                </div>
                                <div className="p-4 bg-brand-primary/5 border border-brand-primary/10 rounded-2xl flex justify-between items-center">
                                    <div><span className="block text-xs font-black uppercase tracking-tight">Actividad Remunerada</span><span className="text-[10px] text-gray-500">Aplica pago a músicos</span></div>
                                    <button type="button" onClick={() => setFormData(p => ({...p, remunerado: !p.remunerado}))} className={clsx("w-12 h-6 rounded-full p-1 transition-colors", formData.remunerado ? "bg-emerald-500" : "bg-gray-300")}>
                                        <div className={clsx("w-4 h-4 bg-white rounded-full transition-transform", formData.remunerado ? "translate-x-6" : "translate-x-0")} />
                                    </button>
                                </div>
                                <div className="space-y-4 pt-4 border-t border-surface-border">
                                    <div className="h-[200px] rounded-2xl overflow-hidden border border-surface-border shadow-sm">
                                        <MapPicker value={formData.latitud && formData.longitud ? { lat: parseFloat(formData.latitud), lng: parseFloat(formData.longitud) } : null} radius={formData.radio} onChange={(c) => setFormData(p => ({...p, latitud: c.lat, longitud: c.lng}))} />
                                    </div>
                                    <Input placeholder="Dirección / Referencia" value={formData.direccion} onChange={(e) => setFormData({...formData, direccion: e.target.value.toUpperCase()})} className="uppercase" />
                                </div>
                                {showRequerimientos && (
                                    <div className="pt-4 border-t border-surface-border space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Personal Requerido</span>
                                            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" onChange={(e) => handleSelectAll(e.target.checked)} className="w-4 h-4" /><span className="text-xs font-bold uppercase">Full Casa</span></label>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {instrumentos.map(inst => (
                                                <div key={inst.id_instrumento} className={clsx("p-2 rounded-xl border flex items-center justify-between transition-colors", getRequerimiento(inst.id_instrumento) ? "bg-brand-primary/10 border-brand-primary/30" : "bg-surface-input border-surface-border")}>
                                                    <div className="flex items-center gap-2">
                                                        <input type="checkbox" checked={!!getRequerimiento(inst.id_instrumento)} onChange={() => handleToggleInstrumento(inst.id_instrumento)} className="w-4 h-4" />
                                                        <span className="text-[10px] font-bold uppercase">{inst.instrumento}</span>
                                                    </div>
                                                    {getRequerimiento(inst.id_instrumento) && <input type="number" min="1" value={getRequerimiento(inst.id_instrumento).cantidad_necesaria} onChange={(e) => handleQuantityChange(inst.id_instrumento, e.target.value)} className="w-10 text-center text-xs font-bold bg-white dark:bg-black/20 rounded-md py-0.5" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </form>
                    )}
                </div>

                <div className="flex-none p-4 border-t border-surface-border bg-surface-card flex justify-between gap-3 rounded-b-3xl">
                    <div className="flex gap-2">
                        {isEditing && (
                            <Button variant="secondary" type="button" className="h-10 px-4 text-[10px] font-black uppercase tracking-widest" onClick={() => navigate(`/dashboard/eventos/${eventoToEdit.id_evento}/convocatoria`)}>
                                <LayoutList className="w-4 h-4 mr-2" />Ver Convocatoria
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={onClose} className="h-10 px-6 text-[10px] font-black">{!canEdit ? 'CERRAR' : 'CANCELAR'}</Button>
                        {canEdit && <Button variant="monster" onClick={handleSubmit} loading={loading} className="h-10 px-6 text-[10px] font-black uppercase">{isEditing ? 'GUARDAR' : 'AGENDAR'}</Button>}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}