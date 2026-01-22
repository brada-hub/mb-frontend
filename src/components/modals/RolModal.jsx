import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X, Shield, Save, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

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

    const permissionMap = {
        'GESTION_MIEMBROS': { label: '¿Puede gestionar músicos?', category: 'Operación' },
        'GESTION_EVENTOS': { label: '¿Puede crear eventos y agenda?', category: 'Operación' },
        'GESTION_ASISTENCIA': { label: '¿Puede marcar asistencia?', category: 'Operación' },
        'GESTION_SECCIONES': { label: '¿Puede gestionar secciones instrumentales?', category: 'Operación' },
        'GESTION_RECURSOS': { label: '¿Puede subir partituras y guías?', category: 'Música' },
        'GESTION_BIBLIOTECA': { label: '¿Puede crear repertorios?', category: 'Música' },
        'GESTION_FINANZAS': { label: '¿Puede gestionar pagos?', category: 'Finanzas' },
        'GESTION_ROLES': { label: '¿Puede gestionar roles?', category: 'Sistema' },
        'VER_DASHBOARD': { label: '¿Puede ver estadísticas?', category: 'Sistema' }
    };

    const categories = ['Operación', 'Música', 'Finanzas', 'Sistema', 'Otros'];

    const getPermissionConfig = (permName) => {
        const normalized = permName?.trim().toUpperCase();
        return permissionMap[normalized] || { label: permName, category: 'Otros' };
    };

    const onSubmit = async (data) => {
        if (rol?.es_protegido) {
            onClose();
            return;
        }
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
            alert(error.response?.data?.message || "Error al guardar el rol.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const isProtected = rol?.es_protegido;

    const filterLettersOnly = (e) => {
        if (isProtected) return;
        let value = e.target.value.toUpperCase();
        const cleaned = value.replace(/[^A-ZÁÉÍÓÚÜÑ\s]/g, '');
        e.target.value = cleaned.replace(/\s{2,}/g, ' ');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                className="relative w-full max-w-3xl bg-surface-card sm:border sm:border-surface-border sm:rounded-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] text-gray-900 dark:text-gray-100"
            >
                <div className="sticky top-0 z-10 flex items-center justify-between p-5 sm:p-6 bg-indigo-600 text-white shadow-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/20 rounded-xl">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight">{rol ? (isProtected ? 'Ver Perfil' : 'Editar Rol') : 'Nuevo Rol'}</h2>
                            <p className="text-[10px] text-white/60 font-black tracking-widest uppercase">
                                {isProtected ? 'Rol de Sistema Protegido' : 'Configuración de Privilegios'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-all">
                        <X className="w-8 h-8" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                    
                    {isProtected && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-4 text-amber-600 dark:text-amber-500">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-[10px] font-black uppercase leading-relaxed tracking-wider transition-colors">Perfil Protegido: Los permisos de este rol vienen preconfigurados por el sistema.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input 
                            label="Nombre del Perfil" 
                            placeholder="EJ. ADMINISTRADOR, COORDINADOR" 
                            icon={Shield}
                            readOnly={isProtected}
                            onInput={filterLettersOnly}
                            className="bg-black/5 dark:bg-black/20 border-surface-border text-gray-900 dark:text-white"
                            {...register('rol', { 
                                required: "El nombre es obligatorio",
                                pattern: {
                                    value: /^[A-ZÁÉÍÓÜÑ\s]+$/,
                                    message: "Solo se permiten letras"
                                }
                            })}
                            error={errors.rol?.message}
                        />

                        <Input 
                            label="Propósito / Funciones" 
                            type="textarea"
                            placeholder="DESCRIBA QUÉ PUEDE HACER ESTE ROL..."
                            icon={AlertCircle}
                            readOnly={isProtected}
                            onInput={filterLettersOnly}
                            className="bg-black/5 dark:bg-black/20 border-surface-border text-gray-900 dark:text-white"
                            {...register('descripcion', {
                                pattern: {
                                    value: /^[A-ZÁÉÍÓÜÑ\s]*$/,
                                    message: "Solo se permiten letras"
                                }
                            })}
                            error={errors.descripcion?.message}
                        />
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-surface-border pb-3">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] transition-colors">Asignación de Permisos</h3>
                            <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-4 py-1.5 rounded-full font-black uppercase tracking-widest border border-indigo-500/20 transition-colors">
                                {selectedPermisos.length} Seleccionados
                            </span>
                        </div>

                        <div className="space-y-10">
                            {categories.map(cat => {
                                const permissionsInCat = Array.isArray(allPermisos) ? allPermisos.filter(p => getPermissionConfig(p.permiso).category === cat) : [];
                                
                                if (permissionsInCat.length === 0) return null;

                                return (
                                    <div key={cat} className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-4 w-1 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>
                                            <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-widest opacity-80">{cat}</h4>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                                             {permissionsInCat.map((p) => {
                                                const isSelected = selectedPermisos.includes(p.id_permiso);
                                                const config = getPermissionConfig(p.permiso);
                                                return (
                                                    <button
                                                        key={p.id_permiso}
                                                        type="button"
                                                        disabled={isProtected}
                                                        onClick={() => togglePermiso(p.id_permiso)}
                                                        className={clsx(
                                                            "flex items-center justify-between p-4.5 rounded-2xl border transition-all text-left group active:scale-[0.98]",
                                                            isSelected 
                                                                ? "bg-indigo-600/10 border-indigo-500/30 ring-1 ring-indigo-500/10" 
                                                                : "bg-black/5 dark:bg-[#1a2035]/50 border-surface-border text-gray-500 dark:text-gray-400 hover:border-brand-primary/30",
                                                            isProtected && "cursor-default opacity-80"
                                                        )}
                                                    >
                                                        <span className={clsx("text-xs font-black uppercase tracking-tight leading-tight flex-1 pr-4 transition-colors", isSelected ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400")}>
                                                            {config.label}
                                                        </span>
                                                        <div className={clsx(
                                                            "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                                                            isSelected ? "bg-indigo-600 text-white" : "border-2 border-surface-border text-transparent"
                                                        )}>
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </form>

                <div className="sticky bottom-0 bg-surface-card border-t border-surface-border p-6 sm:p-8 flex flex-col sm:flex-row justify-end gap-3 transition-colors">
                    <Button type="button" variant="ghost" onClick={onClose} className="w-full sm:w-auto font-black uppercase tracking-widest text-[10px] h-12">
                        {isProtected ? 'Cerrar Vista' : 'Cancelar'}
                    </Button>
                    {!isProtected && (
                        <Button type="submit" loading={loading} className="w-full sm:w-auto sm:px-12 font-black uppercase tracking-widest text-[10px] h-12 shadow-xl shadow-indigo-600/20" variant="monster">
                            <Save className="w-4 h-4 mr-3" /> {rol ? 'Guardar Cambios' : 'Crear Perfil'}
                        </Button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
