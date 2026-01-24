import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Lock, User } from 'lucide-react';
import logoSimba from '../../assets/logo_simba.png';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const onSubmit = async (data) => {
        setIsLoading(true);
        setErrorMsg('');
        const res = await login(data.user, data.password);
        if (res.success) {
            navigate('/dashboard');
        } else {
            setErrorMsg(res.message);
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#0f111a] relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
            </div>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md p-8 md:p-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl animate-fade-in-up">
                
                <div className="text-center mb-10">
                    <img src={logoSimba} alt="SIMBA" className="mx-auto w-24 h-24 object-contain mb-6 drop-shadow-2xl" />
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">SIMBA OS</h1>
                    <p className="text-gray-400">Sistema de Gestión para Bandas</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {errorMsg && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                            {errorMsg}
                        </div>
                    )}

                    <div className="space-y-4">
                        <Input 
                            icon={User}
                            placeholder="Usuario" 
                            autoComplete="username"
                            {...register('user', { required: 'El usuario es requerido' })}
                            error={errors.user?.message}
                        />
                        <Input 
                            icon={Lock}
                            type="password" 
                            placeholder="Contraseña" 
                            autoComplete="current-password"
                            {...register('password', { required: 'La contraseña es requerida' })}
                            error={errors.password?.message}
                        />
                    </div>

                    <Button 
                        type="submit" 
                        loading={isLoading} 
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600"
                    >
                        Iniciar Sesión
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-500">
                        © 2025 SIMBA OS. Gestión Operativa Musical.
                    </p>
                </div>
            </div>
        </div>
    );
}
