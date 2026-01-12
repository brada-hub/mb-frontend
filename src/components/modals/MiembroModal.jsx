import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import api from '../../api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import MapPicker from '../ui/MapPicker';
import SmartDateInput from '../ui/SmartDateInput';
import { 
    X, User, MapPin, Calendar, Smartphone, 
    Fingerprint, Home, Phone, ShieldCheck, 
    MessageCircle, AlertCircle, Save 
} from 'lucide-react';
import { clsx } from 'clsx';
import { useToast } from '../../context/ToastContext';

export default function MiembroModal({ isOpen, onClose, onSuccess, miembro = null }) {
    const { register, handleSubmit, reset, watch, setValue, control, formState: { errors, isDirty } } = useForm({
        mode: "onChange", // VALIDACIÓN EN TIEMPO REAL
        defaultValues: {
            has_emergency_contact: false,
            latitud: null, 
            longitud: null 
        }
    });

    const [loading, setLoading] = useState(false);
    const [catalogsLoading, setCatalogsLoading] = useState(true);
    const [catalogs, setCatalogs] = useState({ roles: [], secciones: [], categorias: [], permisos: [], voces: [] });
    const [createdCredentials, setCreatedCredentials] = useState(null);
    const { notify } = useToast();

    const hasEmergencyContact = watch('has_emergency_contact');
    const selectedSeccion = watch('id_seccion');

    useEffect(() => {
        if (isOpen) {
            setCatalogsLoading(true);
            api.post('/sync/master-data')
                .then(res => {
                    setCatalogs(res.data);
                    setCatalogsLoading(false);
                    
                    // Solo después de cargar los catálogos hacemos el reset
                    // Esto asegura que los <select> tengan opciones cuando reciban su valor
                    if (miembro) {
                        const emergency = miembro.contactos && miembro.contactos.length > 0;
                        reset({
                            ...miembro,
                            id_seccion: miembro.id_seccion?.toString(),
                            id_instrumento: miembro.id_instrumento?.toString(),
                            id_categoria: miembro.id_categoria?.toString(),
                            id_rol: miembro.id_rol?.toString(),
                            id_voz: miembro.id_voz?.toString(),
                            celular: miembro.celular ? miembro.celular.toString() : '',
                            has_emergency_contact: emergency,
                            contacto_nombre: emergency ? miembro.contactos[0].nombres_apellidos : '',
                            contacto_celular: emergency ? (miembro.contactos[0].celular ? miembro.contactos[0].celular.toString() : '') : '',
                            contacto_parentesco: emergency ? miembro.contactos[0].parentesco : ''
                        });
                    } else {
                        reset({
                            has_emergency_contact: false,
                            latitud: null,
                            longitud: null,
                            id_seccion: '',
                            id_instrumento: '',
                            id_categoria: '',
                            id_rol: '',
                            id_voz: ''
                        });
                    }
                })
                .catch(err => {
                    console.error("Error loading catalogs", err);
                    notify("No se pudieron cargar los datos del sistema", "error");
                    setCatalogsLoading(false);
                });
            
            setCreatedCredentials(null);
        }
    }, [isOpen, reset, miembro]);

    // =============================================
    // FUNCIONES DE FILTRADO EN TIEMPO REAL (BOLIVIA)
    // TODO EN MAYÚSCULAS PARA HOMOGENEIDAD
    // =============================================

    /**
     * NOMBRES Y APELLIDOS: Solo letras, espacios y caracteres especiales del español.
     * Bloquea números y símbolos mientras el usuario escribe.
     * CONVIERTE A MAYÚSCULAS AUTOMÁTICAMENTE.
     */
    const filterLetters = (e) => {
        let value = e.target.value.toUpperCase();
        // Solo permitir letras (incluyendo ñ y acentos) y espacios
        const cleaned = value.replace(/[^A-ZÁÉÍÓÚÜÑ\s]/g, '');
        // Evitar múltiples espacios consecutivos
        e.target.value = cleaned.replace(/\s{2,}/g, ' ');
    };

    /**
     * CELULAR BOLIVIA: Solo dígitos numéricos (0-9).
     * Máximo 8 dígitos para celulares bolivianos.
     */
    const filterNumbers = (e) => {
        let value = e.target.value.replace(/[^0-9]/g, '');

        // REGLA: El primer dígito SOLO puede ser 6 o 7
        // Si el usuario intenta escribir otro número al principio, lo eliminamos
        if (value.length > 0 && !['6', '7'].includes(value[0])) {
            value = value.substring(1);
        }

        // Limitar a 8 dígitos (longitud de celulares bolivianos)
        if (value.length > 8) {
            value = value.slice(0, 8);
        }
        e.target.value = value;
    };

    /**
     * CI BOLIVIA: Formato válido es:
     * - 5 a 10 dígitos numéricos
     * - Opcionalmente seguido de un guión (-) y UNA letra mayúscula (extensión departamental)
     * Ejemplo válido: 1234567, 12345678, 1234567-L
     * YA ESTÁ EN MAYÚSCULAS POR DEFECTO.
     */
    const filterCI = (e) => {
        let value = e.target.value.toUpperCase();
        
        // Paso 1: Separar la parte numérica de cualquier sufijo
        const hasHyphen = value.includes('-');
        
        if (hasHyphen) {
            const parts = value.split('-');
            // Limpiar la parte numérica (solo dígitos, máximo 10)
            let numericPart = parts[0].replace(/[^0-9]/g, '').slice(0, 10);
            // Limpiar la parte de la letra (solo UNA letra mayúscula)
            let letterPart = (parts[1] || '').replace(/[^A-Z]/g, '').slice(0, 1);
            
            // Si hay parte numérica, reconstruir
            if (numericPart.length >= 5) {
                e.target.value = letterPart ? `${numericPart}-${letterPart}` : `${numericPart}-`;
            } else {
                e.target.value = numericPart;
            }
        } else {
            // Sin guión: solo permitir números (máximo 10 dígitos)
            e.target.value = value.replace(/[^0-9]/g, '').slice(0, 10);
        }
    };

    /**
     * DIRECCIÓN: Permite letras, números, espacios y caracteres comunes en direcciones.
     * CONVIERTE A MAYÚSCULAS AUTOMÁTICAMENTE.
     */
    const filterAlphanumeric = (e) => {
        let value = e.target.value.toUpperCase();
        // Permitir letras, números, espacios, puntos, comas, guiones, # y /
        e.target.value = value.replace(/[^A-ZÁÉÍÓÚÜÑ0-9\s.,#\-\/]/g, '');
    };

    const onSubmit = async (data) => {
        if (miembro && !isDirty) {
            onClose();
            return;
        }

        setLoading(true);
        try {
            let res;
            if (miembro) {
                // ACTUALIZAR
                res = await api.put(`/miembros/${miembro.id_miembro}`, data);
                if (onSuccess) onSuccess(res.data);
                notify("Miembro actualizado correctamente", "success");
                onClose(); // En edición cerramos directo porque no hay credenciales que mostrar
            } else {
                // CREAR
                res = await api.post('/miembros', data);
                notify("Miembro registrado con éxito", "success");
                setCreatedCredentials(res.data.credentials);
                
                if (res.data.credentials?.whatsapp_url) {
                    window.open(res.data.credentials.whatsapp_url, '_blank');
                }
                if (onSuccess) onSuccess(res.data.miembro);
            }
        } catch (error) {
            console.error('Error al guardar miembro:', error);
            
            // Manejar errores de validación del backend (422)
            if (error.response?.status === 422) {
                const validationErrors = error.response.data.errors;
                if (validationErrors) {
                    const firstError = Object.values(validationErrors)[0];
                    const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
                    notify(`⚠️ Validación: ${errorMessage}`, "error");
                } else {
                    notify(`⚠️ ${error.response.data.message || "Error de validación"}`, "error");
                }
            } else if (error.response?.status === 401) {
                notify("🔒 Sesión expirada. Por favor, inicia sesión.", "error");
            } else if (error.response?.status === 403) {
                notify("🚫 No tienes permisos.", "error");
            } else if (error.response?.status >= 500) {
                notify("❌ Error del servidor.", "error");
            } else {
                notify(`❌ Error: ${error.response?.data?.message || error.message}`, "error");
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-4xl h-full md:h-auto max-h-[100vh] md:max-h-[95vh] overflow-y-auto bg-surface-card md:border md:border-white/10 md:rounded-4xl shadow-2xl animate-in zoom-in-95 duration-300 text-gray-100">
                
                <div className="sticky top-0 z-[60] flex items-center justify-between p-5 md:p-6 bg-brand-primary text-white shadow-xl shadow-brand-primary/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">{miembro ? 'Editar Miembro' : 'Nuevo Miembro'}</h2>
                            <p className="text-xs text-white/60 font-medium">{miembro ? 'Actualización de datos' : 'Registro oficial de integrante'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 hover:bg-white/20 rounded-2xl transition-all active:scale-90">
                        <X className="w-7 h-7" />
                    </button>
                </div>

                {!createdCredentials ? (
                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-10 space-y-12">
                        
                        <section className="space-y-8 animate-in slide-up duration-500">
                            <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                                <div className="w-1.5 h-6 bg-brand-primary rounded-full"></div>
                                <h3 className="text-lg font-bold text-white uppercase tracking-wider text-sm">Datos Personales</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                                <Input 
                                    name="nombres"
                                    label="Nombres" 
                                    placeholder="EJ. JUAN" 
                                    icon={User} 
                                    helperText="NOMBRES"
                                    onInput={filterLetters}
                                    error={errors.nombres?.message}
                                    {...register('nombres', { 
                                        required: "El nombre es obligatorio",
                                        minLength: { value: 2, message: "Mínimo 2 letras" },
                                        maxLength: { value: 50, message: "Máximo 50 caracteres" },
                                        pattern: { value: /^[A-ZÁÉÍÓÚÜÑ\s]+$/, message: "Solo se permiten letras" },
                                        validate: (val) => val?.trim().length >= 2 || "El nombre no puede estar vacío"
                                    })} 
                                />
                                <Input 
                                    name="apellidos"
                                    label="Apellidos" 
                                    placeholder="EJ. PEREZ" 
                                    icon={User} 
                                    helperText="APELLIDOS"
                                    onInput={filterLetters}
                                    error={errors.apellidos?.message}
                                    {...register('apellidos', { 
                                        required: "Los apellidos son obligatorios",
                                        minLength: { value: 2, message: "Mínimo 2 letras" },
                                        maxLength: { value: 50, message: "Máximo 50 caracteres" },
                                        pattern: { value: /^[A-ZÁÉÍÓÚÜÑ\s]+$/, message: "Solo se permiten letras" },
                                        validate: (val) => val?.trim().length >= 2 || "Los apellidos no pueden estar vacíos"
                                    })} 
                                />
                                <Input 
                                    name="ci"
                                    label="CI" 
                                    placeholder="1234567 o 1234567-L" 
                                    icon={Fingerprint} 
                                    helperText="NUMERO DE CI"
                                    onInput={filterCI}
                                    error={errors.ci?.message}
                                    {...register('ci', { 
                                        required: "El CI es obligatorio",
                                        pattern: { 
                                            value: /^[0-9]{5,10}(-[A-Z])?$/, 
                                            message: "Formato: 5-10 dígitos, opcional -X (Ej: 1234567-L)" 
                                        },
                                        validate: (val) => {
                                            if (!val) return true;
                                            const numericPart = val.split('-')[0];
                                            if (numericPart.length < 5) return "Mínimo 5 dígitos";
                                            if (numericPart.length > 10) return "Máximo 10 dígitos";
                                            return true;
                                        }
                                    })} 
                                />
                                <Input 
                                    name="celular"
                                    label="Celular" 
                                    placeholder="7XXXXXXX o 6XXXXXXX" 
                                    icon={Smartphone} 
                                    helperText="NUMERO DE CELULAR"
                                    onInput={filterNumbers}
                                    error={errors.celular?.message}
                                    {...register('celular', { 
                                        required: "El celular es obligatorio",
                                        validate: (val) => {
                                            const s = val?.toString() || '';
                                            if (s.length !== 8) return "Debe tener exactamente 8 dígitos";
                                            if (!/^[67]/.test(s)) return "Debe empezar con 6 o 7";
                                            return true;
                                        }
                                    })} 
                                />
                                <Controller
                                    name="fecha"
                                    control={control}
                                    rules={{
                                        required: "La fecha de nacimiento es obligatoria",
                                        validate: (value) => {
                                            if (!value) return true;
                                            const selectedDate = new Date(value + 'T12:00:00');
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);
                                            if (selectedDate > today) return "La fecha no puede ser futura";
                                            if (selectedDate.getFullYear() < 1920) return "Fecha no válida";
                                            return true;
                                        }
                                    }}
                                    render={({ field }) => (
                                        <SmartDateInput 
                                            label="Fecha Nacimiento"
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={errors.fecha?.message}
                                            max={new Date().toISOString().split("T")[0]}
                                        />
                                    )}
                                />
                            </div>

                            <div className="space-y-6 pt-4">
                                <MapPicker 
                                    onChange={(coords) => {
                                        setValue('latitud', coords.lat);
                                        setValue('longitud', coords.lng);
                                    }}
                                />
                                <Input 
                                    name="direccion"
                                    label="DIRECCIÓN DETALLADA DE LA VIVIENDA" 
                                    type="textarea"
                                    placeholder="ZONA, CALLE Y NÚMERO..." 
                                    icon={Home}
                                    onInput={filterAlphanumeric}
                                    helperText="DIRECCIÓN DETALLADA DE LA VIVIENDA"
                                    error={errors.direccion?.message}
                                    {...register('direccion', { 
                                        required: "La dirección es necesaria",
                                        minLength: { value: 10, message: "Mínimo 10 caracteres" },
                                        maxLength: { value: 200, message: "Máximo 200 caracteres" }
                                    })} 
                                />
                                <Input 
                                    name="referencia_vivienda"
                                    label="REFERENCIA / DETALLES DE LA CASA" 
                                    placeholder="EJ: CASA CON REJAS BLANCAS, FRENTE A LA PLAZA..." 
                                    icon={MapPin}
                                    onInput={filterAlphanumeric}
                                    error={errors.referencia_vivienda?.message}
                                    {...register('referencia_vivienda')} 
                                />
                            </div>
                        </section>

                        <section className="space-y-8 animate-in slide-up duration-700">
                            <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                                <div className="w-1.5 h-6 bg-monster-purple rounded-full"></div>
                                <h3 className="text-lg font-bold text-white uppercase tracking-wider text-sm">Asignación Operativa</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2.5 text-gray-100 col-span-1">
                                    <label className="text-sm font-bold text-gray-400 ml-1">Sección</label>
                                    <select 
                                        id="select-seccion"
                                        {...register('id_seccion', { required: "Selecciona una sección" })} 
                                        className={clsx(
                                            "w-full bg-surface-input border rounded-2xl h-14 px-5 text-white active:scale-[0.99] outline-none transition-all",
                                            errors.id_seccion ? "border-red-500/50 ring-2 ring-red-500/20" : "border-white/5 focus:ring-2 focus:ring-brand-primary/30"
                                        )}
                                    >
                                        <option value="">Sección...</option>
                                        {catalogs.secciones?.map(s => <option key={s.id_seccion} value={s.id_seccion.toString()}>{s.seccion}</option>)}
                                    </select>
                                    {errors.id_seccion && <p className="text-xs text-red-500 font-bold ml-1">{errors.id_seccion.message}</p>}
                                </div>
                                
                                <div className="space-y-2.5 text-gray-100 col-span-1">
                                    <label className="text-sm font-bold text-gray-400 ml-1">Instrumento</label>
                                    <select 
                                        id="select-instrumento"
                                        {...register('id_instrumento', { required: "Selecciona un instrumento" })} 
                                        disabled={!selectedSeccion}
                                        className={clsx(
                                            "w-full bg-surface-input border rounded-2xl h-14 px-5 text-white active:scale-[0.99] outline-none transition-all disabled:opacity-50",
                                            errors.id_instrumento ? "border-red-500/50 ring-2 ring-red-500/20" : "border-white/5 focus:ring-2 focus:ring-brand-primary/30"
                                        )}
                                    >
                                        <option value="">Instrumento...</option>
                                        {(catalogs.secciones?.find(s => s.id_seccion.toString() === selectedSeccion)?.instrumentos || []).map(i => (
                                            <option key={i.id_instrumento} value={i.id_instrumento.toString()}>{i.instrumento}</option>
                                        ))}
                                    </select>
                                    {errors.id_instrumento && <p className="text-xs text-red-500 font-bold ml-1">{errors.id_instrumento.message}</p>}
                                </div>

                                {(() => {
                                    const currentSeccion = catalogs.secciones?.find(s => s.id_seccion.toString() === selectedSeccion);
                                    const isPercusion = currentSeccion?.seccion?.toUpperCase() === 'PERCUSIÓN';
                                    const showVoz = selectedSeccion && !isPercusion;
                                    
                                    if (!showVoz) return null;

                                    return (
                                        <div className="space-y-2.5 text-gray-100 col-span-1 animate-in fade-in slide-in-from-left-4">
                                            <label className="text-sm font-bold text-gray-400 ml-1">Voz / Registro</label>
                                            <select 
                                                id="select-voz"
                                                {...register('id_voz', { required: "Selecciona una voz" })} 
                                                className={clsx(
                                                    "w-full bg-surface-input border rounded-2xl h-14 px-5 text-white active:scale-[0.99] outline-none transition-all",
                                                    errors.id_voz ? "border-red-500/50 ring-2 ring-red-500/20" : "border-white/5 focus:ring-2 focus:ring-brand-primary/30"
                                                )}
                                            >
                                                <option value="">Seleccionar Voz...</option>
                                                {catalogs.voces?.map(v => (
                                                    <option key={v.id_voz} value={v.id_voz.toString()}>{v.nombre_voz}</option>
                                                ))}
                                            </select>
                                            {errors.id_voz && <p className="text-xs text-red-500 font-bold ml-1">{errors.id_voz.message}</p>}
                                        </div>
                                    );
                                })()}

                                <div className="space-y-2.5">
                                    <label className="text-sm font-bold text-gray-400 ml-1">Categoría</label>
                                    <select 
                                        id="select-categoria"
                                        {...register('id_categoria', { required: "Selecciona una categoría" })} 
                                        className={clsx(
                                            "w-full bg-surface-input border rounded-2xl h-14 px-5 text-white outline-none transition-all",
                                            errors.id_categoria ? "border-red-500/50 ring-2 ring-red-500/20" : "border-white/5 focus:ring-2 focus:ring-brand-primary/30"
                                        )}
                                    >
                                        <option value="">Categoría...</option>
                                        {catalogs.categorias?.map(c => <option key={c.id_categoria} value={c.id_categoria.toString()}>{c.nombre_categoria}</option>)}
                                    </select>
                                    {errors.id_categoria && <p className="text-xs text-red-500 font-bold ml-1">{errors.id_categoria.message}</p>}
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-sm font-bold text-gray-400 ml-1">Rol Sistema</label>
                                    <select 
                                        id="select-rol"
                                        {...register('id_rol', { required: "Selecciona un rol" })} 
                                        className={clsx(
                                            "w-full bg-surface-input border rounded-2xl h-14 px-5 text-white outline-none transition-all",
                                            errors.id_rol ? "border-red-500/50 ring-2 ring-red-500/20" : "border-white/5 focus:ring-2 focus:ring-brand-primary/30"
                                        )}
                                    >
                                        <option value="">Rol...</option>
                                        {catalogs.roles?.map(r => <option key={r.id_rol} value={r.id_rol.toString()}>{r.rol}</option>)}
                                    </select>
                                    {errors.id_rol && <p className="text-xs text-red-500 font-bold ml-1">{errors.id_rol.message}</p>}
                                </div>
                            </div>
                        </section>

                        <section className="pt-8 border-t border-white/5 space-y-8 animate-in slide-up duration-1000">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-red-500 rounded-full"></div>
                                    <h3 className="text-lg font-bold text-white uppercase tracking-wider text-sm">Emergencia</h3>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer group">
                                    <input id="check-emergency" type="checkbox" {...register('has_emergency_contact')} className="sr-only peer" />
                                    <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-[20px] after:w-[22px] after:transition-all peer-checked:bg-red-600 shadow-inner"></div>
                                    <span className="ml-3 text-sm font-bold text-gray-400 group-hover:text-white transition-colors">¿Tiene contacto?</span>
                                </label>
                            </div>

                            {hasEmergencyContact && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7 p-6 md:p-8 bg-red-500/5 rounded-[32px] border border-red-500/10 animate-in zoom-in-95 duration-300">
                                    <Input 
                                        name="contacto_nombre"
                                        label="Nombre de Contacto" 
                                        placeholder="NOMBRE COMPLETO DEL CONTACTO" 
                                        icon={User} 
                                        onInput={filterLetters}
                                        helperText="Solo letras"
                                        error={errors.contacto_nombre?.message}
                                        {...register('contacto_nombre', { 
                                            required: hasEmergencyContact ? "Nombre del contacto requerido" : false,
                                            minLength: { value: 3, message: "Mínimo 3 caracteres" },
                                            maxLength: { value: 100, message: "Máximo 100 caracteres" },
                                            pattern: { value: /^[A-ZÁÉÍÓÚÜÑ\s]+$/, message: "Solo letras permitidas" }
                                        })} 
                                    />
                                    <Input 
                                        name="contacto_celular"
                                        label="Celular de Emergencia" 
                                        placeholder="7XXXXXXX o 6XXXXXXX" 
                                        icon={Phone} 
                                        onInput={filterNumbers}
                                        helperText="8 dígitos, empieza con 6 o 7"
                                        error={errors.contacto_celular?.message}
                                        {...register('contacto_celular', { 
                                            required: hasEmergencyContact ? "Celular de emergencia requerido" : false,
                                            validate: (val) => {
                                                if (!hasEmergencyContact || !val) return true;
                                                const s = val.toString();
                                                if (s.length !== 8) return "Debe tener exactamente 8 dígitos";
                                                if (!/^[67]/.test(s)) return "Debe empezar con 6 o 7";
                                                return true;
                                            }
                                        })} 
                                    />
                                    <Input 
                                        name="contacto_parentesco"
                                        label="Parentesco / Relación" 
                                        placeholder="EJ. MADRE, PADRE, HERMANO" 
                                        icon={ShieldCheck} 
                                        className="md:col-span-2"
                                        onInput={filterLetters}
                                        helperText="Solo letras"
                                        error={errors.contacto_parentesco?.message}
                                        {...register('contacto_parentesco', {
                                            pattern: { value: /^[A-ZÁÉÍÓÚÜÑ\s]*$/, message: "Solo letras permitidas" },
                                            maxLength: { value: 50, message: "Máximo 50 caracteres" }
                                        })} 
                                    />
                                </div>
                            )}
                        </section>

                        <div className="flex flex-col-reverse md:flex-row justify-end gap-3 pt-6 pb-10">
                            <Button type="button" variant="ghost" onClick={onClose} className="w-full md:w-auto">Cancelar</Button>
                            <Button id="btn-submit-miembro" type="submit" loading={loading} className="w-full md:w-auto md:px-16" variant="monster">
                                <Save className="w-5 h-5 mr-3" /> {miembro ? 'Guardar Cambios' : 'Registrar Integrante'}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="p-8 md:p-16 text-center space-y-10 animate-in zoom-in-95">
                        <div className="w-24 h-24 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto ring-8 ring-green-500/5">
                            <ShieldCheck className="w-12 h-12" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">¡Bienvenido a la Banda!</h2>
                            <p className="text-gray-400 text-lg font-medium">Credenciales de acceso generadas correctamente</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto text-gray-100">
                            <div className="p-6 bg-surface-input rounded-[24px] border border-white/5 text-left group hover:border-brand-primary/30 transition-all">
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Usuario</p>
                                <p className="text-brand-primary font-mono text-2xl truncate">{createdCredentials.username}</p>
                            </div>
                            <div className="p-6 bg-surface-input rounded-[24px] border border-white/5 text-left group hover:border-brand-primary/30 transition-all">
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Contraseña</p>
                                <p className="text-brand-primary font-mono text-2xl">{createdCredentials.password}</p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-5 pt-4">
                            <a 
                                href={createdCredentials.whatsapp_url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="w-full max-w-sm flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20bd5c] text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-green-500/20 active:scale-95 text-lg"
                            >
                                <MessageCircle className="w-7 h-7" />
                                Compartir por WhatsApp
                            </a>
                            <button 
                                onClick={onClose}
                                className="text-gray-500 hover:text-white font-bold transition-colors text-sm uppercase tracking-widest"
                            >
                                Finalizar Registro
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
