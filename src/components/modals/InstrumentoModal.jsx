import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X, Music, Save, Trash2, Plus, Edit2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function InstrumentoModal({ isOpen, onClose, seccion }) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [instruments, setInstruments] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const { notify } = useToast();

    useEffect(() => {
        if (isOpen && seccion) {
            setInstruments(seccion.instrumentos || []);
            reset({ instrumento: '' });
            setEditingId(null);
        }
    }, [isOpen, seccion, reset]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            if (editingId) {
                const res = await api.put(`/instrumentos/${editingId}`, {
                    instrumento: data.instrumento,
                    id_seccion: seccion.id_seccion
                });
                setInstruments(instruments.map(i => i.id_instrumento === editingId ? res.data : i));
                notify("Instrumento actualizado", "success");
            } else {
                const res = await api.post('/instrumentos', {
                    instrumento: data.instrumento,
                    id_seccion: seccion.id_seccion
                });
                setInstruments([...instruments, res.data]);
                notify("Instrumento añadido", "success");
            }
            reset({ instrumento: '' });
            setEditingId(null);
        } catch (error) {
            console.error('Error saving instrument:', error);
            notify(error.response?.data?.message || "Error al guardar instrumento", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este instrumento?')) return;
        
        try {
            await api.delete(`/instrumentos/${id}`);
            setInstruments(instruments.filter(i => i.id_instrumento !== id));
            notify("Instrumento eliminado", "success");
        } catch (error) {
            notify(error.response?.data?.message || "Error al eliminar", "error");
        }
    };

    if (!isOpen) return null;

    const filterLettersOnly = (e) => {
        let value = e.target.value.toUpperCase();
        e.target.value = value.replace(/[^A-ZÁÉÍÓÚÜÑ\s]/g, '').replace(/\s{2,}/g, ' ');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-2xl bg-surface-card md:border md:border-surface-border md:rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] text-gray-900 dark:text-gray-100">
                
                {/* Header Premium */}
                <div className="sticky top-0 z-50 flex items-center justify-between p-6 bg-[#bc1b1b] text-white shadow-xl shadow-[#bc1b1b]/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/20 rounded-2xl">
                            <Music className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight leading-none mb-1">Instrumentos</h2>
                            <p className="text-[10px] text-white/60 font-black uppercase tracking-widest">{seccion?.seccion}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-all active:scale-95">
                        <X className="w-8 h-8" />
                    </button>
                </div>

                <div className="p-6 md:p-8 flex flex-col gap-8 overflow-hidden">
                    {/* Formulario Integrado */}
                    <form onSubmit={handleSubmit(onSubmit)} className="bg-black/5 dark:bg-white/5 p-6 rounded-[32px] border border-surface-border space-y-4">
                        <div className="flex flex-col gap-4">
                            <Input 
                                label={editingId ? "Editar Instrumento" : "Nuevo Instrumento"}
                                placeholder="EJ. TROMPETA 1, CLARINETE SIb..." 
                                icon={Music}
                                onInput={filterLettersOnly}
                                {...register('instrumento', { 
                                    required: "Escribe el nombre del instrumento",
                                    pattern: { value: /^[A-ZÁÉÍÓÚÜÑ\s]+$/, message: "Solo letras permitidas" }
                                })}
                                error={errors.instrumento?.message}
                                className="bg-black/10 dark:bg-black/20 border-surface-border text-gray-900 dark:text-white"
                            />
                            
                            <div className="flex gap-2">
                                <Button 
                                    type="submit" 
                                    loading={loading} 
                                    className="flex-1 h-12 rounded-2xl shadow-lg shadow-[#bc1b1b]/20 font-black uppercase tracking-widest text-xs"
                                >
                                    {editingId ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                    {editingId ? 'Guardar Cambios' : 'Añadir a la lista'}
                                </Button>
                                {editingId && (
                                    <Button 
                                        type="button" 
                                        variant="secondary"
                                        onClick={() => { setEditingId(null); reset({ instrumento: '' }); }}
                                        className="h-12 rounded-2xl font-black uppercase tracking-widest text-xs border-surface-border"
                                    >
                                        Cancelar
                                    </Button>
                                )}
                            </div>
                        </div>
                    </form>

                    {/* Lista con Estética del Sistema */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 scroll-smooth">
                        <div className="flex items-center gap-2 mb-4 px-1">
                            <div className="w-1 h-4 bg-[#bc1b1b] rounded-full"></div>
                            <h3 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest transition-colors">Registrados ({instruments.length})</h3>
                        </div>

                        {instruments.length === 0 ? (
                            <div className="py-16 text-center text-gray-500 dark:text-gray-500 border border-dashed border-surface-border rounded-[40px] bg-black/5 dark:bg-white/5 transition-colors">
                                <Music className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p className="font-bold uppercase tracking-widest text-xs">Sin instrumentos registrados</p>
                            </div>
                        ) : (
                            <div className="grid gap-3 pb-4">
                                {instruments.map(inst => (
                                    <div key={inst.id_instrumento} className="group flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-[24px] border border-surface-border hover:border-[#bc1b1b]/30 hover:bg-[#bc1b1b]/5 transition-all duration-300">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-xl bg-[#bc1b1b]/10 flex items-center justify-center text-[#bc1b1b] group-hover:scale-110 transition-transform">
                                                <Music className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white uppercase tracking-tight transition-colors">{inst.instrumento}</span>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button 
                                                onClick={() => {
                                                    setEditingId(inst.id_instrumento);
                                                    reset({ instrumento: inst.instrumento });
                                                }}
                                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/10 dark:bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-black/20 dark:hover:bg-white/10 transition-all active:scale-90"
                                                title="Editar"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(inst.id_instrumento)}
                                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/5 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-90"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>


            </div>
        </div>
    );
}
