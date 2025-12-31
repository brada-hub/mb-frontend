import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X, Layers, Save, AlertCircle } from 'lucide-react';

export default function SeccionModal({ isOpen, onClose, onSuccess, seccion = null }) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (seccion) {
                reset({
                    seccion: seccion.seccion,
                    descripcion: seccion.descripcion || ''
                });
            } else {
                reset({
                    seccion: '',
                    descripcion: ''
                });
            }
        }
    }, [isOpen, reset, seccion]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            if (seccion) {
                await api.put(`/secciones/${seccion.id_seccion}`, data);
            } else {
                await api.post('/secciones', data);
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving section:', error);
            const msg = error.response?.data?.message || "Error al guardar la sección.";
            alert(msg);
        } finally {
            setLoading(true); // Evitar doble submit
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    /**
     * Filtra la entrada para permitir solo letras, espacios y caracteres del español.
     * Convierte a MAYÚSCULAS automáticamente.
     */
    const filterLettersOnly = (e) => {
        let value = e.target.value.toUpperCase();
        // Solo permitir letras (incluyendo ñ y acentos) y espacios
        const cleaned = value.replace(/[^A-ZÁÉÍÓÚÜÑ\s]/g, '');
        // Evitar múltiples espacios consecutivos
        e.target.value = cleaned.replace(/\s{2,}/g, ' ');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-xl bg-surface-card md:border md:border-white/10 md:rounded-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh]">
                
                <div className="flex items-center justify-between p-6 bg-brand-primary text-white shadow-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">{seccion ? 'Editar Sección' : 'Nueva Sección'}</h2>
                            <p className="text-xs text-white/60 font-medium tracking-widest uppercase">Distribución de instrumentos</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 hover:bg-white/20 rounded-2xl transition-all">
                        <X className="w-7 h-7" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8 overflow-y-auto">
                    
                    <div className="space-y-6">
                        <Input 
                            label="Nombre de la Sección" 
                            placeholder="EJ. TROMPETAS, PLATILLOS, VIENTOS" 
                            icon={Layers}
                            helperText="Solo letras"
                            onInput={filterLettersOnly}
                            {...register('seccion', { 
                                required: "El nombre es obligatorio",
                                pattern: {
                                    value: /^[A-ZÁÉÍÓÚÜÑ\s]+$/,
                                    message: "Solo se permiten letras"
                                }
                            })}
                            error={errors.seccion?.message}
                        />

                        <Input 
                            label="Descripción / Familia" 
                            type="textarea"
                            placeholder="EJ. INSTRUMENTOS DE VIENTO METAL, PERCUSIÓN RÍTMICA..."
                            icon={AlertCircle}
                            helperText="Solo letras"
                            onInput={filterLettersOnly}
                            {...register('descripcion', {
                                pattern: {
                                    value: /^[A-ZÁÉÍÓÚÜÑ\s]*$/,
                                    message: "Solo se permiten letras"
                                }
                            })}
                            error={errors.descripcion?.message}
                        />
                    </div>

                    <div className="flex flex-col-reverse md:flex-row justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={onClose} className="w-full md:w-auto">Cancelar</Button>
                        <Button type="submit" loading={loading} className="w-full md:w-auto md:px-12" variant="monster">
                            <Save className="w-5 h-5 mr-3" /> {seccion ? 'Guardar Cambios' : 'Crear Sección'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
