import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import api from '../../api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import MapPicker from '../ui/MapPicker';
import SmartDateInput from '../ui/SmartDateInput';
import { 
    X, User, MapPin, Calendar, Smartphone, 
    Fingerprint, Home, Phone, ShieldCheck, 
    MessageCircle, AlertCircle, Save, Lock, Eye, EyeOff
} from 'lucide-react';
import { clsx } from 'clsx';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export default function CompleteProfileModal({ isOpen, user }) {
    const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm({
        defaultValues: {
            nombres: user?.miembro?.nombres || '',
            apellidos: user?.miembro?.apellidos || '',
            ci: user?.miembro?.ci || '',
            celular: user?.miembro?.celular === '0' ? '' : (user?.miembro?.celular || ''),
            has_emergency_contact: false,
            latitud: null,
            longitud: null
        }
    });

    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const { notify } = useToast();
    const { updateUser } = useAuth();

    const hasEmergencyContact = watch('has_emergency_contact');

    // Filters (Same as MiembroModal)
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

    const filterCI = (e) => {
        let value = e.target.value.toUpperCase();
        const hasHyphen = value.includes('-');
        if (hasHyphen) {
            const parts = value.split('-');
            let numericPart = parts[0].replace(/[^0-9]/g, '').slice(0, 10);
            let letterPart = (parts[1] || '').replace(/[^A-Z]/g, '').slice(0, 1);
            e.target.value = numericPart.length >= 5 ? (letterPart ? `${numericPart}-${letterPart}` : `${numericPart}-`) : numericPart;
        } else {
            e.target.value = value.replace(/[^0-9]/g, '').slice(0, 10);
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const res = await api.post('/complete-profile', data);
            notify("¡Perfil configurado con éxito!", "success");
            updateUser(res.data.user);
        } catch (error) {
            console.error(error);
            notify(error.response?.data?.message || "Error al configurar perfil", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-6 bg-gray-900/90 dark:bg-surface-base/95 backdrop-blur-xl transition-all">
            <div className="relative w-full max-w-5xl h-full md:h-auto max-h-[100vh] md:max-h-[90vh] overflow-y-auto bg-surface-card md:border md:border-surface-border md:rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,0.8)] custom-scrollbar text-gray-900 dark:text-gray-100 transition-colors">
                
                {/* Header Centered */}
                <div className="p-8 md:p-12 text-center space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/20 rotate-3">
                        <ShieldCheck className="w-10 h-10 text-white" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight uppercase italic transition-colors">¡Bienvenido Director!</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs transition-colors">Completa tu perfil oficial para comenzar a gestionar tu banda</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="px-6 md:px-16 pb-16 space-y-12">
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Left Column: Essential Info */}
                        <div className="space-y-10">
                            <div className="space-y-6">
                                <h3 className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-3 transition-colors">
                                    <User className="w-4 h-4" /> Datos Personales
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <Input 
                                        label="Nombres" 
                                        placeholder="EJ. JUAN" 
                                        onInput={filterLetters}
                                        error={errors.nombres?.message}
                                        {...register('nombres', { required: "Obligatorio" })} 
                                        className="text-gray-900 dark:text-white"
                                    />
                                    <Input 
                                        label="Apellidos" 
                                        placeholder="EJ. PEREZ" 
                                        onInput={filterLetters}
                                        error={errors.apellidos?.message}
                                        {...register('apellidos', { required: "Obligatorio" })} 
                                        className="text-gray-900 dark:text-white"
                                    />
                                    <Input 
                                        label="CI" 
                                        placeholder="1234567" 
                                        onInput={filterCI}
                                        error={errors.ci?.message}
                                        {...register('ci', { required: "Obligatorio" })} 
                                        className="text-gray-900 dark:text-white"
                                    />
                                    <Input 
                                        label="Celular" 
                                        placeholder="7XXXXXXX" 
                                        onInput={filterNumbers}
                                        error={errors.celular?.message}
                                        {...register('celular', { required: "Obligatorio" })} 
                                        className="text-gray-900 dark:text-white"
                                    />
                                </div>
                                <Controller
                                    name="fecha"
                                    control={control}
                                    render={({ field }) => (
                                        <SmartDateInput 
                                            label="Fecha de Nacimiento"
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={errors.fecha?.message}
                                            className="text-gray-900 dark:text-white"
                                        />
                                    )}
                                />
                            </div>

                            {/* Solo pedir contraseña si NO se ha cambiado aún */}
                            {!user?.password_changed && (
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest flex items-center gap-3">
                                        <Lock className="w-4 h-4" /> Seguridad (Cambio Obligatorio)
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="relative">
                                            <Input 
                                                label="Nueva Contraseña" 
                                                type={showPass ? "text" : "password"}
                                                placeholder="********" 
                                                error={errors.password?.message}
                                                {...register('password', { 
                                                    required: "Obligatorio", 
                                                    minLength: { value: 8, message: "Mínimo 8 caracteres" } 
                                                })} 
                                                className="text-gray-900 dark:text-white"
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => setShowPass(!showPass)}
                                                className="absolute right-4 top-[42px] text-gray-500 dark:text-gray-400 transition-colors"
                                            >
                                                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        <Input 
                                            label="Confirmar" 
                                            type={showPass ? "text" : "password"}
                                            placeholder="********" 
                                            error={errors.password_confirmation?.message}
                                            {...register('password_confirmation', { 
                                                required: "Obligatorio",
                                                validate: (val) => val === watch('password') || "No coinciden"
                                            })} 
                                            className="text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest italic transition-colors">Por seguridad, debes establecer una contraseña personal.</p>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Location & Emergency */}
                        <div className="space-y-10">
                            <div className="space-y-6">
                                <h3 className="text-sm font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-3 transition-colors">
                                    <MapPin className="w-4 h-4" /> Ubicación de Vivienda
                                </h3>
                                <div className="h-48 rounded-3xl overflow-hidden border border-surface-border grayscale hover:grayscale-0 transition-all">
                                    <MapPicker 
                                        onChange={(coords) => {
                                            setValue('latitud', coords.lat);
                                            setValue('longitud', coords.lng);
                                        }}
                                    />
                                </div>
                                <Input 
                                    label="Dirección Detallada" 
                                    type="textarea"
                                    placeholder="ZONA, CALLE, NÚMERO..." 
                                    {...register('direccion')} 
                                />
                            </div>

                            <div className="p-6 bg-red-500/5 rounded-[32px] border border-red-500/10 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-black text-red-500 uppercase tracking-widest flex items-center gap-3">
                                        <AlertCircle className="w-4 h-4" /> Contacto de Emergencia
                                    </h3>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" {...register('has_emergency_contact')} className="sr-only peer" />
                                        <div className="w-10 h-5 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-[12px] after:w-[12px] after:transition-all peer-checked:bg-red-600"></div>
                                    </label>
                                </div>

                                {hasEmergencyContact && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-4 duration-300">
                                        <Input 
                                            label="Nombre Contacto" 
                                            onInput={filterLetters}
                                            {...register('contacto_nombre', { required: hasEmergencyContact })} 
                                        />
                                        <Input 
                                            label="Celular" 
                                            onInput={filterNumbers}
                                            {...register('contacto_celular', { required: hasEmergencyContact })} 
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-surface-border flex justify-center">
                        <Button 
                            type="submit" 
                            loading={loading} 
                            className="w-full md:w-auto px-20 py-6 rounded-2xl text-lg font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30"
                            variant="monster"
                        >
                            <Save className="mr-3" /> Finalizar Configuración
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
