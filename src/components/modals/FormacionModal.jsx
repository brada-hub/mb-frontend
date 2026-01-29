import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Users, Search, Check, Plus, Trash2, Info } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import api from '../../api';
import { useToast } from '../../context/ToastContext';
import clsx from 'clsx';

export default function FormacionModal({ isOpen, onClose, onSuccess, formacionToEdit = null }) {
    const { notify } = useToast();
    const [loading, setLoading] = useState(false);
    const [searchMember, setSearchMember] = useState('');
    const [miembrosDisponibles, setMiembrosDisponibles] = useState([]);
    const [selectedMiembros, setSelectedMiembros] = useState([]);
    
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: ''
    });

    useEffect(() => {
        if (isOpen) {
            loadMiembros();
            if (formacionToEdit) {
                setFormData({
                    nombre: formacionToEdit.nombre || '',
                    descripcion: formacionToEdit.descripcion || ''
                });
                setSelectedMiembros(formacionToEdit.miembros?.map(m => m.id_miembro) || []);
            } else {
                setFormData({ nombre: '', descripcion: '' });
                setSelectedMiembros([]);
            }
        }
    }, [isOpen, formacionToEdit]);

    const loadMiembros = async () => {
        try {
            const res = await api.get('/miembros');
            setMiembrosDisponibles(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            notify('Error al cargar miembros', 'error');
        }
    };

    const toggleMiembro = (id) => {
        setSelectedMiembros(prev => 
            prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nombre.trim()) return notify('El nombre es obligatorio', 'warning');
        if (selectedMiembros.length === 0) return notify('Selecciona al menos un miembro', 'warning');

        setLoading(true);
        try {
            const payload = {
                ...formData,
                id_miembros: selectedMiembros
            };

            if (formacionToEdit) {
                await api.put(`/formaciones/${formacionToEdit.id_formacion}`, payload);
                notify('Formación actualizada', 'success');
            } else {
                await api.post('/formaciones', payload);
                notify('Formación creada', 'success');
            }
            onSuccess();
            onClose();
        } catch (error) {
            notify('Error al guardar formación', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const filteredMiembros = miembrosDisponibles.filter(m => 
        `${m.nombres} ${m.apellidos}`.toLowerCase().includes(searchMember.toLowerCase()) ||
        (m.instrumento?.instrumento || '').toLowerCase().includes(searchMember.toLowerCase())
    );

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />
            
            <div className="relative w-full max-w-4xl bg-surface-card border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0 bg-surface-card/50 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-indigo-400">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                                {formacionToEdit ? 'Editar Formación' : 'Nueva Formación'}
                            </h2>
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Define un equipo de trabajo para tus eventos</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-3 hover:bg-white/5 rounded-2xl text-gray-400 hover:text-white transition-all active:scale-90"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
                    <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4 mb-2 block">Nombre de la Formación</label>
                                    <Input 
                                        placeholder="Ej: Banda A (Titulares), Combo Boda..."
                                        value={formData.nombre}
                                        onChange={e => setFormData({...formData, nombre: e.target.value})}
                                        required
                                        className="bg-white/5 border-white/5 h-14 text-sm font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4 mb-2 block">Descripción (Opcional)</label>
                                    <textarea 
                                        placeholder="Detalles sobre cuándo usar esta formación..."
                                        value={formData.descripcion}
                                        onChange={e => setFormData({...formData, descripcion: e.target.value})}
                                        className="w-full bg-white/5 border border-white/5 rounded-[2rem] p-6 text-sm font-bold text-white outline-none focus:border-indigo-500/50 transition-all min-h-[120px]"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col h-[400px]">
                                <div className="flex items-center justify-between mb-4 px-4">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Seleccionar Miembros ({selectedMiembros.length})</label>
                                    <div className="relative w-48">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                                        <input 
                                            type="text"
                                            placeholder="Buscar músico..."
                                            value={searchMember}
                                            onChange={e => setSearchMember(e.target.value)}
                                            className="w-full bg-white/5 border border-white/5 rounded-full py-1.5 pl-8 pr-4 text-[10px] text-white outline-none focus:border-indigo-500/50"
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 bg-black/20 rounded-[2rem] border border-white/5 overflow-y-auto custom-scrollbar p-2">
                                    <div className="space-y-1">
                                        {filteredMiembros.map(m => {
                                            const isSelected = selectedMiembros.includes(m.id_miembro);
                                            return (
                                                <button
                                                    key={m.id_miembro}
                                                    type="button"
                                                    onClick={() => toggleMiembro(m.id_miembro)}
                                                    className={clsx(
                                                        "w-full flex items-center justify-between p-3 rounded-2xl transition-all group",
                                                        isSelected 
                                                            ? "bg-indigo-600 text-white" 
                                                            : "hover:bg-white/5 text-gray-400 hover:text-white"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3 text-left">
                                                        <div className={clsx(
                                                            "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black",
                                                            isSelected ? "bg-white/20" : "bg-white/5"
                                                        )}>
                                                            {m.nombres.charAt(0)}{m.apellidos.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold leading-none">{m.nombres} {m.apellidos}</p>
                                                            <p className={clsx(
                                                                "text-[9px] font-bold uppercase tracking-wider mt-1",
                                                                isSelected ? "text-white/60" : "text-gray-600"
                                                            )}>
                                                                {m.instrumento?.instrumento}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className={clsx(
                                                        "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                                                        isSelected ? "bg-white border-white text-indigo-600 scale-110" : "border-white/10 text-transparent"
                                                    )}>
                                                        <Check className="w-3 h-3 stroke-[4]" />
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 border-t border-white/5 bg-surface-card/50 backdrop-blur-xl flex justify-end gap-4 shrink-0">
                        <Button variant="secondary" onClick={onClose} type="button">
                            Cancelar
                        </Button>
                        <Button variant="primary" loading={loading} type="submit" className="min-w-[160px]">
                            {formacionToEdit ? 'Guardar Cambios' : 'Crear Formación'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
