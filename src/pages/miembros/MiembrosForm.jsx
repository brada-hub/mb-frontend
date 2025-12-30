import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ChevronRight, Save, User, Map, Music, Smartphone, Shield } from 'lucide-react';
import { clsx } from 'clsx';

export default function MiembrosForm() {
    const navigate = useNavigate();
    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            create_user: true
        }
    });
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    // Catalogs
    const [catalogs, setCatalogs] = useState({ roles: [], secciones: [], categorias: [] });

    useEffect(() => {
        // Fetch catalogs from sync endpoint or separate endpoints
        api.post('/sync/master-data') 
           .then(res => setCatalogs(res.data))
           .catch(err => console.error("Error loading catalogs", err));
           // Mocking catalogs if endpoint fails for demo
           // setCatalogs({ 
           //     roles: [{id_rol: 1, rol: 'Músico'}, {id_rol: 2, rol: 'Director'}], 
           //     secciones: [{id_seccion: 1, seccion: 'Trompetas'}],
           //     categorias: [{id_categoria: 1, nombre_categoria: 'A'}]
           // });
    }, []);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await api.post('/miembros', data);
            navigate('/dashboard/miembros');
        } catch (error) {
            console.error(error);
            alert("Error al guardar: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { id: 1, title: 'Datos Personales', icon: User },
        { id: 2, title: 'Ubicación', icon: Map },
        { id: 3, title: 'Operativo', icon: Music },
        { id: 4, title: 'Usuario', icon: Shield },
    ];

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-6">Registrar Nuevo Miembro</h1>
            
            {/* Stepper */}
            <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4">
                {steps.map((s, idx) => (
                    <div key={s.id} className="flex items-center gap-2 min-w-max cursor-pointer" onClick={() => setStep(s.id)}>
                        <div className={clsx(
                            "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all",
                            step === s.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : 
                            step > s.id ? "bg-green-500/20 text-green-400 border border-green-500/30" : 
                            "bg-white/5 text-gray-500 border border-white/5"
                        )}>
                            <s.icon className="w-5 h-5" />
                        </div>
                        <span className={clsx("font-medium", step === s.id ? "text-white" : "text-gray-500")}>
                            {s.title}
                        </span>
                        {idx < steps.length - 1 && <div className="w-12 h-[1px] bg-white/10 mx-2 hidden sm:block" />}
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-[#161b2c] border border-white/5 rounded-2xl p-8">
                
                {/* Step 1: Personal */}
                {step === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
                        <Input label="Nombres" placeholder="Nombres" {...register('nombres', { required: true })} />
                        <Input label="Apellidos" placeholder="Apellidos" {...register('apellidos', { required: true })} />
                        <Input label="Cédula (CI)" placeholder="Ej. 1234567" {...register('ci', { required: true })} />
                        <Input label="Celular" placeholder="77777777" type="number" {...register('celular', { required: true })} />
                        <Input label="Fecha Nac." type="date" {...register('fecha')} />
                    </div>
                )}

                {/* Step 2: Ubicación */}
                {step === 2 && (
                    <div className="space-y-6 animate-fade-in-up">
                        <Input label="Dirección Domiciliaria" placeholder="Zona, Calle, Número..." {...register('direccion')} />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Latitud" placeholder="-16.5000" {...register('latitud')} />
                            <Input label="Longitud" placeholder="-68.1500" {...register('longitud')} />
                        </div>
                        <div className="bg-white/5 rounded-xl h-64 flex items-center justify-center border border-white/10 border-dashed text-gray-500">
                            <Map className="w-8 h-8 opacity-50 mb-2" />
                            <span className="text-sm block">Mapa de Lealtad (Clic para marcar)</span>
                        </div>
                    </div>
                )}

                {/* Step 3: Operativo */}
                {step === 3 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
                         {/* Selects need custom UI styling but using native for speed */}
                         <div className="space-y-1">
                            <label className="text-sm text-gray-400">Sección</label>
                            <select {...register('id_seccion', { required: true })} className="w-full bg-black/20 border border-white/10 rounded-xl h-12 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                                <option value="">Seleccionar Sección</option>
                                {catalogs.secciones?.map(s => <option key={s.id_seccion} value={s.id_seccion} className="text-black">{s.seccion}</option>)}
                            </select>
                         </div>
                         <div className="space-y-1">
                            <label className="text-sm text-gray-400">Categoría</label>
                            <select {...register('id_categoria', { required: true })} className="w-full bg-black/20 border border-white/10 rounded-xl h-12 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                                <option value="">Seleccionar Categoría</option>
                                {catalogs.categorias?.map(c => <option key={c.id_categoria} value={c.id_categoria} className="text-black">{c.nombre_categoria}</option>)}
                            </select>
                         </div>
                         <div className="space-y-1">
                            <label className="text-sm text-gray-400">Rol Sistema</label>
                            <select {...register('id_rol', { required: true })} className="w-full bg-black/20 border border-white/10 rounded-xl h-12 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                                <option value="">Seleccionar Rol</option>
                                {catalogs.roles?.map(r => <option key={r.id_rol} value={r.id_rol} className="text-black">{r.rol}</option>)}
                            </select>
                         </div>
                    </div>
                )}

                {/* Step 4: User & Contact */}
                {step === 4 && (
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="border border-indigo-500/30 bg-indigo-500/5 rounded-xl p-6">
                            <h3 className="text-white font-bold mb-4 flex items-center"><Smartphone className="w-5 h-5 mr-2 text-indigo-400"/> Usuario de App</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Username" placeholder="Nombre Usuario" {...register('username')} />
                                <Input label="Password" type="password" placeholder="Contraseña" {...register('password')} />
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-600 bg-transparent text-indigo-600 focus:ring-indigo-500" {...register('create_user')} />
                                <span className="text-sm text-gray-300">Crear usuario automáticamente</span>
                            </div>
                        </div>

                        <div className="border border-white/5 bg-white/5 rounded-xl p-6">
                            <h3 className="text-white font-bold mb-4">Contacto Emergencia (Opcional)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input placeholder="Nombres Apellidos" {...register('contacto_nombre')} />
                                <Input placeholder="Parentesco" {...register('contacto_parentesco')} />
                                <Input placeholder="Celular" type="number" {...register('contacto_celular')} />
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-8 flex justify-between pt-6 border-t border-white/5">
                    <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => setStep(s => Math.max(1, s - 1))}
                        disabled={step === 1}
                    >
                        Atrás
                    </Button>
                    
                    {step < 4 ? (
                        <Button 
                            type="button" 
                            onClick={() => setStep(s => Math.min(4, s + 1))}
                            className="w-32"
                        >
                            Siguiente <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    ) : (
                        <Button type="submit" loading={loading} className="w-40 bg-green-600 hover:bg-green-700">
                            <Save className="w-4 h-4 mr-2" />
                            Guardar
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
}
