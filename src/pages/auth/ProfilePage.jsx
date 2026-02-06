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
    AlertCircle, Camera, Layout, Key, Music2,
    ChevronRight, Map as MapIcon, Info
} from 'lucide-react';
import { clsx } from 'clsx';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

function PasswordChangeSection() {
    const { notify } = useToast();
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await api.post('/update-password', data);
            notify("¡Contraseña actualizada correctamente!", "success");
            reset();
            setIsOpen(false);
        } catch (error) {
            notify(error.response?.data?.message || "Error al cambiar contraseña", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-surface-card/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffbe0b]/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-[#ffbe0b]/20 transition-colors duration-700" />
            
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#ffbe0b]/10 rounded-2xl text-[#ffbe0b]">
                        <Key className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">Acceso</h3>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest opacity-60">Seguridad de la cuenta</p>
                    </div>
                </div>
                {!isOpen && (
                    <Button 
                        onClick={() => setIsOpen(true)}
                        className="bg-[#ffbe0b] hover:bg-[#e0a800] text-black font-black uppercase tracking-widest text-[9px] px-4 h-9 rounded-xl shadow-lg shadow-[#ffbe0b]/20"
                    >
                        Cambiar
                    </Button>
                )}
            </div>

            <AnimatePresence>
                {isOpen ? (
                    <motion.form 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4 overflow-hidden relative z-10"
                    >
                        <div className="relative">
                            <Input 
                                label="Contraseña Actual" 
                                type={showPass ? "text" : "password"}
                                placeholder="••••••••" 
                                error={errors.current_password?.message}
                                {...register('current_password', { required: "Obligatorio" })} 
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-4 top-[38px] text-gray-400 hover:text-[#bc1b1b] transition-colors"
                            >
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        
                        <div className="pt-2 border-t border-white/5 flex flex-col gap-4">
                            <Input 
                                label="Nueva Contraseña" 
                                type={showPass ? "text" : "password"}
                                placeholder="Mínimo 8 caracteres" 
                                error={errors.password?.message}
                                {...register('password', { 
                                    required: "Obligatorio",
                                    minLength: { value: 8, message: "Muy corta (min 8)" }
                                })} 
                            />
                            <Input 
                                label="Confirmar Nueva" 
                                type={showPass ? "text" : "password"}
                                placeholder="Repite la contraseña" 
                                error={errors.password_confirmation?.message}
                                {...register('password_confirmation', { 
                                    required: "Obligatorio",
                                    validate: (val) => val === watch('password') || "No coinciden"
                                })} 
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                             <Button 
                                type="button"
                                onClick={() => { setIsOpen(false); reset(); }}
                                className="flex-1 bg-white/5 text-gray-400 font-black uppercase tracking-widest text-[9px] h-11 rounded-xl"
                            >
                                Cancelar
                            </Button>
                            <Button 
                                loading={loading}
                                className="flex-1 bg-[#ffbe0b] hover:bg-[#e0a800] text-black font-black uppercase tracking-widest text-[9px] h-11 rounded-xl shadow-xl shadow-[#ffbe0b]/20"
                            >
                                Actualizar
                            </Button>
                        </div>
                    </motion.form>
                ) : (
                    <div className="p-4 bg-white/5 rounded-2xl flex items-center justify-between border border-white/5">
                        <div className="flex items-center gap-3">
                            <Lock className="w-4 h-4 text-gray-500" />
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Contraseña</span>
                        </div>
                        <span className="text-[10px] font-black text-gray-900 dark:text-white tracking-[0.2em]">••••••••</span>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function ProfilePage() {
    const { user, updateUser } = useAuth();
    const { notify } = useToast();
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const canEditView = ['DIRECTOR', 'ADMINISTRADOR'].includes(user?.miembro?.rol?.rol?.toUpperCase());

    const { register, handleSubmit, watch, setValue, control, reset, formState: { errors } } = useForm({
        defaultValues: {
            nombres: user?.miembro?.nombres || '',
            apellidos: user?.miembro?.apellidos || '',
            ci: user?.miembro?.ci || '',
            celular: user?.miembro?.celular === '0' ? '' : (user?.miembro?.celular || ''),
            direccion: user?.miembro?.direccion || '',
            fecha: user?.miembro?.fecha ? user.miembro.fecha : user?.miembro?.fecha_nacimiento || '',
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
                fecha: user.miembro.fecha ? user.miembro.fecha : user.miembro.fecha_nacimiento || '',
                has_emergency_contact: !!user.miembro.contacto_emergencia_nombre,
                contacto_nombre: user.miembro.contacto_emergencia_nombre || '',
                contacto_celular: user.miembro.contacto_emergencia_celular || '',
                latitud: user.miembro.latitud || null,
                longitud: user.miembro.longitud || null
            });
        }
    }, [user, reset]);

    const hasEmergencyContact = watch('has_emergency_contact');

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
            const res = await api.post('/complete-profile', data);
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
        <div className="max-w-6xl mx-auto pb-20 px-4 md:px-6 space-y-8 animate-in fade-in duration-700">
            {/* New Header Section */}
            <div className="relative group">
                <div className="h-44 md:h-64 rounded-[2.5rem] overflow-hidden relative shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#bc1b1b] via-[#000000] to-[#991b1b] animate-gradient-slow shadow-inner" />
                    <div className="absolute inset-0 bg-[url('/patterns/topography.svg')] opacity-[0.03]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    {/* Header Controls */}
                    <div className="absolute top-6 right-6 flex gap-2">
                        {canEditView && (
                            !editMode ? (
                                <button 
                                    onClick={() => setEditMode(true)}
                                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-2xl transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <User className="w-4 h-4" /> <span>Editar Información</span>
                                </button>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => { setEditMode(false); reset(); }}
                                        className="bg-[#bc1b1b]/20 hover:bg-[#bc1b1b]/30 text-white border border-[#bc1b1b]/30 font-black uppercase tracking-widest text-[10px] h-10 px-5 rounded-2xl transition-all flex items-center gap-2"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        onClick={handleSubmit(onSubmit)}
                                        disabled={loading}
                                        className="bg-[#bc1b1b] hover:bg-[#991b1b] text-white font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-2xl shadow-xl shadow-[#bc1b1b]/30 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" /> <span>{loading ? 'Guardando...' : 'Guardar'}</span>
                                    </button>
                                </>
                            )
                        )}
                    </div>
                </div>

                {/* Profile Identity Card */}
                <div className="relative -mt-16 md:-mt-20 px-6 md:px-12 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
                    <div className="relative group/avatar">
                        <div className="w-32 h-32 md:w-44 md:h-44 rounded-[3rem] bg-[#bc1b1b] p-1 shadow-2xl ring-8 ring-black/40 overflow-hidden transform transition-all duration-500 group-hover/avatar:scale-105 group-hover/avatar:rotate-2">
                             {user?.miembro?.foto ? (
                                <img src={user.miembro.foto} alt="Profile" className="w-full h-full object-cover rounded-[2.8rem]" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#bc1b1b] to-[#ffbe0b] flex items-center justify-center text-5xl font-black text-white rounded-[2.8rem]">
                                    {user?.miembro?.nombres?.charAt(0)}
                                </div>
                            )}
                        </div>
                        {editMode && canEditView && (
                            <button className="absolute bottom-1 right-1 p-3 bg-[#bc1b1b] text-white rounded-2xl shadow-2xl hover:scale-110 active:scale-90 transition-all border-4 border-black/20">
                                <Camera className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    <div className="text-center md:text-left pb-4 space-y-3">
                        <div className="space-y-1">
                            <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter drop-shadow-2xl">
                                {user?.miembro?.nombres} <span className="text-[#ffbe0b]">{user?.miembro?.apellidos}</span>
                            </h1>
                            <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px]">Información de la cuenta</p>
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <span className="px-4 py-1.5 bg-[#bc1b1b]/20 backdrop-blur-md rounded-full text-[10px] font-black text-[#bc1b1b] border border-[#bc1b1b]/20 uppercase tracking-widest shadow-lg">
                                {user?.miembro?.rol?.rol || 'Miembro'}
                            </span>
                            <span className="px-4 py-1.5 bg-white/5 backdrop-blur-md rounded-full text-[10px] font-black text-gray-300 border border-white/5 uppercase tracking-widest shadow-lg">
                                {user?.miembro?.instrumento?.instrumento || 'Sin instrumento'}
                            </span>
                            {user?.miembro?.categoria && (
                                <span className="px-4 py-1.5 bg-emerald-500/20 backdrop-blur-md rounded-full text-[10px] font-black text-emerald-300 border border-emerald-500/20 uppercase tracking-widest shadow-lg">
                                    CAT. {user.miembro.categoria.categoria}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: Smartphone, label: 'Celular', value: user?.miembro?.celular || '---', color: 'red' },
                    { icon: Music2, label: 'Instrumento', value: user?.miembro?.instrumento?.instrumento || 'No asignado', color: 'gold' },
                    { icon: Calendar, label: 'Nacimiento', value: user?.miembro?.fecha ? new Date(user.miembro.fecha).toLocaleDateString() : '---', color: 'gray' },
                    { icon: Layout, label: 'Categoría', value: user?.miembro?.categoria?.categoria || 'ESTÁNDAR', color: 'emerald' }
                ].map((item, i) => (
                    <div key={i} className="bg-surface-card/40 backdrop-blur-xl border border-white/5 p-5 rounded-3xl shadow-xl flex flex-col items-center text-center group hover:-translate-y-1 transition-all duration-300">
                        <div className={clsx("p-3 rounded-2xl mb-3 shadow-lg transition-transform group-hover:scale-110", {
                            'bg-[#bc1b1b]/10 text-[#bc1b1b]': item.color === 'red',
                            'bg-[#ffbe0b]/10 text-[#ffbe0b]': item.color === 'gold',
                            'bg-gray-500/10 text-gray-500': item.color === 'gray',
                            'bg-emerald-500/10 text-emerald-500': item.color === 'emerald'
                        })}>
                            <item.icon className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-black text-gray-500 shadow-xl uppercase tracking-[0.2em] mb-1">{item.label}</span>
                        <span className="text-xs font-black text-gray-900 dark:text-white uppercase truncate w-full">{item.value}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    {/* Datos Personales */}
                    <div className="bg-surface-card border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl backdrop-blur-md">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#bc1b1b]/5 blur-3xl rounded-full -mr-32 -mt-32" />
                        
                        <div className="flex items-center gap-4 mb-10 relative">
                            <div className="p-3 bg-[#bc1b1b]/10 rounded-2xl text-[#bc1b1b] shadow-inner">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Información Personal</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest opacity-60">Datos biográficos y de contacto</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <Input label="Nombres" disabled={!editMode} onInput={filterLetters} error={errors.nombres?.message} {...register('nombres', { required: "Obligatorio" })} className="bg-white/5 border-white/10" />
                            <Input label="Apellidos" disabled={!editMode} onInput={filterLetters} error={errors.apellidos?.message} {...register('apellidos', { required: "Obligatorio" })} className="bg-white/5 border-white/10" />
                            <Input label="CI / Identidad" disabled={!editMode} error={errors.ci?.message} {...register('ci', { required: "Obligatorio" })} className="bg-white/5 border-white/10" />
                            
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Fecha de Nacimiento</label>
                                {editMode ? (
                                    <Controller
                                        name="fecha"
                                        control={control}
                                        render={({ field }) => <SmartDateInput value={field.value} onChange={field.onChange} error={errors.fecha?.message} />}
                                    />
                                ) : (
                                    <div className="w-full h-12 px-5 flex items-center bg-white/5 border border-white/10 rounded-2xl text-gray-400 text-sm font-black uppercase tracking-wider">
                                        {watch('fecha') ? new Date(watch('fecha')).toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' }) : 'No definida'}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-10 pt-10 border-t border-white/5 relative z-10">
                             <div className="max-w-sm">
                                <Input icon={Smartphone} label="Celular de Enlace" disabled={!editMode} onInput={filterNumbers} error={errors.celular?.message} {...register('celular', { required: "Obligatorio" })} className="bg-white/5 border-white/10" />
                             </div>
                        </div>
                    </div>

                    {/* Georreferencia */}
                    <div className="bg-surface-card border border-white/5 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-md group">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 shadow-inner">
                                <MapIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Ubicación</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest opacity-60">Residencia actual declarada</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className={clsx(
                                "h-80 rounded-[2rem] overflow-hidden border-4 border-white/5 transition-all duration-700 shadow-2xl relative",
                                !editMode && "grayscale brightness-50"
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
                                {!editMode && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="bg-black/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-2xl">
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Bloqueada / Solo Lectura</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <Input 
                                label="Dirección y Referencia" 
                                type="textarea"
                                disabled={!editMode}
                                placeholder="ZONA, CALLE, NÚMERO DE CASA, Y REFERENCIAS (EJ. PORTÓN BLANCO)..." 
                                className="uppercase font-bold bg-white/5 border-white/10"
                                {...register('direccion')} 
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-8 lg:sticky lg:top-8">
                    {/* Sección Acceso */}
                    <PasswordChangeSection />

                    {/* Contacto de Emergencia */}
                    <div className="bg-[#bc1b1b]/5 border border-[#bc1b1b]/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-[#bc1b1b]/5 blur-3xl rounded-full -ml-16 -mt-16 group-hover:bg-[#bc1b1b]/10 transition-colors duration-700" />
                        
                        <div className="flex items-center justify-between mb-10 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-[#bc1b1b]/10 rounded-2xl text-[#bc1b1b] shadow-inner">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">S.O.S</h3>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest opacity-60">Emergencia</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    disabled={!editMode}
                                    {...register('has_emergency_contact')} 
                                    className="sr-only peer" 
                                />
                                <div className="w-12 h-6 bg-white/5 border border-white/10 rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#bc1b1b] transition-colors shadow-inner"></div>
                            </label>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <Input 
                                label="Nombre de Contacto" 
                                disabled={!editMode || !hasEmergencyContact}
                                onInput={filterLetters}
                                className={clsx("uppercase font-black bg-white/5 border-white/10", !editMode && "border-transparent bg-transparent pl-0 text-xl text-[#bc1b1b]")}
                                {...register('contacto_nombre', { required: hasEmergencyContact })} 
                            />
                            <Input 
                                label="Celular de Contacto" 
                                disabled={!editMode || !hasEmergencyContact}
                                onInput={filterNumbers}
                                className={clsx("font-black bg-white/5 border-white/10", !editMode && "border-transparent bg-transparent pl-0 text-xl text-[#bc1b1b]")}
                                {...register('contacto_celular', { required: hasEmergencyContact })} 
                            />
                        </div>
                    </div>

                    {/* Footer removido */}
                </div>
            </div>
        </div>
    );
}
