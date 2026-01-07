import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X, Shield, Save, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

export default function RolModal({ isOpen, onClose, onSuccess, rol = null }) {
    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [allPermisos, setAllPermisos] = useState([]);
    const [selectedPermisos, setSelectedPermisos] = useState([]);

    useEffect(() => {
        if (isOpen) {
            // Cargar todos los permisos disponibles
            api.get('/permisos-lista')
                .then(res => setAllPermisos(res.data))
                .catch(console.error);

            if (rol) {
                reset({
                    rol: rol.rol,
                    descripcion: rol.descripcion || ''
                });
                setSelectedPermisos(rol.permisos?.map(p => p.id_permiso) || []);
            } else {
                reset({
                    rol: '',
                    descripcion: ''
                });
                setSelectedPermisos([]);
            }
        }
    }, [isOpen, reset, rol]);

    const togglePermiso = (id) => {
        if (selectedPermisos.includes(id)) {
            setSelectedPermisos(selectedPermisos.filter(p => p !== id));
        } else {
            setSelectedPermisos([...selectedPermisos, id]);
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const payload = {
                ...data,
                permisos: selectedPermisos
            };

            if (rol) {
                await api.put(`/roles/${rol.id_rol}`, payload);
            } else {
                await api.post('/roles', payload);
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving role:', error);
            alert("Error al guardar el rol.");
        } finally {
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
            <div className="relative w-full max-w-2xl bg-surface-card md:border md:border-white/10 md:rounded-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh]">
                
                <div className="flex items-center justify-between p-6 bg-brand-primary text-white shadow-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">{rol ? 'Editar Rol' : 'Nuevo Rol'}</h2>
                            <p className="text-xs text-white/60 font-medium tracking-widest uppercase">Definición de privilegios</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 hover:bg-white/20 rounded-2xl transition-all">
                        <X className="w-7 h-7" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8 overflow-y-auto">
                    
                    <div className="space-y-6">
                        <Input 
                            label="Nombre del Rol" 
                            placeholder="EJ. ADMINISTRADOR, COORDINADOR" 
                            icon={Shield}
                            helperText="Solo letras"
                            onInput={filterLettersOnly}
                            {...register('rol', { 
                                required: "El nombre es obligatorio",
                                pattern: {
                                    value: /^[A-ZÁÉÍÓÚÜÑ\s]+$/,
                                    message: "Solo se permiten letras"
                                }
                            })}
                            error={errors.rol?.message}
                        />

                        <Input 
                            label="Descripción" 
                            type="textarea"
                            placeholder="DESCRIPCIÓN DE LAS FUNCIONES DE ESTE ROL..."
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

                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Asignar Permisos</h3>
                            <span className="text-[10px] bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full font-bold">
                                {selectedPermisos.length} SELECCIONADOS
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {allPermisos.map((p) => {
                                const isSelected = selectedPermisos.includes(p.id_permiso);
                                return (
                                    <button
                                        key={p.id_permiso}
                                        type="button"
                                        onClick={() => togglePermiso(p.id_permiso)}
                                        className={clsx(
                                            "flex items-center justify-between p-4 rounded-2xl border transition-all text-left group",
                                            isSelected 
                                                ? "bg-brand-primary/10 border-brand-primary/30 text-white" 
                                                : "bg-white/5 border-white/5 text-gray-400 hover:border-white/20"
                                        )}
                                    >
                                        <span className={clsx("text-xs font-bold uppercase tracking-tight", isSelected ? "text-brand-primary" : "")}>
                                            {p.permiso}
                                        </span>
                                        {isSelected ? (
                                            <CheckCircle2 className="w-5 h-5 text-brand-primary" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-gray-600 group-hover:text-gray-400" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex flex-col-reverse md:flex-row justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={onClose} className="w-full md:w-auto">Cancelar</Button>
                        <Button type="submit" loading={loading} className="w-full md:w-auto md:px-12" variant="monster">
                            <Save className="w-5 h-5 mr-3" /> {rol ? 'Guardar Cambios' : 'Crear Rol'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
