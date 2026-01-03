import { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Navigation, Radio, AlignLeft, Hash, Home } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import MapPicker from '../ui/MapPicker';
import api from '../../api';
import { useToast } from '../../context/ToastContext';

export default function EventoModal({ isOpen, onClose, onSuccess, eventoToEdit = null }) {
    const { notify } = useToast();
    const [loading, setLoading] = useState(false);
    const [tipos, setTipos] = useState([]);
    
    // CONSTANTES DE LUGARES (Puedes agregar más aquí)
    const LUGARES_FRECUENTES = [
        { 
            nombre: 'Sala de Ensayo Principal', 
            icon: Home,
            lat: -17.393835, 
            lng: -66.156946, 
            radio: 50,
            direccion: 'Ubicación Predeterminada de Ensayo' 
        }
    ];

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
    
    // Form State
    const [formData, setFormData] = useState({
        id_tipo_evento: '',
        evento: '',
        fecha: new Date().toISOString().split('T')[0],
        hora: '19:00',
        direccion: '',
        latitud: '',
        longitud: '',
        radio: 100
    });

    useEffect(() => {
        if (isOpen) {
            loadTipos();
            if (eventoToEdit) {
                setFormData({
                    id_tipo_evento: eventoToEdit.id_tipo_evento,
                    evento: eventoToEdit.evento,
                    fecha: eventoToEdit.fecha,
                    hora: eventoToEdit.hora,
                    direccion: eventoToEdit.direccion || '',
                    latitud: eventoToEdit.latitud || '',
                    longitud: eventoToEdit.longitud || '',
                    radio: eventoToEdit.radio || 100
                });
            } else {
                // Reset for new entry
                setFormData({
                    id_tipo_evento: '',
                    evento: '',
                    fecha: new Date().toISOString().split('T')[0],
                    hora: '19:00',
                    direccion: '',
                    latitud: '',
                    longitud: '',
                    radio: 100
                });
            }
        }
    }, [isOpen, eventoToEdit]);

    const loadTipos = async () => {
        try {
            const res = await api.get('/eventos/tipos');
            setTipos(res.data);
            
            // Auto select first type if new
            if (res.data.length > 0 && !eventoToEdit) {
                setFormData(prev => ({...prev, id_tipo_evento: res.data[0].id_tipo_evento}));
            }
        } catch (error) {
            notify('Error al cargar tipos de eventos', 'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-surface-card border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-8 py-6 border-b border-white/5 bg-surface-card/50 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-white italic tracking-tighter">
                            {eventoToEdit ? 'EDITAR EVENTO' : 'NUEVO EVENTO'}
                        </h2>
                        <p className="text-sm text-gray-400 font-medium">Programación de actividades</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    
                    {/* SECCIÓN 1: DETALLES BÁSICOS (Simplificado a columna única para asegurar visibilidad) */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Tipo de Evento</label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                                <select 
                                    value={formData.id_tipo_evento}
                                    onChange={(e) => setFormData({...formData, id_tipo_evento: e.target.value})}
                                    className="w-full pl-12 pr-4 py-3 bg-surface-input border border-white/10 rounded-xl text-white font-bold outline-none focus:border-brand-primary appearance-none cursor-pointer hover:border-white/20 transition-colors"
                                    required
                                >
                                    <option value="" disabled>Seleccione un tipo de evento...</option>
                                    {tipos.map(t => (
                                        <option key={t.id_tipo_evento} value={t.id_tipo_evento}>{t.evento}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Título del Evento</label>
                            <Input 
                                icon={AlignLeft}
                                placeholder="Ej: Ensayo General, Cumpleaños..."
                                value={formData.evento}
                                onChange={(e) => setFormData({...formData, evento: e.target.value})}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Fecha</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                                    <input 
                                        type="date"
                                        value={formData.fecha}
                                        onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                                        className="w-full pl-12 pr-4 py-3 bg-surface-input border border-white/10 rounded-xl text-white font-bold outline-none focus:border-brand-primary min-h-[48px]"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Hora</label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                                    <input 
                                        type="time"
                                        value={formData.hora}
                                        onChange={(e) => setFormData({...formData, hora: e.target.value})}
                                        className="w-full pl-12 pr-4 py-3 bg-surface-input border border-white/10 rounded-xl text-white font-bold outline-none focus:border-brand-primary min-h-[48px]"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-white/10 my-6"></div>

                    {/* SECCIÓN 2: UBICACIÓN */}
                    <div className="p-1 bg-brand-secondary/5 border border-brand-secondary/10 rounded-2xl space-y-4">
                        
                        {/* BOTONES DE LUGARES RÁPIDOS */}
                        <div className="px-4 pt-4 flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                            {LUGARES_FRECUENTES.map((lugar, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleSetLugar(lugar)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/20 rounded-lg text-xs font-bold text-brand-primary transition-all whitespace-nowrap active:scale-95"
                                >
                                    <lugar.icon className="w-3.5 h-3.5" />
                                    {lugar.nombre}
                                </button>
                            ))}
                        </div>

                        <MapPicker 
                            label="Ubicación del Evento"
                            value={formData.latitud && formData.longitud ? { lat: parseFloat(formData.latitud), lng: parseFloat(formData.longitud) } : null}
                            radius={formData.radio}
                            onChange={(coords) => {
                                setFormData(prev => ({
                                    ...prev,
                                    latitud: coords.lat,
                                    longitud: coords.lng
                                }));
                            }}
                        />

                        <div className="px-4 pb-4 space-y-4">
                            <Input 
                                placeholder="Dirección descriptiva (opcional)"
                                value={formData.direccion}
                                onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                                icon={MapPin}
                            />

                            <div className="space-y-2 pt-2">
                                <div className="flex justify-between">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Radio de Asistencia</label>
                                    <span className="text-xs font-bold text-brand-primary">{formData.radio}m</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Radio className="w-5 h-5 text-gray-500" />
                                    <input 
                                        type="range" 
                                        min="10" 
                                        max="500" 
                                        step="10"
                                        value={formData.radio}
                                        onChange={(e) => setFormData({...formData, radio: parseInt(e.target.value)})}
                                        className="w-full h-2 bg-surface-input rounded-lg appearance-none cursor-pointer accent-brand-primary"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-500 pl-1">
                                    El círculo azul en el mapa muestra el área permitida.
                                </p>
                            </div>
                        </div>
                    </div>

                </form>

                <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-surface-card">
                    <Button variant="ghost" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button variant="monster" onClick={handleSubmit} loading={loading}>
                        {eventoToEdit ? 'Guardar Cambios' : 'Agendar Evento'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
