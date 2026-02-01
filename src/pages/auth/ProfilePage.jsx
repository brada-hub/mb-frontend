import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import api from '../../api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import MapPicker from '../../components/ui/MapPicker';
import SmartDateInput from '../../components/ui/SmartDateInput';
import { 
    User, MapPin, Calendar, Smartphone, 
    ShieldCheck, Save, Lock, Eye, EyeOff, 
    AlertCircle, Camera 
} from 'lucide-react';
import { clsx } from 'clsx';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

export default function ProfilePage() {
    const { user, updateUser } = useAuth();
    const { notify } = useToast();
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const { register, handleSubmit, watch, setValue, control, reset, formState: { errors } } = useForm({
        defaultValues: {
            nombres: user?.miembro?.nombres || '',
            apellidos: user?.miembro?.apellidos || '',
            ci: user?.miembro?.ci || '',
            celular: user?.miembro?.celular === '0' ? '' : (user?.miembro?.celular || ''),
            direccion: user?.miembro?.direccion || '',
            fecha: user?.miembro?.fecha_nacimiento || '',
            has_emergency_contact: !!user?.miembro?.contacto_emergencia_nombre,
            contacto_nombre: user?.miembro?.contacto_emergencia_nombre || '',
            contacto_celular: user?.miembro?.contacto_emergencia_celular || '',
            latitud: user?.miembro?.latitud || null,
            longitud: user?.miembro?.longitud || null
        }
    });

    useEffect(() => {
        if (user?.miembro) {
            reset({
                nombres: user.miembro.nombres || '',
                apellidos: user.miembro.apellidos || '',
                ci: user.miembro.ci || '',
                celular: user.miembro.celular === '0' ? '' : (user.miembro.celular || ''),
                direccion: user.miembro.direccion || '',
                fecha: user.miembro.fecha_nacimiento || '',
                has_emergency_contact: !!user.miembro.contacto_emergencia_nombre,
                contacto_nombre: user.miembro.contacto_emergencia_nombre || '',
                contacto_celular: user.miembro.contacto_emergencia_celular || '',
                latitud: user.miembro.latitud || null,
                longitud: user.miembro.longitud || null
            });
        }
    }, [user, reset]);

    const hasEmergencyContact = watch('has_emergency_contact');

    // Filters
    const filterLetters = (e) => {
        let value = e.target.value.toUpperCase();
        const cleaned = value.replace(/[^A-ZÁÉÍÓÚÜÑ\s]/g, '');
        e.target.value = cleaned.replace(/\s{2,}/g, ' ');
    };

    const filterNumbers = (e) => {
        let value = e.target.value.replace(/[^0-9]/g, '');
        if (value.length > 0 && !['6', '7'].includes(value[0])) value = value.substring(1);
        if (value.length > 8) value = value.slice(0, 8);
        e.target.value = value;
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            // Nota: Usamos /complete-profile como endpoint de actualización de perfil
            // Si el backend tuviera uno específico para update, usaríamos ese.
            // Asumimos que complete-profile maneja updates (upsert).
            const res = await api.post('/complete-profile', data);
            
            if (data.password) {
                // Si cambió contraseña, manejarlo si es endpoint separado o mismo
                // Por ahora el endpoint complete-profile parece manejar todo
            }

            notify("¡Perfil actualizado con éxito!", "success");
            updateUser(res.data.user);
            setEditMode(false);
        } catch (error) {
            console.error(error);
            notify(error.response?.data?.message || "Error al actualizar perfil", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header / Cover */}
            <div className="relative h-48 md:h-64 rounded-[2.5rem] overflow-hidden bg-surface-card border border-surface-border">
                {/* Banner Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/20 via-brand-dark/20 to-purple-900/20 backdrop-blur-3xl" />
                <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
                
                <div className="absolute -bottom-12 md:-bottom-16 left-6 md:left-12 flex items-end gap-6">
                    <div className="relative group">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] bg-surface-card border-4 border-surface-card shadow-2xl flex items-center justify-center text-4xl md:text-5xl font-black text-brand-primary overflow-hidden">
                            {user?.miembro?.foto ? (
                                <img src={user.miembro.foto} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="uppercase">{user?.miembro?.nombres?.charAt(0)}</span>
                            )}
                        </div>
                        {editMode && (
                             <button className="absolute bottom-2 right-2 p-2 bg-brand-primary text-white rounded-xl shadow-lg hover:scale-105 transition-transform">
                                <Camera className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <div className="mb-14 md:mb-20">
                        <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter drop-shadow-lg">
                            {user?.miembro?.nombres} {user?.miembro?.apellidos}
                        </h1>
                        <p className="text-white/60 font-bold uppercase tracking-widest text-xs mt-1">
                            {user?.miembro?.rol?.rol || 'Miembro'} • {user?.miembro?.instrumento?.nombre_instrumento || 'Sin instrumento'}
                        </p>
                    </div>
                </div>

                <div className="absolute top-6 right-6">
                    {!editMode ? (
                        <Button 
                            onClick={() => setEditMode(true)}
                            className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white font-black uppercase tracking-widest text-xs"
                        >
                            <User className="w-4 h-4 mr-2" /> Editar Perfil
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                             <Button 
                                onClick={() => {
                                    setEditMode(false);
                                    reset(); // Cancelar cambios
                                }}
                                className="bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/20 font-black uppercase tracking-widest text-xs"
                            >
                                Cancelar
                            </Button>
                            <Button 
                                onClick={handleSubmit(onSubmit)}
                                loading={loading}
                                className="bg-brand-primary hover:bg-brand-dark text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-brand-primary/20"
                            >
                                <Save className="w-4 h-4 mr-2" /> Guardar
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Spacer for avatar overlap */}
            <div className="h-12 md:h-16" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Personal Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Datos Personales */}
                    <div className="bg-surface-card border border-surface-border rounded-3xl p-6 md:p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-32 bg-brand-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                        
                        <div className="flex items-center gap-3 mb-6 relative">
                            <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
                                <User className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Datos Personales</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            <Input 
                                label="Nombres" 
                                disabled={!editMode}
                                onInput={filterLetters}
                                error={errors.nombres?.message}
                                {...register('nombres', { required: "Obligatorio" })} 
                            />
                            <Input 
                                label="Apellidos" 
                                disabled={!editMode}
                                onInput={filterLetters}
                                error={errors.apellidos?.message}
                                {...register('apellidos', { required: "Obligatorio" })} 
                            />
                            <Input 
                                label="Cédula de Identidad" 
                                disabled={!editMode}
                                error={errors.ci?.message}
                                {...register('ci', { required: "Obligatorio" })} 
                            />
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Fecha de Nacimiento</label>
                                {editMode ? (
                                    <Controller
                                        name="fecha"
                                        control={control}
                                        render={({ field }) => (
                                            <SmartDateInput 
                                                value={field.value}
                                                onChange={field.onChange}
                                                error={errors.fecha?.message}
                                            />
                                        )}
                                    />
                                ) : (
                                    <div className="w-full h-11 px-4 flex items-center bg-black/5 dark:bg-white/5 border border-surface-border rounded-xl text-gray-500 text-sm font-bold">
                                        {watch('fecha') ? new Date(watch('fecha')).toLocaleDateString() : 'No definida'}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-surface-border grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                             <Input 
                                icon={Smartphone}
                                label="Celular Personal" 
                                disabled={!editMode}
                                onInput={filterNumbers}
                                error={errors.celular?.message}
                                {...register('celular', { required: "Obligatorio" })} 
                            />
                        </div>
                    </div>

                    {/* Ubicación */}
                    <div className="bg-surface-card border border-surface-border rounded-3xl p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Ubicación de Vivienda</h3>
                        </div>

                        <div className="space-y-6">
                            <div className={clsx(
                                "h-64 rounded-2xl overflow-hidden border border-surface-border transition-all shadow-inner",
                                !editMode && "opacity-80 grayscale"
                            )}>
                                <MapPicker 
                                    readOnly={!editMode}
                                    initialLat={user?.miembro?.latitud}
                                    initialLng={user?.miembro?.longitud}
                                    onChange={(coords) => {
                                        if (editMode) {
                                            setValue('latitud', coords.lat);
                                            setValue('longitud', coords.lng);
                                        }
                                    }}
                                />
                            </div>
                            <Input 
                                label="Dirección Detallada" 
                                type="textarea"
                                disabled={!editMode}
                                placeholder="ZONA, CALLE, NÚMERO..." 
                                {...register('direccion')} 
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Security & Emergency */}
                <div className="space-y-8">
                    {/* Seguridad */}
                    <div className="bg-surface-card border border-surface-border rounded-3xl p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Seguridad</h3>
                        </div>

                        {editMode ? (
                            <div className="space-y-5">
                                <p className="text-xs text-gray-500 mb-2">Deja en blanco si no deseas cambiarla.</p>
                                <div className="relative">
                                    <Input 
                                        label="Nueva Contraseña" 
                                        type={showPass ? "text" : "password"}
                                        placeholder="********" 
                                        error={errors.password?.message}
                                        {...register('password', { 
                                            minLength: { value: 8, message: "Mínimo 8 caracteres" } 
                                        })} 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPass(!showPass)}
                                        className="absolute right-4 top-[42px] text-gray-500 hover:text-brand-primary transition-colors"
                                    >
                                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <Input 
                                    label="Confirmar Nueva" 
                                    type={showPass ? "text" : "password"}
                                    placeholder="********" 
                                    error={errors.password_confirmation?.message}
                                    {...register('password_confirmation', { 
                                        validate: (val) => !watch('password') || val === watch('password') || "No coinciden"
                                    })} 
                                />
                            </div>
                        ) : (
                            <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Lock className="w-4 h-4 text-gray-400" />
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contraseña</span>
                                </div>
                                <span className="text-xs font-black text-gray-900 dark:text-white">********</span>
                            </div>
                        )}
                    </div>

                    {/* Contacto Emergencia */}
                    <div className="bg-red-500/5 border border-red-500/10 rounded-3xl p-6 md:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-500/10 rounded-xl text-red-500">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight h-min leading-none mt-1">Emergencia</h3>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    disabled={!editMode}
                                    {...register('has_emergency_contact')} 
                                    className="sr-only peer" 
                                />
                                <div className="w-10 h-5 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-[12px] after:w-[12px] after:transition-all peer-checked:bg-red-500"></div>
                            </label>
                        </div>

                        <div className="space-y-4">
                            <Input 
                                label="Nombre de Contacto" 
                                disabled={!editMode || !hasEmergencyContact}
                                onInput={filterLetters}
                                className={!editMode && "border-transparent bg-transparent pl-0 text-lg"}
                                {...register('contacto_nombre', { required: hasEmergencyContact })} 
                            />
                            <Input 
                                label="Celular de Contacto" 
                                disabled={!editMode || !hasEmergencyContact}
                                onInput={filterNumbers}
                                className={!editMode && "border-transparent bg-transparent pl-0 text-lg"}
                                {...register('contacto_celular', { required: hasEmergencyContact })} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
