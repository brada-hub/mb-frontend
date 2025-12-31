import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import { Lock, Save, ShieldAlert } from 'lucide-react';

export default function ForcePasswordChangeModal() {
    const { user, updateUser } = useAuth();
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Solo mostramos si el usuario está autenticado y no ha cambiado su contraseña
    if (!user || user.password_changed) return null;

    const onSubmit = async (data) => {
        setLoading(true);
        setErrorMsg('');
        try {
            await api.post('/change-password', {
                password: data.password,
                password_confirmation: data.confirmPassword
            });
            updateUser({ password_changed: true });
        } catch (error) {
            setErrorMsg(error.response?.data?.message || 'Error al actualizar contraseña');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#0f111a]/95 backdrop-blur-xl">
            <div className="w-full max-w-md p-8 bg-[#161b2c] border border-white/10 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300">
                
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 mb-6">
                        <ShieldAlert className="w-8 h-8 text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Cambio de Contraseña Obligatorio</h2>
                    <p className="text-gray-400 text-sm leading-relaxed px-4">
                        Por seguridad, debes actualizar tu contraseña inicial antes de continuar.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {errorMsg && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-medium">
                            {errorMsg}
                        </div>
                    )}

                    <div className="space-y-4">
                        <Input 
                            label="Nueva Contraseña"
                            type="password"
                            icon={Lock}
                            placeholder="Mínimo 8 caracteres"
                            {...register('password', { 
                                required: "La contraseña es requerida",
                                minLength: { value: 8, message: "Mínimo 8 caracteres" }
                            })}
                            error={errors.password?.message}
                        />

                        <Input 
                            label="Confirmar Nueva Contraseña"
                            type="password"
                            icon={Lock}
                            placeholder="Repite la contraseña"
                            {...register('confirmPassword', { 
                                required: "Confirma tu contraseña",
                                validate: (val) => {
                                    if (watch('password') !== val) {
                                        return "Las contraseñas no coinciden";
                                    }
                                }
                            })}
                            error={errors.confirmPassword?.message}
                        />
                    </div>

                    <Button 
                        type="submit" 
                        loading={loading} 
                        className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-amber-600/20 transition-all"
                    >
                        <Save className="w-5 h-5 mr-3" />
                        Actualizar y Continuar
                    </Button>
                </form>

                <p className="mt-8 text-center text-[10px] text-gray-600 uppercase tracking-widest font-bold">
                    Panel de Seguridad Monster Band
                </p>
            </div>
        </div>
    );
}
