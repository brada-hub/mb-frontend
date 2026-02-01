import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Lock, User as UserIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import logoSimba from '../../assets/logo_simba.png';
import logoMB from '../../assets/logo_mb.png';
import api from '../../api/axios';

export default function LoginPage() {
    const { bandSlug } = useParams();
    const { login } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [branding, setBranding] = useState(null);
    const [brandingLoading, setBrandingLoading] = useState(true);

    useEffect(() => {
        const root = document.documentElement;
        const effectiveSlug = bandSlug || 'monster';
        
        const fetchBranding = async () => {
            setBrandingLoading(true);
            try {
                const res = await api.get(`/branding/${effectiveSlug}`);
                const data = res.data;
                setBranding(data);
                
                if (data.color_primario) root.style.setProperty('--brand-primary', data.color_primario);
                if (data.color_secundario) root.style.setProperty('--brand-secondary', data.color_secundario);

                if (data.logo) {
                    let link = document.querySelector("link[rel~='icon']");
                    if (!link) {
                        link = document.createElement('link');
                        link.rel = 'icon';
                        document.getElementsByTagName('head')[0].appendChild(link);
                    }
                    link.href = data.logo;
                }
            } catch (err) {
                console.error('Error loading custom branding:', err);
                if (!bandSlug) {
                    setBranding(null);
                    root.style.setProperty('--brand-primary', '#00f2fe');
                    root.style.setProperty('--brand-secondary', '#0d0f17');
                }
            } finally {
                setBrandingLoading(false);
            }
        };

        fetchBranding();
    }, [bandSlug]);

    const onSubmit = async (data) => {
        setIsLoading(true);
        setErrorMsg('');
        const res = await login(data.user, data.password, bandSlug);
        if (res.success) {
            navigate('/dashboard');
        } else {
            setErrorMsg(res.message);
        }
        setIsLoading(false);
    };

    // Estilos dinámicos
    const primaryColor = branding?.color_primario || '#00f2fe';
    const logo = branding?.logo || logoMB;
    const bandName = branding?.nombre || 'MONSTER BAND';
    const isCustom = !!branding;

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#05060a] relative overflow-hidden transition-colors duration-700">
            {/* Capas de Fondo con colores de Monster Band (Cian/Aguamarina) */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(0,242,254,0.05)_0%,_transparent_50%)]" />
                
                {/* Orbe Cian - Monster Color */}
                <motion.div 
                    animate={{ 
                        scale: [1, 1.05, 1],
                        opacity: [0.15, 0.25, 0.15],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full blur-[80px] bg-[#00f2fe]/15 will-change-transform" 
                />

                {/* Orbe profundo */}
                <motion.div 
                    animate={{ 
                        scale: [1.05, 1, 1.05],
                        opacity: [0.1, 0.15, 0.1],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[-10%] left-[-5%] w-[350px] h-[350px] rounded-full blur-[70px] bg-indigo-900/20 will-change-transform" 
                />
            </div>

            {/* Contenedor Compacto (No estirado) */}
            <div className={clsx(
                "relative z-10 w-full max-w-[420px] px-6 transition-all duration-1000",
                brandingLoading ? "opacity-0 translate-y-4 scale-95" : "opacity-100 translate-y-0 scale-100"
            )}>
                {/* Tarjeta Glassmorphism Refinada */}
                <div className="relative group">
                    {/* Brillo perimetral Aguamarina */}
                    <div 
                        className="absolute -inset-[1px] rounded-[3rem] opacity-20 group-hover:opacity-50 transition-all duration-500 blur-[2px]"
                        style={{ backgroundColor: '#00f2fe' }}
                    />
                    
                    <div className="relative bg-[#0d0f17]/90 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-6 md:p-10 shadow-2xl">
                        
                        {/* Header Compacto */}
                        <div className="text-center mb-5 md:mb-6">
                            <div className="relative inline-block mb-2 md:mb-3">
                                <div 
                                    className="absolute inset-0 blur-3xl opacity-30 animate-pulse bg-[#00f2fe]"
                                />
                                <img 
                                    src={logo} 
                                    alt={bandName} 
                                    className="relative w-24 h-24 md:w-36 md:h-36 object-contain drop-shadow-[0_0_20px_rgba(0,242,254,0.3)]" 
                                />
                            </div>
                            
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter mb-1 uppercase italic bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                                {bandName}
                            </h1>
                            <div className="flex items-center justify-center gap-2">
                                <div className="h-[1px] w-4 bg-[#00f2fe]/30" />
                                <span className="text-[9px] font-black text-[#00f2fe] uppercase tracking-[0.4em]">PORTAL MIEMBROS</span>
                                <div className="h-[1px] w-4 bg-[#00f2fe]/30" />
                            </div>
                        </div>

                        {/* Formulario con campos más compactos */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {errorMsg && (
                                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold text-center animate-shake">
                                    {errorMsg}
                                </div>
                            )}

                            <div className="space-y-3">
                                <Input 
                                    icon={UserIcon}
                                    placeholder="Usuario" 
                                    className="bg-white/[0.03] border-white/10 h-11 rounded-xl md:rounded-2xl focus:border-[#00f2fe]/50 focus:ring-1 focus:ring-[#00f2fe]/20 transition-all text-xs font-bold"
                                    {...register('user', { required: 'Requerido' })}
                                    error={errors.user?.message}
                                />
                                <Input 
                                    icon={Lock}
                                    type="password" 
                                    placeholder="Contraseña" 
                                    className="bg-white/[0.03] border-white/10 h-11 rounded-xl md:rounded-2xl focus:border-[#00f2fe]/50 focus:ring-1 focus:ring-[#00f2fe]/20 transition-all text-xs font-bold"
                                    {...register('password', { required: 'Requerido' })}
                                    error={errors.password?.message}
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full h-11 md:h-12 bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-black font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] rounded-xl md:rounded-2xl hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-[0_10px_20px_-5px_rgba(0,242,254,0.4)] flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                ) : (
                                    "Iniciar Sesión"
                                )}
                            </button>
                        </form>

                        {/* Link de Ayuda / Soporte */}
                        <div className="mt-4 md:mt-5 text-center">
                            <a 
                                href="https://wa.me/59167544099?text=Hola!%20Tengo%20problemas%20para%20ingresar%20al%20portal%20de%20Monster%20Band." 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="group/wa inline-flex flex-col items-center gap-1 transition-all"
                            >
                                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">¿Tienes problemas?</span>
                                <span className="text-[10px] text-[#00f2fe] font-black uppercase tracking-widest decoration-[#00f2fe]/30 group-hover/wa:underline">
                                    Contáctate con nosotros
                                </span>
                            </a>
                        </div>

                        {/* Footer Minimalista */}
                        <div className="mt-5 md:mt-6 pt-4 md:pt-5 border-t border-white/5 text-center">
                            <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">
                                © 2026 MONSTER BAND • SIMBA OS ENGINE
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
